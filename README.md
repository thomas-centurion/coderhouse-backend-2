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
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` y `MAIL_FROM`: configuración SMTP para los emails de confirmación de tickets.

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
│   ├── mailer.js
│   ├── passport.config.js
│   └── env.js
├── controllers/
│   ├── events.controller.js
│   ├── health.controller.js
│   ├── sessions.controller.js
│   ├── tickets.controller.js
│   └── users.controller.js
├── dao/
│   ├── events.dao.js
│   ├── tickets.dao.js
│   └── users.dao.js
├── dto/
│   ├── dto.utils.js
│   ├── event.dto.js
│   ├── ticket.dto.js
│   └── user.dto.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   ├── error.middleware.js
│   └── not-found.middleware.js
├── models/
│   ├── Event.js
│   ├── Ticket.js
│   └── User.js
├── repositories/
│   ├── events.repository.js
│   ├── tickets.repository.js
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── health.router.js
│   ├── sessions.router.js
│   ├── tickets.router.js
│   └── users.router.js
├── services/
│   ├── events.service.js
│   ├── email.service.js
│   ├── sessions.service.js
│   ├── tickets.service.js
│   └── users.service.js
├── utils/
│   ├── errors.js
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
| GET | `/api/events/:id` | Obtiene un evento por ID |
| POST | `/api/events` | Crea un evento (organizer/admin) |
| PUT | `/api/events/:id` | Modifica un evento propio (organizer) o cualquiera (admin) |
| PATCH | `/api/events/:id` | Modifica un evento propio (organizer) o cualquiera (admin) |
| PATCH | `/api/events/:id/status` | Cambia el estado del evento (organizer/admin propietario o admin) |
| DELETE | `/api/events/:id` | Cancela un evento propio (organizer) o cualquiera (admin) |
| POST | `/api/events/:eid/tickets` | Crea una inscripción (autenticado) |
| GET | `/api/tickets/my-tickets` | Lista las inscripciones propias (autenticado) |
| GET | `/api/events/:eid/tickets` | Lista tickets del evento (organizer propietario o admin) |
| PATCH | `/api/tickets/:tid/cancel` | Cancela un ticket propio o cualquiera como admin |
| GET | `/api/sessions` | Ruta inicial para el recurso de sesiones |
| POST | `/api/sessions/register` | Registra un nuevo usuario |
| POST | `/api/sessions/login` | Inicia sesión y establece la cookie de autenticación |
| GET | `/api/sessions/current` | Devuelve los datos públicos del usuario autenticado |
| POST | `/api/sessions/logout` | Cierra la sesión y elimina la cookie |
| GET | `/api/users` | Lista usuarios (solo admin; sin contraseñas) |

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

El endpoint es público. Por defecto devuelve solamente eventos `published`; si se envía `status`, permite solicitar explícitamente `draft`, `published`, `cancelled` o `finished`. También admite los filtros `category`, `location`, `dateFrom` y `dateTo`, además de `page` (1 por defecto), `limit` (10 por defecto) y `sort=date` (ascendente) o `sort=-date` (descendente). La respuesta incluye `payload.data`, `page`, `limit`, `total` y `totalPages`.

**Respuesta:** HTTP `200`

```json
{
  "status": "success",
  "payload": { "data": [], "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
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

El proyecto utiliza una arquitectura por capas. Cada capa solo conoce a la inmediatamente inferior:

```text
Request → Route → Middlewares → Controller → Service → Repository → DAO → Model (Mongoose) → MongoDB
                                    ↑            │
                                    └─── DTO ────┘  (la respuesta vuelve filtrada)
```

| Capa | Carpeta | Responsabilidad | Puede importar |
|---|---|---|---|
| Routes | `src/routes` | Definen método + path y encadenan autenticación → autorización → controller. | Controllers, middlewares |
| Controllers | `src/controllers` | Solo coordinan request/response: extraen `body`, `params`, `query` y `req.user`, llaman al service y responden con el código HTTP. No calculan cupos, no validan estados ni importan modelos. Los errores se derivan con `next(error)`. | Services, DTO |
| Services | `src/services` | Toda la lógica de negocio: validación de datos, cupos, estados de eventos y tickets, duplicados, permisos sobre recursos propios (organizer dueño / admin), hash de contraseñas, generación del JWT y envío de email. Devuelven DTOs. | Repositories, DTO, utils |
| Repositories | `src/repositories` | Métodos orientados al dominio (`findByEmail`, `hasActiveTicket`, `countActiveTickets`, `cancelTicket`, `updateEventStatus`, ...). Arman los filtros de negocio y delegan en el DAO. No importan modelos. | DAO |
| DAO | `src/dao` | Acceso a datos genérico (`find`, `findOne`, `findById`, `create`, `update`, `count`, ...). **Son los únicos archivos que importan modelos de Mongoose.** Un ID con formato inválido se trata como inexistente (devuelve `null`). | Models |
| Models | `src/models` | Esquemas de Mongoose de `User`, `Event` y `Ticket`. | Mongoose |
| DTO | `src/dto` | Definen qué campos salen en cada respuesta: usuario (`toUserDTO`, `toCurrentUserDTO`), evento (`toEventDTO`) y ticket (`toTicketDTO`, `toEventTicketDTO`). Nunca incluyen `password`; si una relación viene con `populate`, también se filtra. | — |
| Middlewares | `src/middlewares` | Autenticación (Passport + JWT en cookie), autorización por rol, 404 de rutas y manejo centralizado de errores. | utils |
| Utils | `src/utils` | Hash (bcrypt), JWT y errores HTTP (`AppError` y helpers `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`). | — |
| Config | `src/config` | Variables de entorno, conexión a MongoDB, transporte de email y estrategias de Passport. | Services, utils |

El modelo `User` define `first_name`, `last_name`, `email`, `password` y `role`. Los modelos `Event` y `Ticket` se describen en las secciones de las pre-entregas 6 y 7.

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

## Pre-entrega 5: autorización por roles

Los roles permitidos son `user`, `organizer` y `admin`; el registro público siempre asigna `user`. La autenticación valida `currentUser` con Passport y produce 401 si no hay sesión válida. Luego `authorize.middleware.js` valida permisos y devuelve 403 si el rol no está habilitado.

| Acción | user | organizer | admin |
|---|:---:|:---:|:---:|
| Consultar eventos publicados | Sí | Sí | Sí |
| Crear eventos | No | Sí | Sí |
| Modificar/cancelar eventos propios | No | Sí | Sí |
| Modificar/cancelar cualquier evento | No | No | Sí |
| Ver todos los usuarios (`GET /api/users`) | No | No | Sí |

Las rutas protegidas siguen el orden autenticación → autorización → controller. `GET /api/users` requiere admin. Los eventos asocian `organizer` al usuario autenticado; no se acepta ese dato desde el body. El organizer opera solo sobre eventos propios y admin puede operar sobre cualquiera. Cancelar cambia el estado a `cancelled` y conserva el documento.

401 significa que falta una sesión válida:

```json
{ "status": "error", "message": "No autenticado" }
```

403 significa que la sesión es válida pero el usuario no tiene permisos:

```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

`GET /api/users` devuelve únicamente `id`, nombre, apellido, email y rol; nunca incluye contraseñas ni hashes.

## Pre-entrega 6: gestión de eventos

Un evento contiene `title`, `description`, `category`, `date`, `location`, `capacity`, `price`, `status` y `organizer`. `capacity` debe ser mayor que cero; `price` debe ser mayor o igual que cero y por defecto es `0`. Los estados admitidos son `draft`, `published`, `cancelled` y `finished`; los eventos nuevos comienzan como `draft`. La fecha debe ser válida y futura al crear o cambiar la fecha.

`POST /api/events` recibe los campos del evento excepto `organizer` y asigna el organizador desde la sesión. `PUT /api/events/:id` modifica los campos editables; `PATCH /api/events/:id/status` recibe `{ "status": "published" }` (o uno de los otros estados permitidos). Los eventos `cancelled` no pueden volver a modificarse ni publicarse los que estén `finished`. La ruta P5 `PATCH /api/events/:id` sigue disponible como alias de actualización. `DELETE /api/events/:id` se conserva por compatibilidad y cancela mediante estado, sin borrar el documento.

`GET /api/events/:id` responde 404 si el ID no es válido o no existe. Los filtros y la paginación de `GET /api/events` se aplican en base de datos. La colección de eventos de la base actual fue diagnosticada y contiene 0 documentos, por lo que no existen datos antiguos que requieran migración.

## Pre-entrega 7: tickets e inscripciones

`Ticket` almacena referencias ObjectId a `User` y `Event`, `status` (`confirmed`, `pending` o `cancelled`), `quantity`, `reservationCode`, `createdAt` y `cancelledAt`. Una inscripción exitosa se confirma directamente. El usuario siempre se toma de la sesión autenticada.

- `POST /api/events/:eid/tickets` requiere autenticación y un body como `{ "quantity": 2 }`. Solo admite eventos existentes en estado `published` y una cantidad finita mayor que cero.
- Los cupos ocupados se calculan sumando `quantity` de los tickets `confirmed` y `pending`. No se cuentan tickets `cancelled`; si no alcanzan los cupos de `Event.capacity`, responde con un error de conflicto.
- Un usuario no puede tener más de un ticket activo para el mismo evento. Los tickets cancelados se conservan y permiten una nueva inscripción.
- `GET /api/tickets/my-tickets` requiere autenticación y devuelve solo los tickets del usuario, con `title`, `date` y `location` del evento.
- `GET /api/events/:eid/tickets` requiere autenticación; el service permite al organizer propietario o a admin. No incluye datos personales de compradores.
- `PATCH /api/tickets/:tid/cancel` requiere autenticación. El propietario o admin puede cancelar una sola vez; se registra `cancelledAt` y el ticket no se elimina.

Al confirmar, la API intenta enviar un email mediante Nodemailer. Si el envío falla, la inscripción confirmada se conserva y la solicitud sigue respondiendo exitosamente; el servidor registra un mensaje genérico sin credenciales ni detalles sensibles. Para habilitar el correo configura `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` y `MAIL_FROM` en `.env` tomando `.env.example` como referencia. No subas `.env` ni sus credenciales.

## Pre-entrega 8: arquitectura con DAO, Repository y DTO

Se refactorizó la API para separar formalmente las capas descritas en [Arquitectura](#arquitectura), sin cambiar paths, métodos, roles, autenticación ni formato de las respuestas. Las únicas diferencias observables son la corrección de un bug previo en `PUT /api/events/:id` (ver [Corrección](#corrección-actualización-parcial-de-eventos)) y que los errores de validación o de clave duplicada de Mongoose, que antes terminaban en 500, ahora responden 400 o 409.

### DAO y Repository

| Entidad | DAO (acceso a datos) | Repository (dominio) |
|---|---|---|
| User | `find`, `findOne`, `findById`, `create`, `update`, `count` | `findByEmail`, `findUserById`, `findAllUsers`, `createUser` |
| Event | `find`, `findOne`, `findById`, `create`, `update`, `count` | `findEvents`, `countEvents`, `findEventById`, `createEvent`, `updateEvent`, `updateEventStatus` |
| Ticket | `find`, `findOne`, `findById`, `exists`, `create`, `updateOne`, `count`, `sumQuantity` | `hasActiveTicket`, `countActiveTickets`, `findTicketsByUser`, `findTicketsByEvent`, `findTicketById`, `createTicket`, `cancelTicket` |

Los services no importan `mongoose` ni modelos: solo usan repositories. `findAllUsers` pide al DAO una proyección que excluye `password` en la consulta a MongoDB, y además `toUserDTO` filtra la respuesta.

### DTO

- `toUserDTO`: `id`, `first_name`, `last_name`, `email`, `role` (registro y `GET /api/users`).
- `toCurrentUserDTO`: `id`, `email`, `role` (`GET /api/sessions/current`).
- `toEventDTO`: datos públicos del evento; si `organizer` viene populado se reduce a `id`, `first_name`, `last_name` y `email`.
- `toTicketDTO`: ticket del propietario, con lista blanca de campos (`id`, `event`, `status`, `quantity`, `reservationCode`, `createdAt`, `cancelledAt`). En `GET /api/tickets/my-tickets` el `event` se popula y el DTO lo reduce a `title`, `date` y `location`. Si el ticket tuviera el `user` populado, el DTO no lo incluye, por lo que su `password` nunca se expone.
- `toEventTicketDTO`: ticket visto por el organizador del evento, sin datos personales del comprador.

Ninguna respuesta incluye `password`, ni en texto plano ni hasheada.

### Manejo de errores

Los services lanzan errores con `AppError` (`src/utils/errors.js`) y los controllers los derivan con `next(error)`. `error.middleware.js` responde siempre con el formato:

```json
{ "status": "error", "message": "..." }
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos (validaciones, JSON mal formado, `ValidationError`/`CastError` de Mongoose) |
| 401 | Sin sesión válida o credenciales inválidas |
| 403 | Sesión válida sin permisos (rol o recurso ajeno) |
| 404 | Recurso o ruta inexistente |
| 409 | Conflicto de negocio: email duplicado, evento no publicado, sin cupos, inscripción activa duplicada, ticket ya cancelado |
| 500 | Error interno; no se exponen detalles al cliente |

### Casos verificados

1. Flujo completo: registro → login → crear evento → publicar → inscribirse → consultar mis tickets → cancelar.
2. `GET /api/sessions/current` no incluye `password`.
3. Un ticket con `populate` no incluye el `password` del usuario: lo cubre la prueba automatizada `test/ticket.dto.test.js`.
4. Errores de negocio devuelven 400/404/409 en lugar de 500 (por ejemplo, inscribirse sin cupos responde 409).
5. Endpoint protegido sin sesión responde 401; con sesión pero sin rol suficiente responde 403.

### Pruebas

```bash
npm test
```

Ejecuta las pruebas con `node:test` (incluido en Node, sin dependencias adicionales). `test/ticket.dto.test.js` pasa a `toTicketDTO` un ticket con `event` y `user` populados, donde el usuario tiene un hash de contraseña ficticio, y verifica que la salida no contenga la clave `password` ni el hash.

### Corrección: actualización parcial de eventos

Desde la pre-entrega 6, `PUT /api/events/:id` (y su alias `PATCH /api/events/:id`) respondía 400 cuando el body no incluía todos los campos del evento, por ejemplo `{ "title": "Nuevo título" }` devolvía `description es obligatorio`. La causa era que el service copiaba el documento de Mongoose con `{ ...doc }`, que no copia sus campos. Ahora se usa `doc.toObject()`, de modo que los campos no enviados conservan su valor actual y se siguen aplicando las mismas validaciones. Es la corrección de un bug, no una funcionalidad nueva.
