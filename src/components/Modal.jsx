import { useEffect, useRef } from "react";

const SELECTOR_ENFOCABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Diálogo accesible: solo existe en el DOM mientras está abierto (así no quedan controles
// invisibles recibiendo foco), toma el foco al abrirse y lo mantiene adentro, se cierra con
// Escape o tocando el fondo, y al cerrarse devuelve el foco al elemento que lo abrió.
export default function Modal({ id, abierto, onCerrar, idTitulo, idBotonCerrar, children }) {
    if (!abierto) return null;
    return (
        <DialogoAbierto id={id} onCerrar={onCerrar} idTitulo={idTitulo} idBotonCerrar={idBotonCerrar}>
            {children}
        </DialogoAbierto>
    );
}

function DialogoAbierto({ id, onCerrar, idTitulo, idBotonCerrar, children }) {
    const contenido = useRef(null);
    const alCerrar = useRef(onCerrar);
    alCerrar.current = onCerrar;

    useEffect(() => {
        const elementoAnterior = document.activeElement;
        contenido.current.focus();

        function alPresionarTecla(e) {
            if (e.key === "Escape") {
                alCerrar.current();
                return;
            }
            if (e.key !== "Tab") return;

            // Mantiene el foco dentro del diálogo
            const enfocables = [...contenido.current.querySelectorAll(SELECTOR_ENFOCABLES)];
            if (enfocables.length === 0) return;
            const primero = enfocables[0];
            const ultimo = enfocables[enfocables.length - 1];
            if (e.shiftKey && (document.activeElement === primero || document.activeElement === contenido.current)) {
                e.preventDefault();
                ultimo.focus();
            } else if (!e.shiftKey && document.activeElement === ultimo) {
                e.preventDefault();
                primero.focus();
            }
        }

        document.addEventListener("keydown", alPresionarTecla);
        return () => {
            document.removeEventListener("keydown", alPresionarTecla);
            if (elementoAnterior?.isConnected) elementoAnterior.focus();
        };
    }, []);

    return (
        <div id={id} className="modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div
                ref={contenido}
                className="modal-contenido"
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitulo}
                tabIndex={-1}
            >
                <button id={idBotonCerrar} className="btn-cerrar-modal" aria-label="Cerrar" onClick={onCerrar}>×</button>
                {children}
            </div>
        </div>
    );
}
