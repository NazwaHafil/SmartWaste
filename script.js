const URL = "model/";
let model, webcam;

// 1️⃣ CHECK SCRIPT LOAD
console.log("✅ script.js loaded");

// 2️⃣ LOAD MODEL
async function loadModel() {
    try {
        console.log("⏳ Loading model...");
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        console.log("✅ Model loaded");
    } catch (error) {
        console.error("❌ Model failed to load:", error);
    }
}
loadModel();

// 3️⃣ IMAGE UPLOAD
document.getElementById("imageUpload").addEventListener("change", async function (event) {
    if (!model) {
        alert("Model not loaded yet!");
        return;
    }

    const img = document.getElementById("preview");
    img.src = URL.createObjectURL(event.target.files[0]);

    img.onload = async () => {
        console.log("📷 Image loaded");
        const prediction = await model.predict(img);
        displayResults(prediction);
    };
});

// 4️⃣ DISPLAY RESULT
function displayResults(prediction) {
    console.log("📊 Prediction result:", prediction);

    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    prediction.forEach(p => {
        labelContainer.innerHTML +=
            `<div>${p.className}: ${(p.probability * 100).toFixed(2)}%</div>`;
    });
}

// 5️⃣ WEBCAM
async function startWebcam() {
    if (!model) {
        alert("Model not loaded yet!");
        return;
    }

    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();
    const prediction = await model.predict(webcam.canvas);
    displayResults(prediction);
    requestAnimationFrame(loop);
}
