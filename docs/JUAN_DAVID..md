# JUAN DAVID CONTEXT — FRONTEND / UX / UI

## Rol

**Frontend Developer / UX/UI**

Este archivo complementa `PROJECT_CONTEXT.md`.

La IA debe leer ambos archivos antes de modificar código.

---

# 1. Responsabilidad principal

Este integrante es responsable principalmente de:

* Diseño visual.
* UX.
* Dashboard.
* Navegación.
* Componentes reutilizables.
* Responsive design.
* Estados visuales.
* Layout general.
* Consistencia visual.

La prioridad es crear una interfaz sencilla y clara para pequeños negocios.

---

# 2. Área principal de trabajo

Principalmente:

```text
frontend/
├── components/
├── pages/
├── styles/
├── utils/
└── index.html
```

También puede modificar servicios frontend cuando sea necesario para integrar la interfaz con nuestra API.

---

# 3. Principio UX

El producto debe seguir:

> Simple por diseño.

El usuario no debería necesitar conocimientos técnicos para generar una factura.

Evitar:

* Formularios innecesariamente largos.
* Interfaces saturadas.
* Terminología técnica.
* Acciones ambiguas.
* Información innecesaria.
* Errores difíciles de interpretar.

---

# 4. Dashboard

Responsable principal del dashboard.

Debe permitir visualizar rápidamente información como:

* Facturas recientes.
* Total facturado.
* Estados.
* Acciones principales.
* Información relevante del negocio.

La interfaz debe priorizar las acciones importantes.

Ejemplo:

```text
Dashboard

[ Nueva factura ]

Facturación
--------------------------------
Total       Facturas       Pendientes

Actividad reciente
--------------------------------
Factura #...
Factura #...
Factura #...
```

La información definitiva dependerá del backend disponible.

---

# 5. Navegación

Desktop:

```text
Sidebar
├── Inicio
├── Facturas
├── Clientes
├── Productos
└── Notas crédito
```

Mobile:

La navegación debe adaptarse a pantallas pequeñas.

No simplemente reducir el sidebar de desktop.

---

# 6. Componentes

Crear componentes reutilizables cuando sea necesario.

Ejemplos:

```text
Button
Input
Select
Modal
Card
Table
Badge
Alert
Loader
EmptyState
ConfirmDialog
```

Evitar copiar y pegar estructuras idénticas.

---

# 7. Sistema visual

Mantener consistencia en:

* Tipografía.
* Tamaños.
* Espaciado.
* Bordes.
* Radios.
* Botones.
* Inputs.
* Estados.
* Iconografía.

Los componentes deben compartir criterios visuales.

No crear estilos completamente diferentes para cada página.

---

# 8. Responsive Design

Debe probarse como mínimo en:

```text
Mobile
Tablet
Desktop
```

Las interfaces importantes deben seguir siendo utilizables en pantallas pequeñas.

Priorizar:

* Touch targets adecuados.
* Formularios cómodos.
* Tablas adaptables.
* Navegación accesible.
* Texto legible.
* Botones visibles.

---

# 9. Estados de interfaz

Toda operación que dependa del backend debe contemplar:

```text
loading
success
error
empty
```

Ejemplo:

```text
Cargando facturas...
```

Si no existen:

```text
Aún no tienes facturas.
```

Si ocurre un error:

```text
No pudimos cargar tus facturas.
Intenta nuevamente.
```

No mostrar errores técnicos al usuario.

---

# 10. UX del flujo principal

El flujo principal:

```text
Inicio
 ↓
Crear factura
 ↓
Cliente
 ↓
Productos
 ↓
Revisar
 ↓
Emitir
 ↓
Confirmación
```

La interfaz debe hacer evidente en qué paso se encuentra el usuario.

---

# 11. Integración con backend

Este integrante consume únicamente nuestra API.

Ejemplo:

```text
Frontend
   ↓
/api/invoices
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

No almacenar credenciales de Factus en frontend.

---

# 12. Coordinación con Emanuel

Cuando el frontend necesite información del backend, solicitar o consultar:

```text
Endpoint
Método
Request
Response
Estados HTTP
Error format
```

No inventar contratos.

Si el backend todavía no existe, se pueden utilizar datos mock temporalmente, pero deben estar claramente identificados.

---

# 13. Coordinación con Integrante 3

Integrante 2 debe coordinar con Integrante 3 para evitar que ambos modifiquen simultáneamente los mismos componentes.

Responsabilidad principal:

```text
Integrante 2
→ estructura visual
→ componentes
→ UX
→ dashboard
→ navegación
```

Mientras:

```text
Integrante 3
→ lógica de facturación
→ formularios
→ clientes
→ productos
→ historial
```

Ambos pueden trabajar sobre componentes compartidos, pero deben coordinar cambios.

---

# 14. Qué NO debe hacer la IA

La IA de este integrante NO debe:

* Modificar backend sin necesidad.
* Cambiar endpoints.
* Cambiar modelos de base de datos.
* Integrar directamente Factus.
* Agregar librerías grandes sin justificación.
* Cambiar toda la arquitectura frontend.
* Eliminar componentes utilizados por otras páginas.
* Crear múltiples sistemas de estilos incompatibles.

---

# 15. Antes de modificar código

La IA debe comprobar:

```text
1. ¿Qué componente estoy modificando?
2. ¿Lo utiliza otra página?
3. ¿Es un componente compartido?
4. ¿Afecta responsive?
5. ¿Afecta al integrante 3?
6. ¿Consume un endpoint existente?
7. ¿Estoy cambiando un contrato API?
```

---

# 16. Calidad visual

Antes de considerar terminada una interfaz:

```text
[ ] Desktop correcto
[ ] Tablet correcto
[ ] Mobile correcto
[ ] Estados loading
[ ] Estado vacío
[ ] Estado error
[ ] Estado success
[ ] Botones funcionales
[ ] Formularios claros
[ ] No hay elementos desbordados
[ ] No hay texto cortado
[ ] Navegación clara
```

---

# 17. Formato de respuesta de la IA

Para cambios importantes:

```text
OBJETIVO

ARCHIVOS MODIFICADOS

CAMBIOS VISUALES

CAMBIOS UX

COMPONENTES NUEVOS

COMPONENTES MODIFICADOS

IMPACTO EN OTROS MÓDULOS

PRUEBAS RESPONSIVE

POSIBLES PROBLEMAS
```

Si se solicita código completo, entregar archivos completos.

---

# 18. Regla principal

La IA debe actuar como asistente frontend y UX.

Debe priorizar:

```text
Usabilidad
+
Claridad
+
Consistencia
+
Responsive
+
Mantenibilidad
```

No sacrificar la experiencia del usuario por agregar funcionalidades innecesarias.

**El diseño debe hacer que la facturación electrónica parezca sencilla.**
