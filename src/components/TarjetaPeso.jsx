import { useRef, useState } from "react";
import ModalPeso from "./ModalPeso.jsx";
import { formatearNumero } from "../lib/macros.js";
import { DIAS_PARA_RECORDAR, diasEntre, fechaDeHoy, formatearFecha, puntosDelGrafico, resumirCambio } from "../lib/pesos.js";

// Tarjeta "Peso" de Mi progreso: el último peso grande, el cambio, el gráfico y la lista plegada
export default function TarjetaPeso({ perfil, pesos, onCargarPeso, onBorrarPeso, onAviso }) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const botonCargar = useRef(null);
    const registros = useRef(null);

    if (perfil == null || pesos.length === 0) {
        return (
            <div className="tarjeta-progreso tarjeta-peso">
                <h3>Peso</h3>
                <p className="objetivo-vacio">Completá tus datos para registrar tu peso.</p>
                <button type="button" className="btn-link" onClick={irATusDatos}>Ir a Tus datos</button>
            </div>
        );
    }

    const ultimo = pesos[pesos.length - 1];
    const diasSinCargar = diasEntre(ultimo.fecha, fechaDeHoy());
    const cambio = resumirCambio(pesos, perfil.meta);
    const hayGrafico = pesos.length >= 2;

    function guardar(fecha, kg) {
        onCargarPeso(fecha, kg);
        setModalAbierto(false);
        onAviso({ texto: `Guardamos tu peso del ${formatearFecha(fecha)}` });
    }

    function borrar(peso) {
        onBorrarPeso(peso.fecha);
        onAviso({
            texto: `Borramos el peso del ${formatearFecha(peso.fecha)}`,
            accion: { texto: "Deshacer", onClick: () => onCargarPeso(peso.fecha, peso.kg) },
        });
        // El botón borrado desaparece: el foco vuelve a la lista o, si ya no está, a "+ Cargar peso"
        requestAnimationFrame(() => (registros.current?.querySelector("summary") ?? botonCargar.current)?.focus());
    }

    return (
        <div className="tarjeta-progreso tarjeta-peso">
            <h3>Peso</h3>
            {diasSinCargar > DIAS_PARA_RECORDAR && (
                <p className="peso-recordatorio">
                    Hace {diasSinCargar} días que no cargás tu peso.{" "}
                    <button type="button" className="btn-link" onClick={() => setModalAbierto(true)}>Cargalo ahora</button>
                </p>
            )}
            <div className={`peso-cuerpo ${hayGrafico ? "" : "sin-grafico"}`}>
                <div className="peso-actual">
                    <p className="peso-numero">{formatearNumero(ultimo.kg)} kg</p>
                    <p className="peso-fecha">
                        el {formatearFecha(ultimo.fecha)}
                        {!hayGrafico && " · cargá otro más adelante para ver cómo cambia"}
                    </p>
                    {cambio && <p className={`peso-cambio ${cambio.aFavor ? "a-favor" : ""}`}>{cambio.texto}</p>}
                    <button ref={botonCargar} type="button" className="btn-principal" onClick={() => setModalAbierto(true)}>+ Cargar peso</button>
                </div>
                {hayGrafico && <GraficoPeso pesos={pesos} />}
            </div>
            {hayGrafico && (
                <details ref={registros} className="peso-registros">
                    <summary>Ver y borrar registros ({pesos.length})</summary>
                    <ul>
                        {[...pesos].reverse().map(peso => (
                            <li key={peso.fecha}>
                                <span>{formatearFecha(peso.fecha)}</span>
                                <span>{formatearNumero(peso.kg)} kg</span>
                                <button type="button" className="btn-borrar-peso" aria-label={`Borrar el peso del ${formatearFecha(peso.fecha)}`} onClick={() => borrar(peso)}>
                                    <i className="fa-solid fa-trash-can" aria-hidden="true"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
            <ModalPeso abierto={modalAbierto} pesoInicial={ultimo.kg} onGuardar={guardar} onCerrar={() => setModalAbierto(false)} />
        </div>
    );
}

// Línea en SVG estirada a lo ancho; los puntos y los números van en HTML para que no se deformen
function GraficoPeso({ pesos }) {
    const puntos = puntosDelGrafico(pesos);
    const primero = puntos[0];
    const ultimo = puntos[puntos.length - 1];
    const descripcion = `Peso del ${formatearFecha(primero.fecha)} al ${formatearFecha(ultimo.fecha)}: de ${formatearNumero(primero.kg)} a ${formatearNumero(ultimo.kg)} kg`;
    const posicion = punto => ({ left: `${punto.x}%`, top: `${punto.y}%` });

    return (
        <div className="peso-grafico" role="img" aria-label={descripcion}>
            <div className="peso-grafico-area">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points={puntos.map(p => `${p.x},${p.y}`).join(" ")} vectorEffect="non-scaling-stroke" />
                </svg>
                {puntos.map((punto, i) => (
                    <span key={punto.fecha} className={`peso-punto ${i === puntos.length - 1 ? "ultimo" : ""}`} style={posicion(punto)}></span>
                ))}
                <span className="peso-etiqueta primera" style={posicion(primero)}>{formatearNumero(primero.kg)} kg</span>
                <span className="peso-etiqueta ultima" style={posicion(ultimo)}>{formatearNumero(ultimo.kg)} kg</span>
            </div>
            <div className="peso-grafico-fechas" aria-hidden="true">
                <span>{formatearFecha(primero.fecha)}</span>
                <span>{formatearFecha(ultimo.fecha)}</span>
            </div>
        </div>
    );
}

// Lleva al primer campo de "Tus datos", en la misma sección
function irATusDatos() {
    document.querySelector("#form-datos input")?.focus();
}
