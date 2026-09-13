# Plataforma de Eventos

## Tema elegido

Plataforma de gestión de eventos.

## Tecnologías

- Node.js
- Express
- JavaScript
- ESM
- dotenv

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install

## Registro de usuarios

**POST `/api/sessions/register`**

Registra un nuevo usuario en MongoDB.

Body esperado:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}