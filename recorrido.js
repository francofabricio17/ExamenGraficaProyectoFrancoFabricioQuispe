function iniciarEscenaTresD() {
    // 1. CONFIGURACIÓN BÁSICA DEL ESCENARIO MINERO
    const contenedor = document.getElementById('canvas-3d');
    const escena = new THREE.Scene();
    
    // Fondo oscuro industrial y niebla de profundidad
    escena.background = new THREE.Color('#0d0f12'); 
    escena.fog = new THREE.FogExp2('#0d0f12', 0.004);

    // Cámara
    const camara = new THREE.PerspectiveCamera(45, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000);

    // Renderizador
    const renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(contenedor.clientWidth, contenedor.clientHeight);
    renderizador.setPixelRatio(window.devicePixelRatio);
    renderizador.toneMapping = THREE.ACESFilmicToneMapping;
    renderizador.toneMappingExposure = 1.1;
    contenedor.appendChild(renderizador.domElement);

    // 2. ILUMINACIÓN INDUSTRIAL Y CÁLIDA (Focos de socavón y lámparas de carburo)
    const luzAmbiental = new THREE.AmbientLight(0x3a3530, 1.2);
    escena.add(luzAmbiental);

    // Luz principal cálida (simula la luz frontal de un casco minero o foco potente)
    const luzDireccional1 = new THREE.DirectionalLight(0xe0b066, 2.0); 
    luzDireccional1.position.set(30, 50, 20);
    escena.add(luzDireccional1);

    // Luz secundaria fría de contraste (da profundidad metálica)
    const luzDireccional2 = new THREE.DirectionalLight(0x567085, 0.9); 
    luzDireccional2.position.set(-30, 30, -20);
    escena.add(luzDireccional2);

    // 3. PARTÍCULAS DE POLVO / CHISPAS MINERALES EN SUSPENSIÓN
    const verticesChispas = [];
    for (let i = 0; i < 800; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 60; 
        const z = (Math.random() - 0.5) * 100; 
        verticesChispas.push(x, y, z);
    }
    const geomChispas = new THREE.BufferGeometry();
    // Compatible con Three.js r108
    geomChispas.addAttribute('position', new THREE.BufferAttribute(new Float32Array(verticesChispas), 3));
    
    const matChispas = new THREE.PointsMaterial({
        color: 0xe0a96d, // Tono fuego / mineral
        size: 0.18, 
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5
    });
    
    const puntosChispas = new THREE.Points(geomChispas, matChispas);
    escena.add(puntosChispas);

    // 4. PLATAFORMA BASE (Tono acero / escombrera)
    const altoPlataforma = 1;
    const sueloGeo = new THREE.CylinderGeometry(22, 23, altoPlataforma, 64);
    const sueloMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e252b, // Gris acero
        roughness: 0.8,
        metalness: 0.4
    });
    const plataforma = new THREE.Mesh(sueloGeo, sueloMat);
    plataforma.position.y = altoPlataforma / 2; 
    escena.add(plataforma);

    const grupoModelo = new THREE.Group();
    escena.add(grupoModelo);

    // Valores por defecto de cámara
    let radioCamara = 60; 
    let alturaCamara = 35; 
    let anguloCamara = 0;

    const objetivoMirada = new THREE.Vector3(0, altoPlataforma, 0);

    // 5. CARGA DEL MODELO REAL
    const cargador = new THREE.GLTFLoader();
    cargador.load(
        'assets/Plaza1.glb',
        function (gltf) {
            const modelo = gltf.scene;
            
            // Centrar horizontalmente
            const cajaContenedora = new THREE.Box3().setFromObject(modelo);
            const centro = new THREE.Vector3();
            cajaContenedora.getCenter(centro);
            
            modelo.position.x += (modelo.position.x - centro.x);
            modelo.position.z += (modelo.position.z - centro.z);
            modelo.position.y += (modelo.position.y - cajaContenedora.min.y) + altoPlataforma; 

            grupoModelo.add(modelo);

            // Recalculo de proporciones
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

    // 6. BUCLE DE ANIMACIÓN
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
}

// Ejecutar la función principal al cargar el script
iniciarEscenaTresD();