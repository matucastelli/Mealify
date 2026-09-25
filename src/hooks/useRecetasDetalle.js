import { useEffect, useState } from "react";
import { obtenerDetalleReceta } from "../lib/api.js";

// Cache compartido entre componentes: cada detalle se pide una sola vez por sesión.
const cacheRecetas = new Map();
const pedidosEnCurso = new Map();

function pedirReceta(id) {
    if (!pedidosEnCurso.has(id)) {
        pedidosEnCurso.set(id, obtenerDetalleReceta(id).then(receta => {
            cacheRecetas.set(id, receta);
            pedidosEnCurso.delete(id);
        }));
    }
    return pedidosEnCurso.get(id);
}

// Devuelve { recetas: Map(id -> receta | null), cargando } para los ids pedidos.
export function useRecetasDetalle(ids) {
    const [, setVersion] = useState(0);
    const clave = ids.join(",");

    useEffect(() => {
        const faltantes = clave.split(",").filter(id => id && !cacheRecetas.has(id));
        if (faltantes.length === 0) return;

        let cancelado = false;
        Promise.all(faltantes.map(pedirReceta)).then(() => {
            if (!cancelado) setVersion(v => v + 1);
        });
        return () => { cancelado = true; };
    }, [clave]);

    const cargando = ids.some(id => !cacheRecetas.has(id));
    return { recetas: cacheRecetas, cargando };
}
