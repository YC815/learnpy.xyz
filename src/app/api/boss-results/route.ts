import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET: 獲取 Boss 測試結果
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const courseId = searchParams.get('courseId');
    const articleSlug = searchParams.get('articleSlug');

    if (submissionId) {
      // 根據提交 ID 獲取測試結果
      const testResults = await prisma.bossTestResult.findMany({
        where: { submissionId: submissionId },
        include: {
          submission: true,
        },
        orderBy: { testCaseIndex: 'asc' },
      });

      // 檢查用戶權限
      if (testResults.length > 0 && testResults[0].submission.clerkUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({ testResults });
    } else if (courseId && articleSlug) {
      // 根據課程和文章獲取所有 Boss 測試結果
      const testResults = await prisma.bossTestResult.findMany({
        where: {
          submission: {
            clerkUserId: userId,
            courseId: parseInt(courseId),
            articleSlug: articleSlug,
            componentType: 'boss',
          },
        },
        include: {
          submission: true,
        },
        orderBy: [
          { submission: { submittedAt: 'desc' } },
          { testCaseIndex: 'asc' },
        ],
      });

      return NextResponse.json({ testResults });
    } else {
      return NextResponse.json(
        { error: 'Either submissionId or both courseId and articleSlug are required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching boss test results:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: 創建 Boss 測試結果 (通常通過 submissions API 處理，但也可以單獨使用)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, testResults } = body;

    if (!submissionId || !Array.isArray(testResults)) {
      return NextResponse.json(
        { error: 'submissionId and testResults (array) are required' },
        { status: 400 }
      );
    }

    // 驗證提交記錄是否屬於當前用戶
    const submission = await prisma.codeSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 刪除已存在的測試結果（如果有）
    await prisma.bossTestResult.deleteMany({
      where: { submissionId: submissionId },
    });

    // 創建新的測試結果
    const testResultsData = testResults.map((result: any, index: number) => ({
      submissionId: submissionId,
      testCaseIndex: index,
      passed: result.passed,
      expectedOutput: result.expectedOutput || null,
      actualOutput: result.actualOutput || null,
      errorMessage: result.errorMessage || null,
    }));

    await prisma.bossTestResult.createMany({
      data: testResultsData,
    });

    // 檢查是否所有測試都通過，如果是則更新提交為成功
    const allPassed = testResults.every((result: any) => result.passed);
    if (allPassed && !submission.isSuccessful) {
      await prisma.codeSubmission.update({
        where: { id: submissionId },
        data: { isSuccessful: true },
      });

      // 更新 Boss 完成進度
      try {
        const existingProgress = await prisma.userProgress.findUnique({
          where: {
            clerkUserId_courseId_articleSlug: {
              clerkUserId: userId,
              courseId: submission.courseId,
              articleSlug: submission.articleSlug,
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
              courseId: submission.courseId,
              articleSlug: submission.articleSlug,
              bossCompleted: true,
            },
          });
        }
      } catch (progressError) {
        console.error('Error updating boss progress:', progressError);
      }
    }

    // 重新獲取測試結果
    const createdResults = await prisma.bossTestResult.findMany({
      where: { submissionId: submissionId },
      orderBy: { testCaseIndex: 'asc' },
    });

    return NextResponse.json({ 
      success: true, 
      testResults: createdResults,
      allPassed: allPassed 
    });
  } catch (error) {
    console.error('Error creating boss test results:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}