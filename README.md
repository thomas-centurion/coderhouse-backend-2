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
- cookie-parser
- jsonwebtoken
- passport
- MongoDB
- Mongoose
- bcrypt

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

```env
PORT=3000
NODE_ENV=development
MONGO_URL=tu_url_de_mongodb
JWT_SECRET=tu_secreto
JWT_EXPIRES_IN=1h
```

- `PORT`: puerto del servidor.
- `NODE_ENV`: entorno de ejecución.
- `MONGO_URL`: URL de conexión a MongoDB.
- `JWT_SECRET`: secreto utilizado para firmar y verificar JWT.
- `JWT_EXPIRES_IN`: tiempo de validez del JWT, por ejemplo `1h`.

El archivo `.env` contiene información sensible y no debe subirse al repositorio.

## Ejecución

```bash
npm start
```

Por defecto, el servidor utiliza el puerto `3000`. Al iniciar correctamente, establece la conexión con MongoDB y levanta el servidor Express.

## Estructura del proyecto

```text
src/
├── config/
│   ├── database.js
│   ├── passport.config.js
│   └── env.js
├── controllers/
│   ├── events.controller.js
│   ├── health.controller.js
│   └── sessions.controller.js
├── dao/
│   └── users.dao.js
├── middlewares/
│   ├── error.middleware.js
│   └── not-found.middleware.js
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
│   ├── hash.js
│   └── jwt.js
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
| POST | `/api/sessions/login` | Inicia sesión y establece la cookie de autenticación |
| GET | `/api/sessions/current` | Devuelve los datos públicos del usuario autenticado |
| POST | `/api/sessions/logout` | Cierra la sesión y elimina la cookie |

## GET `/api/health`

Comprueba que el servidor se encuentre activo.

**Respuesta:** HTTP `200`

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

## GET `/api/events`

Obtiene la lista de eventos. En esta etapa puede devolver una lista vacía.

**Respuesta:** HTTP `200`

```json
{
  "status": "success",
  "payload": []
}
```

## GET `/api/sessions`

Ruta inicial para el recurso de sesiones. En esta etapa responde con una lista vacía.

## POST `/api/sessions/register`

Registra un nuevo usuario en MongoDB.

**Body esperado:**

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Campos obligatorios:

- `first_name`
- `last_name`
- `email`
- `password`

La contraseña debe tener al menos 6 caracteres.

El email se normaliza eliminando espacios al inicio y al final y convirtiéndolo a minúsculas. Por ejemplo, `" Ana@Mail.com "` se almacena como `"ana@mail.com"`.

La contraseña nunca se almacena en texto plano; se genera un hash mediante `bcrypt` utilizando `src/utils/hash.js`.

Los usuarios registrados reciben el rol `user` por defecto. El campo `role` no puede ser manipulado desde el registro público. Los valores permitidos son:

- `user`
- `organizer`
- `admin`

**Respuesta exitosa:** HTTP `201`

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

Si faltan campos obligatorios, responde HTTP `400`:

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

Un email inválido responde HTTP `400`. Un email ya registrado responde HTTP `409`:

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

## Seguridad

- Las contraseñas se procesan mediante `bcrypt`.
- El registro no devuelve la contraseña ni su hash.
- El campo `role` no puede ser definido por el usuario durante el registro público.
- Las variables sensibles se almacenan mediante variables de entorno.
- `.env` está excluido del repositorio mediante `.gitignore`.

## Arquitectura

El proyecto utiliza una arquitectura por capas:

```text
Route → Controller → Service → Repository → DAO → Model → MongoDB
```

- **Routes:** definen los endpoints y derivan las solicitudes al controller.
- **Controllers:** gestionan las solicitudes y respuestas HTTP.
- **Services:** contienen la lógica de negocio.
- **Repositories:** desacoplan la lógica de negocio del acceso a datos.
- **DAO:** realizan las operaciones sobre los modelos.
- **Models:** representan los documentos de MongoDB mediante Mongoose.
- **Middlewares:** gestionan autenticación, errores y rutas inexistentes.
- **Utils:** contienen funciones reutilizables como hash y JWT.
- **Config:** centraliza variables de entorno y conexión a MongoDB.

El modelo `User` define `first_name`, `last_name`, `email`, `password` y `role`. El modelo `Event` representa la estructura inicial de eventos con `title`, `description` y `date`.

La ruta de health delega la respuesta en `health.controller.js`. Las rutas inexistentes reciben una respuesta JSON 404 mediante `not-found.middleware.js`, registrado después de las rutas y antes del middleware global de errores.

## Pre-entrega 2

Se implementó el registro de usuarios con validaciones, normalización de emails, hash de contraseñas mediante `bcrypt`, persistencia en MongoDB y arquitectura por capas.

## Pre-entrega 3: autenticación con JWT y cookies

### Login

`POST /api/sessions/login` recibe email y contraseña en JSON:

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Con credenciales válidas responde HTTP `200`:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

y establece la cookie `currentUser`.

Usuario inexistente o contraseña incorrecta responde HTTP `401` con:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

No se distinguen ambos casos. Si faltan credenciales, responde HTTP `400`.

### Current

`GET /api/sessions/current` requiere la cookie válida `currentUser`.

**Ejemplo de request:**

```http
GET /api/sessions/current
Cookie: currentUser=<JWT>
```

**Respuesta:** HTTP `200`

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Sin cookie, con token inválido o expirado responde HTTP `401`:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### Logout

`POST /api/sessions/logout` elimina la cookie `currentUser` y no requiere autenticación.

**Ejemplo de request:**

```http
POST /api/sessions/logout
Cookie: currentUser=<JWT>
```

No requiere body.

**Respuesta:** HTTP `200`

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

### Autenticación y variables de entorno

El service valida las credenciales y utiliza `bcrypt` para comparar la contraseña. La lógica de JWT se encuentra en `src/utils/jwt.js`.

El JWT contiene únicamente:

- `id`
- `email`
- `role`

Su expiración se configura mediante `JWT_EXPIRES_IN`.

La cookie `currentUser` utiliza:

- `httpOnly=true`
- `sameSite=lax`
- `maxAge=3600000`
- `secure=true` solamente cuando `NODE_ENV=production`

`/current` valida el token sin consultar MongoDB.

Las variables de entorno utilizadas son `PORT`, `MONGO_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` y `NODE_ENV`. El secreto JWT debe mantenerse privado y `.env` no debe subirse al repositorio.

## Pre-entrega 4: autenticación con Passport

Passport se inicializa en `src/app.js`; las estrategias se registran en `src/config/passport.config.js`, separadas de la configuración de Express:

- `register` delega el alta al service, que valida los datos, normaliza el email, evita duplicados y guarda el hash con bcrypt.
- `login` delega la búsqueda y comparación de contraseña al service. El controller genera el JWT y establece `currentUser` con las opciones de cookie de P3.
- `current` verifica el JWT de la cookie y deja su payload validado en `req.user`; el controller responde con `id`, `email` y `role`.

Las rutas públicas conservan sus paths y respuestas. Logout no utiliza Passport y continúa borrando la cookie. Para agregar proveedores como Google o GitHub, se registra la estrategia correspondiente en `passport.config.js` sin cambiar `app.js`. El service conserva la lógica de negocio y acceso mediante repository; los controllers manejan las respuestas HTTP y la cookie.
