export const DIAS = [
    { valor: "lunes", nombre: "Lunes" },
    { valor: "martes", nombre: "Martes" },
    { valor: "miercoles", nombre: "Miércoles" },
    { valor: "jueves", nombre: "Jueves" },
    { valor: "viernes", nombre: "Viernes" },
    { valor: "sabado", nombre: "Sábado" },
    { valor: "domingo", nombre: "Domingo" },
];

export const FRANJAS = [
    { valor: "desayuno", nombre: "Desayuno", icono: "fa-mug-hot" },
    { valor: "almuerzo", nombre: "Almuerzo", icono: "fa-utensils" },
    { valor: "cena", nombre: "Cena", icono: "fa-moon" },
];

// "Lunes · Almuerzo", para títulos y avisos
export function describirFranja(dia, franja) {
    const nombreDia = DIAS.find(d => d.valor === dia).nombre;
    const nombreFranja = FRANJAS.find(f => f.valor === franja).nombre;
    return `${nombreDia} · ${nombreFranja}`;
}
