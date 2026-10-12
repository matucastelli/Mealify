export default function RecetaCard({ receta, esFavorito, cargandoDetalle, onToggleFavorito, onVerReceta, onAgregarPlan }) {
    return (
        <div className="receta-card">
            <img src={receta.image} alt={receta.title} />
            <div className="receta-info">
                <p>{receta.title}</p>
                <p>"{receta.dishTypes?.length ? receta.dishTypes.join(", ") : "Sin categoría"}"</p>
            </div>
            <button className={`btn-favorito ${esFavorito ? "activo" : ""}`} onClick={() => onToggleFavorito(receta)}>★</button>
            <div className="receta-acciones">
                <button
                    className="btn-ver-receta"
                    disabled={cargandoDetalle}
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
