const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User does not exist");
    }

    const areEqual = await bcrypt.compare(password, user.password);

    if (!areEqual) {
      throw new Error("Password is incorrect");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      "somesupersecretkey",
      {
        expiresIn: "1h",
      }
    );

    return {
      userId: user.id,
      token,
      tokenExpiration: 1,
    };
  },
};
