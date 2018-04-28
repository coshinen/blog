---
layout: post
title:  "Linux 基础命令"
date:   2018-04-25 18:58:02 +0800
categories: jekyll update
---
Linux mascot: crystal tux and tux(Torvalds linUX?)<br>
![crystal tux](/images/20180425/crystal_penguin.jpg)
![tux](/images/20180425/tux.jpg)<br>
Childhood and Adult(funny)

> ## 切换目录 change directory
`cd <dir>` 切换工作目录（当前所在目录）至 `<dir>` 目录。<br>
`cd ..` 切换工作目录至上一级目录。<br>
`cd -` 切换工作目录至上一个工作目录。<br>
`cd ~` 同 `cd` 切换工作目录至当前用户家目录。<br>
**注：本文出现的 `<dir>` 均为相对路径 或 绝对路径**

> ## 查看目录下的内容 list
`ls` 列出当前所在目录下的所有文件（除隐藏文件，即以 `.` 开头的文件）的文件名，包含普通文件、目录文件...<br>
`ls <dir>` 列出 `<dir>` 目录下的所有文件（除隐藏文件，即以 `.` 开头的文件）的文件名，包含普通文件、目录文件...<br>
`ls -l` 列出当前所在目录下的所有文件（除隐藏文件）的详细信息，分别是文件属性（类型、权限）、连接数、所属者、所属组、大小（字节）、日期、文件名。<br>
`ls -a` 列出当前所在目录下的所有文件的文件名，包含隐藏文件。

> ## 創建文件
`touch <file>` 创建一个指定文件名 `<file>` 的空文件。<br>
`echo <content> >> <file>` 追加 `<content>` 内容到 `<file>` 文件的最后一行，若文件不存在，则新建并追加。注：使用 `>` 代替 `>>`，则会覆盖现存文件当前的内容。<br>
`vi/vim <file>` 使用 Vi/Vim 编辑器打开指定的文件进行编辑，若文件不存在，则新建空文件再进行编辑。<br>
**注：<br>
1. Vi/Vim 编辑过的文件会在结尾自动添加一个 `\n` 换行，所以编辑过文件至少又一个字节的大小。<br>
2. Vi 系统自带，Vim 需安装，详见安装软件命令。**

> ## 删除文件
`rm <file>` 删除指定的 `<file>` 文件。<br>
`mkdir <dir>` 只能删除指定的**空目录** `<dir>`。<br>
`rm <dir> -r` 删除指定的目录 `<dir>` 下包含的所有文件，`-r` 参数表示循环。<br>
**`sudo rm / -rf` 删除根目录先所有文件，使用 `sudo` 进行权限提升，`-f` 参数表示不显示任何信息。慎用！**

> ## 安装软件
`apt-get install vim` 安装 vim 软件到系统，一般默认装在 `/usr/bin` 目录下，所以要使用 root 用户进行安装，或在命令的前面加 `sudo` 进行权限提升。e.g. `sudo apt-get install vim`<br>
`apt-get update` 从所有配置的源中下载包信息，用于安装软件时显示没有该软件的情况。<br>
`apt-get upgrade` 从通过 sources.list 配置的源安装在系统上的所有包中安装可用的升级，即通过 update 的结果进行已安装软件的升级。

## 参考
* [Why Penguin is Linux logo? - LinuxScrew: Linux Blog](http://www.linuxscrew.com/2007/11/14/why-penguin-is-linux-logo)
* [《Linus Torvalds自传》摘录 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2012/09/linus_torvalds.html)
* [Linux命令大全（手册）](http://man.linuxde.net)
* [...](http://github.com/mistydew)
