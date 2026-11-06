

/* =========================
   25 個選項
========================= */

const destinations = [
    "選項一",
    "選項二",
    "選項三",
    "選項四",
    "選項五",
    "選項六",
    "選項七",
    "選項八",
    "選項九",
    "選項十",
    "選項十一",
    "選項十二",
    "選項十三",
    "選項十四",
    "選項十五",
    "選項十六",
    "選項十七",
    "選項十八",
    "選項十九",
    "選項二十",
    "選項二十一",
    "選項二十二",
    "選項二十三",
    "選項二十四",
    "選項二十五"
];

let BALL_COUNT = destinations.length;
let customMode = false;

window.PickMeIntroTool = {
    configure(config) {
        customMode = true;
        this.refresh(config);
        return true;
    },
    refresh(config) {
        const group = config.groups[0];
        const values = (group?.options || [])
            .filter((option) => !config.noReplacement || !group.used.includes(option.id))
            .map((option) => option.value);
        destinations.splice(0, destinations.length, ...values);
        BALL_COUNT = destinations.length;
        createBalls();
    }
};

const canvas = document.getElementById('gachaCanvas');
const ctx = canvas.getContext('2d');

let balls = [];
let isShaking = false;
let isDrawing = false;
let animationStarted = false;

/* =========================
   教學狀態控制
========================= */

let tutorialActive = true;
let tutorialStep = 0;
let tutorialResultClosed = false;
let tutorialFirstDrawCompleted = false;

const colors = [
    '#F4A9C2',
    '#F7C5A5',
    '#F5D98E',
    '#B9DDB8',
    '#9ED9D0',
    '#A9C9E8',
    '#C9A9E8'
];

const faces = [
    'ᵔᴥᵔ',
    '˶ᵔ ᵕ ᵔ˶'
];

/* =========================
   更新教學進度
========================= */

function updateTutorialProgress(step) {

    const dots = document.querySelectorAll('.tutorial-dot');

    let activeIndex = 0;

    if (step === 0) {
        activeIndex = 0;
    } else if (step === 1) {
        activeIndex = 1;
    } else if (step === 2) {
        activeIndex = 2;
    } else {
        activeIndex = 3;
    }

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

/* =========================
   顯示教學內容
========================= */

function showTutorial(step) {

    const overlay = document.getElementById('tutorialOverlay');
    const stepText = document.getElementById('tutorialStep');
    const title = document.getElementById('tutorialTitle');
    const text = document.getElementById('tutorialText');
    const button = document.getElementById('tutorialButton');
    const crank = document.getElementById('crank');
    const skipButton = document.getElementById('tutorialSkip');

    if (step === 3 && !tutorialFirstDrawCompleted) return;
    if (step === 4 && !tutorialResultClosed) return;

    tutorialStep = step;

    overlay.classList.add('show');

    updateTutorialProgress(step);

    // 只有歡迎畫面顯示跳過教學按鈕
    skipButton.style.display =
        step === 0 ? 'inline-block' : 'none';

    crank.classList.remove('tutorial-highlight');

    if (step === 0) {

        stepText.innerText = '新手教學';
        title.innerText = '歡迎來到 PickMe扭蛋機！';

        text.innerText =
            '喜歡轉扭蛋嗎？快來轉一個吧！';

        button.innerText = '開始教學';
        button.style.display = 'inline-block';

    } else if (step === 1) {

        stepText.innerText = 'STEP 1 / 4';
        title.innerText = '認識轉軸操作';

        text.innerText =
            '機臺下方的圓形轉軸就是啟動按鈕。可以點擊轉軸，或按住轉軸拖動，就能啟動扭蛋機。';

        button.innerText = '我知道了';
        button.style.display = 'inline-block';

    } else if (step === 2) {

        stepText.innerText = 'STEP 2 / 4';
        title.innerText = '換你親自操作！';

        text.innerText =
            '請點擊或拖動下方發出粉色光芒的轉軸，親自轉出你的第一顆扭蛋！';

        button.style.display = 'none';
        crank.classList.add('tutorial-highlight');

    } else if (step === 3) {

        stepText.innerText = 'STEP 3 / 4';
        title.innerText = '查看你的扭蛋結果';

        text.innerText =
            '恭喜你完成第一次扭蛋！請點擊畫面任意處，即可完成教學。';

        button.style.display = 'none';

    } else if (step === 4) {

        stepText.innerText = 'STEP 4 / 4';
        title.innerText = '教學完成！';

        text.innerText =
            '你已經學會扭蛋機的操作方式，現在可以自由重複扭蛋！';

        button.innerText = '開始自由遊玩';
        button.style.display = 'inline-block';
    }
}

/* =========================
   教學按鈕
========================= */

function nextTutorial() {

    if (!tutorialActive) return;

    if (tutorialStep === 0) {
        showTutorial(1);
        return;
    }

    if (tutorialStep === 1) {
        showTutorial(2);
        return;
    }

    if (tutorialStep === 4) {
        finishTutorial();
        return;
    }
}

/* =========================
   跳過教學
========================= */

function skipTutorial() {

    if (!tutorialActive || tutorialStep !== 0) return;

    tutorialActive = false;

    document.getElementById('tutorialOverlay')
        .classList.remove('show');

    document.getElementById('crank')
        .classList.remove('tutorial-highlight');
}

/* =========================
   完成教學
========================= */

function finishTutorial() {

    if (!tutorialActive) return;
    if (tutorialStep !== 4) return;
    if (!tutorialFirstDrawCompleted) return;
    if (!tutorialResultClosed) return;
    if (isDrawing) return;

    tutorialActive = false;

    document.getElementById('tutorialOverlay')
        .classList.remove('show');

    document.getElementById('crank')
        .classList.remove('tutorial-highlight');
}

/* =========================
   畫布尺寸
========================= */

function resizeCanvas() {

    if (!canvas || !canvas.parentElement) return;

    const rect = canvas.parentElement.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;
}

/* =========================
   扭蛋球
========================= */

class Ball {

    constructor() {

        this.radius = Math.min(canvas.width, canvas.height) *
            (0.065 + Math.random() * .025);

        this.x = this.radius +
            Math.random() * (canvas.width - this.radius * 2);

        this.y = -Math.random() * canvas.height * 1.5;

        this.color = colors[
            Math.floor(Math.random() * colors.length)
        ];

        this.face = faces[
            Math.floor(Math.random() * faces.length)
        ];

        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = Math.random() * 1.5;

        this.gravity = 0.22;
        this.friction = 0.985;
        this.restitution = 0.35;
    }

    update() {

        this.vy += this.gravity;

        if (isShaking) {
            this.vx += (Math.random() - 0.5) * 3.5;
            this.vy += (Math.random() - 0.5) * 3.5;
        }

        this.vx = Math.max(-10, Math.min(10, this.vx));
        this.vy = Math.max(-10, Math.min(10, this.vy));

        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx) * this.restitution;
        }

        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -Math.abs(this.vx) * this.restitution;
        }

        if (this.y + this.radius > canvas.height) {

            this.y = canvas.height - this.radius;

            if (Math.abs(this.vy) > 0.5) {
                this.vy = -Math.abs(this.vy) * this.restitution;
            } else {
                this.vy = 0;
            }

            this.vx *= this.friction;
        }

        if (this.y - this.radius < 0 && this.vy < 0) {
            this.y = this.radius;
            this.vy = Math.abs(this.vy) * this.restitution;
        }
    }

    draw() {

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.clip();

        // 上半球
        ctx.fillStyle = this.color;

        ctx.fillRect(
            this.x - this.radius,
            this.y - this.radius,
            this.radius * 2,
            this.radius
        );

        // 下半球
        ctx.fillStyle = '#fff8f2';

        ctx.fillRect(
            this.x - this.radius,
            this.y,
            this.radius * 2,
            this.radius
        );

        // 表情
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#a84e72';

        ctx.font =
            `bold ${this.radius * 0.85}px "Microsoft JhengHei", sans-serif`;

        const maxWidth = this.radius * 1.75;
        const textWidth = ctx.measureText(this.face).width;
        const scaleX = Math.min(1, maxWidth / textWidth);

        ctx.save();

        ctx.translate(
            this.x,
            this.y - this.radius * 0.35
        );

        ctx.scale(scaleX, 1);

        ctx.fillText(this.face, 0, 0);

        ctx.restore();

        // 中間接縫
        ctx.beginPath();

        ctx.moveTo(
            this.x - this.radius,
            this.y
        );

        ctx.lineTo(
            this.x + this.radius,
            this.y
        );

        ctx.strokeStyle = '#d98aa7';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 外框
        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle = 'rgba(198, 113, 146, .65)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 反光
        ctx.beginPath();

        ctx.ellipse(
            this.x - this.radius * .35,
            this.y - this.radius * .55,
            this.radius * .22,
            this.radius * .1,
            -.5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = 'rgba(255,255,255,.65)';
        ctx.fill();

        ctx.restore();
    }
}

/* =========================
   球體碰撞
========================= */

function resolveBallCollisions() {

    for (let i = 0; i < balls.length; i++) {

        for (let j = i + 1; j < balls.length; j++) {

            const a = balls[i];
            const b = balls[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;

            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = a.radius + b.radius;

            if (distance === 0 || distance >= minDistance) {
                continue;
            }

            const nx = dx / distance;
            const ny = dy / distance;

            const overlap = minDistance - distance;
            const push = overlap * 0.5;

            a.x -= nx * push;
            a.y -= ny * push;

            b.x += nx * push;
            b.y += ny * push;

            const relativeVX = b.vx - a.vx;
            const relativeVY = b.vy - a.vy;

            const velocityAlongNormal =
                relativeVX * nx + relativeVY * ny;

            if (velocityAlongNormal > 0) {
                continue;
            }

            const restitution = 0.35;

            const impulse =
                -(1 + restitution) * velocityAlongNormal / 2;

            const impulseX = impulse * nx;
            const impulseY = impulse * ny;

            a.vx -= impulseX;
            a.vy -= impulseY;

            b.vx += impulseX;
            b.vy += impulseY;
        }
    }

    // 碰撞後再次限制邊界
    balls.forEach(ball => {

        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
        }

        if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
        }

        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
        }
    });
}

/* =========================
   動畫
========================= */

function animate() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    balls.forEach(ball => {
        ball.update();
    });

    for (let i = 0; i < 3; i++) {
        resolveBallCollisions();
    }

    balls.forEach(ball => {
        ball.draw();
    });

    requestAnimationFrame(animate);
}

/* 建立 25 顆球 */
function createBalls() {

    balls = [];

    for (let i = 0; i < BALL_COUNT; i++) {
        balls.push(new Ball());
    }
}

/* 初始化 */
window.addEventListener('load', () => {

    resizeCanvas();
    createBalls();

    if (!animationStarted) {
        animationStarted = true;
        animate();
    }
});

window.addEventListener('resize', () => {

    resizeCanvas();
    createBalls();
});

/* =========================
   開始扭蛋
========================= */

function drawNumber() {

    if (isDrawing) return;

    // 教學期間只能在第三階段操作轉軸
    if (tutorialActive && tutorialStep !== 2) return;

    // 第一次教學扭蛋完成後，不允許再次扭蛋直到教學結束
    if (tutorialActive && tutorialFirstDrawCompleted) return;

    const customSelection = customMode
        ? window.PickMeIntroNotebook?.choose()?.[0] || null
        : null;
    if (customMode && !customSelection) {
        document.getElementById('cardNumber').innerText = '請先開啟自訂筆記本設定可抽取項目。';
        return;
    }

    isDrawing = true;

    const machine = document.getElementById('machine');
    const crank = document.getElementById('crank');
    const windowBox = document.getElementById('window');

    const eggContainer = document.getElementById('eggContainer');
    const eggShell = document.getElementById('eggShell');
    const luckyCard = document.getElementById('luckyCard');
    const resultOverlay = document.getElementById('resultOverlay');

    // 轉軸動畫
    crank.classList.remove('rotate');
    void crank.offsetWidth;
    crank.classList.add('rotate');

    isShaking = true;

    machine.className = 'gachapon-machine zoom-window';

    windowBox.classList.add('shake-window');

    // 清除上一輪結果
    luckyCard.classList.remove('show');
    resultOverlay.classList.remove('show');

    eggShell.className = 'egg-shell';
    eggContainer.className = 'gacha-drop-container';

    // 1.2 秒後鏡頭移向出蛋口
    setTimeout(() => {

        machine.className = 'gachapon-machine zoom-exit';

    }, 1200);

    // 2.2 秒後扭蛋滾出
    setTimeout(() => {

        isShaking = false;

        windowBox.classList.remove('shake-window');

        const chosenDestination = customSelection?.value ||
            destinations[
                Math.floor(Math.random() * destinations.length)
            ];

        const chosenFace =
            faces[Math.floor(Math.random() * faces.length)];

        const chosenColor =
            colors[Math.floor(Math.random() * colors.length)];

        document.getElementById('eggFace').innerText =
            chosenFace;

        document.getElementById('cardNumber').innerText =
            chosenDestination;

        document.getElementById('eggTop').style.background =
            `linear-gradient(135deg, #fff, ${chosenColor} 40%, ${chosenColor})`;

        eggShell.className = 'egg-shell';

        eggContainer.className =
            'gacha-drop-container roll-out-anim';

        eggContainer.addEventListener('animationend', function handleRollOut(event) {

            if (event.animationName !== 'rollOut') return;

            eggContainer.removeEventListener('animationend', handleRollOut);

            eggShell.classList.add('wiggle');

            setTimeout(() => {

                eggShell.classList.remove('wiggle');

                eggShell.classList.add('open');

                setTimeout(() => {

                    luckyCard.classList.add('show');

                    resultOverlay.classList.add('show');
                    if (customMode) window.PickMeIntroNotebook?.record(chosenDestination);

                    // 第一次扭蛋動畫完整結束，結果卡片顯示後才進入下一階段
                    if (tutorialActive && tutorialStep === 2) {

                        tutorialFirstDrawCompleted = true;

                        showTutorial(3);
                    }

                }, 300);

            }, 1000);

        });

    }, 2200);
}

/* =========================
   轉軸互動功能
   點擊、拖動皆可啟動
========================= */

const crank = document.getElementById('crank');

let crankStartX = 0;
let crankStartY = 0;
let crankMoved = false;
let suppressCrankClick = false;

crank.addEventListener('pointerdown', (e) => {

    if (isDrawing) return;

    // 教學期間只允許第三階段操作
    if (tutorialActive && tutorialStep !== 2) return;

    crankStartX = e.clientX;
    crankStartY = e.clientY;
    crankMoved = false;

    crank.classList.add('pressed');

    crank.setPointerCapture(e.pointerId);
});

crank.addEventListener('pointermove', (e) => {

    if (!crank.hasPointerCapture(e.pointerId)) return;

    if (
        Math.abs(e.clientX - crankStartX) > 8 ||
        Math.abs(e.clientY - crankStartY) > 8
    ) {
        crankMoved = true;
    }
});

crank.addEventListener('pointerup', () => {

    crank.classList.remove('pressed');

    if (crankMoved) {

        suppressCrankClick = true;

        drawNumber();

        setTimeout(() => {
            suppressCrankClick = false;
        }, 0);
    }

    crankMoved = false;
});

crank.addEventListener('pointercancel', () => {

    crank.classList.remove('pressed');
    crankMoved = false;
});

crank.addEventListener('click', () => {

    if (suppressCrankClick) {
        suppressCrankClick = false;
        return;
    }

    drawNumber();
});

/* 支援鍵盤 Enter 和空白鍵 */
crank.addEventListener('keydown', (e) => {

    if (e.key === 'Enter' || e.key === ' ') {

        e.preventDefault();

        if (!e.repeat) {
            drawNumber();
        }
    }
});

/* =========================
   點擊畫面，收起結果卡片
========================= */

function closeModal() {

    const luckyCard = document.getElementById('luckyCard');
    const resultOverlay = document.getElementById('resultOverlay');

    if (!luckyCard.classList.contains('show')) return;

    // 隱藏結果卡片
    luckyCard.classList.remove('show');

    // 關閉點擊層
    resultOverlay.classList.remove('show');

    // 關閉扭蛋
    document.getElementById('eggShell').className =
        'egg-shell';

    document.getElementById('eggContainer').className =
        'gacha-drop-container';

    // 機臺恢復原狀
    document.getElementById('machine').className =
        'gachapon-machine';

    // 恢復轉軸
    document.getElementById('crank')
        .classList.remove('rotate', 'pressed');

    // 允許下一次扭蛋
    isDrawing = false;

    // 只有第一次教學扭蛋的結果卡片被收起後，才進入完成階段
    if (tutorialActive && tutorialStep === 3) {

        tutorialResultClosed = true;

        showTutorial(4);
    }
}

document.getElementById('resultOverlay').addEventListener('click', closeModal);
document.getElementById('tutorialButton').addEventListener('click', nextTutorial);
document.getElementById('tutorialSkip').addEventListener('click', skipTutorial);
