const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { createInitialUser } = require("../seeds/createUser");

// Create new user
router.post("/users", async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(409)
        .send({ error: "User with this email already exists" });
    }

    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).send({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    res.status(400).send({
      error: "Failed to create user",
      details: error.message,
    });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).send({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).send({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
});

// Get user by email
router.get("/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({
      error: "Failed to fetch user",
      details: error.message,
    });
  }
});

// Update user by email
router.patch("/users/:email", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({
      error: "Invalid updates",
      allowedUpdates,
    });
  }

  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).send({
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(400).send({
      error: "Failed to update user",
      details: error.message,
    });
  }
});

// Delete user by email
router.delete("/users/:email", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(200).send({
      message: "User deleted successfully",
      user: {
        name: user.name,
        email: user.email,
        age: user.age,
      },
    });
  } catch (error) {
    res.status(500).send({
      error: "Failed to delete user",
      details: error.message,
    });
  }
});

// Initialize users (replaces the old seed endpoint)
router.post("/users/initialize", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).send({
        error: "This endpoint is not available in production",
      });
    }

    await createInitialUser();

    res.status(201).send({
      message: "Users initialized successfully",
    });
  } catch (error) {
    res.status(400).send({
      error: "Failed to initialize users",
      details: error.message,
    });
  }
});

module.exports = router;
