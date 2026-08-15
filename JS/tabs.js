export function mostrarSeccion(nombreSeccion) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(seccion => {
        if (seccion.id === nombreSeccion) {
            seccion.classList.remove('oculto');
        } else {
            seccion.classList.add('oculto');
        }
    });
}