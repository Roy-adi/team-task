import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { connectdb } from './db/connectdb.js';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  undefined, 
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully!");
});

import authRoutes from './routes/auth.route.js'
import projectRoutes from './routes/projects.route.js'
import taskRoutes from './routes/task.route.js'

app.use('/api/v1', authRoutes)
app.use('/api/v1', projectRoutes)
app.use('/api/v1', taskRoutes)


app.listen(PORT , ()=>{
  connectdb()
  console.log('server listening on port : '+PORT);
})