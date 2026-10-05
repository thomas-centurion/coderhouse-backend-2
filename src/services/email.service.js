import mailer from "../config/mailer.js";

const sendTicketConfirmation = async ({ to, eventTitle, date, location, quantity, reservationCode }) => {
  const eventDate = new Date(date).toISOString();

  return mailer.sendMail({
    to,
    subject: `Inscripción confirmada: ${eventTitle}`,
    text: [
      "Tu inscripción fue confirmada.",
      `Evento: ${eventTitle}`,
      `Fecha: ${eventDate}`,
      `Ubicación: ${location}`,
      `Cantidad: ${quantity}`,
      `Código de reserva: ${reservationCode}`,
    ].join("\n"),
  });
};

export default { sendTicketConfirmation };
