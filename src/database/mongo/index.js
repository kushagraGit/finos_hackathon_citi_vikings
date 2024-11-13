const mongoConnection = require("./connection");

module.exports = {
  connectMongoDB: () => mongoConnection.connect(),
  disconnectMongoDB: () => mongoConnection.disconnect(),
  isMongoConnected: () => mongoConnection.isConnected(),
};
