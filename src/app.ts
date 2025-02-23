import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';  // Import cors
import adminRoutes from './routes/AdminRoutes';
import resultRoutes from './routes/ResultsRoutes';
import studentRoutes from './routes/StudentRoutes';
import {login} from "./controllers/AuthController";
import authRoutes from "./routes/AuthRoutes";

dotenv.config();

const app = express();

// Enable CORS for all origins
app.use(cors());

// If you want to allow only specific origins (e.g., your frontend's URL):
// app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/students', studentRoutes);




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
