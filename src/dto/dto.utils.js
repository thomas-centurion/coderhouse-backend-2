export const toId = (value) => value?.toString?.() ?? value;

// Un ObjectId sin populate tiene _bsontype; un documento populado no.
export const isPopulated = (value) =>
  value !== null && typeof value === "object" && !value._bsontype;
