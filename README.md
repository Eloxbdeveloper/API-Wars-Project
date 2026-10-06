# FactuLocal

### Cobra. Factura. Crece.

FactuLocal es una plataforma web diseñada para pequeños negocios y emprendimientos que permite **cobrar y generar facturas electrónicas desde un mismo flujo**.

La solución integra **Factus** y **Factus Pay** para automatizar el proceso desde el cobro hasta la emisión de la factura.

> **Cobro confirmado → Factura generada automáticamente**

---

## ¿Qué problema resolvemos?

Para muchos pequeños negocios, cobrar y facturar son procesos separados.

El comerciante puede terminar teniendo que:

* Gestionar el cobro.
* Confirmar manualmente que recibió el pago.
* Generar la factura.
* Buscar el documento correspondiente.
* Llevar un control de sus ventas.

FactuLocal busca simplificar este proceso conectando el pago con la facturación electrónica.

---

## ¿Cómo funciona?

El flujo principal de FactuLocal es:

```text
Crear factura
     ↓
Generar cobro con Factus Pay
     ↓
Cliente realiza el pago
     ↓
FactuLocal detecta el pago
     ↓
Se genera automáticamente la factura
     ↓
Factura disponible
```

El usuario no necesita generar manualmente la factura después de confirmar el pago.

---

## Integración con Factus y Factus Pay

La arquitectura utiliza un backend propio como intermediario:

```text
Usuario
   ↓
FactuLocal
   ↓
Backend
   ├──→ Factus Pay → Cobro
   │
   └──→ Factus → Factura electrónica
```

Las credenciales y tokens de las APIs permanecen en el backend.

El frontend nunca se comunica directamente con Factus ni con Factus Pay.

---

## Funcionalidades principales

### Cobros con Factus Pay

* Generación de cobros.
* QR de pago.
* Consulta automática del estado.
* Confirmación del pago.
* Entorno Sandbox para demostración.

### Facturación electrónica

* Creación de facturas.
* Gestión de clientes.
* Gestión de productos y servicios.
* Emisión mediante Factus.
* Número de factura.
* CUFE.
* QR de factura.
* Acceso al documento.

### Resumen del negocio

FactuLocal también permite consultar el comportamiento de las ventas mediante estadísticas.

Se pueden consultar períodos como:

* Esta semana.
* Este mes.
* Últimos 3 meses.
* Últimos 6 meses.
* Este semestre.
* Este año.
* Período personalizado.

El dashboard muestra información como:

* Total facturado.
* Facturas emitidas.
* Facturas pendientes.
* Pagos confirmados.
* Evolución de la facturación.
* Últimas facturas.

---

## Demo

La aplicación utiliza los entornos **Sandbox de Factus y Factus Pay**.

Por lo tanto, la demostración **no utiliza dinero real**.

Para probar el flujo:

1. Crear un cliente.
2. Crear un producto o servicio.
3. Crear una factura.
4. Seleccionar **Generar cobro con Factus Pay**.
5. Mostrar el QR de pago.
6. Realizar la simulación correspondiente en el entorno Sandbox.
7. FactuLocal detectará el pago.
8. La factura será emitida automáticamente.
9. Consultar el número, CUFE, QR y documento de la factura.

---

## Tecnologías

**Frontend**

* JavaScript
* HTML
* CSS

**Backend**

* Node.js
* Express

**Base de datos**

* MongoDB
* Mongoose

**APIs**

* Factus
* Factus Pay

---

## Arquitectura

```text
                  FACTULOCAL

                    Usuario
                       │
                       ▼
                  Frontend
                       │
                       ▼
               Backend propio
                 /         \
                /           \
               ▼             ▼
        Factus Pay          Factus
            │                 │
            ▼                 ▼
          Cobro             Factura
            │                 │
            └───────┬─────────┘
                    ▼
                   DIAN
```

---

## Seguridad

Las credenciales de Factus, Factus Pay y MongoDB **no están incluidas en el repositorio**.

Se utilizan variables de entorno para proteger información sensible.

El proyecto está configurado para trabajar con los entornos Sandbox durante la demostración.

---

## Ejecutar localmente

Requisitos:

* Node.js
* npm
* MongoDB
* Credenciales Sandbox de Factus
* Credenciales Sandbox de Factus Pay

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Instalar las dependencias del backend:

```bash
cd backend
npm install
```

Configurar las variables de entorno necesarias en `.env`.

Iniciar el backend:

```bash
npm start
```

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir la dirección indicada por el servidor de desarrollo.

---

## Despliegue

La arquitectura de despliegue propuesta es:

```text
Frontend → Netlify
Backend  → Render
Database → MongoDB Atlas
APIs     → Factus Sandbox + Factus Pay Sandbox
```

---

## ¿Qué aporta FactuLocal?

FactuLocal no busca ser únicamente un sistema para crear facturas.

La propuesta consiste en **conectar el momento del cobro con el momento de la facturación**, reduciendo pasos manuales para el comerciante.

El concepto central es:

> **El cliente paga. FactuLocal detecta el pago. La factura se genera.**

---

## Proyecto

**API WARS 2026 — Hackathon de Integración de APIs**

### Challenge

**Cobra. Factura. Crece.**

### APIs integradas

* Factus
* Factus Pay

### Equipo

* Emanuel Orjuela Barbosa
* [Integrante]
* [Integrante]
* [Integrante]

---

**FactuLocal — Cobra. Factura. Crece.**
