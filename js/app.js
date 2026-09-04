const API_URL = "http://127.0.0.1:8000";


// ============================================
// START COSMO QUERY
// ============================================

async function launchCosmo() {

    const overlay =
        document.getElementById("launchOverlay");

    const message =
        document.getElementById("launchMessage");


    if (overlay) {
        overlay.classList.add("active");
    }


    const messages = [
        "Initializing Earth observation systems...",
        "Loading multimodal intelligence...",
        "Connecting Cosmo Agent...",
        "Establishing secure analysis session...",
        "Preparing satellite workspace..."
    ];


    let index = 0;


    if (message) {

        message.textContent =
            messages[0];

        const interval =
            setInterval(() => {

                index++;

                if (index < messages.length) {

                    message.textContent =
                        messages[index];

                } else {

                    clearInterval(interval);

                }

            }, 500);
    }


    // ========================================
    // CONNECT TO PYTHON BACKEND
    // ========================================

    try {

        const response =
            await fetch(
                `${API_URL}/session`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Backend error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "COSMO SESSION CREATED:",
            data.session_id
        );


        // Save session for upload/workspace
        localStorage.setItem(
            "cosmoSessionId",
            data.session_id
        );


        localStorage.setItem(
            "backendConnected",
            "true"
        );


    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );


        // Temporary fallback
        // so frontend can still open
        const fallbackSession =
            crypto.randomUUID();


        localStorage.setItem(
            "cosmoSessionId",
            fallbackSession
        );


        localStorage.setItem(
            "backendConnected",
            "false"
        );

    }


    // ========================================
    // OPEN UPLOAD PAGE
    // ========================================

    setTimeout(() => {

        window.location.href =
            "upload.html";

    }, 2700);

}



// ============================================
// BACKEND HEALTH CHECK
// ============================================

async function checkBackend() {

    try {

        const response =
            await fetch(
                `${API_URL}/health`
            );


        if (!response.ok) {
            throw new Error("Backend offline");
        }


        const data =
            await response.json();


        console.log(
            "✓ COSMO QUERY BACKEND:",
            data.status
        );


        return true;


    } catch (error) {

        console.warn(
            "⚠ COSMO QUERY BACKEND OFFLINE"
        );


        return false;
    }

}



// ============================================
// PAGE LOAD
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "🚀 COSMO QUERY FRONTEND ONLINE"
        );


        checkBackend();

    }
);

function launchCosmo() {

    const overlay = document.getElementById("launchOverlay");

    if (!overlay) {
        window.location.href = "upload.html";
        return;
    }

    overlay.classList.add("active");

    const message = document.getElementById("launchMessage");

    const messages = [
        "Initializing Earth observation systems...",
        "Loading multimodal intelligence...",
        "Connecting Cosmo Agent...",
        "Preparing analysis workspace..."
    ];

    let index = 0;

    const interval = setInterval(() => {

        if (message) {
            message.textContent = messages[index];
        }

        index++;

        if (index >= messages.length) {
            clearInterval(interval);
        }

    }, 600);

    setTimeout(() => {
        window.location.href = "upload.html";
    }, 2800);
}