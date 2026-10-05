import nodemailer from "nodemailer";
import env from "./env.js";

let transporter;

const getTransporter = () => {
  const requiredValues = [
    env.MAIL_HOST,
    env.MAIL_PORT,
    env.MAIL_USER,
    env.MAIL_PASS,
    env.MAIL_FROM,
  ];

  if (requiredValues.some((value) => !value)) {
    throw new Error("La configuración de correo está incompleta");
  }

  const port = Number(env.MAIL_PORT);
  if (!Number.isInteger(port) || port < 1) {
    throw new Error("MAIL_PORT debe ser un entero positivo");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port,
      secure: port === 465,
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
    });
  }

  return transporter;
};

const sendMail = async ({ to, subject, text }) =>
  getTransporter().sendMail({ from: env.MAIL_FROM, to, subject, text });

export default { sendMail };
