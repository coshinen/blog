---
layout: post
title:  "编译比特币源码"
date:   2018-05-03 18:57:36 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码构建
---
本文记录了如何在 macOS、Unix/Linux 平台下构建比特币源码，得到相应版本的 bitcoind、bitcoin-cli、bitcoin-qt 等可执行程序。

## 下载比特币源码

使用 git 把 GitHub 上托管的比特币源码克隆到本地，关于 git 的安装和使用详见 [Git 基础命令](/blog/2018/04/git-commands.html)篇。

{% highlight shell %}
$ git clone https://github.com/bitcoin/bitcoin.git # 克隆最新版的比特币源码到本地。
$ cd bitcoin # 切换至比特币根目录。
$ git checkout v0.12.1 # 在当前分支上切换至 tag 为 v0.12.1 的版本，或省略此步骤以编译最新版。
$ git status # 查看当前状态（这里会显示版本信息），此步可省略。
HEAD detached at v0.12.1
nothing to commit, working directory clean
{% endhighlight %}

## macOS Mojave 下构建（编译和安装）

**在构建源码之前，应该先安装相关的依赖库。**

### 依赖

{% highlight shell %}
$ brew install automake berkeley-db4 libtool boost miniupnpc openssl pkg-config protobuf python qt libevent qrencode
{% endhighlight %}

### 构建

{% highlight shell %}
$ ./autogen.sh
$ ./configure
$ make
$ make install # 可选
{% endhighlight %}

**目前 macOS 平台仅最新版 Bitcoin Core 0.17.1 通过编译测试，0.12.1 未通过。**

## Ubuntu 16.04.4 下构建（编译和安装）

### 依赖

#### 基础依赖

{% highlight shell %}
$ sudo apt-get install build-essential libtool autotools-dev automake pkg-config libssl-dev libevent-dev bsdmainutils python3
{% endhighlight %}

#### Boost 库

{% highlight shell %}
$ sudo apt-get install libboost-system-dev libboost-filesystem-dev libboost-chrono-dev libboost-program-options-dev libboost-test-dev libboost-thread-dev
$ sudo apt-get install libboost-all-dev
{% endhighlight %}

#### db4.8（仅限 Ubuntu）

{% highlight shell %}
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository ppa:bitcoin/bitcoin
$ sudo apt-get update
$ sudo apt-get install libdb4.8-dev libdb4.8++-dev
{% endhighlight %}

#### upnp 库 miniupnpc

{% highlight shell %}
$ sudo apt-get install libminiupnpc-dev
{% endhighlight %}

#### ZMQ（提供 ZMQ API 4.x）

{% highlight shell %}
$ sudo apt-get install libzmq3-dev
{% endhighlight %}

#### GUI Qt 图形库（若不使用图形化界面可省略此步，同时减少构建时间）

{% highlight shell %}
$ sudo apt-get install libqt5gui5 libqt5core5a libqt5dbus5 qttools5-dev qttools5-dev-tools libprotobuf-dev protobuf-compiler # Qt 5
$ sudo apt-get install libqt4-dev libprotobuf-dev protobuf-compiler # Qt 4 可选
$ sudo apt-get install libqrencode-dev
{% endhighlight %}

### 构建

{% highlight shell %}
$ ./autogen.sh
$ ./configure
$ make # 使用 Makefile 进行比特币源码的编译，编译完成后会生成 4 至 6 个 ELF 程序，分别为 bitcoind、bitcoin-cli、bitcoin-tx、test_bitcoin，若安装了 Qt 图形库，则会增加 bitcoin-qt、test_bitcoin-qt。
$ make install # 该项可选，把编译好的比特币程序拷贝到系统默认的可执行程序目录 /usr/local/bin 下。
{% endhighlight %}

也可以参照官方手册来构建比特币源码。

Thanks for your time.

## 参照
* [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin)
* [bitcoin/build-osx.md at master · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/master/doc/build-osx.md)
* [bitcoin/build-unix.md at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-unix.md)
* [...](https://github.com/mistydew/blockchain)
