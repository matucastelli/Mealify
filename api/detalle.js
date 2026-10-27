import axios from "axios";
import { withMock } from "./_lib/mock.js";
import { traducirRespuesta } from "./_lib/traducirRespuesta.js";
import { traducirReceta } from "./_lib/traducirReceta.js";

// Nutrientes de Spoonacular (por porción) que se devuelven como `macros`
const NUTRIENTES = {
    calorias: "Calories",
    proteinas: "Protein",
    grasas: "Fat",
    carbohidratos: "Carbohydrates",
};

// La nutrición completa de Spoonacular es pesada: solo se guardan los cuatro macros,
// redondeados, o null si falta alguno
function extraerMacros(nutrition) {
    const nutrientes = nutrition?.nutrients ?? [];
    const macros = {};
    for (const [clave, nombre] of Object.entries(NUTRIENTES)) {
        const nutriente = nutrientes.find(n => n.name === nombre);
        if (typeof nutriente?.amount !== "number") return null;
        macros[clave] = Math.round(nutriente.amount);
    }
    return macros;
}

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        const original = await withMock(`detalle_n_${id}`, async () => {
            const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${process.env.SPOONACULAR_KEY}`;
            const respuesta = await axios.get(url);
            const { nutrition, ...receta } = respuesta.data;
            return receta.id == null ? receta : { ...receta, macros: extraerMacros(nutrition) };
        });
        // Sin id es que Spoonacular no encontró la receta: no hay nada que traducir
        const datos = original.id == null
            ? original
            : await traducirRespuesta(res, `detalle_es_n_${id}`, original, traducirReceta);
        res.status(200).json(datos);
    } catch (error) {
        console.error("EL ERROR REAL ES:", error);
        res.status(500).json({ error: "Hubo un error al obtener el detalle" });
    }
}
