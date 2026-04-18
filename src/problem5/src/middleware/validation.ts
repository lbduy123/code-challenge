import { body } from "express-validator";

export const validateCreateCrustacean = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("subGroup")
    .trim()
    .notEmpty()
    .withMessage("Sub-group is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Sub-group must be between 1 and 50 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("habitat")
    .trim()
    .notEmpty()
    .withMessage("Habitat is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Habitat must be between 5 and 200 characters"),

  body("averageSize")
    .isNumeric()
    .withMessage("Average size must be a number")
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Average size must be between 0.1 and 100 centimeters"),

  body("scientificName")
    .trim()
    .notEmpty()
    .withMessage("Scientific name is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Scientific name must be between 5 and 100 characters"),
];

export const validateUpdateCrustacean = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("subGroup")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Sub-group must be between 1 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("habitat")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Habitat must be between 5 and 200 characters"),

  body("averageSize")
    .optional()
    .isNumeric()
    .withMessage("Average size must be a number")
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Average size must be between 0.1 and 100 centimeters"),

  body("scientificName")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Scientific name must be between 5 and 100 characters"),
];
