const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { createInitialUser } = require("../seeds/createUser");
const generateToken = require("../config/generateToken");
const { protect } = require("../middleware/authMiddleware");

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
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			res.status(400);
			throw new Error("Please Enter all the fields");
		}
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(409)
				.send({ error: "User with this email already exists" });
		}

		const user = new User({
			name,
			email,
			password,
		});
		const savedUser = await user.save();
		if (savedUser) {
			res.status(201).send({
				_id: savedUser._id,
				name: savedUser.name,
				email: savedUser.email,
				token: generateToken(savedUser._id),
			});
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
router.get("/users", protect, async (req, res) => {
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

/**
 * @swagger
 * /v1/users/initialize:
 *   post:
 *     summary: Initialize users (Development only)
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: Users initialized successfully
 *       403:
 *         description: Not available in production
 */
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
