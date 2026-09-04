import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ============================================================
// COSMO QUERY - INTERACTIVE 3D EARTH
// ============================================================

const container = document.getElementById("earth-container");

if (!container) {
    console.error("Earth container not found.");
} else {

    // ========================================================
    // SCENE
    // ========================================================

    const scene = new THREE.Scene();


    // ========================================================
    // CAMERA
    // ========================================================

    const camera = new THREE.PerspectiveCamera(
        40,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.set(0, 0.15, 3.3);


    // ========================================================
    // RENDERER
    // ========================================================

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;

    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);


    // ========================================================
    // ORBIT CONTROLS
    // ========================================================

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    controls.enablePan = false;

    controls.enableZoom = true;

    controls.minDistance = 1.8;
    controls.maxDistance = 5.5;

    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.8;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;

    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = Math.PI - 0.45;


    // ========================================================
    // EARTH GROUP
    // ========================================================

    const earthSystem = new THREE.Group();

    scene.add(earthSystem);


    // ========================================================
    // TEXTURE LOADER
    // ========================================================

    const loader = new THREE.TextureLoader();


    // ========================================================
    // EARTH TEXTURES
    // ========================================================

    const earthTexture = loader.load(
        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
    );

    const normalTexture = loader.load(
        "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg"
    );

    const specularTexture = loader.load(
        "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"
    );

    const cloudTexture = loader.load(
        "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
    );


    // ========================================================
    // EARTH
    // ========================================================

    const earthGeometry = new THREE.SphereGeometry(
        1,
        128,
        128
    );

    const earthMaterial = new THREE.MeshPhongMaterial({

        map: earthTexture,

        normalMap: normalTexture,

        specularMap: specularTexture,

        specular: new THREE.Color(0x333333),

        shininess: 18

    });

    const earth = new THREE.Mesh(
        earthGeometry,
        earthMaterial
    );

    earthSystem.add(earth);


    // ========================================================
    // CLOUDS
    // ========================================================

    const cloudGeometry = new THREE.SphereGeometry(
        1.015,
        128,
        128
    );

    const cloudMaterial = new THREE.MeshPhongMaterial({

        map: cloudTexture,

        transparent: true,

        opacity: 0.45,

        depthWrite: false

    });

    const clouds = new THREE.Mesh(
        cloudGeometry,
        cloudMaterial
    );

    earthSystem.add(clouds);


    // ========================================================
    // ATMOSPHERE
    // ========================================================

    const atmosphereGeometry = new THREE.SphereGeometry(
        1.08,
        128,
        128
    );

    const atmosphereMaterial = new THREE.MeshBasicMaterial({

        color: 0x1685ff,

        transparent: true,

        opacity: 0.18,

        side: THREE.BackSide,

        blending: THREE.AdditiveBlending

    });

    const atmosphere = new THREE.Mesh(
        atmosphereGeometry,
        atmosphereMaterial
    );

    earthSystem.add(atmosphere);


    // ========================================================
    // OUTER GLOW
    // ========================================================

    const glowGeometry = new THREE.SphereGeometry(
        1.15,
        128,
        128
    );

    const glowMaterial = new THREE.MeshBasicMaterial({

        color: 0x0066ff,

        transparent: true,

        opacity: 0.055,

        side: THREE.BackSide,

        blending: THREE.AdditiveBlending

    });

    const glow = new THREE.Mesh(
        glowGeometry,
        glowMaterial
    );

    earthSystem.add(glow);


    // ========================================================
    // LIGHTING
    // ========================================================

    const ambientLight = new THREE.AmbientLight(
        0x6688cc,
        0.35
    );

    scene.add(ambientLight);


    const sun = new THREE.DirectionalLight(
        0xffffff,
        3.5
    );

    sun.position.set(5, 2, 5);

    scene.add(sun);


    const blueFill = new THREE.DirectionalLight(
        0x287cff,
        0.7
    );

    blueFill.position.set(-4, 1, -4);

    scene.add(blueFill);


    // ========================================================
    // STAR FIELD
    // ========================================================

    const starGeometry = new THREE.BufferGeometry();

    const starCount = 6000;

    const starPositions = new Float32Array(
        starCount * 3
    );

    for (let i = 0; i < starCount; i++) {

        const radius =
            7 + Math.random() * 15;

        const theta =
            Math.random() * Math.PI * 2;

        const phi =
            Math.acos(2 * Math.random() - 1);

        starPositions[i * 3] =
            radius *
            Math.sin(phi) *
            Math.cos(theta);

        starPositions[i * 3 + 1] =
            radius *
            Math.cos(phi);

        starPositions[i * 3 + 2] =
            radius *
            Math.sin(phi) *
            Math.sin(theta);
    }

    starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            starPositions,
            3
        )
    );

    const starMaterial = new THREE.PointsMaterial({

        color: 0xffffff,

        size: 0.018,

        transparent: true,

        opacity: 0.85

    });

    const stars = new THREE.Points(
        starGeometry,
        starMaterial
    );

    scene.add(stars);


    // ========================================================
    // SATELLITE ORBIT
    // ========================================================

    const satelliteOrbit = new THREE.Group();

    earthSystem.add(satelliteOrbit);

    satelliteOrbit.rotation.z =
        THREE.MathUtils.degToRad(28);

    satelliteOrbit.rotation.x =
        THREE.MathUtils.degToRad(12);


    // ========================================================
    // ORBIT PATH
    // ========================================================

    const orbitCurve = new THREE.EllipseCurve(
        0,
        0,
        1.48,
        1.48,
        0,
        Math.PI * 2,
        false,
        0
    );

    const orbitPoints =
        orbitCurve.getPoints(128);

    const orbitVectorPoints =
        orbitPoints.map(
            point =>
                new THREE.Vector3(
                    point.x,
                    0,
                    point.y
                )
        );

    const orbitGeometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                orbitVectorPoints
            );

    const orbitMaterial =
        new THREE.LineBasicMaterial({

            color: 0x38bdf8,

            transparent: true,

            opacity: 0.28

        });

    const orbitLine =
        new THREE.LineLoop(
            orbitGeometry,
            orbitMaterial
        );

    satelliteOrbit.add(orbitLine);


    // ========================================================
    // SATELLITE
    // ========================================================

    const satellite = new THREE.Group();

    satelliteOrbit.add(satellite);


    // ========================================================
    // SATELLITE BODY
    // ========================================================

    const bodyGeometry =
        new THREE.BoxGeometry(
            0.13,
            0.09,
            0.2
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xc8d3df,

            metalness: 0.75,

            roughness: 0.3

        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    satellite.add(body);


    // ========================================================
    // SOLAR PANELS
    // ========================================================

    const panelGeometry =
        new THREE.BoxGeometry(
            0.42,
            0.025,
            0.18
        );

    const panelMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x164b91,

            metalness: 0.45,

            roughness: 0.35

        });

    const leftPanel =
        new THREE.Mesh(
            panelGeometry,
            panelMaterial
        );

    leftPanel.position.x = -0.28;

    satellite.add(leftPanel);


    const rightPanel =
        new THREE.Mesh(
            panelGeometry,
            panelMaterial
        );

    rightPanel.position.x = 0.28;

    satellite.add(rightPanel);


    // ========================================================
    // ANTENNA
    // ========================================================

    const antennaGeometry =
        new THREE.CylinderGeometry(
            0.012,
            0.012,
            0.25,
            12
        );

    const antennaMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xdce6f2,

            metalness: 0.8,

            roughness: 0.2

        });

    const antenna =
        new THREE.Mesh(
            antennaGeometry,
            antennaMaterial
        );

    antenna.rotation.z =
        Math.PI / 2;

    antenna.position.y =
        0.12;

    satellite.add(antenna);


    // ========================================================
    // SATELLITE LIGHT
    // ========================================================

    const satelliteLight =
        new THREE.PointLight(
            0x38bdf8,
            1.5,
            0.8
        );

    satellite.add(satelliteLight);


    // ========================================================
    // INITIAL SATELLITE POSITION
    // ========================================================

    satellite.position.set(
        1.48,
        0,
        0
    );


    // ========================================================
    // SATELLITE BEAM
    // ========================================================

    const beamGeometry =
        new THREE.ConeGeometry(
            0.055,
            0.35,
            24,
            1,
            true
        );

    const beamMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x38bdf8,

            transparent: true,

            opacity: 0.16,

            side: THREE.DoubleSide

        });

    const beam =
        new THREE.Mesh(
            beamGeometry,
            beamMaterial
        );

    beam.rotation.z =
        Math.PI;

    beam.position.y =
        -0.2;

    satellite.add(beam);


    // ========================================================
    // INTERACTION
    // ========================================================

    let userIsInteracting = false;

    controls.addEventListener(
        "start",
        () => {

            userIsInteracting = true;

            controls.autoRotate = false;

        }
    );

    controls.addEventListener(
        "end",
        () => {

            userIsInteracting = false;

            setTimeout(
                () => {

                    if (!userIsInteracting) {

                        controls.autoRotate = true;

                    }

                },
                1200
            );

        }
    );


    // ========================================================
    // RESIZE
    // ========================================================

    function resize() {

        const width =
            container.clientWidth;

        const height =
            container.clientHeight;

        if (width === 0 || height === 0) {
            return;
        }

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height
        );
    }

    window.addEventListener(
        "resize",
        resize
    );

    resize();


    // ========================================================
    // ANIMATION
    // ========================================================

    const clock =
        new THREE.Clock();

    function animate() {

        requestAnimationFrame(animate);

        const elapsed =
            clock.getElapsedTime();


        // Clouds
        clouds.rotation.y += 0.0007;


        // Atmosphere
        atmosphere.rotation.y += 0.00015;


        // Glow
        glow.rotation.y -= 0.0001;


        // Satellite orbit
        satelliteOrbit.rotation.y =
            elapsed * 0.35;


        // Satellite rotation
        satellite.rotation.y =
            elapsed * 1.2;

        satellite.rotation.z =
            Math.sin(
                elapsed * 1.5
            ) * 0.15;


        // Stars
        stars.rotation.y += 0.00004;


        // Atmosphere pulse
        atmosphere.material.opacity =
            0.16 +
            Math.sin(
                elapsed * 1.2
            ) * 0.025;


        // Controls
        controls.update();


        // Render
        renderer.render(
            scene,
            camera
        );
    }

    animate();

}