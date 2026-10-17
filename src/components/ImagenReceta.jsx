import { useState } from "react";

// Foto de una receta. Si no tiene o no carga, muestra un recuadro con un ícono de cubiertos
// del mismo tamaño (las reglas de style.css que apuntan a la imagen también apuntan a .imagen-reemplazo).
export default function ImagenReceta({ src, alt = "" }) {
    // Se guarda qué src falló: si cambia la receta, se vuelve a intentar con la foto nueva
    const [srcFallido, setSrcFallido] = useState(null);

    if (!src || srcFallido === src) {
        return (
            <div className="imagen-reemplazo" role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
                <i className="fa-solid fa-utensils"></i>
            </div>
        );
    }
    return <img src={src} alt={alt} onError={() => setSrcFallido(src)} />;
}
