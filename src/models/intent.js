class Intent {
  constructor(data) {
    this.name = data.name;
    this.displayName = data.displayName;
    this.contexts = data.contexts || [];
    this.customConfig = data.customConfig || {};
  }

  // Business logic methods
  hasContext(contextName) {
    return this.contexts.includes(contextName);
  }

  // Static schema definition that can be used by any database
  static getSchema() {
    return {
      name: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function (v) {
            return /^[a-zA-Z][a-zA-Z0-9.]*$/.test(v);
          },
          message:
            "Intent name must start with a letter and can contain only letters, numbers, and dots",
        },
      },
      displayName: {
        type: String,
        trim: true,
        maxlength: [100, "Display name cannot exceed 100 characters"],
      },
      contexts: [
        {
          type: String,
          trim: true,
          validate: {
            validator: function (v) {
              return /^[a-zA-Z]+(\.[a-zA-Z0-9]+)*$/.test(v);
            },
            message:
              "Context must be in namespaced format (e.g., org.fdc3.instrument)",
          },
        },
      ],
      customConfig: {
        type: Object,
        default: {},
        validate: {
          validator: function (v) {
            return v === null || typeof v === "object";
          },
          message: "customConfig must be a valid object",
        },
      },
    };
  }

  // Validation method that can be used by any database
  static validate(data) {
    const schema = this.getSchema();
    const errors = [];

    // Validate name
    if (!data.name || !schema.name.validate.validator(data.name)) {
      errors.push(schema.name.validate.message);
    }

    // Validate contexts
    if (data.contexts) {
      data.contexts.forEach((context) => {
        if (!schema.contexts[0].validate.validator(context)) {
          errors.push(
            `Context "${context}": ${schema.contexts[0].validate.message}`
          );
        }
      });
    }

    // Validate customConfig
    if (
      data.customConfig &&
      !schema.customConfig.validate.validator(data.customConfig)
    ) {
      errors.push(schema.customConfig.validate.message);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Intent;
