var scene;
var camera;
var renderer;
var plaza; // Guarda el modelo de tu estatua
var controles;

function init()
{
    scene = new THREE.Scene();
    
    // CAMBIO 1: Configurar el fondo de la pantalla a color negro
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 5, 10);
    
    // 3. Renderizador optimizado
    // Nota: Se quitó alpha: true para que el color negro del background se note correctamente
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3; // Subimos ligeramente la exposición global
    renderer.outputEncoding = THREE.sRGBEncoding; 
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
    
    // 5. Configuración de Iluminación de Alta Definición (Buena Iluminación)
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiental más clara
    scene.add(ambientLight);
    
    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x223322, 0.6);
    scene.add(hemisphereLight);
    
    // Luz frontal/principal potente (Simula el sol o reflector de frente al modelo)
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.8); 
    directionalLight.position.set(10, 25, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; 
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Luz de contra lateral (Resalta los bordes izquierdos con un tono frío)
    var directionalLight2 = new THREE.DirectionalLight(0xbbddff, 0.8); 
    directionalLight2.position.set(-15, 15, -10);
    scene.add(directionalLight2);

    // Foco de estudio superior (Añade brillo directo en la cabeza y hombros de la estatua)
    var spotLight = new THREE.SpotLight(0xffeebb, 2.0);
    spotLight.position.set(0, 35, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    // Captura de elementos del Loader HTML
    var loaderContainer = document.getElementById('loader-container');
    var progressBar = document.getElementById('progress-bar');
    var progressText = document.getElementById('progress-text');
    
    // 6. Carga del Modelo .GLB del Minero
    var cargar = new THREE.GLTFLoader();
    cargar.load("assets/Minero.glb", 
        function(gltf)
        {
            plaza = gltf.scene;
            plaza.position.set(0, 0, 0);
            plaza.scale.set(3.5, 3.5, 3.5); // Escala original
            
            plaza.traverse(function(obj)
            {
                if(obj.isMesh)
                {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                    if(obj.material)
                    {
                        obj.material.needsUpdate = true;
                        obj.material.roughness = 0.4; // Hace que el material responda mejor a los brillos
                        if(obj.material.map)
                        {
                            obj.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                        }
                    }
                }
            });
            scene.add(plaza);
            
            // --- CENTRADO EN EL EJE CENTRAL DE LA PANTALLA ---
            var box = new THREE.Box3().setFromObject(plaza);
            var center = box.getCenter(new THREE.Vector3());
            
            // Forzamos a que el pivote de rotación sea exactamente el centro del Minero
            controles.target.set(center.x, center.y, center.z);
            
            // CAMBIO 2: Se redujo significativamente el valor del eje Z (+ 7) para acercar mucho más la cámara al modelo
            camera.position.set(center.x, center.y + 4, center.z + 10);
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
            console.log("Error cargando modelo:", error);
            if (progressText) progressText.innerText = "Error de carga";
        }
    );
}

// 7. Ciclo de animación
function animate()
{
    requestAnimationFrame(animate);
    
    // CAMBIO 3: Si el objeto "plaza" ya cargó, le aplicamos una rotación continua en el eje Y
    if(plaza) {
        plaza.rotation.y += 0.01; // Puedes cambiar el 0.01 por un número menor o mayor para ajustar la velocidad
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