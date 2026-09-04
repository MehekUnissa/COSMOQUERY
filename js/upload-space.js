import * as THREE from "three";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";


/* =========================================================
   COSMO QUERY
   UPLOAD PAGE — 3D SPACE BACKGROUND
   ========================================================= */

const canvas =
    document.getElementById(
        "upload-space-canvas"
    );

const container =
    document.getElementById(
        "upload-space-background"
    );


if (!canvas || !container) {

    console.warn(
        "COSMO QUERY: 3D background container not found."
    );

} else {


    /* =====================================================
       SCENE
    ===================================================== */

    const scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x01040b
        );


    /* =====================================================
       CAMERA
    ===================================================== */

    const camera =
        new THREE.PerspectiveCamera(
            38,
            window.innerWidth /
                window.innerHeight,
            0.1,
            1000
        );


    camera.position.set(
        0,
        0,
        4.8
    );


    /* =====================================================
       RENDERER
    ===================================================== */

    const renderer =
        new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    /* =====================================================
       CONTROLS
       Very subtle movement only
    ===================================================== */

    const controls =
        new OrbitControls(
            camera,
            renderer.domElement
        );


    controls.enableDamping = true;

    controls.enablePan = false;

    controls.enableZoom = false;

    controls.autoRotate = true;

    controls.autoRotateSpeed = 0.25;

    controls.enableRotate = true;

    controls.minPolarAngle =
        Math.PI * 0.36;

    controls.maxPolarAngle =
        Math.PI * 0.64;


    /* =====================================================
       LIGHTING
    ===================================================== */

    const ambientLight =
        new THREE.AmbientLight(
            0x6e8cff,
            0.45
        );

    scene.add(
        ambientLight
    );


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            2.2
        );


    sun.position.set(
        -4,
        2,
        5
    );


    scene.add(
        sun
    );


    const blueLight =
        new THREE.PointLight(
            0x168fff,
            2.0,
            8
        );


    blueLight.position.set(
        -3,
        -1,
        3
    );


    scene.add(
        blueLight
    );


    /* =====================================================
       EARTH
    ===================================================== */

    const earthGroup =
        new THREE.Group();


    scene.add(
        earthGroup
    );


    const textureLoader =
        new THREE.TextureLoader();


    /*
     * These are the same Earth texture sources
     * used by the existing Earth implementation.
     */

    const earthTexture =
        textureLoader.load(
            "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
        );


    const normalTexture =
        textureLoader.load(
            "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg"
        );


    const specularTexture =
        textureLoader.load(
            "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"
        );


    /* =====================================================
       EARTH MESH
    ===================================================== */

    const earthGeometry =
        new THREE.SphereGeometry(
            1.35,
            96,
            96
        );


    const earthMaterial =
        new THREE.MeshPhongMaterial({

            map:
                earthTexture,

            normalMap:
                normalTexture,

            specularMap:
                specularTexture,

            specular:
                new THREE.Color(
                    0x3b6fa8
                ),

            shininess:
                12

        });


    const earth =
        new THREE.Mesh(
            earthGeometry,
            earthMaterial
        );


    earthGroup.add(
        earth
    );


    /* =====================================================
       CLOUDS
    ===================================================== */

    const cloudTexture =
        textureLoader.load(
            "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
        );


    const cloudGeometry =
        new THREE.SphereGeometry(
            1.375,
            96,
            96
        );


    const cloudMaterial =
        new THREE.MeshPhongMaterial({

            map:
                cloudTexture,

            transparent:
                true,

            opacity:
                0.42,

            depthWrite:
                false

        });


    const clouds =
        new THREE.Mesh(
            cloudGeometry,
            cloudMaterial
        );


    earthGroup.add(
        clouds
    );


    /* =====================================================
       ATMOSPHERE
    ===================================================== */

    const atmosphereGeometry =
        new THREE.SphereGeometry(
            1.48,
            96,
            96
        );


    const atmosphereMaterial =
        new THREE.MeshBasicMaterial({

            color:
                0x168fff,

            transparent:
                true,

            opacity:
                0.09,

            side:
                THREE.BackSide

        });


    const atmosphere =
        new THREE.Mesh(
            atmosphereGeometry,
            atmosphereMaterial
        );


    earthGroup.add(
        atmosphere
    );


    /* =====================================================
       GLOW
    ===================================================== */

    const glowGeometry =
        new THREE.SphereGeometry(
            1.55,
            64,
            64
        );


    const glowMaterial =
        new THREE.MeshBasicMaterial({

            color:
                0x147bff,

            transparent:
                true,

            opacity:
                0.035,

            side:
                THREE.BackSide

        });


    const glow =
        new THREE.Mesh(
            glowGeometry,
            glowMaterial
        );


    earthGroup.add(
        glow
    );


    /* =====================================================
       STAR FIELD
    ===================================================== */

    const starCount =
        5000;


    const starPositions =
        new Float32Array(
            starCount * 3
        );


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        const radius =
            12 +
            Math.random() * 25;


        const theta =
            Math.random() *
            Math.PI * 2;


        const phi =
            Math.acos(
                2 *
                Math.random() -
                1
            );


        starPositions[
            i * 3
        ] =
            radius *
            Math.sin(phi) *
            Math.cos(theta);


        starPositions[
            i * 3 + 1
        ] =
            radius *
            Math.sin(phi) *
            Math.sin(theta);


        starPositions[
            i * 3 + 2
        ] =
            radius *
            Math.cos(phi);

    }


    const starGeometry =
        new THREE.BufferGeometry();


    starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            starPositions,
            3
        )
    );


    const starMaterial =
        new THREE.PointsMaterial({

            color:
                0xb9dcff,

            size:
                0.018,

            transparent:
                true,

            opacity:
                0.65,

            sizeAttenuation:
                true

        });


    const stars =
        new THREE.Points(
            starGeometry,
            starMaterial
        );


    scene.add(
        stars
    );


    /* =====================================================
       ORBIT RING
    ===================================================== */

    const orbitCurve =
        new THREE.EllipseCurve(

            0,
            0,

            2.05,
            2.05,

            0,
            Math.PI * 2,

            false,
            0

        );


    const orbitPoints =
        orbitCurve
            .getPoints(180)
            .map(
                point =>
                    new THREE.Vector3(
                        point.x,
                        point.y * 0.42,
                        point.x * 0.08
                    )
            );


    const orbitGeometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                orbitPoints
            );


    const orbitMaterial =
        new THREE.LineBasicMaterial({

            color:
                0x1c9fff,

            transparent:
                true,

            opacity:
                0.22

        });


    const orbit =
        new THREE.Line(
            orbitGeometry,
            orbitMaterial
        );


    orbit.rotation.x =
        THREE.MathUtils.degToRad(
            58
        );


    orbit.rotation.z =
        THREE.MathUtils.degToRad(
            -18
        );


    earthGroup.add(
        orbit
    );


    /* =====================================================
       SATELLITE
    ===================================================== */

    const satellite =
        new THREE.Group();


    const satelliteBody =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.11,
                0.11,
                0.22
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0xdbeaff,

                metalness:
                    0.8,

                roughness:
                    0.25

            })

        );


    satellite.add(
        satelliteBody
    );


    /* Solar panels */

    const panelMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x123c70,

            metalness:
                0.35,

            roughness:
                0.35

        });


    const panelGeometry =
        new THREE.BoxGeometry(
            0.32,
            0.015,
            0.15
        );


    const panelLeft =
        new THREE.Mesh(
            panelGeometry,
            panelMaterial
        );


    panelLeft.position.x =
        -0.24;


    satellite.add(
        panelLeft
    );


    const panelRight =
        new THREE.Mesh(
            panelGeometry,
            panelMaterial
        );


    panelRight.position.x =
        0.24;


    satellite.add(
        panelRight
    );


    /* Antenna */

    const antenna =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.008,
                0.008,
                0.22,
                8
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x8fe9ff
            })

        );


    antenna.rotation.z =
        Math.PI / 2;


    antenna.position.z =
        0.13;


    satellite.add(
        antenna
    );


    /* =====================================================
       SATELLITE ORBIT SYSTEM
    ===================================================== */

    const satelliteOrbit =
        new THREE.Group();


    satelliteOrbit.rotation.x =
        THREE.MathUtils.degToRad(
            62
        );


    satelliteOrbit.rotation.z =
        THREE.MathUtils.degToRad(
            -20
        );


    earthGroup.add(
        satelliteOrbit
    );


    satellite.position.set(
        2.05,
        0,
        0
    );


    satelliteOrbit.add(
        satellite
    );


    /* =====================================================
       EARTH POSITION
    ===================================================== */

    earthGroup.position.set(
        0.85,
        -0.15,
        0
    );


    earthGroup.rotation.z =
        THREE.MathUtils.degToRad(
            -8
        );


    /* =====================================================
       RESPONSIVE SCALE
    ===================================================== */

    function updateLayout() {

        const width =
            window.innerWidth;


        if (width < 700) {

            earthGroup.position.x =
                0;

            earthGroup.position.y =
                0.2;

            earthGroup.scale.setScalar(
                0.72
            );

            camera.position.z =
                5.2;

        } else if (width < 1100) {

            earthGroup.position.x =
                0.35;

            earthGroup.position.y =
                0;

            earthGroup.scale.setScalar(
                0.82
            );

            camera.position.z =
                5.0;

        } else {

            earthGroup.position.x =
                0.85;

            earthGroup.position.y =
                -0.15;

            earthGroup.scale.setScalar(
                1
            );

            camera.position.z =
                4.8;

        }

    }


    updateLayout();


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            camera.aspect =
                window.innerWidth /
                window.innerHeight;


            camera.updateProjectionMatrix();


            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );


            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio,
                    2
                )
            );


            updateLayout();

        }
    );


    /* =====================================================
       ANIMATION
    ===================================================== */

    const clock =
        new THREE.Clock();


    function animate() {

        requestAnimationFrame(
            animate
        );


        const elapsed =
            clock.getElapsedTime();


        /*
         * Slow independent Earth rotation
         */

        earth.rotation.y =
            elapsed * 0.035;


        /*
         * Clouds move slightly faster.
         */

        clouds.rotation.y =
            elapsed * 0.047;


        /*
         * Satellite orbit.
         */

        satelliteOrbit.rotation.y =
            elapsed * 0.16;


        /*
         * Tiny satellite attitude movement.
         */

        satellite.rotation.z =
            Math.sin(
                elapsed * 1.5
            ) * 0.08;


        /*
         * Stars slowly drift.
         */

        stars.rotation.y =
            elapsed * 0.003;


        controls.update();


        renderer.render(
            scene,
            camera
        );

    }


    animate();

}