const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require('bcryptjs');

// Create new user
router.post("/users1", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).send(savedUser);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Create initial admin user (for testing/seeding)
router.post("/users/seed", async (req, res) => {
  console.log("I am seeding the user");
  try {
    if (!User || !User.prototype.save) {
      console.error("User model not properly imported");
      return res.status(500).send({ error: "User model not properly configured" });
    }

    const {name,email,password,age} = req.body;

    if (!name || !email || !password) {
      return res.status(400).send({ error: "Required fields are missing" });
    }

    const user = new User({
      name,
      email,
      password,
      age
    });

    const savedUser = await user.save();
    
    if (!savedUser) {
      return res.status(400).send({ error: "Failed to save user" });
    }
    
    res.status(201).send(savedUser);
  } catch (error) {
    console.error("Error seeding user:", error);
    res.status(400).send({ 
      error: error.message || "Failed to create user"
    });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  console.log("I am gettign called");
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get user by email
router.get("/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update user by email
router.patch("/users/:email", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "age"]; // email cannot be updated
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Delete user by email
router.delete("/users/:email", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
