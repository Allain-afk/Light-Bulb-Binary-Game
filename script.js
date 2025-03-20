class BinaryLightBulbGame {
    constructor(initialBulbCount = 5) {
        this.initialBulbCount = initialBulbCount;
        this.bulbsState = [];
        this.bulbsContainer = document.getElementById('bulbsContainer');
        this.decimalDisplay = document.querySelector('.decimal-display');
        this.resetButton = document.getElementById('resetButton');
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;

        this.initGame();
        this.addEventListeners();
        this.handleResize();
    }

    // Initialize the game
    initGame() {
        this.bulbsState = Array(this.initialBulbCount).fill(0);
        this.renderBulbs();
        this.updateDecimalDisplay();
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
    }

    // Handle window resize
    handleResize() {
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;
        
        // Adjust number of bulbs for very small screens
        if (window.innerWidth < 360 && this.bulbsState.length > 6) {
            // Only show a reasonable number of bulbs on very small screens
            const visibleBulbs = Math.min(6, this.bulbsState.length);
            this.renderBulbsWithLimit(visibleBulbs);
        } else {
            this.renderBulbs();
        }
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
        
        if (this.isMobile && window.innerWidth < 360 && this.bulbsState.length > 6) {
            const visibleBulbs = Math.min(6, this.bulbsState.length);
            this.renderBulbsWithLimit(visibleBulbs);
        } else {
            this.renderBulbs();
        }
        
        this.updateDecimalDisplay();
        this.checkForMaxValue();
    }

    // Update the decimal display based on the current binary value
    updateDecimalDisplay() {
        const decimalValue = this.bulbsState.reduce((acc, bit, index) => {
            const bitPosition = this.bulbsState.length - 1 - index;
            return acc + bit * Math.pow(2, bitPosition);
        }, 0);

        this.decimalDisplay.textContent = `Decimal: ${decimalValue}`;
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
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new BinaryLightBulbGame();
});