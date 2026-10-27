// Registro de peso (funciones puras, sin React ni storage).
// Cada entrada es { fecha: "AAAA-MM-DD", kg }; la lista va ordenada por fecha, con una sola por día.
import { formatearNumero } from "./macros.js";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Más días que esto sin cargar el peso y la tarjeta lo recuerda
export const DIAS_PARA_RECORDAR = 7;

// Fecha local (no UTC: a la noche de Argentina, UTC ya es el día siguiente)
export function fechaDeHoy(ahora = new Date()) {
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${ahora.getFullYear()}-${mes}-${dia}`;
}

// Si ya hay un peso en esa fecha, gana el nuevo
export function agregarPeso(pesos, fecha, kg) {
    return [...pesos.filter(peso => peso.fecha !== fecha), { fecha, kg }]
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// El único peso no se borra: el perfil siempre tiene uno
export function quitarPeso(pesos, fecha) {
    if (pesos.length <= 1) return pesos;
    return pesos.filter(peso => peso.fecha !== fecha);
}

export function diasEntre(desde, hasta) {
    return Math.round((Date.parse(hasta) - Date.parse(desde)) / MS_POR_DIA);
}

// "2026-10-12" → "12/10"; si no es de este año, "12/10/2025"
export function formatearFecha(fecha, hoy = fechaDeHoy()) {
    const [anio, mes, dia] = fecha.split("-");
    return anio === hoy.slice(0, 4) ? `${dia}/${mes}` : `${dia}/${mes}/${anio}`;
}

// "en 5 días", "en 6 semanas", "en 4 meses"
function describirLapso(dias) {
    if (dias < 14) return `en ${dias} ${dias === 1 ? "día" : "días"}`;
    if (dias < 91) return `en ${Math.round(dias / 7)} semanas`;
    return `en ${Math.round(dias / 30.4)} meses`;
}

// Cambio entre el primer y el último peso, y si va para el lado de la meta
export function resumirCambio(pesos, meta) {
    if (pesos.length < 2) return null;
    const primero = pesos[0];
    const ultimo = pesos[pesos.length - 1];
    const diferencia = Math.round((ultimo.kg - primero.kg) * 10) / 10;
    const lapso = describirLapso(diasEntre(primero.fecha, ultimo.fecha));
    if (diferencia === 0) return { texto: `Sin cambios ${lapso}`, aFavor: meta === "mantener" };
    const signo = diferencia > 0 ? "+" : "−";
    return {
        texto: `${signo}${formatearNumero(Math.abs(diferencia))} kg ${lapso}`,
        aFavor: (meta === "bajar" && diferencia < 0) || (meta === "subir" && diferencia > 0),
    };
}

// Posición de cada peso en el gráfico, en % del ancho y del alto. Las x van según la fecha
// (no según el orden), así dos cargas seguidas quedan juntas y un mes sin cargar se nota
export function puntosDelGrafico(pesos) {
    const desde = Date.parse(pesos[0].fecha);
    const lapso = Date.parse(pesos[pesos.length - 1].fecha) - desde || 1;
    const kgs = pesos.map(peso => peso.kg);
    const minimo = Math.min(...kgs);
    const rango = Math.max(...kgs) - minimo;
    return pesos.map(peso => ({
        ...peso,
        x: 4 + (Date.parse(peso.fecha) - desde) / lapso * 92,
        // Arriba queda lugar para los números; con todos los pesos iguales, la línea va al medio
        y: rango === 0 ? 50 : 25 + (1 - (peso.kg - minimo) / rango) * 60,
    }));
}
