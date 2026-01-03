class ExportService {
  /**
   * 导出数据为 JSON 文件，弹出"另存为"对话框
   * @param {Object} data - 要导出的数据
   * @param {string} filename - 文件名
   * @returns {Promise<{success: boolean, cancelled?: boolean}>}
   */
  async exportToJson(data, filename = 'bookmarks.json') {
    const json = JSON.stringify(data, null, 2);

    // 优先使用 File System Access API（支持自定义默认文件名）
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'JSON 文件',
            accept: { 'application/json': ['.json'] }
          }]
        });

        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();

        return { success: true };
      } catch (err) {
        // 用户取消选择
        if (err.name === 'AbortError') {
          return { success: false, cancelled: true };
        }
        throw err;
      }
    }

    // 降级：使用 chrome.downloads API
    return this._downloadWithChromeApi(json, filename);
  }

  /**
   * 使用 chrome.downloads API 下载（降级方案）
   */
  _downloadWithChromeApi(json, filename) {
    return new Promise((resolve) => {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError || !downloadId) {
          URL.revokeObjectURL(url);
          resolve({ success: false, cancelled: true });
          return;
        }

        let timeoutId = null;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          chrome.downloads.onChanged.removeListener(listener);
          URL.revokeObjectURL(url);
        };

        const listener = (delta) => {
          if (delta.id !== downloadId) return;

          if (delta.state?.current === 'complete') {
            cleanup();
            resolve({ success: true });
          } else if (delta.state?.current === 'interrupted') {
            cleanup();
            resolve({ success: false, cancelled: true });
          }
        };

        // 30秒超时兜底，防止监听器泄漏
        timeoutId = setTimeout(() => {
          cleanup();
          resolve({ success: false, cancelled: true });
        }, 30000);

        chrome.downloads.onChanged.addListener(listener);
      });
    });
  }
} 