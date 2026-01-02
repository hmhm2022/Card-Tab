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
            const response = await fetch(`${apiUrl}/api/verifyPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
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
            return { success: false, error: '请先登录' };
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

        // 检查是否已存在
        const exists = links.some(link => link.url === bookmark.url);
        if (exists) {
            return { success: false, error: '该书签已存在' };
        }

        // 添加新书签
        const newBookmark = {
            name: bookmark.name,
            url: bookmark.url,
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

        // 找到并删除
        const index = links.findIndex(link => link.url === url);
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

        // 找到书签
        const bookmark = links.find(link => link.url === url);
        if (!bookmark) {
            return { success: false, error: '书签不存在' };
        }

        // 更新分类
        bookmark.category = newCategory;

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

        const bookmark = result.links.find(link => link.url === url);
        return {
            success: true,
            bookmark: bookmark || null,
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

        // 合并书签（避免重复）
        const existingUrls = new Set(links.map(l => l.url));
        let importedCount = 0;

        for (const newLink of newLinks) {
            if (!existingUrls.has(newLink.url)) {
                links.push(newLink);
                existingUrls.add(newLink.url);
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
