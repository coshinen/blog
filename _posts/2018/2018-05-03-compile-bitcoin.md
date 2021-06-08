---
layout: post
title:  "编译比特币源码"
date:   2018-05-03 18:57:36 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin Build
---
在 macOS、UNIX/Linux 平台下构建比特币源码，得到可执行文件 `bitcoind`、`bitcoin-cli`、`bitcoin-qt` 等。

## 1. 获取源码

比特币源码早期托管在 SourceForge 上，目前托管在 GitHub 上。

```shell
$ git clone https://github.com/bitcoin/bitcoin.git
$ cd bitcoin
$ git checkout v0.12.1 # 切换到 v0.12.1
$ git status
HEAD detached at v0.12.1
nothing to commit, working directory clean
```

## 2. 内存需求

C++ 编译器较吃内存。
推荐编译比特币核心时至少有 1GB 的空闲内存。
由于内存交换，使用 512MB 或更少的内存编译将花费更长的时间。

## 3. 依赖构建指南：macOS & Ubuntu

### 3.1. macOSX

```shell
$ brew install automake berkeley-db4 libtool boost@1.59 miniupnpc openssl pkg-config protobuf python qt libevent qrencode
```

Homebrew 默认安装指定库的最新版本。

比特币 v0.12.1 对应的 boost 库的版本为 1.59.0。
可以从 [bitcoin/depends/packages/boost.mk](https://github.com/bitcoin/bitcoin/blob/v0.12.1/depends/packages/boost.mk) 中获取当前版本比特币对应的 boost 库的版本。

### 3.2. Ubuntu 16.04.\*

构建必备：

```shell
$ sudo apt-get install build-essential libtool autotools-dev automake pkg-config libssl-dev libevent-dev bsdmainutils python3
```

Boost 库：

```shell
$ sudo apt-get install libboost-system-dev libboost-filesystem-dev libboost-chrono-dev libboost-program-options-dev libboost-test-dev libboost-thread-dev
```

如果不管用，可以安装所有的 boost 开发包：

```shell
$ sudo apt-get install libboost-all-dev
```

ubuntu 16.04.\* 默认安装 boost 库的版本为 1.58.0，可满足比特币 v0.12.1 对 boost 库的需求。

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

GUI 依赖（Qt5 图形库，若不使用图形化界面可省略此步，减少构建时间）：

```shell
$ sudo apt-get install libqt5gui5 libqt5core5a libqt5dbus5 qttools5-dev qttools5-dev-tools libprotobuf-dev protobuf-compiler
```

libqrencode 二维码生成库（可选）：

```shell
$ sudo apt-get install libqrencode-dev
```

## 4. 笔记

发行版是使用 GCC 构建然后使用 `"strip bitcoind"` 去掉调试符号，该操作可减少可执行文件大小约 90%。

## 5. 额外的配置选项

使用下面命令显示详细的配置选项列表。

```shell
$ ./configure --help
```

## 6. 构建（编译和安装）

在构建源码前，请确保安装了相关的依赖库。

```shell
$ ./autogen.sh # 生成 configure
$ ./configure # 配置生成 Makefile，例：关闭钱包功能，使用静态库链接得到移植后不依赖库文件的可执行文件，指定 boost 库路径等
$ make # 使用 Makefile 进行比特币源码的编译，编译完成后会生成 4 至 6 个 ELF，分别为 bitcoind、bitcoin-cli、bitcoin-tx、test_bitcoin，若安装了 Qt 图形库，则会增加 bitcoin-qt、test_bitcoin-qt
$ make install # 该项可选，把编译好的比特币程序拷贝到系统默认的可执行程序目录 /usr/local/bin 下
```

**macOS Mojave 无法构建比特币 v0.12.1 的可执行文件 `bitcoin-qt`，因为 macOS Mojave 不支持比特币 v0.12.1 对应的 qt5.5 的构建。**

## 7. 特殊构建

可得到类似于官方发布的可执行文件。

通过 `configure` 定制 Makefile，以构建源码得到便于移植（体积小且静态即不需要依赖库）的可执行文件 `bitcoind`、`bitcoin-cli`、`bitcoin-qt` 等。

额外的配置选项：

```shell
  --prefix=PREFIX
  使用 PREFIX 中的依赖安装独立于体系结构的文件，默认为 /usr/local
  --enable-glibc-back-compat
  启用使用 glibc 的向后兼容
  LDFLAGS
  链接器标志，例如，库位于非标准目录 <lib dir>，使用 -L <lib dir>
```

先安装基本依赖：

```shell
$ sudo apt install build-essential libtool autotools-dev automake pkg-config bsdmainutils curl
```

**比特币 v0.12.1 源码需先修改 Qt 包源路径，查看[交叉编译比特币源码](/blog/2018/09/cross-compile-bitcoin.html)。**

```shell
$ cd depends
$ make # 这一步会使用 curl 下载并编译相关依赖，确保网络畅通，若某个依赖包请求失败，可多尝试几次，注：miniupnpc 包所在网址可能需要科学上网
$ cd ..
$ ./autogen.sh # 若是首次构建，先生成 configure
$ ./configure --prefix=`pwd`/depends/x86_64-pc-linux-gnu --enable-glibc-back-compat LDFLAGS="-static-libstdc++" # 使用指定位置的依赖安装独立于目录结构的文件，开启 glibc 的向后兼容并使用静态链接选项
$ make # 若构建过，则先执行 make clean 进行清理
```

## 参考链接

* [bitcoin/bitcoin: Bitcoin Core integration/staging tree](https://github.com/bitcoin/bitcoin){:target="_blank"}
* [bitcoin/build-osx.md at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-osx.md){:target="_blank"}
* [bitcoin/build-unix.md at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-unix.md){:target="_blank"}
* [qt@5.5 fails to configure on MacOS Mojave 10.14 · Issue #32467 · Homebrew/homebrew-core · GitHub](https://github.com/Homebrew/homebrew-core/issues/32467){:target="_blank"}
* [qt@5.5: delete by fxcoudert · Pull Request #32565 · Homebrew/homebrew-core · GitHub](https://github.com/Homebrew/homebrew-core/pull/32565){:target="_blank"}
* [How to compile a static binary bitcoind in Ubuntu · Issue #3781 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/issues/3781){:target="_blank"}
* [How to compile static version bitcoind?](https://bitcointalk.org/index.php?topic=1636271.0){:target="_blank"}
