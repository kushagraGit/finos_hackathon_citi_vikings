const { connectMongoDB } = require("../config/database");
const User = require("../models/user");

const DEFAULT_USERS = [
  {
    name: "Vishal Gautam",
    email: "vishal.gautam@gmail.com",
    password: "Test@1234",
    age: 26,
    isAdmin: true,
  },
  {
    name: "Kushagra Asthana",
    email: "kushagra.asthana@gmail.com",
    password: "Test@123",
    age: 25,
  },
  {
    name: "Yousouf",
    email: "yousouf@gmail.com",
    password: "Test@456",
    age: 30,
  },
];

const createInitialUser = async () => {
  try {
    const results = await Promise.all(
      DEFAULT_USERS.map(async (userData) => {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          return `User created: ${userData.email}`;
        }
        return `User already exists: ${userData.email}`;
      })
    );

    console.log("Initialization results:", results);
    return results;
  } catch (error) {
    console.error("Initialization error:", error.message);
    throw error;
  }
};

// This function is used when running the seed script directly
const runSeed = async () => {
  console.log("Starting initialization process...");
  try {
    await connectMongoDB();
    console.log("Connected to MongoDB");

    await createInitialUser();
    console.log("Initialization completed successfully");

    // Disconnect from MongoDB
    process.exit(0);
  } catch (error) {
    console.error("Failed to initialize:", error.message);
    process.exit(1);
  }
};

// Only run if file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { createInitialUser, DEFAULT_USERS };
