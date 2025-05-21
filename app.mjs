import express from 'express';
import dotenv from 'dotenv';
import submitDumpRouter from './api/submitDump.mjs';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/', submitDumpRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
