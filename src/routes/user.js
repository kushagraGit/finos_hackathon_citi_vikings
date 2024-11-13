const express = require("express");
const router = express.Router();
const User = require("../models/user");

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
  try {
    const adminUser = new User({
      name: "Vishal Asthana",
      email: "vishal.paypal@gmail.com",
      password: "Test@1234",
      age: 26,
    });
    const savedUser = await adminUser.save();
    res.status(201).send(savedUser);
  } catch (error) {
    res.status(400).send({ error: error.message });
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
