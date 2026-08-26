import axios from "axios";
import { withMock } from "./_lib/mock.js";

export default async function handler(req, res) {
    const { query } = req.query;

    try {
        const key = `buscar_${query.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const datos = await withMock(key, async () => {
            const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${process.env.SPOONACULAR_KEY}`;
            const respuesta = await axios.get(url);
            return respuesta.data;
        });
        res.status(200).json(datos);
    } catch (error) {
        console.error("EL ERROR REAL ES:", error);
        res.status(500).json({ error: "Hubo un error al buscar recetas" });
    }
}