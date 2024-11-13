const mongoose = require("mongoose");
const env = require("./environment");

const connectMongoDB = () => {
  return mongoose.connect(env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = { connectMongoDB };
