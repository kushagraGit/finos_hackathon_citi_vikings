const { connectMongoDB } = require("../database/mongo");
const Application = require("../models/application");

const DEFAULT_APPLICATIONS = [
  {
    appId: "fdc3-workbench",
    title: "FDC3 Workbench",
    description: "A development and testing tool for FDC3 applications",
    version: "1.0.0",
    categories: ["DEVELOPER_TOOLS", "TESTING"],
    icons: [
      {
        src: "https://fdc3.finos.org/toolbox/fdc3-workbench/icon-32x32.png",
        size: "32x32",
      },
      {
        src: "https://fdc3.finos.org/toolbox/fdc3-workbench/icon-64x64.png",
        size: "64x64",
      },
    ],
    screenshots: [
      {
        src: "https://fdc3.finos.org/toolbox/fdc3-workbench/screenshot1.png",
        label: "Main Interface",
      },
    ],
    contactEmail: "fdc3-maintainers@finos.org",
    supportEmail: "fdc3-support@finos.org",
    publisher: "FINOS",
    moreInfo: "https://fdc3.finos.org/toolbox/fdc3-workbench",
    details: {
      url: "https://fdc3.finos.org/toolbox/fdc3-workbench/app",
    },
  },
  {
    appId: "trading-view",
    title: "Trading View",
    description: "Advanced financial visualization and trading platform",
    version: "2.1.0",
    categories: ["TRADING", "ANALYTICS"],
    icons: [
      {
        src: "https://example.com/trading-view/icon-32x32.png",
        size: "32x32",
      },
    ],
    screenshots: [
      {
        src: "https://example.com/trading-view/screenshot1.png",
        label: "Trading Dashboard",
      },
    ],
    contactEmail: "contact@tradingview.com",
    supportEmail: "support@tradingview.com",
    publisher: "Trading View Inc",
    moreInfo: "https://www.tradingview.com/about",
    details: {
      url: "https://www.tradingview.com",
    },
  },
  {
    appId: "market-data",
    title: "Market Data Terminal",
    description: "Real-time market data and analytics platform",
    version: "1.5.0",
    categories: ["MARKET_DATA", "ANALYTICS"],
    icons: [
      {
        src: "https://example.com/market-data/icon-32x32.png",
        size: "32x32",
      },
    ],
    screenshots: [
      {
        src: "https://example.com/market-data/screenshot1.png",
        label: "Market Overview",
      },
    ],
    contactEmail: "contact@marketdata.com",
    supportEmail: "support@marketdata.com",
    publisher: "Market Data Solutions",
    moreInfo: "https://www.marketdata.com/info",
    details: {
      url: "https://www.marketdata.com",
    },
  },
];

const createInitialApplications = async () => {
  try {
    const results = await Promise.all(
      DEFAULT_APPLICATIONS.map(async (appData) => {
        const existingApp = await Application.findOne({ appId: appData.appId });
        if (!existingApp) {
          const app = new Application(appData);
          await app.save();
          return `Application created: ${appData.appId}`;
        }
        return `Application already exists: ${appData.appId}`;
      })
    );

    console.log("Application initialization results:", results);
    return results;
  } catch (error) {
    console.error("Application initialization error:", error.message);
    throw error;
  }
};

// This function is used when running the seed script directly
const runSeed = async () => {
  console.log("Starting application initialization process...");
  try {
    await connectMongoDB();
    console.log("Connected to MongoDB");

    await createInitialApplications();
    console.log("Application initialization completed successfully");

    // Disconnect from MongoDB
    process.exit(0);
  } catch (error) {
    console.error("Failed to initialize applications:", error.message);
    process.exit(1);
  }
};

// Only run if file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { createInitialApplications, DEFAULT_APPLICATIONS };
