const BATCH_URL = "./data/batch-1.txt";

const PRODUCT_ORDER = [
  "El Tora Fajita Seasoning 40g",
  "Trimat Advanced Laundry Powder 5kg",
  "Urban Eats Pork Dumplings 750g",
  "Cadbury Chomp bar 30g",
  "Byron Bay Chilli Co. Jalapeno Sauce 250g"
];

const FIXED_PRICE_POOL = [1.00, 3.99, 5.00, 4.99, 8.99, 24.99, 15.99, 1.29, 22.99];

let items = [];
let todaysProducts = [];
let pricePool = [];
let currentIndex = 0;
let trolleyCount = 0;
let selectedPriceIndex = null;
let phase = "select";

const screenIntro = document.getElementById("screen-intro");
const screenHow = document.getElementById("screen-how");
const screenRound = document.getElementById("screen-round");
const screenShare = document.getElementById("screen-share");

const btnPlay = document.getElementById("btn-play");
const btnHowStart = document.getElementById("btn-how-start");
const btnRoundAction = document.getElementById("btn-round-action");
const btnShare = document.getElementById("btn-share");

const introDateEl = document.getElementById("intro-date");
const shareDateEl = document.getElementById("share-date");

const answerTextEl = document.getElementById("answer-text");
const answerIconEl = document.getElementById("answer-icon");

const productImageEl = document.getElementById("product-image");
const productNameEl = document.getElementById("product-name");
const productStoreEl = document.getElementById("product-store");
const specialBadgeEl = document.getElementById("special-badge");

const priceStripEl = document.getElementById("price-strip");

const trolleyCountEl = document.getElementById("trolley-count");
const shareTrolleyCountEl = document.getElementById("share-trolley-count");

function showScreen(screen) {
  [screenIntro, screenHow, screenRound, screenShare].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function setMeta() {
  const dateText = "April 29, 2026";
  introDateEl.textContent = dateText;
  shareDateEl.textContent = dateText;
}

function parseBatch(text) {
  const blocks = text.split(/ITEM\s*/).map(b => b.trim()).filter(Boolean);

  return blocks.map(block => {
    const name = (block.match(/NAME:\s*(.+)/) || [, ""])[1].trim();
    const store = (block.match(/STORE:\s*(.+)/) || [, ""])[1].trim();
    const price = parseFloat((block.match(/PRICE:\s*([\d.]+)/) || [, "0"])[1]);
    const image = (block.match(/IMAGE:\s*(.+)/) || [, ""])[1].trim();

    return { name, store, price, image };
  });
}

function pickProducts() {
  todaysProducts = PRODUCT_ORDER
    .map(name => items.find(item => item.name === name))
    .filter(Boolean);
}

function buildPricePool() {
  pricePool = FIXED_PRICE_POOL.map(value => ({
    value,
    usedCorrectly: false
  }));
}

function resetRoundState() {
  selectedPriceIndex = null;
  phase = "select";
  answerTextEl.textContent = "";
  answerIconEl.src = "";
  answerIconEl.alt = "";
  answerIconEl.classList.add("hidden");
  btnRoundAction.textContent = "ENTER";
}

function renderPriceStrip() {
  priceStripEl.innerHTML = "";

  pricePool.forEach((entry, index) => {
    const slot = document.createElement("div");
    slot.className = "tk-price-slot";

    if (entry.usedCorrectly) {
      slot.classList.add("tk-price-slot--empty");
      slot.textContent = "$0.00";
      priceStripEl.appendChild(slot);
      return;
    }

    const button = document.createElement("button");
    button.className = "tk-price-btn";
    button.textContent = `$${entry.value.toFixed(2)}`;
    button.dataset.index = String(index);

    if (selectedPriceIndex === index && phase === "select") {
      button.classList.add("is-selected");
    }

    slot.appendChild(button);
    priceStripEl.appendChild(slot);
  });
}

function renderRound() {
  const product = todaysProducts[currentIndex];
  if (!product) return;

  resetRoundState();

  productImageEl.src = product.image;
  productImageEl.alt = product.name;

  productNameEl.textContent = product.name;
  productStoreEl.textContent = product.store;

  if (product.name.toLowerCase().includes("cadbury chomp")) {
    specialBadgeEl.classList.remove("hidden");
  } else {
    specialBadgeEl.classList.add("hidden");
  }

  trolleyCountEl.textContent = String(trolleyCount);
  renderPriceStrip();
}

function handlePriceClick(event) {
  if (phase !== "select") return;

  const button = event.target.closest(".tk-price-btn");
  if (!button) return;

  selectedPriceIndex = Number(button.dataset.index);
  answerTextEl.textContent = `$${pricePool[selectedPriceIndex].value.toFixed(2)}`;
  renderPriceStrip();
}

function handleRoundAction() {
  if (phase === "select") {
    if (selectedPriceIndex === null) return;

    const product = todaysProducts[currentIndex];
    const selected = pricePool[selectedPriceIndex];
    const isCorrect = Math.abs(selected.value - product.price) < 0.005;

    if (isCorrect) {
      trolleyCount += 1;
      trolleyCountEl.textContent = String(trolleyCount);
      pricePool[selectedPriceIndex].usedCorrectly = true;
      answerIconEl.src = "./assets/tick.png";
      answerIconEl.alt = "Correct";
    } else {
      answerIconEl.src = "./assets/cross.png";
      answerIconEl.alt = "Incorrect";
    }

    answerIconEl.classList.remove("hidden");
    phase = "feedback";
    btnRoundAction.textContent = "NEXT";
    renderPriceStrip();
    return;
  }

  if (phase === "feedback") {
    currentIndex += 1;

    if (currentIndex >= todaysProducts.length) {
      showSummary();
      return;
    }

    renderRound();
  }
}

function showSummary() {
  shareTrolleyCountEl.textContent = String(trolleyCount);
  showScreen(screenShare);
}

function copyShare() {
  const text = `TrolleyKing No. 12 — I got ${trolleyCount} out of ${todaysProducts.length} in my trolley on April 29, 2026.`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
  }
}

async function init() {
  setMeta();

  const response = await fetch(BATCH_URL);
  const text = await response.text();

  items = parseBatch(text);
  pickProducts();
  buildPricePool();
}

btnPlay.addEventListener("click", () => {
  showScreen(screenHow);
});

btnHowStart.addEventListener("click", () => {
  currentIndex = 0;
  trolleyCount = 0;
  buildPricePool();
  renderRound();
  showScreen(screenRound);
});

priceStripEl.addEventListener("click", handlePriceClick);
btnRoundAction.addEventListener("click", handleRoundAction);
btnShare.addEventListener("click", copyShare);

init().catch(console.error);