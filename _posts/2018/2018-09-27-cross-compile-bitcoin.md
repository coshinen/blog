---
layout: post
title:  "交叉编译比特币源码"
date:   2018-09-27 11:01:52 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin src-build Cross-compilation
---
在 UNIX/Linux 平台下交叉编译比特币源码，得到 Windows 下的可执行文件 `bitcoin.exe`、`bitcoin-cli.exe`、`bitcoin-qt.exe` 等。

## 1. 获取源码（Ubuntu 18.04.1）

以比特币 v0.12.1 为例，进行交叉编译。

```shell
$ git clone https://github.com/bitcoin/bitcoin.git # 克隆最新版的比特币源码到本地。
$ cd bitcoin # 进入比特币项目根目录。
$ git checkout v0.12.1 # 在当前分支上切换至 tag 为 v0.12.1 的版本，或省略来编译最新版。
$ git status # 查看当前状态（这里会显示版本信息）。
HEAD detached at v0.12.1
nothing to commit, working directory clean
```

## 2. 修改 v0.12.1 源码 Qt 包源路径

```shell
$ vim depends/packages/qt.mk # Line 3: 把 official_releases 改为 archive，其他不变
```

第 3 行内容变化如下：

```shell
-$(package)_download_path=http://download.qt.io/official_releases/qt/5.5/$($(package)_version)/submodules
+$(package)_download_path=http://download.qt.io/archive/qt/5.5/$($(package)_version)/submodules
```

## 3. 安装基本依赖

```shell
$ sudo apt update
$ sudo apt upgrade
$ sudo apt install build-essential libtool autotools-dev automake pkg-config bsdmainutils curl git
```

主机工具链（build-essential）是必需的，因为某些依赖包（例如：protobuf）需要构建用于构建过程中的主机实用程序。

## 4. 构建 Windows 64 位版

### 4.1. 安装 mingw-w64 交叉编译工具链

```shell
$ sudo apt install g++-mingw-w64-x86-64
```

对于 Ubuntu 18.04，设置默认的 mingw32 g++ 编译器选项为 posix，对应的序号为 1。

```shell
$ sudo update-alternatives --config x86_64-w64-mingw32-g++ # Set the default mingw32 g++ compiler option to posix.
There are 2 choices for the alternative x86_64-w64-mingw32-g++ (providing /usr/bin/x86_64-w64-mingw32-g++).

  Selection    Path                                   Priority   Status
------------------------------------------------------------
* 0            /usr/bin/x86_64-w64-mingw32-g++-win32   60        auto mode
  1            /usr/bin/x86_64-w64-mingw32-g++-posix   30        manual mode
  2            /usr/bin/x86_64-w64-mingw32-g++-win32   60        manual mode

Press <enter> to keep the current choice[*], or type selection number: 1 # 输入 1 后按回车完成设置
```

再次使用该命令，查看是否设置成功。

```shell
$ sudo update-alternatives --config x86_64-w64-mingw32-g++ # Set the default mingw32 g++ compiler option to posix.
There are 2 choices for the alternative x86_64-w64-mingw32-g++ (providing /usr/bin/x86_64-w64-mingw32-g++).

  Selection    Path                                   Priority   Status
------------------------------------------------------------
  0            /usr/bin/x86_64-w64-mingw32-g++-win32   60        auto mode
* 1            /usr/bin/x86_64-w64-mingw32-g++-posix   30        manual mode
  2            /usr/bin/x86_64-w64-mingw32-g++-win32   60        manual mode

Press <enter> to keep the current choice[*], or type selection number: # 直接按回车即可
```

### 4.2. 构建

```shell
$ cd depends
$ make HOST=x86_64-w64-mingw32 -j4 # 这一步会使用 curl 下载并编译相关依赖，确保网络畅通，若某个依赖包请求失败，可多尝试几次，注：miniupnpc 包所在网址可能需要科学上网
$ cd ..
$ ./autogen.sh # 若是首次构建，先生成 configure
$ ./configure --prefix=`pwd`/depends/x86_64-w64-mingw32 # 使用指定位置的依赖安装独立于目录结构的文件
$ make # 若构建过非 Windows 版的程序，则先执行 make clean 进行清理
```

## 参考链接

* [bitcoin/bitcoin: Bitcoin Core integration/staging tree](https://github.com/bitcoin/bitcoin){:target="_blank"}
* [bitcoin/build-windows.md at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-windows.md){:target="_blank"}
* [Error during build 0.12 · Issue #9629 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/issues/9629){:target="_blank"}
