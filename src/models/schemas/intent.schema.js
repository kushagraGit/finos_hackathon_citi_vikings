/**
 * @swagger
 * components:
 *   schemas:
 *     Intent:
 *       type: object
 *       description: An intent definition
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the intent
 *           example: "ViewChart"
 *         displayName:
 *           type: string
 *           description: An optional display name for the intent
 *           example: "View Trading Chart"
 *         contexts:
 *           type: array
 *           items:
 *             type: string
 *           description: The contexts the intent accepts (typically namespaced context types)
 *           example: ["org.fdc3.instrument", "org.symphony.contact"]
 *         customConfig:
 *           type: object
 *           description: Custom configuration for the intent required by a particular desktop agent
 *           example: { "agent": "symphony", "version": "2.0" }
 */
