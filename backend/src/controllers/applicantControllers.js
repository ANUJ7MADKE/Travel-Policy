import prisma from '../config/prismaConfig.js';

const createApplication = async (req, res) => {
  const applicantId = req.user.id;
  const department = req.user.department;
  const applicantDesignation = req.user.designation;

  const formData = req.body;
  const { proofOfTravel, proofOfAccommodation, proofOfAttendance } = req.files;

  try {
    const applicant = await prisma.applicant.findUnique({
      where: { profileId: applicantId }
    });

    if (!applicant) {
      return res.status(404).send("Applicant invalid");
    }

    const applicantName = applicant.userName;

    let supervisor = null;
    let additionalSupervisor = null;

    if (applicantDesignation === "Student") {
      supervisor = await prisma.validator.findUnique({
        where: { email: formData.primarySupervisorEmail }
      });

      if (!supervisor || supervisor.designation !== "Supervisor" || supervisor.department !== department) {
        return res.status(404).send("Invalid supervisor information");
      }

      if (formData.anotherSupervisorEmail) {
        additionalSupervisor = await prisma.validator.findUnique({
          where: { email: formData.anotherSupervisorEmail }
        });

        if (additionalSupervisor && additionalSupervisor.profileId === supervisor.profileId) {
          return res.status(404).send("Additional Supervisor's email can't be the same as Supervisor's");
        }

        if (additionalSupervisor && additionalSupervisor.designation !== "Supervisor") {
          return res.status(404).send("Invalid additional supervisor email");
        }
      }
    }

    const hod = await prisma.validator.findFirst({
      where: { department, designation: 'HOD' }
    });
    if (!hod) return res.status(404).send("HOD not found");

    const hoi = await prisma.validator.findFirst({
      where: { designation: 'HOI' }
    });
    if (!hoi) return res.status(404).send("HOI not found");

    const validators = [
      ...(supervisor ? [{ profileId: supervisor.profileId }] : []),
      { profileId: hod.profileId },
      ...(additionalSupervisor ? [{ profileId: additionalSupervisor.profileId }] : []),
      { profileId: hoi.profileId }
    ];

    const proofOfTravelBuffer = proofOfTravel?.[0]?.buffer || null;
    const proofOfAccommodationBuffer = proofOfAccommodation?.[0]?.buffer || null;
    const proofOfAttendanceBuffer = proofOfAttendance?.[0]?.buffer || null;

    const applicationData = {
      applicantName,
      formData: JSON.parse(JSON.stringify(formData)),
      proofOfTravel: proofOfTravelBuffer,
      proofOfAccommodation: proofOfAccommodationBuffer,
      proofOfAttendance: proofOfAttendanceBuffer,
      supervisorValidation: applicantDesignation === "Student" ? "PENDING" : undefined,
      hodValidation: applicantDesignation !== "Student" ? "PENDING" : undefined
    };

    const newApplication = await prisma.application.create({
      data: {
        ...applicationData,
        applicant: {
          connect: { profileId: applicantId } // Link the applicant by profileId
        },
        validators: {
          connect: validators
        }
      }
    });

    res.status(201).send(newApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).send(error.message);
  }
};

export { createApplication };
