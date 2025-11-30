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
        const downloadFormatSelect = document.getElementById('downloadFormatSelect');
        const downloadSizeSelect = document.getElementById('downloadSizeSelect');
        const rotationSelect = document.getElementById('rotationSelect');
        const format = downloadFormatSelect.value;
        const scale = parseFloat(downloadSizeSelect.value);
        const rotation = parseInt(rotationSelect.value);

        if (format === 'gif') {
            downloadImageAsGIF(scale, rotation);
        } else {
            downloadImageAsPNG(scale, rotation);
        }
    }

    function downloadImageAsPNG(scale, rotation) {
        // Use html2canvas to capture the container
        html2canvas(captureContainer, {
            scale: scale,
            backgroundColor: null,
            useCORS: true
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

    async function downloadImageAsGIF(scale, rotation) {
        // Show progress indicator
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating GIF...';
        downloadBtn.disabled = true;

        try {
            // Store original code
            const originalCode = codeDisplay.textContent;
            const originalOpacity = windowFrame.style.opacity;

            // Animation parameters
            const totalFrames = 25;
            const fadeFrames = 3;
            const typingFrames = 17;
            const holdFrames = 5;

            // Array to store frame images
            const frames = [];
            let gifWidth = 0;
            let gifHeight = 0;

            // Frame 1-3: Fade in window
            for (let i = 0; i < fadeFrames; i++) {
                const opacity = (i + 1) / fadeFrames;
                windowFrame.style.opacity = opacity;
                codeDisplay.textContent = '';

                const canvas = await captureFrame(scale);

                // Store dimensions from first frame
                if (i === 0) {
                    gifWidth = canvas.width;
                    gifHeight = canvas.height;
                }

                frames.push(canvas.toDataURL('image/png'));

                downloadBtn.textContent = `Generating GIF... ${Math.round((i + 1) / totalFrames * 100)}%`;
            }

            windowFrame.style.opacity = 1;

            // Frame 4-20: Typing animation
            for (let i = 0; i < typingFrames; i++) {
                const progress = (i + 1) / typingFrames;
                const charCount = Math.floor(originalCode.length * progress);
                const partialCode = originalCode.substring(0, charCount);

                codeDisplay.textContent = partialCode;
                Prism.highlightElement(codeDisplay);

                const canvas = await captureFrame(scale);
                frames.push(canvas.toDataURL('image/png'));

                downloadBtn.textContent = `Generating GIF... ${Math.round((fadeFrames + i + 1) / totalFrames * 100)}%`;
            }

            // Frame 21-25: Hold final frame
            codeDisplay.textContent = originalCode;
            Prism.highlightElement(codeDisplay);

            for (let i = 0; i < holdFrames; i++) {
                const canvas = await captureFrame(scale);
                frames.push(canvas.toDataURL('image/png'));

                downloadBtn.textContent = `Generating GIF... ${Math.round((fadeFrames + typingFrames + i + 1) / totalFrames * 100)}%`;
            }

            // Restore original state
            windowFrame.style.opacity = originalOpacity || 1;
            codeDisplay.textContent = originalCode;
            Prism.highlightElement(codeDisplay);

            // Render GIF using gifshot with proper settings
            downloadBtn.textContent = 'Encoding GIF...';

            // Create a temporary image to verify dimensions
            const testImg = new Image();
            testImg.onload = function () {
                console.log('Frame dimensions:', testImg.width, 'x', testImg.height);
                console.log('Canvas dimensions:', gifWidth, 'x', gifHeight);

                gifshot.createGIF({
                    images: frames,
                    gifWidth: testImg.width,
                    gifHeight: testImg.height,
                    interval: 0.1,
                    numFrames: frames.length,
                    frameDuration: 1,
                    numWorkers: 2
                }, function (obj) {
                    if (!obj.error) {
                        // Convert data URL to blob
                        fetch(obj.image)
                            .then(res => res.blob())
                            .then(blob => {
                                if (rotation !== 0) {
                                    rotateGIF(blob, rotation, scale).then(finalBlob => {
                                        downloadBlob(finalBlob, scale, rotation, 'gif');
                                        downloadBtn.textContent = originalText;
                                        downloadBtn.disabled = false;
                                    });
                                } else {
                                    downloadBlob(blob, scale, rotation, 'gif');
                                    downloadBtn.textContent = originalText;
                                    downloadBtn.disabled = false;
                                }
                            });
                    } else {
                        console.error('GIF creation error:', obj.error);
                        alert('Error generating GIF. Please try again.');
                        downloadBtn.textContent = originalText;
                        downloadBtn.disabled = false;
                    }
                });
            };
            testImg.src = frames[0];

        } catch (error) {
            console.error('GIF generation error:', error);
            alert('Error generating GIF. Please try again.');
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }

    async function getImageWidth(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function () {
                resolve(img.width);
            };
            img.src = dataUrl;
        });
    }

    async function getImageHeight(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function () {
                resolve(img.height);
            };
            img.src = dataUrl;
        });
    }

    async function captureFrame(scale) {
        return new Promise((resolve) => {
            html2canvas(captureContainer, {
                scale: scale,
                backgroundColor: null,
                useCORS: true
            }).then(canvas => {
                resolve(canvas);
            });
        });
    }

    async function rotateGIF(blob, rotation, scale) {
        // For GIF rotation, we need to extract frames, rotate them, and re-encode
        // This is a simplified approach - create rotated canvas from blob
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (rotation === 90 || rotation === 270) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                canvas.toBlob(function (rotatedBlob) {
                    URL.revokeObjectURL(url);
                    resolve(rotatedBlob);
                }, 'image/gif');
            };

            img.src = url;
        });
    }

    function downloadBlob(blob, scale, rotation, format) {
        const link = document.createElement('a');
        const sizeLabel = scale === 1 ? '' : `_${scale}x`;
        const rotationLabel = rotation === 0 ? '' : `_${rotation}deg`;
        link.download = `${selectedOS}-code-snap${sizeLabel}${rotationLabel}.${format}`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
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
