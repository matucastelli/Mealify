import Modal from "./Modal.jsx";
import ImagenReceta from "./ImagenReceta.jsx";
import { traducirCategorias } from "../lib/traducciones.js";

export default function ModalReceta({ abierto, receta, onCerrar }) {
    return (
        <Modal id="modal-receta" abierto={abierto && receta != null} onCerrar={onCerrar} idTitulo="titulo-modal-receta" idBotonCerrar="btnCerrarModal">
            <div id="modal-detalle">
                <div className="receta-detallada-wrapper">
                    <ImagenReceta src={receta?.image} alt={receta?.title} />
                    <p id="titulo-modal-receta" className="receta-detallada-titulo">{receta?.title}</p>
                    <DatosReceta receta={receta} />
                    <span className="receta-detallada-categoria">
                        {traducirCategorias(receta?.dishTypes)}
                    </span>
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
