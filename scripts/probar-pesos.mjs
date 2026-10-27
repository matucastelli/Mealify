// Compara src/lib/pesos.js con resultados esperados a mano. Uso: node scripts/probar-pesos.mjs
import assert from "node:assert/strict";
import { agregarPeso, quitarPeso, fechaDeHoy, diasEntre, formatearFecha, resumirCambio, puntosDelGrafico } from "../src/lib/pesos.js";

let fallas = 0;
function caso(nombre, prueba) {
    try {
        prueba();
        console.log(`ok    ${nombre}`);
    } catch (error) {
        fallas++;
        console.log(`FALLA ${nombre}\n      ${error.message.split("\n").join("\n      ")}`);
    }
}

const pesos = [
    { fecha: "2026-08-31", kg: 81 },
    { fecha: "2026-09-21", kg: 79.9 },
    { fecha: "2026-10-12", kg: 78.5 },
];

caso("agregar un peso en el medio lo deja ordenado", () => {
    assert.deepEqual(agregarPeso(pesos, "2026-09-07", 80.6).map(p => p.fecha), ["2026-08-31", "2026-09-07", "2026-09-21", "2026-10-12"]);
});

caso("agregar en una fecha que ya tiene peso lo reemplaza", () => {
    const nuevos = agregarPeso(pesos, "2026-09-21", 80);
    assert.equal(nuevos.length, 3);
    assert.equal(nuevos[1].kg, 80);
});

caso("borrar un peso", () => {
    assert.deepEqual(quitarPeso(pesos, "2026-09-21").map(p => p.kg), [81, 78.5]);
});

caso("el único peso no se borra", () => {
    const uno = [{ fecha: "2026-10-12", kg: 78.5 }];
    assert.equal(quitarPeso(uno, "2026-10-12"), uno);
});

caso("fecha de hoy en hora local", () => {
    // 23:30 del 27/10 en la compu: en UTC ya sería el 28
    assert.equal(fechaDeHoy(new Date(2026, 9, 27, 23, 30)), "2026-10-27");
});

caso("días entre fechas y formato corto", () => {
    assert.equal(diasEntre("2026-10-12", "2026-10-27"), 15);
    // Cambio de horario en el medio (no en Argentina, pero sí en otros países)
    assert.equal(diasEntre("2026-03-01", "2026-04-01"), 31);
    assert.equal(formatearFecha("2026-10-12", "2026-10-27"), "12/10");
    assert.equal(formatearFecha("2025-12-30", "2026-01-04"), "30/12/2025");
});

caso("resumen del cambio según la meta", () => {
    // 31/08 → 12/10 son 42 días: 6 semanas; 78,5 − 81 = −2,5
    assert.deepEqual(resumirCambio(pesos, "bajar"), { texto: "−2,5 kg en 6 semanas", aFavor: true });
    assert.equal(resumirCambio(pesos, "subir").aFavor, false);
    assert.equal(resumirCambio(pesos, "mantener").aFavor, false);
});

caso("resumen con pocos días, muchos meses, sin cambios y un solo peso", () => {
    assert.equal(resumirCambio([{ fecha: "2026-10-01", kg: 80 }, { fecha: "2026-10-06", kg: 80.4 }], "subir").texto, "+0,4 kg en 5 días");
    assert.equal(resumirCambio([{ fecha: "2026-01-01", kg: 90 }, { fecha: "2026-07-01", kg: 82.3 }], "bajar").texto, "−7,7 kg en 6 meses");
    assert.deepEqual(resumirCambio([{ fecha: "2026-10-01", kg: 80 }, { fecha: "2026-10-29", kg: 80 }], "mantener"), { texto: "Sin cambios en 4 semanas", aFavor: true });
    assert.equal(resumirCambio([pesos[0]], "bajar"), null);
});

caso("puntos del gráfico", () => {
    const puntos = puntosDelGrafico(pesos);
    // x según la fecha: el del medio cae justo a la mitad (21 de 42 días)
    assert.deepEqual(puntos.map(p => Math.round(p.x)), [4, 50, 96]);
    // El más pesado arriba (25) y el más liviano abajo (85)
    assert.deepEqual(puntos.map(p => Math.round(p.y)), [25, 51, 85]);
    // Todos iguales: línea al medio
    assert.deepEqual(puntosDelGrafico([{ fecha: "2026-10-01", kg: 80 }, { fecha: "2026-10-08", kg: 80 }]).map(p => p.y), [50, 50]);
});

console.log(fallas === 0 ? "\nTodo bien" : `\n${fallas} caso(s) con fallas`);
process.exit(fallas === 0 ? 0 : 1);
