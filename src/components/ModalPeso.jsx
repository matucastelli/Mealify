import { useState } from "react";
import Modal from "./Modal.jsx";
import { formatearNumero, validarPerfil } from "../lib/macros.js";
import { fechaDeHoy, formatearFecha } from "../lib/pesos.js";

// "+ Cargar peso": arranca con el último peso y la fecha de hoy, que se puede cambiar
export default function ModalPeso({ abierto, pesoInicial, onGuardar, onCerrar }) {
    return (
        <Modal id="modal-peso" abierto={abierto} onCerrar={onCerrar} idTitulo="titulo-modal-peso" idBotonCerrar="btnCerrarPeso">
            <FormularioPeso pesoInicial={pesoInicial} onGuardar={onGuardar} />
        </Modal>
    );
}

// Vive dentro del modal, así cada vez que se abre arranca de cero
function FormularioPeso({ pesoInicial, onGuardar }) {
    const hoy = fechaDeHoy();
    const [kg, setKg] = useState(formatearNumero(pesoInicial));
    const [fecha, setFecha] = useState(hoy);
    const [eligiendoFecha, setEligiendoFecha] = useState(false);
    const [errores, setErrores] = useState({});

    function guardar(e) {
        e.preventDefault();
        const { valores, errores: nuevosErrores } = validarPerfil({ peso: kg });
        if (!fecha) nuevosErrores.fecha = "Elegí una fecha.";
        else if (fecha > hoy) nuevosErrores.fecha = "La fecha no puede ser después de hoy.";
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        onGuardar(fecha, valores.peso);
    }

    return (
        <form className="formulario-peso" onSubmit={guardar} noValidate>
            <div className="peso-modal-icono" aria-hidden="true">
                <i className="fa-solid fa-weight-hanging"></i>
            </div>
            <h3 id="titulo-modal-peso">Cargar peso</h3>
            <p className="peso-modal-ayuda">Una vez por semana alcanza</p>

            <div className="peso-modal-kg">
                <input
                    id="peso-kg"
                    type="text"
                    inputMode="decimal"
                    aria-label="Peso en kg"
                    value={kg}
                    aria-invalid={Boolean(errores.peso)}
                    aria-describedby={errores.peso ? "peso-kg-error" : undefined}
                    onChange={e => { setKg(e.target.value); setErrores({ ...errores, peso: undefined }); }}
                />
                <span aria-hidden="true">kg</span>
            </div>
            {errores.peso && <p id="peso-kg-error" className="mensaje-error">{errores.peso}</p>}

            {eligiendoFecha ? (
                <div className="peso-modal-fecha">
                    <label htmlFor="peso-fecha">Fecha</label>
                    <input
                        id="peso-fecha"
                        type="date"
                        max={hoy}
                        value={fecha}
                        autoFocus
                        aria-invalid={Boolean(errores.fecha)}
                        aria-describedby={errores.fecha ? "peso-fecha-error" : undefined}
                        onChange={e => { setFecha(e.target.value); setErrores({ ...errores, fecha: undefined }); }}
                    />
                    {errores.fecha && <p id="peso-fecha-error" className="mensaje-error">{errores.fecha}</p>}
                </div>
            ) : (
                <button type="button" className="peso-fecha-chip" onClick={() => setEligiendoFecha(true)}>
                    <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                    Hoy, {formatearFecha(hoy)}
                    <span className="sr-only">: cambiar fecha</span>
                    <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
            )}

            <button type="submit" className="btn-pill">Guardar peso</button>
        </form>
    );
}
