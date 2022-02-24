---
layout: post
title:  "比特币数据目录"
date:   2018-10-06 09:28:37 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin
---
比特币数据目录是存放数据文件的位置，包含区块和钱包等数据。

## 1. 默认位置

数据目录的默认存放位置与操作系统相关，下面列出 3 种常用的操作系统中比特币数据目录的默认位置。

### 1.1. Windows

> C:\Users\Username\AppData\Roaming\Bitcoin (Vista, 7, 8 and 10)
> 
> C:\Documents and Settings\Username\Application Data\Bitcoin (XP)

目录 `AppData` 和 `Application Data` 默认是隐藏的。

也可以使用参数 `-datadir` 把比特币数据目录存储到指定位置。

例如：存储到目录 `D:\BitcoinData`。

在 `bitcoin-qt.exe` 快捷方式、属性、目标后面添加字符串 `-datadir=D:\BitcoinData`，用空格作为分隔符，具体如下：

> "C:\Program Files (x86)\Bitcoin\bitcoin-qt.exe" -datadir=D:\BitcoinData

### 1.2. macOSX

> ~/Library/Application Support/Bitcoin

### 1.3. UNIX/Linux

> ~/.bitcoin

## 2. 源码剖析

数据目录的默认位置硬编在源码文件 `util.cpp` 中的函数 `GetDefaultDataDir()` 里。

```cpp
boost::filesystem::path GetDefaultDataDir()
{
    namespace fs = boost::filesystem;
    // Windows < Vista: C:\Documents and Settings\Username\Application Data\Bitcoin
    // Windows >= Vista: C:\Users\Username\AppData\Roaming\Bitcoin
    // Mac: ~/Library/Application Support/Bitcoin
    // Unix: ~/.bitcoin
#ifdef WIN32
    // Windows
    return GetSpecialFolderPath(CSIDL_APPDATA) / "Bitcoin";
#else
    fs::path pathRet;
    char* pszHome = getenv("HOME");
    if (pszHome == NULL || strlen(pszHome) == 0)
        pathRet = fs::path("/");
    else
        pathRet = fs::path(pszHome);
#ifdef MAC_OSX
    // Mac
    pathRet /= "Library/Application Support";
    TryCreateDirectory(pathRet);
    return pathRet / "Bitcoin";
#else
    // Unix
    return pathRet / ".bitcoin";
#endif
#endif
}
```

## 3. 数据文件

* `banlist.dat`：存储禁用节点的 IPs/子网
* `bitcoin.conf`：包含用于 `bitcoind` 或 `bitcoin-qt` 的[配置选项](/blog/2018/05/running-bitcoin.html)
* `bitcoind.pid`：存储 `bitcoind` 运行时的进程号
* `blocks/blk000??.dat`：区块数据（定制，每个文件 128 MiB）；从 0.8.0 开始（格式从 pre-0.8 改变）
* `blocks/rev000??.dat`：区块回滚数据（定制）；从 0.8.0 开始
* `blocks/index/*`：区块索引（LevelDB）；从 0.8.0 开始
* `chainstate/*`：区块链状态数据库（LevelDB）；从 0.8.0 开始
* `database/*`：BDB 数据库环境；从 0.8.0 开始仅用于钱包
* `db.log`：钱包数据库日志文件
* `debug.log`：包含通过 `bitcoind` 或 `bitcoin-qt` 生成的调试信息和常规日志
* `fee_estimates.dat`：存储用于估计确认数所需的最小交易费和优先级的统计数据；从 0.10.0 开始
* `peers.dat`：对端 IP 地址数据库；从 0.7.0 开始仅用于钱包
* `wallet.dat`：包含密钥和交易的个人钱包（BDB）
* `.cookie`：会话 RPC 验证 cookie（开始使用 cookie 验证时写入，关闭时删除）；从 0.12.0 开始仅用于钱包
* `onion_private_key`：使用 `-listenonion` 缓存的洋葱路由隐藏服务私钥；从 0.12.0 开始仅用于钱包

#### 仅用于 pre-0.8.0

* `blktree/`：区块链索引（LevelDB）；从 pre-0.8 开始，0.8.0 中用 `block/index/` 替代
* `coins/`：未花费的交易输出数据库（LevelDB）；从 pre-0.8 开始，0.8.0 中用 `chainstate/` 替代

#### 仅用于 0.8.0 之前

* `blkindex.dat`：区块链索引数据库（BDB）；0.8.0 中用 {`chainstate/`, `blocks/index/`, `blocks/rev000??.dat`} 替代
* `blk000?.dat`：区块数据（定制，每个文件 2 GiB）；0.8.0 中用 `blocks/blk000??.dat` 替代

#### 仅用于 0.7.0 之前

* `addr.dat`：对端 IP 地址数据库（BDB）；0.7.0 中用 `peers.dat` 替代

## 4. 可转移性

“区块（blocks）”和“链状态（chainstate）”目录中的数据库文件是**跨平台的**，可以在不同的平台间进行复制安装。
这些文件统称为节点的“区块数据库”，表示节点在同步过程中下载的所有信息。
换句话说，如果将 A 节点数据目录的区块数据库复制到 B 节点的数据目录，B 节点将具有与 A 节点一样的同步百分比。
这通常比再次进行普通初始化同步快得多。
但是，当你以这种方式复制某人的数据库，你必须**绝对信任**他。
比特币核心将其区块数据库文件当作 100% 准确且值得信赖，而在正常初始化同步期间，它将对端提供的每个区块视为无效，直到另有证明为止。
如果攻击者能够修改你的区块数据文件，那么他们可以做各种导致你丢失比特币的邪恶事件。

每个节点都有一个唯一的区块数据库，并且所有文件都是高可连接的。
所以，如果你把一个数据目录中的“区块（blocks）”或“链状态（chainstate）”目录中的几个文件复制到另一个数据目录中，这几乎肯定会导致第二个节点崩溃或在未来的某个随机点卡住。
如果你想把区块数据库从一个数据目录复制到另一个数据目录，必须删除旧数据库并一次复制全部文件。
复制时必须关闭两个节点。

## 参考链接

* [Data directory - Bitcoin Wiki](https://en.bitcoin.it/wiki/Data_directory){:target="_blank"}
* [bitcoin/util.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/util.cpp){:target="_blank"}
* [bitcoin/files.md at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/doc/files.md){:target="_blank"}
