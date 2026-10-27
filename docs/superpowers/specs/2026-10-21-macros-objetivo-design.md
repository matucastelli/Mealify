# Etapa 2 de Mealify fitness: macros, objetivo y peso (diseño)

> Aprobado el 2026-10-21. Próximo paso: el plan de implementación (superpowers:writing-plans).

## Contexto e intención
Mealify es una app de recetas con planificador semanal (portfolio personal, React 19 + Vite, sin TypeScript, funciones serverless en `/api` que hacen de proxy a Spoonacular y traducen con DeepL). La etapa 1 del plan "Mealify fitness" (contraste, PR #13) está mergeada.

El usuario quiere darle a la app un enfoque fitness. Con el plan de la semana armado, quiere ver cuántas calorías, proteínas, grasas y carbohidratos va a comer, compararlas con un objetivo que calcula la app y decidir si sigue con ese plan. Además quiere registrar su peso cada semana o cada mes para ver cómo varía. **Éxito**: el domingo arma la semana, ve si cada día queda cerca de su objetivo, ajusta lo que se pasa y, con el tiempo, ve en un gráfico si su peso va hacia donde quiere.

Esta etapa también resuelve tres pendientes de la crítica de Impeccable del 2026-10-17 que tocan el mismo código: la lista de compras (P1), el planificador (P2, en parte) y el detalle sin acciones (P2).

## Objetivos
1. Macros por porción de cada receta, visibles en el detalle y en el plan.
2. Perfil con datos personales y objetivo diario calculado, con un reparto de macros recomendado que se puede editar.
3. Plan semanal con macros por día contra el objetivo y un resumen de la semana con el promedio por día.
4. Registro de peso con gráfico y aviso si pasaron más de 7 días desde la última carga. Cada carga actualiza el peso del perfil y recalcula el objetivo.
5. Lista de compras por porción, con una opción de "cocino para N personas".
6. Detalle de la receta con ★ y "Agregar al plan".

## No objetivos (esta etapa)
- Cuentas de usuario y base de datos: son la etapa 3, decidida el 2026-10-21. Acá todo va a localStorage, pero detrás de `src/lib/storage.js` y los hooks, así se puede migrar después.
- Recetas propias (etapa 4).
- Historial de planes por semana. Solo se guarda el peso con su fecha.
- Porciones distintas por receta dentro del plan: cada receta del plan es 1 porción para 1 persona.
- Selector de un día por vez en el celular (parte del P2 del planificador). Queda para más adelante.

## Anti-objetivos (sería un fracaso aunque funcione)
- Que parezca un consejo médico. La app tiene que decir que el objetivo es una estimación.
- Obligar a cargar los datos para usar la app: quien solo busca recetas tiene que poder saltearlo.
- Romper los datos guardados (plan, favoritos, compras). El plan sigue guardando IDs como string, con la misma forma.
- Gastar de más la cuota de Spoonacular (50 puntos por día en el plan gratis) o de DeepL.
- Agregar librerías: el gráfico va en SVG a mano.

## Decisiones tomadas con el usuario
- **1 porción para 1 persona por receta del plan.** Los macros del plan suman una porción de cada receta.
- **Objetivo calculado por la app** con sexo, edad, altura, peso, actividad y meta (bajar, mantener o subir).
- **Reparto de macros**: la app propone el recomendado y avisa que es el sugerido; quien siga otra dieta lo puede cambiar.
- **Plan**: el boceto aprobado lleva una línea arriba con el objetivo diario y un lápiz para editarlo, cuatro tarjetas con el promedio por día (kcal, proteína, grasas, carbohidratos) y una barra contra el objetivo. En cada día va una barra de kcal "consumido / objetivo" y "P · G · C" en gramos. Cada receta muestra sus kcal al costado. Si el día se pasa o queda corto, se marca con el margen de ±10 % que se explica más abajo.
- **Sección "Mi progreso"** (quinta pestaña, boceto aprobado), con tres tarjetas:
  - "Tus datos": formulario.
  - "Tu objetivo diario": kcal grandes, de dónde sale el número, la aclaración de que es una estimación, P/G/C con su regla y el link "podés cambiarlo".
  - "Peso": botón "+ Cargar peso", aviso de más de 7 días, gráfico y la línea "−2,5 kg en 6 semanas · último: 78,5 kg el 12/10".
  - En celular las tarjetas se apilan.
- **Peso**: se carga cuando el usuario quiere (pensado para cada semana o cada mes) y no hay recordatorio diario. Solo se guarda fecha y kg.
- **Primera vez en la app**: se piden los datos, con opción de saltearlo. El usuario aclaró que es una base que se va a ir mejorando.
- **Datos en el navegador** (localStorage) en esta etapa.
- **Spoonacular** como fuente de nutrición.
- **Lista de compras**: calcula (cantidad ÷ porciones que rinde) × veces en el plan × personas. La cantidad de personas es un ajuste general y no cambia los macros.

## Diseño técnico

### Datos de nutrición (servidor)
- `api/detalle.js` pide `/recipes/{id}/information?includeNutrition=true` (+0,1 punto). La respuesta de Spoonacular con nutrición es pesada, así que **el servidor la recorta**: de `nutrition.nutrients` toma Calories, Protein, Fat y Carbohydrates (valores por porción) y los agrega a la receta como `macros: { calorias, proteinas, grasas, carbohidratos }`, números redondeados. El objeto `nutrition` no se devuelve. Si falta algún dato, `macros` es `null`.
- **Mocks**: se cambian las claves a `detalle_n_{id}` / `detalle_es_n_{id}`, así los 6 mocks viejos no se confunden con los nuevos. Los viejos se borran del repo y se commitean los nuevos. El costo es ~7 puntos de Spoonacular y ~7.400 caracteres de DeepL.
- **Cache de la CDN**: Vercel guarda `/api/detalle?id=X` 30 días. El cliente pasa a pedir `/api/detalle?id=X&v=2` para no recibir respuestas viejas sin macros.
- **Cache del navegador**: `CLAVE_STORAGE` pasa a `cacheRecetasEs3` y `cacheRecetasEs2` se suma a `CLAVES_VIEJAS` (`src/lib/cacheRecetas.js`).

### Cálculos (`src/lib/macros.js`, funciones puras)
- **Calorías de mantenimiento**: Mifflin-St Jeor. Hombre: 10·kg + 6,25·cm − 5·edad + 5. Mujer: lo mismo − 161. Se multiplica por la actividad: sedentaria 1,2 · ligera 1,375 · moderada 1,55 · intensa 1,725 · muy intensa 1,9, cada nivel con una descripción corta en el formulario.
- **Meta**: bajar ×0,8 · mantener ×1 · subir ×1,1. Las kcal se redondean a la decena.
- **Mínimo** (decidido con el usuario): el objetivo nunca baja de 1.200 kcal (mujer) o 1.500 kcal (hombre). Si se aplica, "Tu objetivo diario" avisa: "Ajustamos tu objetivo al mínimo recomendado".
- **Estado de un día** (decidido con el usuario): margen de ±10 % del objetivo de kcal.
  - Dentro del margen, "en objetivo", con el color normal.
  - Más del 10 % arriba: rojo, "X kcal de más".
  - Más del 10 % abajo: ámbar, "Te faltan X kcal".
  - Un día sin recetas no se marca.
  - Vale igual para cualquier meta.
- **Reparto recomendado**: proteína 1,8 g/kg, grasas 25 % de las kcal y carbohidratos el resto (4 kcal/g para proteína y carbohidratos, 9 kcal/g para grasas; mínimo 0).
- **Reparto editable**: se cambian los gramos de proteína por kilo y el % de grasas, y los carbohidratos siguen siendo el resto. Hay un botón "Volver al recomendado".
- **Funciones de suma**: macros de un día (todas las franjas), promedio por día de la semana y cuántas recetas no tienen datos.
- **Días vacíos**: el promedio semanal se calcula **solo sobre los días que tienen recetas**. *(Decisión mía: si no, una semana a medio armar daría un promedio engañosamente bajo.)*

### Guardado (`src/lib/storage.js` + hooks nuevos)
- `perfil`: `{ sexo: "hombre"|"mujer", edad, altura, peso, actividad, meta, reparto: null | { proteinaPorKg, grasasPct } }`. `reparto: null` significa el recomendado.
- `pesos`: `[{ fecha: "AAAA-MM-DD", kg }]`, ordenado por fecha. Si se carga dos veces el mismo día, queda la última carga. Cargar un peso actualiza `perfil.peso` si es el más reciente.
- `perfilOmitido`: `true` cuando se toca "Ahora no" en la bienvenida.
- `personas`: número, por defecto 1.
- Hooks nuevos: `usePerfil` (perfil, objetivo calculado, pesos, cargar y borrar peso) y `personas` dentro de `useCompras`.
- Todo envuelto en try/catch, como el resto de `storage.js`. Nada cambia la forma de `plan`, `favoritos`, `comprasMarcadas` ni `comprasOcultas`.

### Interfaz
- **Detalle (`ModalReceta.jsx`)**: debajo de "45 min · 2 porciones" va la fila "Por porción: 520 kcal · P 32 g · G 18 g · C 55 g", o "Sin datos de nutrición". También se suman la ★ y "Agregar al plan", que reusan `alternarFavorito` y `setRecetaParaAsignar` de `App.jsx`.
- **Planificador (`Planificador.jsx`)**: se arma como en el boceto aprobado.
  - Las tarjetas de recetas del plan muestran las kcal en lugar de las cuisines, porque hoy casi todas dicen "Sin categoría".
  - **Sin perfil**: se ven los totales sin comparar y un botón "Calculá tu objetivo" que lleva a "Mi progreso".
  - Recetas sin datos: se muestra "Sin datos" y quedan fuera de las sumas, con la nota "1 receta sin datos".
  - El lápiz del objetivo lleva a "Mi progreso".
- **Mi progreso (`MiProgreso.jsx`, pestaña nueva en `Header.jsx`)**: como en el boceto aprobado.
  - El gráfico de peso es un SVG a mano (una línea con puntos, el primer y el último valor, fechas en los extremos). Con menos de 2 pesos se muestra solo el número.
  - Lista de pesos con opción de borrar.
  - "+ Cargar peso" abre un modal con fecha (por defecto hoy) y kg, y reusa `Modal.jsx`.
- **Bienvenida**: un modal al entrar a la app (al tocar "Empezar ahora"), solo si no hay perfil ni `perfilOmitido`. Tiene el mismo formulario de "Tus datos", con "Calcular mi objetivo" y "Ahora no".
- **Lista de compras**: suma un control "Cocino para [−] 1 [+] personas" en la cabecera.

### Cómo se acomodan los bocetos aprobados (se mostraron en el chat, no están en el repo)
- **Planificador**:
  - Debajo de la cabecera de la sección va una línea con "Objetivo: 2.200 kcal · P 140 g · G 61 g · C 272 g por día" y el lápiz, alineada a la derecha del título en escritorio y debajo en celular.
  - Abajo, una fila de 4 tarjetas chicas (promedio kcal con "X por debajo/encima", y proteína, grasas y carbohidratos, cada una con una barra). Van en 2 × 2 debajo de 768px.
  - Después, la grilla de días que ya existe (3, 4 o 7 columnas). En cada día, debajo del nombre: "1.980 / 2.200" a la derecha del nombre, una barra fina y la línea "P 132 · G 58 · C 230" (o el aviso de exceso o falta).
- **Mi progreso**: en escritorio, una grilla de 2 columnas, con "Tus datos" a la izquierda, "Tu objetivo diario" a la derecha y "Peso" abajo ocupando las dos. En celular, una sola columna en ese orden.

### Peso y perfil (decisiones mías)
- Cambiar el peso en "Tus datos" agrega o reemplaza la entrada de hoy en `pesos`. Así el formulario y el registro no se contradicen.
- `perfil.peso` siempre es el de la entrada más reciente de `pesos`. Si se borra la última, pasa a la anterior, y no se puede borrar la única que queda.
- Sin perfil, la tarjeta "Peso" muestra "Completá tus datos para registrar tu peso" con un botón al formulario. No hay perfiles a medias.

### Lista de compras por porción (`src/lib/listaCompras.js`)
- `idsDelPlan` pasa a devolver cuántas veces aparece cada ID: hoy usa un Set y cuenta una sola vez la receta repetida en la semana.
- `armarListaCompras` multiplica cada cantidad por `veces × personas ÷ servings`. Si `servings` falta o es 0, se toma 1.
- Las claves de marcados y ocultos no cambian.

## Validación de datos
Rangos del formulario: edad 15–100, altura 120–230 cm, peso 30–300 kg, proteína 0,8–3 g/kg y grasas 15–45 %. Si un valor queda fuera, se muestra un error junto al campo y no se guarda. El peso se carga con un decimal.

## Commits (un PR por commit desde `mejoras-critica`, como venimos haciendo)
1. Nutrición en el detalle: servidor, mocks, caches, fila de macros, y la ★ y "Agregar al plan" en el modal.
2. Perfil y objetivo: `macros.js`, `usePerfil`, pestaña "Mi progreso" con datos y objetivo, y la bienvenida.
3. Registro de peso: carga, lista, gráfico y aviso de 7 días.
4. Macros en el planificador.
5. Lista de compras por porción y personas.

## Lo que queda a criterio de quien construye
Textos exactos, estilos dentro de lo que ya usa `style.css` (tokens `--color-primario`, Poppins, tarjetas actuales), cómo se acomodan las tarjetas de "Mi progreso" en tablet y nombres internos de componentes y funciones (en español, camelCase).

## Verificación
- Un script de node que importe `src/lib/macros.js` y `src/lib/listaCompras.js` y compare con casos calculados a mano: una persona de ejemplo, el caso que cae en el mínimo de kcal, los tres estados de un día (en objetivo, de más y de menos), un día con una receta sin datos y una receta repetida en la semana.
- `npm run dev` y el navegador integrado a 1440, 768, 390 y 320px. En cada commit se revisa:
  - el flujo de bienvenida (completar y saltear);
  - el detalle con macros;
  - el plan con y sin perfil, y con un día pasado de calorías;
  - cargar dos pesos y borrar uno;
  - personas 1 → 2 en la lista;
  - sin scroll horizontal;
  - el contraste con el script de la etapa 1.
- Verificar que los datos viejos (`plan`, `favoritos`, compras) siguen cargando igual.
- `npm run build` sin errores.
- En el preview de Vercel: que `/api/detalle?id=X&v=2` traiga `macros` y que el segundo pedido dé `x-vercel-cache: HIT`.
