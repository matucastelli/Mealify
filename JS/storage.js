export function getFavoritos() {
    const datosGuardados = localStorage.getItem("favoritos");
    if (datosGuardados == null) {
        return [];
    } else {
        return JSON.parse(datosGuardados);
    }
}

export function toggleFavorito(receta) {
    const favoritos = getFavoritos();
    const yaEsFavorito = favoritos.some(fav => fav.idMeal === receta.idMeal);

    let nuevosFavoritos;
    if (yaEsFavorito) {
        nuevosFavoritos = favoritos.filter(fav => fav.idMeal !== receta.idMeal);
    } else {
        nuevosFavoritos = [...favoritos, receta];
    }

    localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
}