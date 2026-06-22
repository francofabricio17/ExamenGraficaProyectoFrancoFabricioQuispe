const carrusel = document.getElementById('carrusel');
const tarjetas = document.querySelectorAll('.tarjeta-foto');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const totalTarjetas = tarjetas.length;
const anguloPorTarjeta = 360 / totalTarjetas; 
const radioZ = 420; 
let rotacionActual = 0;
tarjetas.forEach((tarjeta, indice) => {
    const anguloCalculado = indice * anguloPorTarjeta;
    tarjeta.style.transform = `rotateY(${anguloCalculado}deg) translateZ(${radioZ}px)`;
});
function actualizarCarrusel() {
    carrusel.style.transform = `rotateY(${rotacionActual}deg)`;
}
nextBtn.addEventListener('click', () => {
    rotacionActual -= anguloPorTarjeta;
    actualizarCarrusel();
});
prevBtn.addEventListener('click', () => {
    rotacionActual += anguloPorTarjeta;
    actualizarCarrusel();
});
tarjetas.forEach((tarjeta, indice) => {
    tarjeta.addEventListener('click', () => {
        rotacionActual = -(indice * anguloPorTarjeta);
        actualizarCarrusel(); // Arreglado el typo anterior aquí
    });
});