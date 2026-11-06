

/* ===== 圖案資料 ===== */

const symbols = [
    "cherry","strawberry","lemon","grape","orange",
    "watermelon","pineapple","bell","diamond","crown",
    "clover","bow","star"
];

const symbolNames = {
    cherry:"櫻桃",
    strawberry:"草莓",
    lemon:"檸檬",
    grape:"葡萄",
    orange:"橘子",
    watermelon:"西瓜",
    pineapple:"鳳梨",
    bell:"幸運鈴鐺",
    diamond:"寶石",
    crown:"皇冠",
    clover:"四葉草",
    bow:"蝴蝶結",
    star:"幸運星"
};

let customMode = false;
let customSlotMode = 'matching';
let customGroups = [];
let currentCustomResults = [];

window.PickMeIntroTool = {
    configure(config) {
        customMode = true;
        customSlotMode = config.mode;
        this.refresh(config);
        return true;
    },
    refresh(config) {
        customSlotMode = config.mode;
        customGroups = config.groups.map((group) =>
            group.options
                .filter((option) => !config.noReplacement || !group.used.includes(option.id))
                .map((option) => option.value));
    }
};

/* ===== DOM ===== */

const msg = document.getElementById("msg");
const wrapper = document.getElementById("gameWrapper");
const handle = document.getElementById("handle");
const rod = handle.querySelector(".handle-rod");

const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3")
];

const reelsContainer = document.getElementById("reelsContainer");

const tutorialCard = document.getElementById("tutorialCard");
const tutorialStep = document.getElementById("tutorialStep");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialDescription = document.getElementById("tutorialDescription");
const tutorialButton = document.getElementById("tutorialButton");
const tutorialSkip = document.getElementById("tutorialSkip");
const tutorialHint = document.getElementById("tutorialHint");
const tutorialProgress = document.getElementById("tutorialProgress");

/* ===== 遊戲狀態 ===== */

let spinning = false;
let isDragging = false;

let activePointerId = null;
let currentPullDistance = 0;

const maxPullDistance = 55;
const maxPullAngle = 30;

let tutorialActive = true;
let tutorialStage = 0;
let lastResults = [];

/* ===== SVG 顯示 ===== */

function showSymbol(element, symbol) {
    if (customMode) {
        const presetNumber = ["一", "二", "三"].indexOf(symbol.replace(/^選項/, ""));
        if (presetNumber >= 0) {
            const presetSymbol = ["cherry", "strawberry", "lemon"][presetNumber];
            element.innerHTML = `
                <svg viewBox="0 0 100 100" role="img" aria-label="${symbol}">
                    <use href="#${presetSymbol}"></use>
                </svg>
            `;
            return;
        }
        const label = document.createElement('span');
        label.className = 'symbol-label';
        label.textContent = symbol;
        element.replaceChildren(label);
        return;
    }
    element.innerHTML = `
        <svg viewBox="0 0 100 100" role="img"
             aria-label="${symbolNames[symbol]}">
            <use href="#${symbol}"></use>
        </svg>
    `;
}

function randomSymbol(index = 0) {
    if (customMode) {
        const group = customSlotMode === 'matching' ? customGroups[0] : customGroups[index];
        return group?.length ? group[Math.floor(Math.random() * group.length)] : '—';
    }
    return symbols[Math.floor(Math.random() * symbols.length)];
}

/* ===== 初始化 ===== */

function init() {
    reels.forEach(reel => {
        showSymbol(reel, "strawberry");
    });
}

init();

/* ===== 教學控制 ===== */

function clearHighlight() {
    handle.classList.remove("tutorial-highlight");
    reelsContainer.classList.remove("tutorial-highlight");
    msg.classList.remove("tutorial-highlight");
}

/* 更新進度條 */

function updateProgress() {
    const dots = tutorialProgress.querySelectorAll(".progress-dot");

    dots.forEach((dot,index) => {
        dot.classList.toggle("active", index === tutorialStage - 1);
    });
}

/* ===== 顯示教學 ===== */

function showTutorial() {

    clearHighlight();

    tutorialButton.style.display = "block";

    tutorialCard.classList.remove("hidden");

    if (tutorialStage === 0) {
        tutorialSkip.style.display = "block";

        tutorialStep.innerText = "新手教學";
        tutorialTitle.innerText = "歡迎來到 PickMe拉霸機！";

        tutorialDescription.innerText =
            "初次體驗嗎？快來認識拉霸機的玩法。";

        tutorialHint.innerText = "";
        tutorialProgress.style.visibility = "visible";
        updateProgress();

        tutorialButton.innerText = "開始教學";

    }

    else if (tutorialStage === 1) {
        tutorialSkip.style.display = "none";

        tutorialStep.innerText = "STEP 1 / 4";
        tutorialTitle.innerText = "認識拉桿";

        tutorialDescription.innerText =
            "請觀察機臺右側的粉色拉桿，這是啟動拉霸機的重要裝置。";

        tutorialButton.innerText = "下一步";



        tutorialProgress.style.visibility = "visible";

        handle.classList.add("tutorial-highlight");

        updateProgress();

    }

    else if (tutorialStage === 2) {
        tutorialSkip.style.display = "none";

        tutorialStep.innerText = "STEP 2 / 4";
        tutorialTitle.innerText = "拉動拉桿！";

        tutorialDescription.innerText =
            "請點擊或向下拖曳拉桿，放開後就會啟動轉輪！";

        tutorialButton.style.display = "none";

  

        tutorialProgress.style.visibility = "visible";

        handle.classList.add("tutorial-highlight");

        updateProgress();

    }

    else if (tutorialStage === 3) {
        tutorialSkip.style.display = "none";

        tutorialStep.innerText = "STEP 3 / 4";
        tutorialTitle.innerText = "觀察轉輪";

        tutorialDescription.innerText =
            "三個圖案正在依序旋轉停止，仔細觀察最後出現的圖案！";

        tutorialButton.style.display = "none";



        tutorialProgress.style.visibility = "visible";

        reelsContainer.classList.add("tutorial-highlight");

        updateProgress();

    }

    else if (tutorialStage === 4) {
        tutorialSkip.style.display = "none";

        tutorialStep.innerText = "STEP 4 / 4";
        tutorialTitle.innerText = "查看抽獎結果";

        tutorialDescription.innerText =
            "三個相同圖案代表連線成功！如果三個圖案不同，則代表這次沒有中獎。";

        tutorialButton.style.display = "block";
        tutorialButton.innerText = "完成教學";

  

        tutorialProgress.style.visibility = "visible";

        msg.classList.add("tutorial-highlight");

        updateProgress();

    }

    else if (tutorialStage === 5) {

        clearHighlight();
        tutorialSkip.style.display = "none";

        tutorialTitle.innerText = "教學完成！";

        tutorialStep.innerText = "TUTORIAL COMPLETED";

        tutorialDescription.innerText =
            "恭喜你完成所有教學！現在可以自由拉動拉桿，享受幸運抽獎的樂趣。";

        tutorialButton.style.display = "block";
        tutorialButton.innerText = "開始自由遊玩";



        tutorialProgress.style.visibility = "hidden";

    }
}

/* ===== 教學按鈕 ===== */

tutorialButton.addEventListener("click", function() {

    if (tutorialStage === 0) {

        tutorialStage = 1;

    } else if (tutorialStage === 1) {

        tutorialStage = 2;

    } else if (tutorialStage === 4) {

        tutorialStage = 5;

    } else if (tutorialStage === 5) {

        tutorialActive = false;

        clearHighlight();

        tutorialCard.classList.add("hidden");

        msg.innerText = "READY TO PLAY";
        msg.classList.remove("win");

        return;
    }

    tutorialButton.style.display = "block";

    showTutorial();
});

/* ===== 跳過教學 ===== */

tutorialSkip.addEventListener("click", function() {
    tutorialActive = false;
    clearHighlight();
    tutorialCard.classList.add("hidden");
    msg.innerText = "READY TO PLAY";
    msg.classList.remove("win");
});

/* ===== 開始拉霸 ===== */

function spin() {

    if (spinning) return;

    spinning = true;

    wrapper.classList.add("spinning");
    reels.forEach(reel => reel.classList.remove("stopped"));

    msg.classList.remove("win");

    msg.innerText = "幸運旋轉中...";
    msg.style.color = "#ed7295";

    const intervals = [];
    const results = [];

    reels.forEach((reel,index) => {

        const intervalId = setInterval(() => {
            showSymbol(reel,randomSymbol(index));
        },70);

        intervals.push(intervalId);
    });

    reels.forEach((reel,index) => {

        const stopTime = 4000 + index * 500;

        setTimeout(() => {

            clearInterval(intervals[index]);
            reel.classList.add("stopped");

            const finalSymbol = customMode
                ? (currentCustomResults[index] || "—")
                : randomSymbol(index);

            showSymbol(reel,finalSymbol);

            results[index] = finalSymbol;

            if (results.filter(Boolean).length === 3) {

                wrapper.classList.remove("spinning");

                lastResults = results;

                checkResult(results);

                /* STEP 3 完成，進入 STEP 4 */

                if (tutorialActive && tutorialStage === 3) {

                    tutorialStage = 4;

                    setTimeout(() => {
                        tutorialButton.style.display = "block";
                        showTutorial();
                    },1000);
                }
            }

        },stopTime);
    });
}

/* ===== 中獎判定 ===== */

function checkResult(results) {

    spinning = false;

    if (customMode) {
        if (customSlotMode === 'matching') {
            const matched = currentCustomResults.every((symbol) => symbol === currentCustomResults[0]);
            msg.innerText = matched
                ? `連連看成功：${currentCustomResults[0]}！`
                : `差一點點！結果是 ${currentCustomResults.join(" × ")}`;
            msg.style.color = matched ? "#d9577b" : "#a77b90";
        } else {
            msg.innerText = currentCustomResults.join(" × ");
            msg.style.color = "#d9577b";
        }
        window.PickMeIntroNotebook?.record(currentCustomResults.join(" × "));
        currentCustomResults = [];
        return;
    }

    const isWin = results.every(
        symbol => symbol === results[0]
    );

    if (!isWin) {

        msg.innerText = "差一點點！再試一次吧";
        msg.style.color = "#a77b90";

        return;
    }

    const winSymbol = results[0];
    const name = symbolNames[winSymbol];

    msg.classList.add("win");

    if (winSymbol === "star") {
        msg.innerText = "JACKPOT！超級幸運大獎！";
        msg.style.color = "#d49b42";

    } else if (
        ["diamond","crown","bow"].includes(winSymbol)
    ) {

        msg.innerText = `恭喜！${name}豪華連線！`;
        msg.style.color = "#d9577b";

    } else {

        msg.innerText = `恭喜成功連線：${name}！`;
        msg.style.color = "#75465c";
    }
}

/* ===== 拉桿拖曳 ===== */

function resetPull() {
    isDragging = false;
    activePointerId = null;
    currentPullDistance = 0;
    handle.classList.remove("dragging");
    rod.style.transform = "";
}

handle.addEventListener("pointerdown",function(e) {
    if (!e.isPrimary || e.button !== 0 || spinning || isDragging) return;

    // 教學中只允許 STEP 2 操作拉桿
    if (tutorialActive && tutorialStage !== 2) return;

    currentCustomResults = customMode
        ? window.PickMeIntroNotebook?.choose()?.map((item) => item.value) || []
        : [];
    if (customMode && !currentCustomResults.length) {
        msg.innerText = "請先開啟自訂筆記本設定可抽取項目。";
        return;
    }

    e.preventDefault();

    isDragging = true;
    activePointerId = e.pointerId;
    startY = e.clientY;
    currentPullDistance = 0;

    handle.classList.add("dragging");

    handle.setPointerCapture(e.pointerId);
});

handle.addEventListener("pointermove",function(e) {

    if (!isDragging || e.pointerId !== activePointerId || spinning) return;

    e.preventDefault();

    const distance = e.clientY - startY;

    currentPullDistance = Math.max(
        0,
        Math.min(distance,maxPullDistance)
    );

    const angle =
        (currentPullDistance / maxPullDistance) * maxPullAngle;

    rod.style.transform = `rotate(${angle}deg)`;
});

handle.addEventListener("pointerup",function(e) {

    if (!isDragging || e.pointerId !== activePointerId) return;

    resetPull();

    if (tutorialActive && tutorialStage === 2) {
        tutorialStage = 3;

        tutorialButton.style.display = "none";

        showTutorial();

        // 真正啟動原本的拉霸程式
        spin();

        return;
    }

    // 自由遊玩模式

    if (!tutorialActive) {
        spin();
    }

});

handle.addEventListener("pointercancel",function(e) {
    if (e.pointerId === activePointerId) resetPull();
});
handle.addEventListener("lostpointercapture",function(e) {
    if (e.pointerId === activePointerId) resetPull();
});
window.addEventListener("blur", resetPull);

/* ===== 啟動新手教學 ===== */

tutorialStage = 0;

showTutorial();

