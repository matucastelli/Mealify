import { useState } from "react";
import { getPerfil, guardarPerfil, getPerfilOmitido, omitirPerfil } from "../lib/storage.js";
import { calcularObjetivo } from "../lib/macros.js";

export function usePerfil() {
    const [perfil, setPerfil] = useState(getPerfil);
    const [omitido, setOmitido] = useState(getPerfilOmitido);

    // Recibe los campos que cambian; el reparto se conserva si no viene
    function guardar(cambios) {
        const nuevoPerfil = { reparto: null, ...perfil, ...cambios };
        guardarPerfil(nuevoPerfil);
        setPerfil(nuevoPerfil);
    }

    function omitir() {
        omitirPerfil();
        setOmitido(true);
    }

    const objetivo = perfil == null ? null : calcularObjetivo(perfil);

    return { perfil, objetivo, omitido, guardar, omitir };
}
