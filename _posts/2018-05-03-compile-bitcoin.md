---
layout: post
title:  "编译比特币源码"
date:   2018-05-03 18:57:36 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码构建
---
本文记录了如何在 macOS、Unix/Linux 平台下构建比特币源码，得到相应版本的 bitcoind、bitcoin-cli、bitcoin-qt 等可执行文件。

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

## 内存需求

C++ 编译器较吃内存。推荐在编译比特币核心时至少有 1.5GB 的空闲内存。在内存较小系统上，可以使用附加的 CXXFLAGS 选项对 gcc 进行调优以节省内存。

{% highlight shell %}
$ ./configure CXXFLAGS="--param ggc-min-expand=1 --param gcc-min-heapsize=32768"
{% endhighlight %}

## 依赖

**在构建源码之前，应该先安装相关的依赖库。**

### macOS Mojave 下的相关依赖

{% highlight shell %}
$ brew install automake berkeley-db4 libtool boost@1.59 miniupnpc openssl pkg-config protobuf python qt libevent qrencode
{% endhighlight %}

brew 默认安装指定库的最新版本，可以使用命令`$ brew search <libname>`查看指定库的所有版本。
**bitcoin v0.12.1 对应的 boost 库的版本为1.59.0，可以从 [bitcoin/depends/packages/boost.mk](https://github.com/bitcoin/bitcoin/blob/v0.12.1/depends/packages/boost.mk) 中获取当前版本比特币对应的 boost 库的版本。**

### Ubuntu 16.04.4 下的相关依赖

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

## 构建（编译和安装）

{% highlight shell %}
$ ./autogen.sh
$ ./configure # 定制并生成 Makefile，例：关闭钱包功能，使用静态库链接得到移植后不依赖库文件的可执行文件等。
$ make # 使用 Makefile 进行比特币源码的编译，编译完成后会生成 4 至 6 个 ELF 程序，分别为 bitcoind、bitcoin-cli、bitcoin-tx、test_bitcoin，若安装了 Qt 图形库，则会增加 bitcoin-qt、test_bitcoin-qt。
$ make install # 该项可选，把编译好的比特币程序拷贝到系统默认的可执行程序目录 /usr/local/bin 下。
{% endhighlight %}

**注：macOS Mojave 无法构建 bitcoin v0.12.1 的可执行文件 bitcoin-qt，因为 macOS Mojave 不支持 bitcoin v0.12.1 对应的 qt5.5 的构建。**

<details>
<summary>额外的配置选项 configure v0.12.1</summary>
{% highlight shell %}
$ ./configure --help
`configure' configures Bitcoin Core 0.12.1 to adapt to many kinds of systems.

Usage: ./configure [OPTION]... [VAR=VALUE]...

To assign environment variables (e.g., CC, CFLAGS...), specify them as
VAR=VALUE.  See below for descriptions of some of the useful variables.

Defaults for the options are specified in brackets.

Configuration:
  -h, --help              display this help and exit
      --help=short        display options specific to this package
      --help=recursive    display the short help of all the included packages
  -V, --version           display version information and exit
  -q, --quiet, --silent   do not print `checking ...' messages
      --cache-file=FILE   cache test results in FILE [disabled]
  -C, --config-cache      alias for `--cache-file=config.cache'
  -n, --no-create         do not create output files
      --srcdir=DIR        find the sources in DIR [configure dir or `..']

Installation directories:
  --prefix=PREFIX         install architecture-independent files in PREFIX
                          [/usr/local]
  --exec-prefix=EPREFIX   install architecture-dependent files in EPREFIX
                          [PREFIX]

By default, `make install' will install all the files in
`/usr/local/bin', `/usr/local/lib' etc.  You can specify
an installation prefix other than `/usr/local' using `--prefix',
for instance `--prefix=$HOME'.

For better control, use the options below.

Fine tuning of the installation directories:
  --bindir=DIR            user executables [EPREFIX/bin]
  --sbindir=DIR           system admin executables [EPREFIX/sbin]
  --libexecdir=DIR        program executables [EPREFIX/libexec]
  --sysconfdir=DIR        read-only single-machine data [PREFIX/etc]
  --sharedstatedir=DIR    modifiable architecture-independent data [PREFIX/com]
  --localstatedir=DIR     modifiable single-machine data [PREFIX/var]
  --libdir=DIR            object code libraries [EPREFIX/lib]
  --includedir=DIR        C header files [PREFIX/include]
  --oldincludedir=DIR     C header files for non-gcc [/usr/include]
  --datarootdir=DIR       read-only arch.-independent data root [PREFIX/share]
  --datadir=DIR           read-only architecture-independent data [DATAROOTDIR]
  --infodir=DIR           info documentation [DATAROOTDIR/info]
  --localedir=DIR         locale-dependent data [DATAROOTDIR/locale]
  --mandir=DIR            man documentation [DATAROOTDIR/man]
  --docdir=DIR            documentation root [DATAROOTDIR/doc/bitcoin]
  --htmldir=DIR           html documentation [DOCDIR]
  --dvidir=DIR            dvi documentation [DOCDIR]
  --pdfdir=DIR            pdf documentation [DOCDIR]
  --psdir=DIR             ps documentation [DOCDIR]

Program names:
  --program-prefix=PREFIX            prepend PREFIX to installed program names
  --program-suffix=SUFFIX            append SUFFIX to installed program names
  --program-transform-name=PROGRAM   run sed PROGRAM on installed program names

System types:
  --build=BUILD     configure for building on BUILD [guessed]
  --host=HOST       cross-compile to build programs to run on HOST [BUILD]

Optional Features:
  --disable-option-checking  ignore unrecognized --enable/--with options
  --disable-FEATURE       do not include FEATURE (same as --enable-FEATURE=no)
  --enable-FEATURE[=ARG]  include FEATURE [ARG=yes]
  --enable-silent-rules   less verbose build output (undo: "make V=1")
  --disable-silent-rules  verbose build output (undo: "make V=0")
  --disable-maintainer-mode
                          disable make rules and dependencies not useful (and
                          sometimes confusing) to the casual installer
  --enable-dependency-tracking
                          do not reject slow dependency extractors
  --disable-dependency-tracking
                          speeds up one-time build
  --enable-shared[=PKGS]  build shared libraries [default=yes]
  --enable-static[=PKGS]  build static libraries [default=yes]
  --enable-fast-install[=PKGS]
                          optimize for fast installation [default=yes]
  --disable-libtool-lock  avoid locking (might break parallel builds)
  --disable-wallet        disable wallet (enabled by default)
  --enable-upnp-default   if UPNP is enabled, turn it on at startup (default
                          is no)
  --disable-tests         do not compile tests (default is to compile)
  --disable-gui-tests     do not compile GUI tests (default is to compile if
                          GUI and tests enabled)
  --disable-bench         do not compile benchmarks (default is to compile)
  --enable-comparison-tool-reorg-tests
                          enable expensive reorg tests in the comparison tool
                          (default no)
  --enable-extended-rpc-tests
                          enable expensive RPC tests when using lcov (default
                          no)
  --disable-hardening     do not attempt to harden the resulting executables
                          (default is to harden)
  --enable-reduce-exports attempt to reduce exported symbols in the resulting
                          executables (default is no)
  --disable-ccache        do not use ccache for building (default is to use if
                          found)
  --enable-lcov           enable lcov testing (default is no)
  --enable-glibc-back-compat
                          enable backwards compatibility with glibc
  --disable-zmq           disable ZMQ notifications
  --enable-debug          use debug compiler flags and macros (default is no)
  --disable-largefile     omit support for large files

Optional Packages:
  --with-PACKAGE[=ARG]    use PACKAGE [ARG=yes]
  --without-PACKAGE       do not use PACKAGE (same as --with-PACKAGE=no)
  --with-pic[=PKGS]       try to use only PIC/non-PIC objects [default=use
                          both]
  --with-aix-soname=aix|svr4|both
                          shared library versioning (aka "SONAME") variant to
                          provide on AIX, [default=aix].
  --with-gnu-ld           assume the C compiler uses GNU ld [default=no]
  --with-sysroot[=DIR]    Search for dependent libraries within DIR (or the
                          compiler's sysroot if not specified).
  --with-miniupnpc        enable UPNP (default is yes if libminiupnpc is
                          found)
  --with-comparison-tool  path to java comparison tool (requires
                          --enable-tests)
  --with-qrencode         enable QR code support (default is yes if qt is
                          enabled and libqrencode is found)
  --with-protoc-bindir=BIN_DIR
                          specify protoc bin path
  --with-utils            build bitcoin-cli bitcoin-tx (default=yes)
  --with-libs             build libraries (default=yes)
  --with-daemon           build bitcoind daemon (default=yes)
  --with-incompatible-bdb allow using a bdb version other than 4.8
  --with-gui[=no|qt4|qt5|auto]
                          build bitcoin-qt GUI (default=auto, qt5 tried first)
  --with-qt-incdir=INC_DIR
                          specify qt include path (overridden by pkgconfig)
  --with-qt-libdir=LIB_DIR
                          specify qt lib path (overridden by pkgconfig)
  --with-qt-plugindir=PLUGIN_DIR
                          specify qt plugin path (overridden by pkgconfig)
  --with-qt-translationdir=PLUGIN_DIR
                          specify qt translation path (overridden by
                          pkgconfig)
  --with-qt-bindir=BIN_DIR
                          specify qt bin path
  --with-qtdbus           enable DBus support (default is yes if qt is enabled
                          and QtDBus is found)
  --with-boost[=ARG]      use Boost library from a standard location
                          (ARG=yes), from the specified location (ARG=<path>),
                          or disable it (ARG=no) [ARG=yes]
  --with-boost-libdir=LIB_DIR
                          Force given directory for boost libraries. Note that
                          this will override library path detection, so use
                          this parameter only if default library detection
                          fails and you know exactly where your boost
                          libraries are located.
  --with-boost-system[=special-lib]
                          use the System library from boost - it is possible
                          to specify a certain library for the linker e.g.
                          --with-boost-system=boost_system-gcc-mt
  --with-boost-filesystem[=special-lib]
                          use the Filesystem library from boost - it is
                          possible to specify a certain library for the linker
                          e.g. --with-boost-filesystem=boost_filesystem-gcc-mt
  --with-boost-program-options[=special-lib]
                          use the program options library from boost - it is
                          possible to specify a certain library for the linker
                          e.g.
                          --with-boost-program-options=boost_program_options-gcc-mt-1_33_1
  --with-boost-thread[=special-lib]
                          use the Thread library from boost - it is possible
                          to specify a certain library for the linker e.g.
                          --with-boost-thread=boost_thread-gcc-mt
  --with-boost-chrono[=special-lib]
                          use the Chrono library from boost - it is possible
                          to specify a certain library for the linker e.g.
                          --with-boost-chrono=boost_chrono-gcc-mt
  --with-boost-unit-test-framework[=special-lib]
                          use the Unit_Test_Framework library from boost - it
                          is possible to specify a certain library for the
                          linker e.g.
                          --with-boost-unit-test-framework=boost_unit_test_framework-gcc

Some influential environment variables:
  CXX         C++ compiler command
  CXXFLAGS    C++ compiler flags
  LDFLAGS     linker flags, e.g. -L<lib dir> if you have libraries in a
              nonstandard directory <lib dir>
  LIBS        libraries to pass to the linker, e.g. -l<library>
  CPPFLAGS    (Objective) C/C++ preprocessor flags, e.g. -I<include dir> if
              you have headers in a nonstandard directory <include dir>
  OBJCXX      Objective C++ compiler command
  OBJCXXFLAGS Objective C++ compiler flags
  CC          C compiler command
  CFLAGS      C compiler flags
  LT_SYS_LIBRARY_PATH
              User-defined run-time library search path.
  CPP         C preprocessor
  CXXCPP      C++ preprocessor
  PKG_CONFIG  path to pkg-config utility
  PKG_CONFIG_PATH
              directories to add to pkg-config's search path
  PKG_CONFIG_LIBDIR
              path overriding pkg-config's built-in search path
  QT_CFLAGS   C compiler flags for QT, overriding pkg-config
  QT_LIBS     linker flags for QT, overriding pkg-config
  QT_TEST_CFLAGS
              C compiler flags for QT_TEST, overriding pkg-config
  QT_TEST_LIBS
              linker flags for QT_TEST, overriding pkg-config
  QT_DBUS_CFLAGS
              C compiler flags for QT_DBUS, overriding pkg-config
  QT_DBUS_LIBS
              linker flags for QT_DBUS, overriding pkg-config
  QTPLATFORM_CFLAGS
              C compiler flags for QTPLATFORM, overriding pkg-config
  QTPLATFORM_LIBS
              linker flags for QTPLATFORM, overriding pkg-config
  X11XCB_CFLAGS
              C compiler flags for X11XCB, overriding pkg-config
  X11XCB_LIBS linker flags for X11XCB, overriding pkg-config
  QTXCBQPA_CFLAGS
              C compiler flags for QTXCBQPA, overriding pkg-config
  QTXCBQPA_LIBS
              linker flags for QTXCBQPA, overriding pkg-config
  QTPRINT_CFLAGS
              C compiler flags for QTPRINT, overriding pkg-config
  QTPRINT_LIBS
              linker flags for QTPRINT, overriding pkg-config
  SSL_CFLAGS  C compiler flags for SSL, overriding pkg-config
  SSL_LIBS    linker flags for SSL, overriding pkg-config
  CRYPTO_CFLAGS
              C compiler flags for CRYPTO, overriding pkg-config
  CRYPTO_LIBS linker flags for CRYPTO, overriding pkg-config
  PROTOBUF_CFLAGS
              C compiler flags for PROTOBUF, overriding pkg-config
  PROTOBUF_LIBS
              linker flags for PROTOBUF, overriding pkg-config
  QR_CFLAGS   C compiler flags for QR, overriding pkg-config
  QR_LIBS     linker flags for QR, overriding pkg-config
  EVENT_CFLAGS
              C compiler flags for EVENT, overriding pkg-config
  EVENT_LIBS  linker flags for EVENT, overriding pkg-config
  EVENT_PTHREADS_CFLAGS
              C compiler flags for EVENT_PTHREADS, overriding pkg-config
  EVENT_PTHREADS_LIBS
              linker flags for EVENT_PTHREADS, overriding pkg-config
  ZMQ_CFLAGS  C compiler flags for ZMQ, overriding pkg-config
  ZMQ_LIBS    linker flags for ZMQ, overriding pkg-config

Use these variables to override the choices made by `configure' or to help
it to find libraries and programs with nonstandard names/locations.

Report bugs to <https://github.com/bitcoin/bitcoin/issues>.
{% endhighlight %}
</details>

Thanks for your time.

## 参照
* [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin)
* [bitcoin/build-osx.md at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-osx.md)
* [bitcoin/build-unix.md at v0.12.1 · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/build-unix.md)
* [qt@5.5 fails to configure on MacOS Mojave 10.14 · Issue #32467 · Homebrew/homebrew-core · GitHub](https://github.com/Homebrew/homebrew-core/issues/32467)
* [qt@5.5: delete by fxcoudert · Pull Request #32565 · Homebrew/homebrew-core · GitHub](https://github.com/Homebrew/homebrew-core/pull/32565)
* [...](https://github.com/mistydew/blockchain)
