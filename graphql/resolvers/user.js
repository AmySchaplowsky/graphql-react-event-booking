const bcrypt = require("bcryptjs");

const User = require("../../models/user");

const { transformUser } = require("./merge");

module.exports = {
  createUser: async (args) => {
    try {
      const foundUser = await User.findOne({ email: args.userInput.email });
      if (foundUser) {
        throw new Error("User exists already.");
      }

      const encryptedPassword = await bcrypt.hash(args.userInput.password, 12);

      const newUser = new User({
        ...args.userInput,
        password: encryptedPassword,
      });

      const savedUser = await newUser.save();

      return transformUser(savedUser);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
