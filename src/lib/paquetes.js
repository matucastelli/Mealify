// Pasa las cantidades de las recetas a lo que hay que comprar.
// Es aproximado: todo se lleva a gramos, mililitros o unidades y se redondea a un paquete.

// Unidad de Spoonacular → [tipo, factor para llegar a g o ml]
const FACTORES = {
    g: ["g", 1], gram: ["g", 1], grams: ["g", 1],
    kg: ["g", 1000], kilogram: ["g", 1000], kilograms: ["g", 1000],
    oz: ["g", 28], ounce: ["g", 28], ounces: ["g", 28],
    lb: ["g", 454], lbs: ["g", 454], pound: ["g", 454], pounds: ["g", 454],
    ml: ["ml", 1], milliliter: ["ml", 1], milliliters: ["ml", 1],
    l: ["ml", 1000], liter: ["ml", 1000], liters: ["ml", 1000], litre: ["ml", 1000], litres: ["ml", 1000],
    tsp: ["ml", 5], tsps: ["ml", 5], teaspoon: ["ml", 5], teaspoons: ["ml", 5],
    tbsp: ["ml", 15], tbsps: ["ml", 15], tablespoon: ["ml", 15], tablespoons: ["ml", 15],
    cup: ["ml", 240], cups: ["ml", 240],
    "fl oz": ["ml", 30], "fl. oz": ["ml", 30],
};

// Unidades que no dicen cuánto comprar ("salt to taste" llega como "servings")
const SIN_CANTIDAD = new Set(["serving", "servings", "pinch", "pinches", "dash", "dashes", "handful", "handfuls"]);

// Paquetes reales de ingredientes comunes. Se busca la primera palabra que aparezca en el nombre,
// así que lo más específico va antes ("olive oil" antes que "oil").
const TABLA_PAQUETES = [
    { palabra: "garlic", tipo: "u", tamano: 10, nombre: ["cabeza", "cabezas"], unidad: ["diente", "dientes"] },
    { palabra: "eggs?", tipo: "u", tamano: 6 },
    { palabra: "brown sugar", tipo: "g", tamano: 500 },
    { palabra: "sugar", tipo: "g", tamano: 1000 },
    { palabra: "flour", tipo: "g", tamano: 1000 },
    { palabra: "rice", tipo: "g", tamano: 1000 },
    { palabra: "pasta|spaghetti|linguine|penne", tipo: "g", tamano: 500 },
    { palabra: "bread crumbs|breadcrumbs", tipo: "g", tamano: 500 },
    { palabra: "butter", tipo: "g", tamano: 200 },
    { palabra: "cheese", tipo: "g", tamano: 250 },
    { palabra: "milk", tipo: "ml", tamano: 1000 },
    { palabra: "broth|stock", tipo: "ml", tamano: 1000 },
    { palabra: "wine", tipo: "ml", tamano: 750 },
    { palabra: "soy sauce", tipo: "ml", tamano: 250 },
    { palabra: "sesame oil", tipo: "ml", tamano: 250 },
    { palabra: "olive oil", tipo: "ml", tamano: 500 },
    { palabra: "oil", tipo: "ml", tamano: 900 },
].map(fila => ({ ...fila, regex: new RegExp(`\\b(${fila.palabra})\\b`) }));

const TAMANOS_GENERICOS = { g: [100, 250, 500, 1000], ml: [250, 500, 1000] };

// { tipo: "g" | "ml" | "u", valor } o null si el ingrediente no trae una cantidad real
export function aBase(ingrediente) {
    const metrica = ingrediente.measures?.metric;
    const cantidad = Number(metrica?.amount ?? ingrediente.amount);
    const unidad = (metrica?.unitShort || ingrediente.unit || "").trim().toLowerCase();

    if (!Number.isFinite(cantidad) || cantidad <= 0 || SIN_CANTIDAD.has(unidad)) return null;

    const factor = FACTORES[unidad];
    if (factor) return { tipo: factor[0], valor: cantidad * factor[1] };
    // Sin unidad, "large", "cloves", "pieces"... se cuentan como unidades
    return { tipo: "u", valor: cantidad };
}

function numero(valor, decimales = 1) {
    return valor.toLocaleString("es-AR", { maximumFractionDigits: decimales });
}

function medida(valor, tipo) {
    if (tipo === "g") return valor < 1000 ? `${numero(valor, 0)} g` : `${numero(valor / 1000)} kg`;
    return valor < 1000 ? `${numero(valor, 0)} ml` : `${numero(valor / 1000)} L`;
}

function unidades(valor, [singular, plural] = ["unidad", "unidades"]) {
    return `${numero(valor, 2)} ${valor === 1 ? singular : plural}`;
}

function paqueteDeTabla(fila, total) {
    const cantidad = Math.ceil(total / fila.tamano);
    if (fila.tipo === "u") return fila.nombre ? unidades(cantidad, fila.nombre) : unidades(cantidad * fila.tamano);
    if (cantidad === 1 || fila.tamano % 1000 === 0) return medida(cantidad * fila.tamano, fila.tipo);
    return `${cantidad} × ${medida(fila.tamano, fila.tipo)}`;
}

function paqueteGenerico(tipo, total) {
    if (tipo === "u") return unidades(Math.ceil(total));
    const tamano = TAMANOS_GENERICOS[tipo].find(t => t >= total) ?? Math.ceil(total / 1000) * 1000;
    return medida(tamano, tipo);
}

// totales: { g, ml, u } sumados de todas las recetas. Devuelve { comprar, necesitas } (strings o "")
export function calcularCompra({ nombre, esEspecia, totales }) {
    const fila = TABLA_PAQUETES.find(f => f.regex.test(nombre.toLowerCase()));
    // Si viene en g y en ml se suman igual (densidad 1): alcanza como aproximación
    const peso = totales.g + totales.ml;
    const tipoPeso = fila && fila.tipo !== "u" ? fila.tipo : totales.g >= totales.ml ? "g" : "ml";
    const partesComprar = [];
    const partesNecesitas = [];

    if (peso > 0) {
        partesComprar.push(fila && fila.tipo !== "u" ? paqueteDeTabla(fila, peso) : paqueteGenerico(tipoPeso, peso));
        partesNecesitas.push(`~${medida(Math.max(1, Math.round(peso)), tipoPeso)}`);
    }
    if (totales.u > 0) {
        partesComprar.push(fila?.tipo === "u" ? paqueteDeTabla(fila, totales.u) : paqueteGenerico("u", totales.u));
        partesNecesitas.push(unidades(totales.u, fila?.unidad));
    }

    let comprar = partesComprar.join(" + ");
    // Sin cantidad ("oil for cooking"): si se conoce el paquete, se compra uno
    if (!comprar && fila) comprar = paqueteDeTabla(fila, 1);
    // Las especias se compran por paquete, sin importar cuánto pida la receta
    if (esEspecia) comprar = "1 paquete";

    const necesitas = partesNecesitas.join(" + ");
    return { comprar, necesitas: necesitas === comprar ? "" : necesitas };
}
