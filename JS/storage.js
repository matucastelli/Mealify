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

export function getPlanSemanal() {
    const datosGuardados = localStorage.getItem("plan");
    if (datosGuardados == null){
    const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const planVacio = {};
    dias.forEach(dia => {
        planVacio[dia] = { desayuno: [], almuerzo: [], cena: [] };
    });
    return planVacio;
    } else {
        return JSON.parse(datosGuardados);
    }
}

export function asignarReceta(idReceta, dia, franja) {
    const planSemanal = getPlanSemanal();
    const planes = planSemanal[dia][franja];
    const plan = [...planes, idReceta];
    planSemanal[dia][franja] = plan;
    localStorage.setItem("plan", JSON.stringify(planSemanal))
}