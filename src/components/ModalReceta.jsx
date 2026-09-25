import Modal from "./Modal.jsx";

export default function ModalReceta({ abierto, receta, onCerrar }) {
    return (
        <Modal id="modal-receta" abierto={abierto && receta != null} onCerrar={onCerrar} idTitulo="titulo-modal-receta" idBotonCerrar="btnCerrarModal">
            <div id="modal-detalle">
                <div className="receta-detallada-wrapper">
                    <img src={receta?.image} alt={receta?.title} />
                    <p id="titulo-modal-receta" className="receta-detallada-titulo">{receta?.title}</p>
                    <span className="receta-detallada-categoria">
                        {receta?.dishTypes?.length ? receta.dishTypes.join(", ") : "Sin categoría"}
                    </span>
                </div>
                <h3 className="modal-subtitulo">Ingredientes</h3>
                <ul>
                    {receta?.extendedIngredients?.map((ingrediente, i) => (
                        <li key={i}>{ingrediente.original}</li>
                    ))}
                </ul>
                <h3 className="modal-subtitulo">Instrucciones</h3>
                {/* Spoonacular devuelve las instrucciones en HTML */}
                <div dangerouslySetInnerHTML={{ __html: receta?.instructions ?? "" }} style={{ display: "contents" }} />
            </div>
        </Modal>
    );
}
