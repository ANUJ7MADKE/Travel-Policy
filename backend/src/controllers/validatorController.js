import prisma from '../config/prismaConfig.js';

const getApplicatons = async (req,res)=>{
  const designation = req.body.designation;

  try {
    const validator = await prisma.validator.findFirst({
      where:{
        profileId: req.params.id
      },
      include:{
        applications:true
      }
    })

    if (!validator) {
      return res.status(404).send("validator doesn't exist")
    }

    const allApplications = validator.applications;

    const applications = {"PENDING":[],"REJECTED":[],"ACCEPTED":[]};
    
    allApplications.forEach((application)=>{
      const status = application[`${validator.designation.toLowerCase()}Validation`];
      if (applications[status]) {
        applications[status].push(application);
      }
    })
    
    return res.status(200).send(applications);

  } catch (error) {
    res.status(500).send(error.message);
  }
}

const applicationAction = async (req, res) => {
  try {
    const { id: profileId, applicationId, action } = req.params; // actions = 'accepted' or 'rejected'

    const validator = await prisma.validator.findFirst({
      where: { profileId },
      include: { applications: true }
    });

    if (!validator) {
      return res.status(404).send("Validator doesn't exist");
    }

    const application = validator.applications.find(app => app.applicationId === applicationId);

    if (!application) {
      return res.status(404).send("Application not available");

    }

    const validationStatus = action.toUpperCase();  

    if (validationStatus !== "ACCEPTED" && validationStatus !== "REJECTED") {
      return res.status(400).send("Invalid status");
    }

    const validationData = {};

    switch (validator.designation) {
      case "Supervisor":
        if (application.supervisorValidation != "PENDING") {
          return res.status(400).send("Already performed an action, can't change status again")
        }
        validationData.supervisorValidation = validationStatus;
        if (validationStatus === "ACCEPTED") {
          validationData.hodValidation = "PENDING";
        }
        break;
      case "HOD":
        if (application.hodValidation != "PENDING") {
          return res.status(400).send("Already performed an action, can't change status again")
        }
        validationData.hodValidation = validationStatus;
        if (validationStatus === "ACCEPTED") {
          validationData.hoiValidation = "PENDING";
        }
        break;
      case "HOI":
        if (application.hoiValidation != "PENDING") {
          return res.status(400).send("Already performed an action, can't change status again")
        }
        validationData.hoiValidation = validationStatus;
        break;
      default:
        return res.status(400).send("Invalid validator designation");
    }

    const response = await prisma.application.update({
      where: { 
        applicationId: applicationId
      },
      data: validationData
    });

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
};


export {
  getApplicatons,
  applicationAction
}