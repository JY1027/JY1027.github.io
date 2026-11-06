

/* =========================
   職業卡池
========================= */

const cardPool = {

    SSR: [
        "祭司", "傀儡師", "怪盜", "死神",
        "國王", "魔法師", "反派", "將軍",
        "間諜", "刺客", "特務", "傭兵",
        "超能力者", "精靈"
    ],

    SR: [
        "法醫", "保鏢", "機長", "賽車手",
        "調香師", "軍醫", "航海士", "藥劑師",
        "馴獸師", "修女", "騎士", "駭客",
        "拳擊手", "律師", "偵探", "獸醫",
        "芭蕾舞者", "獵人", "向導"
    ],

    R: [
        "廚師", "理髮師", "木匠", "保全",
        "記者", "清潔工", "園藝師", "咖啡師",
        "水電工", "保姆", "老師", "泳將",
        "烘焙師", "快遞員", "裁縫師", "調酒師",
        "外送員"
    ]

};
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.cardPool = cardPool;

let isDrawing = false;
let audioContext = null;
let hideTimer = null;


/* =========================
   音效系統
========================= */

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


/* =========================
   抽卡系統
========================= */

/* SSR 5%、SR 20%、R 75% */

function getRarity() {

    const roll = Math.random();

    if (roll < 0.05) return "SSR";

    if (roll < 0.25) return "SR";

    return "R";

}


/* 隨機取得職業 */

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


/* =========================
   卡片位置與顯示
========================= */

/* 設定卡片從出卡口開始 */

function positionCardAtDispenser() {

    const dispenser = document.getElementById("dispenser");

    const cardOutput = document.getElementById("card-output");

    const rect = dispenser.getBoundingClientRect();

    cardOutput.style.left =
        (rect.left + rect.width / 2) + "px";

    cardOutput.style.top =
        (rect.top + rect.height / 2) + "px";

}


/* 清除上一張卡片 */

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


/* =========================
   收起卡片
========================= */

function hideCard() {

    const cardOutput = document.getElementById("card-output");

    const emptyMessage = document.getElementById("empty-message");

    const drawButton = document.getElementById("draw-button");

    if (isDrawing) return;

    if (!cardOutput.classList.contains("ready")) return;

    /* 移除翻牌狀態 */

    cardOutput.classList.remove("ready", "flipped");

    /* 執行消失動畫 */

    cardOutput.classList.add("hide");

    cardOutput.style.pointerEvents = "none";

    /* 恢復出卡口文字 */

    emptyMessage.style.display = "block";

    /* 恢復按鈕 */

    drawButton.disabled = false;

    drawButton.innerText = "就決定是你了";

    /* 動畫結束後完全隱藏 */

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


/* =========================
   抽卡主程式
========================= */

async function draw() {

    if (isDrawing) return;

    isDrawing = true;

    const cardOutput = document.getElementById("card-output");

    const cardRarity = document.getElementById("card-rarity");

    const cardName = document.getElementById("card-name");

    const emptyMessage = document.getElementById("empty-message");

    const drawingMessage = document.getElementById("drawing-message");

    const drawButton = document.getElementById("draw-button");


    /* 1. 清除上一張卡片 */

    removePreviousCard();


    /* 2. 隱藏出卡口文字 */

    emptyMessage.style.display = "none";


    /* 3. 鎖定按鈕 */

    drawButton.disabled = true;


    /* 4. 顯示抽選文字 */

    drawingMessage.classList.add("show");


    /* 5. 播放啟動音效 */

    playStartSound();


    /* 6. 等待抽選 */

    await wait(1200);


    /* 7. 抽選文字消失 */

    drawingMessage.classList.remove("show");


    /* 8. 決定稀有度 */

    const rarity = getRarity();


    /* 9. 隨機抽出職業 */

    const name = getRandomArtItem(rarity);


    console.log("抽中稀有度：", rarity);

    console.log("抽中職業：", name);


    /* 10. 設定卡片內容 */

    cardRarity.innerText = `${rarity} CHARACTER`;

    cardName.innerText = name;


    /* 11. 設定稀有度顏色 */

    cardOutput.className = `card ${rarity}`;


    /* 12. 設定卡片初始位置 */

    positionCardAtDispenser();


    /* 13. 顯示卡片 */

    cardOutput.style.visibility = "visible";

    cardOutput.style.opacity = "1";


    /* 確保瀏覽器先套用初始位置 */

    void cardOutput.offsetWidth;


    /* 14. 卡片從出卡口掉落至畫面中央 */

    requestAnimationFrame(() => {

        cardOutput.classList.add("drop");

    });


    /* 15. 播放稀有度音效 */

    playRaritySound(rarity);


    /* 16. 等待掉落動畫完成 */

    await wait(850);


    /* 17. 正面停留 */

    await wait(550);


    /* 18. 自動翻轉卡片 */

    cardOutput.classList.add("flipped");


    /* 19. 等待翻轉動畫完成 */

    await wait(950);


    /* 20. 開放點擊收卡 */

    cardOutput.classList.add("ready");

    cardOutput.style.pointerEvents = "auto";


    /* 21. 恢復抽卡按鈕 */

    drawButton.disabled = false;

    drawButton.innerText = "就決定是你了";


    isDrawing = false;

}


/* =========================
   按鈕事件
========================= */

document.getElementById("draw-button").addEventListener(
    "click",
    function() {

        if (isDrawing) return;

        const cardOutput = document.getElementById("card-output");

        /* 卡片已翻開，點按鈕即可收卡 */

        if (cardOutput.classList.contains("ready")) {

            hideCard();

            return;

        }

        draw();

    }
);


/* =========================
   全畫面點擊收卡
========================= */

document.addEventListener("click", function() {

    const cardOutput = document.getElementById("card-output");

    if (!cardOutput.classList.contains("ready")) return;

    if (isDrawing) return;

    hideCard();

});


/* =========================
   手機觸控收卡
========================= */

document.addEventListener("touchstart", function() {

    const cardOutput = document.getElementById("card-output");

    if (!cardOutput.classList.contains("ready")) return;

    if (isDrawing) return;

    hideCard();

}, { passive: true });


/* =========================
   視窗尺寸改變
========================= */

window.addEventListener("resize", function() {

    const cardOutput = document.getElementById("card-output");

    if (
        cardOutput.classList.contains("drop") &&
        !cardOutput.classList.contains("hide")
    ) {

        /* 已經掉落的卡片維持在螢幕中央 */

        cardOutput.style.left = "50%";

        cardOutput.style.top = "50%";

    }

});

