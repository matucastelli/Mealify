import { useEffect, useRef } from "react";
import { FRANJAS } from "../lib/constantes.js";

// Recetas reales de Spoonacular (las de los mocks), para que el mockup se vea como la app
const RECETAS_MOCKUP = {
    manzana: { titulo: "Gajos de manzana al horno con canela", id: 633548 },
    arroz: { titulo: "Arroz con calabacín", id: 665781 },
    empanadillas: { titulo: "Empanadillas chinas", id: 638693 },
    pollo: { titulo: "Pollo Turbo", id: 663971 },
    pasta: { titulo: "Pasta con ajo, cebollines y coliflor", id: 716429 },
};

// Un plan de ejemplo: qué receta va en cada franja (null = vacía)
const MOCKUP_PLAN = [
    { dia: "Lunes", desayuno: "manzana", almuerzo: "arroz", cena: null },
    { dia: "Martes", desayuno: null, almuerzo: "empanadillas", cena: "pollo" },
    { dia: "Miércoles", desayuno: "manzana", almuerzo: null, cena: "pasta" },
];

const FEATURES = [
    { icono: "fa-magnifying-glass", titulo: "Búsqueda de recetas", texto: "Encontrá miles de recetas en español, con ingredientes y pasos detallados." },
    { icono: "fa-star", titulo: "Favoritos", texto: "Guardá las recetas que más te gustan para volver a ellas cuando quieras." },
    { icono: "fa-calendar-week", titulo: "Planificador semanal", texto: "Organizá desayuno, almuerzo y cena de toda la semana y obtené la lista de compras armada." },
];

const PASOS = [
    { titulo: "Buscá", texto: "Escribí un plato o un ingrediente, en español." },
    { titulo: "Planificá", texto: "Agregá cada receta al día y la comida que quieras." },
    { titulo: "Cociná", texto: "Seguí la receta paso a paso y comprá solo lo que necesitás." },
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
                    {/* Decorativo: un plan de ejemplo con el mismo aspecto que el planificador */}
                    <div className="hero-mockup" aria-hidden="true">
                        <div className="mockup-barra">
                            <span></span><span></span><span></span>
                        </div>
                        <div className="mockup-plan">
                            {MOCKUP_PLAN.map(dia => (
                                <div className="mockup-dia" key={dia.dia}>
                                    <div className="mockup-dia-nombre">{dia.dia}</div>
                                    {FRANJAS.map(franja => {
                                        const receta = RECETAS_MOCKUP[dia[franja.valor]];
                                        return (
                                            <div className="mockup-franja" key={franja.valor}>
                                                <div className="mockup-franja-titulo"><i className={`fa-solid ${franja.icono}`}></i> {franja.nombre}</div>
                                                {receta ? (
                                                    <div className="mockup-receta">
                                                        <img src={`https://img.spoonacular.com/recipes/${receta.id}-90x90.jpg`} alt="" />
                                                        <span>{receta.titulo}</span>
                                                    </div>
                                                ) : (
                                                    <div className="mockup-vacia">—</div>
                                                )}
                                            </div>
                                        );
                                    })}
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
