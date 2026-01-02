/**
 * StorageService - 管理扩展的本地存储
 * 存储 API 地址、认证 Token 等配置信息
 */
class StorageService {
    constructor() {
        this.KEYS = {
            API_URL: 'cardtab_api_url',
            AUTH_TOKEN: 'cardtab_auth_token',
            TOKEN_EXPIRY: 'cardtab_token_expiry',
            EXPIRY_SETTING: 'cardtab_expiry_setting'
        };
    }

    /**
     * 保存 API 地址
     * @param {string} url - Card-Tab API 地址
     */
    async saveApiUrl(url) {
        // 确保 URL 格式正确（去掉末尾斜杠）
        const cleanUrl = url.replace(/\/+$/, '');
        await chrome.storage.local.set({ [this.KEYS.API_URL]: cleanUrl });
    }

    /**
     * 获取 API 地址
     * @returns {Promise<string|null>}
     */
    async getApiUrl() {
        const result = await chrome.storage.local.get(this.KEYS.API_URL);
        return result[this.KEYS.API_URL] || null;
    }

    /**
     * 保存认证 Token
     * @param {string} token - JWT Token
     * @param {number} expiryMinutes - 过期时间（分钟），-1 表示永久登录
     */
    async saveAuthToken(token, expiryMinutes = null) {
        // 如果没有传入有效期，从设置中读取
        if (expiryMinutes === null) {
            expiryMinutes = await this.getExpirySetting();
        }

        // -1 表示永久登录，使用 100 年后的时间戳
        const expiry = expiryMinutes === -1
            ? Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
            : Date.now() + expiryMinutes * 60 * 1000;

        await chrome.storage.local.set({
            [this.KEYS.AUTH_TOKEN]: token,
            [this.KEYS.TOKEN_EXPIRY]: expiry
        });
    }

    /**
     * 保存有效期设置
     * @param {number} minutes - 有效期（分钟），-1 表示永久
     */
    async saveExpirySetting(minutes) {
        await chrome.storage.local.set({ [this.KEYS.EXPIRY_SETTING]: minutes });
    }

    /**
     * 获取有效期设置
     * @returns {Promise<number>} 有效期（分钟），默认 15 分钟
     */
    async getExpirySetting() {
        const result = await chrome.storage.local.get(this.KEYS.EXPIRY_SETTING);
        const setting = result[this.KEYS.EXPIRY_SETTING];
        return setting !== undefined ? setting : 15;
    }

    /**
     * 获取认证 Token（如果未过期）
     * @returns {Promise<string|null>}
     */
    async getAuthToken() {
        const result = await chrome.storage.local.get([
            this.KEYS.AUTH_TOKEN,
            this.KEYS.TOKEN_EXPIRY
        ]);

        const token = result[this.KEYS.AUTH_TOKEN];
        const expiry = result[this.KEYS.TOKEN_EXPIRY];

        // 检查是否过期
        if (token && expiry && Date.now() < expiry) {
            return token;
        }

        // Token 不存在或已过期，清除
        await this.clearAuthToken();
        return null;
    }

    /**
     * 清除认证 Token
     */
    async clearAuthToken() {
        await chrome.storage.local.remove([
            this.KEYS.AUTH_TOKEN,
            this.KEYS.TOKEN_EXPIRY
        ]);
    }

    /**
     * 检查是否已配置 API 地址
     * @returns {Promise<boolean>}
     */
    async isConfigured() {
        const apiUrl = await this.getApiUrl();
        return !!apiUrl;
    }

    /**
     * 检查是否已登录（Token 有效）
     * @returns {Promise<boolean>}
     */
    async isLoggedIn() {
        const token = await this.getAuthToken();
        return !!token;
    }

    /**
     * 清除所有存储数据
     */
    async clearAll() {
        await chrome.storage.local.remove([
            this.KEYS.API_URL,
            this.KEYS.AUTH_TOKEN,
            this.KEYS.TOKEN_EXPIRY
        ]);
    }
}
