import express from 'express';
import dotenv from 'dotenv';
import submitDump from './api/submitDump.mjs';

dotenv.config();

const app = express();
app.use(express.json());
// Expose POST /submit-dump endpoint
app.post('/submit-dump', submitDump);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
