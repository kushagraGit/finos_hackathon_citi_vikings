// models/Application.js
const mongoose = require("mongoose");
const validator = require("validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       required:
 *         - appId
 *         - title
 *       properties:
 *         appId:
 *           type: string
 *           description: Unique identifier for the application
 *           example: "app-123"
 *         title:
 *           type: string
 *           description: Application title
 *           example: "Trading App"
 *         description:
 *           type: string
 *           description: Detailed description of the application
 *           example: "A powerful trading application"
 *         version:
 *           type: string
 *           description: Application version
 *           pattern: "^\\d+\\.\\d+\\.\\d+$"
 *           example: "1.0.0"
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Categories the application belongs to
 *           example: ["Trading", "Finance"]
 *         icons:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - src
 *             properties:
 *               src:
 *                 type: string
 *                 format: uri
 *                 description: URL to the icon
 *                 example: "https://example.com/icon.png"
 *               size:
 *                 type: string
 *                 pattern: "^\\d+x\\d+$"
 *                 description: Icon size (e.g., '16x16', '32x32')
 *                 example: "32x32"
 *         screenshots:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - src
 *             properties:
 *               src:
 *                 type: string
 *                 format: uri
 *                 description: URL to the screenshot
 *                 example: "https://example.com/screenshot.png"
 *               label:
 *                 type: string
 *                 description: Screenshot description
 *                 example: "Main trading view"
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Contact email for the application
 *           example: "contact@tradingapp.com"
 *         supportEmail:
 *           type: string
 *           format: email
 *           description: Support email for the application
 *           example: "support@tradingapp.com"
 *         moreInfo:
 *           type: string
 *           format: uri
 *           description: Additional information URL
 *           example: "https://tradingapp.com/info"
 *         publisher:
 *           type: string
 *           description: Application publisher name
 *           example: "Trading Solutions Inc."
 *         details:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *               description: Application URL
 *               example: "https://tradingapp.com"
 */
const ApplicationSchema = new mongoose.Schema(
  {
    appId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9-_]+$/.test(v);
        },
        message:
          "appId can only contain letters, numbers, hyphens and underscores",
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    version: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d+\.\d+\.\d+$/.test(v);
        },
        message: "Version must be in semver format (e.g., 1.0.0)",
      },
    },
    categories: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],
    icons: [
      {
        src: {
          type: String,
          required: true,
          validate: {
            validator: (v) => validator.isURL(v),
            message: "Icon URL must be valid",
          },
        },
        size: {
          type: String,
          validate: {
            validator: function (v) {
              return /^\d+x\d+$/.test(v);
            },
            message: "Size must be in format WxH (e.g., 32x32)",
          },
        },
      },
    ],
    screenshots: [
      {
        src: {
          type: String,
          required: true,
          validate: {
            validator: (v) => validator.isURL(v),
            message: "Screenshot URL must be valid",
          },
        },
        label: {
          type: String,
          trim: true,
          maxlength: [100, "Label cannot exceed 100 characters"],
        },
      },
    ],
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Invalid contact email",
      },
    },
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Invalid support email",
      },
    },
    moreInfo: {
      type: String,
      validate: {
        validator: (v) => validator.isURL(v),
        message: "More info URL must be valid",
      },
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, "Publisher name cannot exceed 100 characters"],
    },
    details: {
      url: {
        type: String,
        validate: {
          validator: (v) => validator.isURL(v),
          message: "Application URL must be valid",
        },
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Removes __v field
  }
);

// Index for faster queries
ApplicationSchema.index({ appId: 1 });
ApplicationSchema.index({ categories: 1 });

module.exports = mongoose.model("Application", ApplicationSchema);
