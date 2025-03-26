const puzzleContainer = document.querySelector('.puzzle-container');
const originalImage = document.querySelector('.original-image img');
const pieceSize = 100; // Size of each puzzle piece
const gridSize = 4; // 4x4 grid
const levelImages = [
    "Ge1SObzasAA8QMS.jpg", "GgslLVaawAAMFXH.jpg", "GghaOndbEAARuvH.jpg",
    "F8yTV8BbsAAYDlq.jpeg", "GicheOPbMAAjLQB.jpg", "F-oBA3DbMAA_TZs.jpg",
    "GgXTyp5aMAABAwI.jpg", "GiJb1cOaUAAKJoj.jpg", "Ggf7l5JaUAA-kDx.jpg"
]; // Levels
let currentLevel = 0;

let pieces = [];
let correctPieces = 0;

// Create buttons
const submitButton = document.createElement('button');
submitButton.innerText = "Check Puzzle";
submitButton.addEventListener("click", updateCorrectness);
document.body.appendChild(submitButton);

const restartButton = document.createElement('button');
restartButton.innerText = "Restart Game";
restartButton.style.display = "none"; // Hide initially
restartButton.addEventListener("click", restartGame);
document.body.appendChild(restartButton);

// Load the image and initialize the puzzle
function initPuzzle() {
    puzzleContainer.innerHTML = ''; // Clear container
    originalImage.src = levelImages[currentLevel]; // Set current level image

    pieces = [];
    correctPieces = 0;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.style.backgroundImage = `url(${originalImage.src})`;
            piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;

            piece.dataset.correctRow = row;
            piece.dataset.correctCol = col;
            piece.dataset.currentRow = row;
            piece.dataset.currentCol = col;

            piece.draggable = true;
            piece.addEventListener('dragstart', dragStart);
            piece.addEventListener('dragover', dragOver);
            piece.addEventListener('drop', drop);
            pieces.push(piece);
        }
    }

    shufflePieces();
    pieces.forEach(piece => puzzleContainer.appendChild(piece));
    updateCorrectness();
}

// Shuffle the puzzle pieces
function shufflePieces() {
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        swapPieceData(pieces[i], pieces[j]);
    }
}

// Drag and drop functionality
// Replace all drag/drop event listeners with these:

function addTouchEvents(piece) {
    piece.addEventListener('touchstart', touchStart, { passive: false });
    piece.addEventListener('touchmove', touchMove, { passive: false });
    piece.addEventListener('touchend', touchEnd);
}

let touchStartX, touchStartY;
let touchedPiece;

function touchStart(e) {
    e.preventDefault();
    touchedPiece = this;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    this.style.transition = 'none';
    this.style.zIndex = '10';
}

function touchMove(e) {
    if (!touchedPiece) return;
    e.preventDefault();
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    touchedPiece.style.transform = `translate(${touchX - touchStartX}px, ${touchY - touchStartY}px)`;
}

function touchEnd() {
    if (!touchedPiece) return;
    
    // Find which piece we're hovering over
    const dropTarget = document.elementFromPoint(
        touchStartX + parseInt(touchedPiece.style.transform?.split(',')[0]?.replace('translate(', '') || 0),
        touchStartY + parseInt(touchedPiece.style.transform?.split(',')[1] || 0)
    );
    
    if (dropTarget?.classList?.contains('puzzle-piece') && dropTarget !== touchedPiece) {
        swapPieceData(touchedPiece, dropTarget);
        updateCorrectness();
    }
    
    // Reset styles
    touchedPiece.style.transform = '';
    touchedPiece.style.transition = '';
    touchedPiece.style.zIndex = '';
    touchedPiece = null;
}

// Update your initPuzzle function to use touch events:
function initPuzzle() {
    // ... existing code ...
    pieces.forEach(piece => {
        addTouchEvents(piece); // Add touch events
        puzzleContainer.appendChild(piece);
    });
    // ... existing code ...
}

// Swap dataset position and visual background
function swapPieceData(piece1, piece2) {
    let tempBackground = piece1.style.backgroundImage;
    let tempPosition = piece1.style.backgroundPosition;
    piece1.style.backgroundImage = piece2.style.backgroundImage;
    piece1.style.backgroundPosition = piece2.style.backgroundPosition;
    piece2.style.backgroundImage = tempBackground;
    piece2.style.backgroundPosition = tempPosition;

    let tempRow = piece1.dataset.currentRow;
    let tempCol = piece1.dataset.currentCol;
    piece1.dataset.currentRow = piece2.dataset.currentRow;
    piece1.dataset.currentCol = piece2.dataset.currentCol;
    piece2.dataset.currentRow = tempRow;
    piece2.dataset.currentCol = tempCol;
}

// Check correctness of all pieces
function updateCorrectness() {
    correctPieces = 0;
    pieces.forEach(piece => {
        const currentRow = parseInt(piece.dataset.currentRow);
        const currentCol = parseInt(piece.dataset.currentCol);
        const correctRow = parseInt(piece.dataset.correctRow);
        const correctCol = parseInt(piece.dataset.correctCol);

        if (currentRow === correctRow && currentCol === correctCol) {
            piece.classList.add('correct');
            piece.classList.remove('incorrect');
            correctPieces++;
        } else {
            piece.classList.remove('correct');
            piece.classList.add('incorrect');
        }
    });

    if (correctPieces === pieces.length) {
        setTimeout(nextLevel, 1000); // Move to next level after 1 sec
    }
}

// Move to the next level
function nextLevel() {
    if (currentLevel < levelImages.length - 1) {
        currentLevel++; // Move to next level
        alert(`🎉 Level ${currentLevel} Complete! Moving to Level ${currentLevel + 1}...`);
        initPuzzle(); // Load next puzzle
    } else {
        alert("🎉 You completed all levels! Well done! 🎉");
        restartButton.style.display = "block"; // Show restart button
        submitButton.style.display = "none"; // Hide submit button
    }
}

// Restart the game
function restartGame() {
    currentLevel = 0; // Reset to first level
    restartButton.style.display = "none"; // Hide restart button
    submitButton.style.display = "block"; // Show submit button
    initPuzzle(); // Restart game
}

// Initialize the puzzle when the page loads
window.onload = initPuzzle;
