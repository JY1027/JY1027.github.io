

/* ===== 三組抽選資料 ===== */

const species = [
    "狗", "貓", "兔子", "人", "狐狸",
    "鳥", "蛇", "羊", "馬", "獅子"
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.species = species;

const colors = [
    "紅色", "橙色", "黃色", "綠色", "藍色",
    "紫色", "棕色", "黑色", "白色", "灰色"
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.colors = colors;

const accessories = [
    "翅膀", "角", "獠牙", "利爪", "鱗片",
    "觸手", "星形瞳孔", "魔力", "尾巴", "星雲皮毛"
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.accessories = accessories;

const groups = [species, colors, accessories];

window.setNotebookSlotOptions = (optionsByGroup) => {
    if (
        !Array.isArray(optionsByGroup) ||
        optionsByGroup.length !== groups.length ||
        optionsByGroup.some((options) => !Array.isArray(options))
    ) {
        console.error("拉霸自訂選項格式錯誤，無法同步。");
        return false;
    }

    optionsByGroup.forEach((options, index) => {
        groups[index].splice(0, groups[index].length, ...options);
    });
    return true;
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

let spinning = false;
let intervals = [];
let stopTimers = [];

/* ===== 隨機選項 ===== */

function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}

/* ===== 顯示轉輪文字 ===== */

function showItem(index, value) {
    const label = document.createElement("div");
    label.className = "symbol-label";
    label.textContent = value;

    reels[index].replaceChildren(label);
}

/* ===== 初始化 ===== */

function init() {
    showItem(0, "物種");
    showItem(1, "顏色");
    showItem(2, "特色");
}

init();

/* ===== 開始拉霸 ===== */

function spin() {

    if (spinning) return;
    if (groups.some(group => group.length === 0)) {
        msg.textContent = "本輪自訂選項已抽完，請至筆記本補回所有抽取選項。";
        return;
    }

    spinning = true;

    wrapper.classList.add("spinning");
    reels.forEach(reel => reel.classList.remove("stopped"));

    msg.classList.remove("win");
    msg.textContent = "角色組合生成中...";
    msg.style.color = "#ed7295";

    intervals = [];
    stopTimers = [];

    const results = [null, null, null];

    // 三個轉輪開始快速變換
    reels.forEach((reel, index) => {

        intervals[index] = setInterval(() => {

            const value = randomItem(groups[index]);
            showItem(index, value);

        }, 75);

    });

    // 三個轉輪依序停止
    reels.forEach((reel, index) => {

        const stopTime = 4000 + index * 500;

        stopTimers[index] = setTimeout(() => {

            clearInterval(intervals[index]);
            reel.classList.add("stopped");

            const finalValue = randomItem(groups[index]);

            results[index] = finalValue;

            showItem(index, finalValue);

            // 全部停止後顯示結果
            if (results.every(value => value !== null)) {

                wrapper.classList.remove("spinning");

                showResult(results);

            }

        }, stopTime);

    });

}

/* ===== 抽選完成 ===== */

function showResult(results) {

    spinning = false;

    const [speciesResult, colorResult, accessoryResult] = results;

    // 五個元素全部同步跳動
    msg.innerHTML = `
        <span class="result-bounce">${speciesResult}</span>
        <span class="result-bounce">×</span>
        <span class="result-bounce">${colorResult}</span>
        <span class="result-bounce">×</span>
        <span class="result-bounce">${accessoryResult}</span>
    `;

    msg.style.color = "#d9577b";

    msg.classList.add("win");

}

/* ===== 實體拉桿操作 ===== */

let isDragging = false;
let startY = 0;
let activePointerId = null;
let currentPullDistance = 0;

const maxPullDistance = 55;
const maxPullAngle = 30;
const pullToStartDistance = 12;

function resetPull() {
    isDragging = false;
    activePointerId = null;
    currentPullDistance = 0;
    handle.classList.remove("dragging");
    rod.style.transform = "";
}

handle.addEventListener("pointerdown", function(e) {

    if (!e.isPrimary || e.button !== 0 || spinning || isDragging) return;

    e.preventDefault();

    isDragging = true;
    activePointerId = e.pointerId;
    startY = e.clientY;
    currentPullDistance = 0;

    handle.classList.add("dragging");

    handle.setPointerCapture(e.pointerId);

});

handle.addEventListener("pointermove", function(e) {

    if (!isDragging || e.pointerId !== activePointerId || spinning) return;

    e.preventDefault();

    const distance = e.clientY - startY;

    currentPullDistance = Math.max(
        0,
        Math.min(distance, maxPullDistance)
    );

    const angle =
        (currentPullDistance / maxPullDistance) * maxPullAngle;

    rod.style.transform = `rotate(${angle}deg)`;

    if (currentPullDistance >= pullToStartDistance) {
        resetPull();
        spin();
    }

});

handle.addEventListener("pointerup",function(e) {

    if (!isDragging || e.pointerId !== activePointerId) return;
    resetPull();

    if (!spinning) {
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

