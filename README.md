# 🍽️ Mealify

Aplicación web para buscar recetas, guardar tus favoritas y planificar tus comidas de la semana con drag & drop.

**🔗 Demo en vivo:** [mealify-mtt.vercel.app](https://mealify-mtt.vercel.app/)

![Mealify landing preview](logo.png)

## Funcionalidades

- **Búsqueda de recetas** — consulta en tiempo real a la [Spoonacular API](https://spoonacular.com/food-api) a través de funciones serverless propias (la API key nunca se expone en el cliente), con manejo de errores y estados de carga.
- **Favoritos** — guardá tus recetas preferidas, persistidas en `localStorage`.
- **Planificador semanal** — organizá desayuno, almuerzo y cena para los 7 días de la semana, con:
  - Drag & drop para mover recetas entre franjas y días.
  - Validación de duplicados (no podés asignar la misma receta dos veces al mismo día/franja).
  - Resaltado visual de la zona de destino mientras arrastrás.
- **Lista de compras** — genera automáticamente los ingredientes de todo el plan semanal, agrupa cantidades repetidas de un mismo ingrediente entre recetas distintas, permite marcar productos como comprados y sacarlos de la lista con "Limpiar marcados" (persistido en `localStorage`).
- **Landing page** — sección de presentación con animaciones de scroll, mockup de la app con imágenes reales, y diseño responsive.
- **Estado inicial inteligente** — la sección de búsqueda precarga recetas al azar mientras el usuario todavía está en la landing, para que nunca se sienta vacía.
- **Header sticky** y microinteracciones (hover, transiciones) en toda la interfaz.

## 🛠️ Stack técnico

- **HTML5 / CSS3** — sin frameworks ni preprocesadores.
- **JavaScript (ES Modules)** — vanilla JS en el cliente, sin librerías ni build tools.
- **Vercel Serverless Functions (Node.js)** — actúan como proxy hacia Spoonacular, manteniendo la API key solo en el servidor.
- **[Spoonacular API](https://spoonacular.com/food-api)** — fuente de datos de recetas.
- **Font Awesome** — iconografía.
- **Google Fonts** — Poppins.
- **Deploy:** Vercel.

## 📁 Estructura del proyecto

```
Mealify/
├── index.html
├── style.css
├── logo.png
├── api/
│   ├── buscar.js        # Proxy a Spoonacular complexSearch
│   ├── detalle.js       # Proxy a Spoonacular recipe information
│   ├── random.js        # Proxy a Spoonacular recipes/random
│   └── _lib/
│       └── mock.js      # Cache de respuestas en desarrollo (ver "Nota técnica" abajo)
├── mocks/               # Respuestas de Spoonacular cacheadas para 
└── JS/
    ├── api.js           # Llamadas fetch a los endpoints propios (/api/buscar, /api/detalle, /api/random)
    ├── main.js           # Lógica principal, event listeners, estado de la app
    ├── ui.js             # Renderizado de recetas, planificador y lista de compras
    ├── storage.js        # Persistencia en localStorage (favoritos, plan, lista de compras)
    ├── tabs.js           # Navegación entre secciones
    └── landing.js        # Animaciones de scroll en la landing page
```

## 👤 Autor

**Matías Castelli**
Estudiante de Ingeniería en Informática (UADE)

- GitHub: [@matucastelli](https://github.com/matucastelli)
- LinkedIn: [matias-castelli](https://www.linkedin.com/in/matias-castelli-68a2342a2)
- Email: castellimatias5@gmail.com

## 📄 Licencia

Proyecto realizado con fines de portfolio y aprendizaje.

## Cómo correr en local

1. Cloná el repo e instalá las dependencias:
   ```bash
   git clone https://github.com/matucastelli/Mealify.git
   cd Mealify
   npm install
   ```
2. Creá un archivo `.env` en la raíz con tu API key de Spoonacular (gratis en [spoonacular.com/food-api](https://spoonacular.com/food-api)):
   ```
   SPOONACULAR_KEY=tu_api_key
   ```
3. Corré el proyecto con la CLI de Vercel:
   ```bash
   vercel dev
   ```

**Nota técnica:** en desarrollo, la primera vez que se pide una búsqueda/receta/random se llama a la API real y la respuesta se guarda en `mocks/` (no versionada); las siguientes veces se lee de ahí, para no agotar la cuota diaria del plan free (50 puntos/día). Para forzar una llamada real ignorando el mock guardado: `FORCE_REAL=true vercel dev`.