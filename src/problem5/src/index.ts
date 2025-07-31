import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import crustaceanRoutes from "./routes/crustaceanRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/crustaceans", crustaceanRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Crustaceans API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint with API information
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Crustaceans API",
    version: "1.0.0",
    endpoints: {
      "GET /health": "Health check",
      "GET /api/crustaceans":
        "Get all crustaceans (supports filters: group, subGroup, limit, offset)",
      "GET /api/crustaceans/:id": "Get crustacean by ID",
      "POST /api/crustaceans": "Create new crustacean",
      "PUT /api/crustaceans/:id": "Update crustacean",
      "DELETE /api/crustaceans/:id": "Delete crustacean",
    },
    availableSubGroups: ["Lobster", "Prawn", "Shrimp"],
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🦐 Crustaceans API server is running on port ${PORT}`);
  console.log(`📋 API documentation available at http://localhost:${PORT}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});

export default app;
