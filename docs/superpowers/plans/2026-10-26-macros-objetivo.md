# Etapa 2 de Mealify fitness: plan de implementación

> Armado el 2026-10-26 a partir del diseño aprobado: `docs/superpowers/specs/2026-10-21-macros-objetivo-design.md`. Un PR por commit desde `mejoras-critica`, mergeado con "Create a merge commit" antes de empezar el siguiente.

Las cuentas de usuario y la base de datos no entran acá: son la etapa 3. Todo lo nuevo va a localStorage, siempre a través de `src/lib/storage.js` y los hooks, para poder migrarlo después sin tocar los componentes.

**Diseño**: antes de programar algo visual de 2.2 a 2.5 (formularios, tarjetas, gráfico, cómo se muestran los macros en el plan) se muestran bocetos con opciones y se elige con el usuario. Lo que la spec describe con "P · G · C" se revisa así: en el 2.1 el usuario pidió nombres completos.

## 2.1 Nutrición en el detalle
**Servidor (`api/detalle.js`)**
- Pedir `/recipes/{id}/information?includeNutrition=true` (+0,1 punto).
- Dentro del pedido a Spoonacular (así el mock también queda liviano), `extraerMacros` toma de `nutrition.nutrients` Calories, Protein, Fat y Carbohydrates (por porción, redondeados) y arma `macros: { calorias, proteinas, grasas, carbohidratos }`, o `null` si falta alguno. `nutrition` no se devuelve.
- Mocks con clave nueva: `detalle_n_{id}` y `detalle_es_n_{id}`. Se borran los 14 viejos y se regeneran las 7 recetas que había (~7 puntos de Spoonacular, ~8.000 caracteres de DeepL). `traducirReceta` copia todo con `...receta`, así que `macros` llega a la versión en español sin cambios.

**Cliente**
- `src/lib/api.js`: `/api/detalle?id=X&v=2`, para no recibir de la CDN respuestas viejas sin macros.
- `src/lib/cacheRecetas.js`: `cacheRecetasEs3`, y `cacheRecetasEs2` pasa a `CLAVES_VIEJAS`.
- `ModalReceta.jsx` (diseño elegido sobre bocetos): "726 kcal por porción" y una barra por macro con su nombre completo y los gramos (Proteínas, Grasas, Carbohidratos); el ancho de cada barra es la parte de las calorías que aporta. Al abrir, las barras crecen y los números cuentan desde 0 (0,6 s; se anima siempre, también con "reducir movimiento"). Sin datos: "Sin datos de nutrición". Debajo, la ★ y "Agregar al plan".
- Favoritos centrados en escritorio (grilla `auto-fit` con tarjetas de 280 a 340px, elegido sobre bocetos).
- `RecetaCard.jsx`: "Ver receta" ya no se deshabilita mientras carga (`aria-busy` nada más), porque el botón deshabilitado perdía el foco y el detalle no tenía a dónde devolverlo.
- `App.jsx`: la ★ guarda en favoritos una versión liviana `{ id, title, image, imageType }` (la forma de los resultados de búsqueda); "Agregar al plan" cierra el detalle y abre el modal de día y comida (no se apilan dos modales).

**Verificación**: las 7 recetas traen `macros` y no `nutrition`; detalle a 1440, 768, 390 y 320px; ★ y "Agregar al plan" con teclado y Escape; caches viejos descartados; `npm run build`; en el preview de Vercel, `macros` y `x-vercel-cache: HIT` en el segundo pedido.

## 2.2 Perfil y objetivo
- `src/lib/macros.js` (funciones puras): `caloriasMantenimiento` (Mifflin-St Jeor × actividad), `calcularObjetivo` (meta ×0,8 / 1 / 1,1, redondeo a la decena, mínimo 1.200 mujer / 1.500 hombre, con aviso si se aplica; reparto recomendado 1,8 g/kg de proteína y 25 % grasas, o el propio), `estadoDelDia` (±10 %), `validarPerfil` y `filasMacros`. Las sumas por día y por semana pasan al 2.4, donde se usan.
- `scripts/probar-macros.mjs`: casos calculados a mano (`node scripts/probar-macros.mjs`).
- `BarrasMacros.jsx`: las barras del detalle pasan a un componente compartido con el objetivo; los números se deslizan del valor anterior al nuevo.
- `storage.js`: `perfil` (`{ sexo, edad, altura, peso, actividad, meta, reparto: null | { proteinaPorKg, grasasPct } }`) y `perfilOmitido`, con try/catch.
- `src/hooks/usePerfil.js`: perfil, objetivo calculado y guardar.
- `MiProgreso.jsx` (quinta pestaña en `TABS` de `Header.jsx`): "Tus datos" (formulario con validación de rangos: edad 15–100, altura 120–230, peso 30–300, proteína 0,8–3 g/kg, grasas 15–45 %) y "Tu objetivo diario" (kcal, de dónde salen, aclaración de estimación, P/G/C, "podés cambiarlo" y "Volver al recomendado"). Grilla de 2 columnas en escritorio, una en celular.
- Diseño elegido sobre bocetos (2026-10-26): en escritorio, 2 columnas con "Tus datos" a la izquierda y "Tu objetivo diario" a la derecha ("Peso" va abajo a todo el ancho en el 2.3); en celular, una columna. El objetivo muestra los macros como en el detalle: nombre completo, gramos y barra.
- Sexo, actividad y meta con botones (la actividad pasa a varias filas en celular) y el reparto se edita en la misma tarjeta, con las barras actualizándose mientras se escribe (elegidos sobre bocetos).
- Bienvenida en tres pasos con barra de avance (elegida sobre bocetos): 1) sexo y edad, 2) altura y peso, 3) actividad y meta, con "Siguiente"/"Atrás", "Calcular mi objetivo" al final y "Ahora no" en todos. Se abre al tocar "Empezar ahora" (`empezar()` en `App.jsx`), solo sin perfil ni `perfilOmitido`.
- **Verificación**: script de node que importe `macros.js` con casos a mano (persona de ejemplo, mínimo de kcal, los tres estados del día); bienvenida completando y salteando; formulario con valores fuera de rango.

## 2.3 Registro de peso
- `storage.js`: `pesos` (`[{ fecha: "AAAA-MM-DD", kg }]`, ordenado, uno por fecha, gana la última carga). `perfil.peso` es siempre el más reciente; la única entrada no se borra. Cambiar el peso en "Tus datos" agrega o reemplaza la entrada de hoy.
- `usePerfil`: cargar y borrar peso.
- Tarjeta "Peso" en `MiProgreso.jsx`: "+ Cargar peso" (modal con fecha de hoy y kg con un decimal, sobre `Modal.jsx`), aviso de más de 7 días, gráfico SVG a mano (línea con puntos, primer y último valor, fechas en los extremos; con menos de 2 pesos, solo el número), "−2,5 kg en 6 semanas · último: 78,5 kg el 12/10" y lista con borrar. Sin perfil: "Completá tus datos para registrar tu peso".
- **Verificación**: cargar dos pesos, borrar uno, recalcular el objetivo, gráfico a 390 y 320px.

## 2.4 Macros en el planificador
- `src/lib/macros.js`: `macrosDelDia` (todas las franjas), `promedioSemanal` (solo días con recetas) y cuántas recetas no tienen datos; sumar los casos al script de prueba.
- `Planificador.jsx`: línea "Objetivo: 2.200 kcal · P 140 g · G 61 g · C 272 g por día" con lápiz a "Mi progreso"; 4 tarjetas de promedio por día con barra (2×2 debajo de 768px); en cada día, "1.980 / 2.200", barra fina y "P 132 · G 58 · C 230" o el aviso de exceso o falta; kcal en cada receta del plan en lugar de las cuisines.
- Recetas sin `macros`: "Sin datos", fuera de las sumas y nota "1 receta sin datos". Sin perfil: totales sin comparar y "Calculá tu objetivo".
- **Verificación**: plan con y sin perfil, un día pasado de calorías, 3/4/7 columnas sin scroll horizontal, contraste.

## 2.5 Lista de compras por porción
- `src/lib/listaCompras.js`: `idsDelPlan` devuelve cuántas veces aparece cada ID (hoy un Set la cuenta una vez); `armarListaCompras` multiplica cada cantidad por `veces × personas ÷ servings` (servings faltante o 0 → 1). Las claves de marcados y ocultos no cambian.
- `storage.js` y `useCompras`: `personas` (por defecto 1).
- `ListaCompras.jsx`: "Cocino para [−] 1 [+] personas" en la cabecera. No cambia los macros.
- **Verificación**: script de node con una receta repetida y personas 1 → 2; marcados y ocultos viejos siguen cargando.
