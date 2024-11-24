const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const { checkIfTokenRevoked } = require("../utils/tokenUtils.js");
const dbOrchestrator = require("../db/DatabaseOrchestrator");

// Load public key for verifying JWT (RS256)
const publicKey = fs.readFileSync(
  path.resolve(__dirname, "../keys/public.key"),
  "utf8"
);

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    // Verify token using RS256 algorithm with public key
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: "your-app",
      audience: "your-app-users",
    });

    // Check if token is revoked
    const isRevoked = await checkIfTokenRevoked(token);
    if (isRevoked) {
      res.status(401);
      throw new Error("Token revoked");
    }

    // Get user from database using dbOrchestrator instead of User.findById
    const user = await dbOrchestrator.findOne("User", {
      _id: decoded.sub || decoded.id,
    });

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    // Create User instance and attach to request
    req.user = new User(user);

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401);
    throw new Error("Not authorized");
  }
});

module.exports = { protect };
