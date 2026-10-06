# API WARS — Plataforma de Facturación Electrónica

> MVP de facturación electrónica para pequeños negocios, desarrollado para el reto **API WARS** de la Universidad Distrital en colaboración con Factus.

---

## Descripción
Este proyecto busca desarrollar una aplicación web de facturación electrónica orientada principalmente a pequeños negocios.
La aplicación utiliza las APIs de **Factus** y cuenta con una API propia (Node.js/Express) que funciona como intermediaria.

## Arquitectura
- **Frontend**: Vite + Vanilla JS estructurado (Mobile-first).
- **Backend**: Node.js + Express (Modular, sin microservicios).
- **Base de Datos**: MongoDB (Ideal para documentos JSON como facturas).
- **Integración**: Factus Sandbox (aislado en el backend).

## Instalación y Ejecución

### 1. Variables de Entorno
Copia el archivo `.env.example` del directorio raíz a `.env` en la carpeta `backend` y completa los valores. NUNCA subas credenciales reales.

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
Comprueba en `http://localhost:3000/api/health`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Estado Actual (Fase 1)
- Estructura base completada.
- Health Check funcionando.
- Integración con Factus preparada estructuralmente (vacía).
- Modelos Mongoose preparados estructuralmente (vacíos).
