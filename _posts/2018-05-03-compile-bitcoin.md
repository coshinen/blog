---
layout: post
title:  "编译比特币源码"
date:   2018-05-03 18:57:36 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码构建
---
在 macOS、UNIX/Linux 平台下构建比特币源码，得到对应版本的 bitcoind、bitcoin-cli、bitcoin-qt 等可执行文件。

## 获取比特币源码

使用 git 把 GitHub 上托管的比特币源码克隆到本地，关于 git 的安装和使用详见 [Git 基础命令](/blog/2018/04/git-commands.html)篇。

```shell
$ git clone https://github.com/bitcoin/bitcoin.git # 克隆最新版的比特币源码到本地。
$ cd bitcoin # 切换至比特币根目录。
$ git checkout v0.12.1 # 在当前分支上切换至 tag 为 v0.12.1 的版本，或省略此步骤以编译最新版。
$ git status # 查看当前状态（这里会显示版本信息），此步可省略。
HEAD detached at v0.12.1
nothing to commit, working directory clean
```

## 构建（编译和安装）

**在构建源码之前，应该先安装相关的依赖库。**

```shell
$ ./autogen.sh # 生成 configure
$ ./configure # 配置生成 Makefile，例：关闭钱包功能，使用静态库链接得到移植后不依赖库文件的可执行文件，指定 boost 库路径等
$ make # 使用 Makefile 进行比特币源码的编译，编译完成后会生成 4 至 6 个 ELF，分别为 bitcoind、bitcoin-cli、bitcoin-tx、test_bitcoin，若安装了 Qt 图形库，则会增加 bitcoin-qt、test_bitcoin-qt
$ make install # 该项可选，把编译好的比特币程序拷贝到系统默认的可执行程序目录 /usr/local/bin 下
```

**注：macOS Mojave 无法构建 bitcoin v0.12.1 的可执行文件 bitcoin-qt，因为 macOS Mojave 不支持 bitcoin v0.12.1 对应的 qt5.5 的构建。**

## 内存需求

C++ 编译器较吃内存。推荐在编译比特币核心时至少有 1GB 的空闲内存。
使用 512MB 或更少的内存编译由于内存交换将花费更长的时间。

## 依赖构建说明：macOS & Ubuntu

### macOS Mojave

使用 Homebrew 安装依赖。

```shell
$ brew install automake berkeley-db4 libtool boost@1.59 miniupnpc openssl pkg-config protobuf python qt libevent qrencode
```

brew 默认安装指定库的最新版本，可以使用命令`$ brew search <libname>`查看指定库的所有版本。
**bitcoin v0.12.1 对应的 boost 库的版本为1.59.0，可以从 [bitcoin/depends/packages/boost.mk](https://github.com/bitcoin/bitcoin/blob/v0.12.1/depends/packages/boost.mk) 中获取当前版本比特币对应的 boost 库的版本。**

### Ubuntu 16.04.*

构建必备：

```shell
$ sudo apt-get install build-essential libtool autotools-dev automake pkg-config libssl-dev libevent-dev bsdmainutils python3
```

Boost 库：

```shell
$ sudo apt-get install libboost-system-dev libboost-filesystem-dev libboost-chrono-dev libboost-program-options-dev libboost-test-dev libboost-thread-dev
$ sudo apt-get install libboost-all-dev # 如果不管用，你可以安装全部的 boost 开发包
```

**ubuntu 16.04.* 默认安装 boost 库的版本为 1.58.0，可满足 bitcoin v0.12.1 对 boost 库的需求。**

BerkeleyDB 钱包所需：

```shell
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository ppa:bitcoin/bitcoin
$ sudo apt-get update
$ sudo apt-get install libdb4.8-dev libdb4.8++-dev
```

UPnP 库：

```shell
$ sudo apt-get install libminiupnpc-dev # 查看 --with-miniupnpc 和 --enable-upnp-default
```

ZMQ 依赖：

```shell
$ sudo apt-get install libzmq3-dev # 提供 ZMQ API 4.x
```

## GUI 依赖

Qt5 图形库（推荐，若不使用图形化界面可省略此步，同时减少构建时间）：

```shell
$ sudo apt-get install libqt5gui5 libqt5core5a libqt5dbus5 qttools5-dev qttools5-dev-tools libprotobuf-dev protobuf-compiler # Qt 5
```

libqrencode 二维码生成库（可选）：

```shell
$ sudo apt-get install libqrencode-dev
```

**注：发行版是使用 GCC 构建然后使用“strip bitcoind”去掉调试符号，该操作可减少可执行文件大小约 90%。**

## 额外的配置选项

使用下面命令显示额外的配置选项列表（内容过多这里省略）：

```shell
$ ./configure --help
```

## 特殊构建

**可编译得到类似于官方发布的可执行文件。**

通过 configure 定制 Makefile，以构建源码得到便于移植（体积小且为静态即不需要依赖库）的 bitcoind、bitcoin-cli、bitcoin-qt 等可执行文件。

首先，安装基本依赖：

```shell
$ sudo apt install build-essential libtool autotools-dev automake pkg-config bsdmainutils curl
```

**注：比特币 v0.12.1 源码需先修改 Qt 包源路径，查看[交叉编译比特币源码](/blog/2018/09/cross-compile-bitcoin.html#Qt-ref)。**

```shell
$ cd depends
$ make # 这一步会使用 curl 下载并编译相关依赖，确保网络畅通，若某个依赖包请求失败，可多尝试几次，注：miniupnpc 包所在网址可能需要科学上网
$ cd ..
$ ./autogen.sh # 若是首次构建，先生成 configure
$ ./configure --prefix=`pwd`/depends/x86_64-pc-linux-gnu --enable-glibc-back-compat LDFLAGS="-static-libstdc++" # 使用指定位置的依赖安装独立于目录结构的文件，开启 glibc 的向后兼容并使用静态链接选项
$ make # 若构建过，则先执行 make clean 进行清理
```

configure 用到的额外的配置选项：

> * --prefix=PREFIX，使用 PREFIX 中的依赖安装独立于体系结构的文件，默认为 /usr/local
> * --enable-glibc-back-compat，启用使用 glibc 的向后兼容
> * LDFLAGS，链接器标志，例如，如果库位于非标准目录 \<lib dir> 时，使用 -L \<lib dir>

## 参考链接

* [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin){:target="_blank"}
* [Bitcoin Core :: Bitcoin](https://bitcoincore.org){:target="_blank"}
* [bitcoin/build-osx.md at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-osx.md){:target="_blank"}
* [bitcoin/build-unix.md at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-unix.md){:target="_blank"}
* [qt@5.5 fails to configure on MacOS Mojave 10.14 · Issue #32467 · Homebrew/homebrew-core · GitHub](https://github.com/Homebrew/homebrew-core/issues/32467){:target="_blank"}
* [qt@5.5: delete by fxcoudert · Pull Request #32565 · Homebrew/homebrew-core · GitHub](https://github.com/Homebrew/homebrew-core/pull/32565){:target="_blank"}
* [How to compile a static binary bitcoind in Ubuntu · Issue #3781 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/issues/3781){:target="_blank"}
* [How to compile static version bitcoind?](https://bitcointalk.org/index.php?topic=1636271.0){:target="_blank"}
