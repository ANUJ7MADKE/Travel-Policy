import { application } from "express";
import prisma from "../config/prismaConfig.js";

const dataRoot = async (req, res) => {
  try {
    const user = req.user; // Contains all user info (id, designation, department, etc.)
    const userId = user.id;

    // Determine if the user is an Applicant or Validator based on designation
    if (["Student", "Faculty"].includes(user.designation)) {
      // Applicant Logic
      const applicant = await prisma.applicant.findUnique({
        where: { profileId: userId },
        select: {
          profileId: true,
          userName: true,
          email: true,
          department: true,
          designation: true,
        },
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
        role: "Applicant",
      });
    } else if (
      ["Supervisor", "HOD", "HOI", "FDCcoordinator"].includes(user.designation)
    ) {
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
        role: "Validator",
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

const getApplicationsByStatus = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    const take = parseInt(req.query.take) || 5;
    const skip = parseInt(req.query.skip) || 0;
    const status = req.params.status.toUpperCase(); // Expected: "PENDING", "ACCEPTED", or "REJECTED"
    const sortBy = req.query?.sortBy;
    const sortValue = req.query?.sortValue;

    const validStatuses = ["PENDING", "ACCEPTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).send("Invalid status");
    }

    let applications, totalApplications;

    // Filter conditions for Student and Faculty
    if (["Student", "Faculty"].includes(user.designation)) {
      const baseWhere = {
        applicantId: userId,
        ...(status === "PENDING" && {
          OR: [
            { fdccoordinatorValidation: "PENDING" },
            { supervisorValidation: "PENDING" },
            { hodValidation: "PENDING" },
            { hoiValidation: "PENDING" },
          ],
        }),
        ...(status === "ACCEPTED" && {
          AND: [
            {
              fdccoordinatorValidation:
                user.designation === "Faculty" ? "ACCEPTED" : null,
            },
            {
              OR: [
                { supervisorValidation: "ACCEPTED" },
                {
                  supervisorValidation:
                    user.designation === "Student" ? "ACCEPTED" : null,
                },
              ],
            },
            { hodValidation: "ACCEPTED" },
            { hoiValidation: "ACCEPTED" },
          ],
        }),
        ...(status === "REJECTED" && {
          OR: [
            { fdccoordinatorValidation: "REJECTED" },
            { supervisorValidation: "REJECTED" },
            { hodValidation: "REJECTED" },
            { hoiValidation: "REJECTED" },
          ],
        }),
      };

      // Apply case-insensitive filter for search functionality
      if (sortBy && sortValue) {
        baseWhere[sortBy] = {
          contains: sortValue,
          mode: "insensitive",
        };
      }

      // Count and fetch applications
      totalApplications = await prisma.application.count({ where: baseWhere });
      applications = await prisma.application.findMany({
        where: baseWhere,
        select: {
          applicationId: true,
          applicantName: true,
          formData: true,
          createdAt: true,
        },
        take,
        skip,
        orderBy: { createdAt: "desc" },
      });

      // Filter conditions for Validators (Supervisor, HOD, HOI, FDCcoordinator)
    } else if (
      ["Supervisor", "HOD", "HOI", "FDCcoordinator"].includes(user.designation)
    ) {
      const validationField = `${user.designation.toLowerCase()}Validation`;

      const baseWhere = {
        validators: { some: { profileId: userId } },
        [validationField]: status,
      };

      if (sortBy && sortValue) {
        baseWhere[sortBy] = {
          contains: sortValue,
          mode: "insensitive",
        };
      }

      totalApplications = await prisma.application.count({
        where: baseWhere,
      });

      applications = await prisma.application.findMany({
        where: baseWhere,
        select: {
          applicationId: true,
          applicantName: true,
          formData: true,
          createdAt: true,
        },
        take,
        skip,
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Unauthorized access for other user roles
      return res.status(403).send("Unauthorized");
    }

    // Format response with selected fields
    const responseApplications = applications.map((application) => ({
      applicationId: application.applicationId,
      applicantName: application.applicantName,
      formData: {
        eventName: application.formData.eventName,
        applicantDepartment: application.formData.applicantDepartment,
      },
      createdAt: application.createdAt,
    }));

    return res.status(200).json({
      message: `${status} Applications Fetched Successfully`,
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
    const user = req.user;

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
        fdccoordinatorValidation: true,
        hodValidation: true,
        hoiValidation: true,
        rejectionFeedback: true,
        createdAt: true,
        applicant: {
          select: {
            designation: true,
          },
        },
      },
    });

    if (!applicationFull) {
      return res.status(404).json({ error: "Application not found" });
    }

    let currentStatus;

    if (["Student", "Faculty"].includes(user.designation)) {
      if (
        applicationFull.supervisorValidation === "ACCEPTED" &&
        applicationFull.hodValidation === "ACCEPTED" &&
        applicationFull.hoiValidation === "ACCEPTED"
      ) {
        if (user.designation === "Student") {
          currentStatus = "ACCEPTED";
        } else if (
          user.designation === "Faculty" &&
          applicationFull.fdccoordinatorValidation === "ACCEPTED"
        ) {
          currentStatus = "ACCEPTED";
        }
      } else if (
        applicationFull.supervisorValidation === "REJECTED" ||
        applicationFull.hodValidation === "REJECTED" ||
        applicationFull.hoiValidation === "REJECTED" ||
        applicationFull.fdccoordinatorValidation === "REJECTED"
      ) {
        currentStatus = "REJECTED";
      } else {
        currentStatus = "PENDING";
      }
    } else if (
      ["Supervisor", "HOD", "HOI", "FDCcoordinator"].includes(user.designation)
    ) {
      const validationField = `${user.designation.toLowerCase()}Validation`;

      if (applicationFull[validationField] === "ACCEPTED") {
        currentStatus = "ACCEPTED";
      } else if (applicationFull[validationField] === "REJECTED") {
        currentStatus = "REJECTED";
      } else {
        currentStatus = "PENDING";
      }
    } else {
      return res.status(403).send("Unauthorized");
    }

    return res.status(200).json({ ...applicationFull, currentStatus });
  } catch (error) {
    console.error("Error retrieving application data:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving the application data",
    });
  }
};

const getFile = async (req, res) => {
  try {
    const { applicationId, fileName } = req.params;
    const user = req.user;
    const userId = user.id;

    const validFileNames = [
      "proofOfTravel",
      "proofOfAccommodation",
      "proofOfAttendance",
      "expenseProof0",
      "expenseProof1",
      "expenseProof2",
      "expenseProof3",
      "expenseProof4",
      "expenseProof5",
      "expenseProof6",
      "expenseProof7",
      "expenseProof8",
      "expenseProof9",
    ];

    if (!validFileNames.includes(fileName)) {
      return res.status(400).json({ error: "Invalid File request" });
    }

    let applicationSelection = {};

    const fileSelection = {
      proofOfTravel: false,
      proofOfAccommodation: false,
      proofOfAttendance: false,
      expenseProof0: false,
      expenseProof1: false,
      expenseProof2: false,
      expenseProof3: false,
      expenseProof4: false,
      expenseProof5: false,
      expenseProof6: false,
      expenseProof7: false,
      expenseProof8: false,
      expenseProof9: false,
    };

    if (validFileNames.includes(fileName)) {
      fileSelection[fileName] = true;
    }

    let myApplication;

    if (["Student", "Faculty"].includes(user.designation)) {
      myApplication = await prisma.applicant.findUnique({
        where: {
          profileId: userId,
        },
        select: {
          applications: {
            where: {
              applicationId,
            },
            select: fileSelection,
          },
        },
      });
    } else if (
      ["Supervisor", "HOD", "HOI", "FDCcoordinator"].includes(user.designation)
    ) {
      myApplication = await prisma.validator.findUnique({
        where: {
          profileId: userId,
        },
        select: {
          applications: {
            where: {
              applicationId,
            },
            select: fileSelection,
          },
        },
      });
    }

    const myFile = myApplication?.applications[0];

    if (!myFile) {
      return res.status(404).json({ error: "File not found" });
    }

    // Retrieve the file buffer dynamically based on the fileName
    const fileBuffer = myFile[fileName];

    // If file buffer doesn't exist
    if (!fileBuffer) {
      return res.status(404).json({ error: "File content not found" });
    }

    // Set response headers for PDF file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}.pdf"`
    );

    // Send the file buffer as a response
    return res.send(fileBuffer);
  } catch (error) {
    console.error("Error retrieving application data:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving the application data",
    });
  }
};

export { getApplicationData, getFile, dataRoot, getApplicationsByStatus };
