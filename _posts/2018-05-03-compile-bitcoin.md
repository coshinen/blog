---
layout: post
title:  "编译比特币源码"
date:   2018-05-03 18:57:36 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 下载比特币源码（Ubuntu 16.04.4）
使用 git 把 GitHub 上托管的比特币源码克隆到本地，关于 git 的安装和使用详见 [Git 基础命令](/2018/04/30/git-commands)篇。

{% highlight shell %}
$ git clone https://github.com/bitcoin/bitcoin.git # 克隆最新版的比特币源码到本地。
$ cd bitcoin # 进入比特币源码根目录。
$ git checkout v0.12.1 # 在当前分支上切换至 tag 为 v0.12.1 的版本，或省略来编译最新版。
$ git status # 查看当前状态（这里会显示版本信息）。
HEAD detached at v0.12.1
nothing to commit, working directory clean
{% endhighlight %}

## 构建（编译和安装）比特币源码（Ubuntu 16.04.4）
参照 [doc/build-unix.md](https://github.com/bitcoin/bitcoin/blob/master/doc/build-unix.md) 来进行比特币源码的编译和安装。你也可以参照以下内容：

**在构建源码之前，应该先安装相关的依赖库。**

{% highlight shell %}
$ ./autogen.sh
$ sudo ./configure
$ sudo make # 使用 Makefile 进行比特币源码的编译，编译完成会生成 4 至 6 个 ELF 程序，分别为 `bitcoind`、`bitcoin-cli`、`bitcoin-tx`、`test_bitcoin`，若安装了 Qt 图形库，则会增加 `bitcoin-qt`、`test_bitcoin-qt`。
$ sudo make install # 该项可选，作用为把编译好的比特币相关程序安装到系统默认可执行程序目录 `/usr/local/bin` 下。
{% endhighlight %}

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

#### GUI Qt 图形库

{% highlight shell %}
$ sudo apt-get install libqt5gui5 libqt5core5a libqt5dbus5 qttools5-dev qttools5-dev-tools libprotobuf-dev protobuf-compiler # Qt 5
$ sudo apt-get install libqt4-dev libprotobuf-dev protobuf-compiler # Qt 4 可选
$ sudo apt-get install libqrencode-dev
{% endhighlight %}

**注：Linux 上安装任何程序，若没有错误提示，则表示安装成功。**

## 参照
* [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin)
* [doc/build-unix.md](https://github.com/bitcoin/bitcoin/blob/master/doc/build-unix.md)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
