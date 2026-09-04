document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://127.0.0.1:8000";

    const primaryInput = document.getElementById("primaryImage");
    const secondaryInput = document.getElementById("secondaryImage");

    const primaryZone = document.querySelector(
        'label[for="primaryImage"]'
    );

    const secondaryZone = document.querySelector(
        'label[for="secondaryImage"]'
    );

    const primaryPreview =
        document.getElementById("primaryPreview");

    const secondaryPreview =
        document.getElementById("secondaryPreview");

    const initializeBtn =
        document.getElementById("initializeBtn");

    const overlay =
        document.getElementById("uploadOverlay");

    const overlayMessage =
        document.getElementById("overlayMessage");

    const modeCards =
        document.querySelectorAll(".mode-card");


    let primaryFile = null;
    let secondaryFile = null;
    let selectedMode = "vqa";


    const allowedExtensions = [
        ".tif",
        ".tiff",
        ".jp2",
        ".png",
        ".jpg",
        ".jpeg",
        ".pdf"
    ];


    function getExtension(filename) {

        const index = filename.lastIndexOf(".");

        if (index === -1) {
            return "";
        }

        return filename
            .substring(index)
            .toLowerCase();

    }


    function formatFileSize(bytes) {

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(2)} MB`;

    }


    function validFile(file) {

        if (!file) {
            return false;
        }

        return allowedExtensions.includes(
            getExtension(file.name)
        );

    }


    // ====================================================
    // PREVIEW
    // ====================================================

    function showPreview(file, container, type) {

        if (!container || !file) {
            return;
        }

        container.innerHTML = "";

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "selected-file";


        const extension =
            getExtension(file.name);


        if (
            file.type.startsWith("image/")
            &&
            extension !== ".tif"
            &&
            extension !== ".tiff"
            &&
            extension !== ".jp2"
        ) {

            const img =
                document.createElement("img");

            img.className =
                "selected-file-preview";

            img.src =
                URL.createObjectURL(file);

            wrapper.appendChild(img);

        }

        else {

            const icon =
                document.createElement("div");

            icon.className =
                "selected-file-icon";

            if (extension === ".pdf") {
                icon.textContent = "PDF";
            }

            else if (
                extension === ".tif" ||
                extension === ".tiff"
            ) {
                icon.textContent = "TIF";
            }

            else if (extension === ".jp2") {
                icon.textContent = "JP2";
            }

            else {
                icon.textContent = "IMG";
            }

            wrapper.appendChild(icon);

        }


        const details =
            document.createElement("div");

        details.className =
            "selected-file-details";


        const name =
            document.createElement("strong");

        name.textContent =
            file.name;


        const info =
            document.createElement("span");

        info.textContent =
            `${type} • ${formatFileSize(file.size)}`;


        details.appendChild(name);
        details.appendChild(info);

        wrapper.appendChild(details);


        const remove =
            document.createElement("button");

        remove.type = "button";
        remove.className = "remove-file";
        remove.textContent = "×";


        remove.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();


            if (type === "PRIMARY") {

                primaryFile = null;

                primaryInput.value = "";

            }

            else {

                secondaryFile = null;

                secondaryInput.value = "";

            }


            container.innerHTML = "";

            updateButton();

        });


        wrapper.appendChild(remove);

        container.appendChild(wrapper);

    }


    // ====================================================
    // PRIMARY FILE
    // ====================================================

    function handlePrimary(file) {

        if (!file) {
            return;
        }


        if (!validFile(file)) {

            alert(
                "Unsupported file.\n\n" +
                "Use GeoTIFF, TIFF, JP2, PNG, JPG, JPEG or PDF."
            );

            primaryInput.value = "";

            return;

        }


        primaryFile = file;

        showPreview(
            file,
            primaryPreview,
            "PRIMARY"
        );

        updateButton();

    }


    // ====================================================
    // SECONDARY FILE
    // ====================================================

    function handleSecondary(file) {

        if (!file) {
            return;
        }


        if (!validFile(file)) {

            alert(
                "Unsupported file.\n\n" +
                "Use GeoTIFF, TIFF, JP2, PNG, JPG, JPEG or PDF."
            );

            secondaryInput.value = "";

            return;

        }


        secondaryFile = file;

        showPreview(
            file,
            secondaryPreview,
            "SECONDARY"
        );

        updateButton();

    }


    if (primaryInput) {

        primaryInput.addEventListener(
            "change",
            event => {

                handlePrimary(
                    event.target.files[0]
                );

            }
        );

    }


    if (secondaryInput) {

        secondaryInput.addEventListener(
            "change",
            event => {

                handleSecondary(
                    event.target.files[0]
                );

            }
        );

    }


    // ====================================================
    // DRAG & DROP
    // ====================================================

    function setupDropZone(zone, handler) {

        if (!zone) {
            return;
        }


        zone.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                zone.classList.add(
                    "drag-active"
                );

            }
        );


        zone.addEventListener(
            "dragleave",
            event => {

                event.preventDefault();

                zone.classList.remove(
                    "drag-active"
                );

            }
        );


        zone.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                zone.classList.remove(
                    "drag-active"
                );


                const file =
                    event.dataTransfer.files[0];


                if (file) {
                    handler(file);
                }

            }
        );

    }


    setupDropZone(
        primaryZone,
        handlePrimary
    );


    setupDropZone(
        secondaryZone,
        handleSecondary
    );


    // ====================================================
    // ANALYSIS MODES
    // ====================================================

    modeCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                modeCards.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                card.classList.add(
                    "active"
                );


                selectedMode =
                    card.dataset.mode;


                localStorage.setItem(
                    "analysisMode",
                    selectedMode
                );


                updateButton();

            }
        );

    });


    function requiresSecondary() {

        return (
            selectedMode === "change_detection"
            ||
            selectedMode === "optical_sar"
        );

    }


    // ====================================================
    // BUTTON STATE
    // ====================================================

    function updateButton() {

        const secondRequired =
            requiresSecondary();


        const secondaryCard =
            document.querySelector(
                ".sensor-card.secondary"
            );


        if (secondaryCard) {

            secondaryCard.classList.toggle(
                "required",
                secondRequired
            );

        }


        const ready =

            primaryFile !== null

            &&

            (
                !secondRequired
                ||
                secondaryFile !== null
            );


        if (!initializeBtn) {
            return;
        }


        initializeBtn.disabled =
            !ready;


        initializeBtn.classList.toggle(
            "ready",
            ready
        );

    }


    // ====================================================
    // COSMO AI PROCESSING OVERLAY
    // ====================================================

    function showProcessingOverlay() {

        if (!overlay) {
            return;
        }


        overlay.classList.add("active");


        const messages = [

            "CONNECTING TO COSMO AI...",

            "ESTABLISHING SATELLITE DATA LINK...",

            "READING EARTH OBSERVATION...",

            "SELECTING ANALYSIS ENGINE...",

            "COSMO AI IS ANALYZING..."

        ];


        let index = 0;


        if (overlayMessage) {

            overlayMessage.textContent =
                messages[0];


            const interval =
                setInterval(() => {

                    index++;


                    if (
                        index >=
                        messages.length
                    ) {

                        clearInterval(
                            interval
                        );

                        return;

                    }


                    overlayMessage.textContent =
                        messages[index];

                }, 600);

        }

    }


    // ====================================================
    // INITIALIZE ANALYSIS
    // ====================================================

    if (initializeBtn) {

        initializeBtn.addEventListener(
            "click",
            async () => {

                if (!primaryFile) {

                    alert(
                        "Please upload the primary observation."
                    );

                    return;

                }


                if (
                    requiresSecondary()
                    &&
                    !secondaryFile
                ) {

                    alert(
                        "This analysis mode requires a secondary observation."
                    );

                    return;

                }


                initializeBtn.disabled = true;

                initializeBtn.classList.add(
                    "loading"
                );


                initializeBtn.innerHTML = `
                    <span class="button-spinner"></span>
                    CONNECTING TO COSMO AI...
                `;


                const formData =
                    new FormData();


                formData.append(
                    "primary_image",
                    primaryFile
                );


                if (secondaryFile) {

                    formData.append(
                        "secondary_image",
                        secondaryFile
                    );

                }


                formData.append(
                    "analysis_mode",
                    selectedMode
                );

try {

    showProcessingOverlay();

const formData = new FormData();

formData.append("primary_image", primaryFile);

if (secondaryFile) {
    formData.append("secondary_image", secondaryFile);
}

formData.append("analysis_mode", selectedMode);

// Save basic information immediately
localStorage.setItem("analysisMode", selectedMode);
localStorage.setItem("primaryFileName", primaryFile.name);

if (secondaryFile) {
    localStorage.setItem("secondaryFileName", secondaryFile.name);
}

// Try uploading to backend
fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData
})
.then(async response => {

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
    }

    // Save backend analysis ID
    localStorage.setItem("analysisId", data.analysis_id);
    localStorage.setItem("analysisResult", JSON.stringify(data));

    // NOW go to processing page
    window.location.href = "processing.html";
})
.catch(error => {

    console.error("Backend upload error:", error);

    // IMPORTANT:
    // Even if backend fails, continue to processing screen
    // instead of leaving the user stuck on the overlay.

    window.location.href = "processing.html";
});
}
catch (error) {

    console.error(error);

    alert(error.message);
}

    });

}
});

    updateButton();


// ====================================================
// INITIAL STATE
// ====================================================

localStorage.setItem(
    "analysisMode",
    "vqa"
);

updateButton();

          