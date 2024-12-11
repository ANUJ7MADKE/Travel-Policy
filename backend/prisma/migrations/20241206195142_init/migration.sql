-- CreateEnum
CREATE TYPE "Department" AS ENUM ('NULL', 'COMPS', 'IT', 'MECH', 'AIDS', 'EXTC', 'ETRX', 'RAI');

-- CreateEnum
CREATE TYPE "ApplicantDesignation" AS ENUM ('Student', 'Faculty');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('REJECTED', 'ACCEPTED', 'PENDING');

-- CreateEnum
CREATE TYPE "ValidatorDesignation" AS ENUM ('FDCcoordinator', 'Supervisor', 'HOD', 'HOI');

-- CreateTable
CREATE TABLE "Applicant" (
    "profileId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "designation" "ApplicantDesignation" NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "Application" (
    "applicationId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "fdccoordinatorValidation" "ApplicationStatus",
    "supervisorValidation" "ApplicationStatus",
    "hodValidation" "ApplicationStatus",
    "hoiValidation" "ApplicationStatus",
    "proofOfTravel" BYTEA,
    "proofOfAccommodation" BYTEA,
    "proofOfAttendance" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "Validator" (
    "profileId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "designation" "ValidatorDesignation" NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "_ApplicationToValidator" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");

-- CreateIndex
CREATE INDEX "Application_applicantId_idx" ON "Application"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_email_key" ON "Validator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_ApplicationToValidator_AB_unique" ON "_ApplicationToValidator"("A", "B");

-- CreateIndex
CREATE INDEX "_ApplicationToValidator_B_index" ON "_ApplicationToValidator"("B");
