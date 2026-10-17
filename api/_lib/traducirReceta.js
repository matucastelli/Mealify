import { traducirAlEspanol } from "./traducir.js";

// Traduce lo que se muestra de una receta. Los nombres de los ingredientes quedan en inglés
// en `name` (son la clave de la lista de compras) y la traducción va en `nombreEs`.
// Los pasos se toman de `analyzedInstructions`; `instructions` (HTML) solo se traduce
// si la receta no trae los pasos separados.
export async function traducirReceta(receta) {
    const ingredientes = receta.extendedIngredients ?? [];
    const nombres = [...new Set(ingredientes.map(i => i.name).filter(Boolean))];
    const bloques = receta.analyzedInstructions ?? [];
    const pasos = bloques.flatMap(bloque => bloque.steps ?? []);
    const nombresBloques = bloques.map(bloque => bloque.name).filter(Boolean);
    const traducirHtml = pasos.length === 0 && Boolean(receta.instructions);

    const textos = [
        receta.title,
        ...ingredientes.map(i => i.original || i.name || ""),
        ...nombres,
        ...pasos.map(paso => paso.step),
        ...nombresBloques,
    ];
    const [traducidos, [instrucciones] = []] = await Promise.all([
        traducirAlEspanol(textos),
        traducirHtml ? traducirAlEspanol([receta.instructions], { html: true }) : Promise.resolve([]),
    ]);

    // Se toman las traducciones en el mismo orden en que se mandaron
    let posicion = 0;
    const tomar = cantidad => traducidos.slice(posicion, (posicion += cantidad));
    const [titulo] = tomar(1);
    const originales = tomar(ingredientes.length);
    const nombresEs = new Map(nombres.map((nombre, i) => [nombre, tomar(1)[0] ?? nombre]));
    const pasosEs = tomar(pasos.length);
    const nombresBloquesEs = tomar(nombresBloques.length);

    let indicePaso = 0;
    let indiceBloque = 0;
    const bloquesEs = bloques.map(bloque => ({
        ...bloque,
        name: bloque.name ? nombresBloquesEs[indiceBloque++] : bloque.name,
        steps: (bloque.steps ?? []).map(paso => ({ ...paso, step: pasosEs[indicePaso++] })),
    }));

    return {
        ...receta,
        title: titulo,
        extendedIngredients: ingredientes.map((ingrediente, i) => ({
            ...ingrediente,
            original: originales[i],
            nombreEs: nombresEs.get(ingrediente.name),
        })),
        analyzedInstructions: bloquesEs,
        instructions: traducirHtml ? instrucciones : receta.instructions,
        idioma: "es",
    };
}

// Para los listados solo se ve el título: se traducen todos juntos en un pedido
export async function traducirTitulos(recetas) {
    if (recetas.length === 0) return recetas;
    const titulos = await traducirAlEspanol(recetas.map(receta => receta.title));
    return recetas.map((receta, i) => ({ ...receta, title: titulos[i], idioma: "es" }));
}
