-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'MATCHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARENT', 'TUTOR', 'ADMIN');

-- CreateTable
CREATE TABLE "AuthSessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDocuments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "CaseDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budgetPerHour" DOUBLE PRECISION NOT NULL,
    "status" "CaseStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAccesses" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "CaseAccesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorDocuments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutorProfileId" TEXT NOT NULL,

    CONSTRAINT "TutorDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "experiences" TEXT[],
    "qualifications" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthSessions_id_key" ON "AuthSessions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSessions_token_key" ON "AuthSessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSessions_userId_key" ON "AuthSessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseDocuments_id_key" ON "CaseDocuments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cases_id_key" ON "Cases"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CaseAccesses_id_key" ON "CaseAccesses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TutorDocuments_id_key" ON "TutorDocuments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfiles_id_key" ON "TutorProfiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfiles_userId_key" ON "TutorProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_key" ON "Users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- AddForeignKey
ALTER TABLE "AuthSessions" ADD CONSTRAINT "AuthSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocuments" ADD CONSTRAINT "CaseDocuments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cases" ADD CONSTRAINT "Cases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAccesses" ADD CONSTRAINT "CaseAccesses_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAccesses" ADD CONSTRAINT "CaseAccesses_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAccesses" ADD CONSTRAINT "CaseAccesses_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorDocuments" ADD CONSTRAINT "TutorDocuments_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorProfiles" ADD CONSTRAINT "TutorProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
