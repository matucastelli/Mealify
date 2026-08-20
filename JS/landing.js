const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
});

const elementosAnimados = document.querySelectorAll('.feature-card, .paso');
elementosAnimados.forEach(elemento => {
    observer.observe(elemento);
});