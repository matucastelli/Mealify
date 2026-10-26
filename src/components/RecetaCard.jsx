import { traducirCategorias } from "../lib/traducciones.js";
import ImagenReceta from "./ImagenReceta.jsx";

export default function RecetaCard({ receta, esFavorito, cargandoDetalle, onToggleFavorito, onVerReceta, onAgregarPlan }) {
    return (
        <div className="receta-card">
            <ImagenReceta src={receta.image} alt={receta.title} />
            <div className="receta-info">
                <p>{receta.title}</p>
                <p>{traducirCategorias(receta.dishTypes)}</p>
            </div>
            <button className={`btn-favorito ${esFavorito ? "activo" : ""}`} onClick={() => onToggleFavorito(receta)}>★</button>
            <div className="receta-acciones">
                {/* Sin `disabled` mientras carga: un botón deshabilitado pierde el foco y el detalle
                    ya no tiene a dónde devolverlo al cerrarse. Tocarlo de nuevo solo repite el pedido */}
                <button
                    className="btn-ver-receta"
                    aria-busy={cargandoDetalle}
                    onClick={() => onVerReceta(receta.id)}
                >
                    {cargandoDetalle ? "Cargando…" : "Ver receta"}
                </button>
                <button className="btn-agregar-plan" onClick={() => onAgregarPlan(receta.id)}>Agregar al plan</button>
            </div>
        </div>
    );
}
