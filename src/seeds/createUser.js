const User = require("../models/user");

const createInitialUser = async () => {
  const me = new User({
    name: "Vishal Asthana",
    email: "vishal.paypal@gmail.com",
    password: "Test@1234",
    age: 26,
  });

  try {
    const result = await me.save();
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createInitialUser };
