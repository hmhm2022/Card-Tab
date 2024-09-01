# Card-Tab 书签卡片式管理，进入管理模式可以自由移动书签位置，添加和删除书签，支持自定义网站分类，支持切换黑暗色主题

演示站点： https://demo.usgk.us.kg    密码：admin  （如果无法移动卡片，请在网页空白处按住鼠标左键滑动一下，再尝试移动卡片）

![image](https://github.com/user-attachments/assets/27ed657c-5b88-4793-9c9d-76bb1ba93b81)

![image](https://github.com/user-attachments/assets/e8d49bee-7102-48b6-aabc-8722378302c3)

![image](https://github.com/user-attachments/assets/aff36d9a-4f02-443d-8d3b-f76f8bd41849)


五步即可完成部署：
1. 登录 Cloudflare：   https://www.cloudflare.com/  创建workers，复制workers-js 的代码，编辑
   好自定义的网站分类，然后部署
![image](https://github.com/user-attachments/assets/dc7996e6-2631-46d1-9c0c-c6999fc1e1ce)

2. 新建一个KV存储
![image](https://github.com/user-attachments/assets/706a7735-b47a-4f66-bdb4-827c38be692b)

3. 添加环境变量，用于设置后台管理密码
![image](https://github.com/user-attachments/assets/532dcb8f-dc30-4ca9-aac9-21ef546bf367)

4. 将workers与新建的KV存储绑定，用于存储书签
![image](https://github.com/user-attachments/assets/9b166809-5b1e-451e-be99-253f6e60be54)

5. 添加域名
![image](https://github.com/user-attachments/assets/4f23eab6-e94c-49b1-9198-3c8e05dffa8a)
