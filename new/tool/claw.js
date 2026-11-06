
window.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const resultBox = document.getElementById("result");
    const joystick = document.getElementById("joystick");
    const stick = document.getElementById("stick");

    const btnDrop = document.getElementById("btnDrop");
    const btnReset = document.getElementById("btnReset");

    // 教學元素
    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const tutorialCard = document.getElementById("tutorialCard");
    const tutorialStepLabel = document.getElementById("tutorialStepLabel");
    const tutorialProgress = document.getElementById("tutorialProgress");
    const tutorialTitle = document.getElementById("tutorialTitle");
    const tutorialDescription = document.getElementById("tutorialDescription");
    const tutorialHint = document.getElementById("tutorialHint");
    const tutorialAction = document.getElementById("tutorialAction");
    const tutorialFinish = document.getElementById("tutorialFinish");
    const tutorialSkip = document.getElementById("tutorialSkip");

    // 三個類別各 10 種，交叉組合共 1,000 種
    const desserts = [
        "布丁", "蛋糕", "蛋塔", "燒仙草", "冰淇淋",
        "泡芙", "馬卡龍", "甜甜圈", "豆花", "奶酪"
    ];

    const mains = [
        "漢堡", "排骨飯", "小籠包", "蚵仔煎", "拉麵",
        "火鍋", "飯糰", "丼飯", "水餃", "咖哩飯"
    ];

    const drinks = [
        "美式咖啡", "紅茶", "珍珠奶茶", "木瓜牛奶", "柳橙汁",
        "汽水", "拿鐵", "豆漿", "米漿", "抹茶"
    ];

    let customMode = false;
    window.PickMeIntroTool = {
        configure() {
            customMode = true;
            return true;
        },
        refresh() {}
    };

    const TOY_COUNT = 45;

    const PLAY_AREA = {
        minX: 90,
        maxX: 385,
        minY: 245,
        maxY: 500
    };

    const STATE_IDLE = "IDLE";
    const STATE_DROPPING = "DROPPING";
    const STATE_GRABBING = "GRABBING";
    const STATE_RISING = "RISING";
    const STATE_RETURNING = "RETURNING";
    const STATE_DELIVERING = "DELIVERING";

    let gameState = STATE_IDLE;
    let score = 0;
    let toys = [];
    let heldToy = null;
    let keys = {};
    let resultText = "抓一隻娃娃來決定吧！";

    let combinationDeck = [];
    let combinationIndex = 0;

    let joystickX = 0;
    let joystickY = 0;
    let joystickActive = false;

    // 教學狀態
    let tutorialActive = true;
    let tutorialStage = 0;

    // 第一步搖桿教學設定
    let tutorialMoveDistance = 0;
    let lastStickX = null;
    let lastStickY = null;

    const REQUIRED_MOVE_DISTANCE = 180;
    const JOYSTICK_MAX_DISTANCE = 34;

    const claw = {
        x: 220,
        y: 220,
        dropOffset: 0,
        maxDrop: 110,
        speedX: 4,
        speedY: 3,
        heldToy: null,
        grabTimer: 0
    };

    // 教學階段
    const tutorialStages = [
        {
            label: "WELCOME",
            title: "歡迎來到 PickMe夾娃娃機！",
            description: "想玩夾娃娃機又怕夾不到嗎？讓我們來教你！",
            hint: "點擊「開始教學」進入操作示範。",
            button: "開始教學"
        },
        {
            label: "STEP 1 / 3",
            title: "第一步：移動夾爪",
            description: "使用左側搖桿持續移動，熟悉控制夾爪的方式。",
            hint: "請多次拖動搖桿，累積足夠的移動距離後即可進入下一步。",
            button: "請操作搖桿"
        },
        {
            label: "STEP 2 / 3",
            title: "第二步：抓取娃娃",
            description: "將夾爪移動到想抓取的位置，接著按下右側的「下爪抓取」按鈕。",
            hint: "請按下「下爪抓取」，等待娃娃送到出貨口。",
            button: "請按下抓取"
        },
        {
            label: "STEP 3 / 3",
            title: "第三步：查看抽中結果",
            description: "恭喜你成功抓到娃娃！抽取結果已經顯示在下方，現在你已經學會操作方式。",
            hint: "點擊下方按鈕，即可完成新手教學並開始自由活動。",
            button: ""
        }
    ];

    // 更新教學畫面
    function renderTutorial() {

        const stage = tutorialStages[tutorialStage];

        // 歡迎畫面
        if (tutorialStage === 0) {

            tutorialStepLabel.textContent = "新手教學";
            tutorialTitle.textContent = "歡迎來到 PickMe夾娃娃機！";

            tutorialDescription.innerText =
                "想玩夾娃娃機又怕夾不到嗎？讓我們來教你！";

            tutorialAction.textContent = "開始教學";
            tutorialAction.style.display = "block";
            tutorialAction.classList.remove("hidden");
            tutorialAction.disabled = false;
            tutorialAction.style.opacity = "1";

            tutorialFinish.classList.add("hidden");

            // 歡迎畫面顯示跳過教學按鈕
            tutorialSkip.classList.remove("hidden");

        } else {

            // 進入教學步驟後隱藏跳過按鈕
            tutorialSkip.classList.add("hidden");

            tutorialStepLabel.textContent = stage.label;
            tutorialTitle.textContent = stage.title;
            tutorialDescription.textContent = stage.description;
            tutorialHint.textContent = stage.hint;

            if (tutorialStage === 3) {

                // STEP 4：教學完成
                tutorialStepLabel.textContent = "STEP 4 / 4";
                tutorialTitle.textContent = "教學完成！";

                tutorialDescription.innerText =
                    "你已經學會如何使用夾娃娃機了！\n接下來開始夾娃娃自由吧！";

                tutorialAction.textContent = "開始自由遊玩";
                tutorialAction.style.display = "block";
                tutorialAction.classList.remove("hidden");
                tutorialAction.disabled = false;
                tutorialAction.style.opacity = "1";

                tutorialHint.textContent = "準備好了嗎？";
                tutorialFinish.classList.add("hidden");

            } else {

                tutorialAction.classList.add("hidden");
                tutorialFinish.classList.add("hidden");
            }
        }

        // 進度條：只讓目前步驟的圓點變成粉色長條
        tutorialProgress.innerHTML = "";

        for (let i = 1; i < 4; i++) {

            const dot = document.createElement("span");

            dot.className =
                "tutorial-dot" +
                (tutorialStage > 0 && i === tutorialStage ? " active" : "");

            tutorialProgress.appendChild(dot);
        }

        clearTutorialHighlight();

        if (tutorialStage === 1) {
            highlightTarget(joystick);
        }

        if (tutorialStage === 2) {
            highlightTarget(btnDrop);
        }

        if (tutorialStage === 3) {
            highlightTarget(resultBox);
            tutorialAction.focus();
        }
    }

    // 高亮目標
    function highlightTarget(element) {
        element.classList.add("tutorial-highlight");
    }

    // 清除高亮
    function clearTutorialHighlight() {

        document.querySelectorAll(".tutorial-highlight").forEach(element => {
            element.classList.remove("tutorial-highlight");
        });
    }

    // 下一個教學階段
    function advanceTutorial() {

        if (!tutorialActive) return;

        tutorialStage++;

        if (tutorialStage >= tutorialStages.length) {
            finishTutorial();
            return;
        }

        renderTutorial();
    }

    // 完成教學，進入自由活動
    function finishTutorial() {

        tutorialActive = false;

        tutorialOverlay.classList.add("hidden");
        tutorialCard.classList.add("hidden");

        clearTutorialHighlight();
    }

    // 開始教學
    tutorialAction.addEventListener("click", () => {

        if (tutorialStage === 0) {
            advanceTutorial();
        } else if (tutorialStage === 3) {
            finishTutorial();
        }
    });

    // 跳過教學，直接進入自由遊玩
    tutorialSkip.addEventListener("click", () => {

        if (!tutorialActive || tutorialStage !== 0) return;

        finishTutorial();
    });

    // 完成新手教學，開始自由活動
    tutorialFinish.addEventListener("click", () => {

        if (!tutorialActive || tutorialStage !== 3) return;

        finishTutorial();
    });

    // 打亂陣列
    function shuffle(array) {

        const arr = [...array];

        for (let i = arr.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        return arr;
    }

    // 將數字轉成中文數字
    function toChineseNumber(number) {

        const digits = [
            "零", "一", "二", "三", "四",
            "五", "六", "七", "八", "九"
        ];

        if (number <= 10) {
            return number === 10 ? "十" : digits[number];
        }

        if (number < 20) {
            return "十" + digits[number % 10];
        }

        if (number < 100) {

            const tens = Math.floor(number / 10);
            const ones = number % 10;

            return digits[tens] + "十" + (ones ? digits[ones] : "");
        }

        if (number < 1000) {

            const hundreds = Math.floor(number / 100);
            const remainder = number % 100;

            if (remainder === 0) {
                return digits[hundreds] + "百";
            }

            if (remainder < 10) {
                return digits[hundreds] + "百零" + digits[remainder];
            }

            return digits[hundreds] + "百" + toChineseNumber(remainder);
        }

        return "一千";
    }

    // 隨機散佈娃娃
    function generateToyPositions(count, existing = []) {

        const positions = [];

        let minDistance = 27;
        let attempts = 0;

        while (positions.length < count && attempts < 30000) {

            attempts++;

            const candidate = {
                x: PLAY_AREA.minX + Math.random() * (PLAY_AREA.maxX - PLAY_AREA.minX),
                y: PLAY_AREA.minY + Math.random() * (PLAY_AREA.maxY - PLAY_AREA.minY)
            };

            const occupied = [...existing, ...positions];

            if (occupied.every(point =>
                Math.hypot(
                    point.x - candidate.x,
                    point.y - candidate.y
                ) >= minDistance
            )) {
                positions.push(candidate);
            }

            if (attempts % 5000 === 0) {
                minDistance = Math.max(22, minDistance - 1);
            }
        }

        return positions;
    }

    // 娃娃角色
    class Toy {

        constructor(x, y, type, color, combination) {

            this.x = x;
            this.y = y;
            this.radius = 15;
            this.type = type;
            this.color = color;
            this.combination = combination;
            this.accessory = Math.floor(Math.random() * 3);
        }

        draw() {

            ctx.save();

            ctx.translate(this.x, this.y);
            ctx.scale(0.66, 0.66);

            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#68515b";
            ctx.fillStyle = this.color;

            if (this.type === "bear") {

                ctx.beginPath();
                ctx.arc(-14, -15, 9, 0, Math.PI * 2);
                ctx.arc(14, -15, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#f7b8c9";

                ctx.beginPath();
                ctx.arc(-14, -15, 4, 0, Math.PI * 2);
                ctx.arc(14, -15, 4, 0, Math.PI * 2);
                ctx.fill();

            } else if (this.type === "bunny") {

                ctx.beginPath();
                ctx.ellipse(-10, -23, 6, 15, -.25, 0, Math.PI * 2);
                ctx.ellipse(10, -23, 6, 15, .25, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#f7b6c8";

                ctx.beginPath();
                ctx.ellipse(-10, -23, 2.5, 10, -.25, 0, Math.PI * 2);
                ctx.ellipse(10, -23, 2.5, 10, .25, 0, Math.PI * 2);
                ctx.fill();

            } else if (this.type === "cat") {

                ctx.beginPath();

                ctx.moveTo(-20, -8);
                ctx.lineTo(-17, -25);
                ctx.lineTo(-5, -16);
                ctx.closePath();

                ctx.moveTo(20, -8);
                ctx.lineTo(17, -25);
                ctx.lineTo(5, -16);
                ctx.closePath();

                ctx.fill();
                ctx.stroke();

            } else if (this.type === "chick") {

                ctx.beginPath();
                ctx.arc(-8, -19, 5, 0, Math.PI * 2);
                ctx.arc(0, -23, 5, 0, Math.PI * 2);
                ctx.arc(8, -19, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.ellipse(-20, 5, 7, 11, -.5, 0, Math.PI * 2);
                ctx.ellipse(20, 5, 7, 11, .5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

            } else {

                ctx.beginPath();

                ctx.moveTo(-12, -15);
                ctx.lineTo(-17, -27);
                ctx.lineTo(-4, -20);
                ctx.closePath();

                ctx.moveTo(12, -15);
                ctx.lineTo(17, -27);
                ctx.lineTo(4, -20);
                ctx.closePath();

                ctx.fill();
                ctx.stroke();
            }

            ctx.fillStyle = this.color;

            ctx.beginPath();
            ctx.arc(0, 0, 21, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ffb3c1";

            ctx.beginPath();
            ctx.arc(-12, 5, 4, 0, Math.PI * 2);
            ctx.arc(12, 5, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#44343a";

            ctx.beginPath();
            ctx.arc(-7, -3, 2.5, 0, Math.PI * 2);
            ctx.arc(7, -3, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#44343a";
            ctx.lineWidth = 1.8;

            ctx.beginPath();
            ctx.arc(0, 5, 4, .15, Math.PI - .15);
            ctx.stroke();

            if (this.accessory === 0) {

                ctx.fillStyle = "#ff6f9e";

                ctx.beginPath();

                ctx.moveTo(-4, -19);
                ctx.lineTo(-13, -24);
                ctx.lineTo(-12, -14);
                ctx.closePath();

                ctx.moveTo(4, -19);
                ctx.lineTo(13, -24);
                ctx.lineTo(12, -14);
                ctx.closePath();

                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, -19, 3, 0, Math.PI * 2);
                ctx.fill();

            } else if (this.accessory === 1) {

                ctx.fillStyle = "#ffcf66";
                drawStar(0, -19, 5, 5, 2.5);

            } else {

                ctx.fillStyle = "#ff9fbd";

                for (let i = 0; i < 5; i++) {

                    const angle = i * Math.PI * 2 / 5;

                    ctx.beginPath();

                    ctx.arc(
                        Math.cos(angle) * 5,
                        -19 + Math.sin(angle) * 5,
                        3,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();
                }

                ctx.fillStyle = "#ffe27a";

                ctx.beginPath();
                ctx.arc(0, -19, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    function drawStar(cx, cy, spikes, outerRadius, innerRadius) {

        let rotation = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {

            ctx.lineTo(
                cx + Math.cos(rotation) * outerRadius,
                cy + Math.sin(rotation) * outerRadius
            );

            rotation += step;

            ctx.lineTo(
                cx + Math.cos(rotation) * innerRadius,
                cy + Math.sin(rotation) * innerRadius
            );

            rotation += step;
        }

        ctx.closePath();
        ctx.fill();
    }

    // 建立 1,000 種不重複的組合
    function createCombinationDeck() {

        const allCombinations = [];

        for (const dessert of desserts) {

            for (const main of mains) {

                for (const drink of drinks) {

                    allCombinations.push({
                        dessert,
                        main,
                        drink
                    });
                }
            }
        }

        allCombinations.forEach((combination, index) => {
            combination.optionNumber = index + 1;
        });

        combinationDeck = shuffle(allCombinations);
        combinationIndex = 0;
    }

    function getNextCombination() {

        if (combinationIndex >= combinationDeck.length) {
            return null;
        }

        return combinationDeck[combinationIndex++];
    }

    function createToyAt(position, combination) {

        const toyTypes = [
            "bear", "bunny", "cat", "chick", "dinosaur"
        ];

        const colorSets = {

            bear: ["#d9a77b", "#f0c49e", "#c99576"],

            bunny: ["#ffffff", "#f6dce8", "#e8d9f5"],

            cat: ["#f4d5bd", "#d5d5d5", "#ffffff"],

            chick: ["#ffe17d", "#ffd36b", "#fff0a6"],

            dinosaur: ["#a8d9b5", "#9bc8b8", "#b8dfca"]
        };

        const type = toyTypes[
            Math.floor(Math.random() * toyTypes.length)
        ];

        const colors = colorSets[type];

        const color = colors[
            Math.floor(Math.random() * colors.length)
        ];

        return new Toy(
            position.x,
            position.y,
            type,
            color,
            combination
        );
    }

    function createToys() {

        toys = [];

        createCombinationDeck();

        const positions = generateToyPositions(TOY_COUNT);

        for (const position of positions) {
            toys.push(
                createToyAt(position, getNextCombination())
            );
        }
    }

    // 每成功抓走一隻娃娃，就補上一隻新娃娃
    function refillOneToy() {

        if (
            toys.length >= TOY_COUNT ||
            combinationIndex >= combinationDeck.length
        ) {
            return;
        }

        const [position] = generateToyPositions(1, toys);

        if (!position) return;

        const combination = getNextCombination();

        if (combination) {
            toys.push(createToyAt(position, combination));
        }
    }

    function findNearestToy() {

        let nearest = null;
        let minDistance = Infinity;

        const targetX = claw.x;
        const targetY = claw.y + claw.dropOffset;

        for (const toy of toys) {

            const distance = Math.hypot(
                targetX - toy.x,
                targetY - toy.y
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = toy;
            }
        }

        return nearest && minDistance <= 45 ? nearest : null;
    }

    // 開始抓取
    function startGrab() {

        if (tutorialActive && tutorialStage !== 2) return;

        if (gameState !== STATE_IDLE) return;

        if (customMode && !window.PickMeIntroNotebook?.canChoose()) {
            resultText = "請先開啟自訂筆記本，為娃娃機加入可抽取項目。";
            resultBox.textContent = resultText;
            return;
        }

        if (toys.length === 0) {

            resultText = "本輪 1,000 個選項已全部使用！按「重新開始」開啟新一輪。";

            resultBox.textContent = resultText;

            return;
        }

        if (tutorialActive && tutorialStage === 2) {

            tutorialHint.textContent = "夾爪正在移動，請等待娃娃送到出貨口……";

            tutorialAction.textContent = "抓取進行中";
        }

        gameState = STATE_DROPPING;

        resultText = "夾爪正在下降……";

        resultBox.textContent = resultText;
    }

    // 搖桿操作：累積實際搖桿圓盤位移
    function updateJoystick(event) {

        const rect = joystick.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = event.clientX - centerX;
        let dy = event.clientY - centerY;

        const distance = Math.hypot(dx, dy);

        // 限制搖桿移動範圍
        if (distance > JOYSTICK_MAX_DISTANCE) {

            dx = dx / distance * JOYSTICK_MAX_DISTANCE;
            dy = dy / distance * JOYSTICK_MAX_DISTANCE;
        }

        joystickX = dx / JOYSTICK_MAX_DISTANCE;
        joystickY = dy / JOYSTICK_MAX_DISTANCE;

        // 更新搖桿圓盤位置
        stick.style.left = `calc(50% + ${dx}px)`;
        stick.style.top = `calc(50% + ${dy}px)`;

        // 只有第一步教學才累積移動距離
        if (
            tutorialActive &&
            tutorialStage === 1 &&
            joystickActive
        ) {

            if (lastStickX !== null && lastStickY !== null) {

                const moveDistance = Math.hypot(
                    dx - lastStickX,
                    dy - lastStickY
                );

                tutorialMoveDistance += moveDistance;
            }

            lastStickX = dx;
            lastStickY = dy;

            // 累積距離達標才進入第二步
            if (tutorialMoveDistance >= REQUIRED_MOVE_DISTANCE) {

                tutorialMoveDistance = 0;
                lastStickX = null;
                lastStickY = null;

                joystickX = 0;
                joystickY = 0;

                joystickActive = false;

                stick.style.left = "50%";
                stick.style.top = "50%";

                tutorialStage = 2;

                renderTutorial();
            }
        }
    }

    function resetJoystick() {

        joystickX = 0;
        joystickY = 0;
        joystickActive = false;

        // 清除本次拖動的參考位置，但保留累積進度
        lastStickX = null;
        lastStickY = null;

        stick.style.left = "50%";
        stick.style.top = "50%";
    }

    joystick.addEventListener("pointerdown", event => {

        if (tutorialActive && tutorialStage !== 1 && tutorialStage !== 2) return;

        joystickActive = true;

        lastStickX = null;
        lastStickY = null;

        joystick.setPointerCapture(event.pointerId);

        updateJoystick(event);
    });

    joystick.addEventListener("pointermove", event => {

        if (joystickActive) {
            updateJoystick(event);
        }
    });

    joystick.addEventListener("pointerup", resetJoystick);
    joystick.addEventListener("pointercancel", resetJoystick);
    joystick.addEventListener("lostpointercapture", resetJoystick);

    // 鍵盤操作
    window.addEventListener("keydown", event => {

        if (tutorialActive) return;

        keys[event.code] = true;

        if (event.code === "Space") {

            event.preventDefault();

            if (!event.repeat) {
                startGrab();
            }
        }
    });

    window.addEventListener("keyup", event => {
        keys[event.code] = false;
    });

    // 移動夾爪
    function moveClaw() {

        if (tutorialActive && tutorialStage !== 1 && tutorialStage !== 2) return;

        if (gameState !== STATE_IDLE) return;

        let dx = joystickX;
        let dy = joystickY;

        if (keys["ArrowLeft"]) dx -= 1;
        if (keys["ArrowRight"]) dx += 1;
        if (keys["ArrowUp"]) dy -= 1;
        if (keys["ArrowDown"]) dy += 1;

        const length = Math.hypot(dx, dy);

        if (length > 1) {
            dx /= length;
            dy /= length;
        }

        claw.x += dx * claw.speedX;
        claw.y += dy * claw.speedY;

        claw.x = Math.max(85, Math.min(380, claw.x));
        claw.y = Math.max(190, Math.min(350, claw.y));
    }

    // 遊戲更新
    function update() {

        moveClaw();

        switch (gameState) {

            case STATE_IDLE:
                break;

            case STATE_DROPPING:

                claw.dropOffset += 5;

                if (claw.dropOffset >= claw.maxDrop) {

                    claw.dropOffset = claw.maxDrop;

                    gameState = STATE_GRABBING;
                }

                break;

            case STATE_GRABBING:

                heldToy = findNearestToy();

                claw.heldToy = heldToy;
                claw.grabTimer = 0;

                if (heldToy) {

                    heldToy.x = claw.x;
                    heldToy.y = claw.y + claw.dropOffset + 20;
                }

                gameState = STATE_RISING;

                break;

            case STATE_RISING:

                claw.dropOffset -= 5;

                if (heldToy) {

                    heldToy.x = claw.x;
                    heldToy.y = claw.y + claw.dropOffset + 20;
                }

                if (claw.dropOffset <= 0) {

                    claw.dropOffset = 0;

                    gameState = STATE_RETURNING;

                    resultText = heldToy
                        ? "抓到了！正在送往出貨口……"
                        : "沒有抓到娃娃，請再試一次！";

                    resultBox.textContent = resultText;

                    if (!heldToy && tutorialActive && tutorialStage === 2) {

                        tutorialHint.textContent =
                            "這次沒有抓到，再移動夾爪後按下抓取試試看！";

                        tutorialAction.textContent = "再試一次";
                    }
                }

                break;

            case STATE_RETURNING: {

                claw.x = Math.max(45, claw.x - 4);

                if (claw.y < 390) {
                    claw.y = Math.min(390, claw.y + 3);
                } else if (claw.y > 390) {
                    claw.y = Math.max(390, claw.y - 3);
                }

                if (heldToy) {

                    heldToy.x = claw.x;
                    heldToy.y = claw.y + 22;
                }

                if (claw.x === 45 && claw.y === 390) {

                    if (heldToy) {

                        gameState = STATE_DELIVERING;

                        resultText = "娃娃正在掉進出貨口！";

                        resultBox.textContent = resultText;

                    } else {

                        gameState = STATE_IDLE;

                        claw.y = 220;

                        resultText = "沒有抓到娃娃，請再試一次！";

                        resultBox.textContent = resultText;
                    }
                }

                break;
            }

            case STATE_DELIVERING: {

                if (heldToy) {

                    heldToy.x = 45;
                    heldToy.y += 7;

                    if (heldToy.y >= 490) {

                        const selectedCombination = heldToy.combination;

                        toys = toys.filter(toy => toy !== heldToy);

                        heldToy = null;
                        claw.heldToy = null;

                        score++;

                        refillOneToy();

                        if (customMode) {
                            const selected = window.PickMeIntroNotebook?.choose();
                            if (!selected?.length) {
                                resultText = "自訂選項已抽完，請至筆記本補回選項。";
                            } else {
                                resultText = selected.map((item) => item.value).join(" × ");
                                window.PickMeIntroNotebook.record(resultText);
                            }
                        } else {
                            resultText =
                                `選項${toChineseNumber(selectedCombination.optionNumber)}`;
                        }

                        if (
                            !customMode &&
                            combinationIndex >= combinationDeck.length &&
                            toys.length === 0
                        ) {
                            resultText += "\n\n本輪 1,000 個選項已全部使用！";
                        }

                        resultBox.textContent = resultText;

                        claw.x = 220;
                        claw.y = 220;
                        claw.dropOffset = 0;

                        gameState = STATE_IDLE;

                        // 成功出貨後進入最後一個教學階段
                        if (tutorialActive && tutorialStage === 2) {

                            tutorialStage = 3;

                            renderTutorial();
                        }
                    }
                }

                break;
            }
        }
    }

    // 繪製背景
    function drawBackground() {

        ctx.fillStyle = "#fff0f3";
        ctx.fillRect(0, 0, 400, 520);

        ctx.fillStyle = "#ffb6c8";
        ctx.fillRect(0, 0, 400, 8);

        ctx.fillStyle = "#ff6b8b";
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(30, 60);
        ctx.lineTo(370, 60);
        ctx.stroke();

        // 出貨口
        ctx.fillStyle = "#e0a6b1";
        ctx.fillRect(15, 430, 65, 90);

        ctx.fillStyle = "#2d2d2d";
        ctx.fillRect(20, 440, 55, 80);

        ctx.fillStyle = "rgba(255, 182, 193, 0.6)";
        ctx.fillRect(80, 450, 6, 70);

        // 小裝飾星星
        ctx.fillStyle = "#f5a8bf";
        ctx.font = "16px Arial";

        ctx.fillText("✦", 105, 90);
        ctx.fillText("✧", 345, 120);
        ctx.fillText("✦", 70, 205);
        ctx.fillText("✧", 350, 220);
    }

    // 繪製夾爪
    function drawClaw() {

        const tipY = claw.y + claw.dropOffset;

        ctx.strokeStyle = "#888";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(claw.x, 60);
        ctx.lineTo(claw.x, tipY);
        ctx.stroke();

        ctx.fillStyle = "#ff4d6d";

        ctx.beginPath();
        ctx.arc(claw.x, tipY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff4d6d";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";

        if (gameState === STATE_GRABBING || heldToy) {

            ctx.beginPath();

            ctx.moveTo(claw.x - 13, tipY);
            ctx.lineTo(claw.x - 8, tipY + 20);

            ctx.moveTo(claw.x + 13, tipY);
            ctx.lineTo(claw.x + 8, tipY + 20);

            ctx.stroke();

        } else {

            ctx.beginPath();

            ctx.moveTo(claw.x, tipY);
            ctx.lineTo(claw.x - 13, tipY + 20);

            ctx.moveTo(claw.x, tipY);
            ctx.lineTo(claw.x + 13, tipY + 20);

            ctx.stroke();
        }
    }

    // 繪製遊戲畫面
    function draw() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();

        const sortedToys = [...toys].sort((a, b) => a.y - b.y);

        for (const toy of sortedToys) {

            if (toy !== heldToy) {
                toy.draw();
            }
        }

        if (heldToy) {
            heldToy.draw();
        }

        drawClaw();

        ctx.fillStyle = "#ff4d6d";
        ctx.font = "bold 18px 'Microsoft JhengHei'";
        ctx.textAlign = "left";
    }

    // 遊戲主迴圈
    function gameLoop() {

        update();
        draw();

        requestAnimationFrame(gameLoop);
    }

    // 下爪按鈕
    btnDrop.addEventListener("click", startGrab);

    // 重新開始
    btnReset.addEventListener("click", () => {

        if (tutorialActive) return;

        score = 0;
        heldToy = null;

        claw.heldToy = null;
        claw.x = 220;
        claw.y = 220;
        claw.dropOffset = 0;
        claw.grabTimer = 0;

        gameState = STATE_IDLE;

        resultText = "重新開始！抓一隻娃娃吧！";

        resultBox.textContent = resultText;

        resetJoystick();

        createToys();
    });

    // 初始化
    createToys();

    renderTutorial();

    gameLoop();

});
