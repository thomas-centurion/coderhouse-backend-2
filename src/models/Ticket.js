import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  status: {
    type: String,
    enum: ["confirmed", "pending", "cancelled"],
    default: "confirmed",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => Number.isFinite(value) && value > 0,
      message: "quantity debe ser un número mayor que 0",
    },
  },
  reservationCode: {
    type: String,
    required: true,
    unique: true,
    default: randomUUID,
  },
  createdAt: { type: Date, default: Date.now, required: true },
  cancelledAt: { type: Date, default: null },
});

ticketSchema.index({ event: 1, status: 1 });
ticketSchema.index(
  { user: 1, event: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } },
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
