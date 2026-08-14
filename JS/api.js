export async function buscarRecetas(query) {
    try {
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.meals == null) {
            return [];
        } else {
            return datos.meals;
        }
    } catch(error) {
        console.error("Hubo un error cargando las recetas", error);
        return [];
    }
}

export async function obtenerDetalleReceta(id) {
    try {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        const respuesta = await fetch(url);
        const receta = await respuesta.json();

        if (receta.meals == null) {
            return null
        } else {
            return receta.meals[0]
        }
    } catch (error) {
        console.error("Hubo un error cargando el detalle de la receta", error);
        return null;
    }
}

