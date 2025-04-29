import mongoose, { Schema } from "mongoose";

it("writes & reads a document in the in-memory Mongo", async () => {
  const Cat = mongoose.model("Cat", new Schema({ name: String }));
  await Cat.create({ name: "Zildjian" });

  const count = await Cat.countDocuments();
  expect(count).toBe(1);
});
