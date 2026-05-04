let currencyData = {
    USD: { rate: 1, symbol: "$", flag: "us" },
    EUR: { rate: 0.93, symbol: "€", flag: "eu" },
    VND: { rate: 25450, symbol: "₫", flag: "vn" },
    AUD: { rate: 1.53, symbol: "A$", flag: "au" }
};

async function fetchRates() {
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!res.ok) throw new Error('Không lấy được tỷ giá');
        const data = await res.json();
        Object.keys(currencyData).forEach(code => {
            if (data.rates[code]) {
                currencyData[code].rate = data.rates[code];
            }
        });
    } catch (e) {
        console.error('Lỗi lấy tỷ giá:', e);
    }
}

const inputFrom = document.getElementById('inputFrom');
const inputTo = document.getElementById('inputTo');

const currencyFrom = document.getElementById('currencyFrom');
const currencyTo = document.getElementById('currencyTo');

const flagFrom = document.getElementById('flagFrom');
const flagTo = document.getElementById('flagTo');

const symbolFrom = document.getElementById('symbolFrom');
const symbolTo = document.getElementById('symbolTo');

const rateInfo = document.getElementById('rateInfo');
const btnSwap = document.getElementById('btnSwap');
const btnSwapMobile = document.getElementById('btnSwapMobile');

function formatNumber(num, currencyCode) {
    if (currencyCode === 'VND') {
        return Math.round(num).toLocaleString('vi-VN');
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateUI() {
    const fromCode = currencyFrom.value;
    const toCode = currencyTo.value;

    Array.from(currencyFrom.options).forEach(opt => {
        opt.disabled = opt.value === toCode;
    });
    Array.from(currencyTo.options).forEach(opt => {
        opt.disabled = opt.value === fromCode;
    });

    flagFrom.src = `https://flagcdn.com/w40/${currencyData[fromCode].flag}.png`;
    flagTo.src = `https://flagcdn.com/w40/${currencyData[toCode].flag}.png`;

    symbolFrom.innerText = currencyData[fromCode].symbol;
    symbolTo.innerText = currencyData[toCode].symbol;
}

function parseFormattedNumber(value, currencyCode) {
    if (!value) return 0;
    const text = value.toString();
    if (currencyCode === 'VND') {
        // VND hiển thị dấu chấm làm dấu phân cách hàng nghìn, không có thập phân
        const cleaned = text.replace(/[^0-9\-]/g, '');
        return parseFloat(cleaned) || 0;
    }
    const cleaned = text.replace(/,/g, '').replace(/[^0-9.\-]/g, '');
    return parseFloat(cleaned) || 0;
}

function calculate() {
    const fromCode = currencyFrom.value;
    const toCode = currencyTo.value;
    
    const amountInUSD = parseFloat(inputFrom.value) / currencyData[fromCode].rate;
    let convertedAmount = amountInUSD * currencyData[toCode].rate;

    if (isNaN(convertedAmount)) {
        convertedAmount = 0;
    }

    inputTo.value = formatNumber(convertedAmount, toCode);
    // Cập nhật đoạn text thông báo tỷ giá cơ bản bên dưới (1 đơn vị tiền gửi = ? đơn vị tiền nhận)
    const baseRate = (1 / currencyData[fromCode].rate) * currencyData[toCode].rate;
    rateInfo.innerHTML = `1.00 ${fromCode} = <span class="text-brand-blue">${formatNumber(baseRate, toCode)}</span> ${toCode}`;
}

function swapCurrencies() {
    const currentToValue = parseFormattedNumber(inputTo.value, currencyTo.value);
    let tempCurrency = currencyFrom.value;
    currencyFrom.value = currencyTo.value;
    currencyTo.value = tempCurrency;

    updateUI();
    inputFrom.value = currentToValue || 0;
    calculate();
}

inputFrom.addEventListener('input', calculate);
currencyFrom.addEventListener('change', () => { updateUI(); calculate(); });
currencyTo.addEventListener('change', () => { updateUI(); calculate(); });

btnSwap.addEventListener('click', swapCurrencies);
btnSwapMobile.addEventListener('click', swapCurrencies);

(async function init() {
    await fetchRates();
    updateUI();
    calculate();
})();