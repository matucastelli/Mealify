// Cálculos del objetivo diario (funciones puras, sin React ni storage).
// El objetivo es una estimación: Mifflin-St Jeor × actividad × meta.

export const ACTIVIDADES = [
    { valor: "sedentaria", nombre: "Sedentaria", descripcion: "Poco o nada de ejercicio", factor: 1.2 },
    { valor: "ligera", nombre: "Ligera", descripcion: "Ejercicio 1 a 3 días por semana", factor: 1.375 },
    { valor: "moderada", nombre: "Moderada", descripcion: "Ejercicio 3 a 5 días por semana", factor: 1.55 },
    { valor: "intensa", nombre: "Intensa", descripcion: "Ejercicio 6 o 7 días por semana", factor: 1.725 },
    { valor: "muy-intensa", nombre: "Muy intensa", descripcion: "Entrenamiento fuerte a diario o trabajo físico", factor: 1.9 },
];

export const METAS = [
    { valor: "bajar", nombre: "Bajar", factor: 0.8 },
    { valor: "mantener", nombre: "Mantener", factor: 1 },
    { valor: "subir", nombre: "Subir", factor: 1.1 },
];

export const SEXOS = [
    { valor: "hombre", nombre: "Hombre" },
    { valor: "mujer", nombre: "Mujer" },
];

// El objetivo nunca baja de esto, aunque la cuenta dé menos
const MINIMO_KCAL = { hombre: 1500, mujer: 1200 };

export const REPARTO_RECOMENDADO = { proteinaPorKg: 1.8, grasasPct: 25 };

// Rangos válidos del formulario; `decimales` es cuántos acepta cada campo
export const RANGOS = {
    edad: { min: 15, max: 100, decimales: 0, unidad: "años" },
    altura: { min: 120, max: 230, decimales: 0, unidad: "cm" },
    peso: { min: 30, max: 300, decimales: 1, unidad: "kg" },
    proteinaPorKg: { min: 0.8, max: 3, decimales: 1, unidad: "g por kg" },
    grasasPct: { min: 15, max: 45, decimales: 0, unidad: "%" },
};

const KCAL_POR_GRAMO = { proteinas: 4, grasas: 9, carbohidratos: 4 };

function redondearADecena(valor) {
    return Math.round(valor / 10) * 10;
}

// Calorías para mantener el peso: Mifflin-St Jeor × factor de actividad
export function caloriasMantenimiento({ sexo, edad, altura, peso, actividad }) {
    const basal = 10 * peso + 6.25 * altura - 5 * edad + (sexo === "hombre" ? 5 : -161);
    return basal * ACTIVIDADES.find(a => a.valor === actividad).factor;
}

// Objetivo diario completo a partir del perfil guardado
export function calcularObjetivo(perfil) {
    const mantenimiento = redondearADecena(caloriasMantenimiento(perfil));
    const meta = METAS.find(m => m.valor === perfil.meta);
    const calculadas = redondearADecena(caloriasMantenimiento(perfil) * meta.factor);
    const minimo = MINIMO_KCAL[perfil.sexo];
    const calorias = Math.max(calculadas, minimo);

    const reparto = perfil.reparto ?? REPARTO_RECOMENDADO;
    const proteinas = Math.round(reparto.proteinaPorKg * perfil.peso);
    const kcalGrasas = calorias * reparto.grasasPct / 100;
    const grasas = Math.round(kcalGrasas / KCAL_POR_GRAMO.grasas);
    const kcalCarbohidratos = calorias - proteinas * KCAL_POR_GRAMO.proteinas - kcalGrasas;
    const carbohidratos = Math.max(0, Math.round(kcalCarbohidratos / KCAL_POR_GRAMO.carbohidratos));

    return {
        calorias,
        mantenimiento,
        factorMeta: meta.factor,
        minimoAplicado: calculadas < minimo,
        reparto,
        esRecomendado: perfil.reparto == null,
        proteinas,
        grasas,
        carbohidratos,
    };
}

// Las tres filas de macros con las kcal que aporta cada una (para las barras)
export function filasMacros({ proteinas, grasas, carbohidratos }) {
    return [
        { clave: "proteinas", nombre: "Proteínas", gramos: proteinas, kcal: proteinas * KCAL_POR_GRAMO.proteinas },
        { clave: "grasas", nombre: "Grasas", gramos: grasas, kcal: grasas * KCAL_POR_GRAMO.grasas },
        { clave: "carbohidratos", nombre: "Carbohidratos", gramos: carbohidratos, kcal: carbohidratos * KCAL_POR_GRAMO.carbohidratos },
    ];
}

// Margen de ±10 % sobre el objetivo de kcal. Un día sin recetas no se marca (null)
export function estadoDelDia(consumidas, objetivo, cantidadRecetas) {
    if (cantidadRecetas === 0) return null;
    const diferencia = consumidas - objetivo;
    if (diferencia > objetivo * 0.1) return { estado: "de-mas", diferencia };
    if (diferencia < -objetivo * 0.1) return { estado: "de-menos", diferencia: -diferencia };
    return { estado: "en-objetivo", diferencia: Math.abs(diferencia) };
}

const MACROS = ["calorias", "proteinas", "grasas", "carbohidratos"];

// Suma los macros de un día (todas las franjas). `recetas` es el Map de useRecetasDetalle:
// las que todavía cargan no cuentan, y las que no tienen macros (o fallaron) van a `sinDatos`
export function macrosDelDia(dia, recetas) {
    const total = { calorias: 0, proteinas: 0, grasas: 0, carbohidratos: 0, conDatos: 0, sinDatos: 0 };
    Object.values(dia).flat().forEach(id => {
        if (!recetas.has(id)) return;
        const macros = recetas.get(id)?.macros;
        if (macros == null) {
            total.sinDatos++;
            return;
        }
        total.conDatos++;
        MACROS.forEach(macro => total[macro] += macros[macro]);
    });
    return total;
}

// Promedio por día de la semana, solo sobre los días con recetas con datos
// (si no, una semana a medio armar daría un promedio engañosamente bajo). null si no hay ninguno
export function promedioSemanal(totalesPorDia) {
    const dias = totalesPorDia.filter(total => total.conDatos > 0);
    if (dias.length === 0) return null;
    const promedio = { dias: dias.length };
    MACROS.forEach(macro => {
        promedio[macro] = Math.round(dias.reduce((suma, total) => suma + total[macro], 0) / dias.length);
    });
    return promedio;
}

// Valida los campos que vengan en `datos` (texto o número) y devuelve
// { valores, errores }: valores ya convertidos a número y errores por campo
export function validarPerfil(datos) {
    const valores = {};
    const errores = {};

    for (const campo of ["sexo", "actividad", "meta"]) {
        if (!(campo in datos)) continue;
        if (!datos[campo]) errores[campo] = "Elegí una opción.";
        else valores[campo] = datos[campo];
    }

    for (const [campo, rango] of Object.entries(RANGOS)) {
        if (!(campo in datos)) continue;
        const texto = String(datos[campo]).trim().replace(",", ".");
        const numero = Number(texto);
        if (texto === "" || Number.isNaN(numero)) {
            errores[campo] = "Completá este dato.";
        } else if (numero < rango.min || numero > rango.max) {
            errores[campo] = `Tiene que estar entre ${formatearNumero(rango.min)} y ${formatearNumero(rango.max)} ${rango.unidad}.`;
        } else {
            const factor = 10 ** rango.decimales;
            valores[campo] = Math.round(numero * factor) / factor;
        }
    }

    return { valores, errores };
}

// "1,8", "2.190": números con el formato de Argentina
export function formatearNumero(numero) {
    return numero.toLocaleString("es-AR");
}

export function nombreDe(lista, valor) {
    return lista.find(item => item.valor === valor)?.nombre ?? "";
}
