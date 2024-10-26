const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Tab</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>⭐</text></svg>">
    <style>
    /* 全局样式 */
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #d8eac4;
        transition: background-color 0.3s ease;
    }
    
    /* 固定元素样式 */
    .fixed-elements {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #d8eac4;
        z-index: 1000;
        padding: 10px;
        transition: background-color 0.3s ease;
        height: 130px;
    }
    
    .fixed-elements h3 {
        position: absolute;
        top: 10px;
        left: 20px;
        margin: 0;
    }
    
    /* 中心内容样式 */
    .center-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        max-width: 600px;
        text-align: center;
    }
    
    /* 管理员控制面板样式 */
    .admin-controls {
        position: fixed;
        top: 10px;
        right: 10px;
        font-size: 60%;
    }
    
    /* 添加/删除控制按钮样式 */
    .add-remove-controls {
        display: none;
        flex-direction: column;
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        align-items: center;
        gap: 10px;
    }
    
    .round-btn {
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        text-align: center;
        font-size: 24px;
        line-height: 40px;
        cursor: pointer;
        margin: 5px 0;
    }
    
    .add-btn { order: 1; }
    .remove-btn { order: 2; }
    .category-btn { order: 3; }
    .remove-category-btn { order: 4; }
    
    /* 主要内容区域样式 */
    .content {
        margin-top: 140px;
        padding: 20px;
    }
    
    /* 搜索栏样式 */
    .search-container {
        margin-top: 10px;
    }
    
    .search-bar {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
    }
    
    .search-bar input {
        width: 70%;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px 0 0 5px;
    }
    
    .search-bar button {
        padding: 5px 10px;
        border: 1px solid #ccc;
        border-left: none;
        background-color: #f8f8;
        border-radius: 0 5px 5px 0;
        cursor: pointer;
    }
    
    /* 搜索引擎按钮样式 */
    .search-engines {
        display: flex;
        justify-content: center;
        gap: 10px;
    }
    
    .search-engine {
        padding: 5px 10px;
        border: 1px solid #ccc;
        background-color: #f0f0;
        border-radius: 5px;
        cursor: pointer;
    }
    
    /* 主题切换按钮样式 */
    #theme-toggle {
        position: fixed;
        bottom: 50px;
        right: 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        text-align: center;
        font-size: 24px;
        line-height: 40px;
        cursor: pointer;
    }

    /* 显示日志按钮样式 */
    #view-logs-btn {
        position: fixed;
        top: 100px; 
        right: 10px;
        z-index: 1000; 
    }    
    
    /* 对话框样式 */
    #dialog-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
    }
    
    #dialog-box {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        width: 300px;
    }
    
    #dialog-box input, #dialog-box select {
        width: 100%;
        margin-bottom: 10px;
        padding: 5px;
    }
    
    /* 分类和卡片样式 */
    .section {
        margin-bottom: 20px;
    }
    
    .section-title-container {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .section-title {
        font-size: 18px;
        font-weight: bold;
    }
    
    .delete-category-btn {
        background-color: pink;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
    }
    
    .card-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .card {
        background-color: #a0c9e5;
        border-radius: 5px;
        padding: 10px;
        width: 150px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s;
        position: relative;
        user-select: none;
    }
    
    .card:hover {
        transform: translateY(-5px);
    }
    
    .card-top {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
    }
    
    .card-icon {
        width: 16px;
        height: 16px;
        margin-right: 5px;
    }
    
    .card-title {
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .card-url {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .private-tag {
        background-color: #ff9800;
        color: white;
        font-size: 10px;
        padding: 2px 5px;
        border-radius: 3px;
        position: absolute;
        top: 5px;
        right: 5px;
    }
    
    .delete-btn {
        position: absolute;
        top: -10px;
        right: -10px;
        background-color: red;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        text-align: center;
        font-size: 14px;
        line-height: 20px;
        cursor: pointer;
        display: none;
    }
    
    /* 版权信息样式 */
    #copyright {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40px;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    }
    
    #copyright p {
        margin: 0;
    }
    
    #copyright a {
        color: #007bff;
        text-decoration: none;
    }
    
    #copyright a:hover {
        text-decoration: underline;
    }
    
    /* 响应式设计 */
    @media (max-width: 480px) {
        .fixed-elements {
            position: relative;
            padding: 5px;
        }
        .content {
            margin-top: 10px;
        }

        .admin-controls input,
        .admin-controls button {
            height: 30%;
        }

        .card-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .card {
            width: 80%;
            max-width: 100%;
            padding: 5px;
        }
        .card-title {
            font-size: 12px;
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 130px; 
        }
        .card-url {
            font-size: 10px;
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 130px;
        }
        
        .add-remove-controls {
            right: 2px;
          }

        .round-btn, 
        #theme-toggle {
            right: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            font-size: 24px;
        }
    }
    </style>
</head>

<body>
    <div class="fixed-elements">
        <h3>我的导航</h3>
        <div class="center-content">
            <!-- 一言模块 -->
            <p id="hitokoto">
                <a href="#" id="hitokoto_text"></a>
            </p>
            <script src="https://v1.hitokoto.cn/?encode=js&select=%23hitokoto" defer></script>
            <!-- 搜索栏 -->
            <div class="search-container">
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="">
                    <button id="search-button">🔍</button>
                </div>
                <div class="search-engines">
                    <button class="search-engine" data-engine="baidu">百度</button>
                    <button class="search-engine" data-engine="bing">必应</button>
                    <button class="search-engine" data-engine="google">谷歌</button>
                </div>
            </div>
        </div>
        <!-- 管理员控制面板 -->
        <div class="admin-controls">
            <input type="password" id="admin-password" placeholder="输入密码">
            <button id="admin-mode-btn" onclick="toggleAdminMode()">设  置</button>
            <button id="secret-garden-btn" onclick="toggleSecretGarden()">登  录</button>
        </div>
    </div>
    <div class="content">
        <!-- 添加/删除控制按钮 -->
        <div class="add-remove-controls">
            <button class="round-btn add-btn" onclick="showAddDialog()">+</button>
            <button class="round-btn remove-btn" onclick="toggleRemoveMode()">-</button>
            <button class="round-btn category-btn" onclick="addCategory()">C+</button>
            <button class="round-btn remove-category-btn" onclick="toggleRemoveCategory()">C-</button>

        </div>

        <!-- 分类和卡片容器 -->
        <div id="sections-container"></div>
        <!-- 主题切换按钮 -->
        <button id="theme-toggle" onclick="toggleTheme()">◑</button>
        <!-- 显示日志按钮 用于调试-->
        <!--<button id="view-logs-btn" onclick="viewLogs()">显示日志</button>-->
        <!-- 添加链接对话框 -->
        <div id="dialog-overlay">
            <div id="dialog-box">
                <label for="name-input">名称</label>
                <input type="text" id="name-input">
                <label for="url-input">地址</label>
                <input type="text" id="url-input">
                <label for="category-select">选择分类</label>
                <select id="category-select"></select>
                <div class="private-link-container">
                    <label for="private-checkbox">私密链接</label>    
                    <input type="checkbox" id="private-checkbox">
                </div>
                <button onclick="addLink()">确定</button>
                <button onclick="hideAddDialog()">取消</button>
            </div>
        </div>
        <!-- 版权信息 -->
        <div id="copyright" class="copyright">
            <!--请不要删除-->
            <p>项目地址：<a href="https://github.com/hmhm2022/Card-Tab" target="_blank">GitHub</a> 如果喜欢，烦请点个star！</p>
        </div>
    </div>

    <script>
    // 搜索引擎配置
    const searchEngines = {
        baidu: "https://www.baidu.com/s?wd=",
        bing: "https://www.bing.com/search?q=",
        google: "https://www.google.com/search?q="
    };
    
    let currentEngine = "baidu";
    
    // 日志记录函数
    function logAction(action, details) {
        const timestamp = new Date().toISOString();
        const logEntry = timestamp + ': ' + action + ' - ' + JSON.stringify(details);
        
        let logs = JSON.parse(localStorage.getItem('cardTabLogs') || '[]');
        logs.push(logEntry);
        
        // 保留最新的1000条日志
        if (logs.length > 1000) {
            logs = logs.slice(-1000);
        }
        
        localStorage.setItem('cardTabLogs', JSON.stringify(logs));
        console.log(logEntry); // 同时在控制台输出日志
    }
    
    // 查看日志的函数
    function viewLogs() {
        const logs = JSON.parse(localStorage.getItem('cardTabLogs') || '[]');
        console.log('Card Tab Logs:');
        logs.forEach(log => console.log(log));
        alert('日志已在控制台输出，请按F12打开开发者工具查看。');
    }
    
    // 设置当前搜索引擎
    function setActiveEngine(engine) {
        currentEngine = engine;
        document.querySelectorAll('.search-engine').forEach(btn => {
            btn.style.backgroundColor = btn.dataset.engine === engine ? '#c0c0c0' : '#f0f0f0';
        });
        logAction('设置搜索引擎', { engine });
    }
    
    // 搜索引擎按钮点击事件
    document.querySelectorAll('.search-engine').forEach(button => {
        button.addEventListener('click', () => setActiveEngine(button.dataset.engine));
    });
    
    // 搜索按钮点击事件
    document.getElementById('search-button').addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        if (query) {
            logAction('执行搜索', { engine: currentEngine, query });
            window.open(searchEngines[currentEngine] + encodeURIComponent(query), '_blank');
        }
    });
    
    // 搜索输入框回车事件
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('search-button').click();
        }
    });
    
    // 初始化搜索引擎
    setActiveEngine(currentEngine);
    
    // 全局变量
    let publicLinks = [];
    let privateLinks = [];
    let isAdmin = false;
    let isLoggedIn = false;
    let removeMode = false;
    let isRemoveCategoryMode = false;
    let isDarkTheme = false;
    let links = [];
    const categories = {};
    
    // 添加新分类
    function addCategory() {
        const categoryName = prompt('请输入新分类名称:');
        if (categoryName && !categories[categoryName]) {
            categories[categoryName] = [];
            updateCategorySelect();
            renderCategories();
            saveLinks();
            logAction('添加分类', { categoryName, currentLinkCount: links.length });
        } else if (categories[categoryName]) {
            alert('该分类已存在');
            logAction('添加分类失败', { categoryName, reason: '分类已存在' });
        }
    }

    // 删除分类
    function deleteCategory(category) {
        if (confirm('确定要删除 "' + category + '" 分类吗？这将删除该分类下的所有链接。')) {
            delete categories[category];
            links = links.filter(link => link.category !== category);
            publicLinks = publicLinks.filter(link => link.category !== category);
            privateLinks = privateLinks.filter(link => link.category !== category);
            updateCategorySelect();
            saveLinks();
            renderCategories();
            logAction('删除分类', { category });
        }
    }    

    // 渲染分类(不重新加载链接)
    function renderCategories() {
        const container = document.getElementById('sections-container');
        container.innerHTML = '';
    
        Object.keys(categories).forEach(category => {
            const section = document.createElement('div');
            section.className = 'section';
    
            const titleContainer = document.createElement('div');
            titleContainer.className = 'section-title-container';
    
            const title = document.createElement('div');
            title.className = 'section-title';
            title.textContent = category;
    
            titleContainer.appendChild(title);
    
            if (isAdmin) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '删除分类';
                deleteBtn.className = 'delete-category-btn';
                deleteBtn.style.display = isRemoveCategoryMode ? 'inline-block' : 'none'; 
                deleteBtn.onclick = () => deleteCategory(category);
                titleContainer.appendChild(deleteBtn);
            }
    
            const cardContainer = document.createElement('div');
            cardContainer.className = 'card-container';
            cardContainer.id = category;
    
            section.appendChild(titleContainer);
            section.appendChild(cardContainer);
    
            container.appendChild(section);
    
            const categoryLinks = links.filter(link => link.category === category);
            categoryLinks.forEach(link => {
                createCard(link, cardContainer);
            });
        });
    
        logAction('渲染分类', { categoryCount: Object.keys(categories).length, linkCount: links.length });
    }    
    
    // 读取链接数据
    async function loadLinks() {
        const response = await fetch('/api/getLinks?userId=testUser');
        const data = await response.json();
        if (data.categories) {
            Object.assign(categories, data.categories);
        }
        
        publicLinks = data.links ? data.links.filter(link => !link.isPrivate) : [];
        privateLinks = data.links ? data.links.filter(link => link.isPrivate) : [];
        links = isLoggedIn ? [...publicLinks, ...privateLinks] : publicLinks;
    
        loadSections();
        updateCategorySelect();
        updateUIState();
        logAction('读取链接', { publicCount: publicLinks.length, privateCount: privateLinks.length });
    }
    
    
    // 更新UI状态
    function updateUIState() {
        const passwordInput = document.getElementById('admin-password');
        const adminBtn = document.getElementById('admin-mode-btn');
        const secretGardenBtn = document.getElementById('secret-garden-btn');
        const addRemoveControls = document.querySelector('.add-remove-controls');
    
        passwordInput.style.display = isLoggedIn ? 'none' : 'inline-block';
        secretGardenBtn.textContent = isLoggedIn ? "退出" : "登录";
        secretGardenBtn.style.display = 'inline-block';
    
        if (isAdmin) {
            adminBtn.textContent = "离开设置";
            adminBtn.style.display = 'inline-block';
            addRemoveControls.style.display = 'flex';
        } else if (isLoggedIn) {
            adminBtn.textContent = "设置";
            adminBtn.style.display = 'inline-block';
            addRemoveControls.style.display = 'none';
        } else {
            adminBtn.style.display = 'none';
            addRemoveControls.style.display = 'none';
        }
    
        logAction('更新UI状态', { isAdmin, isLoggedIn });
    }
    
    // 登录状态显示（加载所有链接）
    function showSecretGarden() {
        if (isLoggedIn) {
            links = [...publicLinks, ...privateLinks];
            loadSections();
            // 显示所有私密标签
            document.querySelectorAll('.private-tag').forEach(tag => {
                tag.style.display = 'block';
            });
            logAction('显示私密花园');
        }
    }
    
    // 加载分类和链接
    function loadSections() {
        const container = document.getElementById('sections-container');
        container.innerHTML = '';
    
        Object.keys(categories).forEach(category => {
            const section = document.createElement('div');
            section.className = 'section';
    
            const titleContainer = document.createElement('div');
            titleContainer.className = 'section-title-container';
    
            const title = document.createElement('div');
            title.className = 'section-title';
            title.textContent = category;
    
            titleContainer.appendChild(title);
    
            if (isAdmin) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '删除分类';
                deleteBtn.className = 'delete-category-btn';
                deleteBtn.style.display = 'none'; 
                deleteBtn.onclick = () => deleteCategory(category);
                titleContainer.appendChild(deleteBtn);
            }
    
            const cardContainer = document.createElement('div');
            cardContainer.className = 'card-container';
            cardContainer.id = category;
    
            section.appendChild(titleContainer);
            section.appendChild(cardContainer);
    
            let privateCount = 0;
            let linkCount = 0;
    
            links.forEach(link => {
                if (link.category === category) {
                    if (link.isPrivate) privateCount++;
                    linkCount++;
                    createCard(link, cardContainer);
                }
            });
    
            if (privateCount < linkCount || isLoggedIn) {
                container.appendChild(section);
            }
        });
    
        logAction('加载分类和链接', { isAdmin: isAdmin, linkCount: links.length, categoryCount: Object.keys(categories).length });
    }
    
    // 创建卡片
    function createCard(link, container) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('draggable', isAdmin);
        card.dataset.isPrivate = link.isPrivate;
    
        const cardTop = document.createElement('div');
        cardTop.className = 'card-top';
    
        // const icon = document.createElement('img');
        // icon.className = 'card-icon';
        // icon.src = 'https://favicon.zhusl.com/ico?url=' + link.url;
        // icon.alt = 'Website Icon';
        // 定义默认的 SVG 图标
        const defaultIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>' +
        '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>' +
        '</svg>';
        
        // 创建图标元素
        const icon = document.createElement('img');
        icon.className = 'card-icon';
        // icon.src = 'https://api.iowen.cn/favicon/' + extractDomain(link.url) + '.png';
        icon.src = 'https://www.faviconextractor.com/favicon/' + extractDomain(link.url);
        icon.alt = 'Website Icon';
        
        // 错误处理：如果图片加载失败，使用默认的 SVG 图标
        icon.onerror = function() {
            const svgBlob = new Blob([defaultIconSVG], {type: 'image/svg+xml'});
            const svgUrl = URL.createObjectURL(svgBlob);
            this.src = svgUrl;
            
            // 清理：当图片不再需要时，撤销对象 URL
            this.onload = () => URL.revokeObjectURL(svgUrl);
        };
        
        // 辅助函数：从 URL 中提取域名
        function extractDomain(url) {
            let domain;
            try {
                domain = new URL(url).hostname;
            } catch (e) {
                // 如果 URL 无效，返回原始输入
                domain = url;
            }
            return domain;
        }
    
        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = link.name;
    
        cardTop.appendChild(icon);
        cardTop.appendChild(title);
    
        const url = document.createElement('div');
        url.className = 'card-url';
        url.textContent = link.url;
    
        card.appendChild(cardTop);
        card.appendChild(url);
    
        if (link.isPrivate) {
            const privateTag = document.createElement('div');
            privateTag.className = 'private-tag';
            privateTag.textContent = '私密';
            card.appendChild(privateTag);
        }
    
        const correctedUrl = link.url.startsWith('http://') || link.url.startsWith('https://') ? link.url : 'http://' + link.url;
    
        if (!isAdmin) {
            card.addEventListener('click', () => {
                window.open(correctedUrl, '_blank');
                logAction('打开链接', { name: link.name, url: correctedUrl });
            });
        }
    
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '–';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function (event) {
            event.stopPropagation();
            removeCard(card);
        };
        card.appendChild(deleteBtn);
    
        updateCardStyle(card);
    
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragover', dragOver);
        card.addEventListener('dragend', dragEnd);
        card.addEventListener('drop', drop);
        card.addEventListener('touchstart', touchStart, { passive: false });
    
        if (isAdmin && removeMode) {
            deleteBtn.style.display = 'block';
        }
    
        if (isAdmin || (link.isPrivate && isLoggedIn) || !link.isPrivate) {
            container.appendChild(card);
        }
        // logAction('创建卡片', { name: link.name, isPrivate: link.isPrivate });
    }
    
    // 更新卡片样式
    function updateCardStyle(card) {
        if (isDarkTheme) {
            card.style.backgroundColor = '#1e1e1e';
            card.style.color = '#ffffff';
            card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
        } else {
            card.style.backgroundColor = '#a0c9e5';
            card.style.color = '#333';
            card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        }
    }
    
    // 更新分类选择下拉框
    function updateCategorySelect() {
        const categorySelect = document.getElementById('category-select');
        categorySelect.innerHTML = '';
    
        Object.keys(categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    
        logAction('更新分类选择', { categoryCount: Object.keys(categories).length });
    }
    
    // 保存链接数据
    async function saveLinks() {
        let allLinks = [...publicLinks, ...privateLinks];
    
        try {
            await fetch('/api/saveOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: 'testUser', 
                    links: allLinks,
                    categories: categories
                }),
            });
            logAction('保存链接', { linkCount: allLinks.length, categoryCount: Object.keys(categories).length });
        } catch (error) {
            console.error('Error saving links:', error);
            logAction('保存链接失败', { error: error.message });
            alert('保存链接失败，请重试');
        }
    }
    
    // 添加卡片弹窗
    function addLink() {
        const name = document.getElementById('name-input').value;
        const url = document.getElementById('url-input').value;
        const category = document.getElementById('category-select').value;
        const isPrivate = document.getElementById('private-checkbox').checked;
    
        if (name && url && category) {
            const newLink = { name, url, category, isPrivate };
    
            if (isPrivate) {
                privateLinks.push(newLink);
            } else {
                publicLinks.push(newLink);
            }
    
            links = isLoggedIn ? [...publicLinks, ...privateLinks] : publicLinks;
    
            if (isAdmin || (isPrivate && isLoggedIn) || !isPrivate) {
                const container = document.getElementById(category);
                if (container) {
                    createCard(newLink, container);
                } else {
                    categories[category] = [];
                    renderCategories();
                }
            }
    
            saveLinks();
    
            document.getElementById('name-input').value = '';
            document.getElementById('url-input').value = '';
            document.getElementById('private-checkbox').checked = false;
            hideAddDialog();

            logAction('添加卡片', { name, url, category, isPrivate });
        }
    }

    // 删除卡片
    function removeCard(card) {
        const name = card.querySelector('.card-title').textContent;
        const url = card.querySelector('.card-url').textContent;
        const isPrivate = card.dataset.isPrivate === 'true';
        
        links = links.filter(link => link.url !== url);
        if (isPrivate) {
            privateLinks = privateLinks.filter(link => link.url !== url);
        } else {
            publicLinks = publicLinks.filter(link => link.url !== url);
        }
    
        for (const key in categories) {
            categories[key] = categories[key].filter(link => link.url !== url);
        }
    
        card.remove();
    
        saveLinks();
    
        logAction('删除卡片', { name, url, isPrivate });
    }
    
    // 拖拽卡片
    let draggedCard = null;
    let touchStartX, touchStartY;
    
    // 触屏端拖拽卡片
    function touchStart(event) {
        if (!isAdmin) return;
        draggedCard = event.target.closest('.card');
        if (!draggedCard) return;
    
        event.preventDefault();
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    
        draggedCard.classList.add('dragging');
        
        document.addEventListener('touchmove', touchMove, { passive: false });
        document.addEventListener('touchend', touchEnd);
    
    }
    
    function touchMove(event) {
        if (!draggedCard) return;
        event.preventDefault();
    
        const touch = event.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;
        draggedCard.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
    
        const target = findCardUnderTouch(currentX, currentY);
        if (target && target !== draggedCard) {
            const container = target.parentElement;
            const targetRect = target.getBoundingClientRect();
    
            if (currentX < targetRect.left + targetRect.width / 2) {
                container.insertBefore(draggedCard, target);
            } else {
                container.insertBefore(draggedCard, target.nextSibling);
            }
        }
    }
    
    function touchEnd(event) {
        if (!draggedCard) return;
    
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);
    
        draggedCard.classList.remove('dragging');
        draggedCard.style.transform = '';
    
        const targetCategory = draggedCard.closest('.card-container').id;
        updateCardCategory(draggedCard, targetCategory);
        saveCardOrder();
    
        draggedCard = null;
    }
    
    function findCardUnderTouch(x, y) {
        const cards = document.querySelectorAll('.card:not(.dragging)');
        return Array.from(cards).find(card => {
            const rect = card.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        });
    }

    // PC端拖拽卡片
    function dragStart(event) {
        if (!isAdmin) return;
        draggedCard = event.target.closest('.card');
        if (!draggedCard) return;
    
        draggedCard.classList.add('dragging');
        event.dataTransfer.effectAllowed = "move";
        logAction('开始拖拽卡片', { name: draggedCard.querySelector('.card-title').textContent });
    }
    
    function dragOver(event) {
        if (!isAdmin || !draggedCard) return;
        event.preventDefault();
        const target = event.target.closest('.card');
        if (target && target !== draggedCard) {
            const container = target.parentElement;
            const mousePositionX = event.clientX;
            const targetRect = target.getBoundingClientRect();
    
            if (mousePositionX < targetRect.left + targetRect.width / 2) {
                container.insertBefore(draggedCard, target);
            } else {
                container.insertBefore(draggedCard, target.nextSibling);
            }
        }
    }
    
    function drop(event) {
        if (!isAdmin || !draggedCard) return;
        event.preventDefault();
        draggedCard.classList.remove('dragging');
        const targetCategory = event.target.closest('.card-container').id;
        updateCardCategory(draggedCard, targetCategory);
        logAction('放下卡片', { name: draggedCard.querySelector('.card-title').textContent, category: targetCategory });
        draggedCard = null;
        saveCardOrder();
    }
    
    function dragEnd(event) {
        if (draggedCard) {
            draggedCard.classList.remove('dragging');
            logAction('拖拽卡片结束');
            draggedCard = null;
        }
    }
  
    // 更新卡片分类
    function updateCardCategory(card, newCategory) {
        const cardTitle = card.querySelector('.card-title').textContent;
        const cardUrl = card.querySelector('.card-url').textContent;
        const isPrivate = card.dataset.isPrivate === 'true';
    
        const linkIndex = links.findIndex(link => link.url === cardUrl);
        if (linkIndex !== -1) {
            links[linkIndex].category = newCategory;
        }
    
        const linkArray = isPrivate ? privateLinks : publicLinks;
        const arrayIndex = linkArray.findIndex(link => link.url === cardUrl);
        if (arrayIndex !== -1) {
            linkArray[arrayIndex].category = newCategory;
        }
    
        card.dataset.category = newCategory;
    }

    // 在页面加载完成后添加触摸事件监听器
    document.addEventListener('DOMContentLoaded', function() {
        const cardContainers = document.querySelectorAll('.card-container');
        cardContainers.forEach(container => {
            container.addEventListener('touchstart', touchStart, { passive: false });
        });
    });    
    
    // 保存卡片顺序
    async function saveCardOrder() {
        if (!isAdmin) return;
        const containers = document.querySelectorAll('.card-container');
        let newPublicLinks = [];
        let newPrivateLinks = [];
        let newCategories = {};
    
        containers.forEach(container => {
            const category = container.id;
            newCategories[category] = [];
    
            [...container.children].forEach(card => {
                const url = card.querySelector('.card-url').textContent;
                const name = card.querySelector('.card-title').textContent;
                const isPrivate = card.dataset.isPrivate === 'true';
                card.dataset.category = category;
                const link = { name, url, category, isPrivate };
                if (isPrivate) {
                    newPrivateLinks.push(link);
                } else {
                    newPublicLinks.push(link);
                }
                newCategories[category].push(link); 
            });
        });
    
        publicLinks.length = 0;
        publicLinks.push(...newPublicLinks);
        privateLinks.length = 0;
        privateLinks.push(...newPrivateLinks);
        Object.keys(categories).forEach(key => delete categories[key]);
        Object.assign(categories, newCategories);
    
        logAction('保存卡片顺序', { 
            publicCount: newPublicLinks.length, 
            privateCount: newPrivateLinks.length, 
            categoryCount: Object.keys(newCategories).length 
        });
    
        try {
            const response = await fetch('/api/saveOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: 'testUser', 
                    links: [...newPublicLinks, ...newPrivateLinks],
                    categories: newCategories
                }),
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error('Failed to save order');
            }
            logAction('保存卡片顺序', { publicCount: newPublicLinks.length, privateCount: newPrivateLinks.length, categoryCount: Object.keys(newCategories).length });
        } catch (error) {
            console.error('Error saving order:', error);
            logAction('保存顺序失败', { error: error.message });
            alert('保存顺序失败，请重试');
        }
    }             
    
    // 设置状态重新加载卡片
    function reloadCardsAsAdmin() {
        document.querySelectorAll('.card-container').forEach(container => {
            container.innerHTML = '';
        });
        loadLinks().then(() => {
            if (isDarkTheme) {
                applyDarkTheme();
            }
        });
        logAction('重新加载卡片（管理员模式）');
    }
    
    // 密码输入框回车事件
    document.getElementById('admin-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            toggleSecretGarden();
        }
    });
    
    // 切换设置状态
    function toggleAdminMode() {
        const adminBtn = document.getElementById('admin-mode-btn');
        const addRemoveControls = document.querySelector('.add-remove-controls');
    
        if (!isAdmin && isLoggedIn) {
            isAdmin = true;
            adminBtn.textContent = "退出设置";
            addRemoveControls.style.display = 'flex';
            alert('准备设置分类和书签');
            reloadCardsAsAdmin();
            logAction('进入设置');
        } else if (isAdmin) {
            isAdmin = false;
            removeMode = false;
            adminBtn.textContent = "设  置";
            addRemoveControls.style.display = 'none';
            alert('设置已保存');
            reloadCardsAsAdmin();
            logAction('离开设置');
        }
    
        updateUIState();
    }      
    
    // 切换到登录状态
    function toggleSecretGarden() {
        const passwordInput = document.getElementById('admin-password');
        if (!isLoggedIn) {
            verifyPassword(passwordInput.value).then(isValid => {
                if (isValid) {
                    isLoggedIn = true;
                    links = [...publicLinks, ...privateLinks];
                    loadSections();
                    alert('登录成功！');
                    logAction('登录成功');
                } else {
                    alert('密码错误');
                    logAction('登录失败', { reason: '密码错误' });
                }
                updateUIState();
            });
        } else {
            isLoggedIn = false;
            isAdmin = false;
            links = publicLinks;
            loadSections();
            alert('退出登录！');
            updateUIState();
            passwordInput.value = '';
            logAction('退出登录');
        }
    }
    
    // 应用暗色主题
    function applyDarkTheme() {
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#ffffff';
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = '#1e1e1e';
            card.style.color = '#ffffff';
            card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
        });
        logAction('应用暗色主题');
    }
    
    // 显示添加链接对话框
    function showAddDialog() {
        document.getElementById('dialog-overlay').style.display = 'flex';
        logAction('显示添加链接对话框');
    }
    
    // 隐藏添加链接对话框
    function hideAddDialog() {
        document.getElementById('dialog-overlay').style.display = 'none';
        logAction('隐藏添加链接对话框');
    }
    
    // 切换删除卡片模式
    function toggleRemoveMode() {
        removeMode = !removeMode;
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.style.display = removeMode ? 'block' : 'none';
        });
        logAction('切换删除卡片模式', { removeMode });
    }
    
    //切换删除分类模式
    function toggleRemoveCategory() {
        isRemoveCategoryMode = !isRemoveCategoryMode;
        const deleteButtons = document.querySelectorAll('.delete-category-btn');
        deleteButtons.forEach(btn => {
            btn.style.display = isRemoveCategoryMode ? 'inline-block' : 'none';
        });
        logAction('切换删除分类模式', { isRemoveCategoryMode });
    }
    
    // 切换主题
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
    
        document.body.style.backgroundColor = isDarkTheme ? '#121212' : '#d8eac4';
        document.body.style.color = isDarkTheme ? '#ffffff' : '#333';
    
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = isDarkTheme ? '#1e1e1e' : '#a0c9e5';
            card.style.color = isDarkTheme ? '#ffffff' : '#333';
            card.style.boxShadow = isDarkTheme
                ? '0 4px 8px rgba(0, 0, 0, 0.5)'
                : '0 4px 8px rgba(0, 0, 0, 0.1)';
        });
    
        const fixedElements = document.querySelectorAll('.fixed-elements');
        fixedElements.forEach(element => {
            element.style.backgroundColor = isDarkTheme ? '#121212' : '#d8eac4';
            element.style.color = isDarkTheme ? '#ffffff' : '#333';
        });
    
        const dialogBox = document.getElementById('dialog-box');
        dialogBox.style.backgroundColor = isDarkTheme ? '#1e1e1e' : '#ffffff';
        dialogBox.style.color = isDarkTheme ? '#ffffff' : '#333';
    
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"], select');
        inputs.forEach(input => {
            input.style.backgroundColor = isDarkTheme ? '#444' : '#fff';
            input.style.color = isDarkTheme ? '#fff' : '#333';
            input.style.borderColor = isDarkTheme ? '#555' : '#ccc';
        });
        
        logAction('切换主题', { isDarkTheme });
    }
    
    // 验证密码
    async function verifyPassword(inputPassword) {
        const response = await fetch('/api/verifyPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: inputPassword }),
        });
        const result = await response.json();
        return result.valid;
    }
    
    // 初始化加载链接
    loadLinks();

    </script>
</body>

</html>
`;

export default {
async fetch(request, env) {
const url = new URL(request.url);

if (url.pathname === '/') {
return new Response(HTML_CONTENT, {
headers: { 'Content-Type': 'text/html' }
});
}

if (url.pathname === '/api/getLinks') {
const userId = url.searchParams.get('userId');
const links = await env.CARD_ORDER.get(userId); 
return new Response(links || JSON.stringify([]), { status: 200 });
}

if (url.pathname === '/api/saveOrder' && request.method === 'POST') {
    const { userId, links, categories } = await request.json(); 
    await env.CARD_ORDER.put(userId, JSON.stringify({ links, categories })); //保存链接和分类
    return new Response(JSON.stringify({ success: true }), { status: 200 });
}

if (url.pathname === '/api/verifyPassword' && request.method === 'POST') { 
const { password } = await request.json();
const isValid = password === env.ADMIN_PASSWORD; // 从环境变量中获取密码
return new Response(JSON.stringify({ valid: isValid }), {
status: isValid ? 200 : 403,
headers: { 'Content-Type': 'application/json' },
});
}

return new Response('Not Found', { status: 404 });
}
};
