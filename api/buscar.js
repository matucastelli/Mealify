import axios from "axios";
import { withMock } from "./_lib/mock.js";
import { traducirAIngles } from "./_lib/traducir.js";

export default async function handler(req, res) {
    const { query } = req.query;

    try {
        // Spoonacular solo busca en inglés; el mock se guarda con el término ya traducido
        const queryIngles = await traducirAIngles(query);
        const key = `buscar_${queryIngles.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const datos = await withMock(key, async () => {
            const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(queryIngles)}&apiKey=${process.env.SPOONACULAR_KEY}`;
            const respuesta = await axios.get(url);
            return respuesta.data;
        });
        res.status(200).json(datos);
    } catch (error) {
        console.error("EL ERROR REAL ES:", error);
        res.status(500).json({ error: "Hubo un error al buscar recetas" });
    }
}
