import { useEffect, useRef, useState } from "react";

const TABS = [
    { seccion: "buscar", texto: "Buscar" },
    { seccion: "favoritos", texto: "Favoritos" },
    { seccion: "planificador", texto: "Planificador" },
    { seccion: "compras", texto: "Lista de compras" },
];

// Mismo corte que el CSS: por debajo de 768px el nav es un menú lateral
const CONSULTA_MOVIL = "(max-width: 767px)";

function useEsMovil() {
    const [esMovil, setEsMovil] = useState(() => window.matchMedia(CONSULTA_MOVIL).matches);
    useEffect(() => {
        const consulta = window.matchMedia(CONSULTA_MOVIL);
        const alCambiar = (e) => setEsMovil(e.matches);
        consulta.addEventListener("change", alCambiar);
        return () => consulta.removeEventListener("change", alCambiar);
    }, []);
    return esMovil;
}

export default function Header({ onCambiarSeccion, onClickMarca }) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const esMovil = useEsMovil();
    const btnMenu = useRef(null);
    const btnCerrar = useRef(null);
    const claseMenu = menuAbierto ? "" : "oculto";

    function cerrarMenu() {
        setMenuAbierto(false);
    }

    // Menú abierto: el foco entra al menú y Escape lo cierra. Al cerrarse, el foco vuelve a la hamburguesa.
    useEffect(() => {
        if (!menuAbierto) return;
        btnCerrar.current?.focus();
        const alPresionarTecla = (e) => { if (e.key === "Escape") cerrarMenu(); };
        document.addEventListener("keydown", alPresionarTecla);
        return () => {
            document.removeEventListener("keydown", alPresionarTecla);
            btnMenu.current?.focus();
        };
    }, [menuAbierto]);

    function elegirSeccion(seccion) {
        cerrarMenu();
        onCambiarSeccion(seccion);
    }

    return (
        <header id="header-principal">
            <h1 className="marca">
                <button className="btn-marca" aria-label="Mealify: volver al inicio" onClick={() => { cerrarMenu(); onClickMarca(); }}>
                    <img src="/logo.png" alt="" id="logo" />
                    <span>Mealify</span>
                </button>
            </h1>
            <button
                id="btnMenu"
                ref={btnMenu}
                aria-label="Abrir menú"
                aria-expanded={menuAbierto}
                aria-controls="nav-principal"
                onClick={() => setMenuAbierto(abierto => !abierto)}
            >
                <span className="barra"></span>
                <span className="barra"></span>
                <span className="barra"></span>
            </button>

            {/* En el celular, con el menú cerrado, inert saca los links del orden de foco */}
            <nav id="nav-principal" className={claseMenu} aria-label="Secciones" inert={esMovil && !menuAbierto}>
                <button id="btnCerrarTab" ref={btnCerrar} aria-label="Cerrar menú" onClick={cerrarMenu}>×</button>
                {TABS.map(tab => (
                    <button key={tab.seccion} className="tab" onClick={() => elegirSeccion(tab.seccion)}>
                        {tab.texto}
                    </button>
                ))}
            </nav>
            <div id="menu-backdrop" className={claseMenu} onClick={cerrarMenu}></div>
        </header>
    );
}
