import express from 'express';
import dotenv from 'dotenv';
import adminRoutes from './routes/AdminRoutes';
import resultRoutes from './routes/ResultsRoutes';
import studentRoutes from './routes/StudentRoutes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/students', studentRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
