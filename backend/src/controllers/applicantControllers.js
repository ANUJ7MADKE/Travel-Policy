import prisma from '../config/prismaConfig.js';

const createApplication = async (req, res) => {
  let applicantId = req.params.id;
  let department = req.params.department;
  let formData = req.body.formData;

  try {
    let supervisor = await prisma.validator.findUnique({
      where: {
        email: formData.supervisorEmail,
      }
    });

    if (!supervisor || supervisor.designation != "Supervisor") {
      return res.status(404).send("Supervisor email invalid");
    }

    if (supervisor.department != department) {
      return res.status(404).send("Supervisor doesn't belong to your department")
    }

    let additionalSupervisor = null;

    if (formData.additionalSupervisorEmail!=null) {
      additionalSupervisor = await prisma.validator.findUnique({
        where: {
          email: formData.additionalSupervisorEmail,
        }
      });
    }

    if (additionalSupervisor){
      if (additionalSupervisor.profileId === supervisor.profileId) {
        return res.status(404).send("Additonal Supervisor's email can't be same as Supervisor's");
      }
  
      if (additionalSupervisor.designation != "Supervisor") {
        return res.status(404).send("Additonal Supervisor email invalid");
      }
    }

    

    let hod = await prisma.validator.findFirst({
      where: {
        AND: {
          department: department,
          designation: 'HOD'
        }
      }
    });

    if (!hod) {
      return res.status(404).send("HOD not found");
    }

    let hoi = await prisma.validator.findFirst({
      where: {
        AND: {
          designation: 'HOI'
        }
      }
    });

    if (!hoi) {
      return res.status(404).send("HOI not found");
    }

    let validators = [
      { profileId: supervisor.profileId },
      { profileId: hod.profileId },
      ...(additionalSupervisor ? [{ profileId: additionalSupervisor.profileId }] : []),
      {profileId: hoi.profileId}
    ];
    

    let applicationData = {
      applicantId,
      formData
    };

    let newApplication = await prisma.application.create({
      data: {
        ...applicationData,
        validators: {
          connect: validators
        }
      }
    });

    res.status(201).send(newApplication);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

const getApplicatons = async (req,res)=>{
  try {
    let applicant = await prisma.applicant.findFirst({
      where:{
        profileId: req.params.id
      },
      include:{
        applications:true
      }
    })

    if (!applicant) {
      return res.status(404).send("applicant doesn't exist")
    }
    
    let allApplications = applicant.applications;

    let applications = {"PENDING":[],"REJECTED":[],"ACCEPTED":[]};

    allApplications.forEach((application)=>{
      let status = '';

      if (application.hoiValidation) {
        status = application.hoiValidation;
      } else if (application.hodValidation) {
        status = application.hodValidation;
      } else {
        status = application.supervisorValidation;
      }

      if (applications[status]) {
        applications[status].push(application);
      }
    })

    return res.status(200).send(applications);
    
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export {
  createApplication,
  getApplicatons
}