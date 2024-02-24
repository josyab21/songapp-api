import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import credentials from "./middlewares/credential";
import corsOptions from "./config/corsOptions";
import indexRouter from "./routes";
import morgan from "morgan";

const app: express.Application = express();

connectDB();

//app.use(cors());
app.use(express.json());
app.use(credentials);
app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use("/api", indexRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
