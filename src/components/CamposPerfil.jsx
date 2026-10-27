import { useState } from "react";
import { ACTIVIDADES, METAS, SEXOS, RANGOS } from "../lib/macros.js";

// Campos del perfil, compartidos por "Tus datos" (Mi progreso) y la bienvenida.
// Los valores van como texto mientras se escriben; validarPerfil los convierte al guardar.

const NUMEROS = {
    edad: { etiqueta: "Edad", modo: "numeric" },
    altura: { etiqueta: "Altura", modo: "numeric" },
    peso: { etiqueta: "Peso", modo: "decimal" },
};

const OPCIONES = {
    sexo: { etiqueta: "Sexo", opciones: SEXOS },
    actividad: { etiqueta: "Actividad", opciones: ACTIVIDADES },
    meta: { etiqueta: "Meta", opciones: METAS },
};

// Texto para el formulario a partir del perfil guardado (o vacío si no hay)
export function valoresIniciales(perfil) {
    return {
        sexo: perfil?.sexo ?? "",
        edad: perfil?.edad != null ? String(perfil.edad) : "",
        altura: perfil?.altura != null ? String(perfil.altura) : "",
        peso: perfil?.peso != null ? String(perfil.peso).replace(".", ",") : "",
        actividad: perfil?.actividad ?? "",
        meta: perfil?.meta ?? "",
    };
}

export default function CampoPerfil({ campo, idFormulario, valores, errores, onCambiar }) {
    const id = `${idFormulario}-${campo}`;
    if (campo in OPCIONES) {
        const { etiqueta, opciones } = OPCIONES[campo];
        return (
            <OpcionesBotones
                id={id}
                etiqueta={etiqueta}
                opciones={opciones}
                valor={valores[campo]}
                error={errores[campo]}
                onCambiar={valor => onCambiar(campo, valor)}
            />
        );
    }
    const { etiqueta, modo } = NUMEROS[campo];
    return (
        <CampoNumero
            id={id}
            etiqueta={etiqueta}
            unidad={RANGOS[campo].unidad}
            modo={modo}
            valor={valores[campo]}
            error={errores[campo]}
            onCambiar={valor => onCambiar(campo, valor)}
        />
    );
}

// Grupo de botones que se comporta como radios (flechas del teclado incluidas). La opción
// elegida muestra ✓; solo late la que se acaba de tocar, no las que ya venían elegidas
function OpcionesBotones({ id, etiqueta, opciones, valor, error, onCambiar }) {
    const [recienElegida, setRecienElegida] = useState(null);
    const elegida = opciones.find(opcion => opcion.valor === valor);
    return (
        <fieldset className="campo-perfil" aria-describedby={error ? `${id}-error` : undefined}>
            <legend>{etiqueta}</legend>
            <div className={`opciones-botones ${opciones.length > 3 ? "opciones-muchas" : ""}`}>
                {opciones.map(opcion => (
                    <label
                        key={opcion.valor}
                        className={[opcion.valor === valor && "elegida", opcion.valor === recienElegida && "latido"].filter(Boolean).join(" ")}
                    >
                        <input
                            type="radio"
                            name={id}
                            value={opcion.valor}
                            checked={opcion.valor === valor}
                            onChange={() => { setRecienElegida(opcion.valor); onCambiar(opcion.valor); }}
                        />
                        {opcion.nombre}
                        {opcion.valor === valor && <i className="fa-solid fa-check" aria-hidden="true"></i>}
                    </label>
                ))}
            </div>
            {elegida?.descripcion && <p className="campo-ayuda">{elegida.descripcion}</p>}
            {error && <p id={`${id}-error`} className="mensaje-error">{error}</p>}
        </fieldset>
    );
}

// Texto con teclado numérico, así se puede escribir el decimal con coma
export function CampoNumero({ id, etiqueta, unidad, modo, valor, error, onCambiar }) {
    return (
        <div className="campo-perfil">
            <label htmlFor={id}>{etiqueta}</label>
            <div className="campo-con-unidad">
                <input
                    id={id}
                    type="text"
                    inputMode={modo}
                    value={valor}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={e => onCambiar(e.target.value)}
                />
                <span>{unidad}</span>
            </div>
            {error && <p id={`${id}-error`} className="mensaje-error">{error}</p>}
        </div>
    );
}
