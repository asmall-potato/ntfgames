// script.js

const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let seconds = 0;
let gameStarted = false;
let timer;
let cardImages = [
    "GAU2ivjbcAArYKx.jpeg", "GlgI-m5asAArVTQ.jpg", "GFFeR2CaAAAqosy.jpeg", "GdXP4tCaoAA4JTF.jpg", "GggrlkkbMAA4RhI.jpg", "GghA8o0akAAz8hf.jpg"
];

// Double the card images for matching (total 12 cards)
cardImages = [...cardImages, ...cardImages];

// Shuffle the cards randomly
function shuffleCards() {
    cards = cardImages
        .map((card, index) => ({ card, index }))
        .sort(() => Math.random() - 0.5);
}

// Create and display the cards on the board
function createBoard() {
    shuffleCards();
    gameBoard.innerHTML = ''; // Clear the board
    cards.forEach(({ card, index }) => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.dataset.index = index;
        cardElement.innerHTML = `<img src="lunars transparent.png" alt="Card Back" class="card-back">`; // Image for back of card
        cardElement.addEventListener("click", flipCard);
        gameBoard.appendChild(cardElement);
    });

    // Preview phase: Show all cards face up for 3 seconds, then flip them back down
    previewCards();
}

// Preview cards before the game starts
function previewCards() {
    // Show all cards face up
    const allCards = document.querySelectorAll(".card");
    allCards.forEach(card => {
        const index = card.dataset.index;
        const img = document.createElement("img");
        img.src = cards[index].card;
        img.classList.add("card-image"); // Ensure the image fills the card space
        card.innerHTML = '';
        card.appendChild(img);
        card.classList.add("flipped");
    });

    // After 3 seconds, flip all cards back down
    setTimeout(() => {
        allCards.forEach(card => {
            card.innerHTML = `<img src="lunars transparent.png" alt="Card Back" class="card-back">`;
            card.classList.remove("flipped");
        });

        // Start the game after the preview phase
        startGame();
    }, 3000); // 3000 milliseconds (3 seconds) for the preview phase
}

// Start the game
function startGame() {
    gameStarted = true;
    startTimer(); // Start the timer when the game begins
}

// Start Timer
function startTimer() {
    if (gameStarted && !timer) {
        timer = setInterval(() => {
            seconds++;
            timerDisplay.textContent = `${seconds} seconds`;
        }, 1000);
    }
}

// Handle card flip
function flipCard() {
    if (flippedCards.length === 2 || this.classList.contains("flipped") || this.classList.contains("matched")) {
        return; // Ignore if two cards are already flipped or the card is matched
    }

    const index = this.dataset.index;
    this.classList.add("flipped");

    // Display the front side of the card
    const img = document.createElement("img");
    img.src = cards[index].card;
    img.classList.add("card-image"); // Ensure the image fills the card space
    this.innerHTML = '';
    this.appendChild(img);

    flippedCards.push(this);
    startTimer(); // Start the timer when the first card is flipped

    // Check if two cards are flipped
    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 1000);
    }
}

// Check if two flipped cards match
function checkMatch() {
    const [card1, card2] = flippedCards;
    const index1 = card1.dataset.index;
    const index2 = card2.dataset.index;

    if (cards[index1].card === cards[index2].card) {
        // If they match, mark them as matched
        card1.classList.add("matched");
        card2.classList.add("matched");
        matchedPairs++;
        score += 10; // Add 10 points for each match
        scoreDisplay.textContent = score;

        if (matchedPairs === cards.length / 2) {
            clearInterval(timer); // Stop the timer when all pairs are matched
            alert(`You won! All pairs are matched. Time taken: ${seconds} seconds`);
        }
    } else {
        // If they don't match, flip them back
        card1.innerHTML = `<img src="lunars transparent.png" alt="Card Back" class="card-back">`;
        card2.innerHTML = `<img src="lunars transparent.png" alt="Card Back" class="card-back">`;
    }

    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
    flippedCards = [];
}

// Restart the game
function restartGame() {
    // Reset variables
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    score = 0;
    seconds = 0;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = `${seconds} seconds`;
    clearInterval(timer); // Clear the timer
    timer = null; // Ensure the timer is reset
    gameStarted = false; // Reset the game start flag

    // Recreate the game board and show preview
    createBoard();
}

// Initialize the game
createBoard();

// Add event listener to the restart button
restartBtn.addEventListener("click", restartGame);

