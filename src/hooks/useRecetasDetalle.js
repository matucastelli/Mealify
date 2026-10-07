import { useEffect, useState } from "react";
import { fallo, leerReceta, obtenerRecetaCacheada, tieneReceta } from "../lib/cacheRecetas.js";

// Devuelve { recetas: Map(id -> receta | null), cargando } para los ids pedidos.
export function useRecetasDetalle(ids) {
    const [, setVersion] = useState(0);
    const clave = ids.join(",");

    useEffect(() => {
        const faltantes = clave.split(",").filter(id => id && !tieneReceta(id));
        if (faltantes.length === 0) return;

        let cancelado = false;
        // allSettled: aunque falle alguna, se vuelve a renderizar con las que llegaron
        Promise.allSettled(faltantes.map(obtenerRecetaCacheada)).then(() => {
            if (!cancelado) setVersion(v => v + 1);
        });
        return () => { cancelado = true; };
    }, [clave]);

    const recetas = new Map(ids.filter(tieneReceta).map(id => [id, leerReceta(id)]));
    // Las que fallaron no cuentan como cargando, así la lista de compras no queda esperando para siempre
    const cargando = ids.some(id => !tieneReceta(id) && !fallo(id));
    return { recetas, cargando };
}
