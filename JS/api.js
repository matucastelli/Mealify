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