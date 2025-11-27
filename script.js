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
        // Use html2canvas to capture the container
        // scale: 2 for better resolution on retina displays
        html2canvas(captureContainer, {
            scale: 2,
            backgroundColor: null, // Transparent background if container has none
            useCORS: true // If we had external images
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = selectedOS + '-code-snap.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
});
