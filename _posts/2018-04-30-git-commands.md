---
layout: post
title:  "Git 基础命令"
date:   2018-04-30 16:20:08 +0800
categories: jekyll update
---
传言：[GitHub](https://github.com) 是全球最大的同性交友网站！

官方简介：<br>
![git](/images/20180430/git.jpg)<br>
Git 是一个免费且开源的分布式版本控制系统，旨在处理从小到非常大项目的速度和效率。<br>
Git 易于学习且拥有占用空间小和闪电般快速的性能。它远优于像 Subversion、CVS、Perforce 和 ClearCase 这些的 SCM 工具，有像廉价的本地分支、便捷的暂存区，和多种工作流程的特性。

## 安装（Ubuntu 16.04.4）
> `$ sudo apt-get install git` 安装 git。<br>
> `$ git config --global user.name "<Your Name>"` <Your Name> 替换为你的名字。<br>
> `$ git config --global user.email "<Your Email>"` <Your Email> 替换为你的邮箱。<br>
> **注：若在 git command 过程中出现错误提示 `fatal: unable to auto-detect email address`，则重新执行以上两句配置命令。**

## 命令 commands
> ### 本地仓库
> `$ git init` 把当前所在目录初始化为 git 管理的仓库，执行该命令后，当前目录下会多出一个名为 .git 数据目录。<br>
> **注：以下命令必须在某个 git 仓库中输入。**
> `$ git add <file>` 添加一个文件到暂存区。<br>
> `$ git commit -m "<comments>"` 进行文件的提交，即为当前暂存区中的文件添加注释，用于记录文件相关的版本信息。<br>
> `$ git status` 查看当前仓库和暂存区中文件的状态。<br>
> `$ git diff` 查看当前版本相对于上一版的变化内容（有颜色对比：+ 加号绿色表示新增的内容，- 减号红色表示移除的内容）。<br>
> `$ git log` 查看提交的历史信息，默认时间从近到远排序。<br>
> `$ git reflog` 查看 git 的历史记录。<br>
> `$ git checkout -- <flie>` 撤销使用 `$ git add <file>` 添加到暂存区中的所有文件。<br>
> `$ git checkout -- <flie>` 撤销使用 `$ git add <file>` 添加到暂存区中的指定文件。<br>
> `$ git reset --hard HEAD^` 版本回退至上一版。<br>
> `$ git reset --hard <version>` 版本回退至指定版本。<br>
> `$ git commit --amend` 修改上一次提交的评论，同时按 `Ctrl` + `X` 保存，然后按 `Y` 确认，最后按 `Enter` 退出。

> ### 远程仓库 GitHub
> `$ git clone https://github.com/<username/organization>/<projectname>.git` 克隆 GitHub 上某用户或组织的项目到本地。

## 参照
* [Git](https://git-scm.com)
* [Git - Reference](https://git-scm.com/docs)
* [Git - Book](https://git-scm.com/book/en/v2)
* [Git教程 - 廖雪峰的官方网站](https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000)
* [Git教程 \| 菜鸟教程](http://www.runoob.com/git/git-tutorial.html)
* [...](https://github.com/mistydew)
