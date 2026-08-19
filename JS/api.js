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

export async function obtenerRecetaRandom() {
    try {
        const url = `https://www.themealdb.com/api/json/v1/1/random.php`;
        const respuesta = await fetch(url);
        const recetaRandom = await respuesta.json();

        if (recetaRandom.meals == null) {
            return null;
        } else {
            return recetaRandom.meals[0];
        }
    } catch (error) {
        console.error("Hubo un error cargando la receta", error);
        return null;
    }
}

export async function obtenerRecetasRandom(cantidad) {
    const arrayRecetasRandoms = new Array(cantidad).fill(null);
    const promesas = arrayRecetasRandoms.map(elemento => obtenerRecetaRandom());
    const recetasRandoms = await Promise.all(promesas);
    const idsVistos = new Set();
    const recetasUnicas = recetasRandoms.filter(receta => {
        if (idsVistos.has(receta.idMeal)) {
            return false
        } else {
            idsVistos.add(receta.idMeal)
            return true
        }
    })
    return recetasUnicas;
}