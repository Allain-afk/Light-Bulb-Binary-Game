// Add theme toggle functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.htmlElement = document.documentElement;
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }
    
    init() {
        // Set initial theme based on saved preference
        this.setTheme(this.currentTheme);
        
        // Add event listener to the theme toggle button
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    setTheme(theme) {
        this.htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add animation effect
        this.themeToggle.classList.add('theme-toggle-active');
        setTimeout(() => {
            this.themeToggle.classList.remove('theme-toggle-active');
        }, 300);
    }
}

class BinaryLightBulbGame {
    constructor(initialBulbCount = 5) {
        this.initialBulbCount = initialBulbCount;
        this.bulbsState = [];
        this.bulbsContainer = document.getElementById('bulbsContainer');
        this.decimalInput = document.getElementById('decimalInput');
        this.octalInput = document.getElementById('octalInput');
        this.hexInput = document.getElementById('hexInput');
        this.resetButton = document.getElementById('resetButton');
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;
        this.animating = false;

        // Explanation panel references
        this.explanationsWrapper = document.querySelector('.explanations-wrapper');
        this.binaryExplanation = document.getElementById('binaryExplanation');
        this.decimalExplanation = document.getElementById('decimalExplanation');
        this.octalExplanation = document.getElementById('octalExplanation');
        this.hexExplanation = document.getElementById('hexExplanation');

        // Initialize the game
        this.initGame();
        this.addEventListeners();
        this.handleResize();
    }

    // Initialize the game
    initGame() {
        this.bulbsState = Array(this.initialBulbCount).fill(0);
        this.renderBulbs();
        this.updateDisplays(0);
        this.updateExplanation();
    }

    // Add event listeners
    addEventListeners() {
        // Reset button
        this.resetButton.addEventListener('click', () => {
            this.addButtonClickEffect(this.resetButton);
            this.resetGame();
        });
        
        // Add bulb button
        const addBulbButton = document.getElementById('addBulbButton');
        if (addBulbButton) {
            addBulbButton.addEventListener('click', () => {
                this.addButtonClickEffect(addBulbButton);
                this.addNewBulbManually();
            });
        }
        
        // Randomize button
        const randomizeButton = document.getElementById('randomizeButton');
        if (randomizeButton) {
            randomizeButton.addEventListener('click', () => {
                this.addButtonClickEffect(randomizeButton);
                this.randomizeBulbs();
            });
        }
        
        // Window resize
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 100));
        
        // Prevent scrolling when touching elements inside the game
        this.bulbsContainer.addEventListener('touchmove', (e) => {
            if (e.target.closest('.bulb')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Add input event listeners with validation
        this.decimalInput.addEventListener('input', this.debounce((e) => this.handleDecimalInput(e), 300));
        this.octalInput.addEventListener('input', this.debounce((e) => this.handleOctalInput(e), 300));
        this.hexInput.addEventListener('input', this.debounce((e) => this.handleHexInput(e), 300));
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }
    
    // Debounce function to limit input processing
    debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    // Handle keyboard navigation
    handleKeyboardNavigation(e) {
        // Focus handling for bulbs
        if (document.activeElement.classList && document.activeElement.classList.contains('bulb')) {
            const currentIndex = parseInt(document.activeElement.dataset.index);
            
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentIndex < this.bulbsState.length - 1) {
                        const nextBulb = document.querySelector(`.bulb[data-index="${currentIndex + 1}"]`);
                        if (nextBulb) nextBulb.focus();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        const prevBulb = document.querySelector(`.bulb[data-index="${currentIndex - 1}"]`);
                        if (prevBulb) prevBulb.focus();
                    }
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.toggleBulb(currentIndex);
                    break;
            }
        } else if (e.key === 'Tab' && !e.shiftKey) {
            // When tabbing into the bulbs container, focus the first bulb
            if (e.target === this.hexInput) {
                e.preventDefault();
                const firstBulb = document.querySelector('.bulb[data-index="0"]');
                if (firstBulb) firstBulb.focus();
            }
        }
    }

    // Handle window resize
    handleResize() {
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;
        this.renderBulbs();
        this.checkScrollable();
    }

    // Check if bulbs container is scrollable
    checkScrollable() {
        const bulbsWrapper = document.querySelector('.bulbs-wrapper');
        if (!bulbsWrapper) return;
        
        // After rendering bulbs, check if the container is scrollable
        setTimeout(() => {
            const container = bulbsWrapper.querySelector('.bulbs-container');
            if (container && container.scrollWidth > bulbsWrapper.clientWidth) {
                bulbsWrapper.classList.add('scrollable');
            } else {
                bulbsWrapper.classList.remove('scrollable');
            }
        }, 100);
    }

    // Create a visual click effect for buttons
    addButtonClickEffect(button) {
        button.classList.add('button-clicked');
        setTimeout(() => button.classList.remove('button-clicked'), 200);
    }
    
    // Reset the game with animation
    resetGame() {
        if (this.animating) return;
        this.animating = true;
        
        // Add a reset animation to bulbs
        const bulbs = document.querySelectorAll('.bulb');
        bulbs.forEach((bulb, i) => {
            setTimeout(() => {
                bulb.classList.add('reset-animation');
                setTimeout(() => bulb.classList.remove('reset-animation'), 300);
            }, i * 50);
        });
        
        // Reset after animation completes
        setTimeout(() => {
            this.initGame();
            this.animating = false;
        }, bulbs.length * 50 + 300);
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
        // Save focused bulb index if any
        let focusedIndex = -1;
        const focusedBulb = document.activeElement;
        if (focusedBulb && focusedBulb.classList.contains('bulb')) {
            focusedIndex = parseInt(focusedBulb.dataset.index);
        }
        
        this.bulbsContainer.innerHTML = '';
        
        // Check if we need to limit the displayed bulbs on mobile
        if (this.isMobile && window.innerWidth < 360 && this.bulbsState.length > 6) {
            this.renderBulbsWithLimit(6);
        } else {
            // Apply a delay for sequential fade-in
            this.bulbsState.forEach((value, index) => {
                const bulb = this.createBulb(index, value);
                // Add delay as a CSS variable for animation
                bulb.style.setProperty('--delay', index);
                this.bulbsContainer.appendChild(bulb);
            });
        }
        
        // Restore focus if needed
        if (focusedIndex >= 0) {
            const bulbToFocus = document.querySelector(`.bulb[data-index="${focusedIndex}"]`);
            if (bulbToFocus) {
                setTimeout(() => bulbToFocus.focus(), 0);
            }
        }
        
        // Check if scrollable
        this.checkScrollable();
    }

    // Create a single bulb element
    createBulb(index, value) {
        const bulb = document.createElement('div');
        bulb.className = `bulb ${value === 1 ? 'bulb-on' : ''}`;
        bulb.dataset.index = index;
        bulb.tabIndex = 0; // Make bulbs focusable for keyboard navigation
        bulb.setAttribute('role', 'button');
        bulb.setAttribute('aria-label', `Bulb ${index + 1}, value: ${value}`);

        const bitPosition = this.bulbsState.length - 1 - index;

        bulb.innerHTML = `
            <div class="bulb-image"></div>
            <div class="bulb-filament"></div>
            <div class="bulb-base"></div>
            <div class="bulb-value">${value}</div>
            <div class="info-bit">2<sup>${bitPosition}</sup> = ${Math.pow(2, bitPosition)}</div>
        `;

        // Add click event
        bulb.addEventListener('click', () => this.toggleBulb(index));
        
        // Add touch events for better mobile experience
        bulb.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleBulb(index);
        }, { passive: false });
        
        // Add keyboard support
        bulb.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.toggleBulb(index);
            }
        });

        return bulb;
    }

    // Toggle a bulb's state (0/1) with animation
    toggleBulb(index) {
        if (this.animating) return;
        
        // Update state
        this.bulbsState[index] = this.bulbsState[index] === 0 ? 1 : 0;
        
        // Get the bulb element
        const bulb = document.querySelector(`.bulb[data-index="${index}"]`);
        if (bulb) {
            // Add toggle animation
            bulb.classList.add('toggle-animation');
            setTimeout(() => bulb.classList.remove('toggle-animation'), 300);
        }
        
        // Update UI
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
            this.flashInputError(e.target);
            e.target.value = this.calculateDecimalValue();
            return;
        }
        
        this.updateFromDecimal(decimal);
    }

    handleOctalInput(e) {
        const value = e.target.value.trim();
        if (value === '') return;
        
        if (!/^[0-7]*$/.test(value)) {
            this.flashInputError(e.target);
            e.target.value = this.calculateOctalValue(this.calculateDecimalValue());
            return;
        }
        
        const decimal = parseInt(value, 8);
        this.updateFromDecimal(decimal);
    }

    handleHexInput(e) {
        const value = e.target.value.trim();
        if (value === '') return;
        
        if (!/^[0-9A-Fa-f]*$/.test(value)) {
            this.flashInputError(e.target);
            e.target.value = this.calculateHexValue(this.calculateDecimalValue());
            return;
        }
        
        const decimal = parseInt(value, 16);
        this.updateFromDecimal(decimal);
    }

    // Visual feedback for invalid input
    flashInputError(inputElement) {
        inputElement.classList.add('input-error');
        setTimeout(() => inputElement.classList.remove('input-error'), 800);
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

    // Add a new bulb to the left (MSB position) with animation
    addNewBulb() {
        this.bulbsState.unshift(0);
        
        // Render the bulbs
        if (this.isMobile && window.innerWidth < 360 && this.bulbsState.length > 6) {
            const visibleBulbs = Math.min(6, this.bulbsState.length);
            this.renderBulbsWithLimit(visibleBulbs);
        } else {
            this.renderBulbs();
        }
        
        // Add animation to the new bulb
        const newBulb = document.querySelector('.bulb[data-index="0"]');
        if (newBulb) {
            newBulb.classList.add('new-bulb-animation');
            setTimeout(() => newBulb.classList.remove('new-bulb-animation'), 500);
        }
    }

    // Update the explanation panel
    updateExplanation() {
        const binaryValue = this.bulbsState.join('');
        const decimalValue = this.calculateDecimalValue();
        const octalValue = this.calculateOctalValue(decimalValue);
        const hexValue = this.calculateHexValue(decimalValue);

        // Binary Explanation
        const binaryExplanation = document.getElementById('binaryExplanation');
        binaryExplanation.innerHTML = `
            <strong>Binary Value:</strong> ${binaryValue}<br><br>
            <strong>Calculation:</strong><br>
            ${this.bulbsState.map((bit, index) => {
                const power = this.bulbsState.length - 1 - index;
                return bit === 1 ? `(1 × 2<sup>${power}</sup>)` : `(0 × 2<sup>${power}</sup>)`;
            }).join(' + ')}
        `;

        // Decimal Explanation
        const decimalExplanation = document.getElementById('decimalExplanation');
        decimalExplanation.innerHTML = `
            <strong>Decimal Value:</strong> ${decimalValue}<sub>10</sub><br><br>
            <strong>From Binary:</strong><br>
            ${this.bulbsState.map((bit, index) => {
                const power = this.bulbsState.length - 1 - index;
                return bit === 1 ? `${Math.pow(2, power)}` : '0';
            }).filter(val => val !== '0').join(' + ') || '0'}
            = ${decimalValue}
        `;

        // Octal Explanation
        const octalExplanation = document.getElementById('octalExplanation');
        let octalSteps = [];
        let octalNum = decimalValue;
        let octalResult = [];
        while (octalNum > 0) {
            octalSteps.push(`${octalNum} ÷ 8 = ${Math.floor(octalNum/8)} remainder ${octalNum % 8}`);
            octalResult.unshift(octalNum % 8);
            octalNum = Math.floor(octalNum/8);
        }
        octalExplanation.innerHTML = `
            <strong>Octal Value:</strong> ${octalValue}<sub>8</sub><br><br>
            <strong>Conversion Steps:</strong><br>
            ${decimalValue === 0 ? '0' : octalSteps.join('<br>')}
            ${decimalValue !== 0 ? `<br>Result: ${octalResult.join('')}<sub>8</sub>` : ''}
        `;

        // Hexadecimal Explanation
        const hexExplanation = document.getElementById('hexExplanation');
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
        hexExplanation.innerHTML = `
            <strong>Hexadecimal Value:</strong> ${hexValue}<sub>16</sub><br><br>
            <strong>Conversion Steps:</strong><br>
            ${decimalValue === 0 ? '0' : hexSteps.join('<br>')}
            ${decimalValue !== 0 ? `<br>Result: ${hexResult.join('')}<sub>16</sub>` : ''}
        `;
    }

    // Calculate the decimal value from the binary state
    calculateDecimalValue() {
        return this.bulbsState.reduce((acc, bit, index) => {
            const bitPosition = this.bulbsState.length - 1 - index;
            return acc + bit * Math.pow(2, bitPosition);
        }, 0);
    }

    // Add a new bulb manually (for the Add Bulb button)
    addNewBulbManually() {
        if (this.animating) return;
        this.animating = true;
        
        // Add a new bulb at the MSB position (left side)
        this.bulbsState.unshift(0);
        
        // Render the bulbs
        this.renderBulbs();
        
        // Add animation to the new bulb
        const newBulb = document.querySelector('.bulb[data-index="0"]');
        if (newBulb) {
            newBulb.classList.add('new-bulb-animation');
            setTimeout(() => {
                newBulb.classList.remove('new-bulb-animation');
                this.animating = false;
                this.checkScrollable();
            }, 500);
        } else {
            this.animating = false;
        }
    }
    
    // Randomize the bulbs (for the Randomize button)
    randomizeBulbs() {
        if (this.animating) return;
        this.animating = true;
        
        // Save the original state for animation
        const originalState = [...this.bulbsState];
        
        // Generate a random value within the range of the current number of bits
        const maxValue = Math.pow(2, this.bulbsState.length) - 1;
        const randomValue = Math.floor(Math.random() * (maxValue + 1));
        
        // Convert to binary and update bulbs state
        this.updateFromDecimal(randomValue);
        
        // Create sequential animation effect
        const bulbs = document.querySelectorAll('.bulb');
        bulbs.forEach((bulb, i) => {
            setTimeout(() => {
                bulb.classList.add('toggle-animation');
                setTimeout(() => bulb.classList.remove('toggle-animation'), 300);
            }, i * 100);
        });
        
        // End animation state
        setTimeout(() => {
            this.animating = false;
        }, bulbs.length * 100 + 300);
    }
}

// Initialize the game and theme manager when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new BinaryLightBulbGame();
    new ThemeManager();
});

// hi