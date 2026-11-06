

/* 景點卡池 */
const cardPool = {
    SSR: [
        "臺北101"
    ],

    SR: [
        "國立故宮博物院",
        "西門町",
        "中正紀念堂",
        "陽明山國家公園",
        "象山步道"
    ],

    R: [
        "國父紀念館",
        "大稻埕碼頭",
        "松山文創園區",
        "華山1914文創園區",
        "迪化街",
        "剝皮寮歷史街區",
        "榕錦時光生活園區",
        "赤峰街",
        "擎天崗草原",
        "大安森林公園",
        "北投地熱谷",
        "貓空",
        "臺北市立美術館",
        "臺北植物園",
        "國家兩廳院",
        "臺北市立動物園",
        "兒童新樂園",
        "士林夜市",
        "寧夏夜市"
    ]
};
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.cardPool = cardPool;

let isDrawing = false;
let audioContext = null;
let hideTimer = null;

/* 音效 */
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

/* 抽卡機率：SSR 5%、SR 20%、R 75% */
function getRarity() {
    const roll = Math.random();

    if (roll < 0.05) return "SSR";
    if (roll < 0.25) return "SR";

    return "R";
}

/* 隨機取得景點 */
function getRandomArtItem(rarity) {
    const list = cardPool[rarity];
    const index = Math.floor(Math.random() * list.length);

    return list[index];
}

/* 等待 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* 卡片初始位置：對準機臺出卡口 */
function positionCardAtDispenser() {
    const dispenser = document.getElementById("dispenser");
    const cardOutput = document.getElementById("card-output");

    const rect = dispenser.getBoundingClientRect();

    cardOutput.style.left =
        (rect.left + rect.width / 2) + "px";

    cardOutput.style.top =
        (rect.top + rect.height / 2) + "px";
}

/* 隱藏上一張卡片 */
function removePreviousCard() {
    const cardOutput = document.getElementById("card-output");

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
        "R"
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

/* 點擊螢幕任意位置，讓卡片消失 */
function hideCard() {
    const cardOutput = document.getElementById("card-output");
    const emptyMessage = document.getElementById("empty-message");
    const drawButton = document.getElementById("draw-button");

    if (isDrawing) return;
    if (!cardOutput.classList.contains("ready")) return;

    /* 防止重複執行 */
    cardOutput.classList.remove("ready", "flipped");
    cardOutput.classList.add("hide");

    cardOutput.style.pointerEvents = "none";

    /* 恢復出卡口文字 */
    emptyMessage.style.display = "block";

    /* 恢復抽卡按鈕 */
    drawButton.disabled = false;
    drawButton.innerText = "就決定是你了";

    /* 等待淡出動畫結束後完全隱藏 */
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

        hideTimer = null;
    }, 350);
}

/* 抽卡主程式 */
async function draw() {
    if (isDrawing) return;

    isDrawing = true;

    const cardOutput = document.getElementById("card-output");
    const cardRarity = document.getElementById("card-rarity");
    const cardName = document.getElementById("card-name");
    const emptyMessage = document.getElementById("empty-message");
    const drawingMessage = document.getElementById("drawing-message");
    const drawButton = document.getElementById("draw-button");

    /* 1. 上一張卡片消失 */
    removePreviousCard();

    /* 2. 隱藏出卡口文字 */
    emptyMessage.style.display = "none";

    /* 3. 鎖定按鈕 */
    drawButton.disabled = true;

    /* 4. 顯示抽選文字 */
    drawingMessage.classList.add("show");

    playStartSound();

    /* 5. 等待抽選 */
    await wait(1200);

    /* 6. 抽選文字消失 */
    drawingMessage.classList.remove("show");

    /* 7. 決定稀有度 */
    const rarity = getRarity();

    /* 8. 隨機抽出景點 */
    const name = getRandomArtItem(rarity);

    console.log("抽中稀有度：", rarity);
    console.log("抽中景點：", name);

    /* 9. 設定卡片內容 */
    cardRarity.innerText = `${rarity} COLLECTION`;
    cardName.innerText = name;

    /* 10. 設定稀有度顏色 */
    cardOutput.className = `card ${rarity}`;

    /* 11. 設定出卡口位置 */
    positionCardAtDispenser();

    /* 12. 顯示卡片 */
    cardOutput.style.visibility = "visible";
    cardOutput.style.opacity = "1";

    void cardOutput.offsetWidth;

    /* 13. 卡片掉落至螢幕中央 */
    requestAnimationFrame(() => {
        cardOutput.classList.add("drop");
    });

    /* 14. 播放稀有度音效 */
    playRaritySound(rarity);

    /* 15. 等待掉落完成 */
    await wait(850);

    /* 16. 正面停留 */
    await wait(550);

    /* 17. 自動翻轉卡片 */
    cardOutput.classList.add("flipped");

    /* 18. 等待翻轉完成 */
    await wait(950);

    /* 19. 開放任意位置點擊 */
    cardOutput.classList.add("ready");

    cardOutput.style.pointerEvents = "auto";

    drawButton.disabled = false;
    drawButton.innerText = "就決定是你了";

    isDrawing = false;
}

/* 抽卡按鈕事件 */
document.getElementById("draw-button").addEventListener(
    "click",
    function() {
        if (isDrawing) return;

        const cardOutput = document.getElementById("card-output");

        /* 卡片已翻開時，點按按鈕也可以收起卡片 */
        if (cardOutput.classList.contains("ready")) {
            hideCard();
            return;
        }

        draw();
    }
);

/* 全畫面點擊事件 */
document.addEventListener("click", function() {
    const cardOutput = document.getElementById("card-output");

    if (!cardOutput.classList.contains("ready")) return;
    if (isDrawing) return;

    hideCard();
});

/* 手機觸控事件 */
document.addEventListener("touchstart", function() {
    const cardOutput = document.getElementById("card-output");

    if (!cardOutput.classList.contains("ready")) return;
    if (isDrawing) return;

    hideCard();
}, { passive: true });

/* 視窗尺寸改變時重新定位 */
window.addEventListener("resize", function() {
    const cardOutput = document.getElementById("card-output");

    if (
        cardOutput.classList.contains("drop") &&
        !cardOutput.classList.contains("hide")
    ) {
        positionCardAtDispenser();
    }
});

