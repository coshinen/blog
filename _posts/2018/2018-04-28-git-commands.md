---
layout: post
title:  "Git 版本控制指南"
date:   2018-04-28 20:20:08 +0800
author: Coshin
comments: true
category: 程序人生
tags: GitHub CLI
---
Git 是一个免费且开源的分布式版本控制系统。

## 配置工具

为所有的本地仓库配置用户信息。

```shell
$ git config --global user.name "[name]"
  设置附加到提交的用户名
```

```shell
$ git config --global user.email "[email address]"
  设置附加到提交的电子邮箱
```

配置文件 `.gitconfig` 位于用户家目录，格式如下：

```
# This is Git's per-user configuration file.
[user]
    name = [name]
    email = [email address]
```

## 分支

分支是使用 Git 的一个重要部分。
所做的任何提交都将在当前签出的分支上进行。
使用 `git status` 查看是哪个分支。

```shell
$ git status
  显示当前分支的状态，包含所有新的和暂存区中待提交的文件
```

```shell
$ git branch [branch-name]
  创建一个新的分支
```

```shell
$ git branch -d [branch-name]
  删除指定的分支
```

```shell
$ git checkout [branch-name]
  切换到指定的分支并更新工作目录
```

```shell
$ git merge [branch]
  合并指定的分支历史到当前分支（通常用于拉请求，但是一个重要的 Git 操作）
```

## 创建仓库

当开始使用一个新的仓库时，只需要执行一次；
或者通过克隆一个现有的仓库。

```shell
$ git init [project-name]
  把一个现存的目录转化为 git 管理的仓库
```

在使用 `git init` 命令后，目录 `[project-name]` 下会生成一个名为 `.git` 的数据目录，使用下面的命令连接本地仓库到一个空的 GitHub 仓库：

```shell
$ git remote add origin [url]
  添加一个新的远程仓库并指定一个简称 origin
```

```shell
$ git clone https://github.com/[user/organization]/[repository].git
  克隆（下载）一个 GitHub 上已存在的用户或组织的仓库，包含所有的文件、分支和提交
```

## .gitignore 文件

有时使用 Git 把文件排除在追踪外可能是个好主意。
这通常在一个名为 `.gitignore` 的特殊文件中完成。
可以在 [github.com/github/gitignore](https://github.com/github/gitignore){:target="_blank"} 找到 `.gitignore` 文件有用的模版。

## 同步更改

同步本地仓库与 GitHub.com 上的远程仓库。

```shell
$ git push
  上传所有本地分支提交到 GitHub
```

```shell
$ git push <remote> <branch>
  首次把本地分支推送到远程仓库（克隆会自动设置好）
```

```shell
$ git fetch
  从远程跟踪分支下载所有历史
```

```shell
$ git merge
  合并远程跟踪分支到当前本地分支
```

```shell
$ git pull
  使用来自 GitHub 上相应远程分支的所有最新提交更新当前的本地工作分支（是 fetch 和 merge 的组合）
```

## 进行更改

浏览并检查项目文件的演变。

```shell
$ git add [file]
  快照文件为版本控制做准备（即把文件添加到暂存区）
```

```shell
$ git reset [file]
  撤销已快照文件（即添加到暂存区中的文件）
```

```shell
$ git commit -m "[descriptive message]"
  永久记录文件快照到版本历史（即为当前暂存区中的文件添加注释，以记录文件版本的描述信息）
```

```shell
$ git commit --amend
  修改最新的一次提交
```

```shell
$ git rebase -i HEAD~n
  修改倒数第 n 条提交，把 pick 改为 edit，保存退出后根据提示进行
```

```shell
$ git diff [first-branch]...[second-branch]
  显示两个分支间的内容差异
```

```shell
$ git show [commit]
  输出指定提交的元数据和内容变化
```

```shell
$ git log
  列出当前分支的版本历史（即历史提交，默认时间从近到远排序）
```

```shell
$ git log --follow [file]
  列出一个文件的版本历史，包含重命名
```

```shell
$ git reflog
  列出 git 命令的历史记录
```

## 撤销提交

擦除错误并手动替换历史。

```shell
$ git reset [commit]
  撤销 [commit] 后的所有提交，保留本地更改
```

```shell
$ git reset --hard [commit]
  丢弃所有历史和更改回到指定的提交
```

**注意！**
改变历史会带来严重的副作用。
如果需要更改 GitHub 上（远程）存在的提交，须慎用 `--force/-f` 参数操作。

## 术语

**git:**
一个开源，分布式的版本控制系统。

**GitHub:**
一个在 Git 仓库上托管和协作的平台。

**commit:**
一个 Git 对象，一张整个仓库压缩到一个 SHA 的快照。

**branch:**
一个指向一条提交的轻量级可移动指针。

**clone:**
一个仓库的一个本地版本，包含所有的提交和分支。

**remote:**
一个 GitHub 上的公共仓库，所有团队成员都用它来交换他们的更改。

**fork:**
一份 GitHub 上由不同的用户拥有的一个仓库的拷贝。

**pull request:**
一个在一条分支上比较并讨论差异的引入的地方，包括审核、注释、集成测试等。

**HEAD:**
表示当前的工作目录，使用 `git checkout` 可以把 HEAD 指针移动到不同的分支、标签或提交。

## 参考链接

* [Git - Reference](https://git-scm.com/docs){:target="_blank"}
* [git - the simple guide - no deep shit!](http://rogerdudler.github.io/git-guide){:target="_blank"}
