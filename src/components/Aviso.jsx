import { useEffect, useRef } from "react";

const DURACION_MS = 4000;

// Mensaje breve abajo de la pantalla. La región live existe siempre y solo cambia su
// contenido, así los lectores de pantalla anuncian cada aviso nuevo.
export default function Aviso({ aviso, onCerrar }) {
    // En un ref, así un re-render del padre no reinicia el temporizador
    const alCerrar = useRef(onCerrar);
    alCerrar.current = onCerrar;

    // Cada aviso nuevo es otro objeto, así que el temporizador arranca de cero
    useEffect(() => {
        if (aviso == null) return;
        const temporizador = setTimeout(() => alCerrar.current(), DURACION_MS);
        return () => clearTimeout(temporizador);
    }, [aviso]);

    return (
        <div className="aviso-region" role="status" aria-live="polite">
            {aviso && (
                <div className="aviso">
                    <span>{aviso.texto}</span>
                    {aviso.accion && (
                        <button className="aviso-accion" onClick={() => { aviso.accion.onClick(); onCerrar(); }}>
                            {aviso.accion.texto}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
