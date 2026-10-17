import { traducirAlEspanol } from "./traducir.js";

// Traduce lo que se muestra de una receta. Los nombres de los ingredientes quedan en inglés
// en `name` (son la clave de la lista de compras) y la traducción va en `nombreEs`.
export async function traducirReceta(receta) {
    const ingredientes = receta.extendedIngredients ?? [];
    const nombres = [...new Set(ingredientes.map(i => i.name).filter(Boolean))];
    const textos = [receta.title, ...ingredientes.map(i => i.original || i.name || ""), ...nombres];

    const [traducidos, [instrucciones] = []] = await Promise.all([
        traducirAlEspanol(textos),
        receta.instructions ? traducirAlEspanol([receta.instructions], { html: true }) : Promise.resolve([]),
    ]);

    const [titulo, ...resto] = traducidos;
    const originales = resto.slice(0, ingredientes.length);
    const nombresEs = new Map(nombres.map((nombre, i) => [nombre, resto[ingredientes.length + i]]));

    return {
        ...receta,
        title: titulo,
        extendedIngredients: ingredientes.map((ingrediente, i) => ({
            ...ingrediente,
            original: originales[i],
            nombreEs: nombresEs.get(ingrediente.name),
        })),
        instructions: instrucciones ?? receta.instructions,
        idioma: "es",
    };
}

// Para los listados solo se ve el título: se traducen todos juntos en un pedido
export async function traducirTitulos(recetas) {
    if (recetas.length === 0) return recetas;
    const titulos = await traducirAlEspanol(recetas.map(receta => receta.title));
    return recetas.map((receta, i) => ({ ...receta, title: titulos[i], idioma: "es" }));
}
