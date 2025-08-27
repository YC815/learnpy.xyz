import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET: 獲取用戶學習進度
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const articleSlug = searchParams.get('articleSlug');

    let whereClause: any = { clerkUserId: userId };
    
    if (courseId) {
      whereClause.courseId = parseInt(courseId);
    }
    
    if (articleSlug) {
      whereClause.articleSlug = articleSlug;
    }

    const progress = await prisma.userProgress.findMany({
      where: whereClause,
      orderBy: [
        { courseId: 'asc' },
        { articleSlug: 'asc' }
      ]
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: 更新用戶學習進度
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, articleSlug, action } = body;

    if (!courseId || !articleSlug || !action) {
      return NextResponse.json(
        { error: 'courseId, articleSlug, and action are required' },
        { status: 400 }
      );
    }

    // 找到或創建進度記錄
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        clerkUserId_courseId_articleSlug: {
          clerkUserId: userId,
          courseId: parseInt(courseId),
          articleSlug: articleSlug,
        },
      },
    });

    let updatedProgress;

    if (action === 'unlock_tryit') {
      // TryIt 解鎖：增加解鎖數量
      if (existingProgress) {
        updatedProgress = await prisma.userProgress.update({
          where: { id: existingProgress.id },
          data: {
            tryitUnlockedCount: existingProgress.tryitUnlockedCount + 1,
            updatedAt: new Date(),
          },
        });
      } else {
        updatedProgress = await prisma.userProgress.create({
          data: {
            clerkUserId: userId,
            courseId: parseInt(courseId),
            articleSlug: articleSlug,
            tryitUnlockedCount: 1,
          },
        });
      }
    } else if (action === 'complete_boss') {
      // Boss 完成：設置為完成狀態
      if (existingProgress) {
        updatedProgress = await prisma.userProgress.update({
          where: { id: existingProgress.id },
          data: {
            bossCompleted: true,
            updatedAt: new Date(),
          },
        });
      } else {
        updatedProgress = await prisma.userProgress.create({
          data: {
            clerkUserId: userId,
            courseId: parseInt(courseId),
            articleSlug: articleSlug,
            bossCompleted: true,
          },
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "unlock_tryit" or "complete_boss"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      progress: updatedProgress 
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}