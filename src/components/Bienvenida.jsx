import { useEffect, useRef, useState } from "react";
import Modal from "./Modal.jsx";
import CampoPerfil, { valoresIniciales } from "./CamposPerfil.jsx";
import BarrasMacros, { NumeroAnimado } from "./BarrasMacros.jsx";
import { filasMacros, validarPerfil } from "../lib/macros.js";

const PASOS = [
    { titulo: "Contanos sobre vos", campos: ["sexo", "edad"] },
    { titulo: "Tu altura y tu peso", campos: ["altura", "peso"] },
    { titulo: "Tu actividad y tu meta", campos: ["actividad", "meta"] },
];

// Primera vez en la app: pide los datos del perfil en tres pasos que se deslizan de costado
// y termina mostrando el objetivo calculado. "Ahora no" (o cerrar antes de terminar) la
// saltea y no se vuelve a ofrecer; los datos se pueden cargar después en Mi progreso
export default function Bienvenida({ abierta, objetivo, onGuardar, onOmitir, onCerrar }) {
    const [paso, setPaso] = useState(0);
    // Paso que se va mientras entra el nuevo, y hacia dónde se mueven ("adelante" o "atras")
    const [saliente, setSaliente] = useState(null);
    const [direccion, setDireccion] = useState("adelante");
    const [terminada, setTerminada] = useState(false);
    const [valores, setValores] = useState(() => valoresIniciales(null));
    const [errores, setErrores] = useState({});
    const tituloPaso = useRef(null);
    const tituloFinal = useRef(null);
    const { campos } = PASOS[paso];
    const esUltimo = paso === PASOS.length - 1;

    // Al cambiar de paso, el foco va al título del paso nuevo (no en el primero: ahí lo toma el diálogo)
    const pasoAnterior = useRef(paso);
    useEffect(() => {
        if (pasoAnterior.current !== paso) tituloPaso.current?.focus();
        pasoAnterior.current = paso;
    }, [paso]);

    useEffect(() => {
        if (terminada) tituloFinal.current?.focus();
    }, [terminada]);

    function cambiar(campo, valor) {
        setValores({ ...valores, [campo]: valor });
        setErrores({ ...errores, [campo]: undefined });
    }

    function irAPaso(nuevo) {
        setDireccion(nuevo > paso ? "adelante" : "atras");
        setSaliente(paso);
        setPaso(nuevo);
    }

    function avanzar(e) {
        e.preventDefault();
        const delPaso = Object.fromEntries(campos.map(campo => [campo, valores[campo]]));
        const resultado = validarPerfil(delPaso);
        if (Object.keys(resultado.errores).length > 0) {
            setErrores(resultado.errores);
            return;
        }
        if (!esUltimo) {
            irAPaso(paso + 1);
            return;
        }
        onGuardar(validarPerfil(valores).valores);
        setTerminada(true);
    }

    if (terminada && objetivo != null) {
        // El perfil ya está guardado: cerrar no cuenta como "Ahora no"
        return (
            <Modal id="modal-bienvenida" abierto={abierta} onCerrar={onCerrar} idTitulo="titulo-bienvenida" idBotonCerrar="btnCerrarBienvenida">
                <div className="bienvenida-final">
                    <h3 id="titulo-bienvenida" ref={tituloFinal} tabIndex={-1}>¡Listo! Tu objetivo diario</h3>
                    <p className="objetivo-calorias"><NumeroAnimado valor={objetivo.calorias} /> kcal</p>
                    {objetivo.minimoAplicado && <p className="objetivo-aviso">Ajustamos tu objetivo al mínimo recomendado.</p>}
                    <div className="objetivo-macros">
                        <BarrasMacros filas={filasMacros(objetivo)} />
                    </div>
                    <p className="objetivo-explicacion">Es una estimación; la podés cambiar cuando quieras en Mi progreso.</p>
                    <button type="button" className="btn-pill" onClick={onCerrar}>
                        Empezar a planificar <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal id="modal-bienvenida" abierto={abierta} onCerrar={onOmitir} idTitulo="titulo-bienvenida" idBotonCerrar="btnCerrarBienvenida">
            <form onSubmit={avanzar} noValidate>
                <h3 id="titulo-bienvenida">Calculemos tu objetivo</h3>
                <p className="bienvenida-intro">Con tus datos estimamos las calorías y los macros de cada día. Los podés cambiar cuando quieras en Mi progreso.</p>
                <p className="bienvenida-paso">Paso {paso + 1} de {PASOS.length}</p>
                <div className="bienvenida-avance" aria-hidden="true">
                    {PASOS.map((_, i) => <div key={i} className={i <= paso ? "hecho" : ""}><span></span></div>)}
                </div>
                <div className="bienvenida-pasos">
                    {/* El paso que se va queda encima mientras se desliza; no se puede usar ni se lee */}
                    {saliente != null && (
                        <div
                            key={`sale-${saliente}`}
                            className={`bienvenida-paso-contenido sale-${direccion}`}
                            aria-hidden="true"
                            inert
                            onAnimationEnd={e => { if (e.target === e.currentTarget) setSaliente(null); }}
                        >
                            <ContenidoPaso indice={saliente} idFormulario="bienvenida-sale" valores={valores} errores={{}} onCambiar={() => {}} />
                        </div>
                    )}
                    <div key={`paso-${paso}`} className={`bienvenida-paso-contenido ${saliente != null ? `entra-${direccion}` : ""}`}>
                        <ContenidoPaso indice={paso} refTitulo={tituloPaso} idFormulario="bienvenida" valores={valores} errores={errores} onCambiar={cambiar} />
                    </div>
                </div>
                <div className="bienvenida-acciones">
                    {paso > 0 && <button type="button" className="btn-secundario" onClick={() => irAPaso(paso - 1)}>Atrás</button>}
                    <button type="submit" className="btn-principal">{esUltimo ? "Calcular mi objetivo" : "Siguiente"}</button>
                </div>
                <button type="button" className="btn-link bienvenida-omitir" onClick={onOmitir}>Ahora no</button>
            </form>
        </Modal>
    );
}

function ContenidoPaso({ indice, refTitulo, idFormulario, valores, errores, onCambiar }) {
    const { titulo, campos } = PASOS[indice];
    return (
        <>
            <h4 ref={refTitulo} tabIndex={refTitulo ? -1 : undefined} className="bienvenida-titulo-paso">{titulo}</h4>
            <div className="campos-perfil">
                {campos.map(campo => (
                    <CampoPerfil key={campo} campo={campo} idFormulario={idFormulario} valores={valores} errores={errores} onCambiar={onCambiar} />
                ))}
            </div>
        </>
    );
}
