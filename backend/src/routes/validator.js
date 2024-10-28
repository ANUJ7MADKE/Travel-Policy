import express from 'express';
import {applicationAction} from '../controllers/validatorController.js'

const router = express.Router();


router.put("/:applicationId/:action", applicationAction)

export default router;