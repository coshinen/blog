---
layout: post
title:  "Git 基础命令"
date:   2018-04-30 16:20:08 +0800
author: mistydew
comments: true
category: 程序人生
tags: Git/GitHub CLI Terminal
excerpt: Git 是一个免费且开源的分布式版本控制系统。
---
![git](https://git-scm.com/images/logo@2x.png)

## 配置

配置文件 `.gitconfig` 位于用户家目录，格式如下：

```shell
# This is Git's per-user configuration file.
[user]
    name = [name]
    email = [email address]
```

当出现提示 `fatal: unable to auto-detect email address` 时，执行下面两句命令配置本地仓库的用户信息。

### 设置用户名

```shell
$ git config --global user.name "[name]" # 设置你想要附加到你的提交的名字
```

### 设置用户邮箱

```shell
$ git config --global user.email "[email address]" # 设置你想要附加到你的提交的电子邮箱地址
```

## 本地仓库

### 初始化仓库

```shell
$ git init [project-name] # 初始化目录 [project-name] 为 git 管理的仓库，执行该命令后，指定目录下会多出一个名为 .git 数据目录
```

### 查看状态

```shell
$ git status # 列出所有新的或暂存区中待提交的文件
$ git diff # 显示未提交到暂存区文件的变化内容（有颜色对比：+ 加号绿色表示新增的内容，- 减号红色表示移除的内容）
```

### 添加文件

```shell
$ git add [file] # 添加文件 [file] 到暂存区
```

### 撤销文件

```shell
$ git reset [file] # 撤销暂存区中的文件 [file]
```

### 提交文件

```shell
$ git commit -m "[descriptive message]" # 永久记录文件的简介到版本历史中，即为当前暂存区中的文件添加注释，用于记录文件版本的相关描述信息
```

### 修改提交

```shell
$ git commit --amend # 修改最近一次提交的评论
$ git rebase -i HEAD~n # 修改倒数第 n 条提交的信息，把 pick 改为 edit，保存退出后根据提示进行
```

### 查看历史

```shell
$ git log # 列出提交的历史信息，默认时间从近到远排序
$ git reflog # 列出 git 命令的历史记录
```

### 版本回退

```shell
$ git reset --hard HEAD^ # 回退至上一个版本
$ git reset --hard [version] # 回退至指定版本
```

## 远程仓库（GitHub）

**注意：慎用 `--force/-f` 参数。**

### 克隆仓库

```shell
$ git clone https://github.com/[user/organization]/[repository].git # 克隆 GitHub 用户或组织 [user/organization] 的仓库 [repository] 到本地
```

### 同步仓库

```shell
$ git pull # 拉取 GitHub 仓库到本地
$ git push # 推送本地仓库到 GitHub
$ git push --force/-f # 强制推送本地仓库到 GitHub
```

## 参考链接

* [Git - Book](https://git-scm.com/book/en/v2){:target="_blank"}
* [GitHub Guides](https://guides.github.com){:target="_blank"}
* [GitHub Cheat Sheet](https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf){:target="_blank"}
* [GitHub.com Help Documentation](https://help.github.com/en){:target="_blank"}
* [git - the simple guide - no deep shit!](http://rogerdudler.github.io/git-guide){:target="_blank"}
