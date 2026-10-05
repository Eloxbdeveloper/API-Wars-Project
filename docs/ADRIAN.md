# ADRIAN CONTEXT — FRONTEND / BILLING

## Rol

**Frontend Developer / Invoice Flow / Business Logic**

Este archivo complementa `PROJECT_CONTEXT.md`.

La IA debe leer ambos archivos antes de modificar código.

---

# 1. Responsabilidad principal

Este integrante es responsable principalmente de la lógica de negocio del frontend relacionada con:

* Facturas.
* Clientes.
* Productos.
* Servicios.
* Formularios.
* Cálculos.
* Validaciones.
* Historial.
* Consumo de nuestra API.
* Estados de las operaciones.

La prioridad es construir correctamente el flujo de facturación.

---

# 2. Área principal

Principalmente:

```text
frontend/
├── pages/
├── components/
├── services/
└── utils/
```

Especialmente los módulos relacionados con:

```text
invoices/
customers/
products/
credit-notes/
```

La estructura exacta debe respetar la estructura creada en el repositorio.

---

# 3. Flujo principal

El flujo debe ser:

```text
Crear factura
      ↓
Seleccionar cliente
      ↓
Agregar productos
      ↓
Definir cantidades
      ↓
Calcular valores
      ↓
Revisar factura
      ↓
Enviar al backend
      ↓
Backend → Factus
      ↓
Resultado
      ↓
Mostrar confirmación
```

---

# 4. Clientes

Implementar la lógica frontend para:

* Listar clientes.
* Seleccionar cliente.
* Crear cliente.
* Validar datos.
* Mostrar información relevante.

Los datos deben enviarse a:

```text
/api/customers
```

cuando ese endpoint esté disponible.

No realizar llamadas directas a Factus.

---

# 5. Productos y servicios

Implementar:

* Listado.
* Selección.
* Creación.
* Precio.
* Cantidad.
* Descripción.
* Impuestos cuando correspondan.

Los datos deben ser consistentes con el modelo backend.

---

# 6. Formulario de factura

El formulario debe permitir construir una factura antes de enviarla.

Conceptualmente:

```text
Cliente
+
Productos
+
Cantidades
+
Precios
+
Impuestos
=
Factura
```

La información debe poder revisarse antes de emitir.

---

# 7. Cálculos

Los cálculos del frontend deben ser claros y predecibles.

Ejemplo:

```text
subtotal
+
impuestos
-
descuentos
=
total
```

No asumir reglas tributarias que no estén definidas.

Cuando un cálculo dependa de la lógica oficial de Factus, verificar la documentación antes de implementarlo.

---

# 8. Validaciones

Validar:

* Campos obligatorios.
* Cliente seleccionado.
* Al menos un producto.
* Cantidades válidas.
* Precios válidos.
* Valores numéricos.
* Datos requeridos.
* Totales.

Ejemplo:

```text
No se puede emitir una factura sin cliente.
```

o:

```text
La factura debe contener al menos un producto o servicio.
```

Las validaciones frontend mejoran UX, pero el backend debe validar nuevamente.

---

# 9. Historial de facturas

Implementar la interfaz para:

```text
GET /api/invoices
```

Debe poder mostrar información como:

```text
Número
Cliente
Fecha
Total
Estado
```

Estados posibles dependerán de la respuesta del backend.

No inventar estados que no existan.

---

# 10. Detalle de factura

Debe existir una vista o componente capaz de mostrar:

* Información del cliente.
* Productos.
* Cantidades.
* Valores.
* Total.
* Estado.
* Referencia.
* Información relevante de emisión.

Los datos definitivos dependerán del contrato del backend.

---

# 11. Consumo de API

Toda comunicación debe realizarse contra nuestra API.

Ejemplo:

```text
Frontend
   ↓
POST /api/invoices
   ↓
Backend
   ↓
Factus
```

Nunca:

```text
Frontend
   ↓
Factus
```

No manejar:

```text
FACTUS_CLIENT_SECRET
FACTUS_PASSWORD
FACTUS_ACCESS_TOKEN
```

desde frontend.

---

# 12. Servicios frontend

Las llamadas HTTP deben mantenerse separadas de la UI cuando sea posible.

Ejemplo conceptual:

```text
services/
├── invoiceService.js
├── customerService.js
└── productService.js
```

La página no debería contener toda la lógica de `fetch`.

Ejemplo:

```text
invoicePage
     ↓
invoiceService
     ↓
API
```

---

# 13. Estados

Toda operación debe contemplar:

```text
idle
loading
success
error
```

Ejemplo:

```text
Emitir factura...
```

Después:

```text
Factura emitida correctamente.
```

o:

```text
No fue posible emitir la factura.
```

---

# 14. Manejo de errores

No mostrar al usuario errores técnicos.

Evitar:

```text
TypeError
HTTP 500
ECONNREFUSED
JSON parse error
```

Mostrar mensajes comprensibles.

Si el backend devuelve:

```json
{
  "success": false,
  "message": "No fue posible emitir la factura."
}
```

utilizar ese mensaje de manera adecuada.

---

# 15. Notas crédito

La interfaz de notas crédito se implementará después del flujo principal de facturación.

Antes de desarrollar:

1. Confirmar contrato del backend.
2. Confirmar comportamiento de Factus.
3. Confirmar datos requeridos.
4. Implementar UI.
5. Implementar validaciones.
6. Probar errores.

No asumir que una factura se puede eliminar simplemente desde frontend.

---

# 16. Coordinación con Emanuel

Emanuel controla principalmente:

```text
Backend
API
Factus
Database
Security
```

Por lo tanto, cualquier cambio necesario en estos puntos debe coordinarse con él.

No modificar directamente la integración Factus para resolver un problema del frontend.

Si falta información, solicitar el contrato API correspondiente.

---

# 17. Coordinación con Frontend / UX

El integrante de UX/UI controla principalmente:

```text
Diseño
Layout
Componentes
Dashboard
Navegación
Responsive
```

Este integrante controla principalmente:

```text
Lógica
Datos
Formularios
Validaciones
Facturación
API consumption
```

Ambos deben trabajar coordinadamente.

No duplicar componentes.

---

# 18. Qué NO debe hacer la IA

La IA asignada a este integrante NO debe:

* Modificar la arquitectura backend.
* Crear endpoints de Factus.
* Manejar credenciales.
* Cambiar la base de datos directamente.
* Cambiar contratos API sin avisar.
* Reescribir componentes visuales completos sin necesidad.
* Eliminar componentes compartidos.
* Crear lógica duplicada.

---

# 19. Antes de modificar código

La IA debe comprobar:

```text
1. ¿Estoy modificando lógica o UI?
2. ¿Quién es responsable de este archivo?
3. ¿Existe un servicio para esta API?
4. ¿Existe un componente reutilizable?
5. ¿El backend ya tiene este endpoint?
6. ¿Estoy cambiando el contrato?
7. ¿El cambio afecta al frontend UX?
```

---

# 20. Pruebas mínimas

Antes de considerar terminada una funcionalidad:

```text
[ ] Flujo correcto
[ ] Datos inválidos
[ ] Campos vacíos
[ ] Error del backend
[ ] Loading
[ ] Success
[ ] Mobile
[ ] Desktop
[ ] No existen errores de consola
```

---

# 21. Formato de respuesta de la IA

Para cambios importantes:

```text
OBJETIVO

ARCHIVOS MODIFICADOS

LÓGICA IMPLEMENTADA

ENDPOINTS UTILIZADOS

VALIDACIONES

ESTADOS MANEJADOS

IMPACTO EN UX/UI

IMPACTO EN BACKEND

PRUEBAS REALIZADAS

POSIBLES PROBLEMAS
```

Si se solicitan archivos completos, entregar archivos completos.

---

# 22. Prioridad

El orden de trabajo recomendado:

```text
1. Clientes
2. Productos
3. Formulario de factura
4. Cálculos
5. Validaciones
6. Revisión
7. Emisión
8. Historial
9. Detalle
10. Notas crédito
```

El flujo de creación y emisión de factura tiene prioridad sobre funcionalidades secundarias.

---

# 23. Regla principal

La IA debe actuar como asistente de desarrollo frontend especializado en el flujo de facturación.

Debe priorizar:

```text
Correctitud de datos
+
Validaciones
+
Flujo claro
+
Integración API
+
Experiencia de usuario
```

La lógica del frontend debe ser compatible con el backend y no debe intentar reemplazar las responsabilidades del backend.

**El objetivo es que crear una factura sea un proceso claro, rápido y confiable.**
