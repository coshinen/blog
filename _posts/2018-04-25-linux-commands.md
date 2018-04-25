---
layout: post
title:  "Linux 基础命令"
date:   2018-04-25 08:58:02 +0800
categories: jekyll update
---
You can contact me via e-mail: [mistydew@qq.com](https://en.mail.qq.com).

Linux mascot: crystal tux and tux(Torvalds linUX?)<br>
![crystal tux](/images/20180425/crystal_penguin.jpg)
![tux](/images/20180425/tux.jpg)<br>
Childhood and Adult(funny)

> ## 切换目录 change directory
`cd xxx` 切换工作目录（当前所在目录）至 xxx 目录，xxx 为相对路径 或 绝对路径。<br>
`cd ..` 切换工作目录至上一级目录。<br>
`cd -` 切换工作目录至上一个工作目录。<br>
`cd ~` 同 `cd` 切换工作目录至当前用户家目录。<br>

> ## 查看目录下的内容 list
`ls` 列出当前所在目录下的所有文件（除隐藏文件，即以 `.` 开头的文件）的文件名，包含普通文件、目录文件...<br>
`ls xxx` 列出 xxx 目录下的所有文件（除隐藏文件，即以 `.` 开头的文件）的文件名，包含普通文件、目录文件...<br>
`ls -l` 列出当前所在目录下的所有文件（除隐藏文件）的详细信息，分别是文件属性（类型、权限）、连接数、所属者、所属组、大小（字节）、日期、文件名。<br>
`ls -a` 列出当前所在目录下的所有文件的文件名，包含隐藏文件。

## 参考
* [Why Penguin is Linux logo? - LinuxScrew: Linux Blog](http://www.linuxscrew.com/2007/11/14/why-penguin-is-linux-logo)
* [《Linus Torvalds自传》摘录 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2012/09/linus_torvalds.html)
* [Linux命令大全（手册）](http://man.linuxde.net)
* [...][md]

Check out the [mistydew][md] for more info on who am I.

[md]: http://github.com/mistydew
