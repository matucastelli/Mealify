import { useState } from "react";
import { getComprasMarcadas, getComprasOcultas, toggleCompra, ocultarComprasMarcadas, mostrarCompras, restaurarCompras } from "../lib/storage.js";

export function useCompras() {
    const [marcadas, setMarcadas] = useState(getComprasMarcadas);
    const [ocultas, setOcultas] = useState(getComprasOcultas);

    function releer() {
        setMarcadas(getComprasMarcadas());
        setOcultas(getComprasOcultas());
    }

    function alternarCompra(clave) {
        toggleCompra(clave);
        setMarcadas(getComprasMarcadas());
    }

    function limpiarMarcadas() {
        ocultarComprasMarcadas();
        releer();
    }

    // Vuelve a mostrar ingredientes ocultos (por ejemplo, al planificar de nuevo una receta)
    function mostrar(claves) {
        mostrarCompras(claves);
        releer();
    }

    function restaurar() {
        restaurarCompras();
        releer();
    }

    return { marcadas, ocultas, alternarCompra, limpiarMarcadas, mostrar, restaurar };
}
