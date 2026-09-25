import { useState } from "react";
import { DIAS, FRANJAS } from "../lib/constantes.js";
import Modal from "./Modal.jsx";

export default function ModalAsignar({ abierto, error, onConfirmar, onCambiarSeleccion, onCerrar }) {
    // El estado vive fuera del Modal, así el día y la comida elegidos se recuerdan entre aperturas
    const [dia, setDia] = useState("lunes");
    const [franja, setFranja] = useState("desayuno");

    return (
        <Modal id="modal-asignar" abierto={abierto} onCerrar={onCerrar} idTitulo="titulo-modal-asignar" idBotonCerrar="btnCerrarAsignar">
            <h3 id="titulo-modal-asignar">Agregar al plan</h3>
            <label htmlFor="selectDia">Día</label>
            <select id="selectDia" value={dia} onChange={(e) => { setDia(e.target.value); onCambiarSeleccion(); }}>
                {DIAS.map(d => <option key={d.valor} value={d.valor}>{d.nombreConTilde}</option>)}
            </select>
            <label htmlFor="selectFranja">Comida</label>
            <select id="selectFranja" value={franja} onChange={(e) => { setFranja(e.target.value); onCambiarSeleccion(); }}>
                {FRANJAS.map(f => <option key={f.valor} value={f.valor}>{f.nombre}</option>)}
            </select>
            {error && <p className="mensaje-error" role="alert">{error}</p>}
            <button id="btnConfirmarAsignar" onClick={() => onConfirmar(dia, franja)}>Confirmar</button>
        </Modal>
    );
}
