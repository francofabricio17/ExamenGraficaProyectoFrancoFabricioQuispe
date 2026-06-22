// 1. CONFIGURACIÓN BÁSICA DEL ESCENARIO
const contenedor = document.getElementById('canvas-3d');
const escena = new THREE.Scene();
escena.background = new THREE.Color('#0a0c10'); 
escena.fog = new THREE.FogExp2('#0a0c10', 0.005);

// Cámara
const camara = new THREE.PerspectiveCamera(45, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000);

// Renderizador
const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(contenedor.clientWidth, contenedor.clientHeight);
renderizador.setPixelRatio(window.devicePixelRatio);
renderizador.toneMapping = THREE.ACESFilmicToneMapping;
renderizador.toneMappingExposure = 1.1;
contenedor.appendChild(renderizador.domElement);

// 2. ILUMINACIÓN COMPLETA
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.9);
escena.add(luzAmbiental);

const luzDireccional1 = new THREE.DirectionalLight(0xffffff, 1.2); 
luzDireccional1.position.set(30, 50, 20);
escena.add(luzDireccional1);

const luzDireccional2 = new THREE.DirectionalLight(0x4a7fa0, 0.8); 
luzDireccional2.position.set(-30, 30, -20);
escena.add(luzDireccional2);

// 3. PLATAFORMA BASE (Se redujo el radio de 28/29 a 22/23 para hacerla más pequeña)
const altoPlataforma = 1;
const sueloGeo = new THREE.CylinderGeometry(22, 23, altoPlataforma, 64);
const sueloMat = new THREE.MeshStandardMaterial({ 
    color: 0x141821, 
    roughness: 0.7,
    metalness: 0.3
});
const plataforma = new THREE.Mesh(sueloGeo, sueloMat);
plataforma.position.y = altoPlataforma / 2; 
escena.add(plataforma);

const grupoModelo = new THREE.Group();
escena.add(grupoModelo);

// Valores por defecto
let radioCamara = 60; 
let alturaCamara = 35; 
let anguloCamara = 0;

const objetivoMirada = new THREE.Vector3(0, altoPlataforma, 0);

// 4. CARGA DEL MODELO REAL
const cargador = new THREE.GLTFLoader();
cargador.load(
    'assets/Plaza1.glb',
    function (gltf) {
        const modelo = gltf.scene;
        
        // Centrar horizontalmente la plaza
        const cajaContenedora = new THREE.Box3().setFromObject(modelo);
        const centro = new THREE.Vector3();
        cajaContenedora.getCenter(centro);
        
        modelo.position.x += (modelo.position.x - centro.x);
        modelo.position.z += (modelo.position.z - centro.z);
        modelo.position.y += (modelo.position.y - cajaContenedora.min.y) + altoPlataforma; 

        grupoModelo.add(modelo);

        // Re-calculo de proporciones
        const tamaño = new THREE.Vector3();
        cajaContenedora.getSize(tamaño);
        
        const anchoMaximo = Math.max(tamaño.x, tamaño.z);
        
        radioCamara = anchoMaximo * 1.1; 
        alturaCamara = anchoMaximo * 0.75; 
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% cargado');
    },
    function (error) {
        console.error('Hubo un error cargando el modelo plaza1.glb:', error);
    }
);

// Redimensionamiento adaptativo
window.addEventListener('resize', () => {
    camara.aspect = contenedor.clientWidth / contenedor.clientHeight;
    camara.updateProjectionMatrix();
    renderizador.setSize(contenedor.clientWidth, contenedor.clientHeight);
});

// 5. BUCLE DE ANIMACIÓN
function animate() {
    requestAnimationFrame(animate);
    
    anguloCamara += 0.0012; 
    camara.position.x = Math.cos(anguloCamara) * radioCamara;
    camara.position.z = Math.sin(anguloCamara) * radioCamara;
    camara.position.y = alturaCamara; 

    camara.lookAt(objetivoMirada);

    renderizador.render(escena, camara);
}
animate();