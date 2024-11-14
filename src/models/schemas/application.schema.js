/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       required:
 *         - appId
 *         - title
 *       properties:
 *         appId:
 *           type: string
 *           description: Unique identifier for the application
 *           example: "app-123"
 *         title:
 *           type: string
 *           description: Application title
 *           example: "Trading App"
 *         description:
 *           type: string
 *           description: Detailed description of the application
 *           example: "A powerful trading application"
 *         version:
 *           type: string
 *           description: Application version
 *           pattern: "^\\d+\\.\\d+\\.\\d+$"
 *           example: "1.0.0"
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Categories the application belongs to
 *           example: ["Trading", "Finance"]
 *         icons:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               src:
 *                 type: string
 *                 format: uri
 *                 description: URL to the icon
 *                 example: "https://example.com/icon.png"
 *               size:
 *                 type: string
 *                 description: Icon size (e.g., '16x16', '32x32')
 *                 example: "32x32"
 *         screenshots:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               src:
 *                 type: string
 *                 format: uri
 *                 description: URL to the screenshot
 *                 example: "https://example.com/screenshot.png"
 *               label:
 *                 type: string
 *                 description: Screenshot description
 *                 example: "Main trading view"
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Contact email for the application
 *           example: "contact@tradingapp.com"
 *         supportEmail:
 *           type: string
 *           format: email
 *           description: Support email for the application
 *           example: "support@tradingapp.com"
 *         moreInfo:
 *           type: string
 *           format: uri
 *           description: Additional information URL
 *           example: "https://tradingapp.com/info"
 *         publisher:
 *           type: string
 *           description: Application publisher name
 *           example: "Trading Solutions Inc."
 *         details:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *               description: Application URL
 *               example: "https://tradingapp.com"
 */
