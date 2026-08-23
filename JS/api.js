export async function buscarRecetas(query) {
    try {
        const url = `/api/buscar?query=${query}`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.meals == null) {
            return [];
        } else {
            return datos.results;
        }
    } catch(error) {
        console.error("Hubo un error cargando las recetas", error);
        return [];
    }
}

export async function obtenerDetalleReceta(id) {
    try {
        const url = `/api/detalle?id=${id}`;;
        const respuesta = await fetch(url);
        const receta = await respuesta.json();

        if (receta.id == null) {
            return null
        } else {
            return receta
        }
    } catch (error) {
        console.error("Hubo un error cargando el detalle de la receta", error);
        return null;
    }
}

export async function obtenerRecetasRandom(cantidad) {
    try {
        const url = `/api/random?cantidad=${cantidad}`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.recipes == null) {
            return [];
        } else {
            return datos.recipes;
        }
    } catch (error) {
        console.error("Hubo un error cargando las recetas", error);
        return [];
    }
}