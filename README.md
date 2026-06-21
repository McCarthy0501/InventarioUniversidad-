# Sistema de Inventario - Bodegon JL

Plataforma web para gestion de inventario comercial con control de stock, proveedores, clientes, movimientos (compras/ventas), alertas de stock minimo, dashboard con tasa del dolar y exportacion Excel.

## Stack

| Capa | Tecnologia |
|---|---|
| Backend | Python 3.x + Django 6 + Django REST Framework |
| Base de datos | SQLite (desarrollo) / PostgreSQL (produccion) |
| Frontend | React 19 + TypeScript 6 + Vite 8 |
| UI | Tailwind CSS v4 + shadcn/ui |
| Auth | JWT (Simple JWT) |

---

## Requisitos

- **Python 3.12+**
- **Node.js 20+**
- (Opcional) PostgreSQL 15+ para produccion

---

## Instalacion

### 1. Clonar repositorio

```bash
git clone <url-repo>
cd InventarioUniversidad-
```

### 2. Backend (Django)

```bash
cd Inventario-Api

# Crear entorno virtual
python -m venv env

# Activar (Windows)
env\Scripts\activate

# Activar (Linux/Mac)
source env/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario (saltar si ya existe)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

El backend corre en `http://localhost:8000`

### 3. Frontend (React + Vite)

```bash
cd Inventario-Web/Inventario_web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend corre en `http://localhost:5173`

### 4. Acceder al sistema

Abre `http://localhost:5173` en el navegador.

**Credenciales por defecto:**
- Usuario: `admin`
- Contrasena: `admin123`

---

## Estructura del proyecto

```
InventarioUniversidad-/
├── Inventario-Api/                 # Backend Django
│   ├── Inventario_api/             # Configuracion del proyecto
│   │   ├── settings.py             # DRF, CORS, JWT, DB config
│   │   └── urls.py                 # Rutas raiz
│   ├── inventario/                 # App principal
│   │   ├── models.py               # Usuario, Proveedor, Cliente, Articulo, Movimiento, TasaDolar
│   │   ├── serializers.py          # Serializadores DRF
│   │   ├── views.py                # ViewSets + APIViews + Dashboard + Export
│   │   ├── urls.py                 # Rutas de la API
│   │   └── admin.py                # Panel admin Django
│   ├── requirements.txt            # Dependencias Python
│   └── manage.py                   # Script de gestion Django
│
└── Inventario-Web/                 # Frontend React
    └── Inventario_web/
        ├── src/
        │   ├── api/                # Axios client + endpoints
        │   ├── components/         # UI (shadcn) + Layout (Sidebar)
        │   ├── pages/              # Vistas: Dashboard, Articulos, Proveedores, etc.
        │   ├── store/              # Zustand (auth)
        │   ├── types/              # TypeScript interfaces
        │   └── lib/                # Utilidades
        ├── package.json
        └── vite.config.ts
```

---

## API REST - Endpoints

### Autenticacion

| Metodo | Endpoint | Descripcion | Acceso |
|---|---|---|---|
| POST | `/api/auth/login/` | Iniciar sesion. Body: `{ username, password }` | Publico |
| POST | `/api/auth/refresh/` | Refrescar token. Body: `{ refresh }` | Publico |
| GET | `/api/auth/me/` | Obtener usuario actual | Autenticado |

### Dashboard

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/dashboard/` | Estadisticas: KPIs, ventas/compras hoy/semana/mes, tasa dolar, graficos, ultimos movimientos |

### Articulos

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/articulos/` | Listar (paginado, filtros: estado, categoria, proveedor. Busqueda: codigo, nombre) |
| POST | `/api/articulos/` | Crear articulo |
| GET | `/api/articulos/{id}/` | Detalle |
| PUT | `/api/articulos/{id}/` | Actualizar |
| DELETE | `/api/articulos/{id}/` | Eliminar |
| GET | `/api/articulos/exportar/` | Exportar a Excel |

### Proveedores

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/proveedores/` | Listar todos (sin paginar) |
| POST | `/api/proveedores/` | Crear |
| PUT | `/api/proveedores/{id}/` | Actualizar |
| DELETE | `/api/proveedores/{id}/` | Eliminar |

### Clientes

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/clientes/` | Listar todos (sin paginar) |
| POST | `/api/clientes/` | Crear |
| PUT | `/api/clientes/{id}/` | Actualizar |
| DELETE | `/api/clientes/{id}/` | Eliminar |

### Movimientos

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/movimientos/` | Listar (filtro: tipo) |
| POST | `/api/movimientos/` | Registrar movimiento. Al crear, actualiza el stock automaticamente |

**Tipos de movimiento:**
- `entrada` (Compra) → aumenta stock, asocia proveedor
- `salida` (Venta) → reduce stock, asocia cliente
- `devolucion` → aumenta stock
- `ajuste` → fija el stock al valor indicado

### Categorias y Ubicaciones

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET, POST | `/api/categorias/` | CRUD categorias |
| PUT, DELETE | `/api/categorias/{id}/` | |
| GET, POST | `/api/ubicaciones/` | CRUD ubicaciones (almacenes/pasillos) |
| PUT, DELETE | `/api/ubicaciones/{id}/` | |

### Alertas de Stock

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/alertas/` | Productos con stock bajo o agotado |

### Configuracion (Tasa del Dolar)

| Metodo | Endpoint | Descripcion | Acceso |
|---|---|---|---|
| GET | `/api/configuracion/` | Obtener tasa actual | Autenticado |
| PUT | `/api/configuracion/` | Actualizar tasa. Body: `{ tasa: 45.50 }` | Admin |

### Usuarios (solo admin)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/usuarios/` | Listar usuarios |
| POST | `/api/usuarios/` | Crear usuario |
| PUT | `/api/usuarios/{id}/` | Actualizar |
| DELETE | `/api/usuarios/{id}/` | Eliminar |

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| **admin** | Acceso total: CRUD en todos los modulos, gestion de usuarios, cambiar tasa del dolar |
| **operador** | CRUD articulos, proveedores, clientes, movimientos. Solo lectura en usuarios |
| **consulta** | Solo lectura en todo el sistema |

---

## Funcionalidades principales

### Dashboard
- KPIs: total productos, unidades en stock, valor inventario, alertas
- **Tasa del dolar**: admin configura la tasa BCV desde el dashboard
- Precios en **USD + Bolivares** en paralelo
- Ventas y compras desglosadas por: **hoy / semana / mes**
- Grafico de barras: productos por categoria
- Ultimos movimientos

### Articulos
- Tabla con codigo, nombre, categoria, stock, precios (USD + Bs), proveedor, estado
- Busqueda por codigo o nombre
- Filtros por estado, categoria
- Filas destacadas en amarillo cuando el stock esta bajo
- Formulario con conversion a Bolivares en tiempo real al ingresar precios
- Exportacion a Excel

### Alertas de Stock
- Vista dedicada con todos los productos bajo stock minimo
- Badges: "Stock Bajo" (amarillo) y "Agotado" (rojo)
- Muestra proveedor para facilitar reposicion

### Movimientos
- Registro de entradas (compras), salidas (ventas), devoluciones y ajustes
- Seleccion rapida de proveedor/cliente segun el tipo
- El stock del articulo se actualiza automaticamente al registrar un movimiento

---

## Base de datos

### SQLite (por defecto)
El sistema usa SQLite sin necesidad de configuracion adicional. Ideal para desarrollo y cargas moderadas.

### Migrar a PostgreSQL

```bash
# 1. Crear base de datos en PostgreSQL
createdb bodegon_jl

# 2. Configurar variables de entorno (Windows PowerShell)
$env:DB_ENGINE = "django.db.backends.postgresql"
$env:DB_NAME = "bodegon_jl"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "tu_password"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"

# 3. Instalar driver
pip install psycopg2-binary

# 4. Migrar
python manage.py migrate
```

---

## Compilacion para produccion

### Frontend
```bash
cd Inventario-Web/Inventario_web
npm run build
# Los archivos estaticos quedan en dist/
```

### Backend
```bash
# Configurar DEBUG=False en settings.py
# Configurar ALLOWED_HOSTS
# Usar gunicorn (Linux) o waitress (Windows) para servir Django
```

---

## Solucion de problemas

**Error 400 al crear articulos:** Reinicia el backend. Si persiste, verifica que los campos de texto no se envien como `null` (deben ser `""`).

**Error 500 al exportar Excel:** Reinicia el backend (el fix de `export_articulos_excel` se aplico en la ultima version).

**Las graficas del dashboard no cargan:** Verifica que existan articulos creados y que el backend este corriendo.

**El proxy no funciona:** El frontend hace proxy de `/api` a `http://localhost:8000`. Asegurate de que ambos servidores esten corriendo.

---

## Licencia

Proyecto academico desarrollado por estudiantes de Ingenieria en Informatica de la UPTAI.
