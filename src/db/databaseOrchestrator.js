const environment = require("../config/environment");
const MongoDatabase = require("../database/mongo/mongoDatabase");
const PostgresDatabase = require("../database/postgres/postgresDatabase");

class DatabaseOrchestrator {
  constructor() {
    this.dbInstance = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return this.dbInstance;

    const dbType = environment.DB_TYPE;

    try {
      switch (dbType) {
        case "mongo":
          this.dbInstance = new MongoDatabase(environment.getDatabaseUri());
          break;
        case "postgres":
          this.dbInstance = new PostgresDatabase(environment.getDatabaseUri());
          break;
        default:
          throw new Error(`Unsupported database type: ${dbType}`);
      }

      this.initialized = true;
      return this.dbInstance;
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  }

  async getInstance() {
    if (!this.initialized) {
      return await this.initialize();
    }
    return this.dbInstance;
  }

  async connect() {
    const instance = await this.getInstance();
    await instance.connect();
    return instance;
  }

  async disconnect() {
    if (this.dbInstance) {
      await this.dbInstance.disconnect();
    }
  }

  async findOne(collection, query, projection = {}) {
    return await this.dbInstance.findOne(collection, query, projection);
  }

  async find(collection, query = {}, projection = {}) {
    return await this.dbInstance.find(collection, query, projection);
  }

  async checkHealth() {
    return await this.dbInstance.checkHealth();
  }

  async create(collection, data) {
    return await this.dbInstance.create(collection, data);
  }

  async findById(collection, id) {
    return await this.dbInstance.findById(collection, id);
  }

  async updateById(collection, id, updateData) {
    return await this.dbInstance.updateById(collection, id, updateData);
  }

  async deleteById(collection, id) {
    return await this.dbInstance.deleteById(collection, id);
  }

  async findOneAndUpdate(collection, query, updateData, options = {}) {
    return await this.dbInstance.findOneAndUpdate(
      collection,
      query,
      updateData,
      options
    );
  }

  async findOneAndDelete(collection, query) {
    return await this.dbInstance.findOneAndDelete(collection, query);
  }

  async insertMany(collection, documents) {
    return await this.dbInstance.insertMany(collection, documents);
  }

  async updateMany(collection, query, updateData) {
    return await this.dbInstance.updateMany(collection, query, updateData);
  }

  async deleteMany(collection, query) {
    return await this.dbInstance.deleteMany(collection, query);
  }

  async aggregate(collection, pipeline) {
    return await this.dbInstance.aggregate(collection, pipeline);
  }

  async count(collection, query = {}) {
    return await this.dbInstance.count(collection, query);
  }

  async startTransaction() {
    return await this.dbInstance.startTransaction();
  }

  async commitTransaction() {
    return await this.dbInstance.commitTransaction();
  }

  async abortTransaction() {
    return await this.dbInstance.abortTransaction();
  }
}

const dbOrchestrator = new DatabaseOrchestrator();
module.exports = dbOrchestrator;
