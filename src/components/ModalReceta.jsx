import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import ImagenReceta from "./ImagenReceta.jsx";
import { traducirCategorias } from "../lib/traducciones.js";

export default function ModalReceta({ abierto, receta, esFavorito, onToggleFavorito, onAgregarPlan, onCerrar }) {
    return (
        <Modal id="modal-receta" abierto={abierto && receta != null} onCerrar={onCerrar} idTitulo="titulo-modal-receta" idBotonCerrar="btnCerrarModal">
            <div id="modal-detalle">
                <div className="receta-detallada-wrapper">
                    <ImagenReceta src={receta?.image} alt={receta?.title} />
                    <p id="titulo-modal-receta" className="receta-detallada-titulo">{receta?.title}</p>
                    <DatosReceta receta={receta} />
                    <MacrosReceta macros={receta?.macros} />
                    <span className="receta-detallada-categoria">
                        {traducirCategorias(receta?.dishTypes)}
                    </span>
                    <div className="receta-detallada-acciones">
                        <button
                            className={`btn-favorito-detalle ${esFavorito ? "activo" : ""}`}
                            aria-pressed={esFavorito}
                            onClick={onToggleFavorito}
                        >
                            <span aria-hidden="true">★</span> {esFavorito ? "En favoritos" : "Guardar en favoritos"}
                        </button>
                        <button className="btn-ver-receta" onClick={onAgregarPlan}>Agregar al plan</button>
                    </div>
                </div>
                <h3 className="modal-subtitulo">Ingredientes</h3>
                <ul>
                    {receta?.extendedIngredients?.map((ingrediente, i) => (
                        <li key={i}>{ingrediente.original}</li>
                    ))}
                </ul>
                <h3 className="modal-subtitulo">Preparación</h3>
                <Preparacion receta={receta} />
                {receta?.sourceUrl && (
                    <a className="link-receta-original" href={receta.sourceUrl} target="_blank" rel="noopener noreferrer">
                        Ver receta original <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                    </a>
                )}
            </div>
        </Modal>
    );
}

// "45 min · 2 porciones"
function DatosReceta({ receta }) {
    const datos = [
        receta?.readyInMinutes > 0 && `${receta.readyInMinutes} min`,
        receta?.servings > 0 && `${receta.servings} ${receta.servings === 1 ? "porción" : "porciones"}`,
    ].filter(Boolean);
    if (datos.length === 0) return null;

    return (
        <p className="receta-detallada-datos">
            <i className="fa-regular fa-clock" aria-hidden="true"></i> {datos.join(" · ")}
        </p>
    );
}

// Calorías por porción y una barra por macro con la parte de las calorías que aporta
// (4 kcal por gramo de proteínas y carbohidratos, 9 por gramo de grasas)
function MacrosReceta({ macros }) {
    if (macros == null) {
        return <p className="macros-sin-datos">Sin datos de nutrición</p>;
    }
    const valores = [
        { nombre: "Proteínas", gramos: macros.proteinas, kcal: macros.proteinas * 4 },
        { nombre: "Grasas", gramos: macros.grasas, kcal: macros.grasas * 9 },
        { nombre: "Carbohidratos", gramos: macros.carbohidratos, kcal: macros.carbohidratos * 4 },
    ];
    const kcalTotales = valores.reduce((suma, valor) => suma + valor.kcal, 0);

    return (
        <div className="receta-detallada-macros">
            <p className="macros-calorias"><strong><NumeroAnimado valor={macros.calorias} /> kcal</strong> por porción</p>
            {valores.map(({ nombre, gramos, kcal }) => (
                <div key={nombre} className="macro">
                    <p className="macro-texto"><span>{nombre}</span><span><NumeroAnimado valor={gramos} /> g</span></p>
                    <div className="macro-barra" aria-hidden="true">
                        <div style={{ width: `${kcalTotales > 0 ? (kcal / kcalTotales) * 100 : 0}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Mismo tiempo que la animación de las barras (.macro-barra en style.css)
const DURACION_ANIMACION = 600;

function reducirMovimiento() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// Cuenta de 0 al valor mientras crecen las barras; con "reducir movimiento" muestra el valor directo
function NumeroAnimado({ valor }) {
    const [mostrado, setMostrado] = useState(() => (reducirMovimiento() ? valor : 0));

    useEffect(() => {
        if (reducirMovimiento()) {
            setMostrado(valor);
            return;
        }
        const inicio = performance.now();
        let cuadro;
        function avanzar(ahora) {
            const progreso = Math.min(1, (ahora - inicio) / DURACION_ANIMACION);
            // Arranca rápido y frena al final, como la curva de las barras
            setMostrado(Math.round(valor * (1 - (1 - progreso) ** 3)));
            if (progreso < 1) cuadro = requestAnimationFrame(avanzar);
        }
        cuadro = requestAnimationFrame(avanzar);
        return () => cancelAnimationFrame(cuadro);
    }, [valor]);

    return mostrado.toLocaleString("es-AR");
}

// Pasos numerados (analyzedInstructions); si la receta no los trae separados, el HTML de Spoonacular
function Preparacion({ receta }) {
    const bloques = (receta?.analyzedInstructions ?? []).filter(bloque => bloque.steps?.length > 0);

    if (bloques.length > 0) {
        return bloques.map((bloque, i) => (
            <div key={i}>
                {bloques.length > 1 && bloque.name && <p className="pasos-receta-bloque">{bloque.name}</p>}
                <ol className="pasos-receta">
                    {bloque.steps.map(paso => <li key={paso.number}>{paso.step}</li>)}
                </ol>
            </div>
        ));
    }
    if (receta?.instructions) {
        // Spoonacular devuelve las instrucciones en HTML
        return <div dangerouslySetInnerHTML={{ __html: receta.instructions }} style={{ display: "contents" }} />;
    }
    return <p className="sin-pasos">Esta receta no trae los pasos de preparación.</p>;
}
