# FactuLocal

FactuLocal es una aplicación web creada para pequeños negocios que necesitan cobrar a sus clientes y generar facturas electrónicas.

La aplicación conecta **Factus Pay** y **Factus** para que el proceso sea automático.

En lugar de cobrar primero y después hacer la factura manualmente, FactuLocal conecta ambos pasos:

```text
Cliente paga
    ↓
FactuLocal confirma el pago
    ↓
Factus genera la factura electrónica
```

---

## ¿Cómo funciona?

El proceso completo es:

```text
1. El negocio crea una factura
             ↓
2. FactuLocal genera un cobro
             ↓
3. Factus Pay crea el cobro
             ↓
4. El cliente realiza el pago
             ↓
5. FactuLocal detecta que el pago fue realizado
             ↓
6. FactuLocal envía la factura a Factus
             ↓
7. Factus valida y genera la factura electrónica
             ↓
8. El negocio puede ver la factura
```

La idea principal es conectar el **cobro** con la **facturación**.

---

# ¿Qué hace Factus Pay?

Factus Pay se utiliza para realizar el cobro.

Cuando el negocio quiere cobrar una venta, FactuLocal le pide al backend que cree un cobro en Factus Pay.

Factus Pay genera una referencia del cobro y un QR para que el cliente pueda realizar el pago.

```text
FactuLocal
    ↓
Backend
    ↓
Factus Pay
    ↓
Cobro
    ↓
QR / referencia
    ↓
Cliente paga
```

Factus Pay también informa el estado del cobro.

Por ejemplo:

```text
started
   ↓
ready
   ↓
paid
```

Cuando el estado llega a `paid`, significa que el pago fue confirmado.

---

# ¿Qué hace Factus?

Factus se utiliza para generar la factura electrónica.

FactuLocal espera primero a que Factus Pay confirme el pago.

Cuando el pago está confirmado, el backend envía la información de la venta a Factus.

```text
Pago confirmado
       ↓
     Factus
       ↓
Factura electrónica
```

Factus procesa y valida la factura.

Después devuelve información como:

* Número de factura.
* CUFE.
* QR de la factura.
* Documento público.
* Estado de la factura.

---

# ¿Por qué usamos las dos APIs?

Cada API tiene una función diferente.

```text
FACTUS PAY
    ↓
Se utiliza para COBRAR


FACTUS
    ↓
Se utiliza para FACTURAR
```

FactuLocal conecta ambas.

```text
             FACTULOCAL

        ┌─────────────────┐
        │                 │
        ▼                 ▼
   Factus Pay           Factus
        │                 │
        ▼                 ▼
      Cobro            Factura
```

Por eso la aplicación no solamente integra las APIs de forma independiente.

La integración importante es:

```text
Factus Pay
    ↓
Pago confirmado
    ↓
Factus
    ↓
Factura electrónica
```

---

# Arquitectura

La aplicación tiene tres partes principales:

```text
Usuario
   ↓
Frontend
   ↓
Backend
   ↓
┌───────────────┐
│               │
▼               ▼
Factus Pay     Factus
```

El usuario interactúa únicamente con FactuLocal.

El frontend se comunica con nuestro backend.

El backend se comunica con Factus Pay y Factus.

Esto es importante porque las credenciales de las APIs permanecen en el backend y no se exponen al usuario.

---

# Flujo completo de una venta

Supongamos que un pequeño negocio vende un producto.

### 1. Crear la factura

El negocio selecciona:

* Cliente.
* Producto.
* Cantidad.
* Precio.

FactuLocal prepara la información de la factura.

### 2. Generar el cobro

El negocio selecciona la opción para generar el cobro.

El backend crea el cobro en Factus Pay.

```text
FactuLocal
    ↓
Factus Pay
    ↓
Cobro creado
```

### 3. El cliente paga

Factus Pay proporciona el medio de pago correspondiente.

En el entorno de prueba se puede utilizar el simulador de Factus Pay.

```text
Cobro
  ↓
Cliente
  ↓
Pago
```

### 4. FactuLocal detecta el pago

FactuLocal consulta el estado del cobro.

Cuando Factus Pay responde:

```text
paid
```

FactuLocal sabe que el cliente ya pagó.

### 5. Se genera automáticamente la factura

El backend toma la información de la venta y la envía a Factus.

```text
paid
 ↓
Factus
 ↓
Factura validada
```

### 6. El negocio obtiene la factura

Factus devuelve los datos de la factura.

FactuLocal muestra:

```text
Número de factura
CUFE
QR
Documento
```

---

# QR de pago y QR de factura

En el proceso aparecen dos QR diferentes.

El primero pertenece a **Factus Pay**.

Su función es permitir el pago:

```text
QR Factus Pay
      ↓
    Pagar
```

El segundo pertenece a **Factus**.

Aparece después de generar la factura y está relacionado con el documento electrónico:

```text
QR Factus
    ↓
Factura electrónica
```

No son el mismo QR ni tienen la misma función.

---

# Base de datos

FactuLocal utiliza MongoDB para guardar la información necesaria para el funcionamiento de la aplicación.

Entre los datos manejados se encuentran:

```text
Clientes
Productos
Facturas
Pagos
```

Los pagos se relacionan con las facturas para poder saber qué pago corresponde a cada venta.

---

# Dashboard

FactuLocal también incluye un dashboard para consultar la información del negocio.

Permite visualizar:

* Total facturado.
* Facturas emitidas.
* Facturas pendientes.
* Pagos confirmados.
* Evolución de las ventas.
* Últimas facturas.

La información puede consultarse por diferentes períodos.

---

# Tecnologías utilizadas

### Frontend

* HTML
* CSS
* JavaScript
* Vite

### Backend

* Node.js
* Express
* JavaScript

### Base de datos

* MongoDB
* Mongoose

### APIs

* Factus
* Factus Pay

### Deployment

* Vercel para el frontend.
* Render para el backend.
* MongoDB Atlas para la base de datos.

---

# Seguridad

El frontend nunca se conecta directamente con Factus ni con Factus Pay.

La comunicación funciona así:

```text
Usuario
   ↓
Frontend
   ↓
Backend FactuLocal
   ↓
Factus / Factus Pay
```

Las credenciales de Factus, Factus Pay y MongoDB se almacenan como variables de entorno.

Los archivos con credenciales reales no se encuentran en el repositorio.

---

# Sandbox

El proyecto utiliza los entornos Sandbox de Factus y Factus Pay.

Esto significa que las operaciones utilizadas durante la demostración son de prueba y no representan pagos reales.

El flujo de demostración es:

```text
Crear venta
    ↓
Generar cobro
    ↓
Factus Pay
    ↓
Simular pago
    ↓
Pago confirmado
    ↓
Factus
    ↓
Factura electrónica
```

---

# Estructura del proyecto

```text
API-Wars-Project/
│
├── frontend/
│   └── Aplicación web
│
├── backend/
│   └── API y lógica del sistema
│
├── .gitignore
│
└── README.md
```

Dentro del backend se encuentran principalmente:

```text
controllers/
    Manejan las peticiones

models/
    Representan los datos

routes/
    Definen las rutas de la API

services/
    Contienen la lógica del negocio

integrations/
    Conectan FactuLocal con Factus
    y Factus Pay
```

---

# Integración principal

La parte más importante del proyecto es esta:

```text
                 FACTULOCAL
                     │
                     ▼
                  Backend
                     │
             ┌───────┴───────┐
             │               │
             ▼               ▼
        FACTUS PAY         FACTUS
             │               │
             ▼               ▼
           COBRO           FACTURA
             │
             ▼
          CLIENTE
             │
             ▼
           PAGA
             │
             ▼
       Pago confirmado
             │
             └──────────────► FACTUS
                                  │
                                  ▼
                         Factura electrónica
```

En resumen:

**Factus Pay cobra.**

**Factus factura.**

**FactuLocal conecta ambos procesos.**

---

# Objetivo del proyecto

El objetivo de FactuLocal es simplificar el proceso de venta para pequeños negocios.

En una sola aplicación, el negocio puede:

```text
Crear venta
    ↓
Cobrar
    ↓
Confirmar pago
    ↓
Facturar
    ↓
Consultar factura
```

Así, una venta puede pasar desde el cobro hasta la factura electrónica sin que el negocio tenga que realizar manualmente cada paso.

---

## API WARS 2026

FactuLocal fue desarrollado para el reto de integración de APIs de **API WARS 2026**.

El proyecto responde al concepto:

> **Cobra. Factura. Crece.**

La solución utiliza las dos APIs principales del reto:

**Factus Pay → Cobros**

**Factus → Facturación electrónica**

y crea un flujo integrado entre ambas.


## Autores

Proyecto desarrollado por el equipo de **API WARS 2026**.

* Emanuel Orjuela Barbosa - eloxbdevcollabs@hotmail.com
* Juan David Useche Perez
* Adrián Rueda Garzon


