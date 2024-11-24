const validator = require("validator");
const bcrypt = require("bcryptjs");

class User {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.age = data.age || 0;
    this.role = data.role || "user";
    this.status = data.status || "inactive";
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Business logic methods
  isAdmin() {
    return this.role === "admin";
  }

  isActive() {
    return this.status === "active";
  }

  toJSON() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }

  // Static schema definition that can be used by any database
  static getSchema() {
    return {
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
          validator: (value) => validator.isEmail(value),
          message: "Invalid email format",
        },
      },
      password: {
        type: String,
        required: true,
        trim: true,
        minlength: [7, "Password must be at least 7 characters long"],
        validate: {
          validator: function (value) {
            return !value.toLowerCase().includes("password");
          },
          message: "Password should not contain the word 'password'",
        },
      },
      age: {
        type: Number,
        default: 0,
        validate: {
          validator: function (value) {
            return value >= 0;
          },
          message: "Age must be a positive number",
        },
      },
      role: {
        type: String,
        enum: ["user", "admin", "editor", "desktopAgent"],
        default: "user",
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
    return [{ fields: { email: 1 } }];
  }

  static getHooks() {
    return {
      preSave: async function (next) {
        if (this.isModified("password")) {
          this.password = await bcrypt.hash(this.password, 10);
        }
        next();
      },
    };
  }
}

module.exports = User;
