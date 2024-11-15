const mongoose = require("mongoose");
const DatabaseInterface = require("../DatabaseInterface");

class MongoDatabase extends DatabaseInterface {
  constructor(uri) {
    super();
    this.uri = uri;
    this.connection = mongoose.connection;
  }

  async connect() {
    await mongoose.connect(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  async checkHealth() {
    return this.connection.readyState === 1;
  }

  async create(collection, data) {
    const Model = mongoose.model(collection);
    const document = new Model(data);
    return await document.save();
  }

  async findById(collection, id) {
    const Model = mongoose.model(collection);
    return await Model.findById(id);
  }

  async updateById(collection, id, updateData) {
    const Model = mongoose.model(collection);
    return await Model.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteById(collection, id) {
    const Model = mongoose.model(collection);
    return await Model.findByIdAndDelete(id);
  }
}

module.exports = MongoDatabase;
