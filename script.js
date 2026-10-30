
let gameRunning = false;
let score = 0;
let timeLeft = 30;
let dropMaker;
let timerInterval;
let collisionCheckInterval;

let currentDifficulty = "easy";
const difficultyConfigs = {
    easy:   { spawnTime: 600, badChance: 0.2, time: 30, speedMultiplier: 1.0 },
    normal: { spawnTime: 450, badChance: 0.35, time: 25, speedMultiplier: 1.3 },
    hard:   { spawnTime: 300, badChance: 0.5, time: 20, speedMultiplier: 1.7 }
};

const startBtn = document.getElementById("start-btn");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const bucket = document.getElementById("bucket");
const diffBtns = document.querySelectorAll(".diff-btn");


diffBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        if (gameRunning) return;
        diffBtns.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        
        currentDifficulty = e.target.dataset.diff;
        timeLeft = difficultyConfigs[currentDifficulty].time;
        timeEl.textContent = timeLeft;
    });
});

startBtn.addEventListener("click", startGame);


gameContainer.addEventListener("mousemove", (e) => {
    if (!gameRunning) return;
    const rect = gameContainer.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    
   
    const bucketWidth = bucket.offsetWidth;
    if (mouseX < bucketWidth / 2) mouseX = bucketWidth / 2;
    if (mouseX > rect.width - bucketWidth / 2) mouseX = rect.width - bucketWidth / 2;
    
    bucket.style.left = `${mouseX - bucketWidth / 2}px`;
});

function startGame() {
  if (gameRunning) return;

  const config = difficultyConfigs[currentDifficulty];

  gameRunning = true;
  score = 0;
  timeLeft = config.time;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  startBtn.textContent = "Playing...";
  startBtn.disabled = true;

  const existingDrops = document.querySelectorAll(".water-drop");
  existingDrops.forEach(drop => drop.remove());

  dropMaker = setInterval(createDrop, config.spawnTime);
  collisionCheckInterval = setInterval(checkCollisions, 20);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
} 

function createDrop() {
  if (!gameRunning) return;

  const config = difficultyConfigs[currentDifficulty];
  const drop = document.createElement("div");
  drop.className = "water-drop";

  const isBad = Math.random() < config.badChance;
  if (isBad) {
      drop.classList.add("bad-drop");
      drop.dataset.type = "bad";
  } else {
      drop.dataset.type = "good";
  }

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 50);
  drop.style.left = `${xPosition}px`;
  drop.style.top = `-50px`;

  const timePassed = config.time - timeLeft; 
  const speedBonus = timePassed * 0.15; 
  const speed = ((Math.random() * 2 + 2) + speedBonus) * config.speedMultiplier;

  let currentTop = -50; 

  function fall() {
      if (!gameRunning || !drop.parentElement) return;
      currentTop += speed;
      drop.style.top = `${currentTop}px`;

      if (currentTop > gameContainer.offsetHeight) {
          drop.remove();
      } else {
          requestAnimationFrame(fall);
      }
  }

  drop.addEventListener("click", () => {
      if (!gameRunning) return;
      handleCollection(drop.dataset.type);
      drop.remove();
  });

  gameContainer.appendChild(drop);
  requestAnimationFrame(fall);
}

function checkCollisions() {
    if (!gameRunning) return;

    const bucketRect = bucket.getBoundingClientRect();
    const drops = document.querySelectorAll(".water-drop");

    drops.forEach(drop => {
        const dropRect = drop.getBoundingClientRect();

        const isColliding = !(
            dropRect.right < bucketRect.left ||
            dropRect.left > bucketRect.right ||
            dropRect.bottom < bucketRect.top ||
            dropRect.top > bucketRect.bottom
        );

        if (isColliding) {
            handleCollection(drop.dataset.type);
            drop.remove();
        }
    });
}

function handleCollection(type) {
    if (type === "good") {
        score += 1;
    } else if (type === "bad") {
        score = Math.max(0, score - 1); 
    }
    scoreEl.textContent = score;
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearInterval(collisionCheckInterval);

  const existingDrops = document.querySelectorAll(".water-drop");
  existingDrops.forEach(drop => drop.remove());

  startBtn.textContent = "Play Again";
  startBtn.disabled = false;

  alert(`Time's up! Final Score: ${score} points!`);
}