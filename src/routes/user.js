const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorizeMiddleware");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");
const dbOrchestrator = require("../db/DatabaseOrchestrator");
const User = require("../models/user");

/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 *       400:
 *         description: Invalid input data
 */
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the fields");
    }

    // Start transaction
    await dbOrchestrator.startTransaction();

    try {
      // Check if user already exists
      const existingUser = await dbOrchestrator.findOne("User", { email });
      if (existingUser) {
        await dbOrchestrator.abortTransaction();
        return res
          .status(409)
          .send({ error: "User with this email already exists" });
      }

      // Create new User instance for validation
      const user = new User({
        name,
        email,
        password,
        role,
      });

      // Save using orchestrator
      const savedUser = await dbOrchestrator.create("User", user.toObject());

      // Commit transaction
      await dbOrchestrator.commitTransaction();

      if (savedUser) {
        res.status(201).send({
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          token: generateToken(savedUser._id),
          role: savedUser.role,
          status: savedUser.status,
        });
      }
    } catch (error) {
      await dbOrchestrator.abortTransaction();
      throw error;
    }
  } catch (error) {
    res.status(400).send({
      error: "Failed to create user",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await dbOrchestrator.find("User", {}, { password: 0 });
    res.status(200).send({
      count: users.length,
      users: users.map((user) => new User(user).toJSON()),
    });
  } catch (error) {
    res.status(500).send({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /v1/users/{email}:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get("/users/:email", async (req, res) => {
  try {
    const user = await dbOrchestrator.findOne(
      "User",
      { email: req.params.email },
      { password: 0 }
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

/**
 * @swagger
 * /v1/users/{email}:
 *   patch:
 *     summary: Update user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               age:
 *                 type: number
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.patch(
  "/users/:email",
  protect,
  authorize("admin", "editor"),
  async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "password", "age", "status"];
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
      // Create update data object with only the fields being updated
      const updateData = {};
      updates.forEach((field) => {
        updateData[field] = req.body[field];
      });

      const user = await dbOrchestrator.findOneAndUpdate(
        "User",
        { email: req.params.email },
        updateData,
        { new: true }
      );

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Create User instance for response formatting
      const userResponse = new User(user).toJSON();
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
  }
);

/**
 * @swagger
 * /v1/users/{email}:
 *   delete:
 *     summary: Delete user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
  "/users/:email",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await dbOrchestrator.findOneAndDelete("User", {
        email: req.params.email,
      });

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
  }
);

/**
 * @swagger
 * /v1/users-approve:
 * patch:
 * summary: Approve or reject a user's account
 * tags: [Users]
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         properties:
 *           email:
 *             type: string
 *             required: true
 *           approval:
 *             type: string
 *             enum: [accepted, rejected]
 *             required: true
 * responses:
 *   200:
 *     description: User status updated successfully
 *   404:
 *     description: User not found
 */
router.patch(
  "/users-approve",
  protect,
  authorize("admin"),
  async (req, res) => {
    const { email, approval } = req.body;

    if (!email || !approval) {
      return res
        .status(400)
        .send({ error: "Email and approval status are required" });
    }

    try {
      // Start transaction
      await dbOrchestrator.startTransaction();

      try {
        const user = await dbOrchestrator.findOne("User", { email });

        if (!user) {
          await dbOrchestrator.abortTransaction();
          return res.status(404).send({ error: "User not found" });
        }

        if (approval === "accepted") {
          const updatedUser = await dbOrchestrator.findOneAndUpdate(
            "User",
            { email },
            { status: "active" },
            { new: true }
          );

          await dbOrchestrator.commitTransaction();
          return res.status(200).send({
            message: "User approved and activated successfully",
            user: new User(updatedUser).toJSON(),
          });
        } else if (approval === "rejected") {
          const deletedUser = await dbOrchestrator.findOneAndDelete("User", {
            email,
          });

          await dbOrchestrator.commitTransaction();
          return res.status(200).send({
            message: "User rejected and deleted successfully",
            user: new User(deletedUser).toJSON(),
          });
        } else {
          await dbOrchestrator.abortTransaction();
          return res.status(400).send({ error: "Invalid approval value" });
        }
      } catch (error) {
        await dbOrchestrator.abortTransaction();
        throw error;
      }
    } catch (error) {
      return res.status(500).send({
        error: "Failed to process request",
        details: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /v1/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user123@gmail.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60b8d295f8d4bc001c8e4f9c"
 *                 name:
 *                   type: string
 *                   example: "user123"
 * 								 role:
 *                   type: string
 *                   example: "user"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid email or password
 */
router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await dbOrchestrator.findOne("User", { email });
    if (!user) {
      return res.status(400).json({ error: "Email doesn't exist" });
    }

    const userInstance = new User(user);
    const isMatch = await bcrypt.compare(password, userInstance.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = generateToken(userInstance._id);

    res.status(200).json({
      user: userInstance.toJSON(),
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Update the bulk delete endpoint (if needed)
router.delete("/users/bulk", protect, authorize("admin"), async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).send({ error: "Invalid email list provided" });
    }

    await dbOrchestrator.startTransaction();

    try {
      const result = await dbOrchestrator.deleteMany("User", {
        email: { $in: emails },
      });

      await dbOrchestrator.commitTransaction();

      res.status(200).send({
        message: "Users deleted successfully",
        count: result.deletedCount,
      });
    } catch (error) {
      await dbOrchestrator.abortTransaction();
      throw error;
    }
  } catch (error) {
    res.status(500).send({
      error: "Failed to delete users",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /v1/users/id/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/users/id/:userId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user",
      details: error.message,
    });
  }
});

module.exports = router;
