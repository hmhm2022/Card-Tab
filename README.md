# Card-Tab 书签卡片式管理，进入管理模式可以自由移动书签位置，添加和删除书签，支持自定义网站分类，支持切换暗色主题
#### 2025.01.09 增加Tampermonkey脚本（在bookmarks export script目录），支持Chrome浏览器导出书签转换为json格式，保存到 KV存储
#### 2024.10.30 更新：
##### 1、增加了前端验证，并取消了在浏览器中保存日志。现在超过15分钟需重新登录，及时退出登录能让你的隐私更安全；
##### 2、进入设置之前会在自动备份书签，KV里将保存最近10次的备份；
##### 3、小幅更改了配色。
#### 2024.10.26 修复:  
##### 原获取网站图标的接口https://favicon.zhusl.com/ico?url= 好像失效了，现更换接口https://www.faviconextractor.com/favicon/  项目地址：[【Github】](https://github.com/seadfeng/favicon-downloader) ；另一个备份接口为https://api.iowen.cn/favicon  项目地址：[【Github】](https://github.com/owen0o0/getFavicon)  感谢上述接口作者提供的服务
#### 2024.09.17 更新:  
##### 对手机端进行了适配
#### 2024.09.14 更新: 
##### 修复 1、‘删除分类’操作导致的书签显示问题；2、‘删除分类’按钮点击过后隐藏显示的问题； 添加网站图标和操作日志
#### 2024.09.09 更新：
##### 1、增加私密书签，登录后可见
##### 2、增加网站分类管理，现在你无需编辑代码，通过页面即可进行网站分类的添加和删除操作
##### 3、增加搜索框和一言接口

### 注意：如果你已经部署过第一版（20240902）导航，更新workes代码后将无法看到之前保存的书签，需重新添加书签，望知悉！

#### 2024.09.02 发布 （第一版很轻便，代码保留在worker-js文件, 后续更新放在update-workers.js文件）

#### 演示站点：  https://demo.usgk.us.kg   备用网址：https://demo.linuxdo.nyc.mn   密码：admin

#### 未登录界面
![image](https://github.com/user-attachments/assets/dd0cad75-11ce-4691-804f-b4dff5ae2cde)

#### 已登录界面（黑暗主题）
![image](https://github.com/user-attachments/assets/c18f0df4-8e00-45e6-84db-30f81b545d15)

#### 设置界面
![image](https://github.com/user-attachments/assets/dc91458a-840c-41f9-9e50-261471320f81)



# 部署方法：
#### 五步即可完成部署：
#### 1. 登录 Cloudflare：  https://www.cloudflare.com  创建workers，复制update-workers的代码，然后部署
![image](https://github.com/user-attachments/assets/c067105b-91ee-43d5-90a9-806e5de5fe16)

#### 2. 新建一个名为CARD_ORDER的KV存储
![image](https://github.com/user-attachments/assets/706a7735-b47a-4f66-bdb4-827c38be692b)

#### 3. 添加环境变量，用于设置后台管理密码。变量名为ADMIN_PASSWORD，值your_password换成你自己的密码
![image](https://github.com/user-attachments/assets/532dcb8f-dc30-4ca9-aac9-21ef546bf367)

#### 4. 将workers的CARD_ORDER变量与新建的KV存储绑定，用于存储书签
![image](https://github.com/user-attachments/assets/9b166809-5b1e-451e-be99-253f6e60be54)

#### 5. 添加域名
![image](https://github.com/user-attachments/assets/4f23eab6-e94c-49b1-9198-3c8e05dffa8a)

## 此项目适合轻量使用，各位随意自行魔改，喜欢的话点一下小星星就行，谢谢！
