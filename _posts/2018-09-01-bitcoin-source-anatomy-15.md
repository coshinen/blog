---
layout: post
title:  "比特币源码剖析（十五）"
date:   2018-09-01 14:03:37 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了第八步加载钱包的详细过程，详见[比特币源码剖析（十四）](/blog/2018/08/bitcoin-source-anatomy-14.html)。
本篇主要分析 Step 9: data directory maintenance 第九步数据目录维护的详细过程。

## 源码剖析

<p id="Step09-ref"></p>
3.11.9.第九步，数据目录维护。这部分代码实现在“init.cpp”文件的 AppInit2(...) 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 9: data directory maintenance // 若是裁剪模式且关闭了再索引选项，则进行 blockstore 的裁剪

    // if pruning, unset the service bit and perform the initial blockstore prune // 如果正在修剪，
    // after any wallet rescanning has taken place. // 在任何钱包再扫描发生后，取消设置服务位并执行初始区块存储修剪。
    if (fPruneMode) { // 裁剪标志，默认为 false
        LogPrintf("Unsetting NODE_NETWORK on prune mode\n");
        nLocalServices &= ~NODE_NETWORK; // 取消设置本地服务中的 NODE_NETWORK
        if (!fReindex) { // 若再索引标志关闭
            uiInterface.InitMessage(_("Pruning blockstore...")); // 开始修剪区块存储
            PruneAndFlush(); // 设置修剪标志并刷新磁盘上的链状态
        }
    }
    ...
}
{% endhighlight %}

若满足条件，开启了裁剪模式且关闭了再索引选项，则进行数据目录中区块的修剪。
这里调用 PruneAndFlush() 来设置修剪标志并刷新磁盘上的链状态。
该函数声明在“main.h”文件中。

{% highlight C++ %}
/** Flush all state, indexes and buffers to disk. */
void FlushStateToDisk(); // 刷新全部状态，索引和缓冲到磁盘。
/** Prune block files and flush state to disk. */
void PruneAndFlush(); // 修建区块文件并刷新状态到磁盘
{% endhighlight %}

实现在“main.cpp”文件中，没有入参。

{% highlight C++ %}
/**
 * Update the on-disk chain state.
 * The caches and indexes are flushed depending on the mode we're called with
 * if they're too large, if it's been a while since the last write,
 * or always and in all cases if we're in prune mode and are deleting files.
 */ // 更新磁盘上的链状态。缓存和索引根据我们调用的模式刷新，如果它们太大，或经上次写入已有一段时间，或总在所有情况下，我们处于修剪模式并正在删除文件。
bool static FlushStateToDisk(CValidationState &state, FlushStateMode mode) {
    const CChainParams& chainparams = Params();
    LOCK2(cs_main, cs_LastBlockFile);
    static int64_t nLastWrite = 0;
    static int64_t nLastFlush = 0;
    static int64_t nLastSetChain = 0;
    std::set<int> setFilesToPrune; // 修剪的文件集合
    bool fFlushForPrune = false;
    try {
    if (fPruneMode && fCheckForPruning && !fReindex) {
        FindFilesToPrune(setFilesToPrune, chainparams.PruneAfterHeight());
        fCheckForPruning = false;
        if (!setFilesToPrune.empty()) {
            fFlushForPrune = true;
            if (!fHavePruned) {
                pblocktree->WriteFlag("prunedblockfiles", true);
                fHavePruned = true;
            }
        }
    }
    int64_t nNow = GetTimeMicros();
    // Avoid writing/flushing immediately after startup. // 避免在启动后立刻写入/刷新。
    if (nLastWrite == 0) {
        nLastWrite = nNow;
    }
    if (nLastFlush == 0) {
        nLastFlush = nNow;
    }
    if (nLastSetChain == 0) {
        nLastSetChain = nNow;
    }
    size_t cacheSize = pcoinsTip->DynamicMemoryUsage(); // 获取动态内存用量
    // The cache is large and close to the limit, but we have time now (not in the middle of a block processing). // 缓存很大并接近极限，但我们现在有时间（不再块处理的中间）。
    bool fCacheLarge = mode == FLUSH_STATE_PERIODIC && cacheSize * (10.0/9) > nCoinCacheUsage;
    // The cache is over the limit, we have to write now. // 缓存超过极限，我们现在写入。
    bool fCacheCritical = mode == FLUSH_STATE_IF_NEEDED && cacheSize > nCoinCacheUsage;
    // It's been a while since we wrote the block index to disk. Do this frequently, so we don't need to redownload after a crash. // 这需要一段时间，因为我们写区块索引到磁盘。经常这么做，所以我们不需要在崩溃后重新下载
    bool fPeriodicWrite = mode == FLUSH_STATE_PERIODIC && nNow > nLastWrite + (int64_t)DATABASE_WRITE_INTERVAL * 1000000;
    // It's been very long since we flushed the cache. Do this infrequently, to optimize cache usage. // 这会花很长时间，因为我们刷新了缓存。不常这样做，以优化缓存使用。
    bool fPeriodicFlush = mode == FLUSH_STATE_PERIODIC && nNow > nLastFlush + (int64_t)DATABASE_FLUSH_INTERVAL * 1000000;
    // Combine all conditions that result in a full cache flush. // 合并所有导致完整缓存刷新的条件。
    bool fDoFullFlush = (mode == FLUSH_STATE_ALWAYS) || fCacheLarge || fCacheCritical || fPeriodicFlush || fFlushForPrune;
    // Write blocks and block index to disk. // 写入区块和区块索引到磁盘。
    if (fDoFullFlush || fPeriodicWrite) {
        // Depend on nMinDiskSpace to ensure we can write block index // 基于 nMinDiskSpace 以确保我们能写入区块索引
        if (!CheckDiskSpace(0)) // 检查当前的磁盘空间
            return state.Error("out of disk space");
        // First make sure all block and undo data is flushed to disk. // 首次确保全部区块和恢复数据被刷新到磁盘
        FlushBlockFile(); // 刷新区块文件
        // Then update all block file information (which may refer to block and undo files). // 然后更新全部区块文件信息（可能参照区块和恢复文件）。
        {
            std::vector<std::pair<int, const CBlockFileInfo*> > vFiles; // <脏掉的文件号，区块文件信息指针>
            vFiles.reserve(setDirtyFileInfo.size());
            for (set<int>::iterator it = setDirtyFileInfo.begin(); it != setDirtyFileInfo.end(); ) {
                vFiles.push_back(make_pair(*it, &vinfoBlockFile[*it]));
                setDirtyFileInfo.erase(it++);
            }
            std::vector<const CBlockIndex*> vBlocks; // 区块索引列表
            vBlocks.reserve(setDirtyBlockIndex.size());
            for (set<CBlockIndex*>::iterator it = setDirtyBlockIndex.begin(); it != setDirtyBlockIndex.end(); ) { // 遍历脏掉的区块索引集合
                vBlocks.push_back(*it);
                setDirtyBlockIndex.erase(it++);
            }
            if (!pblocktree->WriteBatchSync(vFiles, nLastBlockFile, vBlocks)) { // 批量写入同步
                return AbortNode(state, "Files to write to block index database");
            }
        }
        // Finally remove any pruned files // 最终移除所有修剪的文件
        if (fFlushForPrune)
            UnlinkPrunedFiles(setFilesToPrune);
        nLastWrite = nNow;
    }
    // Flush best chain related state. This can only be done if the blocks / block index write was also done. // 刷新最佳链相关的状态。该操作仅在区块/区块索引写入完成后执行。
    if (fDoFullFlush) {
        // Typical CCoins structures on disk are around 128 bytes in size. // 磁盘上的 CCoins 典型结构约 128 字节。
        // Pushing a new one to the database can cause it to be written // 将推送一个新数据到数据库可能导致
        // twice (once in the log, and once in the tables). This is already // 它被写入 2 次（一次在日志中，一次在表中）。
        // an overestimation, as most will delete an existing entry or // 这已经是高估了，因为大多数人会删除现有条目或覆盖现有条目。
        // overwrite one. Still, use a conservative safety factor of 2. // 仍使用保守的安全系数 2。
        if (!CheckDiskSpace(128 * 2 * 2 * pcoinsTip->GetCacheSize()))
            return state.Error("out of disk space");
        // Flush the chainstate (which may refer to block index entries). // 刷新链状态（可参考区块索引条目）。
        if (!pcoinsTip->Flush())
            return AbortNode(state, "Failed to write to coin database");
        nLastFlush = nNow;
    }
    if (fDoFullFlush || ((mode == FLUSH_STATE_ALWAYS || mode == FLUSH_STATE_PERIODIC) && nNow > nLastSetChain + (int64_t)DATABASE_WRITE_INTERVAL * 1000000)) {
        // Update best block in wallet (so we can detect restored wallets). // 在钱包中更新最佳区块（以至于我们能检测到恢复的钱包）。
        GetMainSignals().SetBestChain(chainActive.GetLocator());
        nLastSetChain = nNow;
    }
    } catch (const std::runtime_error& e) {
        return AbortNode(state, std::string("System error while flushing: ") + e.what());
    }
    return true; // 本地化状态成功返回 true
}

void FlushStateToDisk() {
    CValidationState state;
    FlushStateToDisk(state, FLUSH_STATE_ALWAYS);
}

void PruneAndFlush() {
    CValidationState state;
    fCheckForPruning = true; // 全局修剪标志置为 true
    FlushStateToDisk(state, FLUSH_STATE_NONE); // 刷新磁盘上的链状态
}
{% endhighlight %}

<p id="Step10-ref"></p>
3.11.10.第九步，数据目录维护。这部分代码实现在“init.cpp”文件的 AppInit2(...) 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 10: import blocks // 导入区块数据

    if (mapArgs.count("-blocknotify")) // 1.若注册了区块通知的命令
        uiInterface.NotifyBlockTip.connect(BlockNotifyCallback); // 连接区块通知回调函数

    uiInterface.InitMessage(_("Activating best chain..."));
    // scan for better chains in the block chain database, that are not yet connected in the active best chain // 扫描区块链数据库中的最佳链，这些链还没连接到激活的最佳链
    CValidationState state;
    if (!ActivateBestChain(state, chainparams)) // 2.激活最佳链，并获取验证状态
        strErrors << "Failed to connect best block";

    std::vector<boost::filesystem::path> vImportFiles; // 导入文件列表（存放导入区块文件的路径）
    if (mapArgs.count("-loadblock")) // 导入区块文件选项
    {
        BOOST_FOREACH(const std::string& strFile, mapMultiArgs["-loadblock"]) // 3.遍历指定的区块文件
            vImportFiles.push_back(strFile); // 放入文件列表
    }
    threadGroup.create_thread(boost::bind(&ThreadImport, vImportFiles)); // 4.创建一个用于导入区块线程
    if (chainActive.Tip() == NULL) { // 至少创世区块要加载完成
        LogPrintf("Waiting for genesis block to be imported...\n");
        while (!fRequestShutdown && chainActive.Tip() == NULL) // 必须保证至少加载创世区块
            MilliSleep(10); // 否则睡 10ms 等待导入区块线程完成工作
    }
    ...
}
{% endhighlight %}

1.调用区块通知回调函数，注册并运行指定命令。<br>
2.激活当前最佳区块链，并获取验证状态。<br>
3.遍历指定的区块文件路径，加入导入文件列表。<br>
4.创建一个线程，用于导入指定的区块文件。

1.调用 uiInterface.NotifyBlockTip.connect(BlockNotifyCallback) 注册区块通知回调函数 BlockNotifyCallback。
该函数实现在“init.cpp”文件中，入参为：初始化标志，区块索引。

{% highlight C++ %}
static void BlockNotifyCallback(bool initialSync, const CBlockIndex *pBlockIndex)
{
    if (initialSync || !pBlockIndex)
        return;

    std::string strCmd = GetArg("-blocknotify", ""); // 获取指定的命令

    boost::replace_all(strCmd, "%s", pBlockIndex->GetBlockHash().GetHex()); // 替换最佳区块哈希的 16 进制形式
    boost::thread t(runCommand, strCmd); // thread runs free // 传入命令，运行处理命令线程
}
{% endhighlight %}

这里创建了一个局部线程对象来执行传入的命令。
线程函数 runCommand 声明在“util.h”文件中。

{% highlight C++ %}
void runCommand(const std::string& strCommand); // 运行 shell 命令
{% endhighlight %}

实现在“util.cpp”文件中，入参为：待执行的命令。

{% highlight C++ %}
void runCommand(const std::string& strCommand)
{
    int nErr = ::system(strCommand.c_str()); // 执行命令 bash 命令
    if (nErr)
        LogPrintf("runCommand error: system(%s) returned %d\n", strCommand, nErr);
}
{% endhighlight %}

这里直接进行系统调用执行传入的命令。

4.调用 threadGroup.create_thread(boost::bind(&ThreadImport, vImportFiles)) 在线程组中创建一个线程，用于导入指定的区块文件到内存。
线程函数 ThreadImport 实现在“init.cpp” 文件中，入参为：指定的待导入去快文件路径列表。

{% highlight C++ %}
void ThreadImport(std::vector<boost::filesystem::path> vImportFiles) // 导入区块线程处理函数
{
    const CChainParams& chainparams = Params(); // 获取区块链参数
    RenameThread("bitcoin-loadblk"); // 重命名为加载区块线程
    // -reindex // 再索引选项
    if (fReindex) {
        CImportingNow imp; // 创建导入对象，把导入标志置为 true
        int nFile = 0; // 文件序号从 0 开始
        while (true) { // 循环加载区块
            CDiskBlockPos pos(nFile, 0); // 创建区块文件位置对象
            if (!boost::filesystem::exists(GetBlockPosFilename(pos, "blk"))) // 判断该文件是否存在
                break; // No block files left to reindex // 若没有剩余区块文件用于再索引，则跳出
            FILE *file = OpenBlockFile(pos, true); // 若该文件存在，则打开
            if (!file) // 若文件打开失败
                break; // This error is logged in OpenBlockFile // 记录错误信息到日志
            LogPrintf("Reindexing block file blk%05u.dat...\n", (unsigned int)nFile);
            LoadExternalBlockFile(chainparams, file, &pos); // 加载外部的区块文件
            nFile++; // 文件号加 1
        }
        pblocktree->WriteReindexing(false); // 写入再索引标志
        fReindex = false; // 再索引置为 false
        LogPrintf("Reindexing finished\n");
        // To avoid ending up in a situation without genesis block, re-try initializing (no-op if reindexing worked): // 为避免在没有创世区块的情况下结束，再次尝试初始化（若再索引起作用了，则无操作）：
        InitBlockIndex(chainparams); // 初始化区块索引数据库
    }

    // hardcoded $DATADIR/bootstrap.dat // 硬编码的 $DATADIR/bootstrap.dat
    boost::filesystem::path pathBootstrap = GetDataDir() / "bootstrap.dat"; // 路径拼接
    if (boost::filesystem::exists(pathBootstrap)) { // 若该文件存在
        FILE *file = fopen(pathBootstrap.string().c_str(), "rb"); // 以 2 进制只读模式打开文件
        if (file) {
            CImportingNow imp;
            boost::filesystem::path pathBootstrapOld = GetDataDir() / "bootstrap.dat.old";
            LogPrintf("Importing bootstrap.dat...\n");
            LoadExternalBlockFile(chainparams, file); // 加载外部的区块文件
            RenameOver(pathBootstrap, pathBootstrapOld); // 重命名文件，增加 .old 后缀
        } else {
            LogPrintf("Warning: Could not open bootstrap file %s\n", pathBootstrap.string());
        }
    }

    // -loadblock= // 导入区块选项
    BOOST_FOREACH(const boost::filesystem::path& path, vImportFiles) { // 遍历待导入的去快文件路径列表
        FILE *file = fopen(path.string().c_str(), "rb"); // 以二进制只读模式打开
        if (file) {
            CImportingNow imp;
            LogPrintf("Importing blocks file %s...\n", path.string());
            LoadExternalBlockFile(chainparams, file); // 加载外部区块文件到内存
        } else {
            LogPrintf("Warning: Could not open blocks file %s\n", path.string());
        }
    }

    if (GetBoolArg("-stopafterblockimport", DEFAULT_STOPAFTERBLOCKIMPORT)) { // 导入区块后停止
        LogPrintf("Stopping after block import\n");
        StartShutdown(); // 关闭客户端
    }
}
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（十六）](/blog/2018/09/bitcoin-source-anatomy-16.html)。

Thanks for your time.

## 参照

* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [mistydew/blockchain](https://github.com/mistydew/blockchain)
