import "dotenv/config";
import express from "express";
import connectWithRetry from "./db/mongoose-connection.js";
import testRouter from "./routers/test.router.js";
import cors from "cors";
const app = express();
connectWithRetry();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use("/", testRouter);

app.listen(process.env.PORT || 3000, ()=>{
    console.log("👷🏽‍♂️ Test Service Running on 3006...");
})
