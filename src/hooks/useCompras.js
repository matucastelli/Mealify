import { useState } from "react";
import { getComprasMarcadas, getComprasOcultas, toggleCompra, ocultarComprasMarcadas } from "../lib/storage.js";

export function useCompras() {
    const [marcadas, setMarcadas] = useState(getComprasMarcadas);
    const [ocultas, setOcultas] = useState(getComprasOcultas);

    function alternarCompra(clave) {
        toggleCompra(clave);
        setMarcadas(getComprasMarcadas());
    }

    function limpiarMarcadas() {
        ocultarComprasMarcadas();
        setMarcadas(getComprasMarcadas());
        setOcultas(getComprasOcultas());
    }

    return { marcadas, ocultas, alternarCompra, limpiarMarcadas };
}
