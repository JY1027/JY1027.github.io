

/* DOM 元素 */

const machine = document.getElementById("machine");
const cardOutput = document.getElementById("card-output");
const cardRarity = document.getElementById("card-rarity");
const cardName = document.getElementById("card-name");
const emptyMessage = document.getElementById("empty-message");
const drawingMessage = document.getElementById("drawing-message");
const drawButton = document.getElementById("draw-button");

/* 新手教學系統 */

const tutorialCard = document.getElementById("tutorial-card");
const tutorialStep = document.getElementById("tutorial-step");
const tutorialTitle = document.getElementById("tutorial-title");
const tutorialDescription = document.getElementById("tutorial-description");
const tutorialButton = document.getElementById("tutorial-button");
const tutorialSkip = document.getElementById("tutorial-skip");
const tutorialHint = document.getElementById("tutorial-hint");
const tutorialDots = document.querySelectorAll(".progress-dot");

let tutorialActive = true;
let tutorialStage = 0;

/* 更新教學畫面 */

function showTutorial(stage) {

    tutorialStage = stage;

    tutorialCard.classList.remove("hidden");

    machine.classList.remove("tutorial-highlight");
    drawButton.classList.remove("tutorial-highlight");
    cardOutput.classList.remove("tutorial-highlight");

    tutorialDots.forEach((dot, index) => {
        dot.classList.toggle("active", index === stage - 1);
    });

    /* 歡迎畫面 */

    if (stage === 0) {

        tutorialSkip.style.display = "block";

        tutorialStep.textContent = "新手教學";
        tutorialTitle.textContent = "歡迎來到 PickMe抽卡機！";

        tutorialDescription.innerText =
            "想體驗抽卡的樂趣嗎？透過抽卡機隨機獲得吧！";

        tutorialButton.textContent = "開始教學";
        tutorialButton.style.display = "block";

    }

    /* STEP 1：認識抽卡機 */

    if (stage === 1) {

        tutorialSkip.style.display = "none";

        tutorialStep.textContent = "STEP 1 / 4";
        tutorialTitle.textContent = "認識抽卡機";

        tutorialDescription.innerText =
            "這是一臺抽卡機！\n每張卡片都有不同的稀有度，分為 SSR、SR 和 R 三種等級。\n可以先看看上方的機率分布。";

        tutorialButton.textContent = "下一步";
        tutorialButton.style.display = "block";

        machine.classList.add("tutorial-highlight");

    }

    /* STEP 2：開始抽卡 */

    if (stage === 2) {

        tutorialSkip.style.display = "none";

        tutorialStep.textContent = "STEP 2 / 4";
        tutorialTitle.textContent = "抽出你的選項";

        tutorialDescription.innerText =
            "準備好了嗎？\n點擊下方的「就決定是你了」，抽出你的第一張卡片！";

        tutorialButton.style.display = "none";

        drawButton.classList.add("tutorial-highlight");

    }

    /* STEP 3：查看結果 */

    if (stage === 3) {

        tutorialSkip.style.display = "none";

        tutorialStep.textContent = "STEP 3 / 4";
        tutorialTitle.textContent = "看看你抽到了什麼！";

        tutorialDescription.innerText =
            "卡片已經翻開囉！\n看看抽到的選項與稀有度，畫面任意處點擊即可收回卡片。";

        tutorialButton.style.display = "none";

        cardOutput.classList.add("tutorial-highlight");

    }

    /* STEP 4：教學完成 */

    if (stage === 4) {

        tutorialSkip.style.display = "none";

        tutorialStep.textContent = "STEP 4 / 4";
        tutorialTitle.textContent = "教學完成！";

        tutorialDescription.innerText =
            "你已經學會如何使用抽卡機了！\n接下來實現抽卡自由吧！";

        tutorialButton.textContent = "開始自由遊玩";
        tutorialButton.style.display = "block";

    }

}

/* 教學按鈕 */

tutorialButton.addEventListener("click", function() {

    if (!tutorialActive) return;

    if (tutorialStage === 0) {

        showTutorial(1);

    } else if (tutorialStage === 1) {

        showTutorial(2);

    } else if (tutorialStage === 4) {

        tutorialActive = false;

        tutorialCard.classList.add("hidden");

        machine.classList.remove("tutorial-highlight");
        drawButton.classList.remove("tutorial-highlight");
        cardOutput.classList.remove("tutorial-highlight");

    }

});

/* 跳過教學 */

tutorialSkip.addEventListener("click", function() {

    tutorialActive = false;

    tutorialCard.classList.add("hidden");

    machine.classList.remove("tutorial-highlight");
    drawButton.classList.remove("tutorial-highlight");
    cardOutput.classList.remove("tutorial-highlight");

});

/* 選項卡池 */

const cardPool = {

    SSR: [
        "選項一",
        "選項二",
        "選項三",
        "選項四",
        "選項五",
        "選項六",
        "選項七",
        "選項八",
        "選項九",
        "選項十",
        "選項十一",
        "選項十二",
        "選項十三",
        "選項十四"
    ],

    SR: [
        "選項十五",
        "選項十六",
        "選項十七",
        "選項十八",
        "選項十九",
        "選項二十",
        "選項二十一",
        "選項二十二",
        "選項二十三",
        "選項二十四",
        "選項二十五",
        "選項二十六",
        "選項二十七",
        "選項二十八",
        "選項二十九",
        "選項三十",
        "選項三十一",
        "選項三十二",
        "選項三十三"
    ],

    R: [
        "選項三十四",
        "選項三十五",
        "選項三十六",
        "選項三十七",
        "選項三十八",
        "選項三十九",
        "選項四十",
        "選項四十一",
        "選項四十二",
        "選項四十三",
        "選項四十四",
        "選項四十五",
        "選項四十六",
        "選項四十七",
        "選項四十八",
        "選項四十九",
        "選項五十"
    ]

};

let isDrawing = false;
let audioContext = null;
let hideTimer = null;

/* 音效系統 */

function playBeep(freq, type, duration) {

    try {

        if (!audioContext) {

            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(
            0.09,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + duration
        );

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + duration);

    } catch (error) {

        console.log("音效無法播放：", error);

    }

}

/* 抽卡啟動音效 */

function playStartSound() {

    playBeep(587.33, "sine", 0.15);

    setTimeout(() => {
        playBeep(880, "sine", 0.2);
    }, 100);

}

/* 稀有度音效 */

function playRaritySound(rarity) {

    if (rarity === "SSR") {

        playBeep(1046, "sine", 0.2);

        setTimeout(() => {
            playBeep(1318, "sine", 0.25);
        }, 120);

    } else if (rarity === "SR") {

        playBeep(784, "triangle", 0.25);

    } else {

        playBeep(523, "triangle", 0.2);

    }

}

/* 抽卡系統 */

function getRarity() {

    const roll = Math.random();

    if (roll < 0.05) return "SSR";
    if (roll < 0.25) return "SR";

    return "R";

}

/* 隨機取得選項 */

function getRandomArtItem(rarity) {

    const list = cardPool[rarity];

    const index = Math.floor(
        Math.random() * list.length
    );

    return list[index];

}

/* 等待指定時間 */

function wait(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

/* 卡片位置與顯示 */

function positionCardAtDispenser() {

    const rect = document
        .getElementById("dispenser")
        .getBoundingClientRect();

    cardOutput.style.left =
        (rect.left + rect.width / 2) + "px";

    cardOutput.style.top =
        (rect.top + rect.height / 2) + "px";

}

/* 清除上一張卡片 */

function removePreviousCard() {

    if (hideTimer) {

        clearTimeout(hideTimer);
        hideTimer = null;

    }

    cardOutput.classList.remove(
        "ready",
        "flipped",
        "drop",
        "hide",
        "SSR",
        "SR",
        "R",
        "tutorial-highlight"
    );

    cardOutput.style.visibility = "hidden";
    cardOutput.style.opacity = "0";
    cardOutput.style.pointerEvents = "none";

    const inner = cardOutput.querySelector(".card-inner");

    inner.style.transition = "none";
    inner.style.transform = "rotateY(0deg)";

    void cardOutput.offsetWidth;

    inner.style.transition = "";
    inner.style.transform = "";

}

/* 收起卡片 */

function hideCard() {

    if (isDrawing) return;

    if (!cardOutput.classList.contains("ready")) return;

    cardOutput.classList.remove(
        "ready",
        "flipped",
        "tutorial-highlight"
    );

    cardOutput.classList.add("hide");

    cardOutput.style.pointerEvents = "none";

    emptyMessage.style.display = "block";

    drawButton.disabled = false;
    drawButton.innerText = "就決定是你了";

    /* 教學期間，收卡後進入最後一步 */

    if (tutorialActive && tutorialStage === 3) {

        showTutorial(4);

    }

    hideTimer = setTimeout(() => {

        cardOutput.classList.remove(
            "drop",
            "hide",
            "SSR",
            "SR",
            "R"
        );

        cardOutput.style.visibility = "hidden";
        cardOutput.style.opacity = "0";
        cardOutput.style.left = "50%";
        cardOutput.style.top = "50%";

        hideTimer = null;

    }, 350);

}

/* 抽卡主程式 */

async function draw() {

    if (isDrawing) return;

    /* 教學期間只能在 STEP 2 抽卡 */

    if (tutorialActive && tutorialStage !== 2) return;

    isDrawing = true;

    /* 清除上一張卡片 */

    removePreviousCard();

    /* 隱藏出卡口文字 */

    emptyMessage.style.display = "none";

    /* 鎖定按鈕 */

    drawButton.disabled = true;

    /* 顯示抽選文字 */

    drawingMessage.classList.add("show");

    /* 播放啟動音效 */

    playStartSound();

    /* 等待抽選 */

    await wait(1200);

    /* 抽選文字消失 */

    drawingMessage.classList.remove("show");

    /* 決定稀有度 */

    const rarity = getRarity();

    /* 隨機抽出選項 */

    const name = getRandomArtItem(rarity);

    console.log("抽中稀有度：", rarity);
    console.log("抽中選項：", name);

    /* 設定卡片內容 */

    cardRarity.innerText = `${rarity} CHARACTER`;
    cardName.innerText = name;

    /* 設定稀有度顏色 */

    cardOutput.className = `card ${rarity}`;

    /* 設定卡片初始位置 */

    positionCardAtDispenser();

    /* 顯示卡片 */

    cardOutput.style.visibility = "visible";
    cardOutput.style.opacity = "1";

    void cardOutput.offsetWidth;

    /* 卡片從出卡口掉落至畫面中央 */

    requestAnimationFrame(() => {

        cardOutput.classList.add("drop");

    });

    /* 播放稀有度音效 */

    playRaritySound(rarity);

    /* 等待掉落動畫完成 */

    await wait(850);

    /* 正面停留 */

    await wait(550);

    /* 自動翻轉卡片 */

    cardOutput.classList.add("flipped");

    /* 等待翻轉動畫完成 */

    await wait(950);

    /* 開放點擊收卡 */

    cardOutput.classList.add("ready");
    cardOutput.style.pointerEvents = "auto";

    /* 恢復抽卡按鈕 */

    drawButton.disabled = false;
    drawButton.innerText = "就決定是你了";

    isDrawing = false;

    /* 教學進入結果確認階段 */

    if (tutorialActive && tutorialStage === 2) {

        showTutorial(3);

    }

}

/* 抽卡按鈕事件 */

drawButton.addEventListener("click", function() {

    if (isDrawing) return;

    /* 教學期間只允許 STEP 2 操作 */

    if (tutorialActive && tutorialStage !== 2) return;

    /* 卡片已翻開，點擊按鈕即可收卡 */

    if (cardOutput.classList.contains("ready")) {

        hideCard();
        return;

    }

    draw();

});

/* 卡片點擊收回 */

cardOutput.addEventListener("click", function(event) {

    event.stopPropagation();

    if (!cardOutput.classList.contains("ready")) return;
    if (isDrawing) return;

    hideCard();

});

/* 全畫面點擊收卡 */

document.addEventListener("click", function(event) {

    if (event.target.closest("#draw-button")) return;
    if (event.target.closest("#tutorial-card")) return;

    if (!cardOutput.classList.contains("ready")) return;
    if (isDrawing) return;

    hideCard();

});

/* 手機觸控收卡 */

document.addEventListener("touchstart", function(event) {

    if (event.target.closest("#draw-button")) return;
    if (event.target.closest("#tutorial-card")) return;

    if (!cardOutput.classList.contains("ready")) return;
    if (isDrawing) return;

    hideCard();

}, { passive: true });

/* 視窗尺寸改變 */

window.addEventListener("resize", function() {

    if (
        cardOutput.classList.contains("drop") &&
        !cardOutput.classList.contains("hide")
    ) {

        cardOutput.style.left = "50%";
        cardOutput.style.top = "50%";

    }

});

/* 初始化 */

showTutorial(0);

