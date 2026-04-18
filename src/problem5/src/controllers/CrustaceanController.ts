import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { CrustaceanService } from "../services/CrustaceanService";
import {
  CreateCrustaceanRequest,
  UpdateCrustaceanRequest,
  CrustaceanFilters,
} from "../types/Crustacean";
import { PaginationUtils } from "../utils/pagination";

export class CrustaceanController {
  private crustaceanService: CrustaceanService;

  constructor() {
    this.crustaceanService = new CrustaceanService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const crustaceanData: CreateCrustaceanRequest = req.body;
      const newCrustacean = await this.crustaceanService.create(crustaceanData);

      res.status(201).json({
        success: true,
        message: "Crustacean created successfully",
        data: newCrustacean,
      });
    } catch (error) {
      console.error("Error creating crustacean:", error);

      // Handle duplicate name error
      if (
        error instanceof Error &&
        error.message === "A crustacean with this name already exists"
      ) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      // Parse pagination parameters using page instead of offset
      const paginationParams = {
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
      };

      // Validate pagination parameters
      const paginationErrors =
        PaginationUtils.validatePaginationParams(paginationParams);
      if (paginationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Invalid pagination parameters",
          errors: paginationErrors,
        });
        return;
      }

      // Parse pagination with utility
      const { limit, page } =
        PaginationUtils.parsePaginationParams(paginationParams);

      const filters: CrustaceanFilters = {
        group: req.query.group as string,
        subGroup: req.query.subGroup as string,
        limit,
        page,
      };

      const result = await this.crustaceanService.findAll(filters);

      // Use pagination utility to format response
      const response = PaginationUtils.formatPaginatedResponse(
        result.data,
        result.totalRows,
        limit,
        page,
        "Crustaceans retrieved successfully"
      );

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching crustaceans:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID parameter",
        });
        return;
      }

      const crustacean = await this.crustaceanService.findById(id);

      if (!crustacean) {
        res.status(404).json({
          success: false,
          message: "Crustacean not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Crustacean retrieved successfully",
        data: crustacean,
      });
    } catch (error) {
      console.error("Error fetching crustacean:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID parameter",
        });
        return;
      }

      const updateData: UpdateCrustaceanRequest = req.body;
      const updatedCrustacean = await this.crustaceanService.update(
        id,
        updateData
      );

      if (!updatedCrustacean) {
        res.status(404).json({
          success: false,
          message: "Crustacean not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Crustacean updated successfully",
        data: updatedCrustacean,
      });
    } catch (error) {
      console.error("Error updating crustacean:", error);

      // Handle duplicate name error
      if (
        error instanceof Error &&
        error.message === "A crustacean with this name already exists"
      ) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID parameter",
        });
        return;
      }

      const deleted = await this.crustaceanService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Crustacean not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Crustacean deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting crustacean:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
