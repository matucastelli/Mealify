import { useEffect, useRef, useState } from "react";

// Mismo tiempo que la animación de las barras (.macro-barra en style.css)
const DURACION_ANIMACION = 600;

// Una barra por macro con la parte de las calorías que aporta. Cada fila es
// { clave, nombre, gramos, kcal, detalle? }; `detalle` va al lado del nombre (texto o un campo)
export default function BarrasMacros({ filas }) {
    const kcalTotales = filas.reduce((suma, fila) => suma + fila.kcal, 0);

    return filas.map(({ clave, nombre, gramos, kcal, detalle }) => (
        <div key={clave} className="macro">
            {/* div y no p: en el editor del reparto el detalle es un campo con su error */}
            <div className="macro-texto">
                <div>{nombre}{detalle != null && <div className="macro-detalle">{detalle}</div>}</div>
                <span><NumeroAnimado valor={gramos} /> g</span>
            </div>
            <div className="macro-barra" aria-hidden="true">
                <div style={{ width: `${kcalTotales > 0 ? (kcal / kcalTotales) * 100 : 0}%` }}></div>
            </div>
        </div>
    ));
}

// Al aparecer cuenta desde 0 mientras crecen las barras; si el valor cambia, se desliza
// desde el anterior. Se anima siempre, aunque el sistema tenga "reducir movimiento":
// es corta y liviana (decisión del 2026-10-26)
export function NumeroAnimado({ valor }) {
    const [mostrado, setMostrado] = useState(0);
    const ultimoMostrado = useRef(0);

    useEffect(() => {
        const desde = ultimoMostrado.current;
        const inicio = performance.now();
        let cuadro;
        function avanzar(ahora) {
            const progreso = Math.min(1, (ahora - inicio) / DURACION_ANIMACION);
            // Arranca rápido y frena al final, como la curva de las barras
            const actual = Math.round(desde + (valor - desde) * (1 - (1 - progreso) ** 3));
            ultimoMostrado.current = actual;
            setMostrado(actual);
            if (progreso < 1) cuadro = requestAnimationFrame(avanzar);
        }
        cuadro = requestAnimationFrame(avanzar);
        return () => cancelAnimationFrame(cuadro);
    }, [valor]);

    return mostrado.toLocaleString("es-AR");
}
