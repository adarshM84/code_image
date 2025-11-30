document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('codeInput');
    const titleInput = document.getElementById('titleInput');
    const codeDisplay = document.getElementById('codeDisplay');
    const windowFrame = document.getElementById('windowFrame');
    const bgColorInput = document.getElementById('bgColor');
    const captureContainer = document.getElementById('captureContainer');
    const osButtons = document.querySelectorAll('.os-btn');
    const downloadBtn = document.getElementById('downloadBtn');
    // const themeSelect = document.getElementById('themeSelect'); // Removed
    const fontSelect = document.getElementById('fontSelect');
    const prismThemeLink = document.getElementById('prism-theme-link');
    const lineNumbersToggle = document.getElementById('lineNumbersToggle');
    const advanceBtn = document.getElementById('advanceBtn');
    const advanceOptions = document.getElementById('advanceOptions');
    const advanceArrow = document.getElementById('advanceArrow');

    let selectedOS = "mac";

    const sidebar = document.querySelector('.sidebar');
    const dragHandle = document.getElementById('dragHandle');

    // Initial Render
    updateCode();

    // Advance Options Toggle
    advanceBtn.addEventListener('click', () => {
        const isHidden = advanceOptions.style.display === 'none';
        advanceOptions.style.display = isHidden ? 'flex' : 'none';
        advanceArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // Event Listeners
    codeInput.addEventListener('input', updateCode);
    titleInput.addEventListener('input', updateWindowTitle);
    bgColorInput.addEventListener('input', (e) => {
        captureContainer.style.backgroundColor = e.target.value;
    });

    osButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            osButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            // Update window class
            const os = btn.dataset.os;
            selectedOS = os;
            // Reset classes
            windowFrame.className = 'window-frame';
            // Add new class
            windowFrame.classList.add(`window-${os}`);
        });
    });

    downloadBtn.addEventListener('click', downloadImage);

    // Theme Cards Logic
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all cards
            themeCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            card.classList.add('active');

            // Update theme
            const theme = card.dataset.theme;
            prismThemeLink.href = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/${theme}`;

            // Update background to match theme gradient
            const bgGradient = card.dataset.bg;
            if (bgGradient) {
                captureContainer.style.background = bgGradient;
            }
        });
    });

    fontSelect.addEventListener('change', (e) => {
        const font = e.target.value;
        codeDisplay.style.setProperty('font-family', font, 'important');
    });

    lineNumbersToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            codeDisplay.parentElement.classList.add('line-numbers');
        } else {
            codeDisplay.parentElement.classList.remove('line-numbers');
        }
        // Re-highlight to apply line numbers
        updateCode();
    });

    // Font Size Input
    const fontSizeInput = document.getElementById('fontSizeInput');
    fontSizeInput.addEventListener('input', (e) => {
        codeDisplay.style.fontSize = e.target.value + 'px';
    });

    // Padding Input
    const paddingInput = document.getElementById('paddingInput');
    paddingInput.addEventListener('input', (e) => {
        const padding = e.target.value + 'px';
        windowFrame.querySelector('.window-content').style.padding = padding;
    });

    // Shadow Toggle
    const shadowToggle = document.getElementById('shadowToggle');
    shadowToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            windowFrame.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
        } else {
            windowFrame.style.boxShadow = 'none';
        }
    });

    // Resizing Logic
    let isResizing = false;

    dragHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        dragHandle.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        e.preventDefault(); // Prevent text selection
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        // Calculate new width
        let newWidth = e.clientX;

        // Min/Max constraints (match CSS)
        if (newWidth < 250) newWidth = 250;
        if (newWidth > 600) newWidth = 600;

        sidebar.style.width = `${newWidth}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            dragHandle.classList.remove('resizing');
            document.body.style.cursor = 'default';
        }
    });

    function updateWindowTitle() {
        const windowTitle = document.getElementById('windowTitle');
        windowTitle.textContent = titleInput.value;
    }

    function updateCode() {
        // Escape HTML to prevent injection and display correctly
        const rawCode = codeInput.value;
        codeDisplay.textContent = rawCode;

        // Trigger Prism highlight
        Prism.highlightElement(codeDisplay);
    }

    function downloadImage() {
        // Get user-selected download options
        const downloadSizeSelect = document.getElementById('downloadSizeSelect');
        const rotationSelect = document.getElementById('rotationSelect');
        const scale = parseFloat(downloadSizeSelect.value);
        const rotation = parseInt(rotationSelect.value);

        // Use html2canvas to capture the container
        html2canvas(captureContainer, {
            scale: scale,
            backgroundColor: null, // Transparent background if container has none
            useCORS: true // If we had external images
        }).then(canvas => {
            let finalCanvas = canvas;

            // Apply rotation if needed
            if (rotation !== 0) {
                finalCanvas = rotateCanvas(canvas, rotation);
            }

            // Create download link
            const link = document.createElement('a');
            const sizeLabel = scale === 1 ? '' : `_${scale}x`;
            const rotationLabel = rotation === 0 ? '' : `_${rotation}deg`;
            link.download = `${selectedOS}-code-snap${sizeLabel}${rotationLabel}.png`;
            link.href = finalCanvas.toDataURL('image/png');
            link.click();
        });
    }

    function rotateCanvas(canvas, degrees) {
        // Create a new canvas for the rotated image
        const rotatedCanvas = document.createElement('canvas');
        const ctx = rotatedCanvas.getContext('2d');

        // For 90 or 270 degrees, swap width and height
        if (degrees === 90 || degrees === 270) {
            rotatedCanvas.width = canvas.height;
            rotatedCanvas.height = canvas.width;
        } else {
            rotatedCanvas.width = canvas.width;
            rotatedCanvas.height = canvas.height;
        }

        // Translate to center, rotate, then draw
        ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

        return rotatedCanvas;
    }
});
