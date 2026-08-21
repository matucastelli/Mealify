# 🍽️ Mealify

Aplicación web para buscar recetas, guardar tus favoritas y planificar tus comidas de la semana con drag & drop.

**🔗 Demo en vivo:** [matucastelli.github.io/Mealify](https://matucastelli.github.io/Mealify/)

![Mealify landing preview](logo.png)

## Funcionalidades

- **Búsqueda de recetas** — consulta en tiempo real a [TheMealDB API](https://www.themealdb.com/api.php), con manejo de errores y estados de carga.
- **Favoritos** — guardá tus recetas preferidas, persistidas en `localStorage`.
- **Planificador semanal** — organizá desayuno, almuerzo y cena para los 7 días de la semana, con:
  - Drag & drop para mover recetas entre franjas y días.
  - Validación de duplicados (no podés asignar la misma receta dos veces al mismo día/franja).
  - Resaltado visual de la zona de destino mientras arrastrás.
- **Landing page** — sección de presentación con animaciones de scroll, mockup de la app con imágenes reales, y diseño responsive.
- **Estado inicial inteligente** — la sección de búsqueda precarga recetas al azar mientras el usuario todavía está en la landing, para que nunca se sienta vacía.
- **Header sticky** y microinteracciones (hover, transiciones) en toda la interfaz.

## 🛠️ Stack técnico

- **HTML5 / CSS3** — sin frameworks ni preprocesadores.
- **JavaScript (ES Modules)** — vanilla JS, sin librerías ni build tools.
- **[TheMealDB API](https://www.themealdb.com/api.php)** — fuente de datos de recetas.
- **Font Awesome** — iconografía.
- **Google Fonts** — Poppins y Baloo 2.

## 📁 Estructura del proyecto

```
Mealify/
├── index.html
├── style.css
├── logo.png
└── JS/
    ├── api.js         # Llamadas a TheMealDB (búsqueda, detalle, random)
    ├── main.js         # Lógica principal, event listeners, estado de la app
    ├── ui.js           # Renderizado de recetas y del planificador
    ├── storage.js      # Persistencia en localStorage (favoritos, plan semanal)
    ├── tabs.js         # Navegación entre secciones
    └── landing.js       # Animaciones de scroll en la landing page
```

## 🚀 Cómo correrlo localmente

Al ser un proyecto sin build tools, no necesitás instalar dependencias. Alcanza con servir los archivos estáticos:

```bash
git clone https://github.com/matucastelli/Mealify.git
cd Mealify
```

Después, abrí `index.html` con un servidor local (por ejemplo, la extensión **Live Server** de VS Code, o `npx serve`), ya que los módulos de JavaScript (`type="module"`) requieren que el proyecto se sirva vía HTTP y no abriendo el archivo directo (`file://`).

## 👤 Autor

**Matías Castelli**
Estudiante de Ingeniería en Informática (UADE)

- GitHub: [@matucastelli](https://github.com/matucastelli)
- LinkedIn: [matias-castelli](https://www.linkedin.com/in/matias-castelli-68a2342a2)
- Email: castellimatias5@gmail.com

## 📄 Licencia

Proyecto realizado con fines de portfolio y aprendizaje.
