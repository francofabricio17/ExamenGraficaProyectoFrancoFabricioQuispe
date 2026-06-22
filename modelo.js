var scene;
var camera;
var renderer;
var plaza;
var controles;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#050d0a');
    
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(4, 10, 25);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; 
    
    renderer.outputColorSpace = THREE.SRGBColorSpace; 
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    controles = new THREE.OrbitControls(camera, renderer.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.08;
    controles.enableZoom = true;
    controles.enableRotate = true;
    controles.enablePan = true;
    controles.minDistance = 5;
    controles.maxDistance = 300;
    controles.maxPolarAngle = Math.PI / 2;
    
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);
    
    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x112211, 0.5);
    scene.add(hemisphereLight);
    
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(30, 60, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 512; 
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    var d = 80; 
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.bias = -0.0005; 
    scene.add(directionalLight);
    
    var directionalLight2 = new THREE.DirectionalLight(0xaaccff, 0.3);
    directionalLight2.position.set(-30, 20, -30);
    scene.add(directionalLight2);
    
    var loaderContainer = document.getElementById('loader-container');
    var progressBar = document.getElementById('progressBar');
    var progressText = document.getElementById('progress-text');
    
    var cargar = new THREE.GLTFLoader();
    
    // Total de elementos: 1 modelo de plaza + 6 objetos independientes = 7
    var totalModelos = 7;
    var modelosCargados = 0;

    function verificarCargaCompleta() {
        modelosCargados++;
        if (modelosCargados === totalModelos) {
            setTimeout(function() {
                if (loaderContainer) loaderContainer.classList.add('loaded');
            }, 250);
        }
    }
    
    // 1. Cargar el modelo principal de la plaza
    cargar.load("assets/Plaza1.glb", 
        function(gltf) {
            plaza = gltf.scene;
            plaza.position.set(0, 0, 0);
            plaza.scale.set(4, 4, 4);

            plaza.traverse(function(obj) {
                if(obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;

                    if(obj.material) {
                        obj.material.needsUpdate = true;

                        if(obj.material.map) {
                            obj.material.map.anisotropy =
                                renderer.capabilities.getMaxAnisotropy();
                        }
                    }
                }
            });
            
            scene.add(plaza);

            console.log("Estructura del modelo cargado (Plaza):", plaza);
            
            var box = new THREE.Box3().setFromObject(plaza);
            var center = box.getCenter(new THREE.Vector3());
            controles.target.copy(center);
            camera.position.set(center.x + 50, center.y + 20, center.z + 95);
            controles.update();
            
            verificarCargaCompleta();
        },
        function(xhr) {
            if (xhr.total > 0 && progressText) {
                var porcentaje = Math.round((xhr.loaded / xhr.total) * 100);
                if (progressBar) progressBar.style.width = porcentaje + '%';
                progressText.innerText = porcentaje + '%';
            }
        },
        function(error) {
            console.log("Error cargando modelo:", error);
            if (progressText) progressText.innerText = "Error de carga";
        }
    );

    // 2. Cargar elementos independientes 1 al 4
    cargar.load("assets/Pedestalirineo.glb", function(gltf) {
        var est1 = gltf.scene;
        est1.scale.set(3, 3, 3);
        est1.position.set(-65, 3, 10); 
        scene.add(est1);
        verificarCargaCompleta();
    });

    cargar.load("assets/Pedestalfederico.glb", function(gltf) {
        var est2 = gltf.scene;
        est2.scale.set(3, 3, 3);
        est2.position.set(-65, 3.2, 0);  
        scene.add(est2);
        verificarCargaCompleta();
    });

    cargar.load("assets/Pedestalescobar.glb", function(gltf) {
        var est3 = gltf.scene;
        est3.scale.set(3, 3, 3);
        est3.position.set(-65, 3, -10); 
        scene.add(est3);
        verificarCargaCompleta();
    });

    cargar.load("assets/Palliri.glb", function(gltf) {
        var est4 = gltf.scene;
        est4.scale.set(3, 3, 3);
        est4.position.set(-60, 9, -50); 
        est4.rotation.set(0, Math.PI / 2, 0); 
        scene.add(est4);
        verificarCargaCompleta();
    });

    // 3. Objetos 5 y 6 adicionales (ejemplo: Minero y Fede)
    cargar.load("assets/poste.glb", function(gltf) {
        var obj5 = gltf.scene;
        obj5.scale.set(8, 8, 8);
        obj5.position.set(-45, 6, 20); // Ajusta aquí las coordenadas X, Y, Z del objeto 5
        scene.add(obj5);
        verificarCargaCompleta();
    });

    cargar.load("assets/poste.glb", function(gltf) {
        var obj6 = gltf.scene;
        obj6.scale.set(8, 8, 8);
        obj6.position.set(-21, 1.2, 65); // Ajusta aquí las coordenadas X, Y, Z del objeto 6
        scene.add(obj6);
        verificarCargaCompleta();
    });
}

function animate() {
    requestAnimationFrame(animate);
    controles.update();
    renderer.render(scene, camera);
}

window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();