import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});