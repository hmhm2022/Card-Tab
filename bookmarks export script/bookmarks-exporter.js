// ==UserScript==
// @name         Bookmarks Exporter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Export Chrome bookmarks to customized JSON format
// @author       Linux.do user705
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_download
// ==/UserScript==

(function() {
    'use strict';

    GM_registerMenuCommand("Export Bookmarks", exportBookmarks);

    function exportBookmarks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html';
        
        input.onchange = async function(e) {
            const file = e.target.files[0];
            const text = await file.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            const bookmarksList = [];
            
            const personalToolbar = Array.from(doc.getElementsByTagName('h3')).find(h3 => 
                h3.textContent.includes('书签栏') || 
                h3.getAttribute('personal_toolbar_folder') === 'true'
            );

            if (personalToolbar) {
                const toolbarDL = personalToolbar.parentElement.querySelector('dl');
                if (toolbarDL) {
                    processFolder(toolbarDL, bookmarksList, null);
                }
            }
            
            const result = formatBookmarks(bookmarksList);
            
            const json = JSON.stringify(result, null, 2);
            GM_download({
                url: URL.createObjectURL(new Blob([json], {type: 'application/json'})),
                name: 'bookmarks.json'
            });
        };
        
        input.click();
    }

    function processFolder(container, bookmarksList, parentFolder) {
        try {
            const links = container.querySelectorAll(':scope > dt > a');
            for (const link of links) {
                const bookmark = {
                    name: link.textContent.trim(),
                    url: link.href,
                    category: parentFolder || "常用网站",
                    isPrivate: false
                };
                
                if (bookmark.url.startsWith('data:')) {
                    bookmark.url = link.getAttribute('href');
                }
                
                try {
                    bookmark.url = decodeURIComponent(bookmark.url);
                } catch (e) {
                }
                
                bookmarksList.push(bookmark);
            }
            
            const folders = container.querySelectorAll(':scope > dt > h3');
            for (const folder of folders) {
                const folderName = folder.textContent.trim();
                const subDL = folder.parentElement.querySelector('dl');
                if (subDL) {
                    if (!parentFolder) {
                        processFolder(subDL, bookmarksList, folderName);
                    } else {
                        processFolder(subDL, bookmarksList, parentFolder);
                    }
                }
            }
        } catch (error) {
            console.error('Error in processFolder:', error);
            throw error;
        }
    }

    function formatBookmarks(links) {
        const categories = {};
        
        links.forEach(link => {
            if (!categories[link.category]) {
                categories[link.category] = [];
            }
            categories[link.category].push(link);
        });

        return {
            links: links,
            categories: categories
        };
    }

})();
