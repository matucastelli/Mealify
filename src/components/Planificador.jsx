import { useRef, useState } from "react";
import { DIAS, FRANJAS, describirFranja } from "../lib/constantes.js";
import { estadoDelDia, formatearNumero, macrosDelDia, promedioSemanal } from "../lib/macros.js";
import ImagenReceta from "./ImagenReceta.jsx";
import { NumeroAnimado } from "./BarrasMacros.jsx";

const NOMBRES_MACROS = [
    { clave: "proteinas", nombre: "Proteínas" },
    { clave: "grasas", nombre: "Grasas" },
    { clave: "carbohidratos", nombre: "Carbohidratos" },
];

// En escritorio las recetas se pueden arrastrar entre franjas; en cualquier pantalla
// (y con teclado) se usan los botones "Mover" y "+ Agregar".
// Con perfil, cada día y el promedio de la semana se comparan con el objetivo diario.
export default function Planificador({ oculto, plan, recetas, objetivo, onVerReceta, onEliminar, onSoltar, onAbrirMover, onAbrirAgregar, onIrAProgreso }) {
    const recetaArrastrada = useRef(null);
    const [franjaActiva, setFranjaActiva] = useState(null);
    const totalesPorDia = DIAS.map(dia => macrosDelDia(plan[dia.valor], recetas));

    function soltar(e, dia, franja) {
        e.preventDefault();
        setFranjaActiva(null);
        if (!recetaArrastrada.current) return;

        const contenedor = e.currentTarget.querySelector(".franja-recetas");
        const tarjetaDestino = e.target.closest(".receta-plan-card");
        const indiceDestino = tarjetaDestino && contenedor.contains(tarjetaDestino)
            ? Array.from(contenedor.children).indexOf(tarjetaDestino)
            : contenedor.children.length;

        const { id, diaOrigen, franjaOrigen } = recetaArrastrada.current;
        onSoltar(id, diaOrigen, franjaOrigen, dia, franja, indiceDestino);
        recetaArrastrada.current = null;
    }

    return (
        <section id="planificador" className={`seccion ${oculto ? "oculto" : ""}`} onDragOver={(e) => e.preventDefault()}>
            <div className="seccion-cabecera">
                <div>
                    <h2>Plan semanal</h2>
                    <p>Organizá desayuno, almuerzo y cena de cada día.</p>
                </div>
            </div>
            {/* key: al volver a la sección se monta de nuevo y los números cuentan otra vez */}
            <ResumenSemana key={oculto ? "oculto" : "visible"} totalesPorDia={totalesPorDia} objetivo={objetivo} onIrAProgreso={onIrAProgreso} />
            <div className="plan-dias">
                {DIAS.map((dia, i) => (
                    <div className="dia" key={dia.valor}>
                        <TotalesDia nombre={dia.nombre} totales={totalesPorDia[i]} objetivo={objetivo} />
                        {FRANJAS.map(franja => {
                            const claveFranja = `${dia.valor}|${franja.valor}`;
                            const ids = plan[dia.valor][franja.valor].filter(id => recetas.has(id));

                            return (
                                <div
                                    className={`franja ${franjaActiva === claveFranja ? "drag-activo" : ""}`}
                                    key={franja.valor}
                                    onDragEnter={(e) => { e.preventDefault(); setFranjaActiva(claveFranja); }}
                                    onDragLeave={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget)) {
                                            setFranjaActiva(activa => activa === claveFranja ? null : activa);
                                        }
                                    }}
                                    onDrop={(e) => soltar(e, dia.valor, franja.valor)}
                                >
                                    <p className="franja-titulo"><i className={`fa-solid ${franja.icono}`}></i> {franja.nombre}</p>
                                    <div className="franja-recetas">
                                        {ids.map((id, i) => (
                                            <RecetaPlanCard
                                                key={`${id}-${i}`}
                                                receta={recetas.get(id)}
                                                onDragStart={() => {
                                                    recetaArrastrada.current = { id, diaOrigen: dia.valor, franjaOrigen: franja.valor };
                                                }}
                                                onDragEnd={() => setFranjaActiva(null)}
                                                onVer={() => onVerReceta(id)}
                                                onMover={() => onAbrirMover(id, dia.valor, franja.valor)}
                                                onEliminar={() => onEliminar(id, dia.valor, franja.valor)}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        className="btn-agregar-franja"
                                        aria-label={`Agregar receta a ${describirFranja(dia.valor, franja.valor)}`}
                                        onClick={() => onAbrirAgregar(dia.valor, franja.valor)}
                                    >
                                        <i className="fa-solid fa-plus"></i> Agregar
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </section>
    );
}

function RecetaPlanCard({ receta, onDragStart, onDragEnd, onVer, onMover, onEliminar }) {
    const nombre = receta?.title ?? "receta no disponible";

    return (
        <div className="receta-plan-card" draggable="true" onDragStart={onDragStart} onDragEnd={onDragEnd}>
            {receta == null ? (
                <span className="receta-plan-ver">
                    <span className="receta-plan-titulo">Receta no disponible</span>
                </span>
            ) : (
                <button className="receta-plan-ver" onClick={onVer}>
                    <ImagenReceta src={receta.image} />
                    <span>
                        <span className="receta-plan-titulo">{receta.title}</span>
                        <span className="receta-detallada-categoria">
                            {receta.macros ? `${formatearNumero(receta.macros.calorias)} kcal` : "Sin datos"}
                        </span>
                    </span>
                </button>
            )}
            <div className="receta-plan-acciones">
                {receta != null && (
                    <button className="btn-plan-accion" aria-label={`Mover ${nombre}`} title="Mover" onClick={onMover}>
                        <i className="fa-solid fa-arrows-up-down-left-right"></i>
                    </button>
                )}
                <button className="btn-plan-accion btn-eliminar-plan" aria-label={`Quitar ${nombre} del plan`} title="Quitar del plan" onClick={onEliminar}>
                    ×
                </button>
            </div>
        </div>
    );
}

// Promedio por día de la semana: kcal grandes a la izquierda y una barra por macro contra el objetivo
function ResumenSemana({ totalesPorDia, objetivo, onIrAProgreso }) {
    const promedio = promedioSemanal(totalesPorDia);
    const sinDatos = totalesPorDia.reduce((suma, total) => suma + total.sinDatos, 0);
    const objetivoOBoton = objetivo == null
        ? <button className="btn-secundario" onClick={onIrAProgreso}>Calculá tu objetivo</button>
        : (
            <p className="resumen-objetivo">
                Objetivo: {formatearNumero(objetivo.calorias)} kcal
                <button className="btn-plan-accion" aria-label="Cambiar tu objetivo en Mi progreso" title="Cambiar objetivo" onClick={onIrAProgreso}>
                    <i className="fa-solid fa-pen"></i>
                </button>
            </p>
        );

    if (promedio == null) {
        return (
            <div className="resumen-semana resumen-semana-vacio">
                <p>Agregá recetas para ver cuánto comés por día{objetivo != null && " frente a tu objetivo"}.</p>
                {objetivoOBoton}
            </div>
        );
    }

    const estado = objetivo && estadoDelDia(promedio.calorias, objetivo.calorias, promedio.dias);
    const diferencia = objetivo && promedio.calorias - objetivo.calorias;

    return (
        <div className="resumen-semana">
            <div className="resumen-calorias">
                <p className="resumen-etiqueta">Promedio por día</p>
                <p className="resumen-kcal"><NumeroAnimado valor={promedio.calorias} /> kcal</p>
                {objetivoOBoton}
                {estado && (
                    <p className={`estado-kcal ${estado.estado}`}>
                        {diferencia === 0
                            ? "Justo en tu objetivo"
                            : `${formatearNumero(Math.abs(diferencia))} kcal por ${diferencia > 0 ? "encima" : "debajo"}`}
                    </p>
                )}
            </div>
            <div className="resumen-macros">
                {NOMBRES_MACROS.map(({ clave, nombre }) => (
                    <div key={clave} className="macro">
                        <div className="macro-texto">
                            <span>{nombre}</span>
                            <span>
                                <strong><NumeroAnimado valor={promedio[clave]} /></strong>
                                {objetivo != null && ` / ${formatearNumero(objetivo[clave])}`} g
                            </span>
                        </div>
                        {objetivo != null && (
                            <div className="macro-barra" aria-hidden="true">
                                <div style={{ width: `${Math.min(100, (promedio[clave] / objetivo[clave]) * 100)}%` }}></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <p className="resumen-nota">
                Promedio de {promedio.dias === 1 ? "1 día" : `${promedio.dias} días`} con recetas
                {sinDatos > 0 && ` · ${textoSinDatos(sinDatos)}`}
            </p>
        </div>
    );
}

// Nombre del día con sus kcal contra el objetivo, barra, estado (±10 %) y los tres macros
function TotalesDia({ nombre, totales, objetivo }) {
    const hayDatos = totales.conDatos > 0;
    const estado = objetivo && estadoDelDia(totales.calorias, objetivo.calorias, totales.conDatos);

    return (
        <>
            <div className="dia-cabecera">
                <h3>{nombre}</h3>
                {hayDatos && (
                    <p className="dia-kcal">
                        <strong>{formatearNumero(totales.calorias)}</strong>
                        {objetivo != null && ` / ${formatearNumero(objetivo.calorias)}`} kcal
                    </p>
                )}
            </div>
            {hayDatos && (
                <div className="dia-totales">
                    {estado && (
                        <>
                            <div className={`dia-barra ${estado.estado}`} aria-hidden="true">
                                <div style={{ width: `${Math.min(100, (totales.calorias / objetivo.calorias) * 100)}%` }}></div>
                            </div>
                            <p className={`estado-kcal ${estado.estado}`}>{textoEstado(estado)}</p>
                        </>
                    )}
                    {NOMBRES_MACROS.map(({ clave, nombre: nombreMacro }) => (
                        <p key={clave} className="dia-macro">
                            <span>{nombreMacro}</span>
                            <span>{formatearNumero(totales[clave])} g</span>
                        </p>
                    ))}
                </div>
            )}
            {totales.sinDatos > 0 && <p className="dia-sin-datos">{textoSinDatos(totales.sinDatos)}</p>}
        </>
    );
}

function textoEstado({ estado, diferencia }) {
    if (estado === "de-mas") return `${formatearNumero(diferencia)} kcal de más`;
    if (estado === "de-menos") return `Faltan ${formatearNumero(diferencia)} kcal`;
    return "En objetivo";
}

function textoSinDatos(cantidad) {
    return cantidad === 1 ? "1 receta sin datos" : `${cantidad} recetas sin datos`;
}
