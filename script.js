// 場景數據
const scenes = [
    {
        id: 'conference',
        name: '會議室',
        interactionImage: './image/conference.png',
        npc: {
            name: '主管',
            image: 'https://placekitten.com/200/200',
            dialogues: [
                {
                    text: '面對突發加班，你會？',
                    options: [
                        { text: '理性評估是否有餘力', personality: { elephant: 1 } },
                        { text: '直接答應，使命必達', personality: { dragon: 1 } }
                    ]
                },
                {
                    text: '團隊出錯，你會？',
                    options: [
                        { text: '誠實說明並幫忙修正', personality: { peacock: 1 } },
                        { text: '用策略解法協調雙方關係', personality: { parrot: 1 } }
                    ]
                }
            ]
        }
    },
    {
        id: 'breakroom',
        name: '茶水間',
        interactionImage: './image/breakroom.png',
        npc: {
            name: '同事',
            image: 'https://placekitten.com/201/201',
            dialogues: [
                {
                    text: '聽見不誠實案例？',
                    options: [
                        { text: '堅決表態反對不誠實作法', personality: { peacock: 1 } },
                        { text: '換個角度看，靈活應變', personality: { parrot: 1 } }
                    ]
                },
                {
                    text: '公司文化你最在意？',
                    options: [
                        { text: '公開透明、不官腔', personality: { peacock: 1 } },
                        { text: '節奏快、有挑戰才有趣', personality: { dragon: 1 } }
                    ]
                }
            ]
        }
    },
    {
        id: 'office',
        name: '老闆辦公室',
        interactionImage: './image/office.png',
        npc: {
            name: '老闆',
            image: 'https://placekitten.com/202/202',
            dialogues: [
                {
                    text: '選擇穩定 vs 高挑戰？',
                    options: [
                        { text: '每月穩定5萬保障', personality: { elephant: 1 } },
                        { text: '願意挑戰高抽成無保障', personality: { dragon: 1 } }
                    ]
                },
                {
                    text: '面對升遷機會你會？',
                    options: [
                        { text: '衡量長期發展與生活平衡再決定', personality: { elephant: 1 } },
                        { text: '積極爭取、快速成長', personality: { dragon: 1 } }
                    ]
                }
            ]
        }
    },
    {
        id: 'welcome',
        name: '業務接待區',
        interactionImage: './image/welcome.png',
        npc: {
            name: '客戶',
            image: 'https://placekitten.com/203/203',
            dialogues: [
                {
                    text: '客戶問房子缺點？',
                    options: [
                        { text: '誠實說明讓他自己決定', personality: { peacock: 1 } },
                        { text: '強調優點並設法轉移焦點', personality: { parrot: 1 } }
                    ]
                },
                {
                    text: '客戶態度強硬但不合理？',
                    options: [
                        { text: '溝通協調，用策略安撫', personality: { parrot: 1 } },
                        { text: '堅持原則，理性說明', personality: { elephant: 1 } }
                    ]
                }
            ]
        }
    },
    {
        id: 'home',
        name: '戶外看屋現場',
        interactionImage: './image/home.png',
        npc: {
            name: '客戶',
            image: 'https://placekitten.com/204/204',
            dialogues: [
                {
                    text: '客戶問是否能壓價到底？',
                    options: [
                        { text: '如實說明讓他自己決定', personality: { peacock: 1 } },
                        { text: '試著談看看，但不保證', personality: { parrot: 1 } }
                    ]
                },
                {
                    text: '客戶急於簽約未看屋，你會？',
                    options: [
                        { text: '堅持流程，保障客戶權益', personality: { elephant: 1 } },
                        { text: '尊重客戶決定、盡快成交', personality: { dragon: 1 } }
                    ]
                }
            ]
        }
    }
];

// 用戶個性數據
let userPersonality = {
    peacock: 0,  // 🦚
    elephant: 0, // 🐘
    parrot: 0,   // 🦜
    dragon: 0    // 🐉
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

// 當前對話索引
let currentDialogIndex = 0;

// 當前場景ID
let currentSceneId;

function showIntroduction() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    document.getElementById('introductionScreen').style.display = 'flex';
}

function startGame() {
    document.getElementById('introductionScreen').style.display = 'none';
    initializeGame(); // 初始化遊戲
}

// 檢查兩個互動點是否重疊
function checkOverlap(point1, point2) {
    const distance = Math.sqrt(
        Math.pow(point1.x - point2.x, 2) + 
        Math.pow(point1.y - point2.y, 2)
    );
    return distance < 250; // 增加互動點之間的距離到250像素
}

// 檢查點是否與玩家位置重疊
function checkPlayerOverlap(point) {
    const distance = Math.sqrt(
        Math.pow(playerPosition.x - point.x, 2) + 
        Math.pow(playerPosition.y - point.y, 2)
    );
    return distance < 150; // 與玩家保持至少150像素的距離
}

// 檢查是否接觸到互動點
function checkInteractionPoints() {
    const player = document.querySelector('.player');
    const playerRect = player.getBoundingClientRect();
    
    interactionPoints.forEach(point => {
        const pointElement = document.querySelector(`.interaction-point[data-scene-id="${point.sceneId}"]`);
        if (!pointElement) return;
        
        const pointRect = pointElement.getBoundingClientRect();
        
        // 檢查兩個元素是否碰撞
        const isColliding = !(
            playerRect.right < pointRect.left || 
            playerRect.left > pointRect.right || 
            playerRect.bottom < pointRect.top || 
            playerRect.top > pointRect.bottom
        );
        
        if (isColliding && !visitedScenes.has(point.sceneId)) {
            handleInteraction(point);
        }
    });
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
        peacock: 0,
        elephant: 0,
        parrot: 0,
        dragon: 0
    };

    // 重置已訪問場景
    visitedScenes = new Set();
    currentDialogIndex = 0;

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
    
    // 確保互動點不會與玩家重疊且數量正確
    let validPoints = false;
    while (!validPoints) {
        generateInteractionPoints();
        validPoints = interactionPoints.length === scenes.length && 
                     !interactionPoints.some(point => checkPlayerOverlap(point));
    }
    
    interactionPoints.forEach(point => {
        const interactionPoint = document.createElement('div');
        interactionPoint.className = 'interaction-point';
        interactionPoint.style.left = `${point.x}px`;
        interactionPoint.style.top = `${point.y}px`;
        interactionPoint.textContent = point.name;
        interactionPoint.setAttribute('data-scene-id', point.sceneId);
        interactionPoint.setAttribute('title', point.name);
        interactionPoint.style.backgroundImage = `url('${point.image}')`;
        map.appendChild(interactionPoint);
    });
}

// 生成隨機互動點
function generateInteractionPoints() {
    interactionPoints = [];
    const maxAttempts = 200;
    let generatedCount = 0;
    
    while (generatedCount < scenes.length) {
        let attempts = 0;
        let validPosition = false;
        let newPoint;
        
        while (!validPosition && attempts < maxAttempts) {
            newPoint = {
                x: Math.random() * (800 - 150) + 75,
                y: Math.random() * (600 - 150) + 75,
                sceneId: scenes[generatedCount].id,
                name: scenes[generatedCount].name,
                image: scenes[generatedCount].interactionImage
            };
            
            validPosition = !interactionPoints.some(point => checkOverlap(point, newPoint)) && 
                          !checkPlayerOverlap(newPoint);
            attempts++;
        }
        
        if (validPosition) {
            interactionPoints.push(newPoint);
            generatedCount++;
        } else {
            interactionPoints = [];
            generatedCount = 0;
        }
    }
}

// 初始化遊戲
function initializeGame() {
    // 添加鍵盤事件監聽
    document.addEventListener('keydown', handleKeyPress);
    
    // 獲取地圖容器
    const map = document.querySelector('.map');
    
    // 清空現有內容
    map.innerHTML = '';
    
    // 創建道路
    const road = document.createElement('div');
    road.className = 'road';
    map.appendChild(road);
    
    // 創建玩家
    const player = document.createElement('div');
    player.className = 'player';
    player.style.left = '0';
    player.style.bottom = '100px';
    map.appendChild(player);
    
    // 創建房子容器
    const housesContainer = document.createElement('div');
    housesContainer.className = 'houses-container';
    map.appendChild(housesContainer);
    
    // 創建五個互動點（房子）
    scenes.forEach((scene, index) => {
        const interactionPoint = document.createElement('div');
        interactionPoint.className = 'interaction-point';
        interactionPoint.style.backgroundImage = `url('${scene.interactionImage}')`;
        interactionPoint.setAttribute('data-scene-id', scene.id);
        
        // 創建互動提示
        const hint = document.createElement('div');
        hint.className = 'interaction-hint';
        hint.textContent = '按X開始互動';
        interactionPoint.appendChild(hint);
        
        housesContainer.appendChild(interactionPoint);
    });
    
    // 設置初始場景ID
    currentSceneId = scenes[0].id;
    
    // 重置玩家位置
    playerPosition.x = 0;
    const playerElement = document.querySelector('.player');
    playerElement.style.left = `${playerPosition.x}px`;
    
    // 重置已訪問場景
    visitedScenes = new Set();
    currentDialogIndex = 0;
}

// 處理按鍵事件
function handleKeyPress(e) {
    const dialogContainer = document.getElementById('dialogContainer');
    const player = document.querySelector('.player');
    
    // 如果對話框是開啟的，處理選項選擇
    if (dialogContainer.style.display === 'block') {
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
        // 如果對話框是關閉的，處理玩家移動
        switch(e.key) {
            case 'ArrowLeft':
                movePlayer(-MOVEMENT_SPEED);
                if (player) player.style.transform = 'scaleX(-1)';
                break;
            case 'ArrowRight':
                movePlayer(MOVEMENT_SPEED);
                if (player) player.style.transform = 'scaleX(1)';
                break;
            case 'x':
                if (isAtInteractionPoint()) {
                    const scene = scenes[0];
                    if (scene && !visitedScenes.has(scene.id)) {
                        showDialog(scene.npc);
                    }
                }
                break;
        }
    }
}

// 更新選中的選項
function updateSelectedOption() {
    const options = document.querySelectorAll('.dialog-option');
    options.forEach((option, index) => {
        if (index === selectedOptionIndex) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// 移動玩家
function movePlayer(dx) {
    const player = document.querySelector('.player');
    if (!player) return;

    const newX = playerPosition.x + dx;
    const maxX = window.innerWidth * 0.15; // 限制在左側15%的範圍內

    // 檢查邊界
    if (newX >= 0 && newX <= maxX) {
        playerPosition.x = newX;
        player.style.left = `${playerPosition.x}px`;
        
        // 檢查是否碰到房子
        if (isAtInteractionPoint()) {
            const currentPoint = document.querySelector(`.interaction-point[data-scene-id="${currentSceneId}"]`);
            if (currentPoint) {
                const hint = currentPoint.querySelector('.interaction-hint');
                if (hint) {
                    hint.style.display = 'block';
                }
            }
        } else {
            // 如果沒有碰到房子，隱藏所有提示
            const hints = document.querySelectorAll('.interaction-hint');
            hints.forEach(hint => {
                hint.style.display = 'none';
            });
        }
    }
}

// 更新玩家方向
function updatePlayerDirection(dx, dy) {
    // 不再需要更新玩家方向
}

// 處理互動
function handleInteraction(point) {
    const scene = scenes.find(s => s.id === point.sceneId);
    if (scene && !visitedScenes.has(scene.id)) {
        visitedScenes.add(scene.id);
        showDialog(scene.npc);
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
    dialogText.textContent = npc.dialogues[currentDialogIndex].text;

    dialogOptions.innerHTML = '';
    currentDialogOptions = [];
    selectedOptionIndex = 0;

    npc.dialogues[currentDialogIndex].options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'dialog-option';
        if (index === 0) button.classList.add('selected');
        button.textContent = option.text;
        button.addEventListener('click', () => {
            updatePersonality(option.personality);
            currentDialogIndex++;
            
            if (currentDialogIndex < npc.dialogues.length) {
                showDialog(npc);
            } else {
                dialogContainer.style.display = 'none';
                currentDialogIndex = 0;
                visitedScenes.add(currentSceneId);
                checkGameCompletion();
            }
        });
        dialogOptions.appendChild(button);
        currentDialogOptions.push(button);
    });
}

// 移動到下一個場景
function moveToNextScene() {
    const map = document.querySelector('.map');
    const currentSceneIndex = scenes.findIndex(scene => scene.id === currentSceneId);
    const nextSceneIndex = (currentSceneIndex + 1) % scenes.length;
    const nextScene = scenes[nextSceneIndex];
    
    // 更新當前場景ID
    currentSceneId = nextScene.id;
    
    // 更新互動點
    const interactionPoint = document.querySelector('.interaction-point');
    interactionPoint.style.backgroundImage = `url('${nextScene.interactionImage}')`;
    
    // 移動地圖到新場景位置
    const sceneWidth = window.innerWidth;
    map.style.transform = `translateX(-${nextSceneIndex * sceneWidth}px)`;
    
    // 重置玩家位置到新場景的起始位置
    playerPosition.x = 100;
    const player = document.querySelector('.player');
    player.style.left = `${playerPosition.x}px`;
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
        .sort(([_, a], [__, b]) => b - a);

    if (traits.length > 0) {
        const personalityEmojis = {
            peacock: '🦚',
            elephant: '🐘',
            parrot: '🦜',
            dragon: '🐉'
        };
        
        const personalityNames = {
            peacock: '孔雀型',
            elephant: '大象型',
            parrot: '鸚鵡型',
            dragon: '龍型'
        };

        traits.forEach(([trait, value]) => {
            analysis += `${personalityEmojis[trait]} ${personalityNames[trait]}: ${value}分<br>`;
        });

        // 顯示主要人格
        const mainPersonality = traits[0][0];
        analysis += `<br>你的主要人格是：${personalityEmojis[mainPersonality]} ${personalityNames[mainPersonality]}`;
    } else {
        analysis += '你還沒有與任何NPC互動，無法進行個性分析。';
    }

    analysisContent.innerHTML = analysis + '<br><button class="restart-button" onclick="resetGame()">再玩一次</button>';
    analysisContainer.style.display = 'block';
}

function isAtInteractionPoint() {
    const player = document.querySelector('.player');
    if (!player) return false;

    const playerRect = player.getBoundingClientRect();
    const interactionPoints = document.querySelectorAll('.interaction-point');
    
    for (const point of interactionPoints) {
        const pointRect = point.getBoundingClientRect();
        // 檢查玩家是否碰到房子
        const isColliding = !(
            playerRect.right < pointRect.left || 
            playerRect.left > pointRect.right || 
            playerRect.bottom < pointRect.top || 
            playerRect.top > pointRect.bottom
        );
        
        if (isColliding && !visitedScenes.has(point.getAttribute('data-scene-id'))) {
            currentSceneId = point.getAttribute('data-scene-id');
            return true;
        }
    }
    return false;
}