// Compara src/lib/macros.js con cuentas hechas a mano. Uso: node scripts/probar-macros.mjs
import assert from "node:assert/strict";
import { calcularObjetivo, estadoDelDia, macrosDelDia, promedioSemanal, validarPerfil } from "../src/lib/macros.js";

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

const ejemplo = { sexo: "hombre", edad: 30, altura: 178, peso: 80, actividad: "moderada", meta: "bajar", reparto: null };

caso("hombre de ejemplo, bajar", () => {
    // Basal 10·80 + 6,25·178 − 5·30 + 5 = 1.767,5; × 1,55 = 2.739,6 → 2.740; × 0,8 = 2.191,7 → 2.190
    // Proteínas 1,8 · 80 = 144 g; grasas 25 % de 2.190 = 547,5 kcal → 61 g; carbohidratos (2.190 − 576 − 547,5) / 4 = 266,6 → 267 g
    const objetivo = calcularObjetivo(ejemplo);
    assert.deepEqual(
        { calorias: objetivo.calorias, mantenimiento: objetivo.mantenimiento, minimo: objetivo.minimoAplicado, p: objetivo.proteinas, g: objetivo.grasas, c: objetivo.carbohidratos, recomendado: objetivo.esRecomendado },
        { calorias: 2190, mantenimiento: 2740, minimo: false, p: 144, g: 61, c: 267, recomendado: true },
    );
});

caso("hombre de ejemplo, subir", () => {
    // 2.739,6 × 1,1 = 3.013,6 → 3.010
    assert.equal(calcularObjetivo({ ...ejemplo, meta: "subir" }).calorias, 3010);
});

caso("mujer que cae en el mínimo de 1.200 kcal", () => {
    // Basal 10·45 + 6,25·150 − 5·60 − 161 = 926,5; × 1,2 = 1.111,8; × 0,8 = 889,4 → 890 < 1.200
    // Proteínas 81 g; grasas 300 kcal → 33 g; carbohidratos (1.200 − 324 − 300) / 4 = 144 g
    const objetivo = calcularObjetivo({ sexo: "mujer", edad: 60, altura: 150, peso: 45, actividad: "sedentaria", meta: "bajar", reparto: null });
    assert.deepEqual(
        { calorias: objetivo.calorias, minimo: objetivo.minimoAplicado, p: objetivo.proteinas, g: objetivo.grasas, c: objetivo.carbohidratos },
        { calorias: 1200, minimo: true, p: 81, g: 33, c: 144 },
    );
});

caso("reparto propio (2,2 g/kg y 30 %)", () => {
    // Proteínas 176 g; grasas 657 kcal → 73 g; carbohidratos (2.190 − 704 − 657) / 4 = 207,3 → 207 g
    const objetivo = calcularObjetivo({ ...ejemplo, reparto: { proteinaPorKg: 2.2, grasasPct: 30 } });
    assert.deepEqual(
        { p: objetivo.proteinas, g: objetivo.grasas, c: objetivo.carbohidratos, recomendado: objetivo.esRecomendado },
        { p: 176, g: 73, c: 207, recomendado: false },
    );
});

caso("estados del día con objetivo de 2.190 kcal", () => {
    assert.deepEqual(estadoDelDia(2300, 2190, 3), { estado: "en-objetivo", diferencia: 110 });
    assert.deepEqual(estadoDelDia(2500, 2190, 3), { estado: "de-mas", diferencia: 310 });
    assert.deepEqual(estadoDelDia(1900, 2190, 2), { estado: "de-menos", diferencia: 290 });
    assert.equal(estadoDelDia(0, 2190, 0), null);
});

caso("validación del formulario", () => {
    const { valores, errores } = validarPerfil({ sexo: "", edad: "14", altura: "", peso: "80,55", actividad: "moderada" });
    assert.deepEqual(valores, { actividad: "moderada", peso: 80.6 });
    assert.deepEqual(Object.keys(errores).sort(), ["altura", "edad", "sexo"]);
    assert.equal(errores.edad, "Tiene que estar entre 15 y 100 años.");
});

const recetas = new Map([
    ["1", { macros: { calorias: 726, proteinas: 57, grasas: 43, carbohidratos: 24 } }],
    ["2", { macros: { calorias: 543, proteinas: 17, grasas: 16, carbohidratos: 84 } }],
    ["3", { title: "Sin nutrición", macros: null }],
    ["4", null],
]);

caso("macros de un día", () => {
    // "1" dos veces (almuerzo y cena) + "2": 726·2 + 543 = 1.995 kcal; P 131, G 102, C 132.
    // "3" no tiene macros y "4" falló: sin datos. "5" todavía carga: no cuenta
    const dia = { desayuno: ["2", "3"], almuerzo: ["1", "4"], cena: ["1", "5"] };
    assert.deepEqual(macrosDelDia(dia, recetas), { calorias: 1995, proteinas: 131, grasas: 102, carbohidratos: 132, conDatos: 3, sinDatos: 2 });
    assert.deepEqual(macrosDelDia({ desayuno: [], almuerzo: [], cena: [] }, recetas), { calorias: 0, proteinas: 0, grasas: 0, carbohidratos: 0, conDatos: 0, sinDatos: 0 });
});

caso("promedio semanal solo con los días que tienen datos", () => {
    // (1.995 + 543) / 2 = 1.269; P (131 + 17) / 2 = 74; G (102 + 16) / 2 = 59; C (132 + 84) / 2 = 108.
    // El día vacío y el que solo tiene recetas sin datos no cuentan
    const dias = [
        { calorias: 1995, proteinas: 131, grasas: 102, carbohidratos: 132, conDatos: 3, sinDatos: 0 },
        { calorias: 543, proteinas: 17, grasas: 16, carbohidratos: 84, conDatos: 1, sinDatos: 0 },
        { calorias: 0, proteinas: 0, grasas: 0, carbohidratos: 0, conDatos: 0, sinDatos: 0 },
        { calorias: 0, proteinas: 0, grasas: 0, carbohidratos: 0, conDatos: 0, sinDatos: 1 },
    ];
    assert.deepEqual(promedioSemanal(dias), { dias: 2, calorias: 1269, proteinas: 74, grasas: 59, carbohidratos: 108 });
    assert.equal(promedioSemanal(dias.slice(2)), null);
});

console.log(fallas === 0 ? "\nTodo bien" : `\n${fallas} caso(s) con fallas`);
process.exit(fallas === 0 ? 0 : 1);
