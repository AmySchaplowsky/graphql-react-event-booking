const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

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

const singleEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  return {
    ...event._doc,
    creator: user.bind(this, event._doc.creator.toString()),
  };
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
  bookings: async () => {
    const allBookings = await Booking.find();

    return allBookings.map((b) => ({
      ...b._doc,
      user: user.bind(this, b._doc.user),
      event: singleEvent.bind(this, b._doc.event),
      createdAt: new Date(b._doc.createdAt).toISOString(),
      updatedAt: new Date(b._doc.updatedAt).toISOString(),
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
  bookEvent: async (args) => {
    const foundEvent = await Event.findOne({ _id: args.eventId });

    if (!foundEvent) {
      throw new Error("Event does not exist");
    }

    const newBooking = new Booking({
      user: "5e8c94c24b23f5239c394d5b",
      event: foundEvent._doc._id.toString(),
    });

    const result = await newBooking.save();

    return {
      ...result._doc,
      user: user.bind(this, result._doc.user.toString()),
      event: singleEvent.bind(this, result._doc.event.toString()),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    };
  },
  cancelBooking: async (args) => {
    const booking = await Booking.findById(args.bookingId).populate("event");
    const event = {
      ...booking._doc.event._doc,
      date: booking._doc.event.date.toISOString(),
      creator: user.bind(this, booking._doc.event.creator.toString()),
    };
    await Booking.deleteOne({ _id: args.bookingId });

    return event;
  },
};
