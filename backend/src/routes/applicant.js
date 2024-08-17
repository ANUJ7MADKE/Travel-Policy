import express from 'express';
import {createApplication,getApplicatons} from '../controllers/applicantControllers.js'
const router = express.Router();

router.post("/:id/:department/create-application", createApplication);

router.get("/:id/applications", getApplicatons )

export default router;
