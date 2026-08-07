import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./envConfig.js";
import { connDb } from "./config/db.js";
import crudRoutes from "./routes/crudRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";

const app = express();
const allowedOrigins = [
  config.clientUrl
].filter(Boolean);

//Middlewares
app.use(express.json()); // Body-parser
app.use(cookieParser());
app.use(
  cors({
    //Allowed origins helper function
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("CORS Rejected Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Server's running");
});

app.use("/auth", authRoutes);
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
