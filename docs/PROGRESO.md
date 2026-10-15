# Progreso de Mealify

> Última actualización: 2026-10-15 · Rama de trabajo: `mejoras-critica` · Último commit en main: `7ecf187 Merge pull request #9 from matucastelli/mejoras-critica`

## Estado actual
Se está ejecutando el plan de mejoras que salió de la crítica de diseño de Impeccable (puntaje 17/40). Los commits 1 a 6 están mergeados (el 6 en el PR #9). `mejoras-critica` está igual a `main`, lista para el commit 7. No hay nada a medias.

## Próximo paso
Commit 7 del plan: textos en español (diccionario de pasillos, unidades y categorías; días con tilde; h2 por sección). Tener en cuenta la decisión del 2026-10-15 sobre las medidas de compra.

## Plan en curso: mejoras de la crítica
- [x] 1. Modales accesibles: solo existen abiertos, foco, Escape, clic en el fondo (PR #3)
- [x] 2. Menú del celular: se cierra al navegar, inert, áreas táctiles de 44px (PR #4)
- [x] 3. Feedback de las acciones: aviso, tab activo, carga y errores (PR #6)
- [x] 4. Layout de tarjetas en celular (sin desborde, acciones en su fila, input de 16px) (PR #7)
- [x] 5. Planificador sin arrastrar ("Mover a…", "+ Agregar" por franja) (PR #8)
- [x] 6. Lista de compras por pasillo (cantidades limpias, contador, receta de origen) (PR #9)
- [ ] 7. Textos en español (diccionario de pasillos, unidades, categorías; días con tilde; h2 por sección) ← siguiente
- [ ] 8. Detalle de receta (pasos numerados, acciones en el modal, imagen de reemplazo)
- [ ] 9. Pulido visual (tipografía en controles, grilla de favoritos, mockup de la landing)

## Decisiones
- 2026-09-25: un PR por commit, todos desde la rama `mejoras-critica`. Mergear cada PR con "Create a merge commit" antes de empezar el siguiente; después, `git pull origin main` en la rama.
- 2026-09-25: no tocar los colores (el contraste del naranja queda fuera del plan).
- 2026-09-25: la interfaz queda toda en español, con un diccionario para el vocabulario fijo. El contenido de las recetas sigue en inglés porque Spoonacular solo ofrece inglés y alemán.
- 2026-09-25: antes de sumar una librería, se consulta explicando qué hace y por qué.
- 2026-09-25: la skill de progreso, al retomar, corrige y sube este archivo sola; al cerrar, pregunta antes de subir código a medias.
- 2026-09-25: sin atribución a Claude en commits ni PRs. Se reescribió la historia de `main` para sacar la que había.

- 2026-10-12: el planificador muestra los 7 días en una fila recién desde 1440px; entre 1024 y 1439px van 4 por fila y entre 768 y 1023px, 3. Con columnas más angostas los títulos se cortaban a mitad de palabra.
- 2026-10-15: la lista de compras tiene una fila por ingrediente (la clave guardada pasó de `nombre|unidad` a `nombre`, con migración automática en `storage.js`). Todo se suma en g, ml o unidades y se muestra el paquete a comprar (aproximado: tabla chica de ingredientes comunes en `src/lib/paquetes.js` y tamaños genéricos para el resto; especias, "1 paquete"). En chico va "Necesitás ~X" y las recetas de origen. Al pasar a español (commit 7), nada de cucharadas ni cucharaditas como medida de compra.
- 2026-10-12: los commits se hacen en el orden del plan; aunque aparezca algo de un commit posterior (por ejemplo la grilla de favoritos, del 9), no se adelanta.

## Pendientes para la otra compu
- El recuadro "Contributors" de GitHub todavía muestra a Claude, aunque la API y la historia ya están limpias: es caché de GitHub. Si no se actualiza solo, pedirle a GitHub Support que lo regenere.
- **Tiene la historia vieja de git** (la de antes de sacar la atribución a Claude). No hacer `git pull` en `main`. Primero revisar que no haya trabajo sin subir (`git status` y `git log origin/main..main`), y después: `git fetch --prune origin`, `git switch main`, `git reset --hard origin/main`. Borrar las ramas locales viejas `migracion-react`, `arreglos-rapidos` y `backup/main-antes-de-limpiar` si existen (en GitHub ya no están).
- Correr `npm install`: el proyecto pasó a React + Vite.
- Tener el `.env` con `SPOONACULAR_KEY` (no viaja por git).
- Opcional: instalar GitHub CLI (`winget install GitHub.cli` y `gh auth login`) para que Claude pueda crear los PRs; en esta compu todavía no está.
- Opcional: crear `.claude/settings.local.json` con la atribución desactivada, igual que en esta compu.

## Bitácora
### 2026-10-15
- Fin de la sesión en esta compu: todo subido, `mejoras-critica` igual a `main` (más los commits de docs).
- PR #9 mergeado: commit 6, lista de compras por pasillo (`790dd9d`). `mejoras-critica` actualizada con `main`.
- Commit 6: lista de compras por pasillo. Una fila por ingrediente con el paquete a comprar, "Necesitás ~X" y las recetas de origen; grupos por pasillo con contador, y "X de Y comprados" en la cabecera. Los marcados y ocultos guardados con la clave vieja se migran solos. Se verificó con todos los mocks de detalle y con puppeteer en 1440px, 390px y 320px (migración, contador, limpiar, restaurar, sin scroll horizontal).

### 2026-10-13
- PR #8 mergeado: commit 5, planificador sin arrastrar (`4f34952`) y el mock `detalle_716429`. `mejoras-critica` actualizada con `main`.
- Fin de la sesión en esta compu: todo subido, `mejoras-critica` igual a `main`.

### 2026-10-12
- Commit 5: planificador sin arrastrar. Cada receta del plan tiene "Mover" (elegir día y comida, con error si ya está en el destino) y "Quitar", y se abre con el teclado. Cada franja tiene "+ Agregar": elegir entre los favoritos o ir a Buscar con ese día y comida preelegidos. Arrastrar sigue en escritorio, pero ya no duplica recetas. Grilla del planificador en 3, 4 o 7 columnas según el ancho, sin scroll horizontal. Se verificó con 57 chequeos de puppeteer, de 320px a 1920px.
- PR #7 mergeado: commit 4, tarjetas en celular (`80ccbe6`). `mejoras-critica` actualizada con `main`.

### 2026-10-07
- Commit 4: tarjetas en celular. Imagen, texto y estrella arriba, y "Ver receta" / "Agregar al plan" en su propia fila. Títulos que cortan palabras largas, categorías en 2 líneas como máximo, estrella y botones de 44px, buscador y selects en 16px, hover solo con mouse. Se verificó con puppeteer en 390px, 320px y escritorio: sin scroll horizontal ni desbordes, y los botones de la tarjeta siguen funcionando.
- Limpieza: `main` local actualizado; borradas las ramas viejas `migracion-react`, `arreglos-rapidos` (local y GitHub) y `backup/main-antes-de-limpiar` (local).
- Fin de la sesión en esta compu: todo subido, `mejoras-critica` igual a `main`.
- PR #6 mergeado: commit 3, feedback de las acciones (`679f71f`). Se probó antes del merge. En Vercel, `SPOONACULAR_KEY` quedó habilitada también para Preview, así se puede probar cada rama en su deploy de preview.
- Commit 3: feedback de las acciones. Aviso al agregar al plan (con "Ver plan"), tab activo, "Ver receta" con "Cargando…" y aviso de error, y búsqueda con estado de error y "Reintentar". `api.js` ahora lanza error si falla la red o el servidor, y el cache de recetas ya no guarda los errores. Se verificó con 25 chequeos de puppeteer en escritorio y en celular.
- PR #5 mergeado: skill `progreso-proyecto` y este archivo (`4e7ecb9`). Arranca el commit 3.

### 2026-09-25
- Fin de la sesión en esta compu: todo subido a `mejoras-critica`; el PR de la skill quedó sin crear/mergear.
- Se creó la skill `progreso-proyecto` (`.claude/skills/`) y este archivo. Se probó con una evaluación completa: 100 % con la skill contra 89 % sin ella.
- PR #4 mergeado: commit 2, menú del celular (`23da00e`).
- PR #3 mergeado: commit 1, modales accesibles (`cf6d70d`).
- Crítica de diseño con Impeccable: 17/40. Salió el plan de 9 commits.
- `CLAUDE.md` con las reglas para trabajar en dos computadoras (`2b4852b`).
- Se reescribió la historia de `main` para sacar la atribución a Claude (force push con la historia verificada idéntica en código).
- PR #2 mergeado: arreglos rápidos (búsqueda, duplicados, lista de compras, cache de recetas).
- PR #1 mergeado: migración de JS vanilla a React + Vite.
