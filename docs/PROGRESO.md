# Progreso de Mealify

> Última actualización: 2026-09-25 · Rama de trabajo: `mejoras-critica` · Último commit en main: `ecea097 Merge pull request #4 from matucastelli/mejoras-critica`

## Estado actual
Se está ejecutando el plan de mejoras que salió de la crítica de diseño de Impeccable (puntaje 17/40). Los commits 1 y 2 están mergeados. La rama `mejoras-critica` está sincronizada con `main`. Se agregó la skill `progreso-proyecto` para mantener este archivo al día entre las dos compus.

## Próximo paso
Commit 3 del plan: feedback de las acciones (aviso al agregar al plan, tab activo, "Ver receta" con carga y error, distinguir error de red de "sin resultados").

## Plan en curso: mejoras de la crítica
- [x] 1. Modales accesibles: solo existen abiertos, foco, Escape, clic en el fondo (PR #3)
- [x] 2. Menú del celular: se cierra al navegar, inert, áreas táctiles de 44px (PR #4)
- [ ] 3. Feedback de las acciones ← siguiente
- [ ] 4. Layout de tarjetas en celular (sin desborde, acciones en su fila, input de 16px)
- [ ] 5. Planificador sin arrastrar ("Mover a…", "+ Agregar" por franja)
- [ ] 6. Lista de compras por pasillo (cantidades limpias, contador, receta de origen)
- [ ] 7. Textos en español (diccionario de pasillos, unidades, categorías; días con tilde; h2 por sección)
- [ ] 8. Detalle de receta (pasos numerados, acciones en el modal, imagen de reemplazo)
- [ ] 9. Pulido visual (tipografía en controles, grilla de favoritos, mockup de la landing)

## Decisiones
- 2026-09-25: un PR por commit, todos desde la rama `mejoras-critica`. Mergear cada PR con "Create a merge commit" antes de empezar el siguiente; después, `git pull origin main` en la rama.
- 2026-09-25: no tocar los colores (el contraste del naranja queda fuera del plan).
- 2026-09-25: la interfaz queda toda en español, con un diccionario para el vocabulario fijo. El contenido de las recetas sigue en inglés porque Spoonacular solo ofrece inglés y alemán.
- 2026-09-25: antes de sumar una librería, se consulta explicando qué hace y por qué.
- 2026-09-25: la skill de progreso, al retomar, corrige y sube este archivo sola; al cerrar, pregunta antes de subir código a medias.
- 2026-09-25: sin atribución a Claude en commits ni PRs. Se reescribió la historia de `main` para sacar la que había.

## Pendientes para la otra compu
- **Tiene la historia vieja de git** (la de antes de sacar la atribución a Claude). No hacer `git pull` en `main`. Primero revisar que no haya trabajo sin subir (`git status` y `git log origin/main..main`), y después: `git fetch origin`, `git switch main`, `git reset --hard origin/main`. Borrar las ramas viejas `migracion-react` y `arreglos-rapidos` si existen.
- Correr `npm install`: el proyecto pasó a React + Vite.
- Tener el `.env` con `SPOONACULAR_KEY` (no viaja por git).
- Opcional: crear `.claude/settings.local.json` con la atribución desactivada, igual que en esta compu.

## Bitácora
### 2026-09-25
- Se creó la skill `progreso-proyecto` (`.claude/skills/`) y este archivo. Se probó con una evaluación completa: 100 % con la skill contra 89 % sin ella.
- PR #4 mergeado: commit 2, menú del celular (`23da00e`).
- PR #3 mergeado: commit 1, modales accesibles (`cf6d70d`).
- Crítica de diseño con Impeccable: 17/40. Salió el plan de 9 commits.
- `CLAUDE.md` con las reglas para trabajar en dos computadoras (`2b4852b`).
- Se reescribió la historia de `main` para sacar la atribución a Claude (force push con la historia verificada idéntica en código).
- PR #2 mergeado: arreglos rápidos (búsqueda, duplicados, lista de compras, cache de recetas).
- PR #1 mergeado: migración de JS vanilla a React + Vite.
