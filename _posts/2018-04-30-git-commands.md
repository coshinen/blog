---
layout: post
title:  "Git 基础命令"
date:   2018-04-30 16:20:08 +0800
author: mistydew
comments: true
categories: Git
tags: Git CLI
---
[Git](https://git-scm.com){:target="_blank"} 是一个免费且开源的分布式版本控制系统，旨在处理从小到非常大项目的速度和效率。

Git 易于学习且拥有占用空间小和闪电般快速的性能。
它远优于像 Subversion、CVS、Perforce 和 ClearCase 这些的 SCM 工具，有像廉价的本地分支、便捷的暂存区，和多种工作流程的特性。

![git](/assets/images/git/git.png)

据传 [GitHub](https://github.com){:target="_blank"} 是全球最大的同性交友网站，Hub 有中心、枢纽之意。

## 安装（Ubuntu 16.04.4）

{% highlight shell %}
$ sudo apt install git # 安装 git。
{% endhighlight %}

## 配置

为所有本地仓库配置用户信息。

{% highlight shell %}
$ git config --global user.name "[name]" # 设置你想要附加到你的提交的名字。
$ git config --global user.email "[email address]" # 设置你想要附加到你的提交的电子邮箱地址。
{% endhighlight %}

**注：若在 git command 过程中出现错误提示 fatal: unable to auto-detect email address，则重新执行这两句配置命令。**

## 命令 | commands

### 本地仓库 | offline

**注：以下命令必须在某个 git 仓库中输入。**

{% highlight shell %}
$ git init [project-name] # 把指定目录 [project-name] 初始化为 git 管理的仓库，执行该命令后，当前目录下会多出一个名为 .git 数据目录。
$ git add [file] # 添加文件 [file] 到暂存区。
$ git status # 列出所有新的或暂存区中待提交的文件。
$ git commit -m "[descriptive message]" # 永久记录文件的简介到版本历史中，即为当前暂存区中的文件添加注释，用于记录文件版本的相关描述信息。
$ git diff # 显示未提交到暂存区文件的变化内容（有颜色对比：+ 加号绿色表示新增的内容，- 减号红色表示移除的内容）。
$ git diff --staged # 显示提交到暂存区文件与最后的文件版本的变化内容
$ git log # 列出提交的历史信息，默认时间从近到远排序。
$ git reflog # 列出 git 命令的历史记录。
$ git checkout # 撤销使用 $ git add [file] 添加到暂存区中的所有文件。
$ git checkout -- [flie] # 撤销使用 $ git add [file] 添加到暂存区中的指定文件，或未放入暂存区的已更改的文件。
$ git reset --hard HEAD^ # 版本回退至上一版。
$ git reset --hard [version] # 版本回退至指定版本。
$ git commit --amend # 修改上一次提交的评论，同时按 Ctrl + X 保存，然后按 Y 确认，最后按 Enter 退出。
{% endhighlight %}

### 远程仓库 | online (GitHub)

**注：慎用 --force/-f 参数。**

{% highlight shell %}
$ git clone https://github.com/[user/organization]/[repository].git # 克隆 GitHub 上某用户或组织的项目到本地。
$ git pull # 同步 GitHub 上的项目到本地。
$ git push # 同步本地的项目到 GitHub 上。
$ git push origin HEAD --force # 强制同步本地的项目分支到 GitHub 上，用于 $ git commit --amend 之后。
$ git push origin master -f # 强制同步本地的项目分支到 GitHub 上，用于 $ git reset --hard <version> 修改远程仓库的错误提交。
{% endhighlight %}

## 参照

* [Git - Documentation](https://git-scm.com/doc){:target="_blank"}
* [Git教程 - 廖雪峰的官方网站](https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000){:target="_blank"}
