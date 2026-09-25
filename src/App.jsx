import { useState } from "react";
import { buscarRecetas, obtenerDetalleReceta, obtenerRecetasRandom } from "./lib/api.js";
import { armarListaCompras, idsDelPlan } from "./lib/listaCompras.js";
import { useFavoritos } from "./hooks/useFavoritos.js";
import { usePlanSemanal } from "./hooks/usePlanSemanal.js";
import { useCompras } from "./hooks/useCompras.js";
import { useRecetasDetalle } from "./hooks/useRecetasDetalle.js";
import Landing from "./components/Landing.jsx";
import Header from "./components/Header.jsx";
import Buscar from "./components/Buscar.jsx";
import Favoritos from "./components/Favoritos.jsx";
import Planificador from "./components/Planificador.jsx";
import ListaCompras from "./components/ListaCompras.jsx";
import ModalReceta from "./components/ModalReceta.jsx";
import ModalAsignar from "./components/ModalAsignar.jsx";

async function cargarRecetasIniciales() {
    const claveCache = "recetasIniciales";
    const recetasGuardadas = sessionStorage.getItem(claveCache);
    if (recetasGuardadas != null) {
        return JSON.parse(recetasGuardadas);
    }
    const recetasRandoms = await obtenerRecetasRandom(4);
    sessionStorage.setItem(claveCache, JSON.stringify(recetasRandoms));
    return recetasRandoms;
}

// Se piden apenas carga la página, mientras el usuario todavía está en la landing
const promesaRecetasIniciales = cargarRecetasIniciales();

export default function App() {
    const [mostrarApp, setMostrarApp] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState("buscar");

    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [recetas, setRecetas] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(true);

    const [recetaDetalle, setRecetaDetalle] = useState(null);
    const [modalRecetaAbierto, setModalRecetaAbierto] = useState(false);
    const [recetaParaAsignar, setRecetaParaAsignar] = useState(null);

    const { favoritos, alternarFavorito } = useFavoritos();
    const { plan, asignar, eliminar, mover } = usePlanSemanal();
    const { marcadas, ocultas, alternarCompra, limpiarMarcadas } = useCompras();

    const idsPlan = idsDelPlan(plan);
    const { recetas: recetasPlan, cargando: cargandoPlan } = useRecetasDetalle(idsPlan);
    const ingredientes = armarListaCompras(idsPlan.map(id => recetasPlan.get(id)), ocultas);

    async function mostrarRecetasIniciales() {
        setRecetas(await promesaRecetasIniciales);
    }

    async function buscar(termino) {
        setMostrarSugerencias(false);
        setRecetas(await buscarRecetas(termino));
    }

    async function abrirDetalleReceta(id) {
        const receta = await obtenerDetalleReceta(id);
        if (!receta) return;
        setRecetaDetalle(receta);
        setModalRecetaAbierto(true);
    }

    function confirmarAsignacion(dia, franja) {
        if (!asignar(recetaParaAsignar, dia, franja)) {
            alert("Esa receta ya está asignada a este día y comida.");
            return;
        }
        setRecetaParaAsignar(null);
    }

    function empezar() {
        setMostrarApp(true);
        setSeccionActiva("buscar");
        mostrarRecetasIniciales();
    }

    function volverAlInicio() {
        setTextoBusqueda("");
        setMostrarSugerencias(true);
        setSeccionActiva("buscar");
        mostrarRecetasIniciales();
    }

    const accionesReceta = {
        onToggleFavorito: alternarFavorito,
        onVerReceta: abrirDetalleReceta,
        onAgregarPlan: setRecetaParaAsignar,
    };

    return (
        <>
            <Landing oculto={mostrarApp} onEmpezar={empezar} />

            <div id="app" className={mostrarApp ? "" : "oculto"}>
                <Header onCambiarSeccion={setSeccionActiva} onClickMarca={volverAlInicio} />
                <Buscar
                    oculto={seccionActiva !== "buscar"}
                    texto={textoBusqueda}
                    onCambiarTexto={setTextoBusqueda}
                    onBuscar={buscar}
                    mostrarSugerencias={mostrarSugerencias}
                    recetas={recetas}
                    favoritos={favoritos}
                    accionesReceta={accionesReceta}
                />
                <Favoritos
                    oculto={seccionActiva !== "favoritos"}
                    favoritos={favoritos}
                    accionesReceta={accionesReceta}
                    onIrABuscar={() => setSeccionActiva("buscar")}
                />
                <Planificador
                    oculto={seccionActiva !== "planificador"}
                    plan={plan}
                    recetas={recetasPlan}
                    onVerReceta={abrirDetalleReceta}
                    onEliminar={eliminar}
                    onMover={mover}
                />
                <ListaCompras
                    oculto={seccionActiva !== "compras"}
                    ingredientes={ingredientes}
                    cargando={cargandoPlan}
                    marcadas={marcadas}
                    onToggleCompra={alternarCompra}
                    onLimpiar={limpiarMarcadas}
                />
            </div>

            <ModalReceta abierto={modalRecetaAbierto} receta={recetaDetalle} onCerrar={() => setModalRecetaAbierto(false)} />
            <ModalAsignar
                abierto={recetaParaAsignar != null}
                onConfirmar={confirmarAsignacion}
                onCerrar={() => setRecetaParaAsignar(null)}
            />
        </>
    );
}
