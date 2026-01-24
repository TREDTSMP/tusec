import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://xqkvnkijbdruduarbalq.supabase.co";
const supabaseAnonKey = "sb_publishable_LoY6j9WujEEuZwOXoaXufA_Q280_CwQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentUser = null;

async function loadBalance() {
  if (!currentUser) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("tc_balance")
    .eq("id", currentUser.id)
    .single();

  if (!error && data) {
    const balance = typeof data.tc_balance === "number" ? data.tc_balance : 0;
    const el = document.getElementById("tcBalance");
    if (el) {
      el.textContent = balance.toFixed(2) + " TC";
      el.style.display = "inline-block";
    }
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;
  updateAuthUI();
});

// ---------------- Theme & UI ----------------
const themeToggleBtn = document.getElementById("theme-toggle");
const themeToggleDarkIcon = document.getElementById("theme-toggle-dark-icon");
const themeToggleLightIcon = document.getElementById("theme-toggle-light-icon");
let chartInstance = null;

if (
  localStorage.getItem("color-theme") === "dark" ||
  (!("color-theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
  if (themeToggleLightIcon) themeToggleLightIcon.classList.remove("hidden");
} else {
  document.documentElement.classList.remove("dark");
  if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove("hidden");
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", function () {
    if (themeToggleDarkIcon) themeToggleDarkIcon.classList.toggle("hidden");
    if (themeToggleLightIcon) themeToggleLightIcon.classList.toggle("hidden");
    document.documentElement.classList.toggle("dark");
    const currentTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    localStorage.setItem("color-theme", currentTheme);
    if (chartInstance) {
      const symbol =
        document.getElementById("stock-search").value.toUpperCase() || "TTCO";
      renderChart(generateStockData(100), currentTheme, symbol);
    }
  });
}

const tcBalanceEl = document.getElementById("tcBalance");
if (tcBalanceEl) {
  tcBalanceEl.style.display = currentUser ? "inline-block" : "none";
}

const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    const isExpanded =
      mobileMenuButton.getAttribute("aria-expanded") === "true" || false;
    mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
    mobileMenuButton
      .querySelectorAll("svg")
      .forEach((icon) => icon.classList.toggle("hidden"));
  });
}

// Modals & modal helpers
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const priceAlertModal = document.getElementById("priceAlertModal");

const loginBtnNav = document.getElementById("loginBtnNav");
const loginBtnMobile = document.getElementById("loginBtnMobile");
const closeLoginModalBtn = document.getElementById("closeLoginModal");
const switchToRegisterBtn = document.getElementById("switchToRegister");

const closeRegisterModalBtn = document.getElementById("closeRegisterModal");
const switchToLoginBtn = document.getElementById("switchToLogin");

const setPriceAlertBtn = document.getElementById("setPriceAlertBtn");
const closePriceAlertModalBtn = document.getElementById("closePriceAlertModal");

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("active");
  setTimeout(() => {
    const inner = modal.querySelector('div[class*="bg-white"]');
    if (inner) {
      inner.classList.remove("scale-95", "opacity-0");
      inner.classList.add("scale-100", "opacity-100");
    }
  }, 10);
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  if (!modal) return;
  const inner = modal.querySelector('div[class*="bg-white"]');
  if (inner) {
    inner.classList.remove("scale-100", "opacity-100");
    inner.classList.add("scale-95", "opacity-0");
  }
  setTimeout(() => {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }, 300);
}

if ([loginBtnNav, loginBtnMobile].every(Boolean)) {
  [loginBtnNav, loginBtnMobile].forEach((btn) =>
    btn.addEventListener("click", () => openModal(loginModal))
  );
}
if (closeLoginModalBtn) closeLoginModalBtn.addEventListener("click", () => closeModal(loginModal));
if (switchToRegisterBtn)
  switchToRegisterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(registerModal);
  });

if (closeRegisterModalBtn)
  closeRegisterModalBtn.addEventListener("click", () => closeModal(registerModal));
if (switchToLoginBtn)
  switchToLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(registerModal);
    openModal(loginModal);
  });

if (setPriceAlertBtn) {
  setPriceAlertBtn.addEventListener("click", () => {
    const currentSymbol =
      document.getElementById("stock-search").value.toUpperCase() || "STOCK";
    const el = document.getElementById("alertStockSymbol");
    if (el) el.textContent = `For ${currentSymbol}`;
    openModal(priceAlertModal);
  });
}
if (closePriceAlertModalBtn)
  closePriceAlertModalBtn.addEventListener("click", () => closeModal(priceAlertModal));

// ================= Market Hours =================
function isMarketOpen() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 6 && hour < 24; // 6:00 AM → 12:00 Midnight
}

const initialStockPrices = {
  RTCO: {
    name: 'Royal Trading Company',
    price: 12500,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 12500,
    high: 12500,
    low: 12500,
    dayHigh: 12500,
    dayLow: 12500,
  },
  UTCO: {
    name: 'Union Technologies Inc.',
    price: 18200,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 18200,
    high: 18200,
    low: 18200,
    dayHigh: 18200,
    dayLow: 18200,
  },
  TRI: {
    name: 'TREDT Industries Inc.',
    price: 30500,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 30500,
    high: 30500,
    low: 30500,
    dayHigh: 30500,
    dayLow: 30500,
  },
  IBT: {
    name: 'Imperial Bank of TREDT',
    price: 45000,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 45000,
    high: 45000,
    low: 45000,
    dayHigh: 45000,
    dayLow: 45000,
  },
  VSB: {
    name: 'Vizlandian State Bank',
    price: 41000,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 41000,
    high: 41000,
    low: 41000,
    dayHigh: 41000,
    dayLow: 41000,
  },
  TIRC: {
    name: 'TREDT Imperial Railways Company',
    price: 27800,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 27800,
    high: 27800,
    low: 27800,
    dayHigh: 27800,
    dayLow: 27800,
  },
  TTCO: {
    name: 'TREDT Trading Company Pvt. Ltd.',
    price: 36000,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 36000,
    high: 36000,
    low: 36000,
    dayHigh: 36000,
    dayLow: 36000,
  },
  CBPSC: {
    name: 'Crabland Black Powder & Smithing Company',
    price: 22400,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 22400,
    high: 22400,
    low: 22400,
    dayHigh: 22400,
    dayLow: 22400,
  },
  VCGC: {
    name: 'Vizlandia Grain & Winery Co.',
    price: 19800,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 19800,
    high: 19800,
    low: 19800,
    dayHigh: 19800,
    dayLow: 19800,
  },
  LCEC: {
    name: 'Lost City Exploration Company',
    price: 54000,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 54000,
    high: 54000,
    low: 54000,
    dayHigh: 54000,
    dayLow: 54000,
  },
  FTM: {
    name: 'Flanders Trading & Mercantile',
    price: 16700,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 16700,
    high: 16700,
    low: 16700,
    dayHigh: 16700,
    dayLow: 16700,
  },
  KIS: {
    name: 'Kaisergrad Industrial Syndicate',
    price: 62000,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 62000,
    high: 62000,
    low: 62000,
    dayHigh: 62000,
    dayLow: 62000,
  },
  TBC: {
    name: 'Tsarland Broadcasting Company',
    price: 14400,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 14400,
    high: 14400,
    low: 14400,
    dayHigh: 14400,
    dayLow: 14400,
  },
  UDC: {
    name: 'Crabland Defense Contractors Ltd.',
    price: 71000,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 71000,
    high: 71000,
    low: 71000,
    dayHigh: 71000,
    dayLow: 71000,
  },
  CEDC: {
    name: 'Crown Estate Development Corp.',
    price: 38500,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 38500,
    high: 38500,
    low: 38500,
    dayHigh: 38500,
    dayLow: 38500,
  },
  BCC: {
    name: 'Bob & Company',
    price: 9500,
    change: '+0.00',
    changePercent: '+0.00%',
    open: 9500,
    high: 9500,
    low: 9500,
    dayHigh: 9500,
    dayLow: 9500,
  },
};

// Build dummyStockData correctly using the stock objects
const dummyStockData = {};
Object.entries(initialStockPrices).forEach(([symbol, stock]) => {
  const p = typeof stock.price === "number" ? stock.price : Number(stock.price || 0);
  dummyStockData[symbol] = {
    ...stock,
    price: p,
    open: stock.open ?? p,
    high: stock.high ?? p,
    low: stock.low ?? p,
    dayHigh: stock.dayHigh ?? p,
    dayLow: stock.dayLow ?? p,
    initial: p,
  };
});

// Ticker populate
const tickerMove = document.querySelector(".ticker-move");
function populateTicker() {
  if (!tickerMove) return;
  let tickerHTML = "";
  const symbols = Object.keys(dummyStockData);
  for (let i = 0; i < 2; i++) {
    symbols.forEach((symbol) => {
      const stock = dummyStockData[symbol];
      const changeClass = stock.change && stock.change.startsWith("+")
        ? "text-green-400"
        : "text-red-400";
      tickerHTML += `
        <div class="ticker-item inline-flex items-center">
            <span class="font-semibold">${symbol}</span>
            <span class="ml-2 text-sm">${stock.price.toFixed(2)}</span>
            <span class="ml-1 text-xs ${changeClass}">${stock.change} (${stock.changePercent})</span>
        </div>
      `;
    });
  }
  tickerMove.innerHTML = tickerHTML;
}
populateTicker();

// Update stock prices periodically but only during market hours
setInterval(() => {
  if (!isMarketOpen()) {
    // Market closed — don't simulate intraday movement
    return;
  }
  Object.keys(dummyStockData).forEach((symbol) => {
    const stock = dummyStockData[symbol];
    const randomChange = (Math.random() * 0.5 - 0.25); // -0.25 .. +0.25
    stock.price = parseFloat((stock.price + randomChange).toFixed(2));
    if (stock.price < 0) stock.price = 0.1;

    const oldChangeVal = parseFloat(stock.change) || 0;
    const newChangeVal = parseFloat((oldChangeVal + (Math.random() * 0.1 - 0.05)).toFixed(2));
    const newChangePercentVal = parseFloat(((newChangeVal / (Math.max(0.01, stock.price - newChangeVal))) * 100).toFixed(2));

    stock.change = (newChangeVal > 0 ? "+" : "") + newChangeVal.toFixed(2);
    stock.changePercent = (newChangeVal > 0 ? "+" : "") + newChangePercentVal.toFixed(2) + "%";

    // update dayHigh/dayLow
    stock.dayHigh = Math.max(stock.dayHigh ?? stock.price, stock.price);
    stock.dayLow = Math.min(stock.dayLow ?? stock.price, stock.price);
  });
  populateTicker();
}, 5000);
const MAX_PRICE = 200000;

if (stock.price >= MAX_PRICE) {
  stock.price -= Math.random() * 500; // slow cooldown
}

// ---------------- Search / Details / Chart ----------------
const searchInput = document.getElementById("stock-search");
const searchButton = document.getElementById("search-button");
const stockDetailsDiv = document.getElementById("stock-details");
const companyNameHeader = document.getElementById("company-name");
const searchErrorDiv = document.getElementById("search-error");
const addToWatchlistBtn = document.getElementById("addToWatchlistBtn");

if (searchButton) searchButton.addEventListener("click", performSearch);
if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch();
  });
}

function performSearch() {
  const searchTerm = (searchInput?.value || "").toUpperCase().trim();
  if (searchErrorDiv) searchErrorDiv.classList.add("hidden");

  if (!searchTerm) {
    displayStockDetails(null);
    if (chartInstance) {
      chartInstance.remove();
      chartInstance = null;
      const loader = document.getElementById("chart-loader");
      if (loader) loader.classList.remove("hidden");
    }
    if (addToWatchlistBtn) addToWatchlistBtn.disabled = true;
    if (setPriceAlertBtn) setPriceAlertBtn.disabled = true;
    return;
  }

  const stock = dummyStockData[searchTerm];
  displayStockDetails(stock, searchTerm);

  if (stock) {
    const loader = document.getElementById("chart-loader");
    if (loader) loader.classList.remove("hidden");
    renderChart(generateStockData(100), localStorage.getItem("color-theme") || "light", searchTerm);
    if (addToWatchlistBtn) {
      addToWatchlistBtn.disabled = false;
      const inWL = isStockInWatchlist(searchTerm);
      addToWatchlistBtn.textContent = inWL ? "Remove from Watchlist" : "Add to Watchlist";
      addToWatchlistBtn.classList.toggle("bg-red-500", inWL);
      addToWatchlistBtn.classList.toggle("hover:bg-red-600", inWL);
      addToWatchlistBtn.classList.toggle("bg-green-500", !inWL);
      addToWatchlistBtn.classList.toggle("hover:bg-green-600", !inWL);
    }
    if (setPriceAlertBtn) setPriceAlertBtn.disabled = false;
  } else {
    if (searchErrorDiv) searchErrorDiv.classList.remove("hidden");
    if (chartInstance) {
      chartInstance.remove();
      chartInstance = null;
      const loader = document.getElementById("chart-loader");
      if (loader) loader.classList.remove("hidden");
    }
    if (addToWatchlistBtn) addToWatchlistBtn.disabled = true;
    if (setPriceAlertBtn) setPriceAlertBtn.disabled = true;
  }
}

function displayStockDetails(stock, symbol = "N/A") {
  if (stock) {
    if (companyNameHeader) companyNameHeader.textContent = `${stock.name} (${symbol})`;
    const changeClass = stock.change && stock.change.startsWith("+")
      ? "text-green-500 dark:text-green-400"
      : "text-red-500 dark:text-red-400";
    if (stockDetailsDiv) {
      stockDetailsDiv.innerHTML = `
      <div class="flex justify-between items-baseline">
          <p class="text-3xl font-bold">${stock.price.toFixed(2)} <span class="text-xs text-gray-500 dark:text-gray-400">USD</span></p>
          <p class="text-lg ${changeClass}">${stock.change} (${stock.changePercent})</p>
      </div>
      <hr class="my-2 border-gray-200 dark:border-gray-600">
      <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <p><strong>Open:</strong> ${Number(stock.open).toFixed(2)}</p>
          <p><strong>High:</strong> ${Number(stock.high).toFixed(2)}</p>
          <p><strong>Low:</strong> ${Number(stock.low).toFixed(2)}</p>
          <p><strong>Day High:</strong> ${Number(stock.dayHigh).toFixed(2)}</p>
          <p><strong>Day Low:</strong> ${Number(stock.dayLow).toFixed(2)}</p>
      </div>
      `;
    }
  } else {
    if (companyNameHeader) companyNameHeader.textContent = "Company Overview";
    if (stockDetailsDiv)
      stockDetailsDiv.innerHTML = `<p class="text-sm text-gray-600 dark:text-gray-400">Search for a stock to see details.</p>`;
  }
}

function generateStockData(count) {
  const data = [];
  let lastClose = 50 + Math.random() * 150;
  let time = new Date();
  time.setDate(time.getDate() - count);

  for (let i = 0; i < count; i++) {
    time.setDate(time.getDate() + 1);
    const open = lastClose + (Math.random() - 0.5) * 5;
    const high = Math.max(open, lastClose) + Math.random() * 5;
    const low = Math.min(open, lastClose) - Math.random() * 5;
    const close = low + Math.random() * (high - low);
    lastClose = close;

    data.push({
      time: time.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
  }
  return data;
}

function renderChart(data, theme, symbol) {
  const chartContainer = document.getElementById("chart-container");
  const chartLoader = document.getElementById("chart-loader");

  if (!chartContainer) return;

  if (chartInstance) {
    chartInstance.remove();
  }

  chartInstance = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: chartContainer.clientHeight,
    layout: {
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      textColor: theme === "dark" ? "#d1d5db" : "#111827",
    },
    grid: {
      vertLines: { color: theme === "dark" ? "#374151" : "#e5e7eb" },
      horzLines: { color: theme === "dark" ? "#374151" : "#e5e7eb" },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    priceScale: {
      borderColor: theme === "dark" ? "#4b5563" : "#cccccc",
    },
    timeScale: {
      borderColor: theme === "dark" ? "#4b5563" : "#cccccc",
      timeVisible: true,
      secondsVisible: false,
    },
    watermark: {
      color: theme === "dark" ? "rgba(209, 213, 219, 0.1)" : "rgba(0, 0, 0, 0.1)",
      visible: true,
      text: symbol,
      fontSize: 48,
      horzAlign: "center",
      vertAlign: "center",
    },
  });

  const candleSeries = chartInstance.addCandlestickSeries({
    upColor: theme === "dark" ? "#10b981" : "#22c55e",
    downColor: theme === "dark" ? "#ef4444" : "#dc2626",
    borderDownColor: theme === "dark" ? "#ef4444" : "#dc2626",
    borderUpColor: theme === "dark" ? "#10b981" : "#22c55e",
    wickDownColor: theme === "dark" ? "#ef4444" : "#dc2626",
    wickUpColor: theme === "dark" ? "#10b981" : "#22c55e",
  });

  candleSeries.setData(data);
  chartInstance.timeScale().fitContent();
  if (chartLoader) chartLoader.classList.add("hidden");

  window.addEventListener("resize", () => {
    if (chartInstance && chartContainer.clientWidth > 0 && chartContainer.clientHeight > 0) {
      chartInstance.resize(chartContainer.clientWidth, chartContainer.clientHeight);
    }
  });
}

// initial render
renderChart(generateStockData(100), localStorage.getItem("color-theme") || "light", "TTCO");

// ---------------- Market Movers ----------------
const topGainersList = document.getElementById("top-gainers-list");
const topLosersList = document.getElementById("top-losers-list");

function populateMarketMovers() {
  const stocksArray = Object.entries(dummyStockData).map(([symbol, data]) => ({
    symbol,
    ...data,
  }));

  stocksArray.forEach((stock) => {
    stock.numericChangePercent = parseFloat(
      String(stock.changePercent || "0").replace("+", "").replace("%", "")
    );
  });

  stocksArray.sort((a, b) => b.numericChangePercent - a.numericChangePercent);

  const gainers = stocksArray.filter((s) => s.numericChangePercent > 0).slice(0, 5);
  const losers = stocksArray
    .filter((s) => s.numericChangePercent < 0)
    .sort((a, b) => a.numericChangePercent - b.numericChangePercent)
    .slice(0, 5);

  if (topGainersList) {
    topGainersList.innerHTML = gainers.length
      ? gainers
          .map(
            (stock) => `
                <li class="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 cursor-pointer" onclick="searchInput.value='${stock.symbol}'; performSearch(); document.getElementById('stock-search').scrollIntoView({ behavior: 'smooth' });">
                <div>
                <span class="font-semibold text-gray-800 dark:text-gray-200">${stock.symbol}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 block">${stock.name.substring(0, 20)}${stock.name.length > 20 ? "..." : ""}</span>
                </div>
                <div class="text-right">
                <span class="font-medium text-gray-800 dark:text-gray-200">${Number(stock.price).toFixed(2)}</span>
                <span class="block text-sm text-green-500 dark:text-green-400">${stock.changePercent}</span>
                </div>
                </li>
            `
          )
          .join("")
      : '<li class="text-sm text-gray-500 dark:text-gray-400">No significant gainers today.</li>';
  }

  if (topLosersList) {
    topLosersList.innerHTML = losers.length
      ? losers
          .map(
            (stock) => `
            <li class="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 cursor-pointer" onclick="searchInput.value='${stock.symbol}'; performSearch(); document.getElementById('stock-search').scrollIntoView({ behavior: 'smooth' });">
                <div>
                    <span class="font-semibold text-gray-800 dark:text-gray-200">${stock.symbol}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 block">${stock.name.substring(0, 20)}${stock.name.length > 20 ? "..." : ""}</span>
                </div>
                <div class="text-right">
                    <span class="font-medium text-gray-800 dark:text-gray-200">${Number(stock.price).toFixed(2)}</span>
                    <span class="block text-sm text-red-500 dark:text-red-400">${stock.changePercent}</span>
                </div>
            </li>
            `
          )
          .join("")
      : '<li class="text-sm text-gray-500 dark:text-gray-400">No significant losers today.</li>';
  }
}
populateMarketMovers();
setInterval(populateMarketMovers, 15000);

// ---------------- Watchlist & Portfolio ----------------
const watchlistItemsDiv = document.getElementById("watchlist-items");
const emptyWatchlistMessage = document.getElementById("empty-watchlist-message");
let watchlist = JSON.parse(localStorage.getItem("stockWatchlist") || "[]");

function renderWatchlist() {
  if (!watchlistItemsDiv) return;
  if (watchlist.length === 0) {
    watchlistItemsDiv.innerHTML = "";
    if (emptyWatchlistMessage) emptyWatchlistMessage.classList.remove("hidden");
    return;
  }
  if (emptyWatchlistMessage) emptyWatchlistMessage.classList.add("hidden");
  watchlistItemsDiv.innerHTML = watchlist
    .map((symbol) => {
      const stock = dummyStockData[symbol];
      if (!stock) return "";
      const changeClass = stock.change && stock.change.startsWith("+")
        ? "text-green-500 dark:text-green-400"
        : "text-red-500 dark:text-red-400";
      return `
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 cursor-pointer" onclick="searchInput.value='${symbol}'; performSearch(); document.getElementById('stock-search').scrollIntoView({ behavior: 'smooth' });">
      <div class="flex justify-between items-start mb-2">
          <div>
              <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-100">${symbol}</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">${stock.name}</p>
          </div>
           <button class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs p-1" onclick="event.stopPropagation(); toggleWatchlist('${symbol}');" title="Remove from watchlist">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
          </button>
      </div>
      <div class="flex justify-between items-baseline">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">${Number(stock.price).toFixed(2)}</p>
          <p class="text-md ${changeClass}">${stock.changePercent}</p>
      </div>
  </div>
  `;
    })
    .join("");
}

function isStockInWatchlist(symbol) {
  return watchlist.includes(symbol);
}

function toggleWatchlist(symbol) {
  if (!symbol) return;
  const stockExists = dummyStockData[symbol];
  if (!stockExists) {
    console.warn(`Stock ${symbol} not found in dummy data. Cannot add to watchlist.`);
    return;
  }

  const index = watchlist.indexOf(symbol);
  if (index > -1) {
    watchlist.splice(index, 1);
  } else {
    watchlist.push(symbol);
  }
  localStorage.setItem("stockWatchlist", JSON.stringify(watchlist));
  renderWatchlist();

  // Update search page button if applicable
  const currentSearchSymbol = (searchInput?.value || "").toUpperCase().trim();
  if (currentSearchSymbol === symbol && addToWatchlistBtn) {
    const inWL = isStockInWatchlist(symbol);
    addToWatchlistBtn.textContent = inWL ? "Remove from Watchlist" : "Add to Watchlist";
    addToWatchlistBtn.classList.toggle("bg-red-500", inWL);
    addToWatchlistBtn.classList.toggle("hover:bg-red-600", inWL);
    addToWatchlistBtn.classList.toggle("bg-green-500", !inWL);
    addToWatchlistBtn.classList.toggle("hover:bg-green-600", !inWL);
  }
}

if (addToWatchlistBtn) {
  addToWatchlistBtn.addEventListener("click", () => {
    const symbol = (searchInput?.value || "").toUpperCase().trim();
    toggleWatchlist(symbol);
  });
}

// Load portfolio (kept separate and global)
async function loadPortfolio() {
  if (!currentUser) return;

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", currentUser.id);

 const container = document.getElementById("portfolio-items");
  if (!container) return;
  container.innerHTML = "";

  if (error) {
    container.innerHTML = "<p>Error loading holdings</p>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No holdings yet</p>";
    return;
  }

  data.forEach((item) => {
    container.innerHTML += `
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 class="font-bold">${item.symbol}</h4>
        <p>Qty: ${item.quantity}</p>
        <p>Avg Price: ${item.avg_price} TC</p>
      </div>
    `;
  });
}

// ---------------- News Feed (assumes dummyNews exists) ----------------
const newsFeedDiv = document.getElementById("news-feed");
function populateNewsFeed() {
  const currentSymbol = (searchInput?.value || "").toUpperCase().trim();
  let filteredNews = typeof dummyNews !== "undefined" ? dummyNews : [];
  if (currentSymbol && dummyStockData[currentSymbol]) {
    const symbolSpecificNews = filteredNews.filter((news) => news.symbol === currentSymbol);
    const generalNews = filteredNews.filter((news) => news.symbol === "General" || news.symbol !== currentSymbol);
    filteredNews = [...symbolSpecificNews, ...generalNews].slice(0, 5);
  } else {
    filteredNews = filteredNews.slice(0, 5);
  }

  if (!newsFeedDiv) return;
  newsFeedDiv.innerHTML = filteredNews.length
    ? filteredNews
        .map(
          (news) => `
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
          <a href="#" class="block hover:text-indigo-600 dark:hover:text-indigo-400">
              <h4 class="text-md font-semibold text-gray-800 dark:text-gray-100 mb-1">${news.title}</h4>
          </a>
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>${news.source}</span>
              <span>${news.time}</span>
          </div>
      </div>
            `
        )
        .join("")
    : '<p class="text-sm text-gray-500 dark:text-gray-400">No news available at the moment.</p>';
}

if (searchButton) searchButton.addEventListener("click", populateNewsFeed);
if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") populateNewsFeed();
  });
}

// ---------------- Auth UI (merged & safe) ----------------
function updateAuthUI() {
  const buyBtn = document.getElementById("buyBtn");
  const sellBtn = document.getElementById("sellBtn");
  const loginBtnNavLocal = document.getElementById("loginBtnNav");
  const loginBtnMobileLocal = document.getElementById("loginBtnMobile");

  if (buyBtn) buyBtn.disabled = !currentUser;
  if (sellBtn) sellBtn.disabled = !currentUser;

  if (loginBtnNavLocal) loginBtnNavLocal.textContent = currentUser ? "Dashboard" : "Login";
  if (loginBtnMobileLocal) loginBtnMobileLocal.textContent = currentUser ? "Dashboard" : "Login";

  // show/hide tc balance and load balances/portfolio if logged in
  const tcEl = document.getElementById("tcBalance");
  if (tcEl) tcEl.style.display = currentUser ? "inline-block" : "none";

  if (currentUser) {
    loadBalance();
    loadPortfolio();
  }
}

// Buy/Sell quick handlers
const buyBtnEl = document.getElementById("buyBtn");
if (buyBtnEl) {
  buyBtnEl.addEventListener("click", () => {
    if (!currentUser) {
      openModal(loginModal);
      return;
    }
    alert("Buy flow coming next 🚀");
  });
}
const sellBtnEl = document.getElementById("sellBtn");
if (sellBtnEl) {
  sellBtnEl.addEventListener("click", () => {
    if (!currentUser) {
      openModal(loginModal);
      return;
    }
    alert("Sell flow coming next 🚀");
  });
}

// ---------------- Auth forms ----------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    // Everyone starts with 100,000 TC by default
    await supabase.from("profiles").insert({
      id: user.id,
      username,
      membership: "PPM",
      tc_balance: 100000,
    });

    alert("Account created! You can now log in.");
    closeModal(registerModal);
    openModal(loginModal);
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Logged in successfully!");
      closeModal(loginModal);
    }
  });
}

// Get current user once (wrapped to avoid top-level await)
// We set currentUser if present and update UI accordingly
(async () => {
  try {
    const res = await supabase.auth.getUser();
    const user = res?.data?.user || null;
    currentUser = user;
    updateAuthUI();
  } catch (err) {
    // ignore non-fatal
    console.warn("Unable to auto-fetch user at load:", err);
  }
})();

// ---------------- Misc init ----------------
const currentYearEl = document.getElementById("currentYear");
if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  renderWatchlist();
  populateNewsFeed();
  displayStockDetails(null);
  if (!searchInput?.value) {
    if (searchInput) searchInput.value = "TTCO";
    performSearch();
  }

function updateMarketStatusUI() {
  const el = document.getElementById("marketStatus");
  if (!el) return;

  if (isMarketOpen()) {
    el.textContent = "Market Open";
    el.className = "text-green-500 font-semibold";
  } else {
    el.textContent = "Market Closed";
    el.className = "text-red-500 font-semibold";
  }
}

setInterval(updateMarketStatusUI, 60000);
updateMarketStatusUI();

  document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navbarHeight = document.querySelector("nav")?.offsetHeight || 0;
        const tickerHeight = document.querySelector(".ticker-wrap")?.offsetHeight || 0;
        const offsetPosition = targetElement.offsetTop - navbarHeight - tickerHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        if (!mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.add("hidden");
          mobileMenuButton.setAttribute("aria-expanded", "false");
          mobileMenuButton
            .querySelectorAll("svg")
            .forEach((icon) => icon.classList.toggle("hidden"));
        }
      }
    });
  });
});



