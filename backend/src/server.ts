import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import dashboardRoutes from "./routes/dashboard";

// 1. Importez votre service ou créez le middleware ici
import logService from "./services/LogService"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de base
app.use(cors());
app.use(express.json());

// --- LE MIDDLEWARE DE LOGS SE PLACE ICI ---
app.use((req, res, next) => {
  const start = Date.now();

  // On écoute l'événement 'finish' qui est déclenché quand la réponse est envoyée
  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // On ignore la route de santé pour ne pas polluer la DB si vous avez un healthcheck
    if (req.originalUrl !== "/health") {
      logService.logRequest(
        req.originalUrl,
        req.method,
        res.statusCode,
        duration
      ).catch(err => console.error("Log error:", err));
    }
  });

  next();
});
// ------------------------------------------

// Routes
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/dashboard", dashboardRoutes);

// Route de santé
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;