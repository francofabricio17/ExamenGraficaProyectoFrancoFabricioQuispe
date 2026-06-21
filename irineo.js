var scene;
var camera;
var renderer;
var irineoModel; // Variable cambiada para representar el modelo de Irineo
var controles;

function init()
{
    scene = new THREE.Scene();
    
    // Configurar el fondo de la pantalla a color negro
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 5, 10);
    
    // 3. Renderizador optimizado
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    
    // Ajuste equilibrado
    renderer.toneMappingExposure = 1.2; 
    renderer.outputColorSpace = THREE.SRGBColorSpace; 
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    // 4. Controles interactivos de órbita
    controles = new THREE.OrbitControls(camera, renderer.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.08;
    controles.enableZoom = true;
    controles.enableRotate = true;
    controles.enablePan = true;
    controles.minDistance = 2;
    controles.maxDistance = 150;
    controles.maxPolarAngle = Math.PI / 2; // Evita que la cámara baje del suelo
    
    // 5. Configuración de Iluminación Equilibrada
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Luz pareja suave
    scene.add(ambientLight);
    
    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x333333, 0.6);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);
    
    // Luz frontal/principal moderada
    var directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); 
    directionalLight.position.set(10, 25, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; 
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Luz de contra lateral 
    var directionalLight2 = new THREE.DirectionalLight(0xbbddff, 1.0); 
    directionalLight2.position.set(-15, 15, -10);
    scene.add(directionalLight2);

    // Foco de estudio superior
    var spotLight = new THREE.SpotLight(0xffeebb, 1.5);
    spotLight.position.set(0, 35, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    // Captura de elementos del Loader HTML
    var loaderContainer = document.getElementById('loader-container');
    var progressBar = document.getElementById('progress-bar');
    var progressText = document.getElementById('progress-text');
    
    // 6. Carga del Modelo .GLB de Irineo
    var cargar = new THREE.GLTFLoader();
    cargar.load("assets/Irineo.glb", 
        function(gltf)
        {
            irineoModel = gltf.scene;
            // Quitamos el desplazamiento de posición manual aquí para evitar conflictos
            irineoModel.position.set(0, 0, 0);
            irineoModel.scale.set(5, 5, 5); // Escala equilibrada
            
            irineoModel.traverse(function(obj)
            {
                if(obj.isMesh)
                {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                    if(obj.material)
                    {
                        obj.material.needsUpdate = true;
                        
                        // Respetamos completamente las texturas y mapas originales de la estatua
                        if(obj.material.map)
                        {
                            obj.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                        }
                    }
                }
            });
            scene.add(irineoModel);
            
            // --- CENTRADO Y AJUSTE DE ALTURA MANUAL ---
            var box = new THREE.Box3().setFromObject(irineoModel);
            var center = box.getCenter(new THREE.Vector3()); 
            
            // Movemos el objetivo de la cámara hacia abajo en el Eje Y para que el modelo suba visualmente (o baje respecto al canvas)
            var alturaBajar = center.y + 1.5; // Ajusta este valor si necesitas más o menos espacio
            
            controles.target.set(center.x, alturaBajar, center.z);
            camera.position.set(center.x, alturaBajar + 3, center.z + 18);
            controles.update();
            
            // Desvanecer la barra de carga
            setTimeout(function() {
                if (loaderContainer) loaderContainer.classList.add('loaded');
            }, 250);
        },
        function(xhr)
        {
            if (xhr.total > 0) {
                var porcentaje = Math.round((xhr.loaded / xhr.total) * 100);
                if (progressBar) progressBar.style.width = porcentaje + '%';
                if (progressText) progressText.innerText = porcentaje + '%';
            } else {
                if (progressText) progressText.innerText = "Cargando...";
            }
        },
        function(error)
        {
            console.log("Error cargando modelo de Irineo:", error);
            if (progressText) progressText.innerText = "Error de carga";
        }
    );
}

// 7. Ciclo de animación
function animate()
{
    requestAnimationFrame(animate);
    
    // Si el objeto de Irineo ya cargó, le aplicamos una rotación suave y continua en el eje Y
    if(irineoModel) {
        irineoModel.rotation.y += 0.005;
    }

    controles.update();
    renderer.render(scene, camera);
}

// Responsividad de ventana
window.addEventListener("resize", function()
    {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
);

// Ejecución
init();
animate();