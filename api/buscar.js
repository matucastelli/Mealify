import axios from "axios";

export default async function handler(req, res) {
    const { query } = req.query;

    try {
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${process.env.SPOONACULAR_KEY}`;
        const respuesta = await axios.get(url);
        res.status(200).json(respuesta.data);
    } catch {
        console.error("EL ERROR REAL ES:", error);
        res.status(500).json({ error: "Hubo un error al buscar recetas" }); 
    }
}