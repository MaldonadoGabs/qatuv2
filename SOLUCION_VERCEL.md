# Solución: Problemas de Despliegue en Vercel

## 🔍 Problema Identificado

Cuando reorganizaste el proyecto y usaste rutas relativas (`./` y `../../`), Vercel tuvo problemas para resolver correctamente las rutas de los archivos estáticos (CSS, JS, imágenes).

## ✅ Soluciones Aplicadas

### 1. Archivo `vercel.json` Creado
Se creó un archivo de configuración para Vercel que define correctamente las rutas:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".",
  "routes": [...]
}
```

### 2. Rutas Relativas → Rutas Absolutas

Se cambiaron **todas las rutas relativas a rutas absolutas** en:

#### Archivos HTML:
- ✅ `index.html`
- ✅ `src/pages/login.html`
- ✅ `src/pages/registro.html`
- ✅ `src/pages/dashboard-vendedor.html`

**Ejemplo de cambios:**
```html
<!-- ANTES -->
<link rel="stylesheet" href="./src/styles/style.css" />
<img src="../../public/images/logo.png" />

<!-- DESPUÉS -->
<link rel="stylesheet" href="/src/styles/style.css" />
<img src="/public/images/logo.png" />
```

#### Archivos TypeScript:
- ✅ `src/scripts/login.ts`
- ✅ `src/scripts/registro.ts`
- ✅ `src/scripts/dashboard.ts`
- ✅ `src/scripts/dashboard-vendedor.ts`

**Ejemplo de cambios:**
```typescript
// ANTES
window.location.href = 'login.html';

// DESPUÉS
window.location.href = '/src/pages/login.html';
```

### 3. Recompilación de TypeScript
Se ejecutó `npm run build` para regenerar todos los archivos JavaScript con las nuevas rutas.

## 📋 Archivos Modificados

### Archivos HTML (4)
1. `index.html`
2. `src/pages/login.html`
3. `src/pages/registro.html`
4. `src/pages/dashboard-vendedor.html`

### Archivos TypeScript (4)
1. `src/scripts/login.ts`
2. `src/scripts/registro.ts`
3. `src/scripts/dashboard.ts`
4. `src/scripts/dashboard-vendedor.ts`

### Archivos de Configuración (1)
1. `vercel.json` (nuevo)

### Archivos Compilados (4)
1. `dist/login.js`
2. `dist/registro.js`
3. `dist/dashboard.js`
4. `dist/dashboard-vendedor.js`

## 🚀 Pasos para Desplegar

### 1. Verificar cambios
```bash
git status
```

### 2. Agregar todos los cambios
```bash
git add .
```

### 3. Hacer commit
```bash
git commit -m "fix: actualizar rutas a absolutas para compatibilidad con Vercel"
```

### 4. Push a GitHub
```bash
git push origin main
```

### 5. Vercel se desplegará automáticamente
- Vercel detectará el push
- Ejecutará `npm run build`
- Desplegará con las nuevas rutas
- ✅ Todo debería funcionar correctamente

## 🎯 Por qué esto soluciona el problema

### Rutas Relativas (❌ Problemáticas)
```
./archivo.css          → Relativo al archivo actual
../../public/img.png   → Sube 2 niveles y busca
```
**Problema**: En Vercel, cuando navegas entre páginas, el contexto cambia y las rutas relativas se rompen.

### Rutas Absolutas (✅ Solución)
```
/src/styles/style.css  → Siempre desde la raíz
/public/images/logo.png → Siempre desde la raíz
```
**Ventaja**: Funcionan desde cualquier página, sin importar el nivel de anidamiento.

## 🧪 Probar Localmente

Antes de hacer push, prueba localmente con:

```bash
# Iniciar servidor local
npx serve .

# O con Python
python -m http.server 8000

# O con PHP
php -S localhost:8000
```

Abre `http://localhost:8000` y verifica que todo funcione.

## ✨ Resultado Esperado

Después del despliegue en Vercel:
- ✅ La página principal carga correctamente
- ✅ Los estilos CSS se aplican
- ✅ Las imágenes se muestran
- ✅ Los scripts JavaScript funcionan
- ✅ La navegación entre páginas funciona
- ✅ El login y registro redirigen correctamente
- ✅ El dashboard de vendedor muestra las estadísticas

## 🔧 Si aún hay problemas

Si después del despliegue sigues viendo problemas:

1. **Limpiar caché de Vercel**
   - Ve a tu proyecto en Vercel
   - Settings → Deployments → Redeploy

2. **Verificar logs de Vercel**
   - Revisa los logs de build en Vercel Dashboard
   - Busca errores en la consola del navegador (F12)

3. **Verificar que el build se ejecutó**
   - En Vercel, verifica que existe la carpeta `dist/` con los archivos .js

## 📝 Notas Adicionales

- El archivo `vercel.json` le indica a Vercel cómo servir los archivos
- Las rutas absolutas (`/`) siempre empiezan desde la raíz del dominio
- TypeScript se recompila antes de cada despliegue (gracias a `buildCommand`)
- Los archivos en `dist/` deben estar en el repositorio para que Vercel los sirva

¡Listo! Ahora puedes hacer push y tu proyecto debería desplegarse correctamente en Vercel. 🎉
