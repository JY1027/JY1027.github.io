

/* 社交挑戰卡池 */
const cardPool = {

    SSR: [
        "喊巴啦啦小魔仙，變身",
        "單膝下跪，送陌生人玫瑰"
    ],

    SR: [
        "對陌生人比出大愛心",
        "隔街向路人熱情揮手",
        "下車前向整車乘客告別",
        "遲到進門大喊：報告長官",
        "突然特務式轉身貼牆",
        "詢問路人：我們穿越了嗎",
        "請路人幫拍狗仔偷拍照",
        "高舉雙手徵求陌生人擊掌",
        "假裝腳底被黏住，掙扎一分鐘",
        "問路人：黃金還是銀色寶特瓶？",
        "詢問店員：有賣勇氣嗎？"
    ],

    R: [
        "結帳時稱讚店員的髮型",
        "問路人：黃金還是銀色寶特瓶？",
        "問阿姨：哪瓶飲料最有初戀感",
        "拿白紙問路人地址怎麼走",
        "擦肩而過時突然找同學擊掌",
        "倒著走路，向路人微笑點頭",
        "對面紅燈時向行人大力揮手",
        "問路人霍格華茲列車在哪搭",
        "蹲下跟流浪貓約定見面時間",
        "在電梯裡面向乘客微笑",
        "點飲料時詢問有沒有初戀口味",
        "在捷運上假裝自己正在衝浪",
        "問服務生牛肉生前是否快樂",
        "指著天空大喊：你看",
        "買咖啡時自稱帥到分手",
        "在電扶梯上與對向路人深情對視",
        "問路人現在是西元幾年",
        "幫隔壁桌陌生人烤肉",
        "問男士哪支口紅是斬男色",
        "問路人能否拍被狗仔偷拍照",
        "問路人能否借拍一張合照",
        "詢問霍格華茲九又四分之三月臺在哪",
        "在步行街假裝腳底被黏住",
        "紅燈時舉辦一場即興歌友會",
        "帶朋友參觀人行道，假裝導遊",
        "對手錶說：計畫必須提前",
        "問店員有沒有賣有錢人的東西",
        "對鏡子整理儀容並鞠躬",
        "用播報員語氣轉播現場",
        "假裝接到組織的神祕電話",
        "對餐點舉杯感謝它的犧牲",
        "走路時假裝自己是電影主角",
        "問朋友：我變鴨子你還認得我嗎？",
        "對空氣拍手三下後離開",
        "用拍賣會語氣介紹普通物品",
        "看到三角錐說：目標確認",
        "告訴朋友：我討厭你，假的",
        "接飲料時像領獎一樣雙手捧著"
    ]

};
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.cardPool = cardPool;

let isDrawing = false;
let cardShowing = false;
let audioContext = null;

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

/* 啟動音效 */
function playStartSound() {
    playBeep(587.33, "sine", 0.15);

    setTimeout(() => {
        playBeep(880, "sine", 0.2);
    }, 100);
}

/* 抽卡稀有度 */
function getRarity() {
    const roll = Math.random();

    if (roll < 0.05) {
        return "SSR";
    } else if (roll < 0.25) {
        return "SR";
    } else {
        return "R";
    }
}

/* 隨機取得挑戰 */
function getRandomArtItem(rarity) {
    const list = cardPool[rarity];
    const index = Math.floor(Math.random() * list.length);

    return list[index];
}

/* 等待時間 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* 收回卡片 */
function hideCard() {

    const cardOutput = document.getElementById("card-output");

    cardOutput.classList.remove("flip");
    cardOutput.classList.remove("drop");

    cardShowing = false;

    setTimeout(() => {
        cardOutput.className = "card";
    }, 400);
}

/* 抽卡主程式 */
async function draw() {

    if (isDrawing) return;

    /* 如果卡片已經顯示，按鈕改為收回卡片 */
    if (cardShowing) {
        hideCard();
        return;
    }

    isDrawing = true;

    const cardOutput =
        document.getElementById("card-output");

    const cardRarity =
        document.getElementById("card-rarity");

    const cardName =
        document.getElementById("card-name");

    const emptyMessage =
        document.getElementById("empty-message");

    const drawingMessage =
        document.getElementById("drawing-message");

    const drawButton =
        document.getElementById("draw-button");

    /* 1. 重置卡片 */
    cardOutput.className = "card";

    emptyMessage.style.display = "none";

    drawingMessage.classList.remove("show");

    /* 2. 鎖定按鈕 */
    drawButton.disabled = true;

    /* 3. 顯示抽選文字 */
    drawingMessage.classList.add("show");

    /* 播放啟動音效 */
    playStartSound();

    /* 4. 等待抽選 */
    await wait(1200);

    drawingMessage.classList.remove("show");

    /* 5. 決定抽卡結果 */
    const rarity = getRarity();
    const name = getRandomArtItem(rarity);

    /* 6. 設定卡片內容 */
    cardRarity.innerText = `${rarity} CHALLENGE`;
    cardName.innerText = name;

    /* 依照稀有度設定整張卡片的顏色 */
    cardOutput.className = `card ${rarity}`;

    /* 7. 開始掉落動畫 */
    void cardOutput.offsetWidth;

    requestAnimationFrame(() => {
        cardOutput.classList.add("drop");
    });

    /* 8. 等待卡片掉落 */
    await wait(800);

    /* 9. 卡片自動翻面 */
    cardOutput.classList.add("flip");

    /* 10. 播放稀有度音效 */
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

    /* 11. 等待翻面動畫完成 */
    await wait(750);

    /* 12. 顯示卡片狀態 */
    cardShowing = true;

    /* 恢復按鈕 */
    drawButton.disabled = false;

    isDrawing = false;
}

/* 點擊畫面任意位置收回卡片 */
document.addEventListener("click", function(event) {

    if (!cardShowing) return;

    const cardOutput = document.getElementById("card-output");

    /* 點擊卡片以外的位置也能收回 */
    if (!cardOutput.contains(event.target)) {
        hideCard();
    }

});

/* 點擊卡片本身收回 */
document.getElementById("card-output").addEventListener("click", function() {

    if (cardShowing) {
        hideCard();
    }

});

document.getElementById("draw-button").addEventListener("click", draw);
