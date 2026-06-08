# Construformas - Sistema de Fichajes

Sistema de control de fichajes para trabajadores de construcción con geolocalización.

## Requisitos previos

- **Java 17+** (recomendado: Java 21)
- **Node.js 22+** (con npm)
- **MariaDB 12+** (o MySQL compatible)
- **Angular CLI 22** (`npm install -g @angular/cli`)

## Estructura del proyecto

```
fichajes/
├── backend/          # Spring Boot API
├── frontend/         # Angular 22 + Tailwind v4
├── .context/         # Tracking de tareas AI
└── AI-rules.md       # Reglas de negocio
```

## Base de datos

1. Crear la base de datos:

```sql
CREATE DATABASE construformas_db;
```

2. Las migraciones de Flyway se ejecutan automáticamente al iniciar el backend.

## Iniciar el proyecto

### Backend (Spring Boot)

```bash
cd backend

# Producción (con Flyway)
./mvnw spring-boot:run

# Desarrollo (sin Flyway, con datos de prueba)
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

El API estará disponible en: `http://localhost:8080`

Documentación Swagger: `http://localhost:8080/swagger-ui.html`

### Frontend (Angular)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

## Usuarios de prueba (perfil dev)

Contraseña para todos: `admin123`

| Email | Rol |
|-------|-----|
| `alan@construformas.com` | ADMIN |
| `maria@construformas.com` | ADMIN |
| `juan@construformas.com` | OPERATOR |
| `carlos@construformas.com` | OPERATOR |
| `ana@construformas.com` | OPERATOR |
| `pedro@construformas.com` | OPERATOR |
| `laura@construformas.com` | OPERATOR |
| `roberto@construformas.com` | OPERATOR (inactivo) |

## API Endpoints

### Auth
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Clock Entries
- `POST /api/clock-entries` - Fichar entrada/salida
- `GET /api/clock-entries/user/{id}` - Historial de fichajes
- `DELETE /api/clock-entries/{id}` - Eliminar fichaje

### Projects (Admin)
- `GET /api/projects` - Listar obras
- `POST /api/projects` - Crear obra
- `PUT /api/projects/{id}` - Actualizar obra
- `DELETE /api/projects/{id}` - Eliminar obra

### Users (Admin)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

## Roles

- **ADMIN**: Acceso completo al panel de administración
- **OPERATOR**: Solo puede fichar entrada/salida y ver su historial

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | Host de MariaDB |
| `DB_PORT` | `3306` | Puerto de MariaDB |
| `DB_NAME` | `construformas_db` | Nombre de la base de datos |
| `DB_USER` | `root` | Usuario de la base de datos |
| `DB_PASSWORD` | `` | Contraseña de la base de datos |
| `JWT_SECRET` | (ver application.yml) | Secreto para JWT |
| `SPRING_PROFILES_ACTIVE` | `default` | Perfil de Spring (`dev` para desarrollo) |

## Tech Stack

- **Backend**: Java 21, Spring Boot 4.x, Spring Data JPA, Flyway, JWT
- **Frontend**: Angular 22, Tailwind CSS v4, Angular Signals
- **Database**: MariaDB 12.x
- **Auth**: Spring Security + JWT
