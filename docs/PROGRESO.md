# Progreso de Mealify

> Última actualización: 2026-10-26 · Rama de trabajo: `mejoras-critica` · Último commit en main: `3e5d928 Merge pull request #13 from matucastelli/mejoras-critica`

## Estado actual
El 2026-10-21 se armó el plan **Mealify fitness**, que suma recetas propias y macros con objetivo, y lo mezcla con lo que quedó pendiente de la crítica. La etapa 1 (contraste del naranja) está mergeada (PR #13). La etapa 2 (macros, objetivo y peso) ya tiene el diseño aprobado en `docs/superpowers/specs/2026-10-21-macros-objetivo-design.md`. Todavía no se programó nada, así que no hay código a medias.

## Próximo paso
Armar el plan de implementación de la etapa 2 a partir del diseño aprobado (skill superpowers:writing-plans) y arrancar por el commit 1: nutrición en el detalle de la receta.

## Plan en curso: Mealify fitness
- [x] 1. Contraste del naranja (P1 de la crítica) (PR #13)
- [ ] 2. ← siguiente. Macros, objetivo y peso (diseño aprobado: `docs/superpowers/specs/2026-10-21-macros-objetivo-design.md`). Son 5 commits/PRs:
  - [ ] 2.1 Nutrición en el detalle (servidor, mocks, caches, ★ y "Agregar al plan" en el modal)
  - [ ] 2.2 Perfil y objetivo (pestaña "Mi progreso" y bienvenida)
  - [ ] 2.3 Registro de peso (gráfico y aviso de 7 días)
  - [ ] 2.4 Macros en el planificador
  - [ ] 2.5 Lista de compras por porción y personas
- [ ] 3. Cuentas de usuario + base de datos, para usar la app desde varios dispositivos (se migra lo guardado en el navegador). Candidato: Supabase; antes de sumarlo se consulta y se revisan los límites del plan gratis.
- [ ] 4. Recetas propias: ingredientes con autocompletado de Spoonacular y macros con `/recipes/analyze`, guardadas ya en la base de datos. Antes de programar falta el brainstorming de detalle (dónde se crean, cómo se editan y se borran).
- [ ] 5. Resultados de búsqueda (P2 de la crítica): "Sin categoría", filtros que desaparecen y ★ flotando.

## Plan anterior: mejoras de la crítica (terminado)
- [x] 1. Modales accesibles: solo existen abiertos, foco, Escape, clic en el fondo (PR #3)
- [x] 2. Menú del celular: se cierra al navegar, inert, áreas táctiles de 44px (PR #4)
- [x] 3. Feedback de las acciones: aviso, tab activo, carga y errores (PR #6)
- [x] 4. Layout de tarjetas en celular (sin desborde, acciones en su fila, input de 16px) (PR #7)
- [x] 5. Planificador sin arrastrar ("Mover a…", "+ Agregar" por franja) (PR #8)
- [x] 6. Lista de compras por pasillo (cantidades limpias, contador, receta de origen) (PR #9)
- [x] 7. Textos en español (diccionario de pasillos, unidades, categorías; días con tilde; h2 por sección) y recetas traducidas con DeepL (PR #10)
- [x] 8. Detalle de receta (pasos numerados, tiempo y porciones, link a la receta original, imagen de reemplazo) (PR #11)
- [x] 9. Pulido visual (tipografía en controles, grilla de favoritos, mockup de la landing) (PR #12)

## Decisiones
- 2026-10-21: diseño de la etapa 2 aprobado (ver la spec). Resumen: objetivo con Mifflin-St Jeor × actividad × meta (bajar 0,8 / subir 1,1), con mínimo de 1.200 kcal (mujer) o 1.500 (hombre); reparto recomendado de proteína 1,8 g/kg, grasas 25 % y carbohidratos el resto, editable con el aviso de que el recomendado es el sugerido; un día está "en objetivo" dentro de ±10 % (rojo si se pasa, ámbar si le falta); el peso se carga cuando el usuario quiere (semanal o mensual) y solo se guarda fecha y kg; la primera vez se piden los datos, con opción de saltearlo; sección nueva "Mi progreso".
- 2026-10-21: cuentas de usuario + base de datos van como etapa propia (la 3), antes de las recetas propias, para que esas recetas ya se guarden en la base. Hasta entonces todo va en localStorage, detrás de `storage.js` y los hooks.
- 2026-10-21: plan **Mealify fitness**. Las funcionalidades nuevas se mezclan con lo pendiente de la crítica, porque tocan el mismo código. Orden: contraste, macros + objetivo, recetas propias, resultados de búsqueda. Cada etapa tiene su propio diseño antes de programar.
- 2026-10-21: (reemplaza lo del 2026-09-25 sobre los colores) se tocan los colores para arreglar el contraste del naranja.
- 2026-10-21: cada receta del plan cuenta como 1 porción para 1 persona; los macros se comparan con un objetivo diario que calcula la app (peso, altura, edad, sexo, actividad y meta), guardado en localStorage.
- 2026-10-21: la lista de compras va a calcular por porción: (cantidad ÷ porciones que rinde) × veces en el plan × personas, con un ajuste general de "cocino para N personas" que no cambia los macros. Se evita guardar porciones por receta en el plan, para no cambiar la forma de los datos.
- 2026-10-21: los datos de nutrición salen de Spoonacular (`includeNutrition` en el detalle, +0,1 punto; `/recipes/analyze` para las recetas propias, 1,5 puntos; autocompletado de ingredientes, 0,1 punto). El plan gratis da 50 puntos por día. Plan B si no alcanza: USDA FoodData Central.
- 2026-09-25: un PR por commit, todos desde la rama `mejoras-critica`. Mergear cada PR con "Create a merge commit" antes de empezar el siguiente; después, `git pull origin main` en la rama.
- 2026-09-25: no tocar los colores (el contraste del naranja queda fuera del plan).
- 2026-09-25: la interfaz queda toda en español, con un diccionario para el vocabulario fijo.
- 2026-10-16: (reemplaza lo del 2026-09-25 sobre el contenido) las recetas también van en español, para un público hispanohablante: DeepL traduce al español latinoamericano (`ES-419`). Para cuidar la cuota gratis (1.000.000 de caracteres por mes) se traduce solo lo que se ve (títulos en los listados; la receta completa al abrirla) y una sola vez: mocks `*_es_*` en desarrollo, CDN de Vercel 30 días (`Cache-Control: s-maxage`) en producción y localStorage (`cacheRecetasEs`) en el navegador. Si DeepL falla, se muestra en inglés y se reintenta después. Los nombres de ingredientes en inglés (`name`) siguen siendo la clave de la lista de compras.
- 2026-09-25: antes de sumar una librería, se consulta explicando qué hace y por qué.
- 2026-09-25: la skill de progreso, al retomar, corrige y sube este archivo sola; al cerrar, pregunta antes de subir código a medias.
- 2026-09-25: sin atribución a Claude en commits ni PRs. Se reescribió la historia de `main` para sacar la que había.

- 2026-10-12: el planificador muestra los 7 días en una fila recién desde 1440px; entre 1024 y 1439px van 4 por fila y entre 768 y 1023px, 3. Con columnas más angostas los títulos se cortaban a mitad de palabra.
- 2026-10-15: el buscador acepta español. `api/_lib/traducir.js` traduce primero con un diccionario de palabras comunes (sin demora) y solo lo que no conoce va a DeepL API Free (`DEEPL_KEY`, timeout 2 s; si falla, se busca con lo que tradujo el diccionario). Medido en producción: una búsqueda tarda ~0,6 s en caliente y 2,15 s en frío; DeepL tardó ~0,95 s por pedido desde la compu (conexión nueva cada vez); falta medirlo desde Vercel.
- 2026-10-15: la lista de compras tiene una fila por ingrediente (la clave guardada pasó de `nombre|unidad` a `nombre`, con migración automática en `storage.js`). Todo se suma en g, ml o unidades y se muestra el paquete a comprar (aproximado: tabla chica de ingredientes comunes en `src/lib/paquetes.js` y tamaños genéricos para el resto; especias, "1 paquete"). En chico va "Necesitás ~X" y las recetas de origen. Al pasar a español (commit 7), nada de cucharadas ni cucharaditas como medida de compra.
- 2026-10-12: los commits se hacen en el orden del plan; aunque aparezca algo de un commit posterior (por ejemplo la grilla de favoritos, del 9), no se adelanta.

## Pendientes para la otra compu
- Las dos compus ya están sincronizadas (2026-10-26). Al retomar alcanza con `git fetch`, `git switch mejoras-critica` y `git pull --ff-only`.
- En la otra compu (no LAPTOP-2UJ4PI2A): borrar las ramas locales viejas `migracion-react`, `arreglos-rapidos` y `backup/main-antes-de-limpiar` si existen (`git branch -D <rama>`); en GitHub ya no están.
- En LAPTOP-2UJ4PI2A quedó sin subir `.claude/launch.json` (config para levantar la app en el navegador integrado de Claude, con `npm run dev` en el puerto 5173). Decidir si se sube; si no, Claude lo puede volver a crear en la otra compu.
- El recuadro "Contributors" de GitHub todavía muestra a Claude, aunque la API y la historia ya están limpias: es caché de GitHub. Si no se actualiza solo, pedirle a GitHub Support que lo regenere.
- Opcional, en la otra compu: instalar GitHub CLI (`winget install GitHub.cli` y `gh auth login`) para que Claude pueda crear los PRs, y crear `.claude/settings.local.json` con la atribución desactivada, igual que en LAPTOP-2UJ4PI2A.

## Bitácora
### 2026-10-26
- Se sincronizó la otra compu con LAPTOP-2UJ4PI2A, sin cambios en el código: `main` reseteada a `origin/main` (tenía la historia vieja), `npm install`, `mejoras-critica` al día y `.env` con `SPOONACULAR_KEY` y `DEEPL_KEY` probadas (búsqueda y pasos en español). Al principio el navegador daba `ERR_CONNECTION_REFUSED` con Vite corriendo en el puerto 5173; se resolvió allá, sin que quedara registrada la causa.
- Las sesiones y la memoria de Claude no viajan entre compus: en la otra se arranca una sesión nueva en la carpeta del proyecto y se escribe "retomemos".

### 2026-10-21
- Brainstorming y diseño de la etapa 2 (macros, objetivo y peso), con bocetos del plan con macros y de "Mi progreso" aprobados en el chat. Un revisor leyó el diseño y sus preguntas quedaron resueltas (mínimo de kcal, margen de ±10 %, sincronización del peso, cómo se acomodan los bocetos). Spec: `docs/superpowers/specs/2026-10-21-macros-objetivo-design.md`.
- Fin de la sesión en esta compu: todo subido a `mejoras-critica`, sin código a medias.
- PR #13 mergeado: etapa 1, contraste del naranja (`6e8c015`). `mejoras-critica` actualizada con `main`.
- Etapa 1: contraste del naranja. `--color-primario` pasa a `#B0501A` (5,2:1 sobre blanco, 4,8:1 sobre `#f4f4f4`); el naranja original queda como `--color-primario-claro`, solo para lo decorativo (barras del menú, contorno al arrastrar, íconos de la landing). ★ inactiva `#8A8A8A`; contador de la lista con `opacity` 0,7 (estaba en 4,27:1). Los botones de la tarjeta, "Confirmar" y "Limpiar marcados" pasan de 13,3px a 14px: con más, "Agregar al plan" se parte en dos líneas a 1024 y 320px. Verificado con un script de contraste en el navegador integrado, en landing, Buscar, Favoritos, Plan, Lista y los dos modales, a 1440 y 390px: sin textos bajo AA ni scroll horizontal.
- La animación de aparición de la landing (`IntersectionObserver`) no se dispara si el navegador está en segundo plano; no se tocó.
- Brainstorming de recetas propias y enfoque fitness; se armó el plan **Mealify fitness** (4 etapas). Se revisó la documentación de Spoonacular: no hace falta cambiar de API.
- Se encontró que la lista de compras suma la receta entera y cuenta una sola vez una receta repetida en la semana (`idsDelPlan` usa un Set); se arregla en la etapa 2.

### 2026-10-17
- Crítica de Impeccable (dos agentes independientes: revisión de diseño y detector): 25/40. Problemas prioritarios: [P1] contenido de la lista de compras (traducciones como "Petróleo" por *oil*, casi duplicados, 46 ítems para 6 recetas); [P1] contraste del naranja #D96C2C (3,1–3,4:1); [P2] planificador denso y largo en celular; [P2] detalle sin acciones y modales sin nombre de receta, "Quitar" sin deshacer; [P2] resultados de búsqueda con "Sin categoría" y filtros que desaparecen. Guardada en `.impeccable/critique/2026-10-17T03-53-07Z__index-html.md`.
- Doc de referencia en Claude Docs con las skills útiles para este y otros proyectos: https://claude.ai/code/artifact/df02f153-6d0e-45cf-a65f-1ffc82db1e1a
- Fin de la sesión en LAPTOP-2UJ4PI2A: todo subido, sin código a medias.
- PR #12 mergeado: commit 9, pulido visual (`c726597`). Plan de mejoras de la crítica terminado.
- Commit 9: pulido visual. Botones, inputs y selects heredan Poppins (solo la familia, sin cambiar tamaños); se dejó de descargar Baloo 2, que no se usaba. Favoritos en grilla como Buscar, con el estado vacío centrado. Categorías sin comillas. El mockup de la landing pasó a ser un mini planificador (3 días, 2 debajo de 400px) con recetas reales en español; textos de la landing sin "drag & drop". Los links del footer bajan de línea en 320px. Verificado con puppeteer en 1440, 768, 390 y 320px, más las pruebas de los commits 6 a 8.
- PR #11 mergeado: commit 8, detalle de receta (`c1bc9da`). En producción los pasos llegan en español y la CDN responde HIT. `mejoras-critica` actualizada con `main`.
- Commit 8: detalle de receta. Pasos numerados desde `analyzedInstructions` (traducidos con DeepL; `instructions` en HTML solo como respaldo), "45 min · 2 porciones" debajo del título, link "Ver receta original" y mensaje para las recetas sin pasos. `ImagenReceta` muestra un recuadro con cubiertos si la foto no carga (tarjetas, plan, selector y modal). Se regeneraron los mocks `detalle_es_*` (~7.400 caracteres) y el cache del navegador pasó a `cacheRecetasEs2`. Las acciones dentro del modal (favorito, agregar al plan) quedaron afuera por decisión del usuario. Verificado con puppeteer en 1440px, 390px y 320px.
- PR #10 mergeado: commit 7, textos y recetas en español (`fb55c2b`, `0742454`). `mejoras-critica` actualizada con `main`.

### 2026-10-16
- Commit 7, segunda parte: recetas en español. `api/_lib/traducirReceta.js` y `traducirRespuesta.js`; `/api/detalle`, `/api/buscar` y `/api/random` devuelven todo traducido. Una receta nueva tarda 0,4–1,1 s la primera vez (desde la compu) y 1 ms después. La prueba gastó ~7.700 caracteres. La lista de compras muestra los nombres en español (solo la primera letra en mayúscula) y sigue calculando paquetes y claves con el inglés. Verificado con puppeteer en 1440px y 390px. En el preview de Vercel se confirmó que la CDN guarda las respuestas traducidas (`x-vercel-cache: HIT` en el segundo pedido).
- Commit 7: textos en español, ya con DeepL andando. La primera key cargada tenía un carácter de más (403 de DeepL); se corrigió en el `.env` y en Vercel. El reinicio automático de Vite conservaba la key vieja: hay que reiniciar `npm run dev` a mano (anotado en `CLAUDE.md`). Se borraron los mocks vacíos que se guardaron mientras DeepL fallaba y se suben los nuevos (`traduccion_*`, `buscar_meatballs`, `buscar_chicken_cutlet`, `buscar_chicken_curry`, `buscar_eggplant`).

### 2026-10-15
- Fin de la sesión en LAPTOP-2UJ4PI2A: el commit 7 quedó sin commitear (a pedido del usuario, hasta probar con DeepL). Solo se subió este archivo.
- Commit 7 (sin commitear): textos en español. Pasillos y categorías traducidos con diccionario (`src/lib/traducciones.js`), días con tilde, títulos en cada sección ("Buscar recetas" / "Miles de recetas para tu semana", "Mis favoritos" / "Tus recetas guardadas, listas para planificar", "Plan semanal" / "Organizá desayuno, almuerzo y cena de cada día"), filtros rápidos en español y búsqueda en español (diccionario + DeepL). Se verificó con puppeteer en 1440px, 390px y 320px, sin DeepL.
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
