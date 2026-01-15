const URL = "model/";
let model, webcam, maxPredictions;

// Load Teachable Machine model
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

loadModel();

// IMAGE UPLOAD CLASSIFICATION
document.getElementById("imageUpload").addEventListener("change", async function (event) {
    const img = document.getElementById("preview");
    img.src = URL.createObjectURL(event.target.files[0]);

    img.onload = async () => {
        const prediction = await model.predict(img);
        displayResults(prediction);
    };
});

model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
);


// WEBCAM CLASSIFICATION
async function startWebcam() {
    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);

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

