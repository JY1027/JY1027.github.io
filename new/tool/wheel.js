
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const spinBtn = document.getElementById('spinBtn');
const winnerDiv = document.getElementById('winner');

const resultOverlay = document.getElementById('resultOverlay');
const resultBox = document.querySelector('.result-box');
const resultText = document.getElementById('resultText');

/* ===== 新手教學 DOM ===== */

const tutorialCard = document.getElementById('tutorialCard');
const tutorialStep = document.getElementById('tutorialStep');
const tutorialTitle = document.getElementById('tutorialTitle');
const tutorialDescription = document.getElementById('tutorialDescription');
const tutorialProgress = document.getElementById('tutorialProgress');
const tutorialButton = document.getElementById('tutorialButton');
const tutorialSkip = document.getElementById('tutorialSkip');
const tutorialHint = document.getElementById('tutorialHint');

let tutorialActive = true;
let tutorialStage = 0;

/* 教學畫面更新 */
function showTutorial(stage) {
    tutorialStage = stage;

    tutorialCard.classList.remove('hidden');

    canvas.classList.remove('tutorial-highlight');
    spinBtn.classList.remove('tutorial-highlight');

    const dots = tutorialProgress.querySelectorAll('.progress-dot');

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === stage - 1);
    });

    if (stage === 0) {
        tutorialSkip.style.display = "block";
        tutorialStep.textContent = "新手教學";
        tutorialTitle.textContent = "歡迎來到幸運抽籤轉盤！";
        tutorialDescription.innerText =
            "第一次遊玩嗎？\n接下來會帶你認識轉盤，完成簡單的操作教學。";

        tutorialButton.textContent = "開始教學";
        tutorialButton.style.display = "block";

    }

    if (stage === 1) {
        tutorialSkip.style.display = "none";
        tutorialStep.textContent = "STEP 1 / 4";
        tutorialTitle.textContent = "認識幸運轉盤";
        tutorialDescription.innerText =
            "這就是幸運抽籤轉盤！\n轉盤上有不同的選項，旋轉停止後會隨機抽出一個結果。";

        tutorialButton.textContent = "下一步";
        tutorialButton.style.display = "block";


        canvas.classList.add('tutorial-highlight');
    }

    if (stage === 2) {
        tutorialSkip.style.display = "none";
        tutorialStep.textContent = "STEP 2 / 4";
        tutorialTitle.textContent = "試著開始旋轉";
        tutorialDescription.innerText =
            "點擊下方的「開始旋轉」按鈕，\n讓轉盤開始抽籤吧！";

        tutorialButton.style.display = "none";


        spinBtn.classList.add('tutorial-highlight');
    }

    if (stage === 3) {
        tutorialSkip.style.display = "none";
        tutorialStep.textContent = "STEP 3 / 4";
        tutorialTitle.textContent = "查看抽籤結果";
        tutorialDescription.innerText =
            "轉盤已經停止，畫面會顯示抽中的選項。\n請點擊畫面任意處，關閉結果畫面。";

        tutorialButton.style.display = "none";

    }

    if (stage === 4) {
        tutorialSkip.style.display = "none";
        tutorialStep.textContent = "STEP 4 / 4";
        tutorialTitle.textContent = "教學完成！";
        tutorialDescription.innerText =
            "你已經學會如何使用幸運抽籤轉盤。\n現在可以開始自由抽籤了！";

        tutorialButton.textContent = "開始自由遊玩";
        tutorialButton.style.display = "block";

    }
}

/* 教學按鈕 */
tutorialButton.addEventListener('click', () => {
    if (!tutorialActive) return;

    if (tutorialStage === 0) {
        showTutorial(1);
    } else if (tutorialStage === 1) {
        showTutorial(2);
    } else if (tutorialStage === 4) {
        tutorialActive = false;
        tutorialCard.classList.add('hidden');

        canvas.classList.remove('tutorial-highlight');
        spinBtn.classList.remove('tutorial-highlight');
    }
});

/* 跳過教學 */
tutorialSkip.addEventListener('click', () => {
    tutorialActive = false;
    tutorialCard.classList.add('hidden');
    canvas.classList.remove('tutorial-highlight');
    spinBtn.classList.remove('tutorial-highlight');
});

/* 載入中央人物圖片 */
const centerImage = new Image();
centerImage.src = "../images/center.png";

centerImage.onload = () => {
    drawWheel();
};

centerImage.onerror = () => {
    console.error("無法載入 center.png，請確認圖片與 HTML 位於同一資料夾。");
};

let options = [
    "選項一",
    "選項二",
    "選項三",
    "選項四",
    "選項五",
    "選項六",
    "選項七",
    "選項八"
];

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

/* 外圍跑馬燈 */
const lightColors = [
    '#FFE6A7',
    '#FFFFFF',
    '#F4B8CC',
    '#D5E5F2',
    '#F8D9B8'
];

let startAngle = 0;
let arc = Math.PI / (options.length / 2);
let spinTimeout = null;
let customMode = false;
let customSelection = null;
let spinAngleStart = 10;
let spinTime = 0;

const CONSTANT_SPEED_TIME = 3000;
const DECELERATION_TIME = 2000;
const spinTimeTotal = CONSTANT_SPEED_TIME + DECELERATION_TIME;

let lightTick = 0;

window.PickMeIntroTool = {
    configure(config) {
        customMode = true;
        customSelection = null;
        this.refresh(config);
        return true;
    },
    refresh(config) {
        const group = config.groups[0];
        const values = (group?.options || [])
            .filter((option) => !config.noReplacement || !group.used.includes(option.id))
            .map((option) => option.value);
        options.splice(0, options.length, ...values);
        arc = options.length ? Math.PI / (options.length / 2) : 0;
        drawWheel();
    }
};

/* 繪製轉盤 */
function drawWheel() {
    ctx.clearRect(0, 0, 550, 550);

    const cx = 275;
    const cy = 275;
    const outerR = 250;
    const wheelR = 225;

    if (options.length === 0) {
        ctx.save();
        ctx.fillStyle = "#70545F";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("請至筆記本新增選項", cx, cy);
        ctx.restore();
        return;
    }

    /* 外圍裝飾圈 */
    ctx.fillStyle = "#E8B5C5";
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fill();

    /* 扇形區域 */
    for (let i = 0; i < options.length; i++) {
        const angle = startAngle + i * arc;

        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, wheelR, angle, angle + arc, false);
        ctx.lineTo(cx, cy);
        ctx.fill();

        /* 扇形文字 */
        ctx.save();
        ctx.fillStyle = "#70545F";
        ctx.font = "bold 16px sans-serif";

        ctx.translate(
            cx + Math.cos(angle + arc / 2) * (wheelR * 0.65),
            cy + Math.sin(angle + arc / 2) * (wheelR * 0.65)
        );

        ctx.rotate(angle + arc / 2 + Math.PI / 2);

        const text = options[i];
        ctx.fillText(
            text,
            -ctx.measureText(text).width / 2,
            0
        );

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

    /* 顯示人物圖片，保留透明背景 */
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

    if (customMode && customSelection && options.length) {
        const index = Math.max(0, Math.min(options.length - 1, customSelection.index));
        const degrees = 360 - (index + 0.5) * (360 / options.length) - 90;
        startAngle = ((degrees % 360) + 360) % 360 * Math.PI / 180;
        drawWheel();
    }

    const degrees = startAngle * 180 / Math.PI + 90;
    const ardegrees = arc * 180 / Math.PI;

    const index = Math.floor(
        (360 - (degrees % 360)) / ardegrees
    );

    const selectedIndex = (index + options.length) % options.length;
    const finalResult = options[selectedIndex];
    if (customMode) {
        window.PickMeIntroNotebook?.record(finalResult);
        customSelection = null;
    }

    /* 顯示抽中選項 */
    resultText.textContent = finalResult;
    resultBox.style.background = colors[selectedIndex % colors.length];
    resultOverlay.classList.add('show');

    spinBtn.disabled = false;

    /* 教學進入結果步驟 */
    if (tutorialActive && tutorialStage === 2) {
        showTutorial(3);
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
    if (spinTimeout !== null) return;

    /* 教學期間必須依照步驟操作 */
    if (tutorialActive && tutorialStage !== 2) return;

    customSelection = customMode ? window.PickMeIntroNotebook?.choose()?.[0] || null : null;
    if (customMode && !customSelection) {
        winnerDiv.textContent = '請先開啟自訂筆記本設定可抽取項目。';
        return;
    }
    winnerDiv.textContent = "";
    spinBtn.disabled = true;

    spinAngleStart = Math.random() * 15 + 85;
    spinTime = 0;

    rotateWheel();
});

/* 點擊中獎視窗關閉 */
resultOverlay.addEventListener('click', () => {
    resultOverlay.classList.remove('show');

    /* 教學期間，關閉結果視窗後進入最後一步 */
    if (tutorialActive && tutorialStage === 3) {
        showTutorial(4);
    }
});

/* 初始化 */
drawWheel();
showTutorial(0);

