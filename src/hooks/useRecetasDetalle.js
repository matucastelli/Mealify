import { useEffect, useState } from "react";
import { leerReceta, obtenerRecetaCacheada, tieneReceta } from "../lib/cacheRecetas.js";

// Devuelve { recetas: Map(id -> receta | null), cargando } para los ids pedidos.
export function useRecetasDetalle(ids) {
    const [, setVersion] = useState(0);
    const clave = ids.join(",");

    useEffect(() => {
        const faltantes = clave.split(",").filter(id => id && !tieneReceta(id));
        if (faltantes.length === 0) return;

        let cancelado = false;
        Promise.all(faltantes.map(obtenerRecetaCacheada)).then(() => {
            if (!cancelado) setVersion(v => v + 1);
        });
        return () => { cancelado = true; };
    }, [clave]);

    const recetas = new Map(ids.filter(tieneReceta).map(id => [id, leerReceta(id)]));
    const cargando = ids.some(id => !tieneReceta(id));
    return { recetas, cargando };
}
