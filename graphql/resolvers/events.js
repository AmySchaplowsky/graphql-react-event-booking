const Event = require("../../models/event");
const User = require("../../models/user");

const { transformEvent, transformUser } = require("./merge");

module.exports = {
  events: async () => {
    try {
      const allEvents = await Event.find();
      return allEvents.map(transformEvent);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  createEvent: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated");
      }

      const event = new Event({
        ...args.eventInput,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: req.userId,
      });

      const savedEvent = await event.save();

      const creator = await User.findById(req.userId);

      if (!creator) {
        throw new Error("Creator does not exist.");
      }

      creator.createdEvents.push(event);

      const savedUser = await creator.save();

      return {
        ...transformEvent(savedEvent),
        creator: transformUser(savedUser),
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
