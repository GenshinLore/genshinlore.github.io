const videoSources = [
    'video/backgroundA.mp4',
    'video/backgroundB.mp4',
    'video/backgroundC.mp4'
];

let currentVideoIndex = 0;
const video = document.getElementById('bg-video');
const contentWrapper = document.querySelector('.content-wrapper');
const enterBtn = document.querySelector('.enter-btn');
const titleText = document.querySelector('.title-text');
function initVideo() {
    video.muted = true;
    video.removeAttribute('loop');
    video.src = videoSources[currentVideoIndex];
    video.load();
    
    video.addEventListener('ended', function onEnded() {
        currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
        video.src = videoSources[currentVideoIndex];
        video.load();
        video.play();
    });
    
    video.play().then(() => {
        video.classList.add('loaded');
    }).catch(err => {
        console.log('自动播放被阻止，等待用户交互');
    });
}

// Canvas 粒子系统
let canvas, ctx;
let particles = [];
let animationId = null;
const targetText = 'All of Sun and Moon';
let textVisible = false;

async function waitForFont(fontName) {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkFont = () => {
            const testCanvas = document.createElement('canvas');
            const testCtx = testCanvas.getContext('2d');
            testCtx.font = '72px ' + fontName;
            const metrics = testCtx.measureText('A');
            
            if (metrics.width > 50) {
                console.log(`字体 ${fontName} 已就绪，宽度：${metrics.width}`);
                resolve(true);
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkFont, 100);
                } else {
                    console.log(`字体 ${fontName} 加载超时，继续执行`);
                    resolve(true);
                }
            }
        };
        
        setTimeout(checkFont, 300);
    });
}

function initCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 11;
        pointer-events: none;
    `;
    document.body.appendChild(canvas);
    
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticles(text) {
    const fontSize = Math.min(canvas.width * 0.08, 72);
    ctx.font = `bold ${fontSize}px 'Khaenriah', serif`;
    ctx.fillStyle = '#D3BC8E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '8px';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 100);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles = [];
    const gap = 6;
    const steps = 120;
    const targetParticleCount = 1200;
    let collectedPoints = [];
    
    for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
            const i = (y * canvas.width + x) * 4;
            if (data[i + 3] > 128) {
                collectedPoints.push({ x, y });
            }
        }
    }
    
    const step = Math.max(1, Math.floor(collectedPoints.length / targetParticleCount));
    
    for (let i = 0; i < collectedPoints.length && particles.length < targetParticleCount; i += step) {
        const point = collectedPoints[i];
        const randomX = Math.random() * canvas.width;
        const randomY = Math.random() * canvas.height;
        const dx = point.x - randomX;
        const dy = point.y - randomY;
        
        particles.push({
            x: randomX,
            y: randomY,
            startX: randomX,
            startY: randomY,
            targetX: point.x,
            targetY: point.y,
            vx: dx / steps,
            vy: dy / steps,
            size: 6,
            alpha: 0,
            targetAlpha: 1
        });
    }
}

function animateParticles() {
    if (textVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fontSize = Math.min(canvas.width * 0.08, 72);
        ctx.font = `bold ${fontSize}px 'Khaenriah', serif`;
        ctx.fillStyle = '#D3BC8E';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '8px';
        ctx.shadowColor = '#D3BC8E';
        ctx.shadowBlur = 20;
        ctx.fillText(targetText, canvas.width / 2, canvas.height / 2 - 100);
        ctx.shadowBlur = 0;
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let allReached = true;
    
    ctx.beginPath();
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const distance = dx * dx + dy * dy;
        
        if (distance > 1) {
            // 计算进度 (0 到 1)
            const totalDistance = Math.sqrt((p.targetX - p.startX) ** 2 + (p.targetY - p.startY) ** 2);
            const currentDistance = Math.sqrt((p.x - p.startX) ** 2 + (p.y - p.startY) ** 2);
            const progress = currentDistance / totalDistance;
            
            // 使用 ease-in 曲线: 先慢后快
            const easeIn = progress * progress;
            const speed = 0.5 + easeIn * 1.5; // 速度从 0.5 到 2.0
            
            p.x += p.vx * speed;
            p.y += p.vy * speed;
            allReached = false;
        } else {
            p.x = p.targetX;
            p.y = p.targetY;
        }
        
        if (p.alpha < p.targetAlpha) {
            p.alpha += 0.02;
            if (p.alpha > p.targetAlpha) {
                p.alpha = p.targetAlpha;
            }
        }
        
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.closePath();
    }
    
    ctx.fillStyle = '#D3BC8E';
    ctx.fill();
    
    if (!allReached) {
        animationId = requestAnimationFrame(animateParticles);
    } else {
        textVisible = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fontSize = Math.min(canvas.width * 0.08, 72);
        ctx.font = `bold ${fontSize}px 'Khaenriah', serif`;
        ctx.fillStyle = '#D3BC8E';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '8px';
        ctx.shadowColor = '#D3BC8E';
        ctx.shadowBlur = 20;
        ctx.fillText(targetText, canvas.width / 2, canvas.height / 2 - 100);
        ctx.shadowBlur = 0;
    }
}

function startParticleAnimation() {
    waitForFont('Khaenriah').then(() => {
        setTimeout(() => {
            textVisible = false;
            createParticles(targetText);
            animateParticles();
            
            setTimeout(() => {
                enterBtn.classList.add('visible');
            }, 4000);
        }, 500);
    });
}

function goToMain() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (canvas) {
        canvas.style.transition = 'opacity 1.5s ease';
        canvas.style.opacity = '0';
    }
    
    contentWrapper.style.transition = 'opacity 1.5s ease';
    contentWrapper.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = 'main.html';
    }, 1500);
}

window.goToMain = goToMain;

window.addEventListener('resize', () => {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        textVisible = false;
        particles = [];
        createParticles(targetText);
        animateParticles();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    initVideo();
    initCanvas();
    startParticleAnimation();
});
