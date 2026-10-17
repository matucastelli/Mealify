import axios from "axios";
import { withMock } from "./mock.js";

// Spoonacular solo busca en inglés. Las palabras comunes se traducen acá, sin demora;
// lo demás va a DeepL (si hay DEEPL_KEY). Las claves van en minúscula y sin tildes.
const FRASES = {
    "sin gluten": "gluten free",
    "sin tacc": "gluten free",
    "carne picada": "ground beef",
    "papas fritas": "fries",
};

const PALABRAS = {
    pollo: "chicken", carne: "beef", vaca: "beef", res: "beef", cerdo: "pork", chancho: "pork",
    cordero: "lamb", pavo: "turkey", pescado: "fish", salmon: "salmon", atun: "tuna",
    camaron: "shrimp", langostino: "shrimp", mariscos: "seafood",
    arroz: "rice", pasta: "pasta", fideos: "noodles", tallarines: "noodles", espagueti: "spaghetti",
    ensalada: "salad", sopa: "soup", guiso: "stew", estofado: "stew", curry: "curry",
    papa: "potato", patata: "potato", batata: "sweet potato", tomate: "tomato", cebolla: "onion",
    ajo: "garlic", zanahoria: "carrot", calabaza: "pumpkin", zapallo: "pumpkin", zapallito: "zucchini",
    berenjena: "eggplant", espinaca: "spinach", brocoli: "broccoli", champinon: "mushroom", hongo: "mushroom",
    palta: "avocado", aguacate: "avocado", choclo: "corn", maiz: "corn", lenteja: "lentil",
    garbanzo: "chickpea", poroto: "bean", frijol: "bean",
    queso: "cheese", huevo: "egg", leche: "milk", manteca: "butter", mantequilla: "butter", pan: "bread",
    pizza: "pizza", hamburguesa: "burger", taco: "taco", tarta: "pie", torta: "cake", pastel: "cake",
    galletita: "cookie", galleta: "cookie", postre: "dessert", chocolate: "chocolate",
    manzana: "apple", banana: "banana", platano: "banana", frutilla: "strawberry", fresa: "strawberry",
    limon: "lemon", naranja: "orange",
    vegano: "vegan", vegetariano: "vegetarian", desayuno: "breakfast", almuerzo: "lunch", cena: "dinner",
    horno: "baked", frito: "fried", asado: "roast", parrilla: "grilled", picante: "spicy", dulce: "sweet",
    salsa: "sauce",
};

// No cambian la búsqueda: "pollo con arroz" → "chicken rice"
const CONECTORES = new Set(["con", "de", "del", "al", "a", "la", "el", "los", "las", "y", "e", "en", "para"]);

const cache = new Map();

function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

// Prueba la palabra tal cual y en singular ("papas" → "papa", "camarones" → "camaron")
function buscarPalabra(palabra) {
    return PALABRAS[palabra] ?? PALABRAS[palabra.replace(/s$/, "")] ?? PALABRAS[palabra.replace(/es$/, "")];
}

// Devuelve { texto, completo }: completo es false si quedó alguna palabra sin traducir
function traducirConDiccionario(texto) {
    let normalizado = normalizar(texto);
    // Las frases quedan como una sola palabra ("gluten_free") hasta el final
    Object.entries(FRASES).forEach(([frase, ingles]) => {
        normalizado = normalizado.replace(new RegExp(`\\b${frase}\\b`, "g"), ingles.replace(/ /g, "_"));
    });

    let completo = true;
    const palabras = normalizado.split(" ")
        .filter(palabra => palabra && !CONECTORES.has(palabra))
        .map(palabra => {
            if (palabra.includes("_")) return palabra.replace(/_/g, " ");
            const traducida = buscarPalabra(palabra);
            if (!traducida) completo = false;
            return traducida ?? palabra;
        });

    return { texto: palabras.join(" "), completo };
}

const MAXIMO_TEXTOS_POR_PEDIDO = 50;

// Traduce varios textos con DeepL en un solo pedido (en tandas de 50). Lanza un error si falla.
async function traducirConDeepL(textos, { origen, destino, html = false, timeout = 2000 }) {
    const key = process.env.DEEPL_KEY;
    if (!key) throw new Error("Falta DEEPL_KEY");
    const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";

    const tandas = [];
    for (let i = 0; i < textos.length; i += MAXIMO_TEXTOS_POR_PEDIDO) {
        tandas.push(textos.slice(i, i + MAXIMO_TEXTOS_POR_PEDIDO));
    }
    const respuestas = await Promise.all(tandas.map(tanda => axios.post(
        `https://${host}/v2/translate`,
        {
            text: tanda,
            target_lang: destino,
            ...(origen && { source_lang: origen }),
            ...(html && { tag_handling: "html" }),
        },
        { headers: { Authorization: `DeepL-Auth-Key ${key}` }, timeout }
    )));
    return respuestas.flatMap(respuesta => respuesta.data.translations.map(t => t.text));
}

// Recetas de Spoonacular al español latinoamericano
export function traducirAlEspanol(textos, { html = false } = {}) {
    return traducirConDeepL(textos, { origen: "EN", destino: "ES-419", html, timeout: 5000 });
}

async function traducirBusquedaConDeepL(texto) {
    const clave = `traduccion_${normalizar(texto).replace(/[^a-z0-9]/g, "_")}`;
    const datos = await withMock(clave, async () => {
        const [traducido] = await traducirConDeepL([texto], { destino: "EN-US" });
        return { texto: traducido };
    });
    return datos.texto;
}

export async function traducirAIngles(texto) {
    const diccionario = traducirConDiccionario(texto);
    if (diccionario.completo || !process.env.DEEPL_KEY) return diccionario.texto;

    if (cache.has(texto)) return cache.get(texto);
    try {
        const traducido = await traducirBusquedaConDeepL(texto);
        cache.set(texto, traducido);
        return traducido;
    } catch (error) {
        // Si DeepL falla o tarda, se busca con lo que tradujo el diccionario
        console.error("No se pudo traducir con DeepL:", error.message);
        return diccionario.texto;
    }
}
