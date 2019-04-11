---
layout: post
title:  "如何在 macOS 上开启 NTFS 硬盘的写模式"
date:   2019-04-10 20:54:36 +0800
author: mistydew
comments: true
categories: R/W
tags: macOS NTFS
---
苹果的 macOS 只支持 NTFS 格式硬盘的读操作，而不支持写操作。
据说是版权原因，事实上可以通过修改系统配置文件开启对 NTFS 硬盘的写操作。

## 1.使用 root 权限在 /etc/ 目录下创建 fstab 文件

{% highlight shell %}
$ sudo vim /etc/fstab
{% endhighlight %}

## 2.在 fstab 文件中键入以下文字并保存

> LABEL=\<drive name> none ntfs rw,auto,nobrowse # \<drive name> 为硬盘名，空格使用 \040 转移字符替代

**注：这里 \040 为八进制的 40，即十进制的 32，对应 ASCII 码中的空格。**

例：硬盘名为 My Passport，则应该键入：

> LABEL=My\040Passport none ntfs rw,auto,nobrowse

## 3.重新插入硬盘，硬盘默认挂载在 /Volumes/ 目录下

## 4.现在可以开始进行写操作了

Thanks for your time.

## 参照
* [How to Write to NTFS Drives on a Mac](https://www.howtogeek.com/236055/how-to-write-to-ntfs-drives-on-a-mac)
* [fstab - Wikipedia](https://en.wikipedia.org/wiki/Fstab)
* [ASCII Codes - Table of ascii characters and symbols](https://ascii.cl)
* [...]({{ site.url | append: site.blog }})
