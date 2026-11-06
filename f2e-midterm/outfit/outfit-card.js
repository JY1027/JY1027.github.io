

/* ================================
   13 種風格專屬圖片
================================ */

const cardImages = {
    "奶蛙裝": "../images/cards/奶蛙裝.jpg",
    "哥德風": "../images/cards/哥德風.jpg",

    "泰系": "../images/cards/泰系.jpg",
    "新中式": "../images/cards/新中式.jpg",
    "英倫風": "../images/cards/英倫風.jpg",
    "八九風": "../images/cards/八九風.jpg",

    "韓系": "../images/cards/韓系.jpg",
    "日系": "../images/cards/日系.jpg",
    "臺系": "../images/cards/臺系.jpg",
    "美式": "../images/cards/美式.jpg",
    "港風": "../images/cards/港風.jpg",
    "老錢風": "../images/cards/老錢風.jpg",
    "監獄風": "../images/cards/監獄風.jpg"
};

window.getOutfitCardImage = (name) => cardImages[name] || null;

/* ================================
   穿搭風格卡池
================================ */

const cardPool = {

    SSR: [
        "奶蛙裝",
        "哥德風"
    ],

    SR: [
        "泰系",
        "新中式",
        "英倫風",
        "八九風"
    ],

    R: [
        "韓系",
        "日系",
        "臺系",
        "美式",
        "港風",
        "老錢風",
        "監獄風"
    ]

};
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.cardPool = cardPool;


let isDrawing = false;
let cardShowing = false;
let audioContext = null;


/* ================================
   音效
================================ */

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


/* 啟動音效 */
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


/* ================================
   抽卡邏輯
================================ */

// SSR 5%、SR 20%、R 75%
function getRarity() {

    const roll = Math.random();

    if (roll < 0.05) {
        return "SSR";
    }

    if (roll < 0.25) {
        return "SR";
    }

    return "R";

}


// 隨機取得穿搭風格
function getRandomStyle(rarity) {

    const list = cardPool[rarity];

    const index = Math.floor(
        Math.random() * list.length
    );

    return list[index];

}


// 等待時間
function wait(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}


/* ================================
   卡片位置：出卡口
================================ */

function positionCardAtDispenser() {

    const dispenser =
        document.getElementById("dispenser");

    const cardOutput =
        document.getElementById("card-output");

    const rect = dispenser.getBoundingClientRect();

    cardOutput.style.left =
        (rect.left + rect.width / 2) + "px";

    cardOutput.style.top =
        (rect.top + rect.height / 2) + "px";

}


/* ================================
   收回卡片
================================ */

function hideCard() {

    if (!cardShowing) return;

    const cardOutput =
        document.getElementById("card-output");

    const drawButton =
        document.getElementById("draw-button");

    cardOutput.classList.remove(
        "ready",
        "flipped",
        "drop"
    );

    cardOutput.style.pointerEvents = "none";

    cardShowing = false;

    drawButton.innerText = "就決定是你了";

    setTimeout(() => {

        cardOutput.className = "card";

        cardOutput.style.visibility = "hidden";
        cardOutput.style.opacity = "0";

    }, 400);

}


/* ================================
   抽卡主程式
================================ */

async function draw() {

    if (isDrawing) return;

    // 如果卡片已經顯示，按鈕可收回卡片
    if (cardShowing) {

        hideCard();

        return;

    }

    isDrawing = true;

    const cardOutput =
        document.getElementById("card-output");

    const cardImage =
        document.getElementById("card-image");

    const emptyMessage =
        document.getElementById("empty-message");

    const drawingMessage =
        document.getElementById("drawing-message");

    const drawButton =
        document.getElementById("draw-button");


    // 1. 重設卡片
    cardOutput.className = "card";

    cardOutput.style.visibility = "hidden";
    cardOutput.style.opacity = "0";
    cardOutput.style.pointerEvents = "none";

    emptyMessage.style.display = "none";


    // 2. 鎖定按鈕
    drawButton.disabled = true;


    // 3. 顯示抽選文字
    drawingMessage.classList.add("show");

    playStartSound();


    // 4. 等待抽選
    await wait(1200);

    drawingMessage.classList.remove("show");


    // 5. 決定稀有度
    const rarity = getRarity();


    // 6. 抽取穿搭風格
    const styleName = getRandomStyle(rarity);


    // 7. 取得圖片路徑
    const imagePath = cardImages[styleName];

    console.log("抽中稀有度：", rarity);
    console.log("抽中穿搭：", styleName);
    console.log("圖片路徑：", imagePath);


    // 8. 設定圖片
    cardImage.classList.remove("image-error");

    cardImage.alt = styleName;

    cardImage.onerror = function() {

        console.warn(
            "圖片載入失敗，請檢查路徑：",
            imagePath
        );

        this.classList.add("image-error");

    };

    cardImage.onload = function() {

        this.classList.remove("image-error");

    };

    cardImage.src = imagePath;


    // 9. 設定卡片稀有度
    cardOutput.className = `card ${rarity}`;


    // 10. 將卡片定位到出卡口
    positionCardAtDispenser();

    cardOutput.style.visibility = "visible";
    cardOutput.style.opacity = "1";


    // 11. 強制套用初始位置
    void cardOutput.offsetWidth;


    // 12. 卡片掉落至螢幕中央
    requestAnimationFrame(() => {

        cardOutput.classList.add("drop");

    });


    // 13. 播放稀有度音效
    playRaritySound(rarity);


    // 14. 等待掉落動畫
    await wait(850);


    // 15. 正面停留
    await wait(550);


    // 16. 自動翻面
    cardOutput.classList.add("flipped");


    // 17. 等待翻面完成
    await wait(950);


    // 18. 開放卡片點擊
    cardOutput.classList.add("ready");

    cardShowing = true;

    drawButton.disabled = false;

    drawButton.innerText = "點擊卡片抽下一張";

    isDrawing = false;

}


/* ================================
   點擊卡片：收回並抽下一張
================================ */

function handleCardClick() {

    if (isDrawing) return;

    const cardOutput =
        document.getElementById("card-output");

    if (!cardShowing) return;

    hideCard();

}


/* ================================
   按鈕事件
================================ */

document.getElementById("draw-button").addEventListener(
    "click",
    function() {

        if (isDrawing) return;

        if (cardShowing) {

            hideCard();

            return;

        }

        draw();

    }
);


/* ================================
   卡片點擊事件
================================ */

document.getElementById("card-output").addEventListener(
    "click",
    handleCardClick
);


/* ================================
   點擊卡片以外的位置收回
================================ */

document.addEventListener("click", function(event) {

    if (!cardShowing) return;

    const cardOutput =
        document.getElementById("card-output");

    const drawButton =
        document.getElementById("draw-button");

    // 點擊卡片本身不執行這裡的收回
    if (cardOutput.contains(event.target)) return;

    // 點擊按鈕由按鈕事件處理
    if (drawButton.contains(event.target)) return;

    hideCard();

});


/* ================================
   視窗大小改變時重新定位
================================ */

window.addEventListener("resize", function() {

    if (cardShowing || isDrawing) {

        positionCardAtDispenser();

    }

});

document.getElementById("draw-button").addEventListener("click", draw);
