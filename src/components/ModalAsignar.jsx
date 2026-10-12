import { DIAS, FRANJAS } from "../lib/constantes.js";
import Modal from "./Modal.jsx";

// Elegir día y comida: se usa para agregar una receta al plan y para moverla.
// La selección vive en App, así se puede preelegir desde afuera y se recuerda entre aperturas.
export default function ModalAsignar({ abierto, titulo, seleccion, error, onCambiarSeleccion, onConfirmar, onCerrar }) {
    return (
        <Modal id="modal-asignar" abierto={abierto} onCerrar={onCerrar} idTitulo="titulo-modal-asignar" idBotonCerrar="btnCerrarAsignar">
            <h3 id="titulo-modal-asignar">{titulo}</h3>
            <label htmlFor="selectDia">Día</label>
            <select id="selectDia" value={seleccion.dia} onChange={(e) => onCambiarSeleccion({ ...seleccion, dia: e.target.value })}>
                {DIAS.map(d => <option key={d.valor} value={d.valor}>{d.nombreConTilde}</option>)}
            </select>
            <label htmlFor="selectFranja">Comida</label>
            <select id="selectFranja" value={seleccion.franja} onChange={(e) => onCambiarSeleccion({ ...seleccion, franja: e.target.value })}>
                {FRANJAS.map(f => <option key={f.valor} value={f.valor}>{f.nombre}</option>)}
            </select>
            {error && <p className="mensaje-error" role="alert">{error}</p>}
            <button id="btnConfirmarAsignar" onClick={onConfirmar}>Confirmar</button>
        </Modal>
    );
}
