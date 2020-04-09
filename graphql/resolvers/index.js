const bookingResolver = require("./booking");
const eventsResolver = require("./events");
const userResolver = require("./user");

module.exports = {
  ...bookingResolver,
  ...eventsResolver,
  ...userResolver,
};
