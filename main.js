// ── Dữ liệu tiền tệ ──────────────────────────────────────
const currencyData = {
    USD: { rate: 1, symbol: "$", flag: "us" },
    EUR: { rate: 0.93, symbol: "€", flag: "eu" },
    VND: { rate: 25450, symbol: "₫", flag: "vn" },
    AUD: { rate: 1.53, symbol: "A$", flag: "au" }
};

let selectedFrom = "USD";
let selectedTo = "VND";

async function fetchRates() {
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!res.ok) throw new Error('Cannot fetch rates');
        const data = await res.json();
        Object.keys(currencyData).forEach(code => {
            if (data.rates[code]) currencyData[code].rate = data.rates[code];
        });
    } catch (err) {
        console.error('Fetch rates error:', err);
    }
}

const inputFrom = document.getElementById('inputFrom');
const inputTo = document.getElementById('inputTo');
const flagFrom = document.getElementById('flagFrom');
const flagTo = document.getElementById('flagTo');
const labelFrom = document.getElementById('labelFrom');
const labelTo = document.getElementById('labelTo');
const symbolFrom = document.getElementById('symbolFrom');
const symbolTo = document.getElementById('symbolTo');
const rateInfo = document.getElementById('rateInfo');
const btnSwap = document.getElementById('btnSwap');
const btnSwapMobile = document.getElementById('btnSwapMobile');

const triggerFrom = document.getElementById('triggerFrom');
const triggerTo = document.getElementById('triggerTo');
const menuFrom = document.getElementById('menuFrom');
const menuTo = document.getElementById('menuTo');
const chevronFrom = document.getElementById('chevronFrom');
const chevronTo = document.getElementById('chevronTo');

function openMenu(menu, chevron) {
    menu.classList.remove('hidden');
    chevron.style.transform = 'rotate(180deg)';
}

function closeMenu(menu, chevron) {
    menu.classList.add('hidden');
    chevron.style.transform = 'rotate(0deg)';
}

function toggleMenu(menu, chevron, otherMenu, otherChevron) {
    const isOpen = !menu.classList.contains('hidden');
    closeMenu(otherMenu, otherChevron);
    if (isOpen) closeMenu(menu, chevron);
    else openMenu(menu, chevron);
}

triggerFrom.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu(menuFrom, chevronFrom, menuTo, chevronTo);
});

triggerTo.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu(menuTo, chevronTo, menuFrom, chevronFrom);
});

document.addEventListener('click', () => {
    closeMenu(menuFrom, chevronFrom);
    closeMenu(menuTo, chevronTo);
});

function highlightSelected(menu, value) {
    menu.querySelectorAll('.dropdown-option').forEach(li => {
        li.classList.toggle('bg-blue-50', li.dataset.value === value);
        li.classList.toggle('font-semibold', li.dataset.value === value);
    });
}

menuFrom.querySelectorAll('.dropdown-option').forEach(li => {
    li.addEventListener('click', e => {
        e.stopPropagation();
        const val = li.dataset.value;
        const flag = li.dataset.flag;
        const lbl = li.dataset.label;
        if (val === selectedTo) return;
        selectedFrom = val;

        flagFrom.src = `https://flagcdn.com/w40/${flag}.png`;
        labelFrom.textContent = lbl;
        closeMenu(menuFrom, chevronFrom);
        highlightSelected(menuFrom, val);
        updateDisabledOptions();
        updateUI();
        calculate();
    });
});

menuTo.querySelectorAll('.dropdown-option').forEach(li => {
    li.addEventListener('click', e => {
        e.stopPropagation();
        const val = li.dataset.value;
        const flag = li.dataset.flag;
        const lbl = li.dataset.label;
        if (val === selectedFrom) return;
        selectedTo = val;
        flagTo.src = `https://flagcdn.com/w40/${flag}.png`;
        labelTo.textContent = lbl;
        closeMenu(menuTo, chevronTo);
        highlightSelected(menuTo, val);
        updateDisabledOptions();
        updateUI();
        calculate();
    });
});

function updateDisabledOptions() {
    menuFrom.querySelectorAll('.dropdown-option').forEach(li => {
        const disabled = li.dataset.value === selectedTo;
        li.classList.toggle('opacity-40', disabled);
        li.classList.toggle('pointer-events-none', disabled);
    });
    menuTo.querySelectorAll('.dropdown-option').forEach(li => {
        const disabled = li.dataset.value === selectedFrom;
        li.classList.toggle('opacity-40', disabled);
        li.classList.toggle('pointer-events-none', disabled);
    });
}

function updateUI() {
    const from = currencyData[selectedFrom];
    const to = currencyData[selectedTo];
    flagFrom.src = `https://flagcdn.com/w40/${from.flag}.png`;
    flagTo.src = `https://flagcdn.com/w40/${to.flag}.png`;
    symbolFrom.innerText = from.symbol;
    symbolTo.innerText = to.symbol;
}

function formatNumber(num, code) {
    if (code === 'VND') return Math.round(num).toLocaleString('vi-VN');
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseFormattedNumber(value, code) {
    if (!value) return 0;
    const text = value.toString();
    if (code === 'VND') return parseFloat(text.replace(/[^0-9\-]/g, '')) || 0;
    return parseFloat(text.replace(/,/g, '').replace(/[^0-9.\-]/g, '')) || 0;
}

function calculate() {
    const amountInUSD = parseFloat(inputFrom.value) / currencyData[selectedFrom].rate;
    let converted = amountInUSD * currencyData[selectedTo].rate;
    if (isNaN(converted)) converted = 0;
    inputTo.value = formatNumber(converted, selectedTo);
    const baseRate = (1 / currencyData[selectedFrom].rate) * currencyData[selectedTo].rate;
    rateInfo.innerHTML = `1.00 ${selectedFrom} = <span class="text-brand-blue">${formatNumber(baseRate, selectedTo)}</span> ${selectedTo}`;
}

function swapCurrencies() {
    const currentToValue = parseFormattedNumber(inputTo.value, selectedTo);
    [selectedFrom, selectedTo] = [selectedTo, selectedFrom];
    const fromData = currencyData[selectedFrom];
    const toData = currencyData[selectedTo];
    flagFrom.src = `https://flagcdn.com/w40/${fromData.flag}.png`;
    flagTo.src = `https://flagcdn.com/w40/${toData.flag}.png`;
    const fromOption = menuFrom.querySelector(`[data-value="${selectedFrom}"]`);
    const toOption = menuTo.querySelector(`[data-value="${selectedTo}"]`);
    if (fromOption) labelFrom.textContent = fromOption.dataset.label;
    if (toOption) labelTo.textContent = toOption.dataset.label;
    highlightSelected(menuFrom, selectedFrom);
    highlightSelected(menuTo, selectedTo);
    updateDisabledOptions();
    updateUI();
    inputFrom.value = currentToValue || 0;
    calculate();
}

inputFrom.addEventListener('input', calculate);
btnSwap.addEventListener('click', swapCurrencies);
btnSwapMobile.addEventListener('click', swapCurrencies);

(async function () {
    await fetchRates();
    highlightSelected(menuFrom, selectedFrom);
    highlightSelected(menuTo, selectedTo);
    updateDisabledOptions();
    updateUI();
    calculate();
})();