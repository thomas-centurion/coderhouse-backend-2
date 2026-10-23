import connectDB from "../src/config/database.js";
import usersRepository from "../src/repositories/users.repository.js";
import { hashPassword } from "../src/utils/hash.js";

// Usuarios de prueba, uno por rol. Solo para desarrollo.
const TEST_PASSWORD = "Test1234";

const testUsers = [
  { first_name: "Usuario", last_name: "Prueba", email: "user@test.com", role: "user" },
  { first_name: "Organizador", last_name: "Prueba", email: "organizer@test.com", role: "organizer" },
  { first_name: "Admin", last_name: "Prueba", email: "admin@test.com", role: "admin" },
];

const seed = async () => {
  await connectDB();
  const password = await hashPassword(TEST_PASSWORD);

  for (const user of testUsers) {
    if (await usersRepository.findByEmail(user.email)) {
      console.log(`Ya existe: ${user.email}`);
      continue;
    }
    await usersRepository.createUser({ ...user, password });
    console.log(`Creado: ${user.email} (${user.role})`);
  }
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error al crear los usuarios de prueba:", error.message);
    process.exit(1);
  });
