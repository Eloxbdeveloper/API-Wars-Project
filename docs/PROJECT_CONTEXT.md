
# API WARS — PROJECT CONTEXT

> Archivo central de contexto técnico y organizativo del proyecto.
>
> **Este archivo es la fuente de verdad del proyecto.**
>
> Antes de modificar, crear o eliminar código, cualquier desarrollador o IA debe leer este documento y respetar las decisiones, responsabilidades y convenciones definidas aquí.

---

# 1. Información general

## Nombre provisional

**FactuLocal**

El nombre puede cambiar posteriormente.

## Evento

**API WARS — Universidad Distrital + Factus / Factus Pay**

## Objetivo

Construir un MVP web que facilite la facturación electrónica para pequeños negocios que todavía no cuentan con una solución sencilla para gestionar sus facturas.

El proyecto utilizará la API de **Factus** para la generación y gestión de documentos electrónicos.

La aplicación debe priorizar:

* Simplicidad.
* Facilidad de uso.
* Buena experiencia de usuario.
* Diseño responsive.
* Integración correcta con Factus.
* Arquitectura escalable.
* Manejo adecuado de errores.
* Seguridad de credenciales.
* Código mantenible.

## Problema que buscamos solucionar

La facturación electrónica puede resultar compleja para pequeños negocios que no necesitan inicialmente un sistema contable completo.

Nuestra propuesta es ofrecer una interfaz sencilla que permita:

1. Registrar clientes.
2. Registrar productos o servicios.
3. Crear una factura.
4. Revisar la información antes de emitirla.
5. Emitir la factura mediante Factus.
6. Consultar el historial.
7. Consultar el estado de las facturas.
8. Gestionar notas crédito cuando corresponda.
9. Mostrar información importante de forma clara.

---

# 2. Principio principal del proyecto

## "Simple por diseño"

El sistema NO busca convertirse inicialmente en un software contable completo.

El MVP debe concentrarse en resolver correctamente el flujo principal:

```text
Cliente
   ↓
Producto / Servicio
   ↓
Crear factura
   ↓
Revisar
   ↓
Emitir
   ↓
Factus
   ↓
Resultado
   ↓
Historial
```

Toda funcionalidad adicional debe evaluarse según su impacto en el MVP.

---

# 3. Arquitectura general

La aplicación seguirá esta arquitectura:

```text
                    USUARIO
                       │
                       ▼
                ┌─────────────┐
                │  FRONTEND   │
                │ HTML/CSS/JS │
                └──────┬──────┘
                       │
                     fetch
                       │
                       ▼
                ┌─────────────┐
                │  BACKEND    │
                │ Node/Express│
                └──────┬──────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      DATABASE      SERVICES      FACTUS
                                   API
                                    │
                                    ▼
                                   DIAN
```

## Regla crítica

El frontend **NO debe comunicarse directamente con Factus**.

Las credenciales y tokens de Factus solamente pueden manejarse desde el backend.

Flujo correcto:

```text
Frontend
   ↓
Nuestra API
   ↓
Servicio correspondiente
   ↓
Integración Factus
   ↓
Factus API
```

Nunca:

```text
Frontend
   ↓
Factus API
```

---

# 4. Stack tecnológico

## Frontend

* HTML
* CSS
* JavaScript
* Vite
* Fetch API

El frontend debe estar organizado de manera modular.

## Backend

* Node.js
* Express
* JavaScript

## Base de datos

La base de datos será definida según la implementación inicial del proyecto.

La elección debe mantenerse centralizada y documentada para evitar que cada integrante implemente una solución diferente.

## Integración externa

* Factus API

## Control de versiones

* Git
* GitHub

---

# 5. Estructura general esperada

La estructura base del proyecto debe mantener una separación clara entre frontend y backend.

```text
api-wars/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── styles/
│   └── index.html
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── integrations/
│   │   │   └── factus/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── server.js
│
├── database/
│
├── tests/
│
├── docs/
│   └── PROJECT_CONTEXT.md
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

La estructura real generada por el proyecto puede variar.

**No modificar la estructura global sin evaluar primero el impacto en los otros integrantes.**

---

# 6. Responsabilidades del equipo

El equipo está compuesto por tres integrantes.

Las responsabilidades son áreas principales de trabajo, NO silos.

Todos deben conocer el flujo general del proyecto.

---

# 7. Integrante 1 — Emanuel

## Rol principal

**Tech Lead / Backend / API / Integración Factus**

## Responsabilidades

### Arquitectura

* Definir y mantener la arquitectura general.
* Mantener la separación frontend/backend.
* Definir patrones de comunicación entre módulos.
* Revisar cambios importantes de arquitectura.

### Backend

Responsable principalmente de:

```text
backend/src/routes/
backend/src/controllers/
backend/src/services/
backend/src/integrations/
backend/src/middleware/
backend/src/config/
```

### API propia

Diseñar e implementar los endpoints internos del proyecto.

Ejemplos:

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

Los endpoints definitivos deberán documentarse antes de considerarse estables.

### Factus

Responsable de:

* Autenticación con Factus.
* Manejo de tokens.
* Integración de facturas.
* Integración de notas crédito.
* Integración de rangos de numeración cuando corresponda.
* Manejo de respuestas de Factus.
* Manejo de errores de Factus.
* Normalización de respuestas para el frontend.

La integración debe estar aislada dentro de:

```text
backend/src/integrations/factus/
```

Ejemplo:

```text
factus/
├── auth.js
├── client.js
├── invoices.js
├── credit-notes.js
└── numbering-ranges.js
```

### Seguridad

Responsable de:

* Variables de entorno.
* Protección de credenciales.
* No exponer tokens al frontend.
* Configuración de `.env`.
* `.env.example`.
* Validación de datos provenientes del frontend.
* Manejo de errores sin exponer información sensible.

### Base de datos

Responsable principal de:

* Estructura de modelos.
* Relaciones.
* Persistencia.
* Consultas.
* Integración backend/database.

### Integración frontend/backend

Definir junto con los integrantes 2 y 3:

* Formato de requests.
* Formato de responses.
* Estados.
* Errores.
* Códigos HTTP.

### Revisión

Emanuel será responsable de revisar los cambios que afecten:

* Arquitectura.
* Backend.
* Factus.
* Base de datos.
* Seguridad.
* API pública del proyecto.

---

# 8. Integrante 2 — Frontend / UX/UI

## Rol principal

**Frontend Developer / UX/UI**

## Responsabilidades

### Diseño visual

Responsable de definir:

* Sistema visual.
* Tipografía.
* Espaciado.
* Componentes.
* Botones.
* Formularios.
* Cards.
* Tablas.
* Modales.
* Estados visuales.

### Frontend

Principalmente:

```text
frontend/components/
frontend/pages/
frontend/styles/
frontend/utils/
```

### Dashboard

Responsable del:

* Dashboard principal.
* Resumen de facturación.
* Estados.
* Navegación.
* Acciones principales.
* Visualización de información.

### Navegación

Implementar:

* Sidebar en desktop.
* Navegación adecuada en móvil.
* Rutas/páginas necesarias.
* Estados activos.

### Responsive

El sistema debe funcionar correctamente en:

* Desktop.
* Tablet.
* Mobile.

El responsive debe considerarse desde el inicio, no como una adaptación final.

### UX

Responsable de:

* Reducir pasos innecesarios.
* Diseñar flujos intuitivos.
* Mensajes claros.
* Estados de carga.
* Estados vacíos.
* Estados de error.
* Confirmaciones.
* Feedback después de acciones.

### Componentización

Evitar repetir HTML/CSS/JS cuando pueda utilizarse un componente reutilizable.

---

# 9. Integrante 3 — Frontend / Facturación

## Rol principal

**Frontend Developer / Flujo de Facturación**

## Responsabilidades

### Flujo de creación de factura

Implementar principalmente:

```text
Crear factura
      ↓
Seleccionar cliente
      ↓
Agregar productos
      ↓
Calcular valores
      ↓
Revisar factura
      ↓
Enviar al backend
      ↓
Resultado
```

### Clientes

Responsable del frontend relacionado con:

* Crear cliente.
* Seleccionar cliente.
* Editar información cuando corresponda.
* Validar campos.
* Mostrar clientes.

### Productos y servicios

Responsable de:

* Crear productos.
* Crear servicios.
* Seleccionarlos en la factura.
* Cantidad.
* Precio.
* Impuestos cuando corresponda.
* Cálculos.

### Validaciones

Validar antes de enviar información al backend.

Ejemplos:

* Campos obligatorios.
* Valores numéricos.
* Cantidades.
* Precios.
* Datos del cliente.
* Productos.
* Totales.

Las validaciones del frontend NO reemplazan las validaciones del backend.

### Historial

Responsable de la interfaz relacionada con:

* Lista de facturas.
* Búsqueda.
* Estados.
* Detalle.
* Fecha.
* Cliente.
* Total.

### Consumo de API

Trabajar con Emanuel para consumir:

```text
/api/invoices
/api/customers
/api/products
/api/credit-notes
```

No implementar llamadas directas a Factus.

### Estados

Manejar correctamente:

```text
loading
success
error
empty
```

---

# 10. Responsabilidades compartidas

Los tres integrantes deben:

* Revisar el contexto antes de trabajar.
* Usar Git correctamente.
* Crear ramas para funcionalidades.
* No subir credenciales.
* Documentar decisiones importantes.
* Probar sus cambios.
* Informar cambios que puedan afectar a otro integrante.
* Mantener código legible.
* Evitar duplicación innecesaria.
* Evitar introducir dependencias sin justificación.

---

# 11. Git y ramas

La rama principal será:

```text
main
```

La rama de integración:

```text
develop
```

Las funcionalidades se desarrollarán en ramas:

```text
feature/backend-factus
feature/dashboard
feature/invoice-form
feature/mobile-ui
feature/invoice-history
```

Flujo:

```text
feature/*
     ↓
develop
     ↓
main
```

No realizar commits directamente sobre `main`.

Preferiblemente tampoco realizar cambios directos sobre `develop` cuando correspondan a una funcionalidad.

---

# 12. Convención de commits

Utilizar:

```text
feat:
fix:
refactor:
style:
docs:
test:
```

Ejemplos:

```text
feat: add invoice creation endpoint

fix: handle Factus authentication error

refactor: separate invoice service

style: improve mobile invoice form

docs: update API documentation

test: add invoice validation tests
```

---

# 13. Comunicación entre frontend y backend

El frontend solamente consume nuestra API.

Ejemplo:

```javascript
fetch('/api/invoices', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(invoiceData)
});
```

El frontend NO debe conocer:

* Client secret de Factus.
* Password de Factus.
* Access tokens de Factus.
* Detalles internos de autenticación.

---

# 14. Manejo de errores

Los errores deben ser comprensibles para el usuario.

No mostrar directamente errores técnicos como:

```text
AxiosError
ECONNREFUSED
401 Unauthorized
500 Internal Server Error
```

En su lugar, el backend debe proporcionar respuestas estructuradas.

Ejemplo:

```json
{
    "success": false,
    "message": "No fue posible emitir la factura."
}
```

Los detalles técnicos pueden registrarse internamente cuando sea necesario.

---

# 15. Variables de entorno

Las credenciales reales solamente deben estar en:

```text
.env
```

Nunca subir:

```text
.env
```

a GitHub.

El repositorio debe contener:

```text
.env.example
```

Ejemplo:

```env
PORT=

FACTUS_BASE_URL=
FACTUS_USERNAME=
FACTUS_PASSWORD=
FACTUS_CLIENT_ID=
FACTUS_CLIENT_SECRET=
```

Nunca colocar valores reales en:

* README.
* PROJECT_CONTEXT.md.
* Código fuente.
* Issues.
* Commits.
* Prompts enviados a IAs.
* Capturas de pantalla públicas.

---

# 16. Modelo conceptual de datos

El sistema contempla inicialmente:

```text
Business
Customer
Product
Invoice
InvoiceItem
CreditNote
```

Relación conceptual:

```text
Business
   │
   ├── Customers
   │
   ├── Products
   │
   └── Invoices
          │
          ├── InvoiceItems
          │
          └── CreditNotes
```

El modelo definitivo deberá documentarse cuando se implemente la base de datos.

---

# 17. Factura

Modelo conceptual:

```text
Invoice
├── id
├── referenceCode
├── factusId
├── customerId
├── total
├── status
├── createdAt
└── updatedAt
```

Este modelo puede crecer conforme se requieran más datos.

No agregar campos arbitrariamente sin evaluar si son necesarios para el flujo de negocio o para Factus.

---

# 18. Flujo principal

El flujo principal del MVP será:

```text
INICIO
  ↓
DASHBOARD
  ↓
CREAR FACTURA
  ↓
CLIENTE
  ↓
PRODUCTOS / SERVICIOS
  ↓
REVISAR
  ↓
EMITIR
  ↓
BACKEND
  ↓
FACTUS
  ↓
RESULTADO
  ↓
CONFIRMACIÓN
  ↓
HISTORIAL
```

Este flujo tiene prioridad sobre funcionalidades secundarias.

---

# 19. Notas crédito

Las notas crédito forman parte del alcance adicional del proyecto.

Antes de implementar cualquier operación relacionada con notas crédito:

1. Revisar la documentación oficial de Factus.
2. Confirmar el endpoint.
3. Confirmar los datos requeridos.
4. Confirmar las restricciones fiscales.
5. Implementar primero en backend.
6. Después implementar la interfaz.

No asumir que una factura electrónica válida puede simplemente eliminarse mediante `DELETE`.

Las operaciones sobre documentos electrónicos deben respetar las reglas de Factus y de la facturación electrónica colombiana.

---

# 20. Reglas para Inteligencias Artificiales

Este documento debe proporcionarse a cualquier IA utilizada para programar el proyecto.

Las IAs utilizadas pueden incluir:

* ChatGPT.
* Claude.
* Gemini.
* DeepSeek.
* Otras herramientas.

## Regla 1 — Leer antes de modificar

La IA debe analizar este documento antes de proponer o escribir código.

## Regla 2 — No inventar arquitectura

No crear:

* Frameworks innecesarios.
* Bases de datos diferentes.
* Endpoints arbitrarios.
* Sistemas de autenticación no solicitados.
* Dependencias innecesarias.

Si algo no está definido, debe proponerlo antes de convertirlo en una decisión estructural.

## Regla 3 — Respetar responsabilidades

Una IA no debe modificar módulos pertenecientes a otro integrante sin advertirlo.

Ejemplo:

Si el integrante 3 está trabajando en:

```text
frontend/pages/invoices/
```

la IA no debe modificar simultáneamente:

```text
backend/src/integrations/factus/
```

sin que exista una razón técnica y coordinación con Emanuel.

## Regla 4 — No romper contratos existentes

Si ya existe un endpoint:

```text
POST /api/invoices
```

no cambiar arbitrariamente:

* URL.
* Método HTTP.
* nombres de propiedades.
* estructura de respuesta.

Si es necesario cambiarlo, primero documentar el cambio.

## Regla 5 — No eliminar código sin verificar

Antes de eliminar archivos, funciones o componentes, comprobar si son utilizados por otros módulos.

## Regla 6 — No introducir credenciales

Nunca crear código que contenga credenciales reales.

## Regla 7 — Explicar cambios importantes

Cuando una IA realice modificaciones importantes debe indicar:

```text
ARCHIVOS MODIFICADOS
CAMBIOS REALIZADOS
DEPENDENCIAS NUEVAS
IMPACTO EN OTROS MÓDULOS
PRUEBAS REALIZADAS
```

---

# 21. Reglas de código

Preferencias generales:

* Código modular.
* Nombres descriptivos.
* Funciones pequeñas.
* Evitar duplicación.
* Separación de responsabilidades.
* Manejo explícito de errores.
* Validaciones claras.
* Comentarios solamente cuando aporten contexto.
* No utilizar comentarios para explicar código obvio.

JavaScript debe utilizar sintaxis moderna cuando sea compatible con el proyecto.

---

# 22. Contratos API

Antes de conectar frontend y backend, ambos equipos deben conocer:

```text
Endpoint
Método
Request
Response success
Response error
HTTP status
```

Ejemplo:

```text
POST /api/invoices

Request:
{
    ...
}

Success:
{
    "success": true,
    "data": {
        ...
    }
}

Error:
{
    "success": false,
    "message": "..."
}
```

Los contratos deben mantenerse documentados.

---

# 23. Estado del proyecto

Este documento debe actualizarse cuando ocurra alguna de estas situaciones:

* Se agregue una funcionalidad importante.
* Cambie la arquitectura.
* Cambie la base de datos.
* Cambie un endpoint.
* Se agregue una dependencia importante.
* Cambie una responsabilidad.
* Se tome una decisión técnica importante.
* Se modifique el flujo principal.

No es necesario actualizarlo por cada pequeño cambio de CSS o corrección menor.

---

# 24. Prioridad de desarrollo

El orden recomendado es:

```text
1. Arquitectura
2. Backend base
3. Integración Factus
4. Base de datos
5. Contratos API
6. Frontend base
7. Clientes
8. Productos
9. Creación de factura
10. Emisión
11. Historial
12. Dashboard
13. Notas crédito
14. Mejoras UX/UI
15. Testing
16. Deployment
```

Este orden puede cambiar si el equipo encuentra una dependencia técnica que lo requiera.

---

# 25. MVP

El MVP debe poder demostrar:

```text
Usuario
   ↓
Ingresa al sistema
   ↓
Crea/selecciona cliente
   ↓
Selecciona productos
   ↓
Genera factura
   ↓
Revisa información
   ↓
Emite factura
   ↓
Factus procesa
   ↓
Sistema muestra resultado
   ↓
Factura aparece en historial
```

Si este flujo funciona correctamente, el proyecto tiene una base funcional para el pitch.

---

# 26. Criterio antes de hacer merge

Antes de integrar una funcionalidad:

```text
[ ] El código funciona.
[ ] No rompe funcionalidades existentes.
[ ] No contiene credenciales.
[ ] Respeta la arquitectura.
[ ] Respeta los contratos API.
[ ] Se probaron los casos principales.
[ ] Se probaron errores relevantes.
[ ] Se revisaron imports.
[ ] Se revisaron rutas.
[ ] Se actualizó documentación si era necesario.
```

---

# 27. Regla final

Este proyecto se desarrolla de forma colaborativa.

La prioridad es:

```text
FUNCIONALIDAD
+
ESTABILIDAD
+
SEGURIDAD
+
UX
+
MANTENIBILIDAD
```

No se debe priorizar una solución rápida si genera deuda técnica innecesaria o rompe el trabajo de otro integrante.

Cuando exista una decisión técnica que afecte a todo el proyecto, debe discutirse y documentarse antes de implementarse.

**Este archivo es la fuente de verdad del proyecto.**

Mi recomendación es que este archivo sea **obligatorio para las tres IAs**. Cada uno puede además tener un archivo personal, por ejemplo `docs/TEAM/EMANUEL.md`, `FRONTEND_UX.md` y `FRONTEND_BILLING.md`, pero `PROJECT_CONTEXT.md` debe ser común e intocable salvo decisiones consensuadas.

Cuando ya tengan la estructura que Gemini generó, el siguiente paso importante sería **revisar esa estructura real y adaptar este Context a las carpetas/archivos que ya existen**, en vez de mantener una estructura teórica.

