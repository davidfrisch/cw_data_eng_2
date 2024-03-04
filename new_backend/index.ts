import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { HealthRouter } from "./routes/health";
import { pipelinesRouter } from "./routes/pipelines";

const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json({ limit: "100mb" }));

app.use("/v1/health", HealthRouter);
app.use("/v1/pipelines", pipelinesRouter);

app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(3001, () => {
  console.log("Server is listening on port 3001");
});