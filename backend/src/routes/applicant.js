import express from 'express';
import uploadFields from '../middleware/upload.js';
import { createApplication } from '../controllers/applicantControllers.js';

const router = express.Router();

router.post("/create-application", 
  (req, res, next) => {
    console.log('Before upload middleware:', req.body);
    next();
  },
  uploadFields,
  (req, res, next) => {
    console.log('After upload middleware:', req.files, req.body);
    next();
  },
  createApplication
);


export default router;
