document.addEventListener("DOMContentLoaded", () => {

    const message = document.getElementById("overlayMessage");

    if (message) {
        message.textContent = "COSMO AI IS ANALYZING...";
    }

    // Wait 3.5 seconds, then open the AI page
    setTimeout(() => {
        window.location.href = "ai.html";
    }, 3500);

});