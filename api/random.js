import axios from "axios";
import { withMock } from "./_lib/mock.js";
import { traducirRespuesta } from "./_lib/traducirRespuesta.js";
import { traducirTitulos } from "./_lib/traducirReceta.js";

export default async function handler(req, res) {
    const { cantidad } = req.query;

    try {
        const original = await withMock(`random_${cantidad}`, async () => {
            const url = `https://api.spoonacular.com/recipes/random?number=${cantidad}&apiKey=${process.env.SPOONACULAR_KEY}`;
            const respuesta = await axios.get(url);
            return respuesta.data;
        });
        // Son al azar: no se guardan en la CDN
        const datos = await traducirRespuesta(res, `random_es_${cantidad}`, original, async ({ recipes = [], ...resto }) => ({
            ...resto,
            recipes: await traducirTitulos(recipes),
        }), { cachear: false });
        res.status(200).json(datos);
    } catch (error) {
        console.error("EL ERROR REAL ES:", error);
        res.status(500).json({ error: "Hubo un error al obtener recetas" });
    }
}