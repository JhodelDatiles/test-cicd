import express, { type Request, type Response } from "express";
import cors from "cors";
import { config } from "./envConfig.js";
import { connDb } from "./config/db.js";
import crudRoutes from "./routes/crudRoutes.ts";
import authRoutes from "./routes/authRoutes.ts"
const app = express();

//Middlewares
app.use(express.json()); // Body-parser
app.use(
  cors({
    //Allowed origins
    origin: true,
    credentials: true
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Server's running");
});

app.use("/auth", authRoutes)
app.use("/crud", crudRoutes);

const startServer = async () => {
  try {
    await connDb();
    app.listen(config.port, () => {
      console.log(`Server is running on port http://localhost:${config.port}`);
      console.log(`-----------------------------------`);
    });
  } catch (error) {
    console.error(" Failed to connect to the database:", error);
    process.exit(1); // Exit process with failure code
  }
};

startServer();