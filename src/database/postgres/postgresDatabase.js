const { Pool } = require("pg");
const DatabaseInterface = require("../../db/databaseInterface");
const User = require("../../models/user");
const Application = require("../../models/application");

class PostgresDatabase extends DatabaseInterface {
  constructor(uri) {
    super();
    this.uri = uri;
    this.pool = null;
    this.client = null;
    this._models = new Map();
    this._initializeSchemaRegistry();
  }

  _initializeSchemaRegistry() {
    // Register User model
    this.defineSchema(
      "User",
      this._convertMongoSchemaToPostgres(User.getSchema())
    );

    // Register Application model
    this.defineSchema(
      "Application",
      this._convertMongoSchemaToPostgres(Application.getSchema())
    );
  }

  _convertMongoSchemaToPostgres(mongoSchema) {
    const postgresSchema = {};

    // Add id field if not present
    if (!mongoSchema.id) {
      postgresSchema.id = { type: "SERIAL", primary: true };
    }

    for (const [field, def] of Object.entries(mongoSchema)) {
      postgresSchema[field] = this._convertFieldType(def);
    }

    return postgresSchema;
  }

  _convertFieldType(mongoDef) {
    const typeMap = {
      String: "TEXT",
      Number: "NUMERIC",
      Boolean: "BOOLEAN",
      Date: "TIMESTAMP",
      ObjectId: "TEXT",
    };

    let pgType = typeMap[mongoDef.type?.name] || "TEXT";

    // Handle arrays
    if (Array.isArray(mongoDef)) {
      pgType = "JSONB";
    }

    // Handle nested objects
    if (mongoDef.type === Object || typeof mongoDef.type === "object") {
      pgType = "JSONB";
    }

    return {
      type: pgType,
      required: mongoDef.required || false,
      unique: mongoDef.unique || false,
      default: mongoDef.default,
    };
  }

  defineSchema(modelName, schema) {
    this._models.set(modelName.toLowerCase(), {
      schema,
      modelName, // Keep original modelName for reference
    });

    if (this.pool) {
      this._createTableIfNotExists(modelName.toLowerCase(), schema).catch(
        (err) => {
          console.error(`Failed to create table ${modelName}:`, err);
        }
      );
    }
  }

  async connect() {
    try {
      this.pool = new Pool({
        connectionString: this.uri,
      });
      await this.pool.query("SELECT 1");

      for (const [collection, schema] of this._models.entries()) {
        await this._createTableIfNotExists(collection, schema);
      }
    } catch (error) {
      throw new Error(`Failed to connect to PostgreSQL: ${error.message}`);
    }
  }

  async disconnect() {
    await this.pool.end();
  }

  async checkHealth() {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      return false;
    }
  }

  async create(collection, data) {
    const { modelName } = this._models.get(collection.toLowerCase());
    this._validateCollection(collection);
    this._validateData(collection, data);

    const result = await this._executeQuery(
      this._buildInsertQuery(collection, data),
      Object.values(data)
    );

    // Convert to model instance if applicable
    return this._rowToModel(result.rows[0], modelName);
  }

  async findById(collection, id) {
    const { modelName } = this._models.get(collection.toLowerCase());
    const result = await this._executeQuery(
      `SELECT * FROM ${collection.toLowerCase()} WHERE id = $1`,
      [id]
    );

    return this._rowToModel(result.rows[0], modelName);
  }

  _rowToModel(row, modelName) {
    if (!row) return null;

    switch (modelName) {
      case "User":
        return new User(row);
      case "Application":
        return new Application(row);
      default:
        return row;
    }
  }

  _buildInsertQuery(collection, data) {
    const columns = Object.keys(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`);

    return `
      INSERT INTO ${collection.toLowerCase()} (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `;
  }

  async _createTableIfNotExists(collection, schema) {
    const columns = Object.entries(schema)
      .map(([key, def]) => {
        const constraints = [];

        if (def.primary) constraints.push("PRIMARY KEY");
        if (def.required) constraints.push("NOT NULL");
        if (def.unique) constraints.push("UNIQUE");
        if (def.default !== undefined) {
          constraints.push(
            `DEFAULT ${
              typeof def.default === "string" ? `'${def.default}'` : def.default
            }`
          );
        }

        return `${key} ${def.type} ${constraints.join(" ")}`;
      })
      .join(", ");

    const query = `
      CREATE TABLE IF NOT EXISTS ${collection} (
        ${columns}
      )
    `;

    await this._executeQuery(query);
  }

  async _executeQuery(query, values = []) {
    try {
      if (this.client) {
        return await this.client.query(query, values);
      }
      return await this.pool.query(query, values);
    } catch (error) {
      // Enhance error messages
      const enhancedError = new Error(
        `Database query failed: ${error.message}`
      );
      enhancedError.code = error.code;
      enhancedError.query = query;
      enhancedError.values = values;
      throw enhancedError;
    }
  }

  _buildWhereClause(query) {
    if (Object.keys(query).length === 0) {
      return { whereClause: "", values: [] };
    }

    const conditions = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(query)) {
      conditions.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    return {
      whereClause: `WHERE ${conditions.join(" AND ")}`,
      values,
    };
  }

  _buildSetClause(updateData) {
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = `SET ${columns
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ")}`;

    return {
      setClause,
      values,
    };
  }

  _buildProjectionClause(projection) {
    if (Object.keys(projection).length === 0) {
      return "*";
    }
    return Object.entries(projection)
      .filter(([_, include]) => include)
      .map(([field]) => field)
      .join(", ");
  }

  _validateCollection(collection) {
    if (!this._models.has(collection.toLowerCase())) {
      throw new Error(
        `Collection '${collection}' is not defined in the schema registry`
      );
    }
  }

  _validateData(collection, data) {
    const { schema } = this._models.get(collection.toLowerCase());

    for (const [field, def] of Object.entries(schema)) {
      if (def.required && data[field] === undefined && !def.default) {
        throw new Error(
          `Field '${field}' is required for collection '${collection}'`
        );
      }
    }
  }

  async aggregate(collection, pipeline) {
    throw new Error(
      "Aggregation pipeline not directly supported in PostgreSQL. Use raw SQL instead."
    );
  }

  async count(collection, query = {}) {
    const { whereClause, values } = this._buildWhereClause(query);

    const sqlQuery = `
      SELECT COUNT(*) as count FROM ${collection}
      ${whereClause}
    `;

    const result = await this._executeQuery(sqlQuery, values);
    return parseInt(result.rows[0].count);
  }

  async startTransaction() {
    this.client = await this.pool.connect();
    await this.client.query("BEGIN");
    return this.client;
  }

  async commitTransaction() {
    if (this.client) {
      await this.client.query("COMMIT");
      this.client.release();
      this.client = null;
    }
  }

  async abortTransaction() {
    if (this.client) {
      await this.client.query("ROLLBACK");
      this.client.release();
      this.client = null;
    }
  }

  async updateById(collection, id, updateData) {
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(", ");

    const query = `
      UPDATE ${collection}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this._executeQuery(query, [id, ...values]);
    return result.rows[0];
  }

  async deleteById(collection, id) {
    const query = `
      DELETE FROM ${collection}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this._executeQuery(query, [id]);
    return result.rows[0];
  }

  async findOne(collection, query, projection = {}) {
    const { whereClause, values } = this._buildWhereClause(query);
    const projectionClause = this._buildProjectionClause(projection);

    const sqlQuery = `
      SELECT ${projectionClause} FROM ${collection}
      ${whereClause}
      LIMIT 1
    `;

    const result = await this._executeQuery(sqlQuery, values);
    return result.rows[0];
  }

  async find(collection, query = {}, projection = {}) {
    const { whereClause, values } = this._buildWhereClause(query);
    const projectionClause = this._buildProjectionClause(projection);

    const sqlQuery = `
      SELECT ${projectionClause} FROM ${collection}
      ${whereClause}
    `;

    const result = await this._executeQuery(sqlQuery, values);
    return result.rows;
  }

  async findOneAndUpdate(collection, query, updateData, options = {}) {
    const { whereClause, values: whereValues } = this._buildWhereClause(query);
    const { setClause, values: updateValues } =
      this._buildSetClause(updateData);

    const sqlQuery = `
      UPDATE ${collection}
      ${setClause}
      ${whereClause}
      RETURNING *
    `;

    const result = await this._executeQuery(sqlQuery, [
      ...updateValues,
      ...whereValues,
    ]);
    return result.rows[0];
  }

  async findOneAndDelete(collection, query) {
    const { whereClause, values } = this._buildWhereClause(query);

    const sqlQuery = `
      DELETE FROM ${collection}
      ${whereClause}
      RETURNING *
    `;

    const result = await this._executeQuery(sqlQuery, values);
    return result.rows[0];
  }

  async insertMany(collection, documents) {
    if (!documents.length) return [];

    const columns = Object.keys(documents[0]);
    const values = documents.map((doc) => Object.values(doc));
    const placeholders = values
      .map(
        (row, i) =>
          `(${row.map((_, j) => `$${i * row.length + j + 1}`).join(", ")})`
      )
      .join(", ");

    const query = `
      INSERT INTO ${collection} (${columns.join(", ")})
      VALUES ${placeholders}
      RETURNING *
    `;

    const result = await this._executeQuery(query, values.flat());
    return result.rows;
  }

  async updateMany(collection, query, updateData) {
    const { whereClause, values: whereValues } = this._buildWhereClause(query);
    const { setClause, values: updateValues } =
      this._buildSetClause(updateData);

    const sqlQuery = `
      UPDATE ${collection}
      ${setClause}
      ${whereClause}
      RETURNING *
    `;

    const result = await this._executeQuery(sqlQuery, [
      ...updateValues,
      ...whereValues,
    ]);
    return result.rows;
  }

  async deleteMany(collection, query) {
    const { whereClause, values } = this._buildWhereClause(query);

    const sqlQuery = `
      DELETE FROM ${collection}
      ${whereClause}
      RETURNING *
    `;

    const result = await this._executeQuery(sqlQuery, values);
    return result.rows;
  }
}

module.exports = PostgresDatabase;
