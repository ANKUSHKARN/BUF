import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import brotherRoutes from "./routes/brother.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/brother", brotherRoutes);
app.use("/api/brother/me", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.get("/", (req, res) => {
  res.send("Brother Unity Fund API Running");
});

export default app;