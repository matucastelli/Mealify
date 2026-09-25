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
    const yaEsFavorito = favoritos.some(fav => fav.id === receta.id);

    let nuevosFavoritos;
    if (yaEsFavorito) {
        nuevosFavoritos = favoritos.filter(fav => fav.id !== receta.id);
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

export function getComprasMarcadas() {
    const datosGuardados = localStorage.getItem("comprasMarcadas");
    return datosGuardados == null ? [] : JSON.parse(datosGuardados);
}

export function toggleCompra(clave) {
    const marcadas = getComprasMarcadas();
    const nuevasMarcadas = marcadas.includes(clave)
        ? marcadas.filter(item => item !== clave)
        : [...marcadas, clave];
    localStorage.setItem("comprasMarcadas", JSON.stringify(nuevasMarcadas));
}

export function getComprasOcultas() {
    const datosGuardados = localStorage.getItem("comprasOcultas");
    return datosGuardados == null ? [] : JSON.parse(datosGuardados);
}

export function ocultarComprasMarcadas() {
    const marcadas = getComprasMarcadas();
    const ocultas = getComprasOcultas();
    const nuevasOcultas = [...new Set([...ocultas, ...marcadas])];
    localStorage.setItem("comprasOcultas", JSON.stringify(nuevasOcultas));
    localStorage.removeItem("comprasMarcadas");
}

export function mostrarCompras(claves) {
    const ocultas = getComprasOcultas().filter(clave => !claves.includes(clave));
    const marcadas = getComprasMarcadas().filter(clave => !claves.includes(clave));
    localStorage.setItem("comprasOcultas", JSON.stringify(ocultas));
    localStorage.setItem("comprasMarcadas", JSON.stringify(marcadas));
}

export function restaurarCompras() {
    localStorage.removeItem("comprasOcultas");
    localStorage.removeItem("comprasMarcadas");
}