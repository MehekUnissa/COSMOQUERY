const session =
    JSON.parse(
        localStorage.getItem("cosmoSession") || "{}"
    );


const missionCode =
    document.getElementById("missionCode");

const opticalName =
    document.getElementById("opticalName");

const sarName =
    document.getElementById("sarName");

const modality =
    document.getElementById("modality");

const viewerFilename =
    document.getElementById("viewerFilename");

const questionInput =
    document.getElementById("questionInput");

const sendQuestion =
    document.getElementById("sendQuestion");

const chatMessages =
    document.getElementById("chatMessages");

const agentState =
    document.getElementById("agentState");


missionCode.textContent =
    session.missionId || "SQ-001";


opticalName.textContent =
    session.opticalFile || "No file";


sarName.textContent =
    session.sarFile || "Not loaded";


if (
    session.opticalFile &&
    session.sarFile
) {
    modality.textContent =
        "OPTICAL + SAR";
} else if (session.sarFile) {
    modality.textContent =
        "SAR";
} else {
    modality.textContent =
        "OPTICAL";
}


viewerFilename.textContent =
    session.opticalFile ||
    session.sarFile ||
    "ANALYSIS IMAGE";


function addMessage(
    type,
    text
) {

    const message =
        document.createElement("div");

    message.className =
        `chat-message ${type}`;


    const label =
        document.createElement("div");

    label.className =
        "message-label";

    label.textContent =
        type === "user"
            ? "YOU"
            : "COSMO AGENT";


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        text;


    message.appendChild(label);
    message.appendChild(paragraph);

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function simulateAgent(
    question
) {

    agentState.textContent =
        "PROCESSING";


    addMessage(
        "user",
        question
    );


    setTimeout(() => {

        agentState.textContent =
            "SELECTING MODULE";

    }, 500);


    setTimeout(() => {

        let answer =
            "I have analyzed the available mission context. ";

        if (
            question.toLowerCase()
                .includes("change")
        ) {

            answer +=
                "The query appears to require temporal change detection. The Change Detection specialist would compare the available observations and return highlighted regions with confidence.";

        } else if (
            question.toLowerCase()
                .includes("object")
        ) {

            answer +=
                "The query appears suitable for visual question answering. The VQA specialist would inspect the image and identify relevant objects.";

        } else if (
            question.toLowerCase()
                .includes("region") ||
            question.toLowerCase()
                .includes("where")
        ) {

            answer +=
                "The query requires text-guided grounding. The Grounding specialist would locate the relevant region in the imagery.";

        } else {

            answer +=
                "The Cosmo Agent would route this request to the most suitable remote-sensing specialist and return visual evidence alongside the response.";
        }


        addMessage(
            "agent",
            answer
        );


        agentState.textContent =
            "READY";

    }, 1400);
}


sendQuestion.addEventListener(
    "click",
    () => {

        const question =
            questionInput.value.trim();

        if (!question) return;

        questionInput.value = "";

        simulateAgent(question);
    }
);


questionInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendQuestion.click();
        }
    }
);


// Suggested questions

document.querySelectorAll(
    ".suggested-questions button"
)
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            questionInput.value =
                button.textContent.trim();

            questionInput.focus();
        }
    );
});


// Zoom

let zoom = 100;

const zoomValue =
    document.getElementById("zoomValue");


function updateZoom() {

    zoomValue.textContent =
        `${zoom}%`;

    const earth =
        document.querySelector(
            ".satellite-placeholder"
        );

    earth.style.transform =
        `scale(${zoom / 100})`;
}


document.getElementById("zoomIn")
.addEventListener(
    "click",
    () => {

        zoom =
            Math.min(
                200,
                zoom + 10
            );

        updateZoom();
    }
);


document.getElementById("zoomOut")
.addEventListener(
    "click",
    () => {

        zoom =
            Math.max(
                50,
                zoom - 10
            );

        updateZoom();
    }
);


document.getElementById("resetZoom")
.addEventListener(
    "click",
    () => {

        zoom = 100;

        updateZoom();
    }
);


// Viewer controls

document.getElementById("highlightBtn")
.addEventListener(
    "click",
    () => {

        alert(
            "Grounding overlay activated. Backend visual evidence will appear here."
        );
    }
);


document.getElementById("compareBtn")
.addEventListener(
    "click",
    () => {

        if (
            !session.sarFile
        ) {

            alert(
                "Add a second image or SAR observation to enable comparison."
            );

            return;
        }

        alert(
            "Multimodal comparison mode activated."
        );
    }
);


document.getElementById(
    "hideOverlayBtn"
)
.addEventListener(
    "click",
    () => {

        document
            .querySelector(".scan-line")
            .classList.toggle("hidden");
    }
);


// Initial query

if (session.query) {

    setTimeout(() => {

        simulateAgent(
            session.query
        );

    }, 700);
}