import { describirFranja } from "../lib/constantes.js";
import Modal from "./Modal.jsx";

// "+ Agregar" de una franja del plan: elegir entre los favoritos o ir a buscar una receta
export default function ModalElegirReceta({ destino, favoritos, idsEnFranja, onElegir, onBuscar, onCerrar }) {
    if (destino == null) return null;

    return (
        <Modal id="modal-elegir-receta" abierto onCerrar={onCerrar} idTitulo="titulo-modal-elegir" idBotonCerrar="btnCerrarElegir">
            <h3 id="titulo-modal-elegir">Agregar a {describirFranja(destino.dia, destino.franja)}</h3>
            {favoritos.length === 0 ? (
                <p className="modal-vacio">Todavía no guardaste favoritos. Buscá una receta para agregarla.</p>
            ) : (
                <>
                    <p className="modal-subtitulo">De tus favoritos</p>
                    <ul className="lista-elegir-receta">
                        {favoritos.map(receta => {
                            const yaEsta = idsEnFranja.includes(String(receta.id));
                            return (
                                <li key={receta.id}>
                                    <button className="opcion-receta" disabled={yaEsta} onClick={() => onElegir(receta.id)}>
                                        <img src={receta.image} alt="" />
                                        <span className="opcion-receta-titulo">{receta.title}</span>
                                        {yaEsta && <span className="opcion-receta-estado">Ya está</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            <button className="btn-filtro" id="btnBuscarParaPlan" onClick={onBuscar}>
                <i className="fa-solid fa-magnifying-glass"></i> Buscar recetas
            </button>
        </Modal>
    );
}
