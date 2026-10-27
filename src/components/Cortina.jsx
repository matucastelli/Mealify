// Panel naranja que barre la pantalla al pasar de la portada a la app: entra desde la
// izquierda ("cubriendo"), y cuando tapa todo se cambia lo de abajo y sale por la derecha
// ("descubriendo"). Avisa al terminar cada fase. Es decorativa: no recibe foco ni se lee.
export default function Cortina({ fase, onTerminarFase }) {
    if (fase == null) return null;
    return (
        <div
            className={`cortina cortina-${fase}`}
            aria-hidden="true"
            onAnimationEnd={e => { if (e.target === e.currentTarget) onTerminarFase(fase); }}
        ></div>
    );
}
