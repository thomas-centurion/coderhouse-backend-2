import { test } from "node:test";
import assert from "node:assert/strict";
import { toTicketDTO } from "../src/dto/ticket.dto.js";

const FAKE_HASH = "$2b$10$abcdefghijklmnopqrstuuFakeHashForTestingOnly0123456789";

const findKey = (value, key) => {
  if (value === null || typeof value !== "object") return false;
  return Object.entries(value).some(([k, v]) => k === key || findKey(v, key));
};

test("toTicketDTO no expone password aunque user y event estén populados", () => {
  const ticket = {
    _id: "6650000000000000000000a1",
    user: {
      _id: "6650000000000000000000b1",
      first_name: "Ana",
      last_name: "Pérez",
      email: "ana@mail.com",
      role: "user",
      password: FAKE_HASH,
    },
    event: {
      _id: "6650000000000000000000c1",
      title: "Concierto",
      date: new Date("2030-01-01T00:00:00.000Z"),
      location: "Buenos Aires",
      organizer: { _id: "6650000000000000000000d1", password: FAKE_HASH },
    },
    status: "confirmed",
    quantity: 2,
    reservationCode: "code-123",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    cancelledAt: null,
  };

  const dto = toTicketDTO(ticket);
  const json = JSON.stringify(dto);

  assert.equal(findKey(dto, "password"), false);
  assert.equal(json.includes(FAKE_HASH), false);
  assert.equal(json.includes("password"), false);
  assert.deepEqual(Object.keys(dto), [
    "id",
    "event",
    "status",
    "quantity",
    "reservationCode",
    "createdAt",
    "cancelledAt",
  ]);
  assert.deepEqual(dto.event, {
    title: "Concierto",
    date: ticket.event.date,
    location: "Buenos Aires",
  });
});
