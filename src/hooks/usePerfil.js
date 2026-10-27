import { useRef, useState } from "react";
import { getPerfil, guardarPerfil, getPerfilOmitido, omitirPerfil, getPesos, guardarPesos } from "../lib/storage.js";
import { calcularObjetivo } from "../lib/macros.js";
import { agregarPeso, quitarPeso, fechaDeHoy } from "../lib/pesos.js";

// Los perfiles de antes del registro de peso no tienen pesos: su peso pasa a ser el de hoy
function pesosIniciales() {
    const pesos = getPesos();
    const perfil = getPerfil();
    if (pesos.length > 0 || perfil == null) return pesos;
    const migrados = agregarPeso([], fechaDeHoy(), perfil.peso);
    guardarPesos(migrados);
    return migrados;
}

export function usePerfil() {
    const [perfil, setPerfil] = useState(getPerfil);
    const [pesos, setPesos] = useState(pesosIniciales);
    const [omitido, setOmitido] = useState(getPerfilOmitido);
    // Lo último guardado, para las funciones que se llaman más tarde (el "Deshacer" de un aviso)
    const actual = useRef({ perfil, pesos });

    function actualizarPerfil(nuevoPerfil) {
        guardarPerfil(nuevoPerfil);
        setPerfil(nuevoPerfil);
        actual.current.perfil = nuevoPerfil;
    }

    function actualizarPesos(nuevosPesos, perfilBase) {
        guardarPesos(nuevosPesos);
        setPesos(nuevosPesos);
        actual.current.pesos = nuevosPesos;
        // El peso del perfil (y del objetivo) es siempre el más reciente
        const ultimo = nuevosPesos[nuevosPesos.length - 1].kg;
        if (ultimo !== perfilBase.peso) actualizarPerfil({ ...perfilBase, peso: ultimo });
        else if (perfilBase !== actual.current.perfil) actualizarPerfil(perfilBase);
    }

    // Recibe los campos que cambian; el reparto se conserva si no viene.
    // Un peso nuevo en "Tus datos" o en la bienvenida queda registrado con la fecha de hoy
    function guardar(cambios) {
        const { perfil, pesos } = actual.current;
        const nuevoPerfil = { reparto: null, ...perfil, ...cambios };
        if ("peso" in cambios && cambios.peso !== perfil?.peso) {
            actualizarPesos(agregarPeso(pesos, fechaDeHoy(), cambios.peso), nuevoPerfil);
        } else {
            actualizarPerfil(nuevoPerfil);
        }
    }

    function cargarPeso(fecha, kg) {
        actualizarPesos(agregarPeso(actual.current.pesos, fecha, kg), actual.current.perfil);
    }

    function borrarPeso(fecha) {
        actualizarPesos(quitarPeso(actual.current.pesos, fecha), actual.current.perfil);
    }

    function omitir() {
        omitirPerfil();
        setOmitido(true);
    }

    const objetivo = perfil == null ? null : calcularObjetivo(perfil);

    return { perfil, objetivo, pesos, omitido, guardar, cargarPeso, borrarPeso, omitir };
}
