// Si falla la red o el servidor, las funciones lanzan un error; así quien llama puede
// distinguir "no hubo respuesta" de "la respuesta vino vacía".
async function pedirJson(url) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al pedir ${url}`);
    }
    return respuesta.json();
}

export async function buscarRecetas(query) {
    const datos = await pedirJson(`/api/buscar?query=${encodeURIComponent(query)}`);
    return datos.results ?? [];
}

export async function obtenerDetalleReceta(id) {
    const receta = await pedirJson(`/api/detalle?id=${encodeURIComponent(id)}`);
    return receta.id == null ? null : receta;
}

export async function obtenerRecetasRandom(cantidad) {
    const datos = await pedirJson(`/api/random?cantidad=${cantidad}`);
    return datos.recipes ?? [];
}
