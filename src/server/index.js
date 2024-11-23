const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const configureRoutes = require("../routes");

class Server {
  constructor(env) {
    this.app = express();
    this.env = env;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // View engine setup
    this.app.set("views", path.join(__dirname, "../frontend/views"));
    this.app.set("view engine", "ejs");
    this.app.use(expressLayouts);

    // CORS configuration
    const corsOptions = {
      origin: this.env.isDevelopment()
        ? ["http://localhost:3000", "http://localhost:3001"]
        : ["https://yourdomain.com"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      maxAge: 86400,
    };

    // Apply middleware
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, "../frontend/public")));

    // Setup Swagger
    require("../config/swagger")(this.app);
  }

  setupRoutes() {
    configureRoutes(this.app);
  }

  start(port) {
    return new Promise((resolve) => {
      const server = this.app.listen(port, () => {
        console.log(
          `Server is running on port ${port} in ${this.env.NODE_ENV} mode`
        );
        resolve(server);
      });
    });
  }
}

module.exports = Server;
