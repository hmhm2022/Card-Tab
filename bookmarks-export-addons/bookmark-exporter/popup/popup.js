document.addEventListener('DOMContentLoaded', () => {
    const bookmarkService = new BookmarkService();
    const exportService = new ExportService();

    document.getElementById('exportBtn').addEventListener('click', async () => {
        const bookmarks = await bookmarkService.getBookmarks();
        exportService.exportToJson(bookmarks);
    });
}); 