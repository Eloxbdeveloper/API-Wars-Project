# Contexto del Proyecto: API WARS

## Objetivo
MVP web de facturación electrónica que integre las APIs de Factus y proporcione una experiencia sencilla para pequeños negocios.

## Stack
- Frontend: Vite + JavaScript + CSS
- Backend: Node.js + Express
- Database: MongoDB

## Reglas Críticas
1. **Factus Aislado**: El frontend NUNCA debe comunicarse con Factus.
2. **Sin Credenciales Expuestas**: `.env` está en `.gitignore`. Las credenciales van por variables de entorno en el backend.
3. **Responsive**: Diseño mobile-first, no adaptaciones de escritorio.
