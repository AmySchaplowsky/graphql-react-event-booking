const { dateToString } = require("../../helpers/date");
const Event = require("../../models/event");
const User = require("../../models/user");

const user = async (userId) => {
  const user = await User.findById(userId);
  return transformUser(user);
};

const events = async (eventIds) => {
  const events = await Event.find({ _id: { $in: eventIds } });
  return events.map(transformEvent);
};

const singleEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  return transformEvent(event);
};

const transformEvent = (event) => ({
  ...event._doc,
  date: dateToString(event._doc.date),
  creator: user.bind(this, event._doc.creator.toString()),
});

const transformUser = (user) => ({
  ...user._doc,
  password: null,
  createdEvents: events.bind(this, user._doc.createdEvents),
});

const transformBooking = (booking) => ({
  ...booking._doc,
  user: user.bind(this, booking._doc.user),
  event: singleEvent.bind(this, booking._doc.event),
  createdAt: dateToString(booking._doc.createdAt),
  updatedAt: dateToString(booking._doc.updatedAt),
});

module.exports = {
  transformEvent,
  transformUser,
  transformBooking,
};
