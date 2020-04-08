const bodyParser = require("body-parser");
const express = require("express");
const graphQlHttp = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema");
const graphQlResolvers = require("./graphql/resolvers");

async function main() {
  const app = express();

  app.use(bodyParser.json());

  app.use(
    "/graphql",
    graphQlHttp({
      schema: graphQlSchema,
      rootValue: graphQlResolvers,
      graphiql: true,
    })
  );

  await mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-uifhw.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  );

  app.listen(3000);
}

main().catch((err) => {
  console.error(err);
  throw err;
});
