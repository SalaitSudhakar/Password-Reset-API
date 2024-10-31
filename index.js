import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './Database/dbConfig.js';
import authRouter from './Routers/authRouter.js'


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDb()

app.get('/', (req, res)=>{
    res.status(200).send("Welcome to my API")
});

app.use("/api/auth", authRouter)

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Server started and running on the port")
})

