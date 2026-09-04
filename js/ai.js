const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // ELEMENTS
    // =========================================================

    const chatMessages =
        document.getElementById("chatMessages");

    const questionInput =
        document.getElementById("questionInput");

    const askButton =
        document.getElementById("askButton");

    const missionId =
        document.getElementById("missionId");

    const primaryName =
        document.getElementById("primaryName");

    const analysisMode =
        document.getElementById("analysisMode");

    const imageTitle =
        document.getElementById("imageTitle");


    // =========================================================
    // LOCAL STORAGE
    // =========================================================

    let analysisId =
        localStorage.getItem("analysisId");

    const primaryFileName =
        localStorage.getItem("primaryFileName") ||
        "Satellite Observation";

    const selectedMode =
        localStorage.getItem("analysisMode") ||
        "vqa";


    // =========================================================
    // DISPLAY INFORMATION
    // =========================================================

    if (primaryName) {
        primaryName.textContent =
            primaryFileName;
    }

    if (imageTitle) {
        imageTitle.textContent =
            primaryFileName;
    }

    if (analysisMode) {

        if (selectedMode === "grounding") {
            analysisMode.textContent =
                "TEXT-GUIDED GROUNDING";
        }

        else if (selectedMode === "change_detection") {
            analysisMode.textContent =
                "CHANGE DETECTION";
        }

        else if (selectedMode === "optical_sar") {
            analysisMode.textContent =
                "OPTICAL + SAR";
        }

        else {
            analysisMode.textContent =
                "VISION Q&A";
        }
    }


    // =========================================================
    // MESSAGE FUNCTION
    // =========================================================

    function addMessage(
        text,
        type = "ai"
    ) {

        if (!chatMessages) {
            return;
        }

        const message =
            document.createElement("div");

        if (type === "user") {

            message.className =
                "message user-message";

        } else {

            message.className =
                "message ai-message";
        }

        message.textContent = text;

        chatMessages.appendChild(message);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

        return message;
    }


    // =========================================================
    // LOADING
    // =========================================================

    function setLoading(loading) {

        if (askButton) {

            askButton.disabled =
                loading;

            askButton.textContent =
                loading
                    ? "ANALYZING..."
                    : "ASK COSMO AI";
        }

        if (questionInput) {

            questionInput.disabled =
                loading;
        }
    }


    // =========================================================
    // FIND ANALYSIS AUTOMATICALLY
    // =========================================================

    async function findAnalysis() {

        // -----------------------------------------------------
        // If we already have an ID, use it
        // -----------------------------------------------------

        if (analysisId) {

            try {

                const response =
                    await fetch(
                        `${API_BASE}/analysis/${analysisId}`
                    );

                if (response.ok) {

                    const data =
                        await response.json();

                    if (data.analysis_id) {

                        return data;
                    }
                }

            } catch (error) {

                console.warn(
                    "Existing analysis lookup failed:",
                    error
                );
            }
        }


        // -----------------------------------------------------
        // Otherwise find latest uploaded image
        // -----------------------------------------------------

        try {

            let url =
                `${API_BASE}/analysis/latest`;

            if (primaryFileName &&
                primaryFileName !== "Satellite Observation") {

                url +=
                    `?primary_filename=${encodeURIComponent(primaryFileName)}`;
            }


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Latest analysis lookup failed (${response.status})`
                );
            }


            const data =
                await response.json();


            if (!data.analysis_id) {

                throw new Error(
                    "Server did not return an analysis ID."
                );
            }


            analysisId =
                String(data.analysis_id);


            localStorage.setItem(
                "analysisId",
                analysisId
            );


            if (data.primary_filename) {

                localStorage.setItem(
                    "primaryFileName",
                    data.primary_filename
                );
            }


            if (data.analysis_mode) {

                localStorage.setItem(
                    "analysisMode",
                    data.analysis_mode
                );
            }


            if (missionId) {

                missionId.textContent =
                    `MISSION-${analysisId}`;
            }


            return data;

        } catch (error) {

            console.error(
                "Could not find analysis:",
                error
            );

            return null;
        }
    }


    // =========================================================
    // INITIAL MESSAGE
    // =========================================================

    if (
        chatMessages &&
        chatMessages.children.length === 0
    ) {

        addMessage(
            `COSMO AI is ready to analyze "${primaryFileName}". Ask me about buildings, roads, vegetation, water bodies, land cover, urban areas, or other visible features.`
        );
    }


    // =========================================================
    // ASK COSMO AI
    // =========================================================

    async function askAI() {

        if (!questionInput) {
            return;
        }


        const question =
            questionInput.value.trim();


        if (!question) {

            return;
        }


        // -----------------------------------------------------
        // SHOW USER QUESTION
        // -----------------------------------------------------

        addMessage(
            question,
            "user"
        );


        questionInput.value = "";


        setLoading(true);


        try {

            // =================================================
            // STEP 1 — FIND ANALYSIS
            // =================================================

            const analysis =
                await findAnalysis();


            if (!analysis) {

                throw new Error(
                    "No uploaded satellite observation was found. Please upload an image again."
                );
            }


            // Make absolutely sure ID exists

            if (!analysisId) {

                throw new Error(
                    "COSMO AI could not obtain the analysis ID."
                );
            }


            // =================================================
            // STEP 2 — SEND QUESTION + ANALYSIS ID
            // =================================================

            const response =
                await fetch(
                    `${API_BASE}/ask`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            analysis_id:
                                Number(analysisId),

                            question:
                                question

                        })
                    }
                );


            // =================================================
            // STEP 3 — READ SERVER RESPONSE
            // =================================================

            let data = {};

            try {

                data =
                    await response.json();

            } catch (_) {

                throw new Error(
                    `COSMO AI returned an invalid response (${response.status}).`
                );
            }


            // =================================================
            // SERVER ERROR
            // =================================================

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    `COSMO AI server error (${response.status})`
                );
            }


            // =================================================
            // GET ANSWER
            // =================================================

            const answer =
                data.answer ||
                data.response ||
                (
                    data.message &&
                    data.message.content
                ) ||
                data.result ||
                "";


            if (!answer.trim()) {

                throw new Error(
                    "Ollama returned no answer."
                );
            }


            // =================================================
            // SHOW AI ANSWER
            // =================================================

            addMessage(
                answer,
                "ai"
            );


            // =================================================
            // SAVE LAST RESULT
            // =================================================

            localStorage.setItem(
                "lastAIAnswer",
                answer
            );


        } catch (error) {

            console.error(
                "COSMO AI ERROR:",
                error
            );


            addMessage(
                "COSMO AI ERROR:\n\n" +
                error.message,
                "ai"
            );

        } finally {

            setLoading(false);

            if (questionInput) {
                questionInput.focus();
            }
        }
    }


    // =========================================================
    // ASK BUTTON
    // =========================================================

    if (askButton) {

        askButton.addEventListener(
            "click",
            askAI
        );
    }


    // =========================================================
    // ENTER KEY
    // =========================================================

    if (questionInput) {

        questionInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    askAI();
                }
            }
        );
    }


    // =========================================================
    // SUGGESTION BUTTONS
    // =========================================================

    document
        .querySelectorAll(".suggestions button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (!questionInput) {
                        return;
                    }

                    questionInput.value =
                        button.dataset.question ||
                        button.textContent.trim();

                    questionInput.focus();
                }
            );
        });


    // =========================================================
    // INITIAL MISSION DISPLAY
    // =========================================================

    if (missionId) {

        missionId.textContent =
            analysisId
                ? `MISSION-${analysisId}`
                : "COSMO-AI";
    }


    // =========================================================
    // AUTOMATICALLY RECOVER ANALYSIS
    // =========================================================

    findAnalysis()
        .then((analysis) => {

            if (analysis) {

                console.log(
                    "COSMO AI ANALYSIS READY:",
                    analysis.analysis_id
                );

                if (missionId) {

                    missionId.textContent =
                        `MISSION-${analysis.analysis_id}`;
                }
            }

        })
        .catch((error) => {

            console.warn(
                "Analysis recovery warning:",
                error
            );
        });

});