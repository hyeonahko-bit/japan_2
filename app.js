const words = [
  { word: "fragile", meaning: "깨지기 쉬운" },
  { word: "rapid", meaning: "빠른" },
  { word: "aware", meaning: "인지하고 있는" },
  { word: "relief", meaning: "안도, 완화" },
  { word: "dull", meaning: "지루한, 둔한" },
  { word: "steady", meaning: "안정적인, 꾸준한" },
  { word: "mild", meaning: "온화한, 가벼운" },
  { word: "vivid", meaning: "선명한, 생생한" },
  { word: "essential", meaning: "필수적인" },
  { word: "odd", meaning: "이상한, 홀수의" },
  { word: "frequent", meaning: "빈번한" },
  { word: "generous", meaning: "관대한" },
  { word: "narrow", meaning: "좁은" },
  { word: "brief", meaning: "짧은, 간단한" },
  { word: "maintain", meaning: "유지하다" },
  { word: "observe", meaning: "관찰하다, 준수하다" },
  { word: "predict", meaning: "예측하다" },
  { word: "confirm", meaning: "확인하다" },
  { word: "expand", meaning: "확장하다" },
  { word: "seek", meaning: "찾다, 추구하다" },
  { word: "achieve", meaning: "달성하다" },
  { word: "decline", meaning: "감소하다, 거절하다" },
  { word: "assist", meaning: "돕다" },
  { word: "capture", meaning: "붙잡다, 포착하다" }
];

const startScreen = document.getElementById("startScreen");
const questionScreen = document.getElementById("questionScreen");
const resultScreen = document.getElementById("resultScreen");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const retryBtn = document.getElementById("retryBtn");
const wordDisplay = document.getElementById("wordDisplay");
const choicesList = document.getElementById("choicesList");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const scoreValue = document.getElementById("scoreValue");
const scoreMessage = document.getElementById("scoreMessage");

let selectedCount = 10;
let quizSet = [];
let currentIndex = 0;
let score = 0;
let isAnswered = false;

const optionButtons = Array.from(document.querySelectorAll(".btn-option"));
optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    optionButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
    selectedCount = Number(button.dataset.count);
  });
});

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function buildQuizSet() {
  const available = shuffle(words);
  const count = Math.min(selectedCount, available.length);
  return available.slice(0, count);
}

function updateProgress() {
  const total = quizSet.length;
  const current = Math.min(currentIndex + 1, total);
  progressText.textContent = `${current} / ${total}`;
  const percentage = total === 0 ? 0 : (currentIndex / total) * 100;
  progressFill.style.width = `${percentage}%`;
}

function renderQuestion() {
  isAnswered = false;
  nextBtn.classList.add("hidden");
  const current = quizSet[currentIndex];
  if (!current) {
    return;
  }

  wordDisplay.textContent = current.word;
  const wrongOptions = shuffle(
    words.filter((item) => item.word !== current.word)
  )
    .slice(0, 3)
    .map((item) => item.meaning);

  const options = shuffle([current.meaning, ...wrongOptions]);
  choicesList.innerHTML = "";

  options.forEach((meaning) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = meaning;
    button.addEventListener("click", () => handleAnswer(button, meaning));
    li.appendChild(button);
    choicesList.appendChild(li);
  });

  updateProgress();
}

function handleAnswer(button, meaning) {
  if (isAnswered) {
    return;
  }
  isAnswered = true;
  const current = quizSet[currentIndex];
  const buttons = choicesList.querySelectorAll("button");

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === current.meaning) {
      btn.classList.add("correct");
    }
  });

  if (meaning === current.meaning) {
    score += 1;
  } else {
    button.classList.add("wrong");
  }

  nextBtn.classList.remove("hidden");
}

function showResult() {
  questionScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  scoreValue.textContent = score;
  const total = quizSet.length;
  document.querySelector(".score-total").textContent = `/ ${total}`;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);

  if (percent >= 90) {
    scoreMessage.textContent = "완벽해요! 거의 마스터 수준입니다.";
  } else if (percent >= 70) {
    scoreMessage.textContent = "아주 좋아요! 조금만 더 하면 만점이에요.";
  } else if (percent >= 50) {
    scoreMessage.textContent = "괜찮아요! 복습하면 더 좋아질 거예요.";
  } else {
    scoreMessage.textContent = "처음은 어려워요. 천천히 다시 해봐요.";
  }

  progressFill.style.width = "100%";
  progressText.textContent = `${total} / ${total}`;
}

function startQuiz() {
  quizSet = buildQuizSet();
  currentIndex = 0;
  score = 0;
  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  questionScreen.classList.remove("hidden");
  renderQuestion();
}

startBtn.addEventListener("click", startQuiz);

nextBtn.addEventListener("click", () => {
  if (!isAnswered) {
    return;
  }
  currentIndex += 1;
  if (currentIndex >= quizSet.length) {
    showResult();
    return;
  }
  renderQuestion();
});

retryBtn.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  progressFill.style.width = "0%";
  progressText.textContent = "0 / 0";
  optionButtons.forEach((button) => button.classList.remove("selected"));
  selectedCount = 10;
});
