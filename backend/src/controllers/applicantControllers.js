import { application } from "express";
import prisma from "../config/prismaConfig.js";
import sendMail from "../services/sendMail.js";

const createApplication = async (req, res) => {
  const {
    id: applicantId,
    email,
    designation: applicantDesignation,
    department,
    institute,
    role,
  } = req.user;

  const formData = req.body;

  try {
    if (role !== "applicant") {
      return res
        .status(403)
        .send({ message: "Forbidden, Sign In as Applicant" });
    }

    const applicant = await prisma.user.findUnique({
      where: { profileId: applicantId },
    });

    if (!applicant) {
      return res.status(404).send({ message: "User not Found" });
    }

    // check for the formName
    // if form name is "Travel Intimation Form", then do nothing
    // if form name is "Post Travel Form" then get the "intimationApplicationID" from the form and check if an application with that id exists if not then return an error
    // then check if that form dosent have any validation pending or rejected
    // if it has then return an error
    // if not then create the application

    const formName = formData.formName;
    if (!formName){
      return res.status(400).send({ message: "Form Name is required" });
    }

    if (formName === "Post Travel Form") {
      const intimationApplicationID = formData.intimationApplicationID;
      if (intimationApplicationID === null) {
        return res.status(400).send({ message: "Intimation Application ID is required" });
      }

      const intimationApplication = await prisma.application.findUnique({
        where: { 
          applicationId: intimationApplicationID,
          applicantId: applicantId,
         },
      });

      if (!intimationApplication) {
        return res.status(404).send({ message: "Intimation Application not found" });
      }

      if ( intimationApplication["formName"] !== "Travel Intimation Form") {
        return res.status(400).send({ message: "Intimation Application ID is not of a Travel Intimation Form" });
      }

      const validationFields = [
        "facultyValidation",
        "hodValidation",
        "hoiValidation",
        "vcValidation",
        "accountsValidation",
      ];

      const hasRejectedValidations = validationFields.some(
        (field) => intimationApplication[field] === "REJECTED"
      );

      if (hasRejectedValidations) {
        return res
          .status(400)
          .send({ message: "Intimation Application has rejected validations" });
      }

      const hasPendingValidations = validationFields.some(
        (field) => intimationApplication[field] === "PENDING"
      );

      if (hasPendingValidations) {
        return res
          .status(400)
          .send({ message: "Intimation Application has pending validations" });
      }

    }

    const applicantName = applicant.userName;

    let primarySupervisor,
      anotherSupervisor,
      hod,
      hoi,
      vc = null;

    switch (applicant.designation) {
      case "STUDENT":
        primarySupervisor = await prisma.user.findUnique({
          where: {
            email: formData.primarySupervisorEmail,
            department,
            designation: "FACULTY",
            institute,
          },
        });
        if (!primarySupervisor) {
          return res.status(404).send({ message: "Faculty not found (Incorrect Primary Supervisor Email)" });
        }
        anotherSupervisor = await prisma.user.findUnique({
          where: {
            email: formData.anotherSupervisorEmail,
            department: formData.anotherSupervisorDepartment,
            designation: "FACULTY",
            institute,
          },
        });
        if (!anotherSupervisor && formData.anotherSupervisorEmail) {
          return res.status(404).send({ message: "Another Supervisor not found" });
        }
        break;

      case "FACULTY":
        hod = await prisma.user.findFirst({
          where: { department, designation: "HOD", institute },
        });
        if (!hod) {
          return res.status(404).send({ message: "HOD not found" });
        }
        break;

      case "HOD":
        hoi = await prisma.user.findFirst({
          where: { designation: "HOI", institute },
        });
        if (!hoi) {
          return res.status(404).send({ message: "HOI not found" });
        }
        break;

      case "HOI":
        vc = await prisma.user.findFirst({
          where: { designation: "VC" },
        });
        if (!vc) {
          return res.status(404).send({ message: "VC not found" });
        }
        break;

      default:
        break;
    }

    // Compile the validators list with available supervisors, FDC coordinator, HOD, and HOI
    const validators = [
      primarySupervisor && { profileId: primarySupervisor?.profileId },
      anotherSupervisor && { profileId: anotherSupervisor?.profileId },
      hod && { profileId: hod?.profileId },
      hoi && { profileId: hoi?.profileId },
      vc && { profileId: vc?.profileId },
    ].filter(Boolean);

    const {
      proofOfTravel,
      proofOfAccommodation,
      proofOfAttendance,
      ...otherFiles
    } = req.files;

    // Prepare file buffers for fixed fields
    const proofOfTravelBuffer = proofOfTravel?.[0]?.buffer || null;
    const proofOfAccommodationBuffer =
      proofOfAccommodation?.[0]?.buffer || null;
    const proofOfAttendanceBuffer = proofOfAttendance?.[0]?.buffer || null;

    // Prepare an object to hold the expense proof buffers dynamically
    const expenseProofs = {};

    for (let i = 0; i < 10; i++) {
      const expenseProofField = `expenses[${i}].expenseProof`;
      if (otherFiles[expenseProofField]) {
        expenseProofs[`expenseProof${i}`] =
          otherFiles[expenseProofField][0].buffer;
      }
    }

    const expenses = JSON.parse(formData.expenses);

    const totalExpense = parseFloat(
      expenses.reduce(
        (total, { expenseAmount }) => total + +expenseAmount,
        0
      ).toFixed(2)
    );

    formData["totalExpense"] = totalExpense;

    // Construct the application data object
    const applicationData = {
      applicantName,
      department,
      institute,
      totalExpense,
      formData,
      proofOfTravel: proofOfTravelBuffer,
      proofOfAccommodation: proofOfAccommodationBuffer,
      proofOfAttendance: proofOfAttendanceBuffer,
      ...expenseProofs, // Add dynamically generated expense proof fields
      facultyValidation: ["STUDENT"].includes(applicant.designation)
        ? "PENDING"
        : undefined,
      hodValidation: ["FACULTY"].includes(applicant.designation)
        ? "PENDING"
        : undefined,
      hoiValidation: ["HOD"].includes(applicant.designation)
        ? "PENDING"
        : undefined,
      vcValidation: ["HOI"].includes(applicant.designation)
        ? "PENDING"
        : undefined,
    };

    // Create new application entry with linked applicant and validators
    const newApplication = await prisma.application.create({
      data: {
        ...applicationData,
        applicationType: applicant.designation === "STUDENT" ? "STUDENT" : "FACULTY",
        applicant: {
          connect: { profileId: applicantId },
        },
        validators: {
          connect: validators,
        },
        formName: formData.formName,
      },
    });

    // sendMail({
    //   emailId: hod.email,
    //   link: `http://localhost:5173/validator/dashboard/pending/${newApplication.applicationId}`,
    //   type: "validator",
    //   status: null,
    //   designation: null,
    // });

    res.status(201).send({
      message: "Application created successfully",
      data: newApplication.applicantName,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).send({
      message: "Error creating application",
      error: error.message,
    });
  }
};

const updateApplication = async (req, res) => {
  const {
    id: applicantId,
    email,
    designation: applicantDesignation,
    department,
    institute,
    role,
  } = req.user;

  const formData = req.body;
  const applicationId = formData.applicationId;
  delete formData.applicationId;

  try {
    if (role !== "applicant") {
      return res
        .status(403)
        .send({ message: "Forbidden, Sign In as Applicant" });
    }

    const applicant = await prisma.user.findUnique({
      where: { profileId: applicantId },
    });

    if (!applicant) {
      return res.status(404).send({ message: "User not Found" });
    }

    const {
      proofOfTravel,
      proofOfAccommodation,
      proofOfAttendance,
      ...otherFiles
    } = req.files;

    // Prepare file buffers for fixed fields
    const proofOfTravelBuffer = proofOfTravel?.[0]?.buffer || null;
    const proofOfAccommodationBuffer =
      proofOfAccommodation?.[0]?.buffer || null;
    const proofOfAttendanceBuffer = proofOfAttendance?.[0]?.buffer || null;

    // Prepare an object to hold the expense proof buffers dynamically
    const expenseProofs = {};

    for (let i = 0; i < 10; i++) {
      const expenseProofField = `expenses[${i}].expenseProof`;
      if (otherFiles[expenseProofField]) {
        expenseProofs[`expenseProof${i}`] =
          otherFiles[expenseProofField][0].buffer;
      }
    }

    const expenses = JSON.parse(formData.expenses);

    const totalExpense = parseFloat(
      expenses.reduce(
        (total, { expenseAmount }) => total + +expenseAmount,
        0
      ).toFixed(2)
    );

    formData["totalExpense"] = totalExpense;

    const application = await prisma.application.findUnique({
      where: { applicationId },
    });

    const validationFields = [
      "facultyValidation",
      "hodValidation",
      "hoiValidation",
      "vcValidation",
      "accountsValidation",
    ];

    console.log(expenseProofs)

    const updatedData = {
      totalExpense,
      formData,
      proofOfTravel: proofOfTravelBuffer,
      proofOfAccommodation: proofOfAccommodationBuffer,
      proofOfAttendance: proofOfAttendanceBuffer,
      resubmission: false,
      ...expenseProofs,
    };

    for (const field of validationFields) {
      if (application[field] === "REJECTED") {
        updatedData[field] = "PENDING";
      }
    }

    const updatedApplication = await prisma.application.update({
      where: { applicationId },
      data: updatedData,
    });

    res.status(200).send({
      message: "Application updated successfully",
      data: updatedApplication.applicantName,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error updating application",
      error: error.message,
    });
  }
}

export { createApplication, updateApplication };
