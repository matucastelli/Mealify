export default function RecetaCard({ receta, esFavorito, onToggleFavorito, onVerReceta, onAgregarPlan }) {
    return (
        <div className="receta-card">
            <img src={receta.image} alt={receta.title} />
            <div className="receta-info">
                <p>{receta.title}</p>
                <p>"{receta.dishTypes?.length ? receta.dishTypes.join(", ") : "Sin categoría"}"</p>
            </div>
            <button className={`btn-favorito ${esFavorito ? "activo" : ""}`} onClick={() => onToggleFavorito(receta)}>★</button>
            <button className="btn-ver-receta" onClick={() => onVerReceta(receta.id)}>Ver receta</button>
            <button className="btn-agregar-plan" onClick={() => onAgregarPlan(receta.id)}>Agregar al plan</button>
        </div>
    );
}
