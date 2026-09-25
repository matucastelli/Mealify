// Junta los ingredientes de todas las recetas del plan. Los que se repiten
// (mismo nombre y unidad) suman su cantidad cuando ambas son numéricas.
export function armarListaCompras(recetas, ocultas) {
    const ingredientes = new Map();

    recetas.filter(Boolean).forEach(receta => {
        receta.extendedIngredients?.forEach(ingrediente => {
            const nombre = ingrediente.name || ingrediente.original;
            const unidad = ingrediente.unit || '';
            const clave = `${nombre.trim().toLowerCase()}|${unidad.trim().toLowerCase()}`;
            const cantidad = Number(ingrediente.amount);
            const actual = ingredientes.get(clave);

            if (actual && Number.isFinite(cantidad) && Number.isFinite(actual.valor)) {
                actual.valor += cantidad;
                actual.cantidad = `${Number(actual.valor.toFixed(2))} ${unidad}`.trim();
            } else if (!actual) {
                ingredientes.set(clave, {
                    clave,
                    nombre: nombre.trim(),
                    valor: cantidad,
                    cantidad: ingrediente.original || `${ingrediente.amount || ''} ${unidad}`.trim()
                });
            }
        });
    });

    return [...ingredientes.values()].filter(i => !ocultas.includes(i.clave));
}

export function idsDelPlan(plan) {
    const ids = new Set();
    Object.values(plan).forEach(dia => {
        Object.values(dia).forEach(franja => franja.forEach(id => ids.add(id)));
    });
    return [...ids];
}
