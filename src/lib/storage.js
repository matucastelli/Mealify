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

// Sin índice de destino, la receta va al final de la franja
export function moverReceta(id, diaOrigen, franjaOrigen, diaDestino, franjaDestino, indiceDestino = Infinity) {
    const plan = getPlanSemanal();
    const mismaFranja = diaOrigen === diaDestino && franjaOrigen === franjaDestino;
    if (!mismaFranja && plan[diaDestino][franjaDestino].includes(id)) {
        return false;
    }
    plan[diaOrigen][franjaOrigen] = plan[diaOrigen][franjaOrigen].filter(idGuardado => idGuardado !== id);
    plan[diaDestino][franjaDestino].splice(indiceDestino, 0, id);
    localStorage.setItem("plan", JSON.stringify(plan));
    return true;
}

// Antes la clave era "nombre|unidad"; ahora hay una fila por ingrediente y la clave es solo el nombre
function leerClavesCompras(nombreItem) {
    const datosGuardados = localStorage.getItem(nombreItem);
    if (datosGuardados == null) return [];
    const claves = JSON.parse(datosGuardados);
    const migradas = [...new Set(claves.map(clave => clave.includes("|") ? clave.slice(0, clave.lastIndexOf("|")) : clave))];
    if (migradas.length !== claves.length || migradas.some((clave, i) => clave !== claves[i])) {
        localStorage.setItem(nombreItem, JSON.stringify(migradas));
    }
    return migradas;
}

export function getComprasMarcadas() {
    return leerClavesCompras("comprasMarcadas");
}

export function toggleCompra(clave) {
    const marcadas = getComprasMarcadas();
    const nuevasMarcadas = marcadas.includes(clave)
        ? marcadas.filter(item => item !== clave)
        : [...marcadas, clave];
    localStorage.setItem("comprasMarcadas", JSON.stringify(nuevasMarcadas));
}

export function getComprasOcultas() {
    return leerClavesCompras("comprasOcultas");
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
// Perfil para el objetivo diario: { sexo, edad, altura, peso, actividad, meta, reparto }.
// `reparto: null` es el recomendado. null si todavía no se cargó
export function getPerfil() {
    try {
        const datosGuardados = localStorage.getItem("perfil");
        return datosGuardados == null ? null : JSON.parse(datosGuardados);
    } catch {
        return null;
    }
}

export function guardarPerfil(perfil) {
    try {
        localStorage.setItem("perfil", JSON.stringify(perfil));
    } catch {
        // localStorage lleno o no disponible: el perfil queda solo en memoria
    }
}

// true si en la bienvenida se tocó "Ahora no": no se vuelve a ofrecer
export function getPerfilOmitido() {
    try {
        return localStorage.getItem("perfilOmitido") === "true";
    } catch {
        return false;
    }
}

export function omitirPerfil() {
    try {
        localStorage.setItem("perfilOmitido", "true");
    } catch {
        // localStorage no disponible
    }
}

// Pesos cargados en Mi progreso: [{ fecha: "AAAA-MM-DD", kg }], ordenados por fecha
export function getPesos() {
    try {
        const datosGuardados = localStorage.getItem("pesos");
        return datosGuardados == null ? [] : JSON.parse(datosGuardados);
    } catch {
        return [];
    }
}

export function guardarPesos(pesos) {
    try {
        localStorage.setItem("pesos", JSON.stringify(pesos));
    } catch {
        // localStorage lleno o no disponible: los pesos quedan solo en memoria
    }
}
