var scene;
var camera;
var renderer;
var plaza; // Guarda el modelo de tu estatua
var controles;

function init()
{
    scene = new THREE.Scene();
    
    // Configurar el fondo de la pantalla a color negro
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 5, 10);
    
    // Renderizador optimizado
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3; // Subimos ligeramente la exposición global
    renderer.outputEncoding = THREE.sRGBEncoding; 
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    // Controles interactivos de órbita
    controles = new THREE.OrbitControls(camera, renderer.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.08;
    controles.enableZoom = true;
    controles.enableRotate = true;
    controles.enablePan = true;
    controles.minDistance = 2;
    controles.maxDistance = 150;
    controles.maxPolarAngle = Math.PI / 2; // Evita que la cámara baje del suelo
    
    // Configuración de Iluminación de Alta Definición
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiental más clara
    scene.add(ambientLight);
    
    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x223322, 0.6);
    scene.add(hemisphereLight);
    
    // Luz frontal/principal potente
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.8); 
    directionalLight.position.set(10, 25, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; 
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Luz de contra lateral
    var directionalLight2 = new THREE.DirectionalLight(0xbbddff, 0.8); 
    directionalLight2.position.set(-15, 15, -10);
    scene.add(directionalLight2);

    // Foco de estudio superior
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
    
    // 6. Carga del Modelo .GLB (Apunta a tu archivo assets/Cesar.glb, cámbialo si tiene otro nombre)
    var cargar = new THREE.GLTFLoader();
    cargar.load("assets/Cesar.glb", 
        function(gltf)
        {
            plaza = gltf.scene;
            plaza.position.set(0, 0, 0);
            plaza.scale.set(2, 2, 2); // Escala del modelo
            
            plaza.traverse(function(obj)
            {
                if(obj.isMesh)
                {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                    if(obj.material)
                    {
                        obj.material.needsUpdate = true;
                        obj.material.roughness = 0.4;
                        if(obj.material.map)
                        {
                            obj.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                        }
                    }
                }
            });
            scene.add(plaza);
            
            // --- CENTRADO EN EL EJE CENTRAL ---
            var box = new THREE.Box3().setFromObject(plaza);
            var center = box.getCenter(new THREE.Vector3());
            
            // Forzamos a que el pivote de rotación sea exactamente el centro del monumento
            controles.target.set(center.x, center.y, center.z);
            
            // Acercamos la cámara al modelo
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

// Ciclo de animación
function animate()
{
    requestAnimationFrame(animate);
    
    // Rotación continua en el eje Y
    if(plaza) {
        plaza.rotation.y += 0.01;
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