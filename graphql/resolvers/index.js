const { bookings, bookEvent, cancelBooking } = require("./booking");
const { events, createEvent } = require("./events");
const { createUser } = require("./user")

module.exports = {
  events,
  bookings,
  createEvent,
  createUser,
  bookEvent,
  cancelBooking,
};
