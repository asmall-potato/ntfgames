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
let draggedPiece = null;

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
    puzzleContainer.innerHTML = '';  
    correctPieces = 0;

    let img = new Image();
    img.src = levelImages[currentLevel];
    img.onload = () => {
        originalImage.src = img.src; // Ensure image is set only after loading
        pieces = [];

        let pieceSize = window.innerWidth <= 600 ? 75 : 100; // Dynamically adjust piece size
        let bgSize = pieceSize * gridSize; // Ensure full image scales correctly

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const piece = document.createElement('div');
                piece.classList.add('puzzle-piece');
                piece.style.backgroundImage = `url(${originalImage.src})`;
                piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
                piece.style.backgroundSize = `${bgSize}px ${bgSize}px`; // Adjust background size dynamically

                piece.dataset.correctRow = row;
                piece.dataset.correctCol = col;
                piece.dataset.currentRow = row;
                piece.dataset.currentCol = col;

                piece.draggable = true;
                piece.addEventListener('dragstart', dragStart);
                piece.addEventListener('dragover', dragOver);
                piece.addEventListener('drop', drop);
                piece.addEventListener('dragend', dragEnd);

                // Mobile touch support
                piece.addEventListener("touchstart", touchStart, { passive: false });
                piece.addEventListener("touchmove", touchMove, { passive: false });
                piece.addEventListener("touchend", touchEnd);

                pieces.push(piece);
            }
        }

        shufflePieces();
        pieces.forEach(piece => puzzleContainer.appendChild(piece));
        updateCorrectness();
    };
}



// Shuffle the puzzle pieces
function shufflePieces() {
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        swapPieceData(pieces[i], pieces[j]);
    }
}

// Desktop Drag and Drop functionality
function dragStart(e) {
    draggedPiece = this;
    setTimeout(() => (this.style.opacity = '0.5'), 0);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    if (this !== draggedPiece) {
        swapPieceData(this, draggedPiece);
        updateCorrectness();
    }
}

function dragEnd() {
    this.style.opacity = '1';
}

// Mobile Touch functionality
let touchStartX, touchStartY;

function touchStart(e) {
    e.preventDefault();
    draggedPiece = this;
    let touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function touchMove(e) {
    e.preventDefault();
    let touch = e.touches[0];
    let deltaX = touch.clientX - touchStartX;
    let deltaY = touch.clientY - touchStartY;

    draggedPiece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
}

function touchEnd(e) {
    e.preventDefault();
    let touch = e.changedTouches[0];
    let endX = touch.clientX;
    let endY = touch.clientY;

    // Determine which piece is closest
    let closestPiece = null;
    let minDistance = Infinity;

    pieces.forEach(piece => {
        let rect = piece.getBoundingClientRect();
        let distance = Math.sqrt(
            Math.pow(rect.left + rect.width / 2 - endX, 2) +
            Math.pow(rect.top + rect.height / 2 - endY, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestPiece = piece;
        }
    });

    if (closestPiece && closestPiece !== draggedPiece) {
        swapPieceData(closestPiece, draggedPiece);
        updateCorrectness();
    }

    draggedPiece.style.transform = "translate(0, 0)";
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
        setTimeout(nextLevel, 1000);
    }
}

// Move to the next level
function nextLevel() {
    if (currentLevel < levelImages.length - 1) {
        currentLevel++;
        alert(`🎉 Level ${currentLevel} Complete! Moving to Level ${currentLevel + 1}...`);
        initPuzzle();
    } else {
        alert("🎉 You completed all levels! Well done! 🎉");
        restartButton.style.display = "block";
        submitButton.style.display = "none";
    }
}

// Restart the game
function restartGame() {
    currentLevel = 0;
    restartButton.style.display = "none";
    submitButton.style.display = "block";
    initPuzzle();
}

// Initialize the puzzle when the page loads
window.onload = initPuzzle;
