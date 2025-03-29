class BinaryLightBulbGame {
    constructor(initialBulbCount = 5) {
        this.initialBulbCount = initialBulbCount;
        this.bulbsState = [];
        this.bulbsContainer = document.getElementById('bulbsContainer');
        this.decimalDisplay = document.querySelector('.decimal-display');
        this.octalDisplay = document.querySelector('.octal-display');
        this.hexDisplay = document.querySelector('.hex-display');
        this.resetButton = document.getElementById('resetButton');
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.explanationPanel = document.getElementById('explanationPanel');
        this.binaryExplanation = document.getElementById('binaryExplanation');

        this.decimalInput = document.getElementById('decimalInput');
        this.octalInput = document.getElementById('octalInput');
        this.hexInput = document.getElementById('hexInput');

        this.initGame();
        this.addEventListeners();
        this.handleResize();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    // Initialize the game
    initGame() {
        this.bulbsState = Array(this.initialBulbCount).fill(0);
        this.renderBulbs();
        this.updateDisplays(0);
        this.updateExplanation(); // Add this line to show initial explanation
    }

    // Add this new method to hide the explanation
    hideExplanation() {
        this.explanationPanel.classList.remove('active');
        this.binaryExplanation.textContent = '';
    }

    // Add event listeners
    addEventListeners() {
        this.resetButton.addEventListener('click', () => this.initGame());
        window.addEventListener('resize', () => this.handleResize());
        
        // Prevent scrolling when touching elements inside the game
        this.bulbsContainer.addEventListener('touchmove', (e) => {
            if (e.target.closest('.bulb')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Add input event listeners
        this.decimalInput.addEventListener('input', (e) => this.handleDecimalInput(e));
        this.octalInput.addEventListener('input', (e) => this.handleOctalInput(e));
        this.hexInput.addEventListener('input', (e) => this.handleHexInput(e));
    }

    // Handle window resize
    handleResize() {
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;
        this.resizeCanvas();
        this.renderBulbs();
    }

    // Resize the canvas
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = Math.min(container.clientWidth * 0.5, 300);
        this.renderCanvas();
    }

    // Render the canvas
    renderCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Add canvas visualization here if needed
    }

    // Render bulbs with a limit for small screens
    renderBulbsWithLimit(limit) {
        this.bulbsContainer.innerHTML = '';
        
        // Focus on the most significant bits
        const startIndex = Math.max(0, this.bulbsState.length - limit);
        
        for (let i = startIndex; i < this.bulbsState.length; i++) {
            const bulb = this.createBulb(i, this.bulbsState[i]);
            this.bulbsContainer.appendChild(bulb);
        }
    }

    // Render all bulbs based on the current state
    renderBulbs() {
        this.bulbsContainer.innerHTML = '';
        this.bulbsState.forEach((value, index) => {
            const bulb = this.createBulb(index, value);
            this.bulbsContainer.appendChild(bulb);
        });
    }

    // Create a single bulb element
    createBulb(index, value) {
        const bulb = document.createElement('div');
        bulb.className = `bulb ${value === 1 ? 'bulb-on' : ''}`;
        bulb.dataset.index = index;

        const bitPosition = this.bulbsState.length - 1 - index;

        bulb.innerHTML = `
            <div class="bulb-image"></div>
            <div class="bulb-base"></div>
            <div class="bulb-value">${value}</div>
            <div class="info-bit">2<sup>${bitPosition}</sup> = ${Math.pow(2, bitPosition)}</div>
        `;

        // Add both click and touch events
        bulb.addEventListener('click', () => this.toggleBulb(index));
        
        // Add touch events for better mobile experience
        bulb.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleBulb(index);
        }, { passive: false });

        return bulb;
    }

    // Toggle a bulb's state (0/1)
    toggleBulb(index) {
        this.bulbsState[index] = this.bulbsState[index] === 0 ? 1 : 0;
        this.renderBulbs();
        this.updateDecimalDisplay();
        this.updateExplanation();
        this.checkForMaxValue();
    }

    // Update the decimal display based on the current binary value
    updateDecimalDisplay() {
        const decimalValue = this.calculateDecimalValue();
        this.updateDisplays(decimalValue);
    }

    // Add these new methods
    calculateOctalValue(decimal) {
        return decimal.toString(8);
    }

    calculateHexValue(decimal) {
        return decimal.toString(16).toUpperCase();
    }

    handleDecimalInput(e) {
        const value = e.target.value.trim();
        if (value === '') return;
        
        const decimal = parseInt(value, 10);
        if (isNaN(decimal) || decimal < 0) {
            e.target.value = this.calculateDecimalValue();
            return;
        }
        
        this.updateFromDecimal(decimal);
    }

    handleOctalInput(e) {
        const value = e.target.value.trim();
        if (value === '') return;
        
        const decimal = parseInt(value, 8);
        if (isNaN(decimal) || !/^[0-7]*$/.test(value)) {
            e.target.value = this.calculateOctalValue(this.calculateDecimalValue());
            return;
        }
        
        this.updateFromDecimal(decimal);
    }

    handleHexInput(e) {
        const value = e.target.value.trim();
        if (value === '') return;
        
        const decimal = parseInt(value, 16);
        if (isNaN(decimal) || !/^[0-9A-Fa-f]*$/.test(value)) {
            e.target.value = this.calculateHexValue(this.calculateDecimalValue());
            return;
        }
        
        this.updateFromDecimal(decimal);
    }

    updateFromDecimal(decimal) {
        // Calculate required number of bulbs
        const requiredBulbs = Math.max(this.initialBulbCount, Math.floor(Math.log2(decimal)) + 1);
        
        // Resize bulbs array if needed
        while (this.bulbsState.length < requiredBulbs) {
            this.bulbsState.unshift(0);
        }
        
        // Convert decimal to binary array
        const binary = decimal.toString(2).padStart(this.bulbsState.length, '0');
        this.bulbsState = [...binary].map(Number);
        
        // Update displays
        this.renderBulbs();
        this.updateDisplays(decimal);
        this.updateExplanation();
    }

    updateDisplays(decimal) {
        this.decimalInput.value = decimal;
        this.octalInput.value = this.calculateOctalValue(decimal);
        this.hexInput.value = this.calculateHexValue(decimal);
    }

    // Check if we've reached the maximum value possible with the current bulbs
    checkForMaxValue() {
        if (this.bulbsState.every(bit => bit === 1)) {
            this.addNewBulb();
        }
    }

    // Add a new bulb to the left (MSB position)
    addNewBulb() {
        this.bulbsState.unshift(0);
        
        if (this.isMobile && window.innerWidth < 360 && this.bulbsState.length > 6) {
            const visibleBulbs = Math.min(6, this.bulbsState.length);
            this.renderBulbsWithLimit(visibleBulbs);
        } else {
            this.renderBulbs();
        }
    }

    // Update the explanation panel
    updateExplanation() {
        const binaryValue = this.bulbsState.join('');
        const decimalValue = this.calculateDecimalValue();
        const octalValue = this.calculateOctalValue(decimalValue);
        const hexValue = this.calculateHexValue(decimalValue);

        // Calculate detailed octal steps
        let octalSteps = [];
        let octalNum = decimalValue;
        let octalResult = [];
        while (octalNum > 0) {
            octalSteps.push(`${octalNum} ÷ 8 = ${Math.floor(octalNum/8)} remainder ${octalNum % 8}`);
            octalResult.unshift(octalNum % 8);
            octalNum = Math.floor(octalNum/8);
        }

        // Calculate detailed hexadecimal steps
        let hexSteps = [];
        let hexNum = decimalValue;
        let hexResult = [];
        while (hexNum > 0) {
            const remainder = hexNum % 16;
            const hexDigit = remainder < 10 ? remainder : String.fromCharCode(55 + remainder);
            hexSteps.push(`${hexNum} ÷ 16 = ${Math.floor(hexNum/16)} remainder ${remainder} (${hexDigit})`);
            hexResult.unshift(hexDigit);
            hexNum = Math.floor(hexNum/16);
        }

        let explanation = `
            <h3>Number System Calculations</h3>
            
            <p><strong>Binary (Base-2):</strong> ${binaryValue}</p>
            
            <p><strong>Calculation to Decimal:</strong><br>
            ${this.bulbsState.map((bit, index) => {
                const power = this.bulbsState.length - 1 - index;
                return bit === 1 ? `(1 × 2<sup>${power}</sup>)` : `(0 × 2<sup>${power}</sup>)`;
            }).join(' + ')}<br>
            = ${decimalValue}</p>

            <p><strong>Decimal to Octal (Base-8):</strong><br>
            ${decimalValue === 0 ? '0' : octalSteps.join('<br>')}
            ${decimalValue !== 0 ? `<br>Reading remainders from bottom to top: ${octalResult.join('')}<sub>8</sub>` : ''}
            </p>

            <p><strong>Decimal to Hexadecimal (Base-16):</strong><br>
            ${decimalValue === 0 ? '0' : hexSteps.join('<br>')}
            ${decimalValue !== 0 ? `<br>Reading remainders from bottom to top: ${hexResult.join('')}<sub>16</sub>` : ''}
            </p>

            <p><strong>Final Values:</strong><br>
            Decimal: ${decimalValue}<sub>10</sub><br>
            Octal: ${octalValue}<sub>8</sub><br>
            Hexadecimal: ${hexValue}<sub>16</sub></p>
        `;

        this.binaryExplanation.innerHTML = explanation;
    }

    // Calculate the decimal value from the binary state
    calculateDecimalValue() {
        return this.bulbsState.reduce((acc, bit, index) => {
            const bitPosition = this.bulbsState.length - 1 - index;
            return acc + bit * Math.pow(2, bitPosition);
        }, 0);
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new BinaryLightBulbGame();
});

// hi