import { useState } from "react";
import { DIAS, FRANJAS } from "../lib/constantes.js";

export default function ModalAsignar({ abierto, onConfirmar, onCerrar }) {
    const [dia, setDia] = useState("lunes");
    const [franja, setFranja] = useState("desayuno");

    return (
        <div id="modal-asignar" className={abierto ? "" : "oculto"}>
            <div className="modal-contenido">
                <button id="btnCerrarAsignar" onClick={onCerrar}>×</button>
                <h3>Agregar al plan</h3>
                <label htmlFor="selectDia">Día</label>
                <select id="selectDia" value={dia} onChange={(e) => setDia(e.target.value)}>
                    {DIAS.map(d => <option key={d.valor} value={d.valor}>{d.nombreConTilde}</option>)}
                </select>
                <label htmlFor="selectFranja">Comida</label>
                <select id="selectFranja" value={franja} onChange={(e) => setFranja(e.target.value)}>
                    {FRANJAS.map(f => <option key={f.valor} value={f.valor}>{f.nombre}</option>)}
                </select>
                <button id="btnConfirmarAsignar" onClick={() => onConfirmar(dia, franja)}>Confirmar</button>
            </div>
        </div>
    );
}
