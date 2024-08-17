import express from 'express';
import verifyToken from '../middleware/verifyJwt.js';
import verifyApplicant from '../middleware/verifyApplicant.js';
import verifyValidator from '../middleware/verifyValidator.js';
import { applicantLogin } from '../controllers/authControllers.js';
import { validatorLogin } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/applicant-login', applicantLogin);
router.post('/validator-login', validatorLogin);

router.get('/verify-applicant', verifyToken, verifyApplicant, (req, res) => {
  return res.send({
    message: "Access Granted",
  });
});

router.get('/verify-validator', verifyToken, verifyValidator, (req, res) => {
  return res.send({
    message: "Access Granted",
  });
});

//here there will be more routes for the applicants and validators to get dashboard or report data 

export default router;