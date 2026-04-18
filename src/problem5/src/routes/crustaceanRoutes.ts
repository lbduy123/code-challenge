import { Router } from "express";
import { CrustaceanController } from "../controllers/CrustaceanController";
import {
  validateCreateCrustacean,
  validateUpdateCrustacean,
} from "../middleware/validation";

const router = Router();
const crustaceanController = new CrustaceanController();

// Create a new crustacean
router.post("/", validateCreateCrustacean, (req, res) => {
  crustaceanController.create(req, res);
});

// Get all crustaceans with optional filters
router.get("/", (req, res) => {
  crustaceanController.findAll(req, res);
});

// Get a specific crustacean by ID
router.get("/:id", (req, res) => {
  crustaceanController.findById(req, res);
});

// Update a crustacean
router.put("/:id", validateUpdateCrustacean, (req, res) => {
  crustaceanController.update(req, res);
});

// Delete a crustacean
router.delete("/:id", (req, res) => {
  crustaceanController.delete(req, res);
});

export default router;
