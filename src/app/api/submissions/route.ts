import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET: 獲取用戶程式碼提交記錄
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const articleSlug = searchParams.get('articleSlug');
    const componentType = searchParams.get('componentType'); // "tryit" or "boss"
    const componentId = searchParams.get('componentId');

    let whereClause: any = { clerkUserId: userId };
    
    if (courseId) {
      whereClause.courseId = parseInt(courseId);
    }
    
    if (articleSlug) {
      whereClause.articleSlug = articleSlug;
    }

    if (componentType) {
      whereClause.componentType = componentType;
    }

    if (componentId) {
      whereClause.componentId = componentId;
    }

    const submissions = await prisma.codeSubmission.findMany({
      where: whereClause,
      include: {
        bossTestResults: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: 創建新的程式碼提交記錄
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      courseId, 
      articleSlug, 
      componentType, 
      componentId, 
      code, 
      isSuccessful = false,
      bossTestResults = [] // Boss 測試結果 (可選)
    } = body;

    if (!courseId || !articleSlug || !componentType || !componentId || !code) {
      return NextResponse.json(
        { error: 'courseId, articleSlug, componentType, componentId, and code are required' },
        { status: 400 }
      );
    }

    // 創建程式碼提交記錄
    const submission = await prisma.codeSubmission.create({
      data: {
        clerkUserId: userId,
        courseId: parseInt(courseId),
        articleSlug: articleSlug,
        componentType: componentType,
        componentId: componentId,
        code: code,
        isSuccessful: isSuccessful,
      },
    });

    // 如果有 Boss 測試結果，也一起創建
    if (componentType === 'boss' && bossTestResults.length > 0) {
      const testResultsData = bossTestResults.map((result: any, index: number) => ({
        submissionId: submission.id,
        testCaseIndex: index,
        passed: result.passed,
        expectedOutput: result.expectedOutput || null,
        actualOutput: result.actualOutput || null,
        errorMessage: result.errorMessage || null,
      }));

      await prisma.bossTestResult.createMany({
        data: testResultsData,
      });
    }

    // 如果是成功的提交，同時更新學習進度
    if (isSuccessful) {
      try {
        if (componentType === 'tryit') {
          // TryIt 成功執行 -> 解鎖進度
          const existingProgress = await prisma.userProgress.findUnique({
            where: {
              clerkUserId_courseId_articleSlug: {
                clerkUserId: userId,
                courseId: parseInt(courseId),
                articleSlug: articleSlug,
              },
            },
          });

          if (existingProgress) {
            await prisma.userProgress.update({
              where: { id: existingProgress.id },
              data: {
                tryitUnlockedCount: existingProgress.tryitUnlockedCount + 1,
                updatedAt: new Date(),
              },
            });
          } else {
            await prisma.userProgress.create({
              data: {
                clerkUserId: userId,
                courseId: parseInt(courseId),
                articleSlug: articleSlug,
                tryitUnlockedCount: 1,
              },
            });
          }
        } else if (componentType === 'boss') {
          // Boss 全部通過 -> 完成進度
          const allPassed = bossTestResults.every((result: any) => result.passed);
          if (allPassed) {
            const existingProgress = await prisma.userProgress.findUnique({
              where: {
                clerkUserId_courseId_articleSlug: {
                  clerkUserId: userId,
                  courseId: parseInt(courseId),
                  articleSlug: articleSlug,
                },
              },
            });

            if (existingProgress) {
              await prisma.userProgress.update({
                where: { id: existingProgress.id },
                data: {
                  bossCompleted: true,
                  updatedAt: new Date(),
                },
              });
            } else {
              await prisma.userProgress.create({
                data: {
                  clerkUserId: userId,
                  courseId: parseInt(courseId),
                  articleSlug: articleSlug,
                  bossCompleted: true,
                },
              });
            }
          }
        }
      } catch (progressError) {
        console.error('Error updating progress:', progressError);
        // 不影響主要的程式碼提交流程
      }
    }

    // 重新獲取完整的提交記錄（包含測試結果）
    const fullSubmission = await prisma.codeSubmission.findUnique({
      where: { id: submission.id },
      include: {
        bossTestResults: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      submission: fullSubmission 
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}