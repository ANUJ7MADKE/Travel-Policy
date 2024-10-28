import { application } from "express";
import prisma from "../config/prismaConfig.js";

const dataRoot = async (req, res) => {
  try {
    const user = req.user; // Contains all user info (id, designation, department, etc.)
    const userId = user.id;

    // Determine if the user is an Applicant or Validator based on designation
    if (['Student', 'Faculty'].includes(user.designation)) {
      // Applicant Logic
      const applicant = await prisma.applicant.findUnique({
        where: { profileId: userId },
        select: {
          profileId: true,
          userName: true,
          email: true,
          department: true,        
          designation: true,
        }
      });

      // Check if the applicant exists
      if (!applicant) {
        return res.status(404).send("Applicant doesn't exist");
      }

      delete applicant._count;

      // Return the response for applicant
      return res.status(200).json({
        message: "Applicant Authorized",
        user: applicant,
        role: "Applicant"
      });

    } else if (['Supervisor', 'HOD', 'HOI'].includes(user.designation)) {
      // Validator Logic
      const validator = await prisma.validator.findUnique({
        where: { profileId: userId },
        select: {
          profileId: true,
          userName: true,
          email: true,
          department: true,
          designation: true,
        },
      });

      // Check if the validator exists
      if (!validator) {
        return res.status(404).send("Validator doesn't exist");
      }

      delete validator._count;

      // Return the response for validator
      return res.status(200).json({
        message: "Validator Authorized",
        user: validator,
        role: "Validator"
      });
    } else {
      return res.status(403).send("Unauthorized");
    }

  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getPendingApplications = async (req, res) => {
  try {
    const user = req.user; 
    const userId = user.id;
    const take = parseInt(req.query.take) || 5;
    const skip = parseInt(req.query.skip) || 0;

    let pendingApplications, totalApplications;

    if (['Student', 'Faculty'].includes(user.designation)) {
      totalApplications = await prisma.application.count({
        where: {
          applicantId: userId,
          OR: [
            { supervisorValidation: "PENDING" },
            { hodValidation: "PENDING" },
            { hoiValidation: "PENDING" },
          ],
        },
      });

      pendingApplications = await prisma.application.findMany({
        where: {
          applicantId: userId,
          OR: [
            { supervisorValidation: "PENDING" },
            { hodValidation: "PENDING" },
            { hoiValidation: "PENDING" },
          ],
        },
        select: {
          applicationId: true,
          applicantName: true,
          formData: true,
          createdAt: true,
        },
        take: take,
        skip: skip,
        orderBy: {
          createdAt: "desc",
        },
      });

    } else if (['Supervisor', 'HOD', 'HOI'].includes(user.designation)) {
      const validationField = `${user.designation.toLowerCase()}Validation`;

      totalApplications = await prisma.application.count({
        where: {
          validators: { some: { profileId: userId } },
          [validationField]: "PENDING",
        },
      });

      pendingApplications = await prisma.application.findMany({
        where: {
          validators: { some: { profileId: userId } },
          [validationField]: "PENDING",
        },
        select: {
          applicationId: true,
          applicantName: true,
          formData: true,
          createdAt: true,
        },
        take: take,
        skip: skip,
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      return res.status(403).send("Unauthorized");
    }

    const responseApplications = pendingApplications.map(application => ({
      applicationId: application.applicationId,
      applicantName: application.applicantName,
      formData: {
        eventName: application.formData.eventName,
        applicantDepartment: application.formData.applicantDepartment,
      },
      createdAt: application.createdAt,
    }));

    return res.status(200).json({
      message: "Pending Applications Fetched Successfully",
      totalApplications,
      applications: responseApplications,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getAcceptedApplications = async (req, res) => {
  try {
    const user = req.user; 
    const userId = user.id;
    const take = parseInt(req.query.take) || 5;
    const skip = parseInt(req.query.skip) || 0;

    let acceptedApplications, totalApplications;

    if (['Student', 'Faculty'].includes(user.designation)) {
      totalApplications = await prisma.application.count({
        where: {
          applicantId: userId,
          AND: [
            { supervisorValidation: "ACCEPTED" },
            { hodValidation: "ACCEPTED" },
            { hoiValidation: "ACCEPTED" },
          ],
        },
      });

      acceptedApplications = await prisma.application.findMany({
        where: {
          applicantId: userId,
          AND: [
            { supervisorValidation: "ACCEPTED" },
            { hodValidation: "ACCEPTED" },
            { hoiValidation: "ACCEPTED" },
          ],
        },
        select: {
          applicationId: true,
          applicantName: true,
          formData: true,
          createdAt: true,
        },
        take: take,
        skip: skip,
        orderBy: {
          createdAt: "desc",
        },
      });

    } else if (['Supervisor', 'HOD', 'HOI'].includes(user.designation)) {
      const validationField = `${user.designation.toLowerCase()}Validation`;

      totalApplications = await prisma.application.count({
        where: {
          validators: { some: { profileId: userId } },
          [validationField]: "ACCEPTED",
        },
      });

      acceptedApplications = await prisma.application.findMany({
        where: {
          validators: { some: { profileId: userId } },
          [validationField]: "ACCEPTED",
        },
        select: {
          applicationId: true,
          applicantName: true,
          formData: true,
          createdAt: true,
        },
        take: take,
        skip: skip,
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      return res.status(403).send("Unauthorized");
    }

    const responseApplications = acceptedApplications.map(application => ({
      applicationId: application.applicationId,
      applicantName: application.applicantName,
      formData: {
        eventName: application.formData.eventName,
        applicantDepartment: application.formData.applicantDepartment,
      },
      createdAt: application.createdAt,
    }));

    return res.status(200).json({
      message: "Accepted Applications Fetched Successfully",
      totalApplications,
      applications: responseApplications,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getRejectedApplications = async (req, res) => {
  try {
    const user = req.user; 
    const userId = user.id;
    const take = parseInt(req.query.take) || 5;
    const skip = parseInt(req.query.skip) || 0;

    let rejectedApplications, totalApplications;

    if (['Student', 'Faculty'].includes(user.designation)) {
      totalApplications = await prisma.application.count({
        where: {
          applicantId: userId,
          OR: [
            { supervisorValidation: "REJECTED" },
            { hodValidation: "REJECTED" },
            { hoiValidation: "REJECTED" },
          ],
        },
      });

      rejectedApplications = await prisma.application.findMany({
        where: {
          applicantId: userId,
          OR: [
            { supervisorValidation: "REJECTED" },
            { hodValidation: "REJECTED" },
            { hoiValidation: "REJECTED" },
          ],
        },
        select: {
          applicationId: true,
          applicantName: true,
          formData: true,
          createdAt: true,
        },
        take: take,
        skip: skip,
        orderBy: {
          createdAt: "desc",
        },
      });

    } else if (['Supervisor', 'HOD', 'HOI'].includes(user.designation)) {
      const validationField = `${user.designation.toLowerCase()}Validation`;

      totalApplications = await prisma.application.count({
        where: {
          validators: { some: { profileId: userId } },
          [validationField]: "REJECTED",
        },
      });

      rejectedApplications = await prisma.application.findMany({
        where: {
          validators: { some: { profileId: userId } },
          [validationField]: "REJECTED",
        },
        select: {
          applicationId: true,
          applicantName: true,
          formData: true,
          createdAt: true,
        },
        take: take,
        skip: skip,
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      return res.status(403).send("Unauthorized");
    }

    const responseApplications = rejectedApplications.map(application => ({
      applicationId: application.applicationId,
      applicantName: application.applicantName,
      formData: {
        eventName: application.formData.eventName,
        applicantDepartment: application.formData.applicantDepartment,
      },
      createdAt: application.createdAt,
    }));

    return res.status(200).json({
      message: "Rejected Applications Fetched Successfully",
      totalApplications,
      applications: responseApplications,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getApplicationData = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;

    // Fetch application data excluding proof fields
    const applicationFull = await prisma.application.findUnique({
      where: {
        applicationId: applicationId,
      },
      select: {
        applicationId: true,
        applicantId: true,
        applicantName: true,
        formData: true,
        supervisorValidation: true,
        hodValidation: true,
        hoiValidation: true,
        createdAt: true,
      },
    });

    if (!applicationFull) {
      return res.status(404).json({ error: "Application not found" });
    }

    return res.status(200).json(applicationFull);
  } catch (error) {
    console.error("Error retrieving application data:", error);
    return res
      .status(500)
      .json({
        error: "An error occurred while retrieving the application data",
      });
  }
};

const getFile = async (req, res) => {
  try {
    const { applicationId, fileName } = req.params;

    let proofOfTravel = false;
    let proofOfAccommodation = false;
    let proofOfAttendance = false;

    switch (fileName) {
      case "proofOfTravel":
        proofOfTravel = true;
        break;
      case "proofOfAccommodation":
        proofOfAccommodation = true;
        break;
      case "proofOfAttendance":
        proofOfAttendance = true;
        break;
      default:
        return res.status(400).json({ error: "Invalid File request" });
    }

    const myFile = await prisma.application.findUnique({
      where: { applicationId },
      select: {
        proofOfTravel,
        proofOfAccommodation,
        proofOfAttendance,
      },
    });

    if (!myFile) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileBuffer = myFile[fileName];

    res.setHeader('Content-Type', 'application/pdf'); 
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);

    return res.send(fileBuffer);

  } catch (error) {
    console.error("Error retrieving application data:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving the application data",
    });
  }
};


export { getApplicationData, getFile, dataRoot, getPendingApplications, getAcceptedApplications, getRejectedApplications };
