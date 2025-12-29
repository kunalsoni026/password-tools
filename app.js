const stepDots = document.querySelectorAll("[data-step-dot]");
const step1 = document.getElementById("step1");
const step2Gen = document.getElementById("step2-generator");
const step2Check = document.getElementById("step2-checker");
const step3 = document.getElementById("step3");

const chooseGenerator = document.getElementById("chooseGenerator");
const chooseChecker = document.getElementById("chooseChecker");
const startBtn = document.getElementById("startBtn");

const backToMode1 = document.getElementById("backToMode1");
const backToMode2 = document.getElementById("backToMode2");
const goToFeedbackFromGen = document.getElementById("goToFeedbackFromGen");
const goToFeedbackFromCheck = document.getElementById("goToFeedbackFromCheck");
const backToStep2 = document.getElementById("backToStep2");

const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const passwordEl = document.getElementById("password");
const copyBtn = document.getElementById("copyBtn");
const strengthLabelEl = document.getElementById("strengthLabel");
const meterFillEl = document.getElementById("meterFill");
const entropyValueEl = document.getElementById("entropyValue");

const checkPasswordEl = document.getElementById("checkPassword");
const toggleVisibilityBtn = document.getElementById("toggleVisibility");
const checkBtn = document.getElementById("checkBtn");
const checkStatusEl = document.getElementById("checkStatus");
const checkStrengthLabelEl = document.getElementById("checkStrengthLabel");
const checkMeterFillEl = document.getElementById("checkMeterFill");
const checkEntropyValueEl = document.getElementById("checkEntropyValue");
const checkerTipsEl = document.getElementById("checkerTips").querySelector("span");

const ratingGroup = document.getElementById("ratingGroup");
const ratingChips = ratingGroup.querySelectorAll(".rating-chip");
const improvementsEl = document.getElementById("improvements");
const emailEl = document.getElementById("email");
const feedbackStatusEl = document.getElementById("feedbackStatus");

const langToggle = document.getElementById("langToggle");
const thankTextEn = document.getElementById("thankTextEn");
const thankTextHi = document.getElementById("thankTextHi");

let selectedMode = "generator";
let currentStep = 1;
let selectedRating = null;

function setStep(step) {
  currentStep = step;
  stepDots.forEach(dot => {
    const s = parseInt(dot.dataset.stepDot, 10);
    dot.classList.toggle("active", s === step);
  });
}

function showSection(sectionId) {
  step1.classList.add("hidden");
  step2Gen.classList.add("hidden");
  step2Check.classList.add("hidden");
  step3.classList.add("hidden");

  document.getElementById(sectionId).classList.remove("hidden");
}

chooseGenerator.addEventListener("click", () => {
  selectedMode = "generator";
  chooseGenerator.style.borderColor = "#60a5fa";
  chooseChecker.style.borderColor = "rgba(55,65,81,0.9)";
});

chooseChecker.addEventListener("click", () => {
  selectedMode = "checker";
  chooseChecker.style.borderColor = "#60a5fa";
  chooseGenerator.style.borderColor = "rgba(55,65,81,0.9)";
});

startBtn.addEventListener("click", () => {
  setStep(2);
  if (selectedMode === "generator") {
    showSection("step2-generator");
  } else {
    showSection("step2-checker");
  }
});

backToMode1.addEventListener("click", () => {
  setStep(1);
  showSection("step1");
});

backToMode2.addEventListener("click", () => {
  setStep(1);
  showSection("step1");
});

goToFeedbackFromGen.addEventListener("click", () => {
  setStep(3);
  showSection("step3");
});

goToFeedbackFromCheck.addEventListener("click", () => {
  setStep(3);
  showSection("step3");
});

backToStep2.addEventListener("click", () => {
  setStep(2);
  if (selectedMode === "generator") {
    showSection("step2-generator");
  } else {
    showSection("step2-checker");
  }
});

async function generatePassword() {
  const length = parseInt(document.getElementById("length").value, 10);
  const includeUppercase = document.getElementById("includeUppercase").value;
  const includeLowercase = document.getElementById("includeLowercase").value;
  const includeDigits = document.getElementById("includeDigits").value;
  const includeSymbols = document.getElementById("includeSymbols").value;

  if (isNaN(length) || length < 8 || length > 20) {
    statusEl.textContent = "Length must be between 8 and 20.";
    statusEl.classList.add("error");
    statusEl.classList.remove("success");
    return;
  }

  statusEl.textContent = "Generating...";
  statusEl.classList.remove("error");
  statusEl.classList.remove("success");
  generateBtn.disabled = true;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        length: length,
        include_uppercase: includeUppercase,
        include_lowercase: includeLowercase,
        include_digits: includeDigits,
        include_symbols: includeSymbols
      })
    });

    const data = await response.json();

    if (!response.ok) {
      statusEl.textContent = data.error || "Server error.";
      statusEl.classList.add("error");
      statusEl.classList.remove("success");
      generateBtn.disabled = false;
      return;
    }

    passwordEl.value = data.password || "";
    strengthLabelEl.textContent = data.strength || "–";
    entropyValueEl.textContent = data.entropy ? data.entropy.toFixed(2) : "–";
    updateStrengthMeter(data.strength, meterFillEl);

    statusEl.textContent = "Password generated successfully.";
    statusEl.classList.remove("error");
    statusEl.classList.add("success");
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Request failed. Check console and backend.";
    statusEl.classList.add("error");
    statusEl.classList.remove("success");
  } finally {
    generateBtn.disabled = false;
  }
}

function updateStrengthMeter(strength, meterEl) {
  let width = 0;
  let color = "#ef4444";

  switch (strength) {
    case "VERY WEAK":
      width = 20; color = "#ef4444"; break;
    case "WEAK":
      width = 40; color = "#f97316"; break;
    case "MEDIUM":
      width = 60; color = "#eab308"; break;
    case "STRONG":
      width = 80; color = "#22c55e"; break;
    case "VERY STRONG":
      width = 100; color = "#22c55e"; break;
    default:
      width = 0; color = "#111827";
  }

  meterEl.style.width = width + "%";
  meterEl.style.backgroundColor = color;
}

async function copyPassword() {
  const value = passwordEl.value;
  if (!value) {
    statusEl.textContent = "Nothing to copy.";
    statusEl.classList.add("error");
    statusEl.classList.remove("success");
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    statusEl.textContent = "Password copied to clipboard.";
    statusEl.classList.remove("error");
    statusEl.classList.add("success");
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Copy failed. You can copy manually.";
    statusEl.classList.add("error");
    statusEl.classList.remove("success");
  }
}

async function checkPassword() {
  const pwd = checkPasswordEl.value.trim();
  if (!pwd) {
    checkStatusEl.textContent = "Please enter a password to analyze.";
    checkStatusEl.classList.add("error");
    checkStatusEl.classList.remove("success");
    return;
  }

  checkStatusEl.textContent = "Analyzing...";
  checkStatusEl.classList.remove("error");
  checkStatusEl.classList.remove("success");
  checkBtn.disabled = true;

  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd })
    });

    const data = await response.json();

    if (!response.ok) {
      checkStatusEl.textContent = data.error || "Server error.";
      checkStatusEl.classList.add("error");
      checkStatusEl.classList.remove("success");
      checkBtn.disabled = false;
      return;
    }

    checkStrengthLabelEl.textContent = data.strength || "–";
    checkEntropyValueEl.textContent = data.entropy ? data.entropy.toFixed(2) : "–";
    updateStrengthMeter(data.strength, checkMeterFillEl);
    checkerTipsEl.textContent = data.tips || "Try adding more length, mixing symbols, numbers, and both cases for better security.";
    checkStatusEl.textContent = "Analysis complete.";
    checkStatusEl.classList.remove("error");
    checkStatusEl.classList.add("success");
  } catch (err) {
    console.error(err);
    checkStatusEl.textContent = "Request failed. Check console and backend.";
    checkStatusEl.classList.add("error");
    checkStatusEl.classList.remove("success");
  } finally {
    checkBtn.disabled = false;
  }
}

function toggleVisibility() {
  if (checkPasswordEl.type === "password") {
    checkPasswordEl.type = "text";
    toggleVisibilityBtn.textContent = "Hide password";
  } else {
    checkPasswordEl.type = "password";
    toggleVisibilityBtn.textContent = "Show password";
  }
}

ratingChips.forEach(chip => {
  chip.addEventListener("click", () => {
    selectedRating = chip.dataset.rate;
    ratingChips.forEach(c => c.classList.remove("selected"));
    chip.classList.add("selected");
  });
});

function submitFeedback() {
  feedbackStatusEl.textContent = "Feedback saved locally. Connect this to backend if needed.";
  feedbackStatusEl.classList.remove("error");
  feedbackStatusEl.classList.add("success");
  console.log({
    rating: selectedRating,
    improvements: improvementsEl.value.trim(),
    email: emailEl.value.trim()
  });
}

langToggle.addEventListener("click", () => {
  const hiVisible = !thankTextHi.classList.contains("hidden");
  if (hiVisible) {
    thankTextHi.classList.add("hidden");
    thankTextEn.classList.remove("hidden");
  } else {
    thankTextEn.classList.add("hidden");
    thankTextHi.classList.remove("hidden");
  }
});

generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);
checkBtn.addEventListener("click", checkPassword);
toggleVisibilityBtn.addEventListener("click", toggleVisibility);
submitFeedback.addEventListener("click", submitFeedback);

setStep(1);
