import { validatorDesignations } from "../config/designations.js";
import prisma from "../config/prismaConfig.js";
import sendMail from "../services/sendMail.js";

const applicationAction = async (req, res) => {
  const { id: profileId, designation, department, institute, role } = req.user;

  try {
    const { applicationId, action, rejectionFeedback, toVC } = req.body; // actions = 'accepted' or 'rejected'

    if (role !== "validator") {
      return res.status(403).send("Forbidden, Sign in as a validator");
    }

    const validator = await prisma.user.findFirst({
      where: { profileId },
      include: {
        toValidateApplications: {
          where: { applicationId },
          include: {
            validators: {
              select: { profileId: true, designation: true },
            },
          }
        },
      },
    });

    if (!validator) {
      return res.status(404).send("Validator doesn't exist");
    }

    const application = validator.toValidateApplications[0];

    if (!application) {
      return res.status(404).send("Application not available");
    }

    const applicant = await prisma.user.findFirst({
      where: { profileId: application.applicantId },
    });

    const applicantDesignation = applicant.designation;
    const applicantDepartment = applicant.department;
    const applicantInstitute = applicant.institute;
    const applicantEmail = applicant.email;

    const validationStatus = action.toUpperCase();

    if (validationStatus !== "ACCEPTED" && validationStatus !== "REJECTED") {
      return res.status(400).send("Invalid status");
    }

    const validationData = {};
    let hod,
      hoi,
      vc,
      accounts = null;

    switch (validator.designation) {
      case "FACULTY":
        if (application.facultyValidation != "PENDING") {
          return res
            .status(400)
            .send("Already performed an action, can't change status again");
        }
        validationData.facultyValidation = validationStatus;
        if (validationStatus === "ACCEPTED") {
          validationData.hodValidation = "PENDING";
          hod = await prisma.user.findFirst({
            where: { designation: "HOD", department: applicantDepartment, institute: applicantInstitute },
          });
          sendMail({
            emailId: hod.email,
            link: `http://localhost:5173/validator/dashboard/pending/${applicationId}`,
            type: "validator",
            status: null,
            designation: null,
          });
        }
        sendMail({
          emailId: applicantEmail,
          link: `http://localhost:5173/applicant/dashboard/${validationStatus}/${applicationId}`,
          type: "applicant",
          status: validationStatus,
          designation: "FACULTY",
        });
        break;
      case "HOD":
        if (application.hodValidation != "PENDING") {
          return res
            .status(400)
            .send("Already performed an action, can't change status again");
        }
        validationData.hodValidation = validationStatus;
        if (validationStatus === "ACCEPTED") {
          validationData.hoiValidation = "PENDING";
          hoi = await prisma.user.findFirst({
            where: { designation: "HOI", institute: applicantInstitute },
          });

          sendMail({
            emailId: hoi.email,
            link: `http://localhost:5173/validator/dashboard/pending/${applicationId}`,
            type: "validator",
            status: null,
            designation: null,
          });
        }
        sendMail({
          emailId: applicantEmail,
          link: `http://localhost:5173/applicant/dashboard/${validationStatus}/${applicationId}`,
          type: "applicant",
          status: validationStatus,
          designation: "HOD",
        });
        break;
      case "HOI":
        if (application.hoiValidation != "PENDING") {
          return res
            .status(400)
            .send("Already performed an action, can't change status again");
        }
        validationData.hoiValidation = validationStatus;

        if (validationStatus === "ACCEPTED") {
          if (JSON.parse(toVC)) {
            if (applicantDesignation !== "STUDENT") {
              return {
                status: 400,
                message: "Students Applications cannot be forwared for VC validation",
              }
            };
            validationData.vcValidation = "PENDING";
            vc = await prisma.user.findFirst({
              where: { designation: "VC" },
            });
            sendMail({
              emailId: vc.email,
              link: `http://localhost:5173/validator/dashboard/pending/${applicationId}`,
              type: "validator",
              status: null,
              designation: null,
            });
          } else {
            validationData.accountsValidation = "PENDING";
            accounts = await prisma.user.findFirst({
              where: { designation: "ACCOUNTS", institute: applicantInstitute },
            });
            sendMail({
              emailId: accounts.email,
              link: `http://localhost:5173/validator/dashboard/pending/${applicationId}`,
              type: "accounts",
              status: null,
              designation: null,
            });
          }
        }
        sendMail({
          emailId: applicantEmail,
          link: `http://localhost:5173/applicant/dashboard/${validationStatus}/${applicationId}`,
          type: "applicant",
          status: validationStatus,
          designation: "HOI",
        });
        break;
      case "VC":
        if (application.vcValidation != "PENDING") {
          return res
            .status(400)
            .send("Already performed an action, can't change status again");
        }
        validationData.vcValidation = validationStatus;
        if (validationStatus === "ACCEPTED") {
          validationData.accountsValidation = "PENDING";
          accounts = await prisma.user.findFirst({
            where: { designation: "ACCOUNTS", institute: applicantInstitute },
          });
          sendMail({
            emailId: accounts.email,
            link: `http://localhost:5173/validator/dashboard/pending/${applicationId}`,
            type: "accounts",
            status: null,
            designation: null,
          });
        }
        sendMail({
          emailId: applicantEmail,
          link: `http://localhost:5173/applicant/dashboard/${validationStatus}/${applicationId}`,
          type: "applicant",
          status: validationStatus,
          designation: "VC",
        });
        break;
      case "ACCOUNTS":
        if (application.accountsValidation != "PENDING") {
          return res
            .status(400)
            .send("Already performed an action, can't change status again");
        }
        validationData.accountsValidation = validationStatus;
        sendMail({
          emailId: applicantEmail,
          link: `http://localhost:5173/applicant/dashboard/${validationStatus}/${applicationId}`,
          type: "applicant",
          status: validationStatus,
          designation: "ACCOUNTS",
        });
        break;
      default:
        return res.status(400).send("Invalid validator designation");
    }

    console.log(hod)

    const validators = [
      hod && { profileId: hod?.profileId },
      hoi && { profileId: hoi?.profileId },
      vc && { profileId: vc?.profileId },
      accounts && { profileId: accounts?.profileId },
    ].filter(Boolean);

    if (rejectionFeedback) {
      validationData.rejectionFeedback = rejectionFeedback;
    }

    const response = await prisma.application.update({
      where: {
        applicationId: applicationId,
      },
      data: {
        ...validationData,
        validators: {
          connect: validators,
        },
      },
      select: { applicationId: true },
    });

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getApplicantNames = async (req, res) => {
  const { id: profileId, designation, department, institute, role } = req.user;

  try {
    if (role !== "validator") {
      return res.status(403).send("Forbidden");
    }

    const applicants = await prisma.application.findMany({
      where: { validators: { some: { profileId } } },
      select: {
        applicantName: true,
      },
      distinct: ["applicantName"],
    });

    const ApplicantNames = applicants.map((application) => ({
      key: application.applicantName.toLowerCase(),
      value: application.applicantName,
    }));

    res.status(200).send(ApplicantNames);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getReportData = async (req, res) => {
  const { institute, department, year, applicationType } = req.query;
  const {
    id: profileId,
    designation,
    department: ogDepartment,
    institute: ogInstitute,
    role,
  } = req.user;

  try {
    if (
      (ogDepartment && department !== ogDepartment) ||
      (ogInstitute && institute !== ogInstitute)
    ) {
      return res.status(403).send("Forbidden");
    }

    const whereClause = {
      institute,
      department,
    };

    if (year) {
      whereClause.createdAt = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year}-12-31`),
      };
    }

    if (applicationType) {
      whereClause.applicationType = applicationType;
    }

    console.log(whereClause);

    const applications = await prisma.application.findMany({
      where: whereClause,
      select: {
        _count: true,
        formData: true,
        institute: true,
        department: true,
      },
    });

    res.status(200).send(applications);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export { applicationAction, getApplicantNames, getReportData };
