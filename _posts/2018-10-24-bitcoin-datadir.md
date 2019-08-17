---
layout: post
title:  "比特币数据目录"
date:   2018-10-24 09:28:37 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin Translation
tags: 区块链 比特币 数据目录 译文
---
数据目录是存放比特币数据文件的位置，包含区块数据和钱包数据等相关文件。

## 默认位置

默认位置与操作系统相关，下面列出 3 种常用操作系统下比特币数据目录的默认存放位置：

### macOSX

> ~/Library/Application Support/Bitcoin

### UNIX/Linux

> ~/.bitcoin

### Windows

> C:\Documents and Settings\Username\Application Data\Bitcoin (XP)
>
> C:\Users\Username\AppData\Roaming\Bitcoin (Vista, 7, 8 and 10)

目录“AppData”和“Application data”默认是隐藏的。

你也可以存储比特币数据目录到任何驱动器或文件。

如果你想存储到指定目录 D:\BitcoinData 中，点击 bitcoin-qt.exe 快捷方式的属性，在目标后面添加字符串“-datadir=D:\BitcoinData”，如下：

> "C:\Program Files (x86)\Bitcoin\bitcoin-qt.ext" -datadir=D:\BitcoinData

启动比特币，现在你将看到所有的文件都在新的数据目录中创建。

## 源码剖析

数据目录默认的位置硬编在源码“util.cpp”文件的 GetDefaultDataDir() 函数中。

{% highlight C++ %}
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
#else // UNIX/Linux
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
{% endhighlight %}

## 目录结构/层级

比特币版本号：v0.12.1

> * bitcoin.conf
> * /blocks/
>   * blk00000.dat
>   * index/
>     * 000003.log
>     * CURRENT
>     * LOCK
>     * LOG
>     * MANIFEST-000002
>   * rev00000.dat
> * /chainstate/
>   * 000003.log
>   * CURRENT
>   * LOCK
>   * LOG
>   * MANIFEST-000002
> * db.log
> * debug.log
> * fee_estimates.dat
> * peers.dat
> * wallet.dat

## 目录内容

### 文件

比特币核心文档 [file.md](https://github.com/bitcoin/bitcoin/blob/master/doc/files.md){:target="_blank"} 内容总览。

> * .cookie【v0.12.0 及之后的版本】
>   * 会话 RPC 验证 cookie（当首次使用 cookie 验证时写入，在关闭时删除）。
> * .lock
>   * 比特币数据目录锁文件。
> * banlist.dat
>   * 存储禁用节点的 IPs/子网。
> * bitcoin.conf【可选】
>   * 包含用于 bitcoind 或 bitcoin-qt 的[配置选项](/blog/2018/05/running-bitcoin.html)。
> * bitcoind.pid
>   * 存储 bitcoind 运行时的进程号。
> * blocks/blk000??.dat【v0.8.0 及之后的版本】; blkxxxx.dat【v0.8.0 之前的版本】
>   * 区块数据（定制，每个文件 128MiB）；包含链接的原始区块。存储的是真正的比特币区块，以网络格式，转储到硬盘上。
> * blocks/rev000??.dat【v0.8.0 及之后的版本】
>   * 区块回退数据（定制）。
> * blocks/index/*【v0.8.0 及之后的版本】; blkindex.dat【v0.8.0 之前的版本】
>   * 区块索引（LevelDB）；与 blkxxxx.dat 一起使用的索引信息。
> * chainstate/*【v0.8.0 及之后的版本】
>   * 区块链状态数据库（LevelDB）。
> * database/*【v0.8.0 及之后的版本】;【v0.16.0 及之后的版本】
>   * BDB（Berkeley DB）数据库环境，仅用于钱包；移动到 wallets/ 目录下。
> * db.log【v0.16.0 及之后的版本】
>   * 钱包数据库日志文件，移动到 wallets/ 目录下。
> * debug.log
>   * 比特币详细的日志文件，包含通过 bitcoind 或 bitcoin-qt 生成的调试信息和日志信息。不时自动修剪。
> * fee_estimates.dat【v0.10.0 及之后的版本】
>   * 存储用于确认所必需的估算的最小交易费和优先级的统计数据。在程序关闭之前保存，并在启动时读入。
> * indexes/txindex/*【v0.17.0 及之后的版本】
>   * 可选的交易索引数据库（LevelDB）。
> * mempool.dat【v0.14.0 及之后的版本】
>   * 内存池交易的导出数据。
> * peers.dat【v0.7.0 及之后的版本】; addr.dat【v0.7.0 之前的版本】
>   * 对端 IP 地址数据库（特定的格式）。存储对端信息以便更容易重连。该文件使用比特币指定的文件格式，与任何数据库系统不相关；存储 ip 地址以便更容易重新连接。
> * wallets/wallet.dat【v0.16.0 及之后的版本】; wallet.dat
>   * 包含密钥和交易的个人钱包（BDB）；存储密钥，交易，元数据和选项。**请务必备份该文件。它包含花费你的比特币所必须的密钥。**
> * wallets/database/*【v0.16.0 及之后的版本】
>   * BDB 数据库环境。
> * wallets/db.log【v0.16.0 及之后的版本】
>   * 钱包数据库日志文件。
> * onion_private_key【v0.12.0 及之后的版本】
>   * 使用 -listenonion 选项缓存的洋葱路由隐藏服务私钥。
> * guisettings.ini.bak
>   * 使用 -resetguisettings 选项后之前的 GUI 设置的备份。

该数据，索引和日志文件通过 Oracle Berkeley DB 使用，这是比特币使用的嵌入式键/值对数据存储。

### 数据库子目录

包含 BDB（Berkeley DB）日志文件。

### testnet3 子目录

包含这些文件的测试网版本（如果使用启动选项 -testnet 运行）。

### 区块子目录【v0.8 及以上版本】

包含区块链数据。

> * blk*.dat
>   * 以网络格式存储真正的比特币区块到硬盘上。它们仅用于重新扫描钱包中丢失的交易，重组到链的不同部分，以及将区块数据提供给正在同步的其他节点。
> * blocks/index 子目录【v0.8 及以上版本】
>   * LevelDB 数据库，包含关于所有已知区块的元数据，以及在硬盘上找到它们的位置。没有这个，找到一个区块将会非常慢。

### 链状态子目录【v0.8 及以上版本】

LevelDB 数据库，具有所有当前未花费的交易输出的紧凑表达和关于它们来源交易的一些元数据。
此处的数据对验证新传入区块和交易是必须的。
从理论上讲，它可以从区块数据重建（参阅 -reindex 命令行选项），但这需要相当长的时间。
如果没有它，理论上你仍然可以进行验证，但这意味着对于所花费的每个输出，通过区块（截至 2017 年 11 月区块总大小为 150GB）进行全面扫描。

### 锁子目录【v0.8 及以上版本】

包含“撤销”数据。

> * rev*.dat

你可以把区块当作链状态的“补丁”（它们消耗一些未花费的输出，并生成新的输出），并把撤销数据当作反向补丁。
它们是回滚链状态所必须的，在重组时是必要的。

### 个人身份识别数据【v0.8 及以上版本】

如果你希望向朋友发送区块链，避免它们大量下载，这部分可能对你有用。

> * wallet.dat
>   * 包含链接到它们的地址和交易。请务必备份此文件。它包含花费比特币所需的密钥。你不应将此文件传输给任何第三方，否则它们可能会光顾你的比特币。
> * db.log
>   * 可能包含与你的钱包有关的信息。它可以安全删除。
> * debug.log
>   * 可能包含 IP 地址和交易 ID。它可以安全删除。
> * database/folder
>   * 这应该仅存于 bitcoin-qt 运行时。它包含你的钱包相关的信息（BDB 状态）。
> * peers.dat
>   * 不知道是否包含个人身份识别数据。它可以安全删除。

其他的文件和目录（blocks, blocks/index, chainstate）可以安全地传输/存档，因为它们包含仅与公共区块链有关的信息。

## 转让

“区块”和“链状态”目录中的数据库文件是跨平台的，可以在不同的平台间进行复制安装。
这些文件统称为节点的“区块数据库”，表示节点在同步过程中下载的所有信息。
换句话说，如果将 A 节点数据目录的区块数据库复制到 B 节点的数据目录，B 节点将具有与 A 节点一样的同步百分比。
这通常比再次进行普通初始化同步快得多。但是，当你以这种方式复制某人的数据库，你必须绝对信任他。
比特币核心将其区块数据库文件当作 100% 准确且值得信赖，而在正常初始化同步期间，它将对端提供的每个区块视为无效，直到另有证明为止。
如果攻击者能够修改你的区块数据文件，那么他们可以做各种导致你丢失比特币的邪恶事件。
因此，你应该只在你个人的控制下从别人那里复制区块数据库，并且只能通过安全连接复制。

每个节点都有一个唯一的区块数据库，并且所有文件都是高可连接的。
所以，如果你把一个数据目录中的“区块”或“链状态”目录中的几个文件复制到另一个数据目录中，这几乎肯定会导致第二个节点崩溃或在未来的某个随机点卡住。
如果你想把区块数据库从一个数据目录复制到另一个数据目录，必须删除旧数据库并一次复制全部文件。
复制时必须关闭两个节点。

只写入“区块”目录中编号最大的文件。之前的文件永远不会改变。
此外，当访问这些区块 blk*.dat 文件时，通常按高度顺序访问它们。
因此，可以把“区块”目录或 blk*.dat 文件的某个自己单独符号链接到磁存储驱动器上而不会造成太大的性能损失（参阅拆分数据目录），
以及如果两个节点以相同的区块数据库启动（由于前面描述的复制），后续同步运行将非常有效。

Thanks for your time.

## 参照

* [bitcoin/files.md at master · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/master/doc/files.md){:target="_blank"}
* [Data directory - Bitcoin Wiki](https://en.bitcoin.it/wiki/Data_directory){:target="_blank"}
* [Splitting the data directory - Bitcoin Wiki](https://en.bitcoin.it/wiki/Splitting_the_data_directory){:target="_blank"}
