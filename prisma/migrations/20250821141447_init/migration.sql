-- CreateTable
CREATE TABLE "public"."user_progress" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "articleSlug" TEXT NOT NULL,
    "tryitUnlockedCount" INTEGER NOT NULL DEFAULT 0,
    "bossCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."code_submissions" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "articleSlug" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isSuccessful" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."boss_test_results" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "testCaseIndex" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "expectedOutput" TEXT,
    "actualOutput" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boss_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_clerkUserId_courseId_articleSlug_key" ON "public"."user_progress"("clerkUserId", "courseId", "articleSlug");

-- CreateIndex
CREATE INDEX "code_submissions_clerkUserId_idx" ON "public"."code_submissions"("clerkUserId");

-- CreateIndex
CREATE INDEX "code_submissions_courseId_articleSlug_idx" ON "public"."code_submissions"("courseId", "articleSlug");

-- CreateIndex
CREATE INDEX "boss_test_results_submissionId_idx" ON "public"."boss_test_results"("submissionId");

-- AddForeignKey
ALTER TABLE "public"."boss_test_results" ADD CONSTRAINT "boss_test_results_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."code_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
