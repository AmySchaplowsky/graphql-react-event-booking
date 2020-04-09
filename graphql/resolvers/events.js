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
  createEvent: async (args) => {
    try {
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
        ...transformEvent(savedEvent),
        creator: transformUser(savedUser),
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
