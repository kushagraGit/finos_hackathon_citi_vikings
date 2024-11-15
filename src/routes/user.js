const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { createInitialUser } = require("../seeds/createUser");
const generateToken = require("../config/generateToken");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorizeMiddleware");
const bcrypt = require("bcryptjs");
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
			role,
		});
		const savedUser = await user.save();
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
 * /v1/users/id/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
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
router.get("/users/id/:id", protect, authorize("admin"), async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password");
		if (!user) {
			return res.status(404).send({ error: "User not found" });
		}
		res.status(200).send(user);
	} catch (error) {
		res.status(500).send({
			error: "Failed to fetch user",
			details: error.message
		});
	}
});

/**
 * @swagger
 * /v1/users/email/{email}:
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
			const user = await User.findOneAndDelete({
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
			// Find the user by email
			const user = await User.findOne({ email });

			if (!user) {
				return res.status(404).send({ error: "User not found" });
			}

			if (approval === "accepted") {
				// If approval is "accepted", set status to "active"
				user.status = "active";
				await user.save();

				return res.status(200).send({
					message: "User approved and activated successfully",
					user: {
						name: user.name,
						email: user.email,
						status: user.status,
					},
				});
			} else if (approval === "rejected") {
				// If approval is "rejected", inactive the user
        user.status = "inactive";
				await user.save();

				return res.status(200).send({
					message: "User rejected and deleted successfully",
					user: { name: user.name, email: user.email },
				});
			} else {
				return res
					.status(400)
					.send({ error: "Invalid approval value" });
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
		// Check if user exists by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ error: "Invalid email or password" });
		}

		// Compare provided password with stored hashed password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ error: "Invalid email or password" });
		}

		// Generate JWT token for the user
		const token = generateToken(user._id);

		// Return user object and token (excluding password)
		res.status(200).json({
			_id: user._id,
			name: user.name,
			role: user.role,
			token,
		});
	} catch (error) {
		res.status(500).json({ error: "Server error", details: error.message });
	}
});

module.exports = router;
