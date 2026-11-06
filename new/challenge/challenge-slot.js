

/* ===== 三組抽選資料 ===== */

const people = [
    "1", "2", "3", "4", "5", "6"
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.people = people;

const locations = [
    "超商",
    "公園",
    "操場",
    "人行道",
    "餐廳",
    "飲料店",
    "十字路口",
    "服飾店",
    "地下街",
    "公車上"
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.locations = locations;

const activities = [
    "跳減肥操",
    "學狼叫",
    "大喊今天辛苦了",
    "稱讚陌生人",
    "唱歌",
    "伏地挺身",
    "大喊我威力彩中兩億",
    "跳太空步",
    "護送陌生人",
    "拿香蕉當電話",
    "狗熊哆嗦毛",
    "大喊歐爸撒浪嘿",
    "閃身步",
    "浪子踢球",
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.activities = activities;

const groups = [people, locations, activities];

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
    label.innerText = value;

    // 超過四個字時縮小字體
    if (value.length > 4) {
        label.style.fontSize = "clamp(12px, 2.8vw, 20px)";
    } else {
        label.style.fontSize = "clamp(18px, 3.7vw, 28px)";
    }

    // 超過七個字時再縮小一些
    if (value.length > 7) {
        label.style.fontSize = "clamp(11px, 2.3vw, 16px)";
    }

    reels[index].replaceChildren(label);
}

/* ===== 初始化 ===== */

function init() {
    showItem(0, "人數");
    showItem(1, "地點");
    showItem(2, "活動");
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
    msg.innerText = "命運抽選中...";
    msg.style.color = "#ed7295";

    const results = [null, null, null];

    // 三個轉輪開始快速變換
    reels.forEach((reel, index) => {

        intervals[index] = setInterval(() => {
            showItem(index, randomItem(groups[index]));
        }, 75);

    });

    // 三個轉輪依序停止
    reels.forEach((reel, index) => {

        stopTimers[index] = setTimeout(() => {

            clearInterval(intervals[index]);
            reel.classList.add("stopped");

            const finalValue = randomItem(groups[index]);

            results[index] = finalValue;

            showItem(index, finalValue);

            // 三個轉輪全部停止
            if (results.every(value => value !== null)) {

                wrapper.classList.remove("spinning");

                showResult(results);

            }

        }, 4000 + index * 500);

    });

}

/* ===== 抽選完成 ===== */

function showResult(results) {

    spinning = false;

    const [peopleCount, location, activity] = results;
    const count = Number(peopleCount);

    let resultParts;

    if (count === 0) {
        resultParts = [
            `請你自己在`,
            location,
            activity
        ];
    } else {
        resultParts = [
            `邀請${count - 1}個人跟你一起在`,
            location,
            activity
        ];
    }

    // 每個文字區塊使用相同動畫，同時開始跳動
    msg.innerHTML = resultParts
        .map(part => `<span class="result-bounce">${part}</span>`)
        .join("");

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

handle.addEventListener("pointerup", function(e) {

    if (!isDragging || e.pointerId !== activePointerId) return;
    resetPull();

    if (!spinning) {
        spin();
    }

});

handle.addEventListener("pointercancel", function(e) {
    if (e.pointerId === activePointerId) resetPull();
});
handle.addEventListener("lostpointercapture", function(e) {
    if (e.pointerId === activePointerId) resetPull();
});
window.addEventListener("blur", resetPull);

