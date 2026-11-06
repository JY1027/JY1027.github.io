

/* ===== 等待 HTML 載入完成 ===== */

document.addEventListener("DOMContentLoaded", function () {


    /* ===== 三組抽選資料 ===== */

    const styles = [
        "韓系",
        "日系",
        "臺系",
        "泰系",
        "美式",
        "港風",
        "英倫風",
        "哥德風",
        "老錢風",
        "新中式"
    ];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.styles = styles;

    const colors = [
        "紅色",
        "橙色",
        "黃色",
        "綠色",
        "藍色",
        "紫色",
        "棕色",
        "黑色",
        "白色",
        "銀色"
    ];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.colors = colors;

    const luckyItems = [
        "蝴蝶結",
        "星星",
        "愛心",
        "羽毛",
        "幸運草",
        "音符",
        "花朵",
        "天使翅膀",
        "十字架",
        "皇冠"
    ];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.luckyItems = luckyItems;

    const groups = [styles, colors, luckyItems];

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

    /* ===== DOM 元素 ===== */

    const msg = document.getElementById("msg");
    const wrapper = document.getElementById("gameWrapper");
    const handle = document.getElementById("handle");

    const reels = [
        document.getElementById("reel1"),
        document.getElementById("reel2"),
        document.getElementById("reel3")
    ];


    /* ===== 檢查 HTML 元素 ===== */

    if (
        !msg ||
        !wrapper ||
        !handle ||
        reels.some(reel => !reel)
    ) {
        console.error("找不到必要的 HTML 元素，請確認 id 名稱。");
        return;
    }

    const rod = handle.querySelector(".handle-rod");

    if (!rod) {
        console.error("找不到 .handle-rod 拉桿元素。");
        return;
    }


    /* ===== 遊戲變數 ===== */

    let spinning = false;
    let intervals = [];
    let stopTimers = [];

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


    /* ===== 隨機選項 ===== */

    function randomItem(list) {
        return list[Math.floor(Math.random() * list.length)];
    }


    /* ===== 顯示轉輪文字 ===== */

    function showItem(index, value) {

        const label = document.createElement("div");

        label.className = "symbol-label";
        label.innerText = value;

        // 根據文字長度調整字體大小

        if (value.length > 7) {
            label.style.fontSize = "clamp(11px, 2.3vw, 16px)";
        } else if (value.length > 4) {
            label.style.fontSize = "clamp(12px, 2.8vw, 20px)";
        } else {
            label.style.fontSize = "clamp(18px, 3.7vw, 28px)";
        }

        reels[index].replaceChildren(label);
    }


    /* ===== 初始化 ===== */

    function init() {

        showItem(0, "風格");
        showItem(1, "顏色");
        showItem(2, "幸運物");

    }

    init();


    /* ===== 抽選完成 ===== */

    function showResult(results) {

        spinning = false;

        const [style, color, luckyItem] = results;

        msg.classList.remove("win");

        msg.innerText =
            `${style} × ${color} × ${luckyItem}`;

        msg.style.color = "#d9577b";

        msg.classList.add("win");
    }


    /* ===== 開始拉霸 ===== */

    function spin() {

        if (spinning) return;
        if (groups.some(group => group.length === 0)) {
            msg.innerText = "本輪自訂選項已抽完，請至筆記本補回所有抽取選項。";
            return;
        }

        spinning = true;

        wrapper.classList.add("spinning");
        reels.forEach(reel => reel.classList.remove("stopped"));

        msg.classList.remove("win");
        msg.innerText = "穿搭組合生成中...";
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


    /* ===== 拉桿按下 ===== */

    handle.addEventListener("pointerdown", function (e) {

        if (!e.isPrimary || e.button !== 0 || spinning || isDragging) return;

        e.preventDefault();

        isDragging = true;
        activePointerId = e.pointerId;
        startY = e.clientY;
        currentPullDistance = 0;

        handle.classList.add("dragging");

        handle.setPointerCapture(e.pointerId);

    });


    /* ===== 拉桿拖曳 ===== */

    handle.addEventListener("pointermove", function (e) {

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


    /* ===== 拉桿放開 ===== */

    handle.addEventListener("pointerup", function (e) {

        if (!isDragging || e.pointerId !== activePointerId) return;
        resetPull();

        if (!spinning) {
            spin();
        }

    });


    /* ===== 拉桿取消 ===== */

    handle.addEventListener("pointercancel", function (e) {
        if (e.pointerId === activePointerId) resetPull();
    });
    handle.addEventListener("lostpointercapture", function (e) {
        if (e.pointerId === activePointerId) resetPull();
    });
    window.addEventListener("blur", resetPull);

});

