const mongoose = require("mongoose");
const env = require("../../config/environment");

class MongoConnection {
  constructor() {
    this.url = env.MONGODB_URL;
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }

  async connect() {
    try {
      await mongoose.connect(this.url, this.options);
      console.log("Successfully connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log("Successfully disconnected from MongoDB");
    } catch (error) {
      console.error("MongoDB disconnection error:", error);
      throw error;
    }
  }

  // Helper method to check connection status
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new MongoConnection();
