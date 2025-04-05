// DOM Elements
const video = document.getElementById('camera-stream');
const select = document.getElementById('camera-select');
const refreshBtn = document.getElementById('refresh-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const captureBtn = document.getElementById('capture-btn');
const gallery = document.getElementById('gallery');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-msg');

// State variables
let currentStream = null;
let devices = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Request camera permissions
        await navigator.mediaDevices.getUserMedia({ video: true });
        await populateDevices();
    } catch (error) {
        showError('Camera access denied. Please allow camera permissions.');
    }
});

// Populate camera devices dropdown
async function populateDevices() {
    try {
        loading.classList.remove('hidden');
        devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        
        // Clear existing options
        select.innerHTML = '<option value="">Select Camera</option>';
        
        // Add device options
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Camera ${videoDevices.indexOf(device) + 1}`;
            select.appendChild(option);
        });
        
        // Auto-select first device if available
        if (videoDevices.length > 0) {
            select.value = videoDevices[0].deviceId;
            await startStream(videoDevices[0].deviceId);
        } else {
            showError('No cameras detected');
        }
        
        loading.classList.add('hidden');
        errorMsg.classList.add('hidden');
    } catch (error) {
        loading.classList.add('hidden');
        showError('Error accessing devices: ' + error.message);
    }
}

// Start video stream from selected device
async function startStream(deviceId) {
    try {
        loading.classList.remove('hidden');
        
        // Stop any existing stream
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        
        // Start new stream
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                deviceId: { exact: deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        video.srcObject = stream;
        currentStream = stream;
        
        // Show video and hide placeholder
        placeholder.classList.add('hidden');
        video.classList.remove('hidden');
        captureBtn.disabled = false;
        
        loading.classList.add('hidden');
        errorMsg.classList.add('hidden');
    } catch (error) {
        loading.classList.add('hidden');
        showError('Failed to start camera: ' + error.message);
    }
}

// Capture photo from current stream
captureBtn.addEventListener('click', () => {
    if (!currentStream) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.className = 'w-full h-auto rounded border';
    gallery.appendChild(img);
});

// Refresh button functionality
refreshBtn.addEventListener('click', async () => {
    await populateDevices();
});

// Fullscreen button functionality
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        video.requestFullscreen().catch(() => {
            alert('Fullscreen access denied');
        });
    } else {
        document.exitFullscreen();
    }
});

// Error handling function
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await populateDevices();
});
