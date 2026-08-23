export default async function handler(req, res) {
    const { id } = req.query;

    try {
        const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_KEY}`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        res.status(200).json(datos);
    } catch {
        res.status(500).json({ error: "Hubo un error al obtener el detalle" });
    }
}