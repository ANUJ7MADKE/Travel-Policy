import express from 'express';
import multer from 'multer';
import { createApplication, applicantRoot } from '../controllers/applicantControllers.js';

const upload = multer(); // Initialize multer

const router = express.Router();

router.get("/root", applicantRoot);

router.post("/create-application",
  upload.fields([
    { name: 'proofOfTravel', maxCount: 1 },
    { name: 'proofOfAccommodation', maxCount: 1 },
    { name: 'proofOfAttendance', maxCount: 1 }
  ]),
  createApplication
);

export default router;
