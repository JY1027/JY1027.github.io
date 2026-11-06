

/* 25 個景點 */
const destinations = [
    "臺北101",
    "國父紀念館",
    "中正紀念堂",
    "西門町",
    "大稻埕碼頭",
    "松山文創園區",
    "華山1914文創園區",
    "迪化街",
    "剝皮寮歷史街區",
    "榕錦時光生活園區",
    "赤峰街",
    "陽明山國家公園",
    "擎天崗草原",
    "象山步道",
    "大安森林公園",
    "北投地熱谷",
    "貓空",
    "國立故宮博物院",
    "臺北市立美術館",
    "臺北植物園",
    "國家兩廳院",
    "臺北市立動物園",
    "兒童新樂園",
    "士林夜市",
    "寧夏夜市"
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.destinations = destinations;

const BALL_COUNT = destinations.length;

const canvas = document.getElementById('gachaCanvas');
const ctx = canvas.getContext('2d');

let balls = [];
let isShaking = false;
let isDrawing = false;
let animationStarted = false;

const colors = [
    '#F4A9C2',
    '#F7C5A5',
    '#F5D98E',
    '#B9DDB8',
    '#9ED9D0',
    '#A9C9E8',
    '#C9A9E8'
];
window.PickMePageData = window.PickMePageData || {};
window.PickMePageData.colors = colors;

const faces = [
    'ᵔᴥᵔ',
    '˶ᵔ ᵕ ᵔ˶'
];

/* 畫布尺寸 */
function resizeCanvas() {
    if (!canvas || !canvas.parentElement) return;

    const rect = canvas.parentElement.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;
}

/* 扭蛋球 */
class Ball {

    constructor() {

        // 球體大小
        this.radius = Math.min(canvas.width, canvas.height) *
            (0.065 + Math.random() * .025);

        // 初始從展示窗上方落下
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

        // 重力：讓球體自然往下落
        this.vy += this.gravity;

        if (isShaking) {

            // 搖動時增加隨機力量
            this.vx += (Math.random() - 0.5) * 3.5;
            this.vy += (Math.random() - 0.5) * 3.5;
        }

        // 限制速度
        this.vx = Math.max(-10, Math.min(10, this.vx));
        this.vy = Math.max(-10, Math.min(10, this.vy));

        this.x += this.vx;
        this.y += this.vy;

        // 左側邊界
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx) * this.restitution;
        }

        // 右側邊界
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -Math.abs(this.vx) * this.restitution;
        }

        // 底部邊界
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;

            if (Math.abs(this.vy) > 0.5) {
                this.vy = -Math.abs(this.vy) * this.restitution;
            } else {
                this.vy = 0;
            }

            this.vx *= this.friction;
        }

        // 頂部邊界
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

        ctx.fillText(
            this.face,
            0,
            0
        );

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

/* 球體彼此碰撞 */
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

            // 球體重疊的距離
            const overlap = minDistance - distance;

            // 平均推開兩顆球
            const push = overlap * 0.5;

            a.x -= nx * push;
            a.y -= ny * push;

            b.x += nx * push;
            b.y += ny * push;

            // 相對速度
            const relativeVX = b.vx - a.vx;
            const relativeVY = b.vy - a.vy;

            const velocityAlongNormal =
                relativeVX * nx + relativeVY * ny;

            // 已經分離時不再施加碰撞力
            if (velocityAlongNormal > 0) {
                continue;
            }

            // 碰撞反作用力
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

/* 動畫 */
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

    // 多次碰撞檢查，讓堆疊更穩定
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

    isDrawing = true;

    const machine = document.getElementById('machine');
    const crank = document.getElementById('crank');
    const windowBox = document.getElementById('window');

    const eggContainer = document.getElementById('eggContainer');
    const eggShell = document.getElementById('eggShell');
    const luckyCard = document.getElementById('luckyCard');
    const resultOverlay = document.getElementById('resultOverlay');

    // 轉軸保持顯示
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

    // 2.2 秒後扭蛋從下方滾出
    setTimeout(() => {

        isShaking = false;

        windowBox.classList.remove('shake-window');

        const chosenDestination =
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
   點擊畫面，收起挑戰卡片
========================= */

function closeModal() {

    const luckyCard = document.getElementById('luckyCard');
    const resultOverlay = document.getElementById('resultOverlay');

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

    // 允許下一次抽取
    isDrawing = false;
}

document.getElementById('resultOverlay').addEventListener('click', closeModal);
