// 場景數據
const scenes = [
    {
        id: 'meeting',
        name: '會議室',
        npc: {
            name: '主管',
            image: 'https://placekitten.com/200/200',
            dialogues: [
                {
                    text: '下個月我們有大促活動，大家能否加班撐一下？',
                    options: [
                        { text: '快答：我可以！為目標全力衝刺。', personality: { efficiency: 1, ambition: 1 } },
                        { text: '緩答：我願意配合，但希望工時不要影響健康。', personality: { health: 1, balance: 1 } }
                    ]
                }
            ]
        }
    },
    {
        id: 'breakroom',
        name: '茶水間',
        npc: {
            name: '同事',
            image: 'https://placekitten.com/201/201',
            dialogues: [
                {
                    text: '聽說別的公司會隱瞞成交細節賺差價？',
                    options: [
                        { text: '默默聽，不發表意見。', personality: { caution: 1, diplomacy: 1 } },
                        { text: '直接說：我認為應該誠實，保障消費者權益。', personality: { integrity: 1, courage: 1 } }
                    ]
                }
            ]
        }
    },
    {
        id: 'boss',
        name: '老闆辦公室',
        npc: {
            name: '老闆',
            image: 'https://placekitten.com/202/202',
            dialogues: [
                {
                    text: '你希望未來的薪資制度是？',
                    options: [
                        { text: '高抽成、挑戰自我！', personality: { ambition: 1, risk: 1 } },
                        { text: '穩定保障型，保障5萬x12個月。', personality: { stability: 1, security: 1 } }
                    ]
                }
            ]
        }
    },
    {
        id: 'reception',
        name: '業務接待區',
        npc: {
            name: '客戶',
            image: 'https://placekitten.com/203/203',
            dialogues: [
                {
                    text: '這裡是不是有瑕疵啊？',
                    options: [
                        { text: '輕描淡寫，轉移話題。', personality: { diplomacy: 1, caution: 1 } },
                        { text: '誠實告知房子的優缺點，並協助提出解決方案。', personality: { integrity: 1, problem_solving: 1 } }
                    ]
                }
            ]
        }
    },
    {
        id: 'outdoor',
        name: '戶外看屋現場',
        npc: {
            name: '客戶',
            image: 'https://placekitten.com/204/204',
            dialogues: [
                {
                    text: '低價搶下物件，但明知價格過低不合理。',
                    options: [
                        { text: '迎合客戶意願，嘗試壓價到底。', personality: { ambition: 1, risk: 1 } },
                        { text: '說明行情與風險，協助客戶理性判斷。', personality: { integrity: 1, responsibility: 1 } }
                    ]
                }
            ]
        }
    }
];

// 用戶個性數據
let userPersonality = {
    efficiency: 0,
    ambition: 0,
    health: 0,
    balance: 0,
    caution: 0,
    diplomacy: 0,
    integrity: 0,
    courage: 0,
    stability: 0,
    security: 0,
    risk: 0,
    problem_solving: 0,
    responsibility: 0
};

// 已訪問的場景
let visitedScenes = new Set();

// 玩家位置和方向
let playerPosition = {
    x: 100,
    y: 100
};

let playerDirection = 'right'; // 默認方向

// 移動速度
const MOVEMENT_SPEED = 20;

// 互動點數據
let interactionPoints = [];

// 對話相關變量
let currentDialogOptions = [];
let selectedOptionIndex = 0;

// 檢查兩個互動點是否重疊
function checkOverlap(point1, point2) {
    const distance = Math.sqrt(
        Math.pow(point1.x - point2.x, 2) + 
        Math.pow(point1.y - point2.y, 2)
    );
    return distance < 250; // 增加互動點之間的距離到250像素
}

// 重置遊戲狀態
function resetGame() {
    // 重置玩家位置
    playerPosition = {
        x: 100,
        y: 100
    };
    playerDirection = 'right';

    // 重置個性數據
    userPersonality = {
        efficiency: 0,
        ambition: 0,
        health: 0,
        balance: 0,
        caution: 0,
        diplomacy: 0,
        integrity: 0,
        courage: 0,
        stability: 0,
        security: 0,
        risk: 0,
        problem_solving: 0,
        responsibility: 0
    };

    // 重置已訪問場景
    visitedScenes = new Set();

    // 重置UI
    const player = document.querySelector('.player');
    player.style.left = `${playerPosition.x}px`;
    player.style.top = `${playerPosition.y}px`;
    player.className = 'player right';

    // 隱藏個性分析
    document.getElementById('personalityAnalysis').style.display = 'none';

    // 重新生成互動點
    const map = document.getElementById('map');
    const existingPoints = document.querySelectorAll('.interaction-point');
    existingPoints.forEach(point => point.remove());
    generateInteractionPoints();
    interactionPoints.forEach(point => {
        const interactionPoint = document.createElement('div');
        interactionPoint.className = 'interaction-point';
        interactionPoint.style.left = `${point.x}px`;
        interactionPoint.style.top = `${point.y}px`;
        interactionPoint.textContent = point.name;
        map.appendChild(interactionPoint);
    });
}

// 生成隨機互動點
function generateInteractionPoints() {
    interactionPoints = [];
    const maxAttempts = 200; // 增加最大嘗試次數
    
    for (let i = 0; i < scenes.length; i++) {
        let attempts = 0;
        let validPosition = false;
        let newPoint;
        
        while (!validPosition && attempts < maxAttempts) {
            newPoint = {
                x: Math.random() * (800 - 150) + 75, // 調整生成範圍，避免太靠近邊緣
                y: Math.random() * (600 - 150) + 75,
                sceneId: scenes[i].id,
                name: scenes[i].name
            };
            
            // 檢查是否與現有的互動點重疊
            validPosition = !interactionPoints.some(point => checkOverlap(point, newPoint));
            attempts++;
        }
        
        if (validPosition) {
            interactionPoints.push(newPoint);
        }
    }
}

// 初始化遊戲
function initializeGame() {
    const map = document.getElementById('map');
    
    // 創建玩家
    const player = document.createElement('div');
    player.className = 'player right'; // 設置初始方向
    player.style.left = `${playerPosition.x}px`;
    player.style.top = `${playerPosition.y}px`;
    map.appendChild(player);

    // 生成互動點
    generateInteractionPoints();

    // 創建互動點
    interactionPoints.forEach(point => {
        const interactionPoint = document.createElement('div');
        interactionPoint.className = 'interaction-point';
        interactionPoint.style.left = `${point.x}px`;
        interactionPoint.style.top = `${point.y}px`;
        interactionPoint.textContent = point.name;
        map.appendChild(interactionPoint);
    });

    // 添加鍵盤控制
    document.addEventListener('keydown', handleKeyPress);
}

// 處理按鍵事件
function handleKeyPress(e) {
    const dialogContainer = document.getElementById('dialogContainer');
    
    if (dialogContainer.style.display === 'block') {
        // 對話框開啟時的按鍵處理
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                selectedOptionIndex = Math.max(0, selectedOptionIndex - 1);
                updateSelectedOption();
                break;
            case 'ArrowDown':
                e.preventDefault();
                selectedOptionIndex = Math.min(currentDialogOptions.length - 1, selectedOptionIndex + 1);
                updateSelectedOption();
                break;
            case 'Enter':
                e.preventDefault();
                if (currentDialogOptions[selectedOptionIndex]) {
                    currentDialogOptions[selectedOptionIndex].click();
                }
                break;
        }
    } else {
        // 移動控制
        switch(e.key) {
            case 'ArrowUp':
                movePlayer(0, -MOVEMENT_SPEED);
                break;
            case 'ArrowDown':
                movePlayer(0, MOVEMENT_SPEED);
                break;
            case 'ArrowLeft':
                movePlayer(-MOVEMENT_SPEED, 0);
                break;
            case 'ArrowRight':
                movePlayer(MOVEMENT_SPEED, 0);
                break;
        }
    }
}

// 更新選中的對話選項
function updateSelectedOption() {
    const options = document.querySelectorAll('.dialog-option');
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === selectedOptionIndex);
    });
}

// 移動玩家
function movePlayer(dx, dy) {
    const player = document.querySelector('.player');
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    // 檢查邊界
    if (newX >= 0 && newX <= 800 && newY >= 0 && newY <= 600) {
        playerPosition.x = newX;
        playerPosition.y = newY;
        player.style.left = `${playerPosition.x}px`;
        player.style.top = `${playerPosition.y}px`;
        
        // 更新玩家方向
        updatePlayerDirection(dx, dy);
        
        // 檢查是否接觸到互動點
        checkInteractionPoints();
    }
}

// 更新玩家方向
function updatePlayerDirection(dx, dy) {
    const player = document.querySelector('.player');
    
    // 移除所有方向類
    player.classList.remove('up', 'down', 'left', 'right');
    
    // 根據移動方向添加對應的類
    if (dx > 0) {
        player.classList.add('right');
        playerDirection = 'right';
    } else if (dx < 0) {
        player.classList.add('left');
        playerDirection = 'left';
    } else if (dy > 0) {
        player.classList.add('down');
        playerDirection = 'down';
    } else if (dy < 0) {
        player.classList.add('up');
        playerDirection = 'up';
    }
}

// 檢查是否接觸到互動點
function checkInteractionPoints() {
    interactionPoints.forEach(point => {
        const distance = Math.sqrt(
            Math.pow(playerPosition.x - point.x, 2) + 
            Math.pow(playerPosition.y - point.y, 2)
        );
        
        if (distance < 100 && !visitedScenes.has(point.sceneId)) {
            handleInteraction(point);
        }
    });
}

// 處理互動
function handleInteraction(point) {
    const scene = scenes.find(s => s.id === point.sceneId);
    if (scene) {
        visitedScenes.add(scene.id);
        showDialog(scene.npc);
        updatePersonalityAnalysis();
    }
}

// 顯示對話框
function showDialog(npc) {
    const dialogContainer = document.getElementById('dialogContainer');
    const npcImage = document.getElementById('npcImage');
    const npcName = document.getElementById('npcName');
    const dialogText = document.getElementById('dialogText');
    const dialogOptions = document.getElementById('dialogOptions');

    dialogContainer.style.display = 'block';
    npcImage.src = npc.image;
    npcName.textContent = npc.name;
    dialogText.textContent = npc.dialogues[0].text;

    dialogOptions.innerHTML = '';
    currentDialogOptions = [];
    selectedOptionIndex = 0;

    npc.dialogues[0].options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'dialog-option';
        button.textContent = option.text;
        button.addEventListener('click', () => {
            updatePersonality(option.personality);
            dialogContainer.style.display = 'none';
            checkGameCompletion();
        });
        dialogOptions.appendChild(button);
        currentDialogOptions.push(button);
    });

    // 設置第一個選項為選中狀態
    updateSelectedOption();
}

// 更新個性數據
function updatePersonality(personalityChanges) {
    Object.keys(personalityChanges).forEach(trait => {
        userPersonality[trait] += personalityChanges[trait];
    });
}

// 檢查遊戲是否完成
function checkGameCompletion() {
    if (visitedScenes.size === scenes.length) {
        showPersonalityAnalysis();
    }
}

// 顯示個性分析
function showPersonalityAnalysis() {
    const analysisContainer = document.getElementById('personalityAnalysis');
    const analysisContent = document.getElementById('analysisContent');
    let analysis = '根據你的選擇，我們發現：<br><br>';
    
    // 分析主要特質
    const traits = Object.entries(userPersonality)
        .filter(([_, value]) => value !== 0)
        .sort(([_, a], [__, b]) => b - a);

    if (traits.length > 0) {
        traits.forEach(([trait, value]) => {
            const traitName = getTraitName(trait);
            analysis += `${traitName}: ${value > 0 ? '傾向' : '較少'}${getTraitDescription(trait)}<br>`;
        });
    } else {
        analysis += '你還沒有與任何NPC互動，無法進行個性分析。';
    }

    analysisContent.innerHTML = analysis + '<br><button class="restart-button" onclick="resetGame()">再玩一次</button>';
    analysisContainer.style.display = 'block';
}

// 獲取特質名稱
function getTraitName(trait) {
    const traitNames = {
        efficiency: '效率導向',
        ambition: '進取心',
        health: '健康意識',
        balance: '工作平衡',
        caution: '謹慎',
        diplomacy: '外交手腕',
        integrity: '誠信',
        courage: '勇氣',
        stability: '穩定性',
        security: '安全感',
        risk: '風險承受度',
        problem_solving: '問題解決能力',
        responsibility: '責任感'
    };
    return traitNames[trait] || trait;
}

// 獲取特質描述
function getTraitDescription(trait) {
    const descriptions = {
        efficiency: '注重效率',
        ambition: '富有進取心',
        health: '重視健康',
        balance: '注重工作平衡',
        caution: '行事謹慎',
        diplomacy: '善於溝通',
        integrity: '誠實正直',
        courage: '勇於表達',
        stability: '追求穩定',
        security: '重視保障',
        risk: '願意承擔風險',
        problem_solving: '善於解決問題',
        responsibility: '富有責任感'
    };
    return descriptions[trait] || '';
}

// 初始化應用
initializeGame(); 