import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// a single in-memory Mongo instance for the entire test run
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
