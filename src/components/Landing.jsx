import { useEffect, useRef } from "react";

const MOCKUP_RECETAS = [
    { titulo: "Teriyaki Chicken Casserole", imagen: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg/small" },
    { titulo: "Chicken Handi", imagen: "https://www.themealdb.com/images/media/meals/1529446137.jpg/small" },
    { titulo: "Chicken Congee", imagen: "https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg/small" },
    { titulo: "Kung Pao Chicken", imagen: "https://www.themealdb.com/images/media/meals/1525872624.jpg/small" },
];

const FEATURES = [
    { icono: "fa-magnifying-glass", titulo: "Búsqueda de recetas", texto: "Encontrá miles de recetas al instante, con ingredientes e instrucciones completas." },
    { icono: "fa-star", titulo: "Favoritos", texto: "Guardá las recetas que más te gustan para volver a ellas cuando quieras." },
    { icono: "fa-calendar-week", titulo: "Planificador semanal", texto: "Organizá desayuno, almuerzo y cena de toda tu semana con drag & drop." },
];

const PASOS = [
    { titulo: "Buscá", texto: "Explorá recetas por nombre o categoría." },
    { titulo: "Planificá", texto: "Arrastrá tus recetas elegidas a cada día de la semana." },
    { titulo: "Cociná", texto: "Seguí la receta paso a paso cuando llegue el momento." },
];

export default function Landing({ oculto, onEmpezar }) {
    const contenedor = useRef(null);

    // Animación de entrada al hacer scroll (antes JS/landing.js)
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        });
        contenedor.current.querySelectorAll(".feature-card, .paso").forEach(elemento => observer.observe(elemento));
        return () => observer.disconnect();
    }, []);

    return (
        <div id="landing" ref={contenedor} className={oculto ? "oculto" : ""}>
            <section className="hero">
                <div className="hero-interior">
                    <div className="hero-contenido">
                        <span className="marca-landing">Mealify</span>
                        <h1>Organizá tu semana, un plato a la vez</h1>
                        <p>Buscá recetas, guardá tus favoritas y armá tu planificador semanal de comidas en minutos.</p>
                        <button id="btnEmpezar" onClick={onEmpezar}>Empezar ahora</button>
                    </div>
                    <div className="hero-mockup">
                        <div className="mockup-barra">
                            <span></span><span></span><span></span>
                        </div>
                        <div className="mockup-grid">
                            {MOCKUP_RECETAS.map(receta => (
                                <div className="mockup-card" key={receta.titulo}>
                                    <img src={receta.imagen} alt={receta.titulo} className="mockup-img" />
                                    <p className="mockup-titulo">{receta.titulo}</p>
                                    <p className="mockup-categoria">Chicken</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className="features">
                <h2>Todo lo que necesitás para planificar tus comidas</h2>
                {FEATURES.map(feature => (
                    <div className="feature-card" key={feature.titulo}>
                        <i className={`fa-solid ${feature.icono}`}></i>
                        <h3>{feature.titulo}</h3>
                        <p>{feature.texto}</p>
                    </div>
                ))}
            </section>
            <section className="proceso">
                <div className="proceso-contenido">
                    <h2>Así de simple</h2>
                    {PASOS.map((paso, i) => (
                        <div className="paso" key={paso.titulo}>
                            <span className="paso-numero">{i + 1}</span>
                            <h3>{paso.titulo}</h3>
                            <p>{paso.texto}</p>
                        </div>
                    ))}
                </div>
            </section>
            <footer>
                <p>Mealify — Proyecto de portfolio</p>
                <div className="footer-links">
                    <a href="https://github.com/matucastelli" target="_blank" rel="noopener noreferrer">
                        <i className="fa-brands fa-github"></i> GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/matias-castelli-68a2342a2" target="_blank" rel="noopener noreferrer">
                        <i className="fa-brands fa-linkedin"></i> LinkedIn
                    </a>
                    <a href="mailto:castellimatias5@gmail.com">
                        <i className="fa-solid fa-envelope"></i> Contacto
                    </a>
                </div>
            </footer>
        </div>
    );
}
