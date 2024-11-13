const mongoose = require("mongoose");

const connectMongoDB = () => {
  mongoose.connect(
    "mongodb+srv://kushagrapaypal1:xLrTk1hVSACABnkH@finoshackathon.6tc7q.mongodb.net/?retryWrites=true&w=majority&appName=finosHackathon"
  );
};

module.exports = { connectMongoDB };
