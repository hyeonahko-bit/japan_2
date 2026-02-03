const words = [
  { word: "ありがとう", meaning: "감사합니다" },
  { word: "こんにちは", meaning: "안녕하세요" },
  { word: "さようなら", meaning: "안녕히 가세요/계세요" },
  { word: "すみません", meaning: "죄송합니다/실례합니다" },
  { word: "お願いします", meaning: "부탁합니다" },
  { word: "大丈夫", meaning: "괜찮습니다" },
  { word: "楽しい", meaning: "즐겁다" },
  { word: "難しい", meaning: "어렵다" },
  { word: "簡単", meaning: "간단하다" },
  { word: "静か", meaning: "조용하다" },
  { word: "元気", meaning: "건강, 기운" },
  { word: "忙しい", meaning: "바쁘다" },
  { word: "暑い", meaning: "덥다" },
  { word: "寒い", meaning: "춥다" },
  { word: "高い", meaning: "비싸다/높다" },
  { word: "安い", meaning: "싸다" },
  { word: "新しい", meaning: "새롭다" },
  { word: "古い", meaning: "오래되다/낡다" },
  { word: "大きい", meaning: "크다" },
  { word: "小さい", meaning: "작다" },
  { word: "便利", meaning: "편리하다" },
  { word: "必要", meaning: "필요하다" },
  { word: "約束", meaning: "약속" },
  { word: "気持ち", meaning: "기분/마음" }
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
const emailStatus = document.getElementById("emailStatus");
const openContactBtn = document.getElementById("openContactBtn");
const contactModal = document.getElementById("contactModal");
const closeContactBtn = document.getElementById("closeContactBtn");
const submitContactBtn = document.getElementById("submitContactBtn");
const contactName = document.getElementById("contactName");
const contactPhone = document.getElementById("contactPhone");
const contactEmail = document.getElementById("contactEmail");
const contactError = document.getElementById("contactError");

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

  if (emailStatus) {
    emailStatus.textContent = "제출하면 바로 전송돼요.";
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9\-+\s()]{7,20}$/.test(phone);
}

function getScoreSummary() {
  const total = quizSet.length;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percent };
}

async function sendContactEmail(payload) {
  const response = await fetch("/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorMessage = "전송에 실패했어요. 잠시 후 다시 시도해 주세요.";
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMessage = data.error;
      }
    } catch (error) {
      errorMessage = "전송에 실패했어요. 잠시 후 다시 시도해 주세요.";
    }
    throw new Error(errorMessage);
  }
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

if (openContactBtn && contactModal) {
  openContactBtn.addEventListener("click", () => {
    contactModal.classList.remove("hidden");
    if (contactError) {
      contactError.classList.add("hidden");
    }
  });
}

if (closeContactBtn && contactModal) {
  closeContactBtn.addEventListener("click", () => {
    contactModal.classList.add("hidden");
  });
}

if (submitContactBtn) {
  submitContactBtn.addEventListener("click", async () => {
    const name = contactName ? contactName.value.trim() : "";
    const phone = contactPhone ? contactPhone.value.trim() : "";
    const email = contactEmail ? contactEmail.value.trim() : "";

    const isValid =
      name.length > 0 && isValidPhone(phone) && isValidEmail(email);

    if (!isValid) {
      if (contactError) {
        contactError.classList.remove("hidden");
      }
      return;
    }

    const summary = getScoreSummary();
    const submitText = submitContactBtn.textContent;
    submitContactBtn.textContent = "전송 중...";
    submitContactBtn.disabled = true;
    if (contactError) {
      contactError.classList.add("hidden");
    }

    try {
      await sendContactEmail({
        name,
        phone,
        email,
        score: summary.score,
        total: summary.total,
        percent: summary.percent
      });
      if (emailStatus) {
        emailStatus.textContent = "전송 완료! 감사합니다.";
      }
      if (contactModal) {
        contactModal.classList.add("hidden");
      }
      if (contactName) {
        contactName.value = "";
      }
      if (contactPhone) {
        contactPhone.value = "";
      }
      if (contactEmail) {
        contactEmail.value = "";
      }
    } catch (error) {
      if (emailStatus) {
        emailStatus.textContent = error.message;
      }
    } finally {
      submitContactBtn.textContent = submitText;
      submitContactBtn.disabled = false;
    }
  });
}
