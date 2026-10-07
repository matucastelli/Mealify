import { obtenerDetalleReceta } from "./api.js";

// Cache de detalles de recetas compartido por toda la app y guardado en localStorage,
// para no volver a pedir (y gastar cuota de Spoonacular) cada vez que se recarga la página.
const CLAVE_STORAGE = "cacheRecetas";
const MAXIMO_GUARDADAS = 50;

const cacheRecetas = new Map(leerGuardadas());
const pedidosEnCurso = new Map();
// Ids cuyo último pedido falló (red o servidor); se vuelven a pedir en el próximo intento
const fallidas = new Set();

function leerGuardadas() {
    try {
        const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
        return datosGuardados == null ? [] : JSON.parse(datosGuardados);
    } catch {
        return [];
    }
}

function guardar() {
    const recetasValidas = [...cacheRecetas].filter(([, receta]) => receta != null).slice(-MAXIMO_GUARDADAS);
    try {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(recetasValidas));
    } catch {
        // localStorage lleno o no disponible: el cache sigue funcionando en memoria
    }
}

export function tieneReceta(id) {
    return cacheRecetas.has(String(id));
}

export function leerReceta(id) {
    return cacheRecetas.get(String(id));
}

export function fallo(id) {
    return fallidas.has(String(id));
}

export function obtenerRecetaCacheada(id) {
    const clave = String(id);
    if (cacheRecetas.has(clave)) return Promise.resolve(cacheRecetas.get(clave));

    if (!pedidosEnCurso.has(clave)) {
        // Si el pedido falla no se guarda en el cache, así el próximo intento vuelve a pedirla
        fallidas.delete(clave);
        const pedido = obtenerDetalleReceta(clave)
            .then(receta => {
                cacheRecetas.set(clave, receta);
                if (receta != null) guardar();
                return receta;
            }, error => {
                fallidas.add(clave);
                throw error;
            })
            .finally(() => pedidosEnCurso.delete(clave));
        pedidosEnCurso.set(clave, pedido);
    }
    return pedidosEnCurso.get(clave);
}
