/**
 * Card-Tab Manager - Popup 主逻辑
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化服务
    const storageService = new StorageService();
    const apiService = new ApiService(storageService);
    const bookmarkService = new BookmarkService();
    const exportService = new ExportService();

    // DOM 元素
    const elements = {
        // 主要区域
        configPrompt: document.getElementById('configPrompt'),
        mainContent: document.getElementById('mainContent'),
        statusMessage: document.getElementById('statusMessage'),

        // 页面信息
        pageTitle: document.getElementById('pageTitle'),
        pageUrl: document.getElementById('pageUrl'),
        statusBadge: document.getElementById('statusBadge'),
        categorySelect: document.getElementById('categorySelect'),

        // 操作按钮
        addBtn: document.getElementById('addBtn'),
        deleteBtn: document.getElementById('deleteBtn'),
        saveCategoryBtn: document.getElementById('saveCategoryBtn'),
        importBtn: document.getElementById('importBtn'),
        exportBtn: document.getElementById('exportBtn'),

        // 登录/设置
        loginBtn: document.getElementById('loginBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        goSettingsBtn: document.getElementById('goSettingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeSettingsBtn: document.getElementById('closeSettingsBtn'),
        apiUrlInput: document.getElementById('apiUrlInput'),
        passwordInput: document.getElementById('passwordInput'),
        tokenExpirySelect: document.getElementById('tokenExpirySelect'),
        settingsMessage: document.getElementById('settingsMessage'),
        testConnBtn: document.getElementById('testConnBtn'),
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),

        // 添加书签模态框
        addBookmarkModal: document.getElementById('addBookmarkModal'),
        closeAddBtn: document.getElementById('closeAddBtn'),
        bookmarkName: document.getElementById('bookmarkName'),
        bookmarkUrl: document.getElementById('bookmarkUrl'),
        bookmarkTips: document.getElementById('bookmarkTips'),
        bookmarkCategory: document.getElementById('bookmarkCategory'),
        bookmarkPrivate: document.getElementById('bookmarkPrivate'),
        cancelAddBtn: document.getElementById('cancelAddBtn'),
        confirmAddBtn: document.getElementById('confirmAddBtn')
    };

    // 当前页面信息
    let currentTab = null;
    let currentBookmark = null;
    let originalCategory = null;
    let categories = [];

    // 初始化
    await init();

    /**
     * 初始化
     */
    async function init() {
        // 绑定事件
        bindEvents();

        // 更新登录状态显示
        await updateLoginStatus();

        // 检查配置
        const isConfigured = await storageService.isConfigured();
        if (!isConfigured) {
            showConfigPrompt();
            return;
        }

        // 显示主内容
        showMainContent();

        // 获取当前标签页信息
        await loadCurrentTab();

        // 检查当前页面状态
        await checkCurrentPageStatus();
    }

    /**
     * 更新登录状态显示
     */
    async function updateLoginStatus() {
        const isLoggedIn = await storageService.isLoggedIn();
        const loginBtn = elements.loginBtn;
        const logoutBtn = elements.logoutBtn;

        if (isLoggedIn) {
            loginBtn.classList.remove('logged-out');
            loginBtn.classList.add('logged-in');
            loginBtn.title = '已登录 - 点击打开设置';
            logoutBtn.style.display = 'inline-block';
        } else {
            loginBtn.classList.remove('logged-in');
            loginBtn.classList.add('logged-out');
            loginBtn.title = '未登录 - 点击登录';
            logoutBtn.style.display = 'none';
        }
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        // 登录/设置按钮
        elements.loginBtn.addEventListener('click', openSettings);
        elements.logoutBtn.addEventListener('click', logout);
        elements.goSettingsBtn.addEventListener('click', openSettings);
        elements.closeSettingsBtn.addEventListener('click', closeSettings);
        elements.testConnBtn.addEventListener('click', testConnection);
        elements.saveSettingsBtn.addEventListener('click', saveSettings);

        // 密码输入框回车触发登录
        elements.passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveSettings();
            }
        });

        // 操作按钮
        elements.addBtn.addEventListener('click', openAddBookmarkModal);
        elements.deleteBtn.addEventListener('click', deleteBookmark);
        elements.saveCategoryBtn.addEventListener('click', saveCategory);

        // 批量操作
        elements.importBtn.addEventListener('click', importBookmarks);
        elements.exportBtn.addEventListener('click', exportBookmarks);

        // 添加书签模态框
        elements.closeAddBtn.addEventListener('click', closeAddBookmarkModal);
        elements.cancelAddBtn.addEventListener('click', closeAddBookmarkModal);
        elements.confirmAddBtn.addEventListener('click', confirmAddBookmark);

        // 分类变更检测
        elements.categorySelect.addEventListener('change', onCategoryChange);

        // 点击模态框外部关闭
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) closeSettings();
        });
        elements.addBookmarkModal.addEventListener('click', (e) => {
            if (e.target === elements.addBookmarkModal) closeAddBookmarkModal();
        });
    }

    /**
     * 显示配置提示
     */
    function showConfigPrompt() {
        elements.configPrompt.style.display = 'block';
        elements.mainContent.style.display = 'none';
    }

    /**
     * 显示主内容
     */
    function showMainContent() {
        elements.configPrompt.style.display = 'none';
        elements.mainContent.style.display = 'block';
    }

    /**
     * 获取当前标签页
     */
    async function loadCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            currentTab = tab;
            elements.pageTitle.textContent = tab.title || '无标题';
            elements.pageUrl.textContent = tab.url || '';
        } catch (error) {
            elements.pageTitle.textContent = '无法获取页面信息';
            elements.pageUrl.textContent = '';
        }
    }

    /**
     * 检查当前页面状态
     */
    async function checkCurrentPageStatus() {
        if (!currentTab || !currentTab.url) {
            updateStatus('error', '无效页面');
            return;
        }

        // 忽略特殊页面
        if (currentTab.url.startsWith('chrome://') ||
            currentTab.url.startsWith('chrome-extension://') ||
            currentTab.url.startsWith('about:')) {
            updateStatus('error', '不支持的页面');
            return;
        }

        updateStatus('checking', '检测中...');

        // 获取书签数据
        const result = await apiService.findBookmark(currentTab.url);

        if (!result.success) {
            showMessage(result.error, 'error');
            updateStatus('error', '获取失败');
            return;
        }

        // 更新分类下拉框
        categories = Object.keys(result.categories || {});
        if (categories.length === 0) {
            categories = ['常用网站'];
        }
        updateCategorySelect(categories);

        if (result.bookmark) {
            // 已添加
            currentBookmark = result.bookmark;
            originalCategory = result.bookmark.category;
            updateStatus('added', '已添加');
            elements.categorySelect.value = result.bookmark.category;

            // 显示删除和保存分类按钮
            elements.addBtn.style.display = 'none';
            elements.deleteBtn.style.display = 'inline-flex';
            elements.saveCategoryBtn.style.display = 'none';
        } else {
            // 未添加
            currentBookmark = null;
            originalCategory = null;
            updateStatus('not-added', '未添加');

            // 显示添加按钮
            elements.addBtn.style.display = 'inline-flex';
            elements.deleteBtn.style.display = 'none';
            elements.saveCategoryBtn.style.display = 'none';
        }
    }

    /**
     * 更新状态徽章
     */
    function updateStatus(type, text) {
        elements.statusBadge.textContent = text;
        elements.statusBadge.className = 'status-badge ' + type;
    }

    /**
     * 更新分类下拉框
     */
    function updateCategorySelect(cats, selectedValue = '') {
        const select = elements.categorySelect;
        select.innerHTML = '';
        cats.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
        if (selectedValue) {
            select.value = selectedValue;
        }
    }

    /**
     * 分类变更事件
     */
    function onCategoryChange() {
        if (currentBookmark && elements.categorySelect.value !== originalCategory) {
            elements.saveCategoryBtn.style.display = 'inline-flex';
        } else {
            elements.saveCategoryBtn.style.display = 'none';
        }
    }

    /**
     * 打开设置模态框
     */
    async function openSettings() {
        const apiUrl = await storageService.getApiUrl();
        elements.apiUrlInput.value = apiUrl || '';
        elements.passwordInput.value = '';

        // 加载有效期设置
        const expirySetting = await storageService.getExpirySetting();
        elements.tokenExpirySelect.value = expirySetting.toString();

        // 清除之前的消息
        elements.settingsMessage.style.display = 'none';

        elements.settingsModal.style.display = 'flex';
    }

    /**
     * 关闭设置模态框
     */
    function closeSettings() {
        elements.settingsModal.style.display = 'none';
    }

    /**
     * 退出登录
     */
    async function logout() {
        await storageService.clearAuthToken();
        await updateLoginStatus();
        showMessage('已退出登录', 'info');
    }

    /**
     * 测试连接
     */
    async function testConnection() {
        const apiUrl = elements.apiUrlInput.value.trim();
        const password = elements.passwordInput.value;

        if (!apiUrl) {
            showSettingsMessage('请输入 API 地址', 'error');
            return;
        }

        if (!password) {
            showSettingsMessage('请输入密码', 'error');
            return;
        }

        elements.testConnBtn.disabled = true;
        elements.testConnBtn.textContent = '测试中...';

        try {
            // 临时保存 API 地址
            await storageService.saveApiUrl(apiUrl);

            // 尝试登录
            const result = await apiService.login(password);

            if (result.success) {
                showSettingsMessage('连接成功！', 'success');
            } else {
                showSettingsMessage(result.error, 'error');
            }
        } catch (error) {
            showSettingsMessage('连接失败：' + error.message, 'error');
        } finally {
            elements.testConnBtn.disabled = false;
            elements.testConnBtn.textContent = '测试连接';
        }
    }

    /**
     * 保存设置并登录
     */
    async function saveSettings() {
        const apiUrl = elements.apiUrlInput.value.trim();
        const password = elements.passwordInput.value;
        const expiryMinutes = parseInt(elements.tokenExpirySelect.value, 10);

        if (!apiUrl) {
            showSettingsMessage('请输入 API 地址', 'error');
            return;
        }

        if (!password) {
            showSettingsMessage('请输入密码', 'error');
            return;
        }

        elements.saveSettingsBtn.disabled = true;
        elements.saveSettingsBtn.textContent = '保存中...';

        try {
            // 保存 API 地址
            await storageService.saveApiUrl(apiUrl);

            // 保存有效期设置
            await storageService.saveExpirySetting(expiryMinutes);

            // 尝试登录
            const result = await apiService.login(password);

            if (result.success) {
                showMessage('登录成功！', 'success');
                await updateLoginStatus();
                closeSettings();
                showMainContent();
                await loadCurrentTab();
                await checkCurrentPageStatus();
            } else {
                showSettingsMessage(result.error, 'error');
            }
        } catch (error) {
            showSettingsMessage('保存失败：' + error.message, 'error');
        } finally {
            elements.saveSettingsBtn.disabled = false;
            elements.saveSettingsBtn.textContent = '保存并登录';
        }
    }

    /**
     * 打开添加书签模态框
     */
    function openAddBookmarkModal() {
        elements.bookmarkName.value = currentTab.title || '';
        elements.bookmarkUrl.value = currentTab.url || '';
        elements.bookmarkTips.value = '';
        elements.bookmarkPrivate.checked = false;

        // 更新分类下拉框
        const categorySelect = elements.bookmarkCategory;
        categorySelect.innerHTML = '';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });

        elements.addBookmarkModal.style.display = 'flex';
    }

    /**
     * 关闭添加书签模态框
     */
    function closeAddBookmarkModal() {
        elements.addBookmarkModal.style.display = 'none';
    }

    /**
     * 确认添加书签
     */
    async function confirmAddBookmark() {
        const name = elements.bookmarkName.value.trim();
        const url = elements.bookmarkUrl.value.trim();
        const tips = elements.bookmarkTips.value.trim();
        const category = elements.bookmarkCategory.value;
        const isPrivate = elements.bookmarkPrivate.checked;

        if (!name) {
            showMessage('请输入书签名称', 'error');
            return;
        }

        elements.confirmAddBtn.disabled = true;
        elements.confirmAddBtn.textContent = '添加中...';

        try {
            const result = await apiService.addBookmark({
                name,
                url,
                tips,
                category,
                isPrivate
            });

            if (result.success) {
                showMessage('添加成功！', 'success');
                closeAddBookmarkModal();
                await checkCurrentPageStatus();
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('添加失败：' + error.message, 'error');
        } finally {
            elements.confirmAddBtn.disabled = false;
            elements.confirmAddBtn.textContent = '确认添加';
        }
    }

    /**
     * 删除书签
     */
    async function deleteBookmark() {
        if (!currentTab || !currentTab.url) return;

        if (!confirm('确定要删除这个书签吗？')) {
            return;
        }

        elements.deleteBtn.disabled = true;
        elements.deleteBtn.textContent = '删除中...';

        try {
            const result = await apiService.deleteBookmark(currentTab.url);

            if (result.success) {
                showMessage('删除成功！', 'success');
                await checkCurrentPageStatus();
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('删除失败：' + error.message, 'error');
        } finally {
            elements.deleteBtn.disabled = false;
            elements.deleteBtn.textContent = '删除书签';
        }
    }

    /**
     * 保存分类变更
     */
    async function saveCategory() {
        if (!currentTab || !currentTab.url) return;

        const newCategory = elements.categorySelect.value;

        elements.saveCategoryBtn.disabled = true;
        elements.saveCategoryBtn.textContent = '保存中...';

        try {
            const result = await apiService.updateBookmarkCategory(currentTab.url, newCategory);

            if (result.success) {
                showMessage('分类已更新！', 'success');
                originalCategory = newCategory;
                elements.saveCategoryBtn.style.display = 'none';
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('保存失败：' + error.message, 'error');
        } finally {
            elements.saveCategoryBtn.disabled = false;
            elements.saveCategoryBtn.textContent = '保存分类';
        }
    }

    /**
     * 导入书签
     */
    async function importBookmarks() {
        // 检查登录状态
        const isLoggedIn = await storageService.isLoggedIn();
        if (!isLoggedIn) {
            showMessage('请先登录', 'error');
            openSettings();
            return;
        }

        elements.importBtn.disabled = true;

        try {
            // 获取浏览器书签
            const bookmarks = await bookmarkService.getBookmarks();

            if (!bookmarks.links || bookmarks.links.length === 0) {
                showMessage('没有找到书签', 'info');
                return;
            }

            // 导入到 Card-Tab
            const result = await apiService.importBookmarks(bookmarks.links, false);

            if (result.success) {
                showMessage(`成功导入 ${result.imported} 个书签！`, 'success');
                await checkCurrentPageStatus();
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('导入失败：' + error.message, 'error');
        } finally {
            elements.importBtn.disabled = false;
        }
    }

    /**
     * 导出备份
     */
    async function exportBookmarks() {
        elements.exportBtn.disabled = true;

        try {
            // 从 Card-Tab 获取书签
            const result = await apiService.getBookmarks();

            if (!result.success) {
                showMessage(result.error, 'error');
                return;
            }

            // 导出为 JSON
            const data = {
                links: result.links,
                categories: result.categories,
                exportTime: new Date().toISOString()
            };

            const filename = `cardtab-backup-${new Date().toISOString().slice(0, 10)}.json`;
            exportService.exportToJson(data, filename);

            showMessage('备份已下载！', 'success');
        } catch (error) {
            showMessage('导出失败：' + error.message, 'error');
        } finally {
            elements.exportBtn.disabled = false;
        }
    }

    /**
     * 显示状态消息
     */
    function showMessage(text, type = 'info') {
        elements.statusMessage.textContent = text;
        elements.statusMessage.className = 'status-message ' + type;
        elements.statusMessage.style.display = 'block';

        // 3秒后隐藏
        setTimeout(() => {
            elements.statusMessage.style.display = 'none';
        }, 3000);
    }

    /**
     * 显示设置模态框内的消息
     */
    function showSettingsMessage(text, type = 'info') {
        elements.settingsMessage.textContent = text;
        elements.settingsMessage.className = 'settings-message ' + type;
        elements.settingsMessage.style.display = 'block';

        // 3秒后隐藏
        setTimeout(() => {
            elements.settingsMessage.style.display = 'none';
        }, 3000);
    }
});
