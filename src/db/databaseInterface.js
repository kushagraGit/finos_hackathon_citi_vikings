class DatabaseInterface {
  connect() {
    throw new Error("Method 'connect()' must be implemented.");
  }

  disconnect() {
    throw new Error("Method 'disconnect()' must be implemented.");
  }

  checkHealth() {
    throw new Error("Method 'checkHealth()' must be implemented.");
  }

  create(collection, data) {
    throw new Error("Method 'create()' must be implemented.");
  }

  findById(collection, id) {
    throw new Error("Method 'findById()' must be implemented.");
  }

  updateById(collection, id, updateData) {
    throw new Error("Method 'updateById()' must be implemented.");
  }

  deleteById(collection, id) {
    throw new Error("Method 'deleteById()' must be implemented.");
  }
}

module.exports = DatabaseInterface;
