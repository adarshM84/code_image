document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('codeInput');
    const codeDisplay = document.getElementById('codeDisplay');
    const windowFrame = document.getElementById('windowFrame');
    const bgColorInput = document.getElementById('bgColor');
    const captureContainer = document.getElementById('captureContainer');
    const osButtons = document.querySelectorAll('.os-btn');
    const downloadBtn = document.getElementById('downloadBtn');

    const sidebar = document.querySelector('.sidebar');
    const dragHandle = document.getElementById('dragHandle');

    // Initial Render
    updateCode();

    // Event Listeners
    codeInput.addEventListener('input', updateCode);

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
            // Reset classes
            windowFrame.className = 'window-frame';
            // Add new class
            windowFrame.classList.add(`window-${os}`);
        });
    });

    downloadBtn.addEventListener('click', downloadImage);

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

    function updateCode() {
        // Escape HTML to prevent injection and display correctly
        const rawCode = codeInput.value;
        codeDisplay.textContent = rawCode;

        // Trigger Prism highlight
        Prism.highlightElement(codeDisplay);
    }

    function downloadImage() {
        // Use html2canvas to capture the container
        // scale: 2 for better resolution on retina displays
        html2canvas(captureContainer, {
            scale: 2,
            backgroundColor: null, // Transparent background if container has none
            useCORS: true // If we had external images
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'code-snap.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
});
