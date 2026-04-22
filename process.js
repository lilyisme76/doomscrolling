// 1. 이미지 교체 로직
function changeImg(el, galleryId) {
    const mainImg = document.querySelector(`#${galleryId} .main-display img`);
    if (mainImg) {
        mainImg.style.opacity = "0";
        setTimeout(() => {
            mainImg.src = el.src;
            mainImg.style.opacity = "1";
        }, 200);
    }
    const thumbs = document.querySelectorAll(`#${galleryId} .thumb-list img`);
    thumbs.forEach(img => {
        img.style.borderColor = "transparent";
        img.style.opacity = "0.5";
    });
    el.style.borderColor = "var(--accent)";
    el.style.opacity = "1";
}


// 2. 다크/라이트 모드 전환 및 연동
function toggleMode() {
    const body = document.body;
    const isLight = body.classList.contains('light-mode');
    const newMode = isLight ? 'dark' : 'light';
    
    applyMode(newMode);
    localStorage.setItem('doomscroll_mode', newMode); // index.html과 공유
}

function applyMode(mode) {
    document.body.className = mode + '-mode';
    const modeBtn = document.getElementById('mode-toggle');
    if (modeBtn) {
        modeBtn.innerText = (mode === 'light') ? "Dark Mode" : "Light Mode";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 메인 페이지에서 저장한 모드 동기화
    const savedMode = localStorage.getItem('doomscroll_mode') || 'light';
    applyMode(savedMode);

// 3. 초기 설정
document.addEventListener("DOMContentLoaded", () => {
    // 메인 페이지에서 저장한 모드 동기화
    const savedMode = localStorage.getItem('doomscroll_mode') || 'light';
    applyMode(savedMode);

    // 모든 갤러리 첫 번째 이미지 자동 세팅
    document.querySelectorAll('.gallery-module').forEach(gal => {
        const firstThumb = gal.querySelector('.thumb-list img');
        if (firstThumb) {
            const mainImg = gal.querySelector('.main-display img');
            mainImg.src = firstThumb.src;
            firstThumb.style.borderColor = "var(--accent)";
            firstThumb.style.opacity = "1";
        }
    });
});


    // 모든 갤러리 첫 번째 이미지 세팅
    document.querySelectorAll('.gallery-module').forEach(gal => {
        const firstThumb = gal.querySelector('.thumb-list img');
        if (firstThumb) {
            const mainImg = gal.querySelector('.main-display img');
            mainImg.src = firstThumb.src;
            firstThumb.style.borderColor = "var(--accent)";
            firstThumb.style.opacity = "1";
        }
    });
});

// 4. 스크롤 및 Top 버튼 로직
const topBtn = document.getElementById("topBtn");
window.onscroll = function() {
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        if (topBtn) topBtn.style.display = "block";
    } else {
        if (topBtn) topBtn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. 네비게이션 메뉴 오프셋 보정
document.querySelectorAll('.nav-menu a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 120, // 2단 상단바 높이 고려
                behavior: 'smooth'
            });
        }
    });
});