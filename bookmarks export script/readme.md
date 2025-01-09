一、使用方法：仅测试Chrome浏览器

1、Chrome浏览器中打开 "chrome://bookmarks/",点击 书签 页面右上角三个点，导出 html 格式书签保存；

2、Tampermonkey 添加新脚本，复制 bookmarks-exporter.js 内容保存；

3、随便打开一个网页比如baidu.com, 点击Tampermonkey 找到图中位置并点击，弹窗中选中之前保存的 html 格式书签打开；

![image](https://github.com/user-attachments/assets/fe0bcd89-fea8-4c7e-9726-42255dfcdf99)

4、书签自动转换成json格式保存到Chrome浏览器的下载目录；

5、打开得到的 bookmarks.json文件，将内容复制到 KV存储中即可。

二、书签处理逻辑如下：

1、处理书签栏：

①、根目录下的书签 归类成 常用网站 类别

②、根目录下的文件夹称为为次级文件夹，其中的书签包括更下级文件夹中的书签统统归类为以次级文件夹名字命名的类别

2、处理其他书签同书签栏

3、导出的书签全部默认非隐私书签，请注意处理好自己的隐私书签
