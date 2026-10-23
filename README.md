# Plataforma de Eventos e Inscripciones — API Backend

API REST para una plataforma donde organizadores publican eventos y los usuarios se inscriben a ellos. Incluye registro y login con JWT en cookie, Passport, roles y autorización, gestión de eventos con validaciones, inscripciones con control de cupos, emails de confirmación con Nodemailer y una arquitectura por capas con DAO, Repository, Services y DTO.

Es la entrega final del curso Backend II: la evolución del mismo proyecto a lo largo de las pre-entregas 1 a 8.

## Tecnologías

- Node.js (ESM) y Express 5
- MongoDB y Mongoose
- Passport (estrategias `register`, `login` y `current`)
- JSON Web Token (`jsonwebtoken`) y `cookie-parser`
- bcrypt
- Nodemailer
- dotenv
- `node:test` para pruebas y una colección de Postman para el flujo completo

## Instalación

Requisitos: Node.js 20 o superior (probado con Node 22) y una base MongoDB (local o Atlas).

```bash
git clone https://github.com/thomas-centurion/coderhouse-backend-2.git
cd coderhouse-backend-2
npm install
cp .env.example .env    # completar los valores
npm run seed            # crea los usuarios de prueba
npm start
```

El servidor queda escuchando en `http://localhost:3000` (o el `PORT` configurado). `GET /api/health` responde `{ "status": "ok", "message": "Servidor activo" }`.

## Variables de entorno

Se configuran en `.env` (no se sube al repositorio) tomando `.env.example` como base:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno. Con `production` la cookie se marca `secure` | `development` |
| `MONGO_URL` | URL de conexión a MongoDB | `mongodb://127.0.0.1:27017/eventos` |
| `JWT_SECRET` | Secreto para firmar los JWT | una cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | Vigencia del JWT | `1h` |
| `MAIL_HOST` | Servidor SMTP | `sandbox.smtp.mailtrap.io` |
| `MAIL_PORT` | Puerto SMTP (`465` usa conexión segura) | `587` |
| `MAIL_USER` | Usuario SMTP | |
| `MAIL_PASS` | Contraseña SMTP | |
| `MAIL_FROM` | Remitente de los emails | `Eventos <no-reply@eventos.com>` |

Las credenciales de JWT y de email se leen solo de variables de entorno (`src/config/env.js`); no hay ninguna en el código. Para pruebas se puede usar un servicio como Mailtrap o una contraseña de aplicación de Gmail.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia el servidor y lo reinicia al guardar cambios (`node --watch`) |
| `npm run seed` | Crea los usuarios de prueba (si ya existen, no los duplica) |
| `npm test` | Ejecuta las pruebas automatizadas (`node:test`) |

## Usuarios de prueba

`npm run seed` crea un usuario por rol, todos con la contraseña `Test1234`:

| Email | Rol |
|---|---|
| `user@test.com` | `user` |
| `organizer@test.com` | `organizer` |
| `admin@test.com` | `admin` |

El script ([scripts/seed.js](scripts/seed.js)) usa el repository de usuarios y guarda la contraseña hasheada con bcrypt. Son datos solo para desarrollo.

Para crear otros usuarios: `POST /api/sessions/register` siempre asigna el rol `user`. Para convertirlo en `organizer` o `admin` hay que cambiar el campo `role` directamente en la base, por ejemplo con `mongosh`:

```js
db.users.updateOne({ email: "ana@mail.com" }, { $set: { role: "organizer" } })
```

## Roles y permisos

Roles: `user` (por defecto), `organizer` y `admin`. El registro público ignora cualquier `role` enviado en el body.

| Acción | user | organizer | admin |
|---|:---:|:---:|:---:|
| Ver eventos publicados | Sí | Sí | Sí |
| Inscribirse a eventos y ver/cancelar sus tickets | Sí | Sí | Sí |
| Crear eventos | No | Sí | Sí |
| Modificar, cambiar estado o cancelar eventos propios | No | Sí | Sí |
| Modificar o cancelar eventos de otros | No | No | Sí |
| Ver los tickets de un evento | No | Solo si es el dueño | Sí |
| Cancelar tickets de otros | No | No | Sí |
| Listar usuarios (`GET /api/users`) | No | No | Sí |

Las rutas protegidas encadenan `auth.middleware.js` (sin sesión válida → `401`) y `authorize.middleware.js` (rol no permitido → `403`). Los permisos sobre recursos propios (ser dueño del evento o del ticket) se validan en los services y también responden `403`.

## Endpoints

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del servidor |
| POST | `/api/sessions/register` | Público | Registra un usuario con rol `user` |
| POST | `/api/sessions/login` | Público | Inicia sesión y guarda el JWT en la cookie `currentUser` |
| GET | `/api/sessions/current` | Autenticado | Datos del usuario de la sesión (`id`, `email`, `role`) |
| POST | `/api/sessions/logout` | Público | Borra la cookie de sesión |
| GET | `/api/sessions` | Público | Ruta inicial del recurso (responde una lista vacía) |
| GET | `/api/users` | admin | Lista usuarios, sin contraseñas |
| GET | `/api/events` | Público | Lista eventos con filtros, paginación y orden |
| GET | `/api/events/:id` | Público | Detalle de un evento |
| POST | `/api/events` | organizer, admin | Crea un evento (queda en `draft`) |
| PUT | `/api/events/:id` | Dueño o admin | Modifica un evento (admite cambios parciales) |
| PATCH | `/api/events/:id` | Dueño o admin | Alias de `PUT /api/events/:id` |
| PATCH | `/api/events/:id/status` | Dueño o admin | Cambia el estado: `{ "status": "published" }` |
| DELETE | `/api/events/:id` | Dueño o admin | Cancela el evento (estado `cancelled`, no lo borra) |
| POST | `/api/events/:eid/tickets` | Autenticado | Inscripción: `{ "quantity": 2 }` |
| GET | `/api/events/:eid/tickets` | Dueño del evento o admin | Tickets del evento, sin datos personales de los compradores |
| GET | `/api/tickets/my-tickets` | Autenticado | Tickets propios, con `title`, `date` y `location` del evento |
| PATCH | `/api/tickets/:tid/cancel` | Dueño del ticket o admin | Cancela el ticket (no lo borra) |

### Filtros de `GET /api/events`

| Parámetro | Descripción | Por defecto |
|---|---|---|
| `status` | `draft`, `published`, `cancelled` o `finished` | `published` |
| `category` | Categoría exacta | — |
| `location` | Búsqueda parcial sin distinguir mayúsculas | — |
| `dateFrom`, `dateTo` | Rango de fechas | — |
| `page`, `limit` | Paginación | `1`, `10` |
| `sort` | `date` (ascendente) o `-date` (descendente) | `date` |

## Ejemplos de uso

Con `curl`, guardando la cookie de sesión en `cookies.txt` (en PowerShell usar `curl.exe`):

```bash
# Login como organizer
curl -c cookies.txt -X POST http://localhost:3000/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@test.com","password":"Test1234"}'

# Crear un evento
curl -b cookies.txt -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Congreso Tech 2026","description":"Charlas de tecnología","category":"tecnologia","date":"2030-06-15T18:00:00.000Z","location":"Buenos Aires","capacity":100,"price":0}'

# Publicarlo
curl -b cookies.txt -X PATCH http://localhost:3000/api/events/<eventId>/status \
  -H "Content-Type: application/json" -d '{"status":"published"}'

# Login como user e inscribirse
curl -c cookies.txt -X POST http://localhost:3000/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test1234"}'
curl -b cookies.txt -X POST http://localhost:3000/api/events/<eventId>/tickets \
  -H "Content-Type: application/json" -d '{"quantity":1}'
```

`GET /api/events?status=published&page=2&limit=5` → `200`:

```json
{
  "status": "success",
  "data": [
    { "id": "6690...", "title": "Congreso Tech 2026", "description": "Charlas de tecnología", "category": "tecnologia", "date": "2030-06-15T18:00:00.000Z", "location": "Buenos Aires", "capacity": 100, "price": 0, "status": "published", "organizer": "665f..." }
  ],
  "page": 2,
  "limit": 5,
  "total": 27,
  "totalPages": 6
}
```

`POST /api/events/:eid/tickets` → `201`:

```json
{
  "status": "success",
  "payload": {
    "id": "66a1...",
    "event": "6690...",
    "user": "665f...",
    "status": "confirmed",
    "quantity": 1,
    "reservationCode": "42714833-73e5-4527-a1c6-f0e3db402d1b",
    "createdAt": "2026-10-22T13:14:20.112Z",
    "cancelledAt": null
  }
}
```

Inscripción duplicada → `409`:

```json
{ "status": "error", "message": "Ya tenés una inscripción activa para este evento" }
```

## Flujo de autenticación

1. **Registro** (`POST /api/sessions/register`). La estrategia `register` de Passport delega en el service, que:
   - valida los campos (todos obligatorios, contraseña de 6 caracteres o más);
   - normaliza el email (sin espacios y en minúsculas);
   - rechaza emails repetidos (`409`);
   - guarda la contraseña hasheada con bcrypt y el rol `user`.

   La respuesta pasa por `toUserDTO`: `id`, `first_name`, `last_name`, `email` y `role`, sin `password`.
2. **Login** (`POST /api/sessions/login`). La estrategia `login` compara la contraseña con bcrypt. Si las credenciales son incorrectas responde `401` `"Credenciales inválidas"`, sin decir si el usuario existe. Si son correctas, se genera un JWT que contiene solo `id`, `email` y `role` (nunca `password`) y se guarda en la cookie `currentUser`.
3. **La cookie** usa `httpOnly`, `sameSite=lax`, dura 1 hora y es `secure` en producción. El JWT expira según `JWT_EXPIRES_IN`.
4. **Rutas protegidas**. La estrategia `current` lee y verifica el JWT de la cookie y deja sus datos en `req.user`. Sin cookie, o con un token inválido o vencido, responde `401` `"No autenticado"`. Después, `authorize` controla el rol (`403`).
5. **Logout** (`POST /api/sessions/logout`) borra la cookie. Desde ahí, `GET /api/sessions/current` responde `401`.

Las estrategias están en [src/config/passport.config.js](src/config/passport.config.js).

## Flujo de inscripción

1. Un `organizer` (o `admin`) crea el evento con `POST /api/events`. El evento nace en `draft` y su `organizer` se toma de la sesión, nunca del body.
2. Lo publica con `PATCH /api/events/:id/status` y `{ "status": "published" }`.
3. Un usuario autenticado se inscribe con `POST /api/events/:eid/tickets` y `{ "quantity": n }`. El service valida, en este orden:
   - el evento existe (`404`) y está `published` (`409`);
   - `quantity` es un número mayor que 0 (`400`);
   - el usuario no tiene ya una inscripción activa en ese evento (`409`);
   - hay cupo: la suma de `quantity` de los tickets activos (`confirmed` o `pending`) más la cantidad pedida no supera `capacity` (`409` `"No hay cupos suficientes para esa cantidad"`).
4. Se crea el ticket `confirmed`, con referencias al usuario y al evento y un `reservationCode` único. Responde `201`.
5. Se envía un email de confirmación con Nodemailer (evento, fecha, ubicación, cantidad y código de reserva). Si el email falla, la inscripción se conserva y el servidor registra un mensaje genérico.
6. El usuario consulta sus tickets con `GET /api/tickets/my-tickets`. Cada ticket trae, con `populate`, el `title`, `date` y `location` del evento.
7. El dueño del ticket o un admin lo cancela con `PATCH /api/tickets/:tid/cancel`:
   - el estado pasa a `cancelled` y se registra `cancelledAt`;
   - el ticket no se borra;
   - los tickets cancelados no ocupan cupo, así que el lugar queda libre y el usuario puede volver a inscribirse.

## Modelos

- **User**: `first_name`, `last_name`, `email` (único), `password` (hash bcrypt) y `role` (`user`, `organizer` o `admin`).
- **Event**: `title`, `description`, `category`, `date`, `location`, `capacity` (mayor que 0), `price` (0 o más, por defecto 0), `status` (`draft`, `published`, `cancelled` o `finished`) y `organizer` (referencia a `User`).
  - Al crear un evento o cambiarle la fecha, la fecha tiene que ser futura.
  - Un evento `cancelled` ya no se puede modificar, y uno `finished` no se puede volver a publicar.
- **Ticket**: `user` y `event` (referencias por ObjectId, no objetos embebidos), `status` (`confirmed`, `pending` o `cancelled`), `quantity`, `reservationCode` (único), `createdAt` y `cancelledAt`.

## Manejo de errores

Los services lanzan errores con `AppError` ([src/utils/errors.js](src/utils/errors.js)). Los controllers los pasan con `next(error)` y [error.middleware.js](src/middlewares/error.middleware.js) responde siempre con el mismo formato:

```json
{ "status": "error", "message": "..." }
```

| Código | Cuándo |
|---|---|
| `400` | Datos inválidos: validaciones, fecha pasada, `capacity` o `price` fuera de rango, JSON mal formado |
| `401` | Sin sesión válida o credenciales incorrectas |
| `403` | Sesión válida pero sin permisos (por rol o por no ser dueño del recurso) |
| `404` | Evento, ticket o ruta inexistente |
| `409` | Conflicto: email ya registrado, evento no publicado, sin cupo, inscripción duplicada, ticket ya cancelado |
| `500` | Error interno. El cliente recibe solo `"Error interno del servidor"`; el detalle queda en el log del servidor |

## Arquitectura

El proyecto está organizado en capas. Cada capa usa solo la que tiene inmediatamente debajo:

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

### Evidencia por criterio

| Criterio | Dónde se cumple |
|---|---|
| **Patrón DAO y Repository** | Los DAO ([events.dao.js](src/dao/events.dao.js#L2), [tickets.dao.js](src/dao/tickets.dao.js#L2), [users.dao.js](src/dao/users.dao.js#L2)) son los únicos archivos que importan modelos de Mongoose. Los repositories ([src/repositories](src/repositories)) importan solo su DAO y exponen métodos de dominio: [`findByEmail`](src/repositories/users.repository.js#L3), [`hasActiveTicket`](src/repositories/tickets.repository.js#L11), [`countActiveTickets`](src/repositories/tickets.repository.js#L14), [`cancelTicket`](src/repositories/tickets.repository.js#L25). Ejemplo de la cadena: `tickets.service` → `ticketsRepository.countActiveTickets` → [`ticketsDao.sumQuantity`](src/dao/tickets.dao.js#L20) → modelo `Ticket`. |
| **DTOs y seguridad de datos** | DTOs en [src/dto](src/dto): [`toUserDTO` / `toCurrentUserDTO`](src/dto/user.dto.js), [`toEventDTO`](src/dto/event.dto.js), [`toTicketDTO` / `toEventTicketDTO`](src/dto/ticket.dto.js). Se aplican en registro y `/current` ([sessions.controller.js](src/controllers/sessions.controller.js#L15)), usuarios ([users.service.js](src/services/users.service.js#L6)), eventos ([events.service.js](src/services/events.service.js#L54)) y tickets ([tickets.service.js](src/services/tickets.service.js#L65)). Son listas blancas: `password` nunca se devuelve, tampoco si un documento relacionado viene con `populate`. `GET /api/users` además excluye `password` en la consulta ([users.repository.js](src/repositories/users.repository.js#L7)). Lo comprueba la prueba [ticket.dto.test.js](test/ticket.dto.test.js) (`npm test`). |
| **Arquitectura en capas y lógica de negocio en services** | Flujo Controller → Service → Repository → DAO. Los controllers ([src/controllers](src/controllers)) solo leen `params`/`body`/`query`/`req.user`, llaman al service y responden. Las reglas de negocio están en los services: evento publicado ([tickets.service.js:15](src/services/tickets.service.js#L15)), inscripción duplicada ([:24](src/services/tickets.service.js#L24)), cupos ([:28](src/services/tickets.service.js#L28)), email de confirmación ([:48](src/services/tickets.service.js#L48)), permisos sobre recursos propios ([:83](src/services/tickets.service.js#L83)) y estados de evento ([events.service.js:111-113](src/services/events.service.js#L111-L113)). |

### Estructura del proyecto

```text
├── docs/
│   └── plataforma-eventos.postman_collection.json
├── scripts/
│   └── seed.js
├── src/
│   ├── config/         database, env, mailer, passport.config
│   ├── controllers/    events, health, sessions, tickets, users
│   ├── dao/            events, tickets, users
│   ├── dto/            dto.utils, event, ticket, user
│   ├── middlewares/    auth, authorize, error, not-found
│   ├── models/         Event, Ticket, User
│   ├── repositories/   events, tickets, users
│   ├── routes/         events, health, sessions, tickets, users
│   ├── services/       email, events, sessions, tickets, users
│   ├── utils/          errors, hash, jwt
│   ├── app.js
│   └── server.js
├── test/
│   └── ticket.dto.test.js
├── .env.example
└── package.json
```

## Seguridad

- Las contraseñas se guardan hasheadas con bcrypt. Ninguna respuesta ni el payload del JWT incluyen `password`.
- El JWT viaja en una cookie `httpOnly`, así que JavaScript del navegador no puede leerlo.
- El registro público no permite elegir el rol.
- Las credenciales (MongoDB, JWT, SMTP) se leen solo de variables de entorno. `.env` y `node_modules` están en `.gitignore`.
- Los errores internos no exponen detalles al cliente.

## Pruebas y colección de Postman

- `npm test` corre [test/ticket.dto.test.js](test/ticket.dto.test.js). La prueba pasa a `toTicketDTO` un ticket con `user` y `event` populados, donde el usuario tiene un hash de contraseña ficticio, y comprueba que no aparezcan `password` ni el hash.
- [docs/plataforma-eventos.postman_collection.json](docs/plataforma-eventos.postman_collection.json) recorre los 10 casos del flujo completo:
  1. Registro → login → `/current` → logout → `/current` responde `401`.
  2. Un `user` intenta crear un evento → `403`.
  3. Un `organizer` crea y publica un evento, el `user` se inscribe (se envía el email) y el cupo se descuenta.
  4. Inscripción duplicada → `409`.
  5. Evento sin cupo → `409`.
  6. Cancelar el ticket libera el cupo y la nueva inscripción funciona.
  7. Un `organizer` intenta modificar un evento ajeno → `403`.
  8. Un `admin` modifica el evento de otro organizador → `200`.
  9. Ninguna respuesta contiene `password`.
  10. Listado paginado con `?status=published&page=2&limit=5`.

  Para usarla: levantar el servidor, correr `npm run seed`, importar la colección en Postman y ejecutarla con el Collection Runner, en orden. Cada request trae tests que verifican el código y el contenido de la respuesta, y Postman maneja la cookie de sesión de forma automática.

## Historial de entregas

| Entrega | Incorporó |
|---|---|
| Pre-entrega 1–2 | Servidor Express, conexión a MongoDB y registro de usuarios con bcrypt |
| Pre-entrega 3 | Login, current y logout con JWT en cookie `httpOnly` |
| Pre-entrega 4 | Passport con estrategias `register`, `login` y `current` |
| Pre-entrega 5 | Roles y middlewares de autenticación (401) y autorización (403) |
| Pre-entrega 6 | Eventos: validaciones, estados, filtros, paginación y permisos de dueño |
| Pre-entrega 7 | Tickets, cupos, duplicados, cancelación y emails con Nodemailer |
| Pre-entrega 8 | Capas DAO, Repository y DTO, y middleware centralizado de errores |
| Entrega final | Listado y tickets alineados al formato pedido, script de usuarios de prueba, colección de Postman y documentación completa |

Corrección incluida desde la pre-entrega 8: `PUT /api/events/:id` respondía `400` si el body no traía todos los campos, porque el service copiaba el documento con `{ ...doc }`. Ahora usa `doc.toObject()` y los campos no enviados conservan su valor. Es la corrección de un bug, no una funcionalidad nueva.
