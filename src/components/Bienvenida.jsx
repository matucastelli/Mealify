import { useEffect, useRef, useState } from "react";
import Modal from "./Modal.jsx";
import CampoPerfil, { valoresIniciales } from "./CamposPerfil.jsx";
import { validarPerfil } from "../lib/macros.js";

const PASOS = [
    { titulo: "Contanos sobre vos", campos: ["sexo", "edad"] },
    { titulo: "Tu altura y tu peso", campos: ["altura", "peso"] },
    { titulo: "Tu actividad y tu meta", campos: ["actividad", "meta"] },
];

// Primera vez en la app: pide los datos del perfil en tres pasos. "Ahora no" (o cerrar)
// la saltea y no se vuelve a ofrecer; los datos se pueden cargar después en Mi progreso
export default function Bienvenida({ abierta, onGuardar, onOmitir }) {
    const [paso, setPaso] = useState(0);
    const [valores, setValores] = useState(() => valoresIniciales(null));
    const [errores, setErrores] = useState({});
    const tituloPaso = useRef(null);
    const { titulo, campos } = PASOS[paso];
    const esUltimo = paso === PASOS.length - 1;

    // Al cambiar de paso, el foco va al título del paso nuevo (no en el primero: ahí lo toma el diálogo)
    const pasoAnterior = useRef(paso);
    useEffect(() => {
        if (pasoAnterior.current !== paso) tituloPaso.current?.focus();
        pasoAnterior.current = paso;
    }, [paso]);

    function cambiar(campo, valor) {
        setValores({ ...valores, [campo]: valor });
        setErrores({ ...errores, [campo]: undefined });
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
            setPaso(paso + 1);
            return;
        }
        onGuardar(validarPerfil(valores).valores);
    }

    return (
        <Modal id="modal-bienvenida" abierto={abierta} onCerrar={onOmitir} idTitulo="titulo-bienvenida" idBotonCerrar="btnCerrarBienvenida">
            <form onSubmit={avanzar} noValidate>
                <h3 id="titulo-bienvenida">Calculemos tu objetivo</h3>
                <p className="bienvenida-intro">Con tus datos estimamos las calorías y los macros de cada día. Los podés cambiar cuando quieras en Mi progreso.</p>
                <p className="bienvenida-paso">Paso {paso + 1} de {PASOS.length}</p>
                <div className="bienvenida-avance" aria-hidden="true">
                    {PASOS.map((_, i) => <div key={i} className={i <= paso ? "hecho" : ""}></div>)}
                </div>
                <h4 ref={tituloPaso} tabIndex={-1} className="bienvenida-titulo-paso">{titulo}</h4>
                <div className="campos-perfil">
                    {campos.map(campo => (
                        <CampoPerfil key={campo} campo={campo} idFormulario="bienvenida" valores={valores} errores={errores} onCambiar={cambiar} />
                    ))}
                </div>
                <div className="bienvenida-acciones">
                    {paso > 0 && <button type="button" className="btn-secundario" onClick={() => setPaso(paso - 1)}>Atrás</button>}
                    <button type="submit" className="btn-principal">{esUltimo ? "Calcular mi objetivo" : "Siguiente"}</button>
                </div>
                <button type="button" className="btn-link bienvenida-omitir" onClick={onOmitir}>Ahora no</button>
            </form>
        </Modal>
    );
}
