import { obtenerDetalleReceta } from "./api.js";

const resultados = document.querySelector("#resultados");
const modalDetalle = document.querySelector("#modal-detalle");
const cacheRecetas = new Map();

export function renderRecetas(recetas, favoritos, contenedor) {
    contenedor.innerHTML = '';
    let html = '';
    recetas.forEach(receta => {
        const esFavorito = favoritos.some(fav => fav.id === receta.id);
        const claseActiva = esFavorito ? 'activo' : '';
        const tarjetaHTML = `
            <div class="receta-card" data-id="${receta.id}">
                <img src="${receta.image}" alt="${receta.title}">
                <div class="receta-info">
                    <p>${receta.title}</p>
                    <p>"${receta.cuisines?.length ? receta.cuisines.join(", ") : "Sin categoría"}"</p>
                </div>
                <button class="btn-favorito ${claseActiva}">★</button>
                <button class="btn-ver-receta">Ver receta</button>
                <button class="btn-agregar-plan">Agregar al plan</button>
            </div>`
        html += tarjetaHTML;
    });
    contenedor.innerHTML = html;
}

export function renderDetalleReceta(receta) {
    const infoHTML = `
        <div class="receta-detallada-wrapper">
            <img src="${receta.image}" alt="${receta.title}">
            <p class="receta-detallada-titulo">${receta.title}</p>
            <span class="receta-detallada-categoria">${receta.cuisines?.length ? receta.cuisines.join(", ") : "Sin categoría"}</span>
        </div>`;

    let ingredientesHTML = '';
    receta.extendedIngredients.forEach(ingrediente => {
        ingredientesHTML += `<li>${ingrediente.original}</li>`;
    });

    const instruccionesHTML = `${receta.instructions}`;

    const htmlFinal = infoHTML
        + `<h3 class="modal-subtitulo">Ingredientes</h3>`
        + `<ul>${ingredientesHTML}</ul>`
        + `<h3 class="modal-subtitulo">Instrucciones</h3>`
        + instruccionesHTML;

    modalDetalle.innerHTML = htmlFinal;
}

export async function renderPlanSemanal(plan) {
    const dias = Object.keys(plan);
    const idsAcumulados = new Set();

    for (const dia of dias) {
        const franjas = Object.keys(plan[dia]);
        for (const franja of franjas) {
            const idsRecetas = plan[dia][franja];
            idsRecetas.forEach(id => {
                idsAcumulados.add(id);
            });
        }
    }

    const idsArray = [...idsAcumulados];
    const idsFaltantes = idsArray.filter(id => !cacheRecetas.has(id));
    const promesas = idsFaltantes.map(id => obtenerDetalleReceta(id));
    const recetasResueltas = await Promise.all(promesas);

    recetasResueltas.forEach((receta, i) => {
        const id = idsFaltantes[i];
        cacheRecetas.set(id, receta);
    });

    for (const dia of dias) {
        const franjas = Object.keys(plan[dia]);
        for (const franja of franjas) {
            const idsRecetas = plan[dia][franja];
            const contenedor = document.querySelector(`.dia[data-dia="${dia}"] .franja[data-franja="${franja}"] .franja-recetas`);
            const recetas = idsRecetas.map(id => cacheRecetas.get(id));

            let htmlAcumulado = '';
            recetas.forEach((receta, i) => {
                const id = idsRecetas[i];

                if (receta == null) {
                    htmlAcumulado += `
                    <div class="receta-plan-card" data-id="${id}" draggable="true">
                        <div>
                            <p>Receta no disponible</p>
                        </div>
                        <button class="btn-eliminar-plan" data-dia="${dia}" data-franja="${franja}">×</button>
                    </div>`;
                } else {
                    htmlAcumulado += `
                    <div class="receta-plan-card" data-id="${id}" draggable="true">
                        <img src="${receta.image}" alt="${receta.title}">
                        <div>
                            <p>${receta.title}</p>
                            <span class="receta-detallada-categoria">${receta.cuisines?.length ? receta.cuisines.join(", ") : "Sin categoría"}</span>
                        </div>
                        <button class="btn-eliminar-plan" data-dia="${dia}" data-franja="${franja}">×</button>
                    </div>`;
                }
            });
            contenedor.innerHTML = htmlAcumulado;
        }
    }
}

export function renderListaCompras(ingredientes, marcadas, contenedor, cargando = false) {
    if (cargando) {
        contenedor.innerHTML = '<div class="estado-vacio"><p>Cargando ingredientes...</p></div>';
        return;
    }

    if (ingredientes.length === 0) {
        contenedor.innerHTML = `
            <div class="estado-vacio">
                <i class="fa-solid fa-basket-shopping icono-lista-vacia"></i>
                <p>Agregá recetas al plan para generar tu lista de compras.</p>
            </div>`;
        return;
    }

    const itemsHTML = ingredientes.map(ingrediente => {
        const marcado = marcadas.includes(ingrediente.nombre);
        return `
            <label class="item-compra ${marcado ? 'comprado' : ''}">
                <input type="checkbox" class="check-compra" data-nombre="${ingrediente.nombre}" ${marcado ? 'checked' : ''}>
                <span>${ingrediente.nombre}</span>
                <strong>${ingrediente.cantidad}</strong>
            </label>`;
    }).join('');

    contenedor.innerHTML = `<div class="lista-compras">${itemsHTML}</div>`;
}
