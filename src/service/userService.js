const dbOrchestrator = require("../db/DatabaseOrchestrator");

class UserService {
  constructor() {
    this.dbInstance = dbOrchestrator.getInstance();
  }

  async createUser(userData) {
    try {
      const user = await this.dbInstance.create("User", userData);
      return user;
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  }

  async getUserById(userId) {
    try {
      const user = await this.dbInstance.findById("User", userId);
      return user;
    } catch (error) {
      throw new Error("Error fetching user: " + error.message);
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await this.dbInstance.updateById("User", userId, updateData);
      return user;
    } catch (error) {
      throw new Error("Error updating user: " + error.message);
    }
  }

  async deleteUser(userId) {
    try {
      await this.dbInstance.deleteById("User", userId);
    } catch (error) {
      throw new Error("Error deleting user: " + error.message);
    }
  }
}

module.exports = new UserService();
