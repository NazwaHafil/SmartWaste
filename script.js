const MODEL_URL = "./model/"; 
let model, webcam, maxPredictions;
let modelLoaded = false;

// Load the model
async function loadModel() {
    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        // This is where tmImage is used
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        modelLoaded = true;
        
        document.getElementById("status").innerText = "Model loaded! Ready to classify.";
        console.log("Model loaded successfully");
    } catch (e) {
        document.getElementById("status").innerText = "Error loading model: " + e.message;
        console.error(e);
    }
}

// Start loading when the window opens
window.onload = loadModel;

// IMAGE UPLOAD
document.getElementById("imageUpload").addEventListener("change", async function (event) {
    if (!modelLoaded) return;

    const img = document.getElementById("preview");
    img.style.display = "block";
    img.src = window.URL.createObjectURL(event.target.files[0]);

    img.onload = async () => {
        const prediction = await model.predict(img);
        displayResults(prediction);
    };
});

// WEBCAM (This must be a global function for onclick to see it)
async function startWebcam() {
    if (!modelLoaded) {
        alert("AI is still loading, please wait!");
        return;
    }

    try {
        webcam = new tmImage.Webcam(300, 300, true); 
        await webcam.setup({ facingMode: "environment" }); 
        await webcam.play();

        const container = document.getElementById("webcam-container");
        container.innerHTML = "";
        container.appendChild(webcam.canvas);

        window.requestAnimationFrame(loop);
    } catch (err) {
        alert("Webcam error: " + err.message);
    }
}

async function loop() {
    if (webcam) {
        webcam.update();
        const prediction = await model.predict(webcam.canvas);
        displayResults(prediction);
        window.requestAnimationFrame(loop);
    }
}

function displayResults(prediction) {
    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    prediction.forEach(p => {
        const percentage = (p.probability * 100).toFixed(2);
        if (percentage > 5) {
            const res = document.createElement("div");
            res.innerHTML = `${p.className}: ${percentage}%`;
            labelContainer.appendChild(res);
        }
    });
}
