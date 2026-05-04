// Dữ liệu mô phỏng tỷ giá so với 1 USD (Base Currency)
const currencyData = {
    USD: { rate: 1, symbol: "$", flag: "us" },
    EUR: { rate: 0.93, symbol: "€", flag: "eu" },
    VND: { rate: 25450, symbol: "₫", flag: "vn" },
    AUD: { rate: 1.53, symbol: "A$", flag: "au" }
};

// Lấy các elements
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

// Hàm format số (VND không lấy số thập phân, các ngoại tệ khác lấy 2 chữ số thập phân)
function formatNumber(num, currencyCode) {
    if (currencyCode === 'VND') {
        return Math.round(num).toLocaleString('vi-VN');
    }
    // Đối với các ngoại tệ khác, dùng toLocaleString với 2 số thập phân
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Cập nhật giao diện (Cờ và Ký hiệu)
function updateUI() {
    const fromCode = currencyFrom.value;
    const toCode = currencyTo.value;

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

// Logic tính toán tỷ giá chuyển đổi
function calculate() {
    const fromCode = currencyFrom.value;
    const toCode = currencyTo.value;
    
    // Chuyển đổi mọi thứ về USD trước (amount / rate của tiền gốc), sau đó nhân với rate của tiền đích
    const amountInUSD = parseFloat(inputFrom.value) / currencyData[fromCode].rate;
    let convertedAmount = amountInUSD * currencyData[toCode].rate;

    // Xử lý nếu input rỗng hoặc không hợp lệ
    if (isNaN(convertedAmount)) {
        convertedAmount = 0;
    }

    inputTo.value = formatNumber(convertedAmount, toCode);
    // Cập nhật đoạn text thông báo tỷ giá cơ bản bên dưới (1 đơn vị tiền gửi = ? đơn vị tiền nhận)
    const baseRate = (1 / currencyData[fromCode].rate) * currencyData[toCode].rate;
    rateInfo.innerHTML = `1.00 ${fromCode} = <span class="text-brand-blue">${formatNumber(baseRate, toCode)}</span> ${toCode}`;
}

// Sự kiện Hoán đổi (Swap)
function swapCurrencies() {
    const currentToValue = parseFormattedNumber(inputTo.value, currencyTo.value);
    let tempCurrency = currencyFrom.value;
    currencyFrom.value = currencyTo.value;
    currencyTo.value = tempCurrency;

    updateUI();
    inputFrom.value = currentToValue || 0;
    calculate();
}

// Lắng nghe sự kiện
inputFrom.addEventListener('input', calculate);
currencyFrom.addEventListener('change', () => { updateUI(); calculate(); });
currencyTo.addEventListener('change', () => { updateUI(); calculate(); });

btnSwap.addEventListener('click', swapCurrencies);
btnSwapMobile.addEventListener('click', swapCurrencies);

// Chạy lần đầu khi load trang
updateUI();
calculate();