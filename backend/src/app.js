import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import applicantRoute from './routes/applicant.js'
import validatorRoute from './routes/validator.js'

const app = express();

app.use(express.json());
app.use(cors());

app.use('/applicant',applicantRoute);
app.use('/validator',validatorRoute);

app.use(router);

export default app;