import { useRef, useState } from "react";
import { DIAS, FRANJAS, describirFranja } from "../lib/constantes.js";
import { traducirCategorias } from "../lib/traducciones.js";

// En escritorio las recetas se pueden arrastrar entre franjas; en cualquier pantalla
// (y con teclado) se usan los botones "Mover" y "+ Agregar".
export default function Planificador({ oculto, plan, recetas, onVerReceta, onEliminar, onSoltar, onAbrirMover, onAbrirAgregar }) {
    const recetaArrastrada = useRef(null);
    const [franjaActiva, setFranjaActiva] = useState(null);

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
            <div className="plan-dias">
                {DIAS.map(dia => (
                    <div className="dia" key={dia.valor}>
                        <h3>{dia.nombre}</h3>
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
                    <img src={receta.image} alt="" />
                    <span>
                        <span className="receta-plan-titulo">{receta.title}</span>
                        <span className="receta-detallada-categoria">
                            {traducirCategorias(receta.cuisines)}
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
