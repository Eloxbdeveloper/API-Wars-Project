# TEAM MEMBER CONTEXT — EMANUEL

## Rol

**Tech Lead / Backend Developer / Factus Integration**

Este archivo complementa `PROJECT_CONTEXT.md`.

El archivo `PROJECT_CONTEXT.md` contiene las reglas generales del proyecto. Este documento contiene las responsabilidades específicas de Emanuel.

La IA debe leer ambos archivos antes de modificar código.

---

# 1. Responsabilidad principal

Emanuel es responsable principalmente de:

* Arquitectura backend.
* API propia del proyecto.
* Integración con Factus.
* Base de datos.
* Seguridad.
* Variables de entorno.
* Autenticación con Factus.
* Contratos entre frontend y backend.
* Manejo de errores del backend.
* Integración y deployment.
* Revisión técnica de cambios importantes.

Emanuel también puede colaborar en frontend cuando sea necesario, pero su prioridad es mantener estable la arquitectura y el backend.

---

# 2. Área principal de trabajo

La mayor parte del trabajo se realizará en:

```text
backend/
```

Especialmente:

```text
backend/src/
├── routes/
├── controllers/
├── services/
├── integrations/
│   └── factus/
├── models/
├── middleware/
├── config/
└── server.js
```

También puede modificar:

```text
database/
tests/
docs/
.env.example
.gitignore
```

cuando corresponda.

---

# 3. Arquitectura backend

El backend debe mantener separación de responsabilidades:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Integration
  ↓
External API
```

Ejemplo:

```text
POST /api/invoices
        ↓
invoiceRoutes
        ↓
invoiceController
        ↓
invoiceService
        ↓
factus/invoices
        ↓
Factus API
```

Las rutas no deben contener lógica de negocio compleja.

Los controllers deben encargarse principalmente de recibir la solicitud y devolver la respuesta.

Los services contienen la lógica de negocio.

Las integraciones externas contienen la comunicación específica con APIs externas.

---

# 4. Integración Factus

La integración con Factus es una de las responsabilidades principales.

Debe estar aislada:

```text
backend/src/integrations/factus/
```

Posible estructura:

```text
factus/
├── auth.js
├── client.js
├── invoices.js
├── credit-notes.js
└── numbering-ranges.js
```

No implementar endpoints de Factus basándose en suposiciones.

Antes de implementar una operación:

1. Revisar documentación oficial de Factus.
2. Confirmar método HTTP.
3. Confirmar endpoint.
4. Confirmar headers.
5. Confirmar body.
6. Confirmar respuesta.
7. Confirmar errores.
8. Implementar.
9. Probar.

---

# 5. Credenciales

Nunca colocar credenciales directamente en el código.

Utilizar:

```text
.env
```

y variables:

```env
FACTUS_BASE_URL=
FACTUS_USERNAME=
FACTUS_PASSWORD=
FACTUS_CLIENT_ID=
FACTUS_CLIENT_SECRET=
```

El repositorio solamente debe contener:

```text
.env.example
```

Nunca mostrar credenciales en:

* Código.
* README.
* PROJECT_CONTEXT.md.
* Commits.
* Issues.
* Prompts.
* Capturas.
* Respuestas de la IA.

---

# 6. API propia

Responsable de diseñar y mantener los contratos de nuestra API.

Endpoints iniciales:

```http
GET    /api/health

POST   /api/invoices
GET    /api/invoices
GET    /api/invoices/:id

GET    /api/customers
POST   /api/customers

GET    /api/products
POST   /api/products

POST   /api/credit-notes
GET    /api/credit-notes/:id

GET    /api/dashboard
```

Estos endpoints son una propuesta inicial y no deben considerarse definitivos hasta implementarlos y documentarlos.

---

# 7. Contratos API

Antes de modificar un endpoint existente, revisar cómo lo está consumiendo el frontend.

Una respuesta exitosa debería mantener una estructura consistente.

Ejemplo:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "No fue posible procesar la solicitud."
}
```

No cambiar arbitrariamente los nombres de propiedades o estructuras de respuesta.

Si un cambio es necesario, comunicarlo y actualizar la documentación.

---

# 8. Base de datos

Responsabilidad principal sobre:

```text
Business
Customer
Product
Invoice
InvoiceItem
CreditNote
```

El modelo debe diseñarse pensando en:

* Integridad.
* Escalabilidad.
* Relaciones.
* Consultas frecuentes.
* Persistencia de información de Factus.
* Historial.
* Estados.

No almacenar solamente información visual del frontend.

La base de datos debe representar el dominio real de facturación.

---

# 9. Seguridad

Debe garantizar:

* Credenciales protegidas.
* Tokens protegidos.
* Validación de entrada.
* Manejo correcto de errores.
* No exposición de información sensible.
* Separación entre frontend y Factus.

El frontend nunca debe recibir secretos de Factus.

---

# 10. Manejo de errores

Normalizar errores externos.

Ejemplo:

Factus puede devolver información técnica.

El backend debe convertirla a una respuesta útil para nuestra aplicación.

No enviar directamente al usuario:

```text
stack traces
tokens
credentials
internal paths
```

Cuando sea posible:

```json
{
  "success": false,
  "message": "No fue posible emitir la factura."
}
```

Los detalles técnicos pueden registrarse internamente.

---

# 11. Health Check

El backend debe tener:

```http
GET /api/health
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "API WARS API is running"
}
```

Este endpoint sirve para verificar rápidamente que el backend funciona.

---

# 12. Coordinación con frontend

Antes de que frontend implemente un consumo definitivo, Emanuel debe ayudar a definir:

```text
Endpoint
HTTP method
Request body
Response
HTTP status
Error format
```

Ejemplo:

```text
POST /api/invoices

Frontend
    ↓
JSON
    ↓
Backend
    ↓
Validación
    ↓
Service
    ↓
Factus
    ↓
Response
    ↓
Frontend
```

---

# 13. Qué NO debe hacer la IA

La IA asignada a Emanuel NO debe:

* Mover la arquitectura sin justificarlo.
* Cambiar de framework sin consenso.
* Crear otra API paralela.
* Conectar frontend directamente con Factus.
* Crear credenciales falsas dentro del código.
* Cambiar contratos API sin avisar.
* Eliminar módulos utilizados por frontend.
* Reescribir todo el backend innecesariamente.
* Introducir dependencias sin justificación.
* Implementar endpoints de Factus inventados.

---

# 14. Antes de modificar código

La IA debe comprobar:

```text
1. ¿Qué archivo voy a modificar?
2. ¿Quién es responsable de ese archivo?
3. ¿Qué otros módulos dependen de él?
4. ¿Existe un contrato API relacionado?
5. ¿El cambio afecta al frontend?
6. ¿El cambio afecta a Factus?
7. ¿Necesito actualizar PROJECT_CONTEXT.md?
```

---

# 15. Formato de respuesta de la IA

Cuando se solicite una implementación importante, la IA debe responder indicando:

```text
OBJETIVO

ARCHIVOS MODIFICADOS

CAMBIOS REALIZADOS

DEPENDENCIAS NUEVAS

IMPACTO EN FRONTEND

IMPACTO EN BACKEND

IMPACTO EN FACTUS

PRUEBAS REALIZADAS

POSIBLES RIESGOS
```

Si se solicitan archivos completos, entregar archivos completos y listos para copiar.

---

# 16. Prioridad de trabajo

Prioridad:

```text
1. Backend base
2. Configuración
3. Base de datos
4. Autenticación Factus
5. Integración Factus
6. API de facturas
7. API de clientes
8. API de productos
9. Notas crédito
10. Validaciones
11. Testing
12. Deployment
```

No avanzar a funcionalidades complejas si la base arquitectónica todavía es inestable.

---

# 17. Regla principal

La IA debe actuar como asistente de desarrollo de Emanuel, no como responsable autónomo de cambiar la arquitectura.

Debe:

* Analizar primero.
* Respetar el contexto.
* Identificar dependencias.
* Proponer cambios.
* Implementar solamente lo necesario.
* Mantener compatibilidad.
* Informar impactos.

**La arquitectura y las decisiones finales pertenecen al equipo, no a la IA.**
