import { aBase, calcularCompra } from "./paquetes.js";

const SIN_PASILLO = "Otros";

// Junta los ingredientes de todas las recetas del plan: una fila por ingrediente,
// con el total sumado en g, ml o unidades y el paquete a comprar.
export function armarListaCompras(recetas, ocultas) {
    const ingredientes = new Map();

    recetas.filter(Boolean).forEach(receta => {
        receta.extendedIngredients?.forEach(ingrediente => {
            const nombre = (ingrediente.name || ingrediente.original || "").trim();
            if (!nombre) return;
            const clave = nombre.toLowerCase();

            if (!ingredientes.has(clave)) {
                const pasillo = (ingrediente.aisle || "").split(";")[0].trim();
                ingredientes.set(clave, {
                    clave,
                    nombre,
                    pasillo: !pasillo || pasillo === "?" ? SIN_PASILLO : pasillo,
                    totales: { g: 0, ml: 0, u: 0 },
                    recetas: new Set(),
                });
            }

            const actual = ingredientes.get(clave);
            const cantidad = aBase(ingrediente);
            if (cantidad) actual.totales[cantidad.tipo] += cantidad.valor;
            if (receta.title) actual.recetas.add(receta.title);
        });
    });

    return [...ingredientes.values()]
        .filter(i => !ocultas.includes(i.clave))
        .map(i => ({ ...i, recetas: [...i.recetas], ...calcularCompra(i) }))
        .sort((a, b) => compararPasillos(a.pasillo, b.pasillo) || a.clave.localeCompare(b.clave));
}

function compararPasillos(a, b) {
    if (a === b) return 0;
    if (a === SIN_PASILLO) return 1;
    if (b === SIN_PASILLO) return -1;
    return a.localeCompare(b);
}

// La lista ya viene ordenada por pasillo: [{ pasillo, ingredientes }]
export function agruparPorPasillo(ingredientes) {
    const grupos = [];
    ingredientes.forEach(ingrediente => {
        const ultimo = grupos[grupos.length - 1];
        if (ultimo?.pasillo === ingrediente.pasillo) ultimo.ingredientes.push(ingrediente);
        else grupos.push({ pasillo: ingrediente.pasillo, ingredientes: [ingrediente] });
    });
    return grupos;
}

export function idsDelPlan(plan) {
    const ids = new Set();
    Object.values(plan).forEach(dia => {
        Object.values(dia).forEach(franja => franja.forEach(id => ids.add(id)));
    });
    return [...ids];
}
