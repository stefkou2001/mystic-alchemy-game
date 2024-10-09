const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Προσαρμογή διαστάσεων του καμβά ανάλογα με την οθόνη
function resizeCanvas() {
    if (window.innerWidth <= 768) { // Για κινητά
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else { // Για υπολογιστές
        canvas.width = 800;
        canvas.height = 600;
    }
}

window.addEventListener('resize', resizeCanvas); // Ακούμε για αλλαγές στο μέγεθος της οθόνης

resizeCanvas(); // Εκκίνηση με σωστές διαστάσεις

// Μεταβλητές για το παιχνίδι
let birdY = canvas.height / 2;
let birdSpeed = 0;
const gravity = 0.5;
const jump = -8; // Αυξημένο άλμα για μεγαλύτερη κίνηση
const birdWidth = 65; // Πλάτος του κοσμήματος
const birdHeight = 65; // Ύψος του κοσμήματος
let score = 0; // Μεταβλητή σκορ
let obstacleSpeed = 1.0; // Αυξημένη ταχύτητα των εμποδίων
const obstacles = []; // Πίνακας εμποδίων
let birdX = 50; // Θέση του κοσμήματος στο X
let timeElapsed = 0; // Χρόνος που έχει περάσει
let lastObstacleTime = 0; // Χρόνος τελευταίας δημιουργίας εμποδίου
const maxObstacleHeight = 150; // Ορισμός μέγιστου ύψους εμποδίου
const pointInterval = 3000; // Χρονικό διάστημα για πόντο (3 δευτερόλεπτα)
let lastPointTime = 0; // Χρόνος τελευταίου πόντου

// Φορτώνουμε την εικόνα του κοσμήματος
const jewelImage = new Image();
jewelImage.src = 'jewel.png'; // Το όνομα του αρχείου εικόνας

// Event για το άλμα με το πληκτρολόγιο
document.addEventListener('keydown', function() {
    birdSpeed = jump; // Καθορισμός ταχύτητας άλματος
});

// Event για το άλμα με την αφή (για κινητά)
canvas.addEventListener('touchstart', function() {
    birdSpeed = jump; // Καθορισμός ταχύτητας άλματος
});

// Συνάρτηση για τη δημιουργία εμποδίων
function createObstacle() {
    const width = 30; // Πλάτος του εμποδίου
    const gap = 120; // Αυξημένο κενό για το κόσμημα να περάσει
    const minObstacleHeight = 50; // Ελάχιστο ύψος εμποδίου

    // Θέση X του εμποδίου
    const xPosition = canvas.width;

    // Τυχαία επιλογή για να αποφασίσουμε αν θα δημιουργήσουμε πάνω ή κάτω εμπόδιο
    const isTopObstacle = Math.random() < 0.5; // 50% πιθανότητα να είναι το εμπόδιο πάνω

    // Δημιουργία επάνω εμποδίου
    if (isTopObstacle) {
        const heightTop = Math.floor(Math.random() * (maxObstacleHeight - minObstacleHeight)) + minObstacleHeight; // Ύψος του επάνω εμποδίου
        const topObstacleY = 0; // Κολλημένο στο ταβάνι
        obstacles.push({ x: xPosition, y: topObstacleY, width: width, height: heightTop, isTop: true });
    } else {
        // Δημιουργία κάτω εμποδίου
        const heightBottom = Math.floor(Math.random() * (maxObstacleHeight - minObstacleHeight)) + minObstacleHeight; // Ύψος του κάτω εμποδίου
        const bottomObstacleY = canvas.height - heightBottom; // Υπολογισμός Y του κάτω εμποδίου
        obstacles.push({ x: xPosition, y: bottomObstacleY, width: width, height: heightBottom, isTop: false });
    }
}
// Βασική συνάρτηση για ενημέρωση και σχεδίαση του παιχνιδιού
function update() {
    birdSpeed += gravity;
    birdY += birdSpeed;

    // Έλεγχος αν το "κόσμημα" χτυπάει το κάτω ή πάνω μέρος του καμβά
    if (birdY + birdHeight > canvas.height) {
        birdY = canvas.height - birdHeight;
        birdSpeed = 0;
    }
    if (birdY < 0) {
        birdY = 0;
        birdSpeed = 0;
    }

    // Καθαρισμός του καμβά
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Σχεδίαση της εικόνας του κοσμήματος
    ctx.drawImage(jewelImage, birdX, birdY, birdWidth, birdHeight);

    // Ενημέρωση και σχεδίαση των εμποδίων
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed; // Κίνηση του εμποδίου

        // Σχεδίαση του εμποδίου
        ctx.fillStyle = 'black'; // Χρώμα του εμποδίου
        ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height); // Σχεδίαση του εμποδίου

        // Έλεγχος αν το κόσμημα χτυπάει το εμπόδιο
        if (
            obstacles[i].x < birdX + birdWidth &&
            obstacles[i].x + obstacles[i].width > birdX &&
            birdY + birdHeight > obstacles[i].y && 
            birdY < obstacles[i].y + obstacles[i].height
        ) {
            // Χτύπημα: σταμάτημα παιχνιδιού ή επαναφορά
            showGameOverPopup();
            return; // Σταματάμε την ενημέρωση του παιχνιδιού
        }

        // Αφαίρεση εμποδίων που έχουν βγει από την οθόνη
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }

    // Εμφάνιση σκορ (σε δευτερόλεπτα)
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2 - 40, 30); // Εμφάνιση σκορ στο κέντρο

    // Δημιουργία νέου εμποδίου κάθε 1000 ms (1 δευτερόλεπτο) για πιο συχνά εμπόδια
    if (Date.now() - lastObstacleTime > 1000) {
        createObstacle();
        lastObstacleTime = Date.now();
    }

    // Αυξάνουμε το σκορ κάθε 3 δευτερόλεπτα
    if (Date.now() - lastPointTime >= pointInterval) {
        score++;
        lastPointTime = Date.now();
        obstacleSpeed += 0.001; // Αυξάνουμε την ταχύτητα των εμποδίων πιο αργά
    }

    requestAnimationFrame(update);
}

// Συνάρτηση για την εμφάνιση του popup για Game Over
function showGameOverPopup() {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 1000;

    const popup = document.createElement('div');
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    popup.innerHTML = `<h2>Game Over!</h2>
                        <p>Score: ${score}</p>
                        <button id="restartButton">Ναι, θέλω να συνεχίσω</button>
                        <button id="exitButton">Όχι, δεν θέλω να συνεχίσω</button>`;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    // Event listener για το κουμπί επανεκκίνησης
    document.getElementById('restartButton').addEventListener('click', function() {
        document.body.removeChild(overlay);
        restartGame(); // Επαναφορά παιχνιδιού
    });

    // Event listener για το κουμπί εξόδου
    document.getElementById('exitButton').addEventListener('click', function() {
        document.body.removeChild(overlay);
        // Εμφάνιση τελικού σκορ ή επιστροφή στο αρχικό μενού (όχι επανεκκίνηση)
    });
}

// Συνάρτηση για επανεκκίνηση του παιχνιδιού
function restartGame() {
    birdY = canvas.height / 2;
    birdSpeed = 0;
    score = 0;
    obstacles.length = 0;
    lastObstacleTime = 0;
    obstacleSpeed = 1.0;
    lastPointTime = Date.now();
    update();
}

jewelImage.onload = function() {
    update(); // Έναρξη του παιχνιδιού όταν φορτωθεί η εικόνα
};
