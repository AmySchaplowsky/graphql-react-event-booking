const Booking = require("../../models/booking");
const Event = require("../../models/event");

const { transformBooking, transformEvent } = require("./merge");

module.exports = {
    bookings: async () => {
        const allBookings = await Booking.find();

        return allBookings.map(transformBooking);
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

        return transformBooking(result);
    },
    cancelBooking: async (args) => {
        const booking = await Booking.findById(args.bookingId).populate("event");

        if (!booking) {
            throw new Error("Booking does not exist");
        }

        const event = transformEvent(booking.event);
        await Booking.deleteOne({ _id: args.bookingId });

        return event;
    },
};