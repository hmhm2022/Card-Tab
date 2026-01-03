/**
 * URL 规范化函数
 * 统一处理 URL 格式，确保匹配时不会因格式差异而失败
 * @param {string} url - 原始 URL
 * @returns {string} 规范化后的 URL
 */
function normalizeUrl(url) {
    if (!url || typeof url !== 'string') {
        return url;
    }

    // 去除首尾空格
    url = url.trim();

    // 补全协议（如果缺少）
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    try {
        const parsed = new URL(url);

        // 协议小写
        let normalized = parsed.protocol.toLowerCase() + '//';

        // 域名小写
        normalized += parsed.hostname.toLowerCase();

        // 移除默认端口（80 for http, 443 for https）
        if (parsed.port &&
            !((parsed.protocol === 'http:' && parsed.port === '80') ||
              (parsed.protocol === 'https:' && parsed.port === '443'))) {
            normalized += ':' + parsed.port;
        }

        // 路径保留原样（服务器可能区分大小写）
        // 但移除根路径的单斜杠
        if (parsed.pathname && parsed.pathname !== '/') {
            normalized += parsed.pathname;
        }

        // 保留查询参数（保守策略，不移除 tracking 参数）
        if (parsed.search) {
            normalized += parsed.search;
        }

        // 不保留 fragment（#hash 部分）

        return normalized;
    } catch {
        // URL 解析失败，返回小写处理后的原始值
        return url.toLowerCase();
    }
}

/**
 * ApiService - 与 Card-Tab 后端 API 通信
 * 处理登录、获取书签、保存书签等操作
 */
class ApiService {
    constructor(storageService) {
        this.storageService = storageService;
        this.userId = 'testUser'; // Card-Tab 默认使用 testUser
    }

    /**
     * 处理 401 响应（token 过期或无效）
     * @param {Response} response - fetch 响应对象
     * @returns {Promise<{success: boolean, tokenExpired: boolean, error: string}|null>} 如果是 401 返回错误对象，否则返回 null
     */
    async _handle401Response(response) {
        if (response.status === 401) {
            const data = await response.json().catch(() => ({}));
            // 清除本地过期的 token
            await this.storageService.clearAuthToken();
            return {
                success: false,
                tokenExpired: true,
                error: data.message || '登录已过期，请重新登录'
            };
        }
        return null;
    }

    /**
     * 登录获取 Token
     * @param {string} password - 管理密码
     * @returns {Promise<{success: boolean, token?: string, error?: string}>}
     */
    async login(password) {
        const apiUrl = await this.storageService.getApiUrl();
        if (!apiUrl) {
            return { success: false, error: '请先配置 API 地址' };
        }

        try {
            // 获取用户设置的有效期（默认30分钟）
            const expiryMinutes = (await this.storageService.getExpirySetting()) ?? 30;
            const response = await fetch(`${apiUrl}/api/verifyPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password, expiryMinutes })
            });

            const data = await response.json();

            if (response.ok && data.valid && data.token) {
                await this.storageService.saveAuthToken(data.token);
                return { success: true, token: data.token };
            } else {
                return { success: false, error: data.error || '登录失败' };
            }
        } catch (error) {
            return { success: false, error: '网络错误：' + error.message };
        }
    }

    /**
     * 获取所有书签和分类
     * @returns {Promise<{success: boolean, links?: Array, categories?: Object, error?: string}>}
     */
    async getBookmarks() {
        const apiUrl = await this.storageService.getApiUrl();
        const token = await this.storageService.getAuthToken();

        if (!apiUrl) {
            return { success: false, error: '请先配置 API 地址' };
        }

        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = token;
            }

            const response = await fetch(`${apiUrl}/api/getLinks?userId=${this.userId}`, {
                headers
            });

            // 处理 401 错误（token 过期或无效）
            const authError = await this._handle401Response(response);
            if (authError) return authError;

            if (!response.ok) {
                throw new Error('HTTP error: ' + response.status);
            }

            const data = await response.json();
            return {
                success: true,
                links: data.links || [],
                categories: data.categories || {}
            };
        } catch (error) {
            return { success: false, error: '获取书签失败：' + error.message };
        }
    }

    /**
     * 保存书签数据
     * @param {Array} links - 书签列表
     * @param {Object} categories - 分类对象
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async saveBookmarks(links, categories) {
        const apiUrl = await this.storageService.getApiUrl();
        const token = await this.storageService.getAuthToken();

        if (!apiUrl) {
            return { success: false, error: '请先配置 API 地址' };
        }

        if (!token) {
            return { success: false, error: '请先登录', tokenExpired: true };
        }

        try {
            const response = await fetch(`${apiUrl}/api/saveOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    userId: this.userId,
                    links,
                    categories
                })
            });

            // 处理 401 错误（token 过期或无效）
            const authError = await this._handle401Response(response);
            if (authError) return authError;

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true };
            } else {
                return { success: false, error: data.message || '保存失败' };
            }
        } catch (error) {
            return { success: false, error: '保存失败：' + error.message };
        }
    }

    /**
     * 添加单个书签
     * @param {Object} bookmark - 书签对象 {name, url, category, tips, isPrivate}
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async addBookmark(bookmark) {
        // 先获取现有书签
        const result = await this.getBookmarks();
        if (!result.success) {
            return result;
        }

        const { links, categories } = result;

        // 规范化输入的 URL
        const normalizedInputUrl = normalizeUrl(bookmark.url);

        // 预处理：一次性规范化所有现有 URL（性能优化）
        const existingUrls = new Set(links.map(link => normalizeUrl(link.url)));

        // 检查是否已存在
        if (existingUrls.has(normalizedInputUrl)) {
            return { success: false, error: '该书签已存在' };
        }

        // 添加新书签（存储规范化后的 URL）
        const newBookmark = {
            name: bookmark.name,
            url: normalizedInputUrl,
            category: bookmark.category || '常用网站',
            tips: bookmark.tips || '',
            isPrivate: bookmark.isPrivate || false
        };

        links.push(newBookmark);

        // 确保分类存在
        if (!categories[newBookmark.category]) {
            categories[newBookmark.category] = [];
        }

        // 保存
        return await this.saveBookmarks(links, categories);
    }

    /**
     * 删除书签
     * @param {string} url - 书签 URL
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deleteBookmark(url) {
        // 先获取现有书签
        const result = await this.getBookmarks();
        if (!result.success) {
            return result;
        }

        let { links, categories } = result;

        // 规范化输入的 URL
        const normalizedInputUrl = normalizeUrl(url);

        // 预处理：一次性规范化所有 URL（性能优化）
        const normalizedUrls = links.map(link => normalizeUrl(link.url));
        const index = normalizedUrls.indexOf(normalizedInputUrl);
        if (index === -1) {
            return { success: false, error: '书签不存在' };
        }

        links.splice(index, 1);

        // 保存
        return await this.saveBookmarks(links, categories);
    }

    /**
     * 更新书签分类
     * @param {string} url - 书签 URL
     * @param {string} newCategory - 新分类名称
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async updateBookmarkCategory(url, newCategory) {
        // 先获取现有书签
        const result = await this.getBookmarks();
        if (!result.success) {
            return result;
        }

        let { links, categories } = result;

        // 规范化输入的 URL
        const normalizedInputUrl = normalizeUrl(url);

        // 预处理：一次性规范化所有 URL（性能优化）
        const normalizedUrls = links.map(link => normalizeUrl(link.url));
        const index = normalizedUrls.indexOf(normalizedInputUrl);
        if (index === -1) {
            return { success: false, error: '书签不存在' };
        }

        // 更新分类
        links[index].category = newCategory;

        // 确保新分类存在
        if (!categories[newCategory]) {
            categories[newCategory] = [];
        }

        // 保存
        return await this.saveBookmarks(links, categories);
    }

    /**
     * 查找书签
     * @param {string} url - 书签 URL
     * @returns {Promise<{success: boolean, bookmark?: Object, error?: string}>}
     */
    async findBookmark(url) {
        const result = await this.getBookmarks();
        if (!result.success) {
            return result;
        }

        // 规范化输入的 URL
        const normalizedInputUrl = normalizeUrl(url);

        // 预处理：一次性规范化所有 URL（性能优化）
        const normalizedUrls = result.links.map(link => normalizeUrl(link.url));
        const index = normalizedUrls.indexOf(normalizedInputUrl);

        return {
            success: true,
            bookmark: index !== -1 ? result.links[index] : null,
            categories: result.categories
        };
    }

    /**
     * 获取所有分类名称
     * @returns {Promise<{success: boolean, categories?: string[], error?: string}>}
     */
    async getCategories() {
        const result = await this.getBookmarks();
        if (!result.success) {
            return result;
        }

        const categoryNames = Object.keys(result.categories);
        // 确保至少有一个默认分类
        if (categoryNames.length === 0) {
            categoryNames.push('常用网站');
        }

        return {
            success: true,
            categories: categoryNames
        };
    }

    /**
     * 触发数据备份
     * @param {number} timeout - 超时时间（毫秒），默认 30000
     * @returns {Promise<{success: boolean, backupId?: string, error?: string}>}
     */
    async triggerBackup(timeout = 30000) {
        const apiUrl = await this.storageService.getApiUrl();
        const token = await this.storageService.getAuthToken();

        if (!apiUrl) {
            return { success: false, error: '请先配置 API 地址' };
        }

        if (!token) {
            return { success: false, error: '请先登录', tokenExpired: true };
        }

        // 创建 AbortController 用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${apiUrl}/api/backupData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    sourceUserId: this.userId
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // 处理 401 错误
            const authError = await this._handle401Response(response);
            if (authError) return authError;

            // 处理其他 HTTP 错误
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 403) {
                    return { success: false, error: '无权限执行备份操作' };
                }
                if (response.status >= 500) {
                    return { success: false, error: '服务器错误，请稍后重试' };
                }
                return { success: false, error: errorData.message || `请求失败 (${response.status})` };
            }

            const data = await response.json();
            if (data.success) {
                return { success: true, backupId: data.backupId };
            } else {
                return { success: false, error: data.message || '备份失败' };
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                return { success: false, error: '备份请求超时，请检查网络连接' };
            }
            return { success: false, error: '备份失败：' + error.message };
        }
    }

    /**
     * 批量导入书签
     * @param {Array} newLinks - 要导入的书签列表
     * @param {boolean} overwrite - 是否覆盖现有数据
     * @returns {Promise<{success: boolean, imported?: number, error?: string}>}
     */
    async importBookmarks(newLinks, overwrite = false) {
        let links = [];
        let categories = {};

        if (!overwrite) {
            // 获取现有书签
            const result = await this.getBookmarks();
            if (result.success) {
                links = result.links;
                categories = result.categories;
            }
        }

        // 合并书签（避免重复，使用规范化后的 URL 比较）
        const existingUrls = new Set(links.map(l => normalizeUrl(l.url)));
        let importedCount = 0;

        for (const newLink of newLinks) {
            const normalizedNewUrl = normalizeUrl(newLink.url);
            if (!existingUrls.has(normalizedNewUrl)) {
                // 存储规范化后的 URL
                links.push({
                    ...newLink,
                    url: normalizedNewUrl
                });
                existingUrls.add(normalizedNewUrl);
                importedCount++;

                // 确保分类存在
                if (newLink.category && !categories[newLink.category]) {
                    categories[newLink.category] = [];
                }
            }
        }

        // 保存
        const saveResult = await this.saveBookmarks(links, categories);
        if (saveResult.success) {
            return { success: true, imported: importedCount };
        } else {
            return saveResult;
        }
    }
}
