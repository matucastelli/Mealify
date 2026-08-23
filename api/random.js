import axios from "axios";

export default async function handler(req, res) {
    const { cantidad } = req.query;

    try {
        console.log("LA CLAVE QUE LEE NODE ES:", process.env.SPOONACULAR_KEY);
        const url = `https://api.spoonacular.com/recipes/random?number=${cantidad}&apiKey=${process.env.SPOONACULAR_KEY}`;
        const respuesta = await axios.get(url);
        res.status(200).json(respuesta.data);
    } catch (error) {
        console.error("EL ERROR REAL ES:", error);
        res.status(500).json({ error: "Hubo un error al obtener recetas" });
    }
}