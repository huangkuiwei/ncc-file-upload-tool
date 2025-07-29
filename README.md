# CtcemtiWebRelease

PC前端正式版（公开，服务项目与产品）

## Getting started

0. 设置仓库并清理缓存
   
   npm config set registry https://registry.npmmirror.com

   npm cache clean --force

1. 安装数智UI
   
  ``非内网用户，请先登陆VPN后，再安装数智UI依赖``
   
   npm install ctcemti-ui --registry https://nexus-lan.ctcemti.com/repository/npm-public/

2. 安装编译依赖
   
   npm install

3. 启动服务
   
   npm run serve

4. 升级ctcemt-ui
   
   npm update ctcemti-ui --registry https://nexus-lan.ctcemti.com/repository/npm-public/

   或先卸载后安装
   
   npm uninstall ctcemti-ui

   npm install ctcemti-ui --registry https://nexus-lan.ctcemti.com/repository/npm-public/


## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin http://218.106.83.136:7085/advanced_technology_research_center/frameworks/CtcemtiWebRelease.git
git branch -M main
git push -uf origin main
```
