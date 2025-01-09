class BookmarkService {
  async getBookmarks() {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const processedData = this.processBookmarks(bookmarkTreeNodes);
        resolve(this.formatBookmarks(processedData));
      });
    });
  }

  processBookmarks(nodes, parentFolder = null) {
    let links = [];
    
    nodes.forEach(node => {
      if (node.id === "0") {
        links = links.concat(this.processBookmarks(node.children));
      } else if (node.id === "1" || node.id === "2") {
        node.children?.forEach(child => {
          if (child.url) {
            links.push({
              name: child.title,
              url: child.url,
              category: "常用网站",
              isPrivate: false
            });
          } else if (child.children) {
            this.processSubFolder(child, links);
          }
        });
      }
    });
    
    return links;
  }

  processSubFolder(folder, links) {
    const processNode = (node) => {
      if (node.url) {
        links.push({
          name: node.title,
          url: node.url,
          category: folder.title,
          isPrivate: false
        });
      }
      if (node.children) {
        node.children.forEach(processNode);
      }
    };

    folder.children?.forEach(processNode);
  }

  formatBookmarks(links) {
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
} 