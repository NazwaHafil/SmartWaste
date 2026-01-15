const MODEL_URL = "./model/"; 
let model, webcam, maxPredictions;
let modelLoaded = false;

// 1. Load Model
async function loadModel() {
    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        modelLoaded = true;
        document.getElementById("status").innerText = "Model loaded! Ready to classify.";
    } catch (e) {
        document.getElementById("status").innerText = "Error loading model. Check folder names/paths.";
        console.error(e);
    }
}
loadModel();

// 2. Image Upload (Fixed window.URL conflict)
document.getElementById("imageUpload").addEventListener("change", async function (event) {
    if (!modelLoaded) return;

    const img = document.getElementById("preview");
    // FIXED LINE BELOW: Added window.
    img.src = window.URL.createObjectURL(event.target.files[0]);

    img.onload = async () => {
        const prediction = await model.predict(img);
        displayResults(prediction);
    };
});

// 3. Webcam Setup (Added mobile support)
async function startWebcam() {
    if (!modelLoaded) {
        alert("Model is still loading!");
        return;
    }

    const flip = true; 
    webcam = new tmImage.Webcam(300, 300, flip); 

    try {
        // FIXED LINE BELOW: Added facingMode for mobile back-camera support
        await webcam.setup({ facingMode: "environment" }); 
        await webcam.play();

        const container = document.getElementById("webcam-container");
        container.innerHTML = "";
        container.appendChild(webcam.canvas);

        window.requestAnimationFrame(loop);
    } catch (err) {
        console.error("Webcam error:", err);
        alert("Webcam failed. Make sure you granted camera permissions.");
    }
}

async function loop() {
    webcam.update();
    const prediction = await model.predict(webcam.canvas);
    displayResults(prediction);
    window.requestAnimationFrame(loop);
}

// 4. Display Results
function displayResults(prediction) {
    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    prediction.forEach(p => {
        const percentage = (p.probability * 100).toFixed(2);
        // Only show if probability is high (optional improvement)
        if (percentage > 10) { 
            labelContainer.innerHTML += `<div>${p.className}: ${percentage}%</div>`;
        }
    });
}
