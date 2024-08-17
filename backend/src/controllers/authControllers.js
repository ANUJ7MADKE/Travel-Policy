import prisma from '../config/prismaConfig.js';
import generateToken from '../services/generateToken.js';

const applicantLogin = async (req, res) => {
  const { username, password } = req.body;

  let validProfile = await prisma.applicant.findFirst({
    where: {
      userName: username,
      password: password
    },
    select: {
      profileId: true,
      email: true,
    }
  });

  if (!validProfile) {
    return res.status(404).json({
      message: "Invalid Credentials for Applicant Login",
      token: null,
    });
  } else {
    const tokenObject = {
      profileId: validProfile.profileId,
      designation: "applicant"
    }

    const token = generateToken(tokenObject);

    res.send({
      message: "Login Successful",
      token: token,
    });
  }
};

const validatorLogin = async (req, res) => {
  const { username, password } = req.body;

  const validProfile = await prisma.validator.findFirst({
    where: {
      userName: username,
      password: password
    },
    select: {
      profileId: true,
      email: true,
      designation: true
    }
  });

  if (!validProfile) {
    return res.status(404).json({
      message: "Invalid Credentials for Validator Login",
      token: null,
    });
  } else {
    const tokenObject = {
      profileId: validProfile.profileId,
      designation: validProfile.designation
    }

    const token = generateToken(tokenObject);

    return res.send({
      message: "Login Successful",
      token: token,
    });
  }
};

export { applicantLogin, validatorLogin };