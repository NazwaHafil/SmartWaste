const URL = "model/";  // folder with model.json, metadata.json, weights.bin
let model, webcam, maxPredictions;
let modelLoaded = false;

// Load Teachable Machine model
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    modelLoaded = true;
    console.log("Model loaded successfully!");
    document.getElementById("status").innerText = "Model loaded! You can upload image now.";
}

loadModel();

// IMAGE UPLOAD CLASSIFICATION
document.getElementById("imageUpload").addEventListener("change", async function (event) {
    if (!modelLoaded) {
        alert("Model is still loading, please wait a few seconds!");
        return;
    }

    const img = document.getElementById("preview");
    img.src = URL.createObjectURL(event.target.files[0]);

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
