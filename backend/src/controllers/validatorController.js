import prisma from "../config/prismaConfig.js";
import sendMail from "../services/sendMail.js";

const applicationAction = async (req, res) => {
  let profileId = req.user.id;

  try {
    const { applicationId, action, rejectionFeedback } = req.body; // actions = 'accepted' or 'rejected'


    const validator = await prisma.validator.findFirst({
      where: { profileId },
      include: { applications: true, },
    });


    if (!validator) {
      return res.status(404).send("Validator doesn't exist");
    }

    const application = validator.applications.find(
      (app) => app.applicationId === applicationId
    );

    if (!application) {
      return res.status(404).send("Application not available");
    }

    const applicant = await prisma.applicant.findFirst({
      where: { profileId: application.applicantId },
      select: { designation: true }
    })

    const applicantDesignation = applicant.designation

    const validationStatus = action.toUpperCase();

    if (validationStatus !== "ACCEPTED" && validationStatus !== "REJECTED") {
      return res.status(400).send("Invalid status");
    }

    const validationData = {};

    switch (validator.designation) {
      case "Supervisor":
        if (application.supervisorValidation != "PENDING") {
          return res
            .status(400)
            .send("Already performed an action, can't change status again");
        }
        validationData.supervisorValidation = validationStatus;

        if (validationStatus === "ACCEPTED" && applicantDesignation === "Student") {
          validationData.hodValidation = "PENDING";
          const hod = await prisma.validator.findFirst({
            where: { department: application.formData.applicantDepartment, designation: "HOD" }
          })
          sendMail(hod.email, `http://localhost:5173/validator/dashboard/pending/${applicationId}`, false, validationStatus);
        }

        if (validationStatus === "ACCEPTED" && applicantDesignation === "Faculty") {
          validationData.fdccoordinatorValidation = "PENDING";
          const fdccoordinator = await prisma.validator.findFirst({
            where: { department: validator.department, designation: "FDCcoordinator" }
          })
          sendMail(fdccoordinator.email, `http://localhost:5173/validator/dashboard/pending/${applicationId}`, false, validationStatus);
        }
        break;
      case "FDCcoordinator":
        if (application.fdccoordinatorValidation != "PENDING") {
          return res
            .status(400)
            .send("Already performed an action, can't change status again");
        }
        validationData.fdccoordinatorValidation = validationStatus;
        if (validationStatus === "ACCEPTED") {
          validationData.hodValidation = "PENDING"
          const hod = await prisma.validator.findFirst({
            where: { department: application.formData.applicantDepartment, designation: "HOD" }
          })
          sendMail(hod.email, `http://localhost:5173/validator/dashboard/pending/${applicationId}`, false, validationStatus);
        }
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
          const hoi = await prisma.validator.findFirst({
            where: { designation: "HOI" }
          })
          sendMail(hoi.email, `http://localhost:5173/validator/dashboard/pending/${applicationId}`, false, validationStatus);
        }
        break;
      case "HOI":
        if (application.hoiValidation != "PENDING") {
          return res
            .status(400)
            .send("Already performed an action, can't change status again");
        }
        validationData.hoiValidation = validationStatus;
        sendMail(application.formData.applicantEmail, `http://localhost:5173/applicant/dashboard/${validationStatus}/${applicationId}`, false, validationStatus);

        if (validationStatus === "ACCEPTED") {

          //forward to accounts department for transaction processing

        }

        break;
      default:
        return res.status(400).send("Invalid validator designation");
    }

    if (rejectionFeedback) {
      validationData.rejectionFeedback = rejectionFeedback;
    }

    const response = await prisma.application.update({
      where: {
        applicationId: applicationId,
      },
      data: validationData,
    });

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getApplicantNames = async (req, res) => {
  const profileId = req.user.id;

  try {
    const applicants = await prisma.application.findMany({
      where: { validators: { some: { profileId } } },
      select: {
        applicantName: true,
      },
      distinct: ['applicantName'],
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



export { applicationAction, getApplicantNames };
