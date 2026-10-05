import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  date: { type: String, default: "" },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
