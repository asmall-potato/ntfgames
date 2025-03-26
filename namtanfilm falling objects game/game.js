// Set viewport height properly for mobile
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initialize viewport height
setViewportHeight();
window.addEventListener('resize', setViewportHeight);

// Then modify your gameArea height in CSS to use:
// height: calc(var(--vh, 1vh) * 100 - 60px);

// Create and style the game prompt element
const gamePrompt = document.createElement('div');
gamePrompt.id = 'gamePrompt';
gamePrompt.innerHTML = `
    <h3>Game Instructions</h3>
    <p> Lunar heads: +5 points</p>
    <p> Orange heads: -2 points</p>
    <p>Game starting in 5 seconds...</p>
`;
document.body.appendChild(gamePrompt);

// Game Variables
const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
let playerX = window.innerWidth <= 768 ? (gameArea.offsetWidth - player.offsetWidth) / 2 : 275;
let score = 0;
let gameTimer;
let timeLeft;
let level = 'easy';
let isGameOver = false;
let maxFallingObjects;
let fallingSpeedRange;

// Game Objects Data
const fallingObjects = [
    { type: 'A', points: 5, image: 'lunars transparent.png' },
    { type: 'B', points: -2, image: 'Picture1.png' },
    { type: 'C', points: -2, image: 'Picture2.png' },
    { type: 'D', points: 5, image: 'Picture3.png' }
];

let activeFallingObjects = [];

// Initialize Player Position
function initPlayer() {
    if (window.innerWidth <= 768) {
        player.style.width = '15vw';
        player.style.height = '15vw';
        playerX = (gameArea.offsetWidth - player.offsetWidth) / 2;
    } else {
        player.style.width = '50px';
        player.style.height = '50px';
        playerX = 275;
    }
    const playerHeight = player.offsetHeight;
    player.style.left = playerX + 'px';
    player.style.top = gameArea.offsetHeight - playerHeight + 'px';
}

// Modified startGame function to show prompt first
function startGameWithPrompt(selectedLevel) {
    // Show the prompt
    gamePrompt.style.display = 'block';
    
    // Countdown from 5
    let countdown = 5;
    const countdownElement = gamePrompt.querySelector('p:last-child');
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = `Game starting in ${countdown} seconds...`;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            gamePrompt.style.display = 'none';
            startGame(selectedLevel);
        }
    }, 1000);
}



// Touch Controls for Mobile
let touchStartX = 0;
let touchEndX = 0;

gameArea.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });

gameArea.addEventListener('touchmove', (e) => {
    touchEndX = e.touches[0].clientX;
    let deltaX = touchEndX - touchStartX;  // Calculate movement distance

    if (Math.abs(deltaX) > 10) { // Adjust threshold for responsiveness
        playerX += deltaX; 

        // Keep player within gameArea bounds
        if (playerX < 0) playerX = 0;
        if (playerX > gameArea.offsetWidth - player.offsetWidth) {
            playerX = gameArea.offsetWidth - player.offsetWidth;
        }

        player.style.left = playerX + 'px';
        touchStartX = touchEndX; // Update start position for smoother dragging
    }
}, { passive: false });


// Create Falling Objects
// Create Falling Objects
function createFallingObject() {
    const objectData = fallingObjects[Math.floor(Math.random() * fallingObjects.length)];
    console.log(`Falling object selected: ${objectData.type}`);  // Debugging log

    const newObject = document.createElement('div');
    newObject.className = 'fallingObject';

    if (objectData.image) {
        newObject.style.backgroundImage = `url('${objectData.image}')`;
    } else {
        newObject.style.backgroundColor = objectData.type === 'A' ? 'gold' : 'darkred';
    }

    // Adjust size based on screen width
    if (window.innerWidth <= 768) {
        newObject.style.width = '10vw';
        newObject.style.height = '10vw';
    } else {
        newObject.style.width = '30px';
        newObject.style.height = '30px';
    }

    const objectWidth = window.innerWidth <= 768 ? window.innerWidth * 0.1 : 30;
    const maxLeft = gameArea.offsetWidth - objectWidth;
    
    // Ensure there is enough space between objects by adjusting the range
    newObject.style.left = Math.random() * (maxLeft - objectWidth * 1.7) + 'px'; // Increase space by 1.7x the width of an object

    newObject.style.top = '0px';
    
    gameArea.appendChild(newObject);

    newObject.speed = Math.random() * fallingSpeedRange + 2;
    newObject.points = objectData.points;
    newObject.type = objectData.type;

    activeFallingObjects.push(newObject);
    return newObject;
}



// Original startGame function (now called after prompt)
function startGame(selectedLevel) {
    isGameOver = false;
    score = 0;
    level = selectedLevel;
    
    // Set level parameters
    if (level === 'easy') {
        timeLeft = 30;
        maxFallingObjects = 5;
        fallingSpeedRange = 1;
    } else if (level === 'normal') {
        timeLeft = 20;
        maxFallingObjects = 8;
        fallingSpeedRange = 2;
    } else {
        timeLeft = 10;
        maxFallingObjects = 12;
        fallingSpeedRange = 3;
    }

    scoreDisplay.textContent = `Score: ${score}`;
    timerDisplay.textContent = `Time: ${timeLeft}`;

    // Clear existing objects
    activeFallingObjects.forEach(obj => gameArea.removeChild(obj));
    activeFallingObjects = [];

    // Show/Hide buttons
    document.getElementById('difficultyButtons').style.display = 'none';
    document.getElementById('restartButton').style.display = 'flex';

    // Initialize player
    initPlayer();

    // Start game timer
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}`;
        
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }, 1000);

    // Create initial objects
    for (let i = 0; i < maxFallingObjects; i++) {
        createFallingObject();
    }

    // Start game loop
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Game Loop
function gameLoop() {
    if (isGameOver) return;

    activeFallingObjects.forEach((object) => {
        // Move object down
        const currentTop = parseInt(object.style.top) || 0;
        object.style.top = (currentTop + object.speed) + 'px';

        // Check if object reached bottom
        if (currentTop >= gameArea.offsetHeight) {
            resetObjectPosition(object);
        }

        // Check collision with player
        if (checkCollision(object)) {
            collectObject(object);
        }
    });

    // Create new objects if needed
    if (activeFallingObjects.length < maxFallingObjects) {
        createFallingObject();
    }

    requestAnimationFrame(gameLoop);
}

// Collision Detection
function checkCollision(object) {
    const objectTop = parseInt(object.style.top);
    const objectLeft = parseInt(object.style.left);
    const objectWidth = parseInt(object.style.width);
    const objectHeight = parseInt(object.style.height);
    
    const playerTop = gameArea.offsetHeight - player.offsetHeight - 20;
    const playerLeft = playerX;
    const playerWidth = player.offsetWidth;
    
    return objectTop + objectHeight >= playerTop &&
           objectLeft + objectWidth >= playerLeft &&
           objectLeft <= playerLeft + playerWidth;
}

// Object Collection
function collectObject(object) {
    score += object.points;
    scoreDisplay.textContent = `Score: ${score}`;
    resetObjectPosition(object);
}

// Reset Object Position
function resetObjectPosition(object) {
    const objectWidth = window.innerWidth <= 768 ? window.innerWidth * 0.1 : 30;
    object.style.top = '0px';
    object.style.left = Math.random() * (gameArea.offsetWidth - objectWidth) + 'px';
}

// End Game
function endGame() {
    isGameOver = true;
    alert(`Game Over! Your final score is ${score}`);
}

// Restart Game
function restartGame() {
    activeFallingObjects.forEach(obj => gameArea.removeChild(obj));
    activeFallingObjects = [];
    
    document.getElementById('difficultyButtons').style.display = 'flex';
    document.getElementById('restartButton').style.display = 'none';
    
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    timerDisplay.textContent = `Time: 30`;
}

// Keyboard Controls for Desktop
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && playerX > 0) {
        playerX -= 20;
    } else if (e.key === 'ArrowRight' && playerX < gameArea.offsetWidth - player.offsetWidth) {
        playerX += 20;
    }
    player.style.left = playerX + 'px';
});

// Handle Window Resize
window.addEventListener('resize', () => {
    initPlayer(); // Re-initialize the player's position
    activeFallingObjects.forEach(obj => {
        if (window.innerWidth <= 768) {
            obj.style.width = '10vw';
            obj.style.height = '10vw';
        } else {
            obj.style.width = '30px';
            obj.style.height = '30px';
        }
    });
});

// Update your button event listeners to use startGameWithPrompt:
document.querySelectorAll('#difficultyButtons button').forEach(button => {
    const level = button.textContent.toLowerCase();
    button.onclick = () => startGameWithPrompt(level);
});

// Initialize Game
initPlayer();
