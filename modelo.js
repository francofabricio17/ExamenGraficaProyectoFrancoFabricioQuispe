var scene;
var camera;
var renderer;
var plaza;
var controles;
function init()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#050d0a');
    camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.set(4, 10, 25);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; 
    renderer.outputEncoding = THREE.sRGBEncoding; 
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
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Bajado de 1.8 a 1.0
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
    var directionalLight2 = new THREE.DirectionalLight(0xaaccff, 0.3); // Bajado de 0.5 a 0.3
    directionalLight2.position.set(-30, 20, -30);
    scene.add(directionalLight2);
    var loaderContainer = document.getElementById('loader-container');
    var progressBar = document.getElementById('progress-bar');
    var progressText = document.getElementById('progress-text');
    var cargar = new THREE.GLTFLoader();
    cargar.load("assets/Plaza1.glb", 
        function(gltf)
        {
            plaza = gltf.scene;
            plaza.position.set(0, 0, 0);
            plaza.scale.set(3, 3, 3);
            plaza.traverse(function(obj)
            {
                if(obj.isMesh)
                {
                    obj.castShadow = true;
                    obj.receiveShadow = true;

                    if(obj.material)
                    {
                        obj.material.needsUpdate = true;

                        if(obj.material.map)
                        {
                            obj.material.map.anisotropy =
                                renderer.capabilities.getMaxAnisotropy();
                        }
                    }
                }
            });
            scene.add(plaza);
            var box = new THREE.Box3().setFromObject(plaza);
            var center = box.getCenter(new THREE.Vector3());
            controles.target.copy(center);
            camera.position.set(center.x + 50, center.y + 20, center.z + 95);
            controles.update();
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
function animate()
{
    requestAnimationFrame(animate);
    controles.update();
    renderer.render(scene, camera);
}
window.addEventListener("resize", function()
    {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
);
init();
animate();