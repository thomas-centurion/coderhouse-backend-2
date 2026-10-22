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

Registra un nuevo usuario. Body: `{ "first_name": "Ana", "last_name": "Pérez", "email": "Ana@Mail.com ", "password": "Secreta123" }`.

- Todos los campos son obligatorios y la contraseña debe tener al menos 6 caracteres.
- El email se normaliza (sin espacios y en minúsculas): `" Ana@Mail.com "` se guarda como `"ana@mail.com"`.
- La contraseña se guarda hasheada con `bcrypt` (`src/utils/hash.js`).
- El rol siempre es `user`; no se puede elegir desde el registro. Roles posibles: `user`, `organizer`, `admin`.

Responde HTTP `201` con `{ "status": "success", "payload": { "id", "first_name", "last_name", "email", "role" } }`, sin la contraseña ni su hash. Campos faltantes o email inválido responden `400`; un email ya registrado responde `409` (`"El email ya está registrado"`).

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

| Endpoint | Body | Respuesta |
|---|---|---|
| `POST /api/sessions/login` | `{ "email", "password" }` | `200` `{ "status": "success", "message": "Login correcto" }` y cookie `currentUser`. Credenciales inválidas: `401` `"Credenciales inválidas"` (no distingue usuario inexistente de contraseña incorrecta). Faltan datos: `400`. |
| `GET /api/sessions/current` | — (cookie `currentUser`) | `200` `{ "status": "success", "payload": { "id", "email", "role" } }`. Sin cookie, token inválido o expirado: `401` `"No autenticado"`. |
| `POST /api/sessions/logout` | — | `200` `{ "status": "success", "message": "Sesión cerrada" }`. Borra la cookie; no requiere autenticación. |

- El service compara la contraseña con `bcrypt`; la lógica de JWT está en `src/utils/jwt.js`.
- El JWT contiene solo `id`, `email` y `role`, y expira según `JWT_EXPIRES_IN`. `/current` lo valida sin consultar MongoDB.
- La cookie `currentUser` usa `httpOnly=true`, `sameSite=lax`, `maxAge=3600000` y `secure=true` solo con `NODE_ENV=production`.

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

### Evidencia por criterio de evaluación

| Criterio | Dónde se cumple |
|---|---|
| **Patrón DAO y Repository** | Los DAO ([events.dao.js](src/dao/events.dao.js#L2), [tickets.dao.js](src/dao/tickets.dao.js#L2), [users.dao.js](src/dao/users.dao.js#L2)) son los únicos archivos que importan modelos de Mongoose. Los repositories ([src/repositories](src/repositories)) importan solo su DAO y exponen métodos de dominio: [`findByEmail`](src/repositories/users.repository.js#L3), [`hasActiveTicket`](src/repositories/tickets.repository.js#L11), [`countActiveTickets`](src/repositories/tickets.repository.js#L14), [`cancelTicket`](src/repositories/tickets.repository.js#L25). Ejemplo de la cadena: `tickets.service` → `ticketsRepository.countActiveTickets` → [`ticketsDao.sumQuantity`](src/dao/tickets.dao.js#L20) → modelo `Ticket`. |
| **DTOs y seguridad de datos** | DTOs en [src/dto](src/dto): [`toUserDTO` / `toCurrentUserDTO`](src/dto/user.dto.js), [`toEventDTO`](src/dto/event.dto.js), [`toTicketDTO` / `toEventTicketDTO`](src/dto/ticket.dto.js). Se aplican en registro y `/current` ([sessions.controller.js](src/controllers/sessions.controller.js#L15)), usuarios ([users.service.js](src/services/users.service.js#L6)), eventos ([events.service.js](src/services/events.service.js#L54)) y tickets ([tickets.service.js](src/services/tickets.service.js#L65)). Son listas blancas: `password` nunca se devuelve, tampoco si un documento relacionado viene con `populate`. `GET /api/users` además excluye `password` en la consulta ([users.repository.js](src/repositories/users.repository.js#L7)). Lo comprueba la prueba [ticket.dto.test.js](test/ticket.dto.test.js) (`npm test`). |
| **Arquitectura en capas y lógica de negocio en services** | Flujo Controller → Service → Repository → DAO. Los controllers ([src/controllers](src/controllers)) solo leen `params`/`body`/`query`/`req.user`, llaman al service y responden. Las reglas de negocio están en los services: evento publicado ([tickets.service.js:15](src/services/tickets.service.js#L15)), inscripción duplicada ([:24](src/services/tickets.service.js#L24)), cupos ([:28](src/services/tickets.service.js#L28)), email de confirmación ([:48](src/services/tickets.service.js#L48)), permisos sobre recursos propios ([:83](src/services/tickets.service.js#L83)) y estados de evento ([events.service.js:111-113](src/services/events.service.js#L111-L113)). |

### Detalles

- Los services no importan `mongoose` ni modelos. `GET /api/users` excluye `password` en la consulta y `toUserDTO` lo filtra de nuevo; ninguna respuesta incluye `password`, ni en texto plano ni hasheada.
- Errores: los services lanzan `AppError` (`src/utils/errors.js`) y `error.middleware.js` responde siempre `{ "status": "error", "message": "..." }` con `400` (datos inválidos), `401` (sin sesión), `403` (sin permisos), `404` (no encontrado), `409` (conflicto: email duplicado, evento no publicado, sin cupos, inscripción duplicada, ticket ya cancelado) o `500` (error interno, sin detalles).
- Pruebas: `npm test` corre `test/ticket.dto.test.js` con `node:test` y comprueba que un ticket con `user` populado no exponga la clave `password` ni el hash.
- Casos verificados: flujo registro → login → crear evento → inscribirse → mis tickets → cancelar; `/current` sin `password`; errores de negocio con su código (no 500); `401` sin sesión y `403` sin permisos.

### Corrección: actualización parcial de eventos

`PUT /api/events/:id` (y su alias `PATCH`) respondía `400` desde la pre-entrega 6 si el body no traía todos los campos, porque el service copiaba el documento con `{ ...doc }`. Ahora usa `doc.toObject()` y los campos no enviados conservan su valor. Es la corrección de un bug, no una funcionalidad nueva.
