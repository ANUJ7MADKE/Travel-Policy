import express from 'express';
import {applicationAction, getApplicatons} from '../controllers/validatorController.js'

const router = express.Router();

router.get("/:id/applications", getApplicatons )

router.put("/:id/:applicationId/:action", applicationAction)

export default router;