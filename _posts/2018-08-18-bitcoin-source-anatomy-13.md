---
layout: post
title:  "比特币源码剖析（十三）"
date:   2018-08-18 08:34:08 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了第六步初始化网络的详细过程，详见[比特币源码剖析（十二）](/blog/2018/08/bitcoin-source-anatomy-12.html)。<br>
本篇主要分析 Step 7: load block chain 第七步加载区块链的详细过程。

## 源码剖析

<p id="Step07-ref"></p>
3.11.7.第七步，加载区块链到内存。这部分代码实现在“init.cpp”文件的 AppInit2(...) 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 7: load block chain // 加载区块链数据（区块数据目录 .bitcoin/blocks/）

    fReindex = GetBoolArg("-reindex", false); // 再索引标志（重新生成 rev 文件），默认关闭

    // Upgrading to 0.8; hard-link the old blknnnn.dat files into /blocks/ // 1.升级到 0.8；硬链接旧的区块数据文件 blknnnn.dat 到 /blocks/ 目录下
    boost::filesystem::path blocksDir = GetDataDir() / "blocks"; // 兼容老版的区块格式，区块文件扩容
    if (!boost::filesystem::exists(blocksDir)) // 若该目录不存在
    {
        boost::filesystem::create_directories(blocksDir); // 则创建区块数据目录
        bool linked = false;
        for (unsigned int i = 1; i < 10000; i++) { // 遍历原区块数据文件
            boost::filesystem::path source = GetDataDir() / strprintf("blk%04u.dat", i); // 旧版区块数据文件名
            if (!boost::filesystem::exists(source)) break;
            boost::filesystem::path dest = blocksDir / strprintf("blk%05u.dat", i-1); // 新版区块数据文件名，统一放在 blocks 目录下
            try {
                boost::filesystem::create_hard_link(source, dest); // 若存在旧版区块数据文件，则建立硬链接，以兼容新版
                LogPrintf("Hardlinked %s -> %s\n", source.string(), dest.string());
                linked = true; // 将链接标志设置为 true
            } catch (const boost::filesystem::filesystem_error& e) {
                // Note: hardlink creation failing is not a disaster, it just means
                // blocks will get re-downloaded from peers.
                LogPrintf("Error hardlinking blk%04u.dat: %s\n", i, e.what());
                break;
            }
        }
        if (linked) // 若建立了硬链接，则设置再索引标志为 true
        {
            fReindex = true;
        }
    }

    // cache size calculations // 2.缓存大小计算
    int64_t nTotalCache = (GetArg("-dbcache", nDefaultDbCache) << 20); // 总缓存大小
    nTotalCache = std::max(nTotalCache, nMinDbCache << 20); // total cache cannot be less than nMinDbCache // 总缓存不能低于 nMinDbCache
    nTotalCache = std::min(nTotalCache, nMaxDbCache << 20); // total cache cannot be greated than nMaxDbcache // 总缓存不能高于 nMaxDbcache
    int64_t nBlockTreeDBCache = nTotalCache / 8; // 区块树数据库缓存大小
    if (nBlockTreeDBCache > (1 << 21) && !GetBoolArg("-txindex", DEFAULT_TXINDEX))
        nBlockTreeDBCache = (1 << 21); // block tree db cache shouldn't be larger than 2 MiB
    nTotalCache -= nBlockTreeDBCache;
    int64_t nCoinDBCache = std::min(nTotalCache / 2, (nTotalCache / 4) + (1 << 23)); // use 25%-50% of the remainder for disk cache // 币数据库缓存大小
    nTotalCache -= nCoinDBCache;
    nCoinCacheUsage = nTotalCache; // the rest goes to in-memory cache // 比缓存用量
    LogPrintf("Cache configuration:\n");
    LogPrintf("* Using %.1fMiB for block index database\n", nBlockTreeDBCache * (1.0 / 1024 / 1024));
    LogPrintf("* Using %.1fMiB for chain state database\n", nCoinDBCache * (1.0 / 1024 / 1024));
    LogPrintf("* Using %.1fMiB for in-memory UTXO set\n", nCoinCacheUsage * (1.0 / 1024 / 1024));

    bool fLoaded = false; // 加载标志，表示加载区块索引是否成功，初始为 false
    while (!fLoaded) { // 3.若第一次没有加载成功，再加载一遍
        bool fReset = fReindex;
        std::string strLoadError;

        uiInterface.InitMessage(_("Loading block index..."));

        nStart = GetTimeMillis();
        do {
            try {
                UnloadBlockIndex(); // 为防第二次加载，先清空当前的区块索引
                delete pcoinsTip;
                delete pcoinsdbview;
                delete pcoinscatcher;
                delete pblocktree;

                pblocktree = new CBlockTreeDB(nBlockTreeDBCache, false, fReindex); // 区块索引
                pcoinsdbview = new CCoinsViewDB(nCoinDBCache, false, fReindex);
                pcoinscatcher = new CCoinsViewErrorCatcher(pcoinsdbview);
                pcoinsTip = new CCoinsViewCache(pcoinscatcher);

                if (fReindex) { // 默认 false
                    pblocktree->WriteReindexing(true); // 3.1.写入再索引标志为 true（区块数据库 leveldb）
                    //If we're reindexing in prune mode, wipe away unusable block files and all undo data files
                    if (fPruneMode) // 如果我们在修剪模式（修剪已确认的区块）下进行再索引，
                        CleanupBlockRevFiles(); // 清空无用的块文件（blk）和所有恢复数据文件（rev）
                }

                if (!LoadBlockIndex()) { // 3.2.从磁盘加载区块索引树和币数据库
                    strLoadError = _("Error loading block database");
                    break;
                }

                // If the loaded chain has a wrong genesis, bail out immediately // 如果加载的链的创世区块错误，马上补救
                // (we're likely using a testnet datadir, or the other way around). // （我们可能使用测试网的数据目录，或者相反）。
                if (!mapBlockIndex.empty() && mapBlockIndex.count(chainparams.GetConsensus().hashGenesisBlock) == 0) // 检查 mapBlockIndex 是否为空，且是否加载了创世区块索引（通过哈希查找）
                    return InitError(_("Incorrect or no genesis block found. Wrong datadir for network?"));

                // Initialize the block index (no-op if non-empty database was already loaded) // 初始化区块索引(如果非空数据库已经加载则无操作)
                if (!InitBlockIndex(chainparams)) { // 3.3.初始化区块索引到磁盘
                    strLoadError = _("Error initializing block database");
                    break;
                }

                // Check for changed -txindex state // 检查 -txindex 改变的状态
                if (fTxIndex != GetBoolArg("-txindex", DEFAULT_TXINDEX)) { // 检查 fTxIndex 标志，在 LoadBlockIndex 函数中可能被改变
                    strLoadError = _("You need to rebuild the database using -reindex to change -txindex");
                    break;
                }

                // Check for changed -prune state.  What we are concerned about is a user who has pruned blocks // 检查 -prune 改变的状态。我们关注的时过去曾修剪过的区块，
                // in the past, but is now trying to run unpruned. // 但现在尝试运行未修剪过的区块。
                if (fHavePruned && !fPruneMode) { // 检查 fHavePruned 标志，用户删了一些文件后，又先在未修剪模式中运行 
                    strLoadError = _("You need to rebuild the database using -reindex to go back to unpruned mode.  This will redownload the entire blockchain");
                    break;
                }

                uiInterface.InitMessage(_("Verifying blocks...")); // 开始验证区块
                if (fHavePruned && GetArg("-checkblocks", DEFAULT_CHECKBLOCKS) > MIN_BLOCKS_TO_KEEP) { // pending
                    LogPrintf("Prune: pruned datadir may not have more than %d blocks; -checkblocks=%d may fail\n",
                        MIN_BLOCKS_TO_KEEP, GetArg("-checkblocks", DEFAULT_CHECKBLOCKS));
                }

                {
                    LOCK(cs_main);
                    CBlockIndex* tip = chainActive.Tip(); // 获取激活的链尖区块索引
                    if (tip && tip->nTime > GetAdjustedTime() + 2 * 60 * 60) { // 链尖区块时间不能比当前时间快 2h
                        strLoadError = _("The block database contains a block which appears to be from the future. "
                                "This may be due to your computer's date and time being set incorrectly. "
                                "Only rebuild the block database if you are sure that your computer's date and time are correct");
                        break;
                    }
                }

                if (!CVerifyDB().VerifyDB(chainparams, pcoinsdbview, GetArg("-checklevel", DEFAULT_CHECKLEVEL),
                              GetArg("-checkblocks", DEFAULT_CHECKBLOCKS))) { // 验证数据库，验证等级默认 3，验证块数默认 288
                    strLoadError = _("Corrupted block database detected");
                    break;
                }
            } catch (const std::exception& e) {
                if (fDebug) LogPrintf("%s\n", e.what());
                strLoadError = _("Error opening block database");
                break;
            }

            fLoaded = true; // 加载成功
        } while(false);

        if (!fLoaded) { // 3.4.若加载失败
            // first suggest a reindex // 首次建议再索引
            if (!fReset) { // =fReindex
                bool fRet = uiInterface.ThreadSafeMessageBox(
                    strLoadError + ".\n\n" + _("Do you want to rebuild the block database now?"),
                    "", CClientUIInterface::MSG_ERROR | CClientUIInterface::BTN_ABORT); // 弹出交互框，针对 qt
                if (fRet) {
                    fReindex = true; // 再索引标志置为 true，下次再加载区块索引
                    fRequestShutdown = false; // 请求关闭标志置为 false
                } else {
                    LogPrintf("Aborted block database rebuild. Exiting.\n");
                    return false;
                }
            } else {
                return InitError(strLoadError);
            }
        }
    } // end of while load

    // As LoadBlockIndex can take several minutes, it's possible the user // LoadBlockIndex 会花几分钟，在最后一次操作期间，用户可能请求关闭 GUI。
    // requested to kill the GUI during the last operation. If so, exit. // 如此，便退出。
    // As the program has not fully started yet, Shutdown() is possibly overkill. // 问题是还未完全启动，Shutdown() 可能杀伤力过大。
    if (fRequestShutdown) // 若用户在加载区块期间请求关闭
    {
        LogPrintf("Shutdown requested. Exiting.\n");
        return false; // 不调用 Shutdown() 直接退出
    }
    LogPrintf(" block index %15dms\n", GetTimeMillis() - nStart); // 记录区块索引时间

    boost::filesystem::path est_path = GetDataDir() / FEE_ESTIMATES_FILENAME; // 拼接费用估计文件路径
    CAutoFile est_filein(fopen(est_path.string().c_str(), "rb"), SER_DISK, CLIENT_VERSION); // 打开（首次创建）该文件并创建估费文件对象
    // Allowed to fail as this file IS missing on first startup. // 允许失败，因为首次启动时该文件不存在。
    if (!est_filein.IsNull()) // 若该文件存在
        mempool.ReadFeeEstimates(est_filein); // 内存池读取估计费用
    fFeeEstimatesInitialized = true; // 费用估计初始化状态标志置为 true
    ...
}
{% endhighlight %}

1.兼容旧版客户端，创建区块数据文件的硬链接。<br>
2.计算各部分缓存大小。<br>
3.加载区块链。<br>
3.1.写入再索引标志到区块数据库，并清空无用的区块文件和全部恢复文件。<br>
3.2.加载区块索引。<br>
3.3.初始化区块索引到磁盘上。<br>
3.4.区块链加载失败处理。<br>
4.退出处理，这里不调用 Shutdown() 直接退出。<br>
5.费用估计。<br>

3.1.先调用 pblocktree->WriteReindexing(true) 把再索引标志写入区块数据库（leveldb），
该函数声明在“txdb.h”文件的 CblockTreeDB 类中。

{% highlight C++ %}
/** Access to the block database (blocks/index/) */ // 访问区块数据库（/blocks/index）
class CBlockTreeDB : public CDBWrapper
{
    ...
    bool WriteReindexing(bool fReindex); // 写入再索引标志
    ...
};
{% endhighlight %}

实现在“txdb.cpp”文件中，入参为：true。

{% highlight C++ %}
static const char DB_REINDEX_FLAG = 'R';
...
bool CBlockTreeDB::WriteReindexing(bool fReindexing) { // true
    if (fReindexing)
        return Write(DB_REINDEX_FLAG, '1'); // 'R'
    else
        return Erase(DB_REINDEX_FLAG);
}
{% endhighlight %}

再调用 CleanupBlockRevFiles() 函数删除全部的 rev 文件和无用的区块（blk）文件，
该函数定义再“init.cpp”文件中。

{% highlight C++ %}
// If we're using -prune with -reindex, then delete block files that will be ignored by the
// reindex.  Since reindexing works by starting at block file 0 and looping until a blockfile
// is missing, do the same here to delete any later block files after a gap.  Also delete all
// rev files since they'll be rewritten by the reindex anyway.  This ensures that vinfoBlockFile
// is in sync with what's actually on disk by the time we start downloading, so that pruning
// works correctly. // 如果我们同时使用 -prune 和 -reindex，然后删除将被再索引忽略的区块文件。因为再索引的工作原理是从区块文件 0 开始循环知道一个区块文件丢失，所以在此执行相同的操作来删除丢失文件后续的区块文件。同时删除所有恢复文件，因为它们将通过再索引重写。这确保了区块文件与我们开始下载时实际在磁盘上的内容同步，因此修剪工作正常。
void CleanupBlockRevFiles() // 删除某个缺失区块之后的所有区块数据，和前缀为 rev 的文件
{
    using namespace boost::filesystem;
    map<string, path> mapBlockFiles; // <区块文件索引（?????）, 区块文件路径（path）>

    // Glob all blk?????.dat and rev?????.dat files from the blocks directory. // 从区块目录全部区块和恢复数据文件。
    // Remove the rev files immediately and insert the blk file paths into an // 立刻移除恢复文件并把区块文件路径
    // ordered map keyed by block file index. // 插入一个键为区块文件索引的有序映射列表中。
    LogPrintf("Removing unusable blk?????.dat and rev?????.dat files for -reindex with -prune\n");
    path blocksdir = GetDataDir() / "blocks"; // 拼接区块数据目录
    for (directory_iterator it(blocksdir); it != directory_iterator(); it++) { // 遍历区块目录下的文件（directory_iterator 默认构造函数，指向目录尾部）
        if (is_regular_file(*it) && // 如果是普通文件，且
            it->path().filename().string().length() == 12 && // 文件名的长度为 12，且
            it->path().filename().string().substr(8,4) == ".dat") // 后 4 个字符为 ".dat"
        { // 文件校验（包括文件名，文件格式）
            if (it->path().filename().string().substr(0,3) == "blk") // 若为区块文件
                mapBlockFiles[it->path().filename().string().substr(3,5)] = it->path();  // 把区块文件索引与该文件路径配对插入去快文件映射列表中
            else if (it->path().filename().string().substr(0,3) == "rev") // 若为恢复文件
                remove(it->path()); // 移除 rev 文件
        }
    }

    // Remove all block files that aren't part of a contiguous set starting at // 通过维持单独的计数器，
    // zero by walking the ordered map (keys are block file indices) by // 遍历有序映射列表（键为区块文件索引）
    // keeping a separate counter.  Once we hit a gap (or if 0 doesn't exist) // 删除所有不属于从 0 开始的连续块文件
    // start removing block files. // 一旦我们抵达间断的区块（或 0 不存在），则开始删除区块文件。
    int nContigCounter = 0; // 检查缺失的 blk 文件，删除缺失的 blk 后的所有 blk 文件
    BOOST_FOREACH(const PAIRTYPE(string, path)& item, mapBlockFiles) {
        if (atoi(item.first) == nContigCounter) { // 从 0 开始
            nContigCounter++; // 若文件连续，计数器加 1
            continue; // 跳过该文件，比较下一个文件
        } // 否则
        remove(item.second); // 从该文件开始删除后面所有的文件
    }
}
{% endhighlight %}

3.2.调用 LoadBlockIndex() 加载区块索引，该函数声明在“main.h”文件中。

{% highlight C++ %}
/** Load the block tree and coins database from disk */
bool LoadBlockIndex(); // 从磁盘加载区块树和币的数据库
{% endhighlight %}

实现“main.cpp”文件中，没有入参。

{% highlight C++ %}
bool static LoadBlockIndexDB()
{
    const CChainParams& chainparams = Params(); // 获取网络链参数
    if (!pblocktree->LoadBlockIndexGuts()) // 区块树加载区块索引框架
        return false;

    boost::this_thread::interruption_point(); // 打个断点

    // Calculate nChainWork // 计算链工作量
    vector<pair<int, CBlockIndex*> > vSortedByHeight; // 通过高度排序的有序区块高度索引映射列表
    vSortedByHeight.reserve(mapBlockIndex.size()); // 预开辟与区块索引映射列表等大的空间
    BOOST_FOREACH(const PAIRTYPE(uint256, CBlockIndex*)& item, mapBlockIndex) // 遍历区块索引映射列表
    {
        CBlockIndex* pindex = item.second; // 获取区块索引
        vSortedByHeight.push_back(make_pair(pindex->nHeight, pindex)); // 与区块高度配对加入待排序列表
    }
    sort(vSortedByHeight.begin(), vSortedByHeight.end()); // 按高度排序
    BOOST_FOREACH(const PAIRTYPE(int, CBlockIndex*)& item, vSortedByHeight) // 遍历有序的区块索引映射列表
    {
        CBlockIndex* pindex = item.second; // 获取区块索引
        pindex->nChainWork = (pindex->pprev ? pindex->pprev->nChainWork : 0) + GetBlockProof(*pindex); // 若该区块的前一个区块存在，则获取前一个区块的链工作量，再加上该区块的工作量证明
        // We can link the chain of blocks for which we've received transactions at some point. // 我们可以连接到区块链用于接收某些节点的交易。
        // Pruned nodes may have deleted the block. // 修剪节点可能会删除区块。
        if (pindex->nTx > 0) { // 若该区块的交易数大于 0
            if (pindex->pprev) {
                if (pindex->pprev->nChainTx) { // 如果前一个区块存在链交易
                    pindex->nChainTx = pindex->pprev->nChainTx + pindex->nTx; // 用前一个区块的链交易 + 该区块的交易 得到该区块的链交易
                } else { // 否则
                    pindex->nChainTx = 0; // 该区块的链交易为 0
                    mapBlocksUnlinked.insert(std::make_pair(pindex->pprev, pindex)); // 与前一个区块的索引配对插入未连接的区块映射列表
                }
            } else { // 否则
                pindex->nChainTx = pindex->nTx; // 区块的链交易数等于区块的交易数
            }
        }
        if (pindex->IsValid(BLOCK_VALID_TRANSACTIONS) && (pindex->nChainTx || pindex->pprev == NULL)) // 若该区块交易有效，且有链交易，或前一个区块不存在
            setBlockIndexCandidates.insert(pindex); // 插入区块索引候选集
        if (pindex->nStatus & BLOCK_FAILED_MASK && (!pindexBestInvalid || pindex->nChainWork > pindexBestInvalid->nChainWork)) // 若区块状态为 BLOCK_FAILED_MASK，且最佳无效区块为空，或链工作大于最佳无效区块
            pindexBestInvalid = pindex; // 该区块为最佳无效区块
        if (pindex->pprev) // 若前一个区块存在
            pindex->BuildSkip();
        if (pindex->IsValid(BLOCK_VALID_TREE) && (pindexBestHeader == NULL || CBlockIndexWorkComparator()(pindexBestHeader, pindex)))
            pindexBestHeader = pindex; // 该区块索引为最佳区块头索引
    }

    // Load block file info // 加载区块文件信息
    pblocktree->ReadLastBlockFile(nLastBlockFile); // 读取最后一个区块文件
    vinfoBlockFile.resize(nLastBlockFile + 1); // 预开辟相同的空间
    LogPrintf("%s: last block file = %i\n", __func__, nLastBlockFile);
    for (int nFile = 0; nFile <= nLastBlockFile; nFile++) { // 遍历区块文件
        pblocktree->ReadBlockFileInfo(nFile, vinfoBlockFile[nFile]); // 读区块文件信息
    }
    LogPrintf("%s: last block file info: %s\n", __func__, vinfoBlockFile[nLastBlockFile].ToString());
    for (int nFile = nLastBlockFile + 1; true; nFile++) { // 从最后一个文件号加 1 开始
        CBlockFileInfo info;
        if (pblocktree->ReadBlockFileInfo(nFile, info)) { // 读取
            vinfoBlockFile.push_back(info); // 并加入区块文件信息列表
        } else { // 若读取失败（文件不存在）
            break; // 跳出
        }
    }

    // Check presence of blk files // 检查区块文件是否存在
    LogPrintf("Checking all blk files are present...\n");
    set<int> setBlkDataFiles; // 用于保存所有区块数据文件的序号
    BOOST_FOREACH(const PAIRTYPE(uint256, CBlockIndex*)& item, mapBlockIndex) // 遍历区块索引映射列表
    {
        CBlockIndex* pindex = item.second; // 获取区块索引
        if (pindex->nStatus & BLOCK_HAVE_DATA) { // 若区块状态为 BLOCK_HAVE_DATA
            setBlkDataFiles.insert(pindex->nFile); // 把该区块所在文件号插入区块数据文件集合中
        }
    }
    for (std::set<int>::iterator it = setBlkDataFiles.begin(); it != setBlkDataFiles.end(); it++) // 遍历区块数据文件集合
    {
        CDiskBlockPos pos(*it, 0); // 创建磁盘区块位置对象
        if (CAutoFile(OpenBlockFile(pos, true), SER_DISK, CLIENT_VERSION).IsNull()) { // 创建文件指针托管临时对象
            return false;
        }
    }

    // Check whether we have ever pruned block & undo files // 检查我们是否曾修剪过区块和恢复文件
    pblocktree->ReadFlag("prunedblockfiles", fHavePruned); // 读取修剪区块文件标志
    if (fHavePruned)
        LogPrintf("LoadBlockIndexDB(): Block files have previously been pruned\n");

    // Check whether we need to continue reindexing // 检查我们是否需要继续再索引
    bool fReindexing = false;
    pblocktree->ReadReindexing(fReindexing); // 读取再索引标志
    fReindex |= fReindexing;

    // Check whether we have a transaction index // 检查我们是否有交易索引
    pblocktree->ReadFlag("txindex", fTxIndex); // 读取交易索引标志
    LogPrintf("%s: transaction index %s\n", __func__, fTxIndex ? "enabled" : "disabled");

    // Load pointer to end of best chain // 加载指向最佳链尾部的指针
    BlockMap::iterator it = mapBlockIndex.find(pcoinsTip->GetBestBlock()); // 获取最佳区块的索引
    if (it == mapBlockIndex.end()) // 若未找到
        return true; // 直接返回 true
    chainActive.SetTip(it->second); // 若存在，则设置该区块索引为激活链的链尖（放入区块索引列表中）

    PruneBlockIndexCandidates(); // 修剪区块索引候选

    LogPrintf("%s: hashBestChain=%s height=%d date=%s progress=%f\n", __func__,
        chainActive.Tip()->GetBlockHash().ToString(), chainActive.Height(),
        DateTimeStrFormat("%Y-%m-%d %H:%M:%S", chainActive.Tip()->GetBlockTime()),
        Checkpoints::GuessVerificationProgress(chainparams.Checkpoints(), chainActive.Tip()));

    return true; // 加载成功返回 true
}
...
bool LoadBlockIndex()
{
    // Load block index from databases // 从数据库加载区块索引
    if (!fReindex && !LoadBlockIndexDB()) // 若未开启再索引，则加载区块索引数据库，否则不加载，在后面会重新索引
        return false;
    return true; // 加载成功返回 true
}
{% endhighlight %}

3.3.调用 InitBlockIndex(chainparams) 初始化区块树/索引数据库到磁盘，该函数声明在“main.h”文件中。

{% highlight C++ %}
/** Initialize a new block tree database + block data on disk */
bool InitBlockIndex(const CChainParams& chainparams); // 初始化一个新的区块树数据库+区块数据到磁盘
{% endhighlight %}

实现在“main.cpp”文件中，入参为：链参数对象的引用。

{% highlight C++ %}
bool InitBlockIndex(const CChainParams& chainparams) 
{
    LOCK(cs_main); // 线程安全锁

    // Initialize global variables that cannot be constructed at startup.
    recentRejects.reset(new CRollingBloomFilter(120000, 0.000001)); // 初始化不能再启动时创建的全局对象

    // Check whether we're already initialized
    if (chainActive.Genesis() != NULL) // 检查是否初始化了创世区块索引
        return true;

    // Use the provided setting for -txindex in the new database // 在新数据库中对 -txindex 使用提供的设置
    fTxIndex = GetBoolArg("-txindex", DEFAULT_TXINDEX); // 先获取默认设置
    pblocktree->WriteFlag("txindex", fTxIndex); // 写入数据库
    LogPrintf("Initializing databases...\n");

    // Only add the genesis block if not reindexing (in which case we reuse the one already on disk)
    if (!fReindex) { // 如果不再索引只添加创世区块（此时我们重用磁盘上已存在的创世区块所在的区块文件）
        try {
            CBlock &block = const_cast<CBlock&>(chainparams.GenesisBlock()); // 获取创世区块的引用
            // Start new block file // 开始新的区块文件
            unsigned int nBlockSize = ::GetSerializeSize(block, SER_DISK, CLIENT_VERSION); // 获取序列化大小
            CDiskBlockPos blockPos;
            CValidationState state;
            if (!FindBlockPos(state, blockPos, nBlockSize+8, 0, block.GetBlockTime())) // 获取区块状态和位置
                return error("LoadBlockIndex(): FindBlockPos failed");
            if (!WriteBlockToDisk(block, blockPos, chainparams.MessageStart())) // 把区块信息（状态和位置）写到磁盘
                return error("LoadBlockIndex(): writing genesis block to disk failed");
            CBlockIndex *pindex = AddToBlockIndex(block); // 添加到区块索引
            if (!ReceivedBlockTransactions(block, state, pindex, blockPos)) // 接收区块交易
                return error("LoadBlockIndex(): genesis block not accepted");
            if (!ActivateBestChain(state, chainparams, &block)) // 激活最佳链
                return error("LoadBlockIndex(): genesis block cannot be activated");
            // Force a chainstate write so that when we VerifyDB in a moment, it doesn't check stale data // 强制把链状态写入磁盘，以至于当我们一段时间内验证数据库时，不会检查旧数据
            return FlushStateToDisk(state, FLUSH_STATE_ALWAYS);
        } catch (const std::runtime_error& e) {
            return error("LoadBlockIndex(): failed to initialize block database: %s", e.what());
        }
    }

    return true; // 成功返回 true
}
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（十四）](/blog/2018/08/bitcoin-source-anatomy-14.html)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
