import { useState } from "react";
import CampoPerfil, { CampoNumero, valoresIniciales } from "./CamposPerfil.jsx";
import BarrasMacros, { NumeroAnimado } from "./BarrasMacros.jsx";
import TarjetaPeso from "./TarjetaPeso.jsx";
import { calcularObjetivo, filasMacros, formatearNumero, validarPerfil, REPARTO_RECOMENDADO, RANGOS } from "../lib/macros.js";

const CAMPOS = ["sexo", "edad", "altura", "peso", "actividad", "meta"];

export default function MiProgreso({ oculto, perfil, objetivo, pesos, onGuardar, onCargarPeso, onBorrarPeso, onAviso }) {
    return (
        <section id="progreso" className={`seccion ${oculto ? "oculto" : ""}`}>
            <div className="seccion-cabecera">
                <div>
                    <h2>Mi progreso</h2>
                    <p>Tus datos y el objetivo de cada día que calculamos con ellos.</p>
                </div>
            </div>
            <div className="progreso-grilla">
                {/* Se vuelve a armar si el perfil cambia desde afuera (por ejemplo, en la bienvenida) */}
                <TarjetaDatos key={JSON.stringify(perfil)} perfil={perfil} onGuardar={onGuardar} onAviso={onAviso} />
                {/* Al volver a la sección, las barras y los números se animan de nuevo */}
                <TarjetaObjetivo key={oculto ? "oculta" : "visible"} perfil={perfil} objetivo={objetivo} onGuardar={onGuardar} onAviso={onAviso} />
                <TarjetaPeso perfil={perfil} pesos={pesos} onCargarPeso={onCargarPeso} onBorrarPeso={onBorrarPeso} onAviso={onAviso} />
            </div>
        </section>
    );
}

function TarjetaDatos({ perfil, onGuardar, onAviso }) {
    const [valores, setValores] = useState(() => valoresIniciales(perfil));
    const [errores, setErrores] = useState({});

    function cambiar(campo, valor) {
        setValores({ ...valores, [campo]: valor });
        setErrores({ ...errores, [campo]: undefined });
    }

    function guardar(e) {
        e.preventDefault();
        const resultado = validarPerfil(valores);
        if (Object.keys(resultado.errores).length > 0) {
            setErrores(resultado.errores);
            return;
        }
        onGuardar(resultado.valores);
        onAviso({ texto: perfil == null ? "Listo: ya calculamos tu objetivo" : "Guardamos tus datos" });
    }

    return (
        <form id="form-datos" className="tarjeta-progreso" onSubmit={guardar} noValidate>
            <h3>Tus datos</h3>
            <div className="campos-perfil">
                {CAMPOS.map(campo => (
                    <CampoPerfil key={campo} campo={campo} idFormulario="datos" valores={valores} errores={errores} onCambiar={cambiar} />
                ))}
            </div>
            <button type="submit" className="btn-principal">{perfil == null ? "Calcular mi objetivo" : "Guardar"}</button>
        </form>
    );
}

function TarjetaObjetivo({ perfil, objetivo, onGuardar, onAviso }) {
    const [editando, setEditando] = useState(false);

    if (objetivo == null) {
        return (
            <div className="tarjeta-progreso">
                <h3>Tu objetivo diario</h3>
                <p className="objetivo-vacio">Completá tus datos y calculamos las calorías y los macros de cada día.</p>
            </div>
        );
    }

    return (
        <div className="tarjeta-progreso">
            <h3>Tu objetivo diario</h3>
            <p className="objetivo-calorias"><NumeroAnimado valor={objetivo.calorias} /> kcal</p>
            <p className="objetivo-explicacion">{explicarCalorias(objetivo)}</p>
            {objetivo.minimoAplicado && (
                <p className="objetivo-aviso">Ajustamos tu objetivo al mínimo recomendado ({formatearNumero(objetivo.calorias)} kcal).</p>
            )}
            <p className="objetivo-explicacion">Es una estimación para orientarte, no un consejo médico.</p>
            {editando ? (
                <EditorReparto
                    perfil={perfil}
                    onGuardar={reparto => {
                        onGuardar({ reparto });
                        setEditando(false);
                        onAviso({ texto: reparto == null ? "Estás usando el reparto recomendado" : "Guardamos tu reparto" });
                    }}
                    onCancelar={() => setEditando(false)}
                />
            ) : (
                <>
                    <div className="objetivo-macros">
                        <BarrasMacros filas={filasConRegla(objetivo)} />
                    </div>
                    <p className="objetivo-reparto">
                        {objetivo.esRecomendado
                            ? "Es el reparto recomendado. "
                            : `Estás usando un reparto propio. El recomendado es ${formatearNumero(REPARTO_RECOMENDADO.proteinaPorKg)} g de proteína por kg y ${REPARTO_RECOMENDADO.grasasPct} % de grasas. `}
                        <button type="button" className="btn-link" onClick={() => setEditando(true)}>Podés cambiarlo</button>
                    </p>
                    {!objetivo.esRecomendado && (
                        <button type="button" className="btn-secundario" onClick={() => { onGuardar({ reparto: null }); onAviso({ texto: "Estás usando el reparto recomendado" }); }}>
                            Volver al recomendado
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

// Los campos reemplazan a la regla de cada macro y las barras se actualizan mientras se escribe
function EditorReparto({ perfil, onGuardar, onCancelar }) {
    const repartoActual = perfil.reparto ?? REPARTO_RECOMENDADO;
    const [valores, setValores] = useState({
        proteinaPorKg: formatearNumero(repartoActual.proteinaPorKg),
        grasasPct: String(repartoActual.grasasPct),
    });
    // Con un valor fuera de rango, las barras muestran el último reparto válido
    const [ultimoValido, setUltimoValido] = useState(repartoActual);
    const { valores: validos, errores } = validarPerfil(valores);
    const hayErrores = Object.keys(errores).length > 0;
    const vista = calcularObjetivo({ ...perfil, reparto: hayErrores ? ultimoValido : validos });

    function cambiar(clave, valor) {
        const nuevos = { ...valores, [clave]: valor };
        setValores(nuevos);
        const resultado = validarPerfil(nuevos);
        if (Object.keys(resultado.errores).length === 0) setUltimoValido(resultado.valores);
    }

    function guardar() {
        if (hayErrores) return;
        const esRecomendado = validos.proteinaPorKg === REPARTO_RECOMENDADO.proteinaPorKg && validos.grasasPct === REPARTO_RECOMENDADO.grasasPct;
        onGuardar(esRecomendado ? null : validos);
    }

    const campo = (clave, etiqueta) => (
        <CampoNumero
            id={`reparto-${clave}`}
            etiqueta={etiqueta}
            unidad={RANGOS[clave].unidad}
            modo="decimal"
            valor={valores[clave]}
            error={errores[clave]}
            onCambiar={valor => cambiar(clave, valor)}
        />
    );

    const [proteinas, grasas, carbohidratos] = filasMacros(vista);
    return (
        <div className="editor-reparto">
            <div className="objetivo-macros">
                <BarrasMacros filas={[
                    { ...proteinas, detalle: campo("proteinaPorKg", "Proteínas por kg") },
                    { ...grasas, detalle: campo("grasasPct", "Grasas (% de las calorías)") },
                    { ...carbohidratos, detalle: "el resto" },
                ]} />
            </div>
            <div className="editor-reparto-acciones">
                <button type="button" className="btn-principal" onClick={guardar}>Guardar reparto</button>
                <button type="button" className="btn-secundario" onClick={onCancelar}>Cancelar</button>
            </div>
            <button type="button" className="btn-link" onClick={() => onGuardar(null)}>Volver al recomendado</button>
        </div>
    );
}

function filasConRegla(objetivo) {
    const [proteinas, grasas, carbohidratos] = filasMacros(objetivo);
    return [
        { ...proteinas, detalle: `${formatearNumero(objetivo.reparto.proteinaPorKg)} g por kg` },
        { ...grasas, detalle: `${objetivo.reparto.grasasPct} % de las calorías` },
        { ...carbohidratos, detalle: "el resto" },
    ];
}

function explicarCalorias({ mantenimiento, factorMeta }) {
    const base = `Para mantener tu peso necesitás unas ${formatearNumero(mantenimiento)} kcal por día`;
    if (factorMeta < 1) return `${base}; para bajar, le restamos un ${Math.round((1 - factorMeta) * 100)} %.`;
    if (factorMeta > 1) return `${base}; para subir, le sumamos un ${Math.round((factorMeta - 1) * 100)} %.`;
    return `${base}, y ese es tu objetivo.`;
}
