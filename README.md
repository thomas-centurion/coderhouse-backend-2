# Plataforma de Eventos

## Tema elegido

Plataforma de gestión de eventos e inscripciones.

El proyecto consiste en una API REST para gestionar usuarios y eventos, que se irá ampliando progresivamente durante las distintas entregas del curso.

## Tecnologías

- Node.js
- Express
- JavaScript
- ESM (ECMAScript Modules)
- dotenv
- MongoDB
- Mongoose
- bcrypt

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`.

El archivo `.env` debe contener las siguientes variables:

```env
PORT=3000
NODE_ENV=development
MONGO_URL=tu_url_de_mongodb
JWT_SECRET=tu_secreto
```

### Descripción de las variables

- `PORT`: puerto en el que se ejecutará el servidor.
- `NODE_ENV`: entorno de ejecución de la aplicación.
- `MONGO_URL`: URL de conexión a la base de datos MongoDB.
- `JWT_SECRET`: clave que será utilizada en las próximas etapas para la autenticación mediante JWT.

El archivo `.env` contiene información sensible y no debe subirse al repositorio.

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

Por defecto, el servidor utiliza el puerto `3000`.

Al iniciar correctamente, la aplicación establece la conexión con MongoDB y levanta el servidor Express.

## Estructura del proyecto

```text
src/
├── config/
│   ├── database.js
│   └── env.js
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
├── dao/
│   └── users.dao.js
├── middlewares/
│   └── error.middleware.js
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── health.router.js
│   └── sessions.router.js
├── services/
│   └── sessions.service.js
├── utils/
│   └── hash.js
├── app.js
└── server.js
```

## Endpoints disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Comprueba que el servidor esté activo |
| GET | `/api/events` | Obtiene la lista de eventos |
| GET | `/api/sessions` | Ruta inicial para el recurso de sesiones |
| POST | `/api/sessions/register` | Registra un nuevo usuario |

## GET `/api/health`

Comprueba que el servidor se encuentre activo.

### Respuesta

HTTP `200`

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

## GET `/api/events`

Obtiene la lista de eventos.

En esta etapa puede devolver una lista vacía.

### Respuesta

HTTP `200`

```json
{
  "status": "success",
  "payload": []
}
```

## GET `/api/sessions`

Ruta inicial para el recurso de sesiones.

Esta ruta forma parte de la estructura inicial del recurso de sesiones y será ampliada en próximas entregas con funcionalidades de autenticación.

## POST `/api/sessions/register`

Registra un nuevo usuario en MongoDB.

### Body esperado

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

### Campos obligatorios

- `first_name`
- `last_name`
- `email`
- `password`

La contraseña debe tener al menos 6 caracteres.

### Normalización del email

Antes de guardar el usuario, el email es:

1. Eliminado de espacios al inicio y al final.
2. Convertido a minúsculas.

Por ejemplo:

```text
" Ana@Mail.com "
```

se almacena como:

```text
"ana@mail.com"
```

### Contraseña

La contraseña nunca se almacena en texto plano.

Antes de persistirse en MongoDB se genera un hash utilizando `bcrypt`.

La lógica de hash se encuentra en:

```text
src/utils/hash.js
```

### Rol

Los usuarios registrados mediante este endpoint reciben el rol:

```text
user
```

por defecto.

El campo `role` no puede ser manipulado desde el body del registro público.

Los valores permitidos para el campo son:

- `user`
- `organizer`
- `admin`

### Respuesta exitosa

HTTP `201`

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña no se incluye en la respuesta, ni en texto plano ni en su versión hasheada.

### Campos faltantes

Si faltan campos obligatorios, la API responde con HTTP `400`.

Ejemplo:

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

### Email inválido

Si el email no tiene un formato válido, la API responde con HTTP `400`.

### Email duplicado

Si el email ya se encuentra registrado, la API responde con HTTP `409`.

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

## Seguridad

Las contraseñas nunca se almacenan en texto plano.

Antes de persistirse en MongoDB son procesadas mediante `bcrypt`.

Además:

- El endpoint de registro no devuelve la contraseña.
- El endpoint de registro tampoco devuelve el hash de la contraseña.
- El campo `role` no puede ser definido por el usuario durante el registro público.
- Las variables sensibles se almacenan mediante variables de entorno.
- El archivo `.env` se encuentra excluido del repositorio mediante `.gitignore`.

## Arquitectura

El proyecto utiliza una arquitectura por capas para separar responsabilidades y facilitar el mantenimiento y crecimiento de la aplicación.

El flujo principal del registro de usuarios es:

```text
Cliente
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
DAO
   ↓
Model
   ↓
MongoDB
```

### Routes

Las rutas definen los endpoints disponibles y reciben las solicitudes HTTP.

Se encuentran en:

```text
src/routes/
```

Actualmente se utilizan:

- `health.router.js`
- `events.router.js`
- `sessions.router.js`

Las rutas no contienen lógica de negocio. Su responsabilidad principal es dirigir las solicitudes hacia el controller correspondiente.

### Controllers

Los controllers reciben las solicitudes provenientes de las rutas y se encargan de coordinar la respuesta HTTP.

Se encuentran en:

```text
src/controllers/
```

Actualmente se utilizan:

- `events.controller.js`
- `sessions.controller.js`

Por ejemplo, `sessions.controller.js` recibe los datos enviados al endpoint de registro y delega la lógica al service.

### Services

Los services contienen la lógica de negocio de la aplicación.

Se encuentran en:

```text
src/services/
```

En esta entrega, `sessions.service.js` se encarga de:

- validar los datos recibidos;
- validar el formato del email;
- normalizar el email;
- verificar si el usuario ya existe;
- generar el hash de la contraseña;
- solicitar la creación del usuario al repository.

### Repositories

Los repositories desacoplan la lógica de negocio del acceso a los datos.

Se encuentran en:

```text
src/repositories/
```

En esta entrega, `users.repository.js` se encarga de trabajar con el DAO para realizar las operaciones relacionadas con los usuarios.

### DAO

La capa DAO contiene las operaciones de acceso directo a los modelos de datos.

Se encuentra en:

```text
src/dao/
```

En esta entrega, `users.dao.js` utiliza el modelo `User` para consultar y persistir usuarios en MongoDB.

### Models

Los modelos representan la estructura de los documentos almacenados en MongoDB mediante Mongoose.

Se encuentran en:

```text
src/models/
```

El modelo `User` define los siguientes campos:

- `first_name`
- `last_name`
- `email`
- `password`
- `role`

El campo `role` utiliza `user` como valor por defecto y permite los valores:

- `user`
- `organizer`
- `admin`

El modelo `Event` representa la estructura inicial del recurso de eventos.

### Utils

La carpeta `utils` contiene funciones reutilizables que no pertenecen directamente a una capa específica de negocio.

Se encuentra en:

```text
src/utils/
```

En esta entrega, `hash.js` contiene la función reutilizable encargada de generar hashes de contraseñas mediante `bcrypt`.

### Config

La configuración de la aplicación se encuentra en:

```text
src/config/
```

`env.js` centraliza la lectura de las variables de entorno utilizadas por la aplicación.

`database.js` contiene la lógica necesaria para establecer la conexión con MongoDB mediante Mongoose.

### Middlewares

Los middlewares permiten ejecutar lógica intermedia durante el procesamiento de las solicitudes.

Se encuentran en:

```text
src/middlewares/
```

En esta entrega se utiliza `error.middleware.js` para centralizar el manejo de errores de la aplicación.

Los errores generados durante el procesamiento de las solicitudes son delegados al middleware global de Express.

### App y Server

`app.js` se encarga de configurar Express, registrar los middlewares y montar las rutas de la aplicación.

`server.js` se encarga de iniciar el servidor, establecer la conexión con MongoDB y utilizar el puerto configurado mediante variables de entorno.

Esta separación permite mantener independiente la configuración de Express del proceso de inicio del servidor.

## Pre-entrega 2

Esta entrega incorpora el primer flujo real de usuarios de la Plataforma de Eventos e Inscripciones.

Se implementaron:

- Registro de usuarios.
- Validación de datos.
- Validación del formato del email.
- Normalización de emails.
- Prevención de usuarios duplicados.
- Hash de contraseñas con `bcrypt`.
- Persistencia de usuarios en MongoDB mediante Mongoose.
- Rol `user` por defecto.
- Protección del campo `role` durante el registro público.
- Separación de responsabilidades mediante Route, Controller, Service, Repository, DAO y Model.
- Helper reutilizable para el hash de contraseñas.
- Manejo centralizado de errores mediante middleware.
- Configuración mediante variables de entorno.