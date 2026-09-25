# Mealify

App de recetas + planificador semanal. Portfolio personal.
Deploy: Vercel (push a main = deploy automático a producción).

## Stack
- React 19 + Vite, en JavaScript (sin TypeScript). Estado con hooks propios, sin router ni librería de estado
- API: Spoonacular, siempre a través de funciones serverless en /api (la key nunca va al cliente)
- Íconos: Font Awesome (CDN). Tipografías: Poppins (general), Baloo 2 (solo #btnEmpezar)
- Estilos: style.css global (se importa en src/main.jsx); los componentes usan las mismas clases/IDs que la versión vanilla
- Persistencia: localStorage (favoritos, plan, comprasMarcadas, comprasOcultas), sessionStorage (cache recetas iniciales)

## Estructura
- src/App.jsx: estado de la app (sección activa, búsqueda, modales) y conexión entre componentes
- src/components/: Landing, Header, Buscar, RecetaCard, Favoritos, Planificador (drag & drop nativo), ListaCompras, modales
- src/hooks/: useFavoritos, usePlanSemanal, useCompras (envuelven storage.js), useRecetasDetalle (cache compartido de detalles)
- src/lib/: api.js (llamadas a /api/*), storage.js (localStorage), listaCompras.js (agrupa ingredientes), constantes.js (días/franjas)
- api/buscar.js, api/detalle.js, api/random.js: funciones serverless (proxy a Spoonacular); api/_lib/mock.js cachea respuestas en mocks/ fuera de producción
- vite.config.js: plugin `api-local` que monta los handlers de /api en el dev server (mismo código que producción)

## Comandos
- Local: npm run dev (necesita SPOONACULAR_KEY en .env)
- Build: npm run build
- Deploy: push a main

## Dos computadoras
El proyecto se trabaja en dos computadoras, que tienen que tener siempre la misma versión:
- Al empezar: `git fetch` y `git status`. Si la rama está atrasada respecto de GitHub, hacer `git pull` antes de tocar nada.
- Al terminar: no dejar commits sin subir. Hacer push de la rama de trabajo, aunque el trabajo no esté terminado.
- Commitear los mocks nuevos de `mocks/`, así la otra compu no gasta cuota de Spoonacular pidiendo lo mismo.
- Después de un `npm install` que cambie dependencias, commitear `package.json` y `package-lock.json`; en la otra compu, correr `npm install` después del pull.
- `.env` (SPOONACULAR_KEY) y `.claude/settings.local.json` no se suben a git: hay que tenerlos en ambas compus por separado.
- Si `npm run dev` está corriendo mientras se cambia de rama o se hace pull, reiniciarlo (el plugin de /api puede quedar en mal estado).

## Reglas
- Commits y PRs sin atribución a Claude: nada de `Co-Authored-By: Claude` ni "Generated with Claude Code"
- Nunca exponer la API key en código del cliente ni commitearla
- El plan guarda IDs como string; no cambiar las claves ni la forma de los datos en localStorage sin migrarlos
- No usar `vercel dev` (crashea en Windows, bug conocido de la herramienta)
- Nombres de variables y funciones en español, camelCase
- No agregar librerías ni frameworks sin preguntar
- No tocar la carpeta .vercel/
