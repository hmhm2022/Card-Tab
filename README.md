# Card-Tab
✨一个部署在CF的轻量化导航页面，可移动卡片式书签，方便管理
五步即可完成部署：
1. 登录 Cloudflare：   https://www.cloudflare.com/  创建workers，复制workers-js 的代码，编辑
   好自定义的网站分类，部署即可
![image](https://github.com/user-attachments/assets/dc7996e6-2631-46d1-9c0c-c6999fc1e1ce)

2. 新建一个KV存储
![image](https://github.com/user-attachments/assets/706a7735-b47a-4f66-bdb4-827c38be692b)

3. 添加环境变量
![image](https://github.com/user-attachments/assets/532dcb8f-dc30-4ca9-aac9-21ef546bf367)

4. 将workers与新建的KV存储绑定
![image](https://github.com/user-attachments/assets/9b166809-5b1e-451e-be99-253f6e60be54)

5. 添加域名
![image](https://github.com/user-attachments/assets/4f23eab6-e94c-49b1-9198-3c8e05dffa8a)
