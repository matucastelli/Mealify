import { useState } from "react";
import { getPlanSemanal, asignarReceta, eliminarReceta, moverReceta } from "../lib/storage.js";

export function usePlanSemanal() {
    const [plan, setPlan] = useState(getPlanSemanal);

    // Los IDs se guardan como string (igual que en la versión vanilla, que los leía de data-id)
    function asignar(idReceta, dia, franja) {
        const seAsigno = asignarReceta(String(idReceta), dia, franja);
        setPlan(getPlanSemanal());
        return seAsigno;
    }

    function eliminar(id, dia, franja) {
        eliminarReceta(id, dia, franja);
        setPlan(getPlanSemanal());
    }

    function mover(id, diaOrigen, franjaOrigen, diaDestino, franjaDestino, indiceDestino) {
        moverReceta(id, diaOrigen, franjaOrigen, diaDestino, franjaDestino, indiceDestino);
        setPlan(getPlanSemanal());
    }

    return { plan, asignar, eliminar, mover };
}
