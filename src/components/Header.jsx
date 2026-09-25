import { useState } from "react";

const TABS = [
    { seccion: "buscar", texto: "Buscar" },
    { seccion: "favoritos", texto: "Favoritos" },
    { seccion: "planificador", texto: "Planificador" },
    { seccion: "compras", texto: "Lista de compras" },
];

export default function Header({ onCambiarSeccion, onClickMarca }) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const claseMenu = menuAbierto ? "" : "oculto";

    function cerrarMenu() {
        setMenuAbierto(false);
    }

    return (
        <header id="header-principal">
            <div className="marca" onClick={() => { cerrarMenu(); onClickMarca(); }}>
                <img src="/logo.png" alt="logo" id="logo" />
                <h1>Mealify</h1>
            </div>
            <button id="btnMenu" onClick={() => setMenuAbierto(abierto => !abierto)}>
                <span className="barra"></span>
                <span className="barra"></span>
                <span className="barra"></span>
            </button>

            <nav id="nav-principal" className={claseMenu}>
                <button id="btnCerrarTab" onClick={cerrarMenu}>×</button>
                {TABS.map(tab => (
                    <button key={tab.seccion} className="tab" onClick={() => onCambiarSeccion(tab.seccion)}>
                        {tab.texto}
                    </button>
                ))}
            </nav>
            <div id="menu-backdrop" className={claseMenu}></div>
        </header>
    );
}
