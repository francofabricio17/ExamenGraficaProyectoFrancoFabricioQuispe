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

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        "imagenes/cielo.jpg",
        function (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
        }
    );
    
    var loaderContainer = document.getElementById('loader-container');
    var progressBar = document.getElementById('progressBar');
    var progressText = document.getElementById('progress-text');
    
    var cargar = new THREE.GLTFLoader();
    
    var totalModelos = 14; 
    var modelosCargados = 0;
    var pantallaOculta = false;

    function verificarCargaCompleta() {
        if (pantallaOculta) return;
        modelosCargados++;
        console.log("Modelo cargado: " + modelosCargados + "/" + totalModelos);
        
        if (modelosCargados >= totalModelos) {
            ocultarLoader();
        }
    }

    function ocultarLoader() {
        if (pantallaOculta) return;
        pantallaOculta = true;
        if (loaderContainer) {
            loaderContainer.classList.add('loaded');
        }
    }

    setTimeout(function() {
        if (!pantallaOculta) {
            console.warn("Aviso de emergencia: Forzando la retirada del loader por tiempo límite.");
            ocultarLoader();
        }
    }, 6000);
    
    // 1. Cargar el modelo principal (piso.glb corregido)
    cargar.load("assets/piso.glb", function(gltf) {
        plaza = gltf.scene;
        plaza.position.set(0, 0, 0);
        plaza.scale.set(5, 5, 5);
        plaza.traverse(function(obj) {
            if(obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
                if(obj.material) {
                    obj.material.needsUpdate = true;
                    if(obj.material.map) {
                        obj.material.map.generateMipmaps = true;
                        obj.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                        obj.material.map.magFilter = THREE.LinearFilter;
                        obj.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
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
        console.log("Error cargando piso.glb:", error);
        verificarCargaCompleta();
    });

    function cargarModeloSeguro(url, callbackError) {
        cargar.load(url, function(gltf) {
            callbackError(gltf.scene);
            verificarCargaCompleta();
        }, undefined, function(error) {
            console.log("Error en modelo: " + url, error);
            verificarCargaCompleta();
        });
    }

    // 2. Pedestales y Palliri
    cargarModeloSeguro("assets/Pedestalirineo.glb", function(est1) {
        est1.scale.set(3.5, 3.5, 3.5);
        est1.position.set(-73, 3.5, 22); 
        scene.add(est1);
    });

    cargarModeloSeguro("assets/Pedestalfederico.glb", function(est2) {
        est2.scale.set(3.5, 3.5, 3.5);
        est2.position.set(-73, 3.3, 11);  
        scene.add(est2);
    });

    cargarModeloSeguro("assets/Pedestalescobar.glb", function(est3) {
        est3.scale.set(3.5, 3.5, 3.5);
        est3.position.set(-74, 3.5, -38); 
        scene.add(est3);
    });

    cargarModeloSeguro("assets/Palliri.glb", function(est4) {
        est4.scale.set(4, 4, 4);
        est4.position.set(-71, 11, -69); 
        est4.rotation.set(0, Math.PI / 2, 0); 
        scene.add(est4);
    });
   
    cargarModeloSeguro("assets/completomina.glb", function(est6) {
        est6.scale.set(10, 10, 10);
        est6.position.set(-111.5, 19, -13); 
        est6.rotation.set(0, Math.PI / 2, 0); 
        scene.add(est6);
    });

    // 3. Postes
    cargarModeloSeguro("assets/poste.glb", function(modeloBase) {
        modeloBase.scale.set(8.5, 8.5, 8.5);

        var obj1 = modeloBase.clone(); obj1.position.set(-52, 7, 30); scene.add(obj1);
        var obj2 = modeloBase.clone(); obj2.position.set(-52, 7, -5); scene.add(obj2);
        var obj3 = modeloBase.clone(); obj3.position.set(-52, 7, -35); scene.add(obj3);
        var obj4 = modeloBase.clone(); obj4.position.set(-52, 7, -65); scene.add(obj4);
        var obj5 = modeloBase.clone(); obj5.position.set(-52, 7, -95); scene.add(obj5);
        var obj6 = modeloBase.clone(); obj6.position.set(-25, 1.4, 79); scene.add(obj6);
    });

    // 4. Bancas Verdes
    cargarModeloSeguro("assets/bancaverde.glb", function(modeloBanca) {
        modeloBanca.scale.set(11, 11, 10);
        var obj7 = modeloBanca.clone(); obj7.position.set(-77.5, 8, -60); scene.add(obj7);
    });
    
    cargarModeloSeguro("assets/pilar.glb", function(modelopilar) {
        modelopilar.scale.set(9, 12, 12);
        var pilar22 = modelopilar.clone(); pilar22.position.set(-105, 10.5, 0.5); pilar22.rotation.y = Math.PI/2; scene.add(pilar22);
        var pilar23 = modelopilar.clone(); pilar23.position.set(-116.9, 10.5, 0.5); pilar23.rotation.y = Math.PI/2; scene.add(pilar23);
    });
    
    cargarModeloSeguro("assets/pilar.glb", function(modeloPilar) {
        modeloPilar.scale.set(9, 12, 12);
        var pilar7 = modeloPilar.clone(); pilar7.position.set(-121.5, 10.5, -22); scene.add(pilar7);
        var pilar17 = modeloPilar.clone(); pilar17.position.set(-121.5, 10.5, -13); scene.add(pilar17);
        var pilar18 = modeloPilar.clone(); pilar18.position.set(-121.5, 10.5, -4); scene.add(pilar18);
        var pilar19 = modeloPilar.clone(); pilar19.position.set(-100.5, 10.5, -22); scene.add(pilar19);
        var pilar20 = modeloPilar.clone(); pilar20.position.set(-100.5, 10.5, -13); scene.add(pilar20);
        var pilar21 = modeloPilar.clone(); pilar21.position.set(-100.5, 10.5, -4); scene.add(pilar21);
    });
    
   // 5. Sillas de goma
   cargarModeloSeguro("assets/sillagoma.glb", function(modeloSilla) {
        modeloSilla.scale.set(6, 6.5, 6);

        var obj14 = modeloSilla.clone(); obj14.position.set(-61.5, 7, 23); obj14.rotation.y = Math.PI; scene.add(obj14);
        var silla2 = modeloSilla.clone(); silla2.position.set(-61.5, 7, 10); silla2.rotation.y = Math.PI; scene.add(silla2);
        var silla3 = modeloSilla.clone(); silla3.position.set(-61.5, 7, -33); silla3.rotation.y = Math.PI; scene.add(silla3);
        var silla4 = modeloSilla.clone(); silla4.position.set(-61.5, 7, -42); silla4.rotation.y = Math.PI; scene.add(silla4);
    });

    // 6. Barandas
    cargarModeloSeguro("assets/barandasplaza.glb", function(modeloBaranda) {
        var obj8 = modeloBaranda.clone(); obj8.scale.set(6, 7, 8.5); obj8.position.set(-65, 8.6, 30); obj8.rotation.set(0, Math.PI / 2, 0); scene.add(obj8);
        var obj9 = modeloBaranda.clone(); obj9.scale.set(6, 7, 8.5); obj9.position.set(-96.3, 8.6, 30); obj9.rotation.set(0, Math.PI / 2, 0); scene.add(obj9);
        var obj10 = modeloBaranda.clone(); obj10.scale.set(6, 7, 7.5); obj10.position.set(-65, 8.6, 30); scene.add(obj10);
        var obj11 = modeloBaranda.clone(); obj11.scale.set(6, 7, 6); obj11.position.set(-65, 8.6, 2); obj11.rotation.set(0, Math.PI / 2, 0); scene.add(obj11);
        var obj12 = modeloBaranda.clone(); obj12.scale.set(6, 7, 8); obj12.position.set(-87, 8.6, 1); scene.add(obj12);
        var obj13 = modeloBaranda.clone(); obj13.scale.set(6, 7, 6); obj13.position.set(-65, 8.6, -29.5); obj13.rotation.set(0, Math.PI / 2, 0); scene.add(obj13);
        var obj15 = modeloBaranda.clone(); obj15.scale.set(6, 7, 8.5); obj15.position.set(-65, 8.6, -45); obj15.rotation.set(0, Math.PI / 2, 0); scene.add(obj15);
        var obj16 = modeloBaranda.clone(); obj16.scale.set(6, 7, 8.5); obj16.position.set(-96.3, 8.6, -45); obj16.rotation.set(0, Math.PI / 2, 0); scene.add(obj16);
        var obj17 = modeloBaranda.clone(); obj17.scale.set(6, 7, 4.2); obj17.position.set(-65, 8.6, -29.5); scene.add(obj17);
    });

    cargarModeloSeguro("assets/barandasplaza.glb", function(modelobaranda) {
        var obj30 = modelobaranda.clone(); obj30.scale.set(6, 5.5, 1.6); obj30.position.set(-65, 8.6, -57); obj30.rotation.set(0, Math.PI / 2, 0); scene.add(obj30);
        var obj31 = modelobaranda.clone(); obj31.scale.set(6, 5.5, 1.5); obj31.position.set(-71, 8.6, -57); scene.add(obj31);
        var obj32 = modelobaranda.clone(); obj32.scale.set(6, 5.5, 6.3); obj32.position.set(-65, 8.6, -57); scene.add(obj32);
         var obj33 = modelobaranda.clone(); obj33.scale.set(6, 5.5, 3.5); obj33.position.set(-71, 8.6, -63); obj33.rotation.set(0, Math.PI / 2, 0); scene.add(obj33);
         var obj34 = modelobaranda.clone(); obj34.scale.set(6, 5.5, 1.5); obj34.position.set(-84, 8.6, -57); scene.add(obj34);
        var obj35 = modelobaranda.clone(); obj35.scale.set(6, 5.5, 3.5); obj35.position.set(-71, 8.6, -76); obj35.rotation.set(0, Math.PI / 2, 0); scene.add(obj35);
        var obj36 = modelobaranda.clone(); obj36.scale.set(6, 5.5, 1.5); obj36.position.set(-84, 8.6, -76); scene.add(obj36);
        var obj37 = modelobaranda.clone(); obj37.scale.set(6, 5.5, 1.6); obj37.position.set(-65, 8.6, -81); obj37.rotation.set(0, Math.PI / 2, 0); scene.add(obj37);
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