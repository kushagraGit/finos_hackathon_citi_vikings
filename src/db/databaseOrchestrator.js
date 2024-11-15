const environment = require("../config/environment");
const MongoDatabase = require("./mongo/MongoDatabase");
// const PostgresDatabase = require("./postgres/PostgresDatabase"); // Future implementation
// const OracleDatabase = require("./oracle/OracleDatabase"); // Future implementation

class DatabaseOrchestrator {
  constructor() {
    this.dbInstance = null;
  }

  initialize() {
    const dbType = environment.DB_TYPE;

    switch (dbType) {
      case "mongo":
        this.dbInstance = new MongoDatabase(environment.getDatabaseUri());
        break;
      // case "postgres":
      //     this.dbInstance = new PostgresDatabase(environment.getDatabaseUri());
      //     break;
      // case "oracle":
      //     this.dbInstance = new OracleDatabase(environment.getDatabaseUri());
      //     break;
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }

  getInstance() {
    if (!this.dbInstance) {
      this.initialize();
    }
    return this.dbInstance;
  }

  async connect() {
    const instance = this.getInstance();
    await instance.connect();
  }

  async disconnect() {
    const instance = this.getInstance();
    await instance.disconnect();
  }

  async checkHealth() {
    const instance = this.getInstance();
    return await instance.checkHealth();
  }

  async create(collection, data) {
    const instance = this.getInstance();
    return await instance.create(collection, data);
  }

  async findById(collection, id) {
    const instance = this.getInstance();
    return await instance.findById(collection, id);
  }

  async updateById(collection, id, updateData) {
    const instance = this.getInstance();
    return await instance.updateById(collection, id, updateData);
  }

  async deleteById(collection, id) {
    const instance = this.getInstance();
    return await instance.deleteById(collection, id);
  }
}

module.exports = new DatabaseOrchestrator();
