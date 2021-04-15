---
layout: post
title:  "每个高效的 Linux 用户都必须知道的 14 个 Bash 快捷键"
date:   2018-12-15 13:35:20 +0800
author: mistydew
comments: true
category: 译文集
tags: Translations UNIX/Linux Bash CLI Shortcuts
---
下面是一些每个 Linux 用户都应该使用的键盘快捷键。
使用命令行时，这些快捷键可以提升你的生产力和效率。

![linux-terminal-shortcuts](https://linuxhandbook.com/content/images/2020/07/linux-terminal-shortcuts-1.jpeg){:.border}

**注：键盘快捷键中使用了大写字母，并不意味着你在使用时必须按下 `shift` 键。**

## 1. Tab

自动补全。
输入一个命令、文件名、目录名或命令选项的开头，然后按 `tab` 键，将自动完成输入的内容，或者显示全部可能的结果。

## 2. Ctrl + C

中断命令或进程。
用于停止一个在前台运行的程序。

## 3. Ctrl + Z

把在前台运行的程序送到后台运行。
如果运行程序时忘记使用 `&` 选项，可以使用这对组合键。

## 4. Ctrl + D

退出当前终端。
替代 `exit` 命令。

## 5. Ctrl + L

清空终端屏幕。
替代 `clear` 命令。

## 6. Ctrl + A

移动光标到行首。
用于输入了一个很长的命令或路径，并且想要回到它的开头。

## 7. Ctrl + E

移动光标到行尾。
与 `Ctrl + A` 相反。

## 8. Ctrl + U

擦除光标到行首间的内容。
当输入错误命令时，代替退格键丢弃当前命令。

## 9. Ctrl + K

擦除光标到行尾间的内容。
与 `Ctrl + U` 相反。

## 10. Ctrl + W

擦除光标前的一个单词。
如果光标在一个单词身上，将擦除光标到词首的字母。

## 11. Ctrl + Y

粘贴使用 `Ctrl + W`、`Ctrl + U` 和 `Ctrl + K` 快捷键擦除的文本。
用于错误删除文本或需要在某处使用已擦除的文本。

## 12. Ctrl + P

显示上一个命令。

## 13. Ctrl + N

显示下一个命令。
与 `Ctrl + P` 相反。

## 14. Ctrl + R

搜索历史命令。
历史命令保存在用户家目录下的 `.bash_history` 文件中。

## 参考链接

* [13 Linux Terminal Shortcuts Every Power Linux User Must Know](https://linuxhandbook.com/linux-shortcuts){:target="_blank"}
