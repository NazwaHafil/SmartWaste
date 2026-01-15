const MODEL_URL = "model/"; 
let model, webcam, maxPredictions;
let modelLoaded = false;

async function loadModel() {
    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        modelLoaded = true;
        document.getElementById("status").innerText = "Model loaded! Ready to classify.";
    } catch (e) {
        document.getElementById("status").innerText = "Error loading model. Check console.";
        console.error(e);
    }
}
loadModel();

document.getElementById("imageUpload").addEventListener("change", async function (event) {
    if (!modelLoaded) return;

    const img = document.getElementById("preview");
    // Use window.URL to avoid conflict with your MODEL_URL variable
    img.src = window.URL.createObjectURL(event.target.files[0]);

    img.onload = async () => {
        const prediction = await model.predict(img);
        displayResults(prediction);
    };
});

// WEBCAM CLASSIFICATION
async function startWebcam() {
    if (!modelLoaded) {
        alert("Model is still loading, please wait a few seconds!");
        return;
    }

    webcam = new tmImage.Webcam(300, 300, true); // width, height, flip
    await webcam.setup();
    await webcam.play();

    const container = document.getElementById("webcam-container");
    container.innerHTML = "";
    container.appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();
    const prediction = await model.predict(webcam.canvas);
    displayResults(prediction);
    window.requestAnimationFrame(loop);
}

// DISPLAY RESULTS
function displayResults(prediction) {
    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    prediction.forEach(p => {
        const percentage = (p.probability * 100).toFixed(2);
        labelContainer.innerHTML +=
            `<div>${p.className}: ${percentage}%</div>`;
    });
}
