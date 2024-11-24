const mongoose = require("mongoose");
const DatabaseInterface = require("../../db/databaseInterface");
const User = require("../../models/user");
const Application = require("../../models/application");

class MongoDatabase extends DatabaseInterface {
  constructor(uri) {
    super();
    this.uri = uri;
    this.connection = mongoose.connection;
    this.session = null;
    this._models = new Map();
  }

  async connect() {
    await mongoose.connect(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Initialize schemas after connection
    this._initializeSchemaRegistry();
  }

  _initializeSchemaRegistry() {
    // Register User model if not already registered
    if (!this._models.has("User")) {
      const userSchema = new mongoose.Schema(
        User.getSchema(),
        User.getSchemaOptions()
      );

      // Add hooks
      const hooks = User.getHooks();
      if (hooks.preSave) {
        userSchema.pre("save", hooks.preSave);
      }

      // Add indexes
      User.getIndexes().forEach((index) => {
        userSchema.index(index.fields, index.options);
      });

      // Create model
      const UserModel =
        mongoose.models.User || mongoose.model("User", userSchema);
      this._models.set("User", UserModel);
    }

    // Register Application model if not already registered
    if (!this._models.has("Application")) {
      const appSchema = new mongoose.Schema(
        Application.getSchema(),
        Application.getSchemaOptions()
      );

      const hooks = Application.getHooks();
      if (hooks.preSave) {
        appSchema.pre("save", hooks.preSave);
      }

      Application.getIndexes().forEach((index) => {
        appSchema.index(index.fields, index.options);
      });

      const ApplicationModel =
        mongoose.models.Application || mongoose.model("Application", appSchema);
      this._models.set("Application", ApplicationModel);
    }
  }

  _getModel(collection) {
    if (!this._models.has(collection)) {
      this._initializeSchemaRegistry(); // Try to initialize if model not found
    }

    if (this._models.has(collection)) {
      return this._models.get(collection);
    }
    throw new Error(`Model ${collection} is not defined`);
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  async checkHealth() {
    return this.connection.readyState === 1;
  }

  async create(collection, data) {
    const Model = this._getModel(collection);
    const document = new Model(data);
    return await document.save({ session: this.session });
  }

  async findById(collection, id) {
    const Model = this._getModel(collection);
    const document = await Model.findById(id).session(this.session);

    // Convert to appropriate class instance
    switch (collection) {
      case "User":
        return this._documentToModel(document, User);
      case "Application":
        return this._documentToModel(document, Application);
      default:
        return document;
    }
  }

  async updateById(collection, id, updateData) {
    const Model = this._getModel(collection);
    return await Model.findByIdAndUpdate(id, updateData, {
      new: true,
      session: this.session,
    });
  }

  async deleteById(collection, id) {
    const Model = this._getModel(collection);
    return await Model.findByIdAndDelete(id, { session: this.session });
  }

  async findOne(collection, query, projection = {}) {
    const Model = this._getModel(collection);
    return await Model.findOne(query, projection).session(this.session);
  }

  async find(collection, query = {}, projection = {}) {
    const Model = this._getModel(collection);
    return await Model.find(query, projection).session(this.session);
  }

  async findOneAndUpdate(collection, query, updateData, options = {}) {
    const Model = this._getModel(collection);
    return await Model.findOneAndUpdate(query, updateData, {
      ...options,
      session: this.session,
    });
  }

  async findOneAndDelete(collection, query) {
    const Model = this._getModel(collection);
    return await Model.findOneAndDelete(query, { session: this.session });
  }

  async insertMany(collection, documents) {
    const Model = this._getModel(collection);
    return await Model.insertMany(documents, { session: this.session });
  }

  async updateMany(collection, query, updateData) {
    const Model = this._getModel(collection);
    return await Model.updateMany(query, updateData, { session: this.session });
  }

  async deleteMany(collection, query) {
    const Model = this._getModel(collection);
    return await Model.deleteMany(query, { session: this.session });
  }

  async aggregate(collection, pipeline) {
    const Model = this._getModel(collection);
    return await Model.aggregate(pipeline).session(this.session);
  }

  async count(collection, query = {}) {
    const Model = this._getModel(collection);
    return await Model.countDocuments(query).session(this.session);
  }

  async startTransaction() {
    this.session = await mongoose.startSession();
    await this.session.startTransaction();
    return this.session;
  }

  async commitTransaction() {
    if (this.session) {
      await this.session.commitTransaction();
      await this.session.endSession();
      this.session = null;
    }
  }

  async abortTransaction() {
    if (this.session) {
      await this.session.abortTransaction();
      await this.session.endSession();
      this.session = null;
    }
  }

  _documentToModel(document, ModelClass) {
    if (!document) return null;
    const plainDoc = document.toObject ? document.toObject() : document;
    return new ModelClass(plainDoc);
  }
}

module.exports = MongoDatabase;
