import express from "express";
import { ApolloServer } from "@apollo/server";
import { mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressjwt } from "express-jwt";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import pkg from "body-parser";
import { log } from "console";
const { json } = pkg;

import permissions from "./schema/permissions.js";

import { authDefs } from "./schema/type-defs/auth.js";
import { userDefs } from "./schema/type-defs/user.js";

import { auth } from "./schema/resolvers/auth.js";
import { user } from "./schema/resolvers/user.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

app.use(
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: false,
    requestProperty: "auth",
  })
);

/* GraphQL SETUP */
const httpServer = http.createServer(app);

const resolvers = [auth, user]; // group all resolver files

const GraphQLServer = async () => {
  // Create the schema using makeExecutableSchema
  const schema = makeExecutableSchema({
    typeDefs: [authDefs, userDefs], // Combine typeDefs
    resolvers: mergeResolvers(resolvers), // Merge resolvers
  });

  const server = new ApolloServer({
    schema: applyMiddleware(schema, permissions),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = req.auth || null;
        return { user };
      },
    })
  );
};
GraphQLServer();

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    httpServer.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
