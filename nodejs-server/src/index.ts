import express from "express";
import cors from "cors";
import apiRouter from "./routes/apiRouter";
import config from "./config";

const { PORT } = config;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
