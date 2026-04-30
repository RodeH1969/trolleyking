const BATCH_URL = "./data/batch-1.txt";

const PRODUCT_ORDER = [
  "El Tora Fajita Seasoning 40g",
  "Trimat Advanced Laundry Powder 5kg",
  "Urban Eats Pork Dumplings 750g",
  "Cadbury Chomp bar 30g",
  "Byron Bay Chilli Co. Jalapeno Sauce 250g"
];

const FIXED_PRICE_POOL = [
  1.00,
  3.99,
  5.00,
  4.99,
  6.90,
  8.99,
  11.49,
  15.99,
  17.50,
  24.99,
  1.29,
  22.99
];
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
const priceGridEl = document.getElementById("price-grid");
const trolleyCountImageEl = document.getElementById("trolley-count-image");
const shareTrolleyCountImageEl = document.getElementById("share-trolley-count-image");

const imageCache = new Set();

function showScreen(screen) {
  [screenIntro, screenHow, screenRound, screenShare].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function setDates() {
  const dateText = "April 29, 2026";
  introDateEl.textContent = dateText;
  shareDateEl.textContent = dateText;
}

function parseBatch(text) {
  const blocks = text.split(/ITEM\s*/).map(block => block.trim()).filter(Boolean);
  return blocks.map(block => {
    const name  = (block.match(/NAME:\s*(.+)/)  || [,""])[1].trim();
    const store = (block.match(/STORE:\s*(.+)/) || [,""])[1].trim();
    const price = parseFloat((block.match(/PRICE:\s*([\d.]+)/) || [,"0"])[1]);
    const image = (block.match(/IMAGE:\s*(.+)/) || [,""])[1].trim();
    return { name, store, price, image };
  });
}

function selectTodaysProducts() {
  todaysProducts = PRODUCT_ORDER
    .map(name => items.find(item => item.name === name))
    .filter(Boolean);
}

function buildPricePool() {
  pricePool = FIXED_PRICE_POOL.map(value => ({ value, usedCorrectly: false }));
}

function preloadImage(src) {
  if (!src || imageCache.has(src)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  imageCache.add(src);
}

function preloadRoundImages() {
  todaysProducts.forEach(product => preloadImage(product.image));
}

function updateTrolleyImage(el, count) {
  if (count >= 1 && count <= 5) {
    el.src = `./assets/${count}.png`;
    el.alt = String(count);
    el.classList.remove("hidden");
  } else {
    el.src = "";
    el.alt = "";
    el.classList.add("hidden");
  }
}

function setRoundButtonState() {
  if (phase === "select") {
    btnRoundAction.textContent = "ENTER";
    btnRoundAction.classList.toggle("is-disabled", selectedPriceIndex === null);
  } else {
    btnRoundAction.textContent = "NEXT";
    btnRoundAction.classList.remove("is-disabled");
  }
}

function resetRoundState() {
  selectedPriceIndex = null;
  phase = "select";
  answerTextEl.textContent = "";
  answerIconEl.src = "";
  answerIconEl.alt = "";
  answerIconEl.classList.add("hidden");
  setRoundButtonState();
}

function renderPriceGrid() {
  priceGridEl.innerHTML = "";
  pricePool.forEach((entry, index) => {
    const slot = document.createElement("div");
    slot.className = "price-slot";

    if (entry.usedCorrectly) {
      slot.classList.add("price-slot--empty");
      priceGridEl.appendChild(slot);
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "price-button";
    button.dataset.index = String(index);
    button.textContent = `$${entry.value.toFixed(2)}`;
    if (selectedPriceIndex === index && phase === "select") {
      button.classList.add("is-selected");
    }

    slot.appendChild(button);
    priceGridEl.appendChild(slot);
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
  specialBadgeEl.classList.toggle("hidden", !product.name.toLowerCase().includes("cadbury chomp"));

  updateTrolleyImage(trolleyCountImageEl, trolleyCount);
  renderPriceGrid();
}

function selectPrice(index) {
  if (phase !== "select") return;
  selectedPriceIndex = index;
  answerTextEl.textContent = `$${pricePool[index].value.toFixed(2)}`;
  renderPriceGrid();
  setRoundButtonState();
}

function scoreCurrentRound() {
  if (selectedPriceIndex === null) return;

  const product = todaysProducts[currentIndex];
  const selected = pricePool[selectedPriceIndex];
  const isCorrect = Math.abs(selected.value - product.price) < 0.005;

  phase = "feedback";

  if (isCorrect) {
    trolleyCount += 1;
    selected.usedCorrectly = true;
    updateTrolleyImage(trolleyCountImageEl, trolleyCount);
    answerIconEl.src = "./assets/tick.png";
    answerIconEl.alt = "Correct";
  } else {
    answerIconEl.src = "./assets/cross.png";
    answerIconEl.alt = "Incorrect";
  }

  answerIconEl.classList.remove("hidden");
  renderPriceGrid();
  setRoundButtonState();
}

function goToNextRound() {
  currentIndex += 1;
  if (currentIndex >= todaysProducts.length) {
    showSummary();
    return;
  }
  renderRound();
}

function showSummary() {
  updateTrolleyImage(shareTrolleyCountImageEl, trolleyCount);
  showScreen(screenShare);
}

function shareResult() {
  const text = `TrolleyKing No. 12 — I got ${trolleyCount} out of ${todaysProducts.length} in my trolley on April 29, 2026.`;
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

async function init() {
  setDates();

  const response = await fetch(BATCH_URL);
  const text = await response.text();

  items = parseBatch(text);
  selectTodaysProducts();
  buildPricePool();
  preloadRoundImages();

  btnPlay.addEventListener("click", () => showScreen(screenHow));

  btnHowStart.addEventListener("click", () => {
    currentIndex = 0;
    trolleyCount = 0;
    buildPricePool();
    renderRound();
    showScreen(screenRound);
  });

  btnRoundAction.addEventListener("click", () => {
    if (btnRoundAction.classList.contains("is-disabled")) return;
    if (phase === "select") {
      scoreCurrentRound();
    } else {
      goToNextRound();
    }
  });

  btnShare.addEventListener("click", shareResult);

  priceGridEl.addEventListener("click", event => {
    const button = event.target.closest(".price-button");
    if (!button) return;
    selectPrice(Number(button.dataset.index));
  });

  showScreen(screenIntro);
}

init().catch(console.error);