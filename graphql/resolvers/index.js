const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const user = async (userId) => {
  const user = await User.findById(userId);
  return {
    ...user._doc,
    password: null,
    createdEvents: events.bind(this, user._doc.createdEvents),
  };
};

const events = async (eventIds) => {
  const events = await Event.find({ _id: { $in: eventIds } });
  return events.map((event) => ({
    ...event._doc,
    creator: user.bind(this, event._doc.creator.toString()),
  }));
};

module.exports = {
  events: async () => {
    const allEvents = await Event.find();
    return allEvents.map((event) => ({
      ...event._doc,
      date: event._doc.date.toISOString(),
      creator: user.bind(this, event._doc.creator.toString()),
    }));
  },
  createEvent: async (args) => {
    const event = new Event({
      ...args.eventInput,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5e8c94c24b23f5239c394d5b",
    });

    const savedEvent = await event.save();

    const creator = await User.findById("5e8c94c24b23f5239c394d5b");

    if (!creator) {
      throw new Error("Creator does not exist.");
    }

    creator.createdEvents.push(event);

    const savedUser = await creator.save();

    return {
      ...savedEvent._doc,
      creator: {
        ...savedUser._doc,
        password: null,
        createdEvents: events.bind(this, savedUser._doc.createdEvents),
      },
    };
  },
  createUser: async (args) => {
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

    return {
      ...savedUser._doc,
      password: null,
      createdEvents: events.bind(this, savedUser._doc.createdEvents),
    };
  },
};
