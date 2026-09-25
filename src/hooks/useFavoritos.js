import { useState } from "react";
import { getFavoritos, toggleFavorito } from "../lib/storage.js";

export function useFavoritos() {
    const [favoritos, setFavoritos] = useState(getFavoritos);

    function alternarFavorito(receta) {
        toggleFavorito(receta);
        setFavoritos(getFavoritos());
    }

    return { favoritos, alternarFavorito };
}
