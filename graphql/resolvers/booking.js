const Booking = require("../../models/booking");
const Event = require("../../models/event");

const { transformBooking, transformEvent } = require("./merge");

module.exports = {
  bookings: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated");
      }

      const allBookings = await Booking.find();

      return allBookings.map(transformBooking);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  bookEvent: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated");
      }

      const foundEvent = await Event.findOne({ _id: args.eventId });

      if (!foundEvent) {
        throw new Error("Event does not exist");
      }

      const newBooking = new Booking({
        user: req.userId,
        event: foundEvent._doc._id.toString(),
      });

      const result = await newBooking.save();

      return transformBooking(result);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  cancelBooking: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated");
      }

      const booking = await Booking.findById(args.bookingId).populate("event");

      if (!booking) {
        throw new Error("Booking does not exist");
      }

      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
