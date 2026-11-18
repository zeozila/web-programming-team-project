import { initPage, getDestination, escapeHtml } from "../lib/app.js";
import { icon } from "../lib/icons.js";
import { QUIZ } from "../data/quiz.js";
import { load, save } from "../lib/store.js";

initPage("quiz");

const box = document.getElementById("quiz");
const SETS = { korea: "Korea", mongolia: "Mongolia", mixed: "Both" };
const LETTERS = ["A", "B", "C", "D"];
const QUESTIONS_PER_ROUND = 10;

let chosenSet = getDestination();
let round = []; // questions for this round, with shuffled options
let index = 0;
let score = 0;
let mistakes = [];
let answered = false;

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRound(set) {
  const pool = QUIZ.filter((q) => set === "mixed" || q.country === set || q.country === "both");
  return shuffle(pool)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((q) => {
      // shuffle the options but remember which one is right
      const options = shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));
      return { ...q, options };
    });
}

// ---------- screens ----------

function showStart() {
  const best = load("quizBest", {});
  box.innerHTML = `
    <div class="quiz-start">
      <span class="kicker">Ready?</span>
      <h2>Pick your quiz</h2>
      <div class="seg" role="group" aria-label="Quiz topic">
        ${Object.entries(SETS)
          .map(([key, label]) => `<button type="button" data-set="${key}" aria-pressed="${key === chosenSet}">${label}</button>`)
          .join("")}
      </div>
      <p class="status-line">${
        best[chosenSet] !== undefined ? `Your best score here: ${best[chosenSet]}%` : "No score yet — good luck!"
      }</p>
      <button type="button" class="btn btn-primary" id="start">${icon("play")} Start the quiz</button>
    </div>`;

  box.querySelectorAll("[data-set]").forEach((btn) =>
    btn.addEventListener("click", () => {
      chosenSet = btn.dataset.set;
      showStart();
    })
  );
  box.querySelector("#start").addEventListener("click", startRound);
}

function startRound() {
  round = buildRound(chosenSet);
  index = 0;
  score = 0;
  mistakes = [];
  showQuestion();
}

function showQuestion() {
  const q = round[index];
  answered = false;
  box.innerHTML = `
    <div class="quiz-top"><span>Question ${index + 1} of ${round.length}</span><span>Score: ${score}</span></div>
    <div class="progress"><span style="width:${(index / round.length) * 100}%"></span></div>
    <h2>${escapeHtml(q.q)}</h2>
    <div class="options">
      ${q.options
        .map(
          (opt, i) => `<button type="button" class="option" data-option="${i}">
            <span class="letter">${LETTERS[i]}</span><span>${escapeHtml(opt.text)}</span></button>`
        )
        .join("")}
    </div>
    <div id="feedback"></div>`;
}

function answer(choice) {
  if (answered) return;
  answered = true;
  const q = round[index];
  const buttons = box.querySelectorAll(".option");
  const correct = q.options[choice].correct;

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (q.options[i].correct) btn.classList.add("correct");
    else if (i === choice) btn.classList.add("wrong");
  });

  if (correct) score++;
  else mistakes.push(q);

  const last = index === round.length - 1;
  box.querySelector("#feedback").innerHTML = `
    <div class="feedback ${correct ? "good" : "bad"}">
      ${icon(correct ? "circle-check" : "circle-x")}
      <p><strong>${correct ? "Correct!" : "Not quite."}</strong> ${escapeHtml(q.why)}</p>
    </div>
    <div class="quiz-next">
      <button type="button" class="btn btn-primary" id="next">${last ? "See my result" : "Next question"} ${icon("arrow-right")}</button>
    </div>`;
  box.querySelector(".quiz-top span:last-child").textContent = `Score: ${score}`;
  const nextBtn = box.querySelector("#next");
  nextBtn.focus({ preventScroll: true });
  nextBtn.addEventListener("click", () => {
    if (last) showResult();
    else {
      index++;
      showQuestion();
    }
  });
}

function resultMessage(percent) {
  if (percent === 100) return { title: "Perfect score!", text: "Locals will think you grew up there." };
  if (percent >= 70) return { title: "Great guest!", text: "You know your manners. Just a couple of things to remember." };
  if (percent >= 40) return { title: "Not bad!", text: "Read the explanations below before you travel." };
  return { title: "Time to study", text: "No worries — that's what this quiz is for. Try again!" };
}

function showResult() {
  const percent = Math.round((score / round.length) * 100);
  const best = load("quizBest", {});
  const isRecord = best[chosenSet] === undefined || percent > best[chosenSet];
  if (isRecord) {
    best[chosenSet] = percent;
    save("quizBest", best);
  }
  const message = resultMessage(percent);

  box.innerHTML = `
    <div class="quiz-start">
      <span class="kicker">${SETS[chosenSet]} quiz</span>
      <div class="score-ring" style="--p:${percent}"><div>${score}/${round.length}</div></div>
      <h2>${message.title}</h2>
      <p>${message.text}${isRecord && percent > 0 ? " <strong>New best score!</strong>" : ""}</p>
      <div class="hero-actions" style="justify-content:center">
        <button type="button" class="btn btn-primary" id="again">${icon("rotate-ccw")} Try again</button>
        <button type="button" class="btn btn-outline" id="change">Choose another quiz</button>
      </div>
      ${
        mistakes.length
          ? `<div class="review-list"><span class="field-label">Worth remembering</span>${mistakes
              .map((q) => `<div><b>${escapeHtml(q.q)}</b>${escapeHtml(q.why)}</div>`)
              .join("")}</div>`
          : ""
      }
    </div>`;
  box.querySelector("#again").addEventListener("click", startRound);
  box.querySelector("#change").addEventListener("click", showStart);
}

// clicks on answer buttons
box.addEventListener("click", (event) => {
  const option = event.target.closest("[data-option]");
  if (option) answer(Number(option.dataset.option));
});

// keyboard: press 1–4 or A–D to answer
document.addEventListener("keydown", (event) => {
  if (!box.querySelector(".option") || answered) return;
  const key = event.key.toUpperCase();
  const number = "1234".indexOf(key) !== -1 ? "1234".indexOf(key) : LETTERS.indexOf(key);
  if (number >= 0 && number < round[index].options.length) answer(number);
});

document.addEventListener("destinationchange", (event) => {
  // only change the suggested quiz if nobody is in the middle of one
  if (!box.querySelector(".option")) {
    chosenSet = event.detail;
    showStart();
  }
});

showStart();
