
window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const resultBox = document.getElementById("result");
    const joystick = document.getElementById("joystick");
    const stick = document.getElementById("stick");

    // 三個類別各 10 種，交叉組合共 1,000 種
    const desserts = [
        "布丁", "蛋糕", "蛋塔", "燒仙草", "冰淇淋",
        "泡芙", "馬卡龍", "甜甜圈", "豆花", "奶酪"
    ];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.desserts = desserts;
    const mains = [
        "漢堡", "排骨飯", "小籠包", "蚵子煎", "拉麵",
        "火鍋", "飯糰", "丼飯", "水餃", "咖哩飯"
    ];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.mains = mains;
    const drinks = [
        "美式咖啡", "紅茶", "珍珠奶茶", "木瓜牛奶", "柳橙汁",
        "汽水", "拿鐵", "豆漿", "米漿", "抹茶"
    ];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.drinks = drinks;

    const TOY_COUNT = 45;

    // 擴大娃娃散佈範圍，減少底部留白
    const PLAY_AREA = {
        minX: 90,
        maxX: 385,
        minY: 245,
        maxY: 500
    };

    // 隨機散佈娃娃，避免整齊排列
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
                Math.hypot(point.x - candidate.x, point.y - candidate.y) >= minDistance
            )) {
                positions.push(candidate);
            }

            if (attempts % 5000 === 0) {
                minDistance = Math.max(22, minDistance - 1);
            }
        }

        return positions;
    }

    let combinationDeck = [];
    let combinationIndex = 0;

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
    let resultText = "抓娃娃來決定吃什麼吧！";

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

    let joystickX = 0;
    let joystickY = 0;
    let joystickActive = false;

    function shuffle(array) {
        const arr = [...array];

        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        return arr;
    }

    class Toy {
        constructor(x, y, type, color, combination) {
            this.x = x;
            this.y = y;
            this.radius = 13;
            this.type = type;
            this.color = color;
            this.combination = combination;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(0.66, 0.66);

            ctx.fillStyle = this.color;
            ctx.strokeStyle = "#4a4a4a";
            ctx.lineWidth = 2.5;

            if (this.type === "bear") {
                ctx.beginPath();
                ctx.arc(-14, -14, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(14, -14, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(-15, -5, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(15, -5, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ffb3c1";

            ctx.beginPath();
            ctx.arc(-10, 4, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(10, 4, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#333";

            ctx.beginPath();
            ctx.arc(-6, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(0, 3, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#333";
            ctx.beginPath();
            ctx.arc(0, 1, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // 建立 1,000 種不重複的食物組合
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
        const colors = [
            "#ffffff",
            "#fcd5a1",
            "#f7b2bd",
            "#b5e2fa",
            "#c5dedd"
        ];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.colors = colors;

        const type = Math.random() > 0.5 ? "bear" : "dog";

        const color = type === "dog"
            ? "#ffffff"
            : colors[Math.floor(Math.random() * colors.length)];

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

        const reachableAngle = Math.random() * Math.PI * 2;
        const reachableRadius = Math.random() * 18;
        const reachablePosition = {
            x: 220 + Math.cos(reachableAngle) * reachableRadius,
            y: 330 + Math.sin(reachableAngle) * reachableRadius
        };
        const positions = [
            reachablePosition,
            ...generateToyPositions(TOY_COUNT - 1, [reachablePosition])
        ];

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

    function startGrab() {
        if (gameState !== STATE_IDLE) return;

        if (toys.length === 0) {
            resultText = "本輪 1,000 種組合已全部使用！按「重新開始」可開啟新一輪。";
            resultBox.textContent = resultText;
            return;
        }

        gameState = STATE_DROPPING;
        resultText = "夾爪正在下降……";
        resultBox.textContent = resultText;
    }

    function updateJoystick(event) {
        const rect = joystick.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = event.clientX - centerX;
        let dy = event.clientY - centerY;

        const maxDistance = 34;
        const distance = Math.hypot(dx, dy);

        if (distance > maxDistance) {
            dx = dx / distance * maxDistance;
            dy = dy / distance * maxDistance;
        }

        joystickX = dx / maxDistance;
        joystickY = dy / maxDistance;

        stick.style.left = `calc(50% + ${dx}px)`;
        stick.style.top = `calc(50% + ${dy}px)`;
    }

    function resetJoystick() {
        joystickX = 0;
        joystickY = 0;
        joystickActive = false;

        stick.style.left = "50%";
        stick.style.top = "50%";
    }

    joystick.addEventListener("pointerdown", event => {
        joystickActive = true;
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

    window.addEventListener("keydown", event => {
        if (
            event.target instanceof Element &&
            event.target.closest(".topic-notebook-overlay")
        ) {
            return;
        }

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

    function moveClaw() {
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

                        resultText =
                            `${selectedCombination.main}+${selectedCombination.dessert}+${selectedCombination.drink}`;

                        if (
                            combinationIndex >= combinationDeck.length &&
                            toys.length === 0
                        ) {
                            resultText += "\n\n本輪 1,000 種組合已全部使用！";
                        }

                        resultBox.textContent = resultText;

                        claw.x = 220;
                        claw.y = 220;
                        claw.dropOffset = 0;

                        gameState = STATE_IDLE;
                    }
                }
                break;
            }
        }
    }

    function drawBackground() {
        ctx.fillStyle = "#fff0f3";
        ctx.fillRect(0, 0, 400, 520);

        ctx.strokeStyle = "#ff6b8b";
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(30, 60);
        ctx.lineTo(370, 60);
        ctx.stroke();

        ctx.fillStyle = "#e0a6b1";
        ctx.fillRect(15, 430, 65, 90);

        ctx.fillStyle = "#2d2d2d";
        ctx.fillRect(20, 440, 55, 80);

        ctx.fillStyle = "rgba(255, 182, 193, 0.6)";
        ctx.fillRect(80, 450, 6, 70);
    }

    function drawClaw() {
        const tipY = claw.y + claw.dropOffset;

        // 連接線
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(claw.x, 60);
        ctx.lineTo(claw.x, tipY);
        ctx.stroke();

        // 夾爪中心
        ctx.fillStyle = "#ff4d6d";

        ctx.beginPath();
        ctx.arc(claw.x, tipY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff4d6d";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";

        if (gameState === STATE_GRABBING || heldToy) {
            // 夾爪總寬 26px，與娃娃直徑一致
            ctx.beginPath();

            ctx.moveTo(claw.x - 13, tipY);
            ctx.lineTo(claw.x - 8, tipY + 20);

            ctx.moveTo(claw.x + 13, tipY);
            ctx.lineTo(claw.x + 8, tipY + 20);

            ctx.stroke();
        } else {
            // 待機時張開，兩爪外側總寬 26px
            ctx.beginPath();

            ctx.moveTo(claw.x, tipY);
            ctx.lineTo(claw.x - 13, tipY + 20);

            ctx.moveTo(claw.x, tipY);
            ctx.lineTo(claw.x + 13, tipY + 20);

            ctx.stroke();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();

        const sortedToys = [...toys].sort((a, b) => a.y - b.y);

        // 被抓住的娃娃不在這裡繪製，避免重複繪製
        for (const toy of sortedToys) {
            if (toy !== heldToy) {
                toy.draw();
            }
        }

        if (heldToy) {
            heldToy.draw();
        }

        drawClaw();

        
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    document.getElementById("btnDrop").addEventListener("click", startGrab);

    document.getElementById("btnReset").addEventListener("click", () => {
        score = 0;
        heldToy = null;

        claw.heldToy = null;
        claw.x = 220;
        claw.y = 220;
        claw.dropOffset = 0;
        claw.grabTimer = 0;

        gameState = STATE_IDLE;
        resultText = "娃娃已重新排列，請下爪抓取！";
        resultBox.textContent = resultText;

        resetJoystick();
        createToys();
    });

    createToys();
    gameLoop();
});
