import { useRef, useState } from "react";
import { DIAS, FRANJAS } from "../lib/constantes.js";

export default function Planificador({ oculto, plan, recetas, onVerReceta, onEliminar, onMover }) {
    const recetaArrastrada = useRef(null);
    const [franjaActiva, setFranjaActiva] = useState(null);

    function soltar(e, dia, franja) {
        e.preventDefault();
        setFranjaActiva(null);
        if (!recetaArrastrada.current) return;

        const tarjetaDestino = e.target.closest(".receta-plan-card");
        const indiceDestino = tarjetaDestino
            ? Array.from(e.currentTarget.children).indexOf(tarjetaDestino)
            : e.currentTarget.children.length;

        const { id, diaOrigen, franjaOrigen } = recetaArrastrada.current;
        onMover(id, diaOrigen, franjaOrigen, dia, franja, indiceDestino);
        recetaArrastrada.current = null;
    }

    return (
        <section id="planificador" className={`seccion ${oculto ? "oculto" : ""}`} onDragOver={(e) => e.preventDefault()}>
            {DIAS.map(dia => (
                <div className="dia" key={dia.valor}>
                    <h3>{dia.nombre}</h3>
                    {FRANJAS.map(franja => {
                        const claveFranja = `${dia.valor}|${franja.valor}`;
                        const ids = plan[dia.valor][franja.valor].filter(id => recetas.has(id));

                        return (
                            <div className="franja" key={franja.valor}>
                                <p className="franja-titulo"><i className={`fa-solid ${franja.icono}`}></i> {franja.nombre}</p>
                                <div
                                    className={`franja-recetas ${franjaActiva === claveFranja ? "drag-activo" : ""}`}
                                    onDragEnter={(e) => { e.preventDefault(); setFranjaActiva(claveFranja); }}
                                    onDragLeave={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget)) {
                                            setFranjaActiva(activa => activa === claveFranja ? null : activa);
                                        }
                                    }}
                                    onDrop={(e) => soltar(e, dia.valor, franja.valor)}
                                >
                                    {ids.map((id, i) => (
                                        <RecetaPlanCard
                                            key={`${id}-${i}`}
                                            receta={recetas.get(id)}
                                            onDragStart={() => {
                                                recetaArrastrada.current = { id, diaOrigen: dia.valor, franjaOrigen: franja.valor };
                                            }}
                                            onDragEnd={() => setFranjaActiva(null)}
                                            onVer={() => onVerReceta(id)}
                                            onEliminar={() => onEliminar(id, dia.valor, franja.valor)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </section>
    );
}

function RecetaPlanCard({ receta, onDragStart, onDragEnd, onVer, onEliminar }) {
    return (
        <div className="receta-plan-card" draggable="true" onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onVer}>
            {receta == null ? (
                <div>
                    <p>Receta no disponible</p>
                </div>
            ) : (
                <>
                    <img src={receta.image} alt={receta.title} />
                    <div>
                        <p>{receta.title}</p>
                        <span className="receta-detallada-categoria">
                            {receta.cuisines?.length ? receta.cuisines.join(", ") : "Sin categoría"}
                        </span>
                    </div>
                </>
            )}
            <button
                className="btn-eliminar-plan"
                onClick={(e) => { e.stopPropagation(); onEliminar(); }}
            >×</button>
        </div>
    );
}
