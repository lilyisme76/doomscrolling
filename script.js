let startTime = Date.now();
let totalScrollPx = 0;
let misleadingClicks = 0;
let lastScrollTop = 0;
let refreshCount = 0;
let dopamineSpikes = 0;

let userName = "UNKNOWN_SUBJECT";
let primaryTriggers = [];
let temporalVulnerability = "Not Specified";
let analyzedTraits = [];
let initialPicks = [];

// ✅ 스크린타임 변수
let screenTimeValue = 360; 
let screenTimeDisplayLabel = "6h 0m";

// ✅ 멈춤(Idle) 감지 타이머 변수
let idleTimer = null;

let categories = [
    "Entertainment", "Architecture", "Tech", "Meme", "Visual", "Fashion",
    "Nature", "News", "Food", "Gaming", "Music", "Sports", "Finance",
    "Interior", "Travel", "DIY", "Photography", "Science", "Philosophy", "Art"
];

const quotesByTrigger = {
    'Boredom': ["Digging a hole with your thumb.", "Congrats on doing nothing.", "The loop ends when you die."],
    'Anxiety': ["Your body is dying. Keep scrolling.", "Evolution made you. We broke you."],
    'Procrastination': ["Reading headlines, skipping truth.", "Thinking is too much work.", "High on pixels, low on purpose."],
    'Loneliness': ["We decided this for you.", "Choice is an illusion here.", "Thank you for being predictable."],
    'Default': ["Just one more? You're a liar.", "Your brain is a fried circuit.", "Time you'll never get back.", "Was it worth it? No."]
};

function saveState() {
    let currentStep = 'page-1';
    document.querySelectorAll('.step-view, main').forEach(el => {
        if (el.style.display === 'block' || el.style.display === 'flex') currentStep = el.id;
    });
    const state = {
        currentStep, userName, primaryTriggers, temporalVulnerability, analyzedTraits, initialPicks, categories,
        screenTimeValue, screenTimeDisplayLabel,
        isDetailOpen: document.getElementById('detail-overlay').style.display === 'block',
        stats: { totalScrollPx, misleadingClicks, refreshCount, dopamineSpikes, currentScrollTop: document.getElementById('main-feed').scrollTop, timeSpentSec: Math.floor((Date.now() - startTime) / 1000) }
    };
    sessionStorage.setItem('doomscroll_state', JSON.stringify(state));
}

function loadState() {
    const saved = sessionStorage.getItem('doomscroll_state');
    if (saved) {
        const state = JSON.parse(saved);
        userName = state.userName; primaryTriggers = state.primaryTriggers; temporalVulnerability = state.temporalVulnerability;
        analyzedTraits = state.analyzedTraits; initialPicks = state.initialPicks; if(state.categories) categories = state.categories;
        screenTimeValue = state.screenTimeValue || 360;
        screenTimeDisplayLabel = state.screenTimeDisplayLabel || "6h 0m";
        totalScrollPx = state.stats.totalScrollPx; misleadingClicks = state.stats.misleadingClicks;
        refreshCount = state.stats.refreshCount; dopamineSpikes = state.stats.dopamineSpikes || 0;
        startTime = Date.now() - (state.stats.timeSpentSec * 1000);
        if(userName) document.getElementById('user-name-input').value = userName;
        document.querySelectorAll('.trigger-btn').forEach(btn => {
            if(primaryTriggers.includes(btn.getAttribute('data-value'))) { btn.classList.add('active'); document.getElementById('trigger-next-btn').classList.remove('disabled'); }
        });
        document.querySelectorAll('#quiz-container .quiz-btn').forEach(btn => {
            if(analyzedTraits.includes(btn.getAttribute('data-value'))) { btn.classList.add('active'); document.getElementById('quiz-next-btn').classList.remove('disabled'); }
        });
        renderCategories(); showPage(state.currentStep);
        if (state.currentStep === 'main-feed') setTimeout(() => { document.getElementById('main-feed').scrollTop = state.stats.currentScrollTop; }, 100);
        if (state.isDetailOpen) openDetail();
        return true;
    }
    return false;
}

function resetState() { sessionStorage.removeItem('doomscroll_state'); location.href = 'index.html'; }

function saveName() { userName = document.getElementById('user-name-input').value.trim() || "UNKNOWN_SUBJECT"; showPage('page-2'); }

function toggleTrigger(btn, trigger) {
    btn.classList.toggle('active');
    if(btn.classList.contains('active')) primaryTriggers.push(trigger);
    else primaryTriggers = primaryTriggers.filter(t => t !== trigger);
    document.getElementById('trigger-next-btn').classList.toggle('disabled', primaryTriggers.length === 0);
}
function submitTrigger() { if (primaryTriggers.length > 0) showPage('page-time'); }

function saveTime(time) { temporalVulnerability = time; showPage('page-screentime'); }

function updateSliderDisplay(val) {
    let value = parseInt(val);
    let display = document.getElementById('screentime-display');
    
    if (value <= 25) { screenTimeDisplayLabel = "Less than 30m"; } 
    else if (value >= 905) { screenTimeDisplayLabel = "More than 15h"; } 
    else {
        let h = Math.floor(value / 60);
        let m = value % 60;
        screenTimeDisplayLabel = `${h}h ${m}m`;
    }
    display.innerText = screenTimeDisplayLabel;
    screenTimeValue = value; 
}

function submitScreenTime() { showPage('page-quiz'); }

function toggleQuiz(btn, trait) {
    btn.classList.toggle('active');
    if(btn.classList.contains('active')) analyzedTraits.push(trait);
    else analyzedTraits = analyzedTraits.filter(t => t !== trait);
    document.getElementById('quiz-next-btn').classList.toggle('disabled', analyzedTraits.length === 0);
}
function submitQuiz() { if (analyzedTraits.length > 0) showPage('page-3'); }

function renderCategories() {
    const catGrid = document.getElementById('category-selector');
    catGrid.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        if(initialPicks.includes(cat)) btn.classList.add('active');
        btn.innerText = cat;
        btn.onclick = () => {
            btn.classList.toggle('active');
            if(btn.classList.contains('active')) initialPicks.push(cat);
            else initialPicks = initialPicks.filter(item => item !== cat);
        };
        catGrid.appendChild(btn);
    });
}
renderCategories();

function addCustomInterest() {
    const inputEl = document.getElementById('custom-interest-input');
    const val = inputEl.value.trim();
    if(val && !categories.includes(val)) {
        categories.unshift(val); initialPicks.push(val);
        inputEl.value = ''; renderCategories();
    }
}
function saveInitialPicks() { showPage('page-4'); }

function getAlgoImg() { const id = Math.floor(Math.random() * 1000) + 1; return { url: `https://picsum.photos/id/${id}/600/600`, id: id }; }

function loadMainFeed() {
    const grid = document.getElementById('grid');
    for (let i = 0; i < 15; i++) {
        const data = getAlgoImg();
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.onclick = function() { misleadingClicks++; openDetail(data.url); };
        const img = document.createElement('img');
        img.src = data.url;
        div.appendChild(img);
        grid.appendChild(div);
    }
}

function refreshFeed() {
    refreshCount++;
    const grid = document.getElementById('grid');
    const mainFeed = document.getElementById('main-feed');
    mainFeed.scrollTop = 0;
    grid.classList.add('refresh-bounce');
    setTimeout(() => { grid.innerHTML = ''; loadMainFeed(); }, 150);
    setTimeout(() => { grid.classList.remove('refresh-bounce'); }, 600);
}

function addReel(url) {
    const section = document.createElement('div');
    section.className = 'reel-section';
    section.innerHTML = `<img src="${url}"><div class="side-actions"><button class="action-btn" onclick="event.stopPropagation(); dopamineSpikes++; this.classList.add('active'); saveState();"><span class="icon">♥</span></button></div>`;
    document.getElementById('reels-viewport').appendChild(section);
}

function openDetail(clickedUrl) {
    const detailOverlay = document.getElementById('detail-overlay');
    const viewport = document.getElementById('reels-viewport');
    viewport.innerHTML = '';
    if(clickedUrl) addReel(clickedUrl);
    for(let i=0; i<3; i++){ addReel(getAlgoImg().url); }
    detailOverlay.style.display = 'block';
    detailOverlay.scrollTop = 0;
    
    resetIdleTimer(); // 릴스 창 열렸을 때 튕기기 타이머 시작
}

function closeDetail() { 
    document.getElementById('detail-overlay').style.display = 'none'; 
    resetIdleTimer(); // 릴스 창 닫았을 때 튕기기 타이머 리셋
}

function showPage(id) {
    document.querySelectorAll('.step-view, main').forEach(el => el.style.display = 'none');
    document.getElementById(id).style.display = (id === 'main-feed') ? 'block' : 'flex';
    
    if (id === 'page-4') {
        let p = 0;
        const interval = setInterval(() => {
            p += 5; 
            document.getElementById('loading-text').innerText = `${p}%`;
            document.getElementById('progress-fill').style.width = `${p}%`;
            if (p >= 100) { 
                clearInterval(interval); 
                showPage('main-feed'); 
            }
        }, 40);
    }
    
    if (id === 'main-feed') {
        startTime = Date.now(); 
        document.getElementById('print-btn').style.display = 'block';
        if (!document.getElementById('grid').children.length) {
            loadMainFeed();
        }
        resetIdleTimer(); 
    }
}

function toggleMode() { const isDark = document.body.classList.toggle('dark-mode'); document.getElementById('mode-toggle').innerText = isDark ? "Light Mode" : "Dark Mode"; }

function openReceipt() {
    const timeSpentSec = Math.floor((Date.now() - startTime) / 1000);
    const penaltySec = dopamineSpikes * 5;
    const totalCostMin = ((timeSpentSec + penaltySec) / 60).toFixed(1);
    const scrollMeters = (totalScrollPx / 3000).toFixed(1);

    // ✅ 데이터 가공 및 대문자 변환 (영수증 특유의 기계적인 느낌)
    const traitText = analyzedTraits.length > 0 ? analyzedTraits.join(', ').toUpperCase() : "NONE";
    const triggerText = primaryTriggers.length > 0 ? primaryTriggers.join(', ').toUpperCase() : "NONE";
    const interestText = initialPicks.length > 0 ? initialPicks.join(', ').toUpperCase() : "NONE"; 

    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', hour12: true 
    });

    let finalQuote = (primaryTriggers.length > 0 && quotesByTrigger[primaryTriggers[0]]) 
        ? quotesByTrigger[primaryTriggers[0]][Math.floor(Math.random() * quotesByTrigger[primaryTriggers[0]].length)]
        : quotesByTrigger['Default'][0];

    document.getElementById('receipt-modal').style.display = 'flex';
    document.getElementById('receipt-modal-box').innerHTML = `
        <div id="receipt-area" class="receipt-paper">
            <div class="receipt-header-spacing">
                <p class="receipt-main-title">Attention Tax</p>
                <p class="meta-data">DATE: ${formattedTime}</p>
                <p class="meta-data">SUBJECT: ${userName.toUpperCase()}</p>
            </div>
            
            <div class="receipt-line"></div>
            <div class="receipt-item"><span>ITEM/STATUS</span><span>#</span></div>
            <div class="receipt-line"></div>

            <div class="receipt-item"><span>Avg Screen Time</span><span>${screenTimeDisplayLabel}</span></div>
            <div class="receipt-item"><span>Time Vulnerability</span><span>${temporalVulnerability}</span></div>
            <div class="receipt-item"><span>Dopamine Strikes</span><span>${dopamineSpikes} (+${penaltySec}s)</span></div>
            
            <div class="receipt-line"></div>
            <div class="receipt-item"><span>Behavior Trigger</span><span style="text-align:right; max-width:50%;">${triggerText}</span></div>
            <div class="receipt-item"><span>Selected Interests</span><span style="text-align:right; max-width:50%;">${interestText}</span></div>
            <div class="receipt-item"><span>Psych. Traits</span><span style="text-align:right; max-width:50%;">${traitText}</span></div>
            <div class="receipt-line"></div>

            <div class="receipt-item"><span>Forced Stay Time</span><span>${timeSpentSec} s</span></div>
            <div class="receipt-item"><span>Total Depth</span><span>${scrollMeters} m</span></div>
            <div class="receipt-line"></div>

            <div class="receipt-item penalty-row">
                <span>LIFE EXPECTANCY COST</span>
                <span>-${totalCostMin} MIN</span>
            </div>
            
            <p style="text-align:center; font-size:10px; margin-top:35px; font-weight:bold; text-transform:uppercase; line-height:1.4;">${finalQuote}</p>
        </div>
        <button class="btn-text-only" onclick="document.getElementById('receipt-modal').style.display='none'" style="margin-top:20px;">Return to Feed</button>
    `;

    setTimeout(() => { window.print(); }, 300);
}

// ✅ 스크롤 튕기기 애니메이션 함수
function triggerScrollNudge() {
    const detailOverlay = document.getElementById('detail-overlay');
    // 1. 릴스 창 열려있을 때
    if (detailOverlay.style.display === 'block') {
        const reelsViewport = document.getElementById('reels-viewport');
        reelsViewport.classList.add('nudge-active');
        setTimeout(() => reelsViewport.classList.remove('nudge-active'), 1200);
    } 
    // 2. 메인 피드일 때
    else {
        const mainFeed = document.getElementById('main-feed');
        if (mainFeed.style.display === 'block') {
            const grid = document.getElementById('grid');
            grid.classList.add('nudge-active');
            setTimeout(() => grid.classList.remove('nudge-active'), 1200);
        }
    }
}

// ✅ 튕기기 타이머 초기화 함수
function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(triggerScrollNudge, 3000); // 3초 뒤 튕김
}

// ✅ 메인 피드 스크롤 이벤트 (타이머 리셋 포함)
document.getElementById('main-feed').addEventListener('scroll', function() {
    let currentScroll = this.scrollTop;
    totalScrollPx += Math.abs(currentScroll - lastScrollTop);
    lastScrollTop = currentScroll;
    
    // 무한 스크롤
    if (this.scrollHeight - this.scrollTop - this.clientHeight < 500) {
        loadMainFeed();
    }
    
    resetIdleTimer(); // 스크롤 시 튕기기 타이머 리셋
});

// ✅ 릴스(쇼츠) 피드 스크롤 이벤트 (버그 수정: 확실한 무한 스크롤 로직 탑재)
document.getElementById('detail-overlay').addEventListener('scroll', function() {
    // 무한 스크롤 감지 (바닥에 닿기 전에 추가)
    if (this.scrollHeight - this.scrollTop - this.clientHeight < 800) {
        for (let i = 0; i < 3; i++) {
            addReel(getAlgoImg().url);
        }
    }
    
    resetIdleTimer(); // 스크롤 시 튕기기 타이머 리셋
});

// 페이지 초기화
if (!loadState()) { showPage('page-1'); }