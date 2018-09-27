---
layout: post
title:  "交叉编译比特币源码"
date:   2018-08-24 11:01:52 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码构建 交叉编译
---
本文记录了如何在 Linux 平台下交叉编译比特币源码，得到 Windows 版本的可执行程序 bitcoin.exe、bitcoin-cli.exe、bitcoin-qt.exe 等。

## 下载比特币源码（Ubuntu 18.04.1）

{% highlight shell %}
$ git clone https://github.com/bitcoin/bitcoin.git # 克隆最新版的比特币源码到本地。
$ cd bitcoin # 进入比特币项目根目录。
$ git checkout v0.12.1 # 在当前分支上切换至 tag 为 v0.12.1 的版本，或省略来编译最新版。
$ git status # 查看当前状态（这里会显示版本信息）。
HEAD detached at v0.12.1
nothing to commit, working directory clean
{% endhighlight %}

## 修改 v0.12.1 源码 Qt 包源路径

{% highlight shell %}
$ vim depends/packages/qt.mk # Line 3: 把 official_releases 改为 archive，其他不变
{% endhighlight %}

第 3 行应该为 $(package)_download_path=http://download.qt.io/archive/qt/5.5/$($(package)_version)/submodules。

## 安装基本依赖

{% highlight shell %}
$ sudo apt update
$ sudo apt upgrade
$ sudo apt install build-essential libtool autotools-dev automake pkg-config bsdmainutils curl git
{% endhighlight %}

主机工具链（build-essential）是必需的，因为某些依赖包（例如：protobuf）需要构建用于构建过程中的主机实用程序。

## 构建 64 位 Windows 版

第一步，安装 mingw-w64 交叉编译工具链。

{% highlight shell %}
$ sudo apt install g++-mingw-w64-x86-64
{% endhighlight %}

对于 Ubuntu 18.04，设置默认的 mingw32 g++ 编译器选项为 posix，选择序号为 1 的选项回车即可。

{% highlight shell %}
$ sudo update-alternatives --config x86_64-w64-mingw32-g++ # Set the default mingw32 g++ compiler option to posix.
There are 2 choices for the alternative x86_64-w64-mingw32-g++ (providing /usr/bin/x86_64-w64-mingw32-g++).

  Selection    Path                                   Priority   Status
------------------------------------------------------------
* 0            /usr/bin/x86_64-w64-mingw32-g++-win32   60        auto mode
  1            /usr/bin/x86_64-w64-mingw32-g++-posix   30        manual mode
  2            /usr/bin/x86_64-w64-mingw32-g++-win32   60        manual mode

Press <enter> to keep the current choice[*], or type selection number: 1 # 这里输入 1，回车完成设置
{% endhighlight %}

再次使用该命令，查看是否设置成功，直接回车。

{% highlight shell %}
$ sudo update-alternatives --config x86_64-w64-mingw32-g++ # Set the default mingw32 g++ compiler option to posix.
There are 2 choices for the alternative x86_64-w64-mingw32-g++ (providing /usr/bin/x86_64-w64-mingw32-g++).

  Selection    Path                                   Priority   Status
------------------------------------------------------------
  0            /usr/bin/x86_64-w64-mingw32-g++-win32   60        auto mode
* 1            /usr/bin/x86_64-w64-mingw32-g++-posix   30        manual mode
  2            /usr/bin/x86_64-w64-mingw32-g++-win32   60        manual mode

Press <enter> to keep the current choice[*], or type selection number: # 这里不输入，直接回车结束设置
{% endhighlight %}

第二步，开始构建。

{% highlight shell %}
$ cd depends
$ sudo make HOST=x86_64-w64-mingw32 -j4 # 这一步会下载相关依赖，确保网络畅通
$ cd ..
$ ./autogen.sh # 若是首次构建，先生成 configure
$ sudo ./configure --prefix=pwd/depends/x86_64-w64-mingw32
$ sudo make # 若构建过非 Windows 版的程序，则执行 sudo make clean; sudo make
{% endhighlight %}

Thanks for your time.

## 参照
* [bitcoin/build-windows.md at master · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/master/doc/build-windows.md)
* [bitcoin/build-windows.md at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-windows.md)
* [Error during build 0.12 · Issue #9629 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/issues/9629)
* [...](https://github.com/mistydew/blockchain)
