
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const spinBtn = document.getElementById('spinBtn');
const winnerDiv = document.getElementById('winner');

const resultOverlay = document.getElementById('resultOverlay');
const resultBox = document.querySelector('.result-box');
const resultText = document.getElementById('resultText');

/* 載入中央人物圖片 */
const centerImage = new Image();
centerImage.src = "../images/center.png";

centerImage.onload = () => {
    drawWheel();
};

centerImage.onerror = () => {
    console.error("無法載入 center.png，請確認圖片與 HTML 位於同一資料夾。");
};

/* 臺北 25 個景點 */
let options = [
    "臺北101",
    "國父紀念館",
    "中正紀念堂",
    "西門町",
    "大稻埕碼頭",
    "松山文創園區",
    "華山1914",
    "迪化街",
    "剝皮寮",
    "榕錦時光",
    "赤峰街",
    "陽明山",
    "擎天崗",
    "象山步道",
    "大安森林公園",
    "北投地熱谷",
    "貓空",
    "故宮博物院",
    "臺北市立美術館",
    "臺北植物園",
    "國家兩廳院",
    "臺北市立動物園",
    "兒童新樂園",
    "士林夜市",
    "寧夏夜市"
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.options = options;

/* 轉盤扇形配色 */
const colors = [
    '#F4C7D5',
    '#F6D9C8',
    '#F8E8B8',
    '#D8E8D5',
    '#D5E5F2',
    '#DDD5EB',
    '#EBCFD8',
    '#F3E1D2'
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.colors = colors;

/* 外圍跑馬燈 */
const lightColors = [
    '#FFE6A7',
    '#FFFFFF',
    '#F4B8CC',
    '#D5E5F2',
    '#F8D9B8'
];

let startAngle = 0;
let arc = Math.PI * 2 / options.length;
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;

const CONSTANT_SPEED_TIME = 3000;
const DECELERATION_TIME = 2000;
const spinTimeTotal = CONSTANT_SPEED_TIME + DECELERATION_TIME;

let lightTick = 0;

/* 繪製轉盤 */
function drawWheel() {
    ctx.clearRect(0, 0, 550, 550);

    const cx = 275;
    const cy = 275;
    const outerR = 250;
    const wheelR = 225;

    if (options.length === 0) {
        ctx.fillStyle = "#E8B5C5";
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#70545F";
        ctx.font = "bold 18px 'Microsoft JhengHei', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("請新增抽選項目", cx, cy);
        return;
    }

    /* 外圍裝飾圈 */
    ctx.fillStyle = "#E8B5C5";
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fill();

    /* 依選項數量繪製扇形 */
    for (let i = 0; i < options.length; i++) {
        const angle = startAngle + i * arc;

        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, wheelR, angle, angle + arc, false);
        ctx.lineTo(cx, cy);
        ctx.fill();

        /* 景點文字：統一逆向，沿著扇形半徑排列 */
        ctx.save();

        ctx.fillStyle = "#70545F";
        ctx.font = "bold 11px 'Microsoft JhengHei', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textAngle = angle + arc / 2;
        const textRadius = 165;

        ctx.translate(
            cx + Math.cos(textAngle) * textRadius,
            cy + Math.sin(textAngle) * textRadius
        );

        /* 所有文字統一旋轉，不再自動翻轉 */
        const rotateAngle = textAngle;

        ctx.rotate(rotateAngle);

        ctx.fillText(options[i], 0, 0, 115);

        ctx.restore();
    }

    /* 外圍跑馬燈 */
    const totalLights = 40;
    lightTick++;

    for (let i = 0; i < totalLights; i++) {
        const angle = (i / totalLights) * Math.PI * 2;

        const lx = cx + Math.cos(angle) * (outerR - 12);
        const ly = cy + Math.sin(angle) * (outerR - 12);

        const colorIndex =
            (i + Math.floor(lightTick / 5)) % lightColors.length;

        ctx.fillStyle = lightColors[colorIndex];
        ctx.shadowBlur = 6;
        ctx.shadowColor = lightColors[colorIndex];

        if (i % 2 === 0) {
            ctx.beginPath();
            ctx.arc(lx, ly, 5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = lightColors[colorIndex];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lx - 5, ly);
            ctx.lineTo(lx + 5, ly);
            ctx.moveTo(lx, ly - 5);
            ctx.lineTo(lx, ly + 5);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    }

    /* 中央人物圖片底框 */
    ctx.fillStyle = "#E8B5C5";
    ctx.beginPath();
    ctx.arc(cx, cy, 52, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFF7F8";
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fill();

    /* 顯示人物圖片 */
    if (centerImage.complete && centerImage.naturalWidth > 0) {
        ctx.drawImage(
            centerImage,
            cx - 30,
            cy - 33.65,
            60,
            67.3
        );
    }

    /* 上方固定指針 */
    ctx.fillStyle = "#D8799A";
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - outerR - 5);
    ctx.lineTo(cx + 15, cy - outerR - 5);
    ctx.lineTo(cx, cy - outerR + 25);
    ctx.closePath();
    ctx.fill();
}

let pendingNotebookWheelOptions = null;
window.setNotebookWheelOptions = (nextOptions) => {
    const updatedOptions = Array.isArray(nextOptions)
        ? nextOptions.filter((option) => typeof option === "string" && option.trim())
        : [];
    if (spinTimeout !== null) {
        pendingNotebookWheelOptions = updatedOptions;
        return;
    }
    options = updatedOptions;
    arc = options.length ? Math.PI * 2 / options.length : 0;
    spinBtn.disabled = options.length === 0;
    drawWheel();
};

/* 待機時燈光閃爍 */
setInterval(() => {
    if (spinTimeout === null) {
        drawWheel();
    }
}, 40);

/* 轉盤旋轉 */
function rotateWheel() {
    spinTime += 16;

    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }

    let currentSpeed;

    if (spinTime < CONSTANT_SPEED_TIME) {
        currentSpeed = spinAngleStart;
    } else {
        const decelElapsedTime = spinTime - CONSTANT_SPEED_TIME;

        currentSpeed = spinAngleStart -
            easeOut(
                decelElapsedTime,
                0,
                spinAngleStart,
                DECELERATION_TIME
            );
    }

    startAngle += currentSpeed * Math.PI / 180;

    drawWheel();

    spinTimeout = setTimeout(rotateWheel, 16);
}

/* 停止並顯示中獎視窗 */
function stopRotateWheel() {
    clearTimeout(spinTimeout);
    spinTimeout = null;

    const degrees = startAngle * 180 / Math.PI + 90;
    const ardegrees = arc * 180 / Math.PI;

    const index = Math.floor(
        (360 - (degrees % 360)) / ardegrees
    );

    const selectedIndex = (index + options.length) % options.length;
    const finalResult = options[selectedIndex];

    resultText.textContent = finalResult;
    resultBox.style.backgroundImage = 'none';
    resultBox.style.backgroundColor = colors[selectedIndex % colors.length];
    resultOverlay.classList.add('show');

    spinBtn.disabled = options.length === 0;
    if (pendingNotebookWheelOptions !== null) {
        const updatedOptions = pendingNotebookWheelOptions;
        pendingNotebookWheelOptions = null;
        window.setNotebookWheelOptions(updatedOptions);
    }
}

/* 減速動畫 */
function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;

    return b + c * (tc + -3 * ts + 3 * t);
}

/* 開始抽籤 */
spinBtn.addEventListener('click', () => {
    if (options.length === 0 || spinTimeout !== null) return;

    winnerDiv.textContent = "";
    spinBtn.disabled = true;

    spinAngleStart = Math.random() * 15 + 85;
    spinTime = 0;

    rotateWheel();
});

/* 點擊畫面任意位置關閉中獎視窗 */
resultOverlay.addEventListener('click', () => {
    resultOverlay.classList.remove('show');
});

/* 初始化 */
drawWheel();

