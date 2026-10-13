export const DIAS = [
    { valor: "lunes", nombre: "Lunes", nombreConTilde: "Lunes" },
    { valor: "martes", nombre: "Martes", nombreConTilde: "Martes" },
    { valor: "miercoles", nombre: "Miercoles", nombreConTilde: "Miércoles" },
    { valor: "jueves", nombre: "Jueves", nombreConTilde: "Jueves" },
    { valor: "viernes", nombre: "Viernes", nombreConTilde: "Viernes" },
    { valor: "sabado", nombre: "Sabado", nombreConTilde: "Sábado" },
    { valor: "domingo", nombre: "Domingo", nombreConTilde: "Domingo" },
];

export const FRANJAS = [
    { valor: "desayuno", nombre: "Desayuno", icono: "fa-mug-hot" },
    { valor: "almuerzo", nombre: "Almuerzo", icono: "fa-utensils" },
    { valor: "cena", nombre: "Cena", icono: "fa-moon" },
];

// "Lunes · Almuerzo", para títulos y avisos
export function describirFranja(dia, franja) {
    const nombreDia = DIAS.find(d => d.valor === dia).nombreConTilde;
    const nombreFranja = FRANJAS.find(f => f.valor === franja).nombre;
    return `${nombreDia} · ${nombreFranja}`;
}
