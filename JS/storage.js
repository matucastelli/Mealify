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

    if (planes.includes(idReceta)) {
        return false;
    } else {
        const plan = [...planes, idReceta];
        planSemanal[dia][franja] = plan;
        localStorage.setItem("plan", JSON.stringify(planSemanal));
        return true;
    }
}

export function eliminarReceta(id, dia, franja) {
    const plan = getPlanSemanal();
    let planEliminarReceta = plan[dia][franja].filter(idGuardado => idGuardado !== id);
    plan[dia][franja] = planEliminarReceta;
    localStorage.setItem("plan", JSON.stringify(plan));
}

export function moverReceta(id, diaOrigen, franjaOrigen, diaDestino, franjaDestino, indiceDestino) {
    const plan = getPlanSemanal();
    plan[diaOrigen][franjaOrigen] = plan[diaOrigen][franjaOrigen].filter(idGuardado => idGuardado !== id);
    plan[diaDestino][franjaDestino].splice(indiceDestino, 0, id);
    localStorage.setItem("plan", JSON.stringify(plan));
}