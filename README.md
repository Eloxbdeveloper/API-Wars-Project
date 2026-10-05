# API WARS — Plataforma de Facturación Electrónica

> MVP de facturación electrónica para pequeños negocios, desarrollado para el reto **API WARS** de la Universidad Distrital en colaboración con Factus.

---

## Descripción

Este proyecto busca desarrollar una aplicación web de facturación electrónica orientada principalmente a pequeños negocios que todavía no cuentan con una solución sencilla para gestionar sus facturas electrónicas.

El objetivo no es construir un sistema contable completo, sino desarrollar un **MVP funcional, escalable e intuitivo** que permita al usuario realizar las operaciones esenciales de facturación desde una interfaz clara y fácil de utilizar.

La aplicación utilizará las APIs de **Factus** como servicio de facturación electrónica y contará con una API propia que funcionará como intermediaria entre el frontend, la lógica de negocio, la base de datos y los servicios externos.

La experiencia de usuario es uno de los pilares principales del proyecto. La aplicación será diseñada desde el inicio para funcionar tanto en **computadores como en dispositivos móviles**, evitando simplemente adaptar una interfaz de escritorio posteriormente.

---

# Problema

Muchos pequeños negocios todavía realizan sus procesos de facturación de forma manual o utilizan herramientas que pueden resultar demasiado complejas para sus necesidades.

La facturación electrónica implica conceptos, datos y procesos que un pequeño comerciante no necesariamente conoce o comprende.

El problema que buscamos abordar es:

> **¿Cómo podemos facilitar la facturación electrónica para pequeños negocios mediante una aplicación sencilla, intuitiva y accesible desde cualquier dispositivo?**

La solución debe reducir la complejidad técnica para el usuario final y permitirle concentrarse en su negocio.

---

# Propuesta de solución

Desarrollaremos una plataforma web que permita a un negocio:

* Crear facturas electrónicas.
* Registrar y seleccionar clientes.
* Agregar productos o servicios.
* Calcular los valores correspondientes.
* Revisar una factura antes de emitirla.
* Enviar la información a nuestra API.
* Procesar la factura mediante Factus.
* Consultar el estado de las facturas.
* Consultar el historial de documentos.
* Gestionar información básica del negocio.
* Utilizar la aplicación desde computador, tablet o celular.

Como funcionalidades adicionales, dependiendo del tiempo disponible y de las capacidades de Factus, se contempla:

* Notas crédito.
* Gestión de documentos.
* Reportes.
* Estadísticas.
* Gestión de productos.
* Gestión avanzada de clientes.
* Usuarios y roles.
* Funcionalidades adicionales de administración.

---

# Propuesta de valor

La aplicación se basa en una idea principal:

> **Hacer que la facturación electrónica sea sencilla para los pequeños negocios.**

La tecnología de facturación electrónica puede ser compleja internamente, pero esa complejidad no debería trasladarse al usuario.

Nuestra plataforma busca convertir un proceso técnico en un flujo sencillo:

```text
Seleccionar cliente
        ↓
Agregar productos
        ↓
Revisar factura
        ↓
Emitir
        ↓
Confirmación
```

El usuario no necesita conocer cómo funciona internamente la API de Factus.

La aplicación se encarga de gestionar la comunicación entre el usuario y los servicios de facturación.

---

# Objetivos

## Objetivo general

Desarrollar un MVP web de facturación electrónica que integre las APIs de Factus y proporcione una experiencia de usuario sencilla, intuitiva y responsive para pequeños negocios.

## Objetivos específicos

* Implementar la creación de facturas electrónicas.
* Integrar la aplicación con Factus Sandbox.
* Crear una API propia para centralizar la lógica de negocio.
* Mantener las credenciales y secretos fuera del frontend.
* Implementar una estructura modular y escalable.
* Diseñar una experiencia de usuario orientada a la simplicidad.
* Crear una interfaz responsive para escritorio y dispositivos móviles.
* Implementar manejo de errores y estados.
* Permitir consultar el historial de facturas.
* Preparar la arquitectura para futuras funcionalidades.
* Desplegar una versión funcional del MVP.
* Documentar el proyecto y su arquitectura.
* Presentar una demostración funcional durante el pitch.

---

# Funcionalidades

## MVP — Prioridad alta

### Dashboard

El usuario podrá visualizar información relevante de su negocio.

Ejemplos:

* Cantidad de facturas.
* Facturas recientes.
* Total facturado.
* Estados de documentos.
* Acciones rápidas.

El dashboard no debe convertirse en un sistema de analítica complejo. Su objetivo principal es proporcionar una visión rápida del estado del negocio.

---

## Creación de factura

El usuario podrá iniciar el proceso desde una acción principal:

```text
+ Crear factura
```

El flujo esperado será:

```text
Crear factura
     ↓
Seleccionar / crear cliente
     ↓
Agregar productos o servicios
     ↓
Configurar información de pago
     ↓
Revisar factura
     ↓
Emitir factura
     ↓
Enviar información a nuestra API
     ↓
Procesar mediante Factus
     ↓
Mostrar resultado
```

La interfaz debe minimizar la cantidad de pasos y evitar formularios innecesariamente complejos.

---

## Clientes

El usuario podrá:

* Crear clientes.
* Consultar clientes.
* Seleccionar clientes al generar una factura.
* Visualizar información básica.

---

## Productos y servicios

El sistema podrá manejar productos o servicios utilizados frecuentemente en las facturas.

Información básica:

* Nombre.
* Descripción.
* Precio.
* Cantidad.
* Impuestos cuando correspon
