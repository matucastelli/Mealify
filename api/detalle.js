import axios from "axios";
import { withMock } from "./_lib/mock.js";
import { traducirRespuesta } from "./_lib/traducirRespuesta.js";
import { traducirReceta } from "./_lib/traducirReceta.js";

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        const original = await withMock(`detalle_${id}`, async () => {
            const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_KEY}`;
            const respuesta = await axios.get(url);
            return respuesta.data;
        });
        // Sin id es que Spoonacular no encontró la receta: no hay nada que traducir
        const datos = original.id == null
            ? original
            : await traducirRespuesta(res, `detalle_es_${id}`, original, traducirReceta);
        res.status(200).json(datos);
    } catch (error) {
        console.error("EL ERROR REAL ES:", error);
        res.status(500).json({ error: "Hubo un error al obtener el detalle" });
    }
}