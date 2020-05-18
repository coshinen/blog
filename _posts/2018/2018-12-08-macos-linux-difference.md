---
layout: post
title:  "macOS 和 Linux 内核之间有什么不同？"
date:   2018-12-08 15:46:38 +0800
author: mistydew
comments: true
category: 译文集
tags: Translations macOS UNIX/Linux
---
有些人可能会认为在 macOS 和 Linux 内核之间存在相似之处，因为它们可以处理类似的命令并运行类似的软件。
一些人甚至认为 Apple 的 macOS 是基于 Linux。事实上，两个内核有着不同的历史和特性。
今天，我们就来看看 macOS 和 Linux 内核之间的差异。

![macos-vs-linux-kernels](https://i2.wp.com/itsfoss.com/wp-content/uploads/2018/07/macos-vs-linux-kernels.jpeg){:.border}

## macOS 内核的历史

我们将从 macOS 内核的历史开始。
1985 年，由于首席执行官 John Sculley 和苹果董事会的失败，史蒂夫乔布斯离开了苹果公司。
然后，他成立了一家名为 [NeXT](https://en.wikipedia.org/wiki/NeXT){:target="_blank"} 的新电脑公司。
乔布斯想要把一台（带有新的操作系统的）新电脑快速推向市场。
为了节省时间，NeXT 团队使用了来自卡内基梅隆的[马赫内核](https://en.wikipedia.org/wiki/Mach_(kernel)){:target="_blank"}和部分 BSD 代码库来创建 [NeXTSTEP 操作系统](https://en.wikipedia.org/wiki/NeXTSTEP){:target="_blank"}。

NeXT 从未取得财务成功，一部分归功于乔布斯的花钱习惯，就像他还在苹果公司一样。
与此同时，苹果公司曾多次尝试更新其操作系统，甚至与 IBM 合作。
1997 年，苹果公司以 4.29 亿美元收购了 NeXT。
作为交易的一部分，乔布斯回到了苹果公司，NeXTSTEP 成了 macOS 和 iOS 的基础。

## Linux 内核的历史

不像 macOS 内核，Linux 不是作为商业努力的一部分而创建的。
相反，它是[由芬兰计算机科学学生 Linus Torvalds 在 1991 年创建的](https://www.cs.cmu.edu/~awb/linux.history.html){:target="_blank"}。
最初，内核是按 Linus 的计算机规格编写的，因为他想使用其新的 80386 处理器。
Linus [在 1991 年 8 月向 Usenet 发布](https://groups.google.com/forum/#!original/comp.os.minix/dlNtH7RRrGA/SwRavCzVE7gJ){:target="_blank"}了他的新内核代码。
很快，他就收到了来自世界各地的代码和功能建议。
次年 Orest Zborowski 将 X Windows 系统移植到 Linux，使其能支持图形用户界面。

在过去的 27 年中，Linux 已经慢慢成长并被赋予了特性。
这不再是一个学生的小型项目。
现在它运行在[世界上](https://www.zdnet.com/article/sorry-windows-android-is-now-the-most-popular-end-user-operating-system){:target="_blank"}[大多数计算机设备](https://www.linuxinsider.com/story/31855.html){:target="_blank"}和[超级计算机](https://itsfoss.com/linux-supercomputers-2017){:target="_blank"}上。
并不太糟。

## macOS 内核的特性

macOS 内核官方称为 XNU。该[缩写](https://github.com/apple/darwin-xnu){:target="_blank"}代表“XNU 不是 UNIX”。
根据[苹果的 GitHub 页面](https://github.com/apple/darwin-xnu){:target="_blank"}，XNU 是“卡内基梅隆大学的马赫内核与用于编写驱动程序的 FreeBSD 组件和 C++ API 相结合的混合内核”。
代码的 BSD 子系统的部分是[“通常实现为微内核系统中的用户空间服务器”](http://osxbook.com/book/bonus/ancient/whatismacosx/arch_xnu.html){:target="_blank"}。
马赫部分负责低级工作，诸如多任务，受保护的内存，虚拟内存管理，内核调试支持和控制台 I/O。

## Linux 内核的特性

虽然 macOS 内核结合微内核（[马赫](https://en.wikipedia.org/wiki/Mach_(kernel)){:target="_blank"}）和单内核（[BSD](https://en.wikipedia.org/wiki/FreeBSD){:target="_blank"}）的特性，但 Linux 只是一个单内核。
[单内核](https://www.howtogeek.com/howto/31632/what-is-the-linux-kernel-and-what-does-it-do){:target="_blank"}负责 CPU 管理，内存，进程间通信，设备驱动程序，文件系统和系统服务器调用。

## Mac 和 Linux 内核的一行不同

macOS 内核（XNU）比 Linux 时间更长，是基于 2 个很早的代码库的组合。
另一方面，Linux 更新，从头开始编写，并在更多设备上使用。

## 参考链接

* [What is the Difference Between the macOS and Linux Kernels \| It's FOSS](https://itsfoss.com/mac-linux-difference){:target="_blank"}
* [torvalds/linux: Linux kernel source tree](https://github.com/torvalds/linux){:target="_blank"}
* [The Linux Kernel Archives](https://www.kernel.org){:target="_blank"}
