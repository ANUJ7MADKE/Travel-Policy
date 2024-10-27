import express from 'express';
import { dataRoot, getAcceptedApplications, getApplicationData, getFile, getPendingApplications, getRejectedApplications } from '../controllers/generalControllers.js';

const router = express.Router();

router.get("/dataRoot", dataRoot );

router.get("/getPendingApplications", getPendingApplications);

router.get("/getAcceptedApplications", getAcceptedApplications);

router.get("/getRejectedApplications", getRejectedApplications);

router.get("/getApplicationData/:applicationId", getApplicationData);

router.get("/getFile/:applicationId/:fileName", getFile)



export default router;