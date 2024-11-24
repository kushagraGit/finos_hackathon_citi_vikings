const validator = require("validator");
const Intent = require("./intent");

class Application {
  constructor(data) {
    this.appId = data.appId;
    this.title = data.title;
    this.description = data.description;
    this.version = data.version;
    this.categories = data.categories || [];
    this.icons = data.icons || [];
    this.screenshots = data.screenshots || [];
    this.contactEmail = data.contactEmail;
    this.supportEmail = data.supportEmail;
    this.moreInfo = data.moreInfo;
    this.publisher = data.publisher;
    this.details = data.details || {};
    this.intents = (data.intents || []).map((intent) => new Intent(intent));
    this.status = data.status || "inactive";
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Business logic methods
  isActive() {
    return this.status === "active";
  }

  hasIntent(intentName) {
    return this.intents.some((intent) => intent.name === intentName);
  }

  // Static schema definition that can be used by any database
  static getSchema() {
    return {
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
      intents: {
        type: Array,
        validate: {
          validator: function (intents) {
            return intents.every((intent) => {
              const validation = Intent.validate(intent);
              return validation.isValid;
            });
          },
          message: "Invalid intent format",
        },
        default: [],
      },
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
      },
    };
  }

  static getSchemaOptions() {
    return {
      timestamps: true,
      versionKey: false,
    };
  }

  static getIndexes() {
    return [
      { fields: { appId: 1 } },
      { fields: { categories: 1 } },
      {
        fields: { title: "text", description: "text" },
        options: { name: "text_search_index" },
      },
    ];
  }

  // Add any hooks if needed
  static getHooks() {
    return {
      // Example hook
      preSave: async function (next) {
        // Any pre-save operations
        next();
      },
    };
  }

  // Add method to validate intents
  validateIntents() {
    return this.intents.map((intent) => Intent.validate(intent));
  }

  // Add method to add intent
  addIntent(intentData) {
    const validation = Intent.validate(intentData);
    if (!validation.isValid) {
      throw new Error(`Invalid intent: ${validation.errors.join(", ")}`);
    }
    const intent = new Intent(intentData);
    this.intents.push(intent);
    return intent;
  }
}

module.exports = Application;
