---
layout: post
title:  "比特币源码剖析（五）"
date:   2018-06-23 22:08:33 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.1，离区块链 1.0 落地还有些距离。

## 概要
上一篇分析了日志记录的初始化，参数交互的初始化，应用程序初始化真正入口的前两步：安装和参数交互，详见[比特币源码剖析（四）](/2018/06/16/bitcoin-source-anatomy-04)。<br>
本篇主要分析 `Step 3: parameter-to-internal-flags` 第三步参数转化为内部标志，`Step 4: application initialization: dir lock, daemonize, pidfile, debug log` 第四步应用程序初始化。
<!-- excerpt -->

## 源码剖析

<p id="Step03-ref"></p>
3.11.3.第三步，参数转化为内部标志。这部分代码实现在“init.cpp”文件的 `AppInit2(...)` 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.0.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 3: parameter-to-internal-flags // 参数转换为内部变量，把外部参数的设置转化为程序内部的状态（bool 型参数，开关类选项）

    fDebug = !mapMultiArgs["-debug"].empty(); // 1.调试开关，默认关闭
    // Special-case: if -debug=0/-nodebug is set, turn off debugging messages // 特殊情况：如果设置了 -debug=0/-nodebug，关闭调试信息
    const vector<string>& categories = mapMultiArgs["-debug"]; // 获取调试类别列表
    if (GetBoolArg("-nodebug", false) || find(categories.begin(), categories.end(), string("0")) != categories.end()) // 若未设置 -nodebug 选项 或 在类别列表中找到 "0" 值
        fDebug = false; // 调试标志置为 false

    // Check for -debugnet // 2.检查 -debugnet 选项
    if (GetBoolArg("-debugnet", false)) // -debugnet 参数，默认关闭，限制不支持改参数，使用 -debug=net
        InitWarning(_("Unsupported argument -debugnet ignored, use -debug=net."));
    // Check for -socks - as this is a privacy risk to continue, exit here // 检查 -socks 选项作为一个要继续下去的隐秘风险，在这里退出
    if (mapArgs.count("-socks")) // -socks 已不被支持，现只支持 SOCKS5 proxies
        return InitError(_("Unsupported argument -socks found. Setting SOCKS version isn't possible anymore, only SOCKS5 proxies are supported."));
    // Check for -tor - as this is a privacy risk to continue, exit here // 检查 -tor 选项作为一个要继续下去的隐秘风险，在这里退出
    if (GetBoolArg("-tor", false)) // -tor 参数是一个隐藏风险，现使用 -onion 参数
        return InitError(_("Unsupported argument -tor found, use -onion."));

    if (GetBoolArg("-benchmark", false)) // -benchmark 参数已不支持，使用 -debug=bench
        InitWarning(_("Unsupported argument -benchmark ignored, use -debug=bench."));

    if (GetBoolArg("-whitelistalwaysrelay", false)) // -whitelistalwaysrelay 参数不再支持，使用 -whitelistrelay 或 -whitelistforcerelay
        InitWarning(_("Unsupported argument -whitelistalwaysrelay ignored, use -whitelistrelay and/or -whitelistforcerelay."));

    // Checkmempool and checkblockindex default to true in regtest mode // 3.检查内存池和检查区块索引选项在回归测试模式下默认为 true
    int ratio = std::min<int>(std::max<int>(GetArg("-checkmempool", chainparams.DefaultConsistencyChecks() ? 1 : 0), 0), 1000000); // 1 or 0 对应 true or false，主网默认关闭
    if (ratio != 0) { // true
        mempool.setSanityCheck(1.0 / ratio); // 交易内存池设置完整性检查频率
    }
    fCheckBlockIndex = GetBoolArg("-checkblockindex", chainparams.DefaultConsistencyChecks()); // 检查区块索引标志，默认：主网、测试网关闭，回归测试网打开
    fCheckpointsEnabled = GetBoolArg("-checkpoints", DEFAULT_CHECKPOINTS_ENABLED); // 检测点可用，默认打开

    // mempool limits // 交易内存池限制选项
    int64_t nMempoolSizeMax = GetArg("-maxmempool", DEFAULT_MAX_MEMPOOL_SIZE) * 1000000; // 内存池大小限制，默认接近 300M
    int64_t nMempoolSizeMin = GetArg("-limitdescendantsize", DEFAULT_DESCENDANT_SIZE_LIMIT) * 1000 * 40;
    if (nMempoolSizeMax < 0 || nMempoolSizeMax < nMempoolSizeMin)
        return InitError(strprintf(_("-maxmempool must be at least %d MB"), std::ceil(nMempoolSizeMin / 1000000.0)));

    // -par=0 means autodetect, but nScriptCheckThreads==0 means no concurrency // 4.-par=0 意味着自动检测，但 nScriptCheckThreads==0 意味这没有并发
    nScriptCheckThreads = GetArg("-par", DEFAULT_SCRIPTCHECK_THREADS); // 脚本检测线程数，默认为 0
    if (nScriptCheckThreads <= 0)
        nScriptCheckThreads += GetNumCores(); // 每个核一个脚本检测线程，默认
    if (nScriptCheckThreads <= 1)
        nScriptCheckThreads = 0;
    else if (nScriptCheckThreads > MAX_SCRIPTCHECK_THREADS)
        nScriptCheckThreads = MAX_SCRIPTCHECK_THREADS; // 最大线程数为 16

    fServer = GetBoolArg("-server", false); // 5.服务选项，3.8.已设置为 true

    // block pruning; get the amount of disk space (in MiB) to allot for block & undo files // 6.区块修剪；获取磁盘空间量（以 MiB 为单位）以分配区块和撤销文件（用于恢复链状态的反向补丁）
    int64_t nSignedPruneTarget = GetArg("-prune", 0) * 1024 * 1024; // 0 表示禁止修剪区块
    if (nSignedPruneTarget < 0) {
        return InitError(_("Prune cannot be configured with a negative value."));
    }
    nPruneTarget = (uint64_t) nSignedPruneTarget; // 0 或大于 0
    if (nPruneTarget) { // 0 表示禁止，大于 0 表示开启修剪模式
        if (nPruneTarget < MIN_DISK_SPACE_FOR_BLOCK_FILES) { // 修剪得目标大于等于 550 MB，为什么？
            return InitError(strprintf(_("Prune configured below the minimum of %d MiB.  Please use a higher number."), MIN_DISK_SPACE_FOR_BLOCK_FILES / 1024 / 1024));
        }
        LogPrintf("Prune configured to target %uMiB on disk for block and undo files.\n", nPruneTarget / 1024 / 1024);
        fPruneMode = true;
    }

#ifdef ENABLE_WALLET
    bool fDisableWallet = GetBoolArg("-disablewallet", false); // 7.禁用钱包选项，默认关闭
#endif

    nConnectTimeout = GetArg("-timeout", DEFAULT_CONNECT_TIMEOUT); // 8.连接超时，默认 5000
    if (nConnectTimeout <= 0)
        nConnectTimeout = DEFAULT_CONNECT_TIMEOUT;

    // Fee-per-kilobyte amount considered the same as "free" // 9.每千字节的交易费被视为与“免费”相同
    // If you are mining, be careful setting this: // 如果你正在挖矿，小心设置该选项：
    // if you set it to zero then // 如果你设置该值为 0
    // a transaction spammer can cheaply fill blocks using // 一个粉尘交易发送者可以轻松使用 1 satoshi 交易费的交易来填充块。
    // 1-satoshi-fee transactions. It should be set above the real
    // cost to you of processing a transaction. // 该值应该设置为处理交易的成本之上。
    if (mapArgs.count("-minrelaytxfee")) // 最低中继交易费选项
    {
        CAmount n = 0;
        if (ParseMoney(mapArgs["-minrelaytxfee"], n) && n > 0)
            ::minRelayTxFee = CFeeRate(n);
        else
            return InitError(strprintf(_("Invalid amount for -minrelaytxfee=<amount>: '%s'"), mapArgs["-minrelaytxfee"]));
    }

    fRequireStandard = !GetBoolArg("-acceptnonstdtxn", !Params().RequireStandard());
    if (Params().RequireStandard() && !fRequireStandard)
        return InitError(strprintf("acceptnonstdtxn is not currently supported for %s chain", chainparams.NetworkIDString()));
    nBytesPerSigOp = GetArg("-bytespersigop", nBytesPerSigOp);

#ifdef ENABLE_WALLET
    if (mapArgs.count("-mintxfee")) // 最低交易费选项
    {
        CAmount n = 0;
        if (ParseMoney(mapArgs["-mintxfee"], n) && n > 0)
            CWallet::minTxFee = CFeeRate(n);
        else
            return InitError(strprintf(_("Invalid amount for -mintxfee=<amount>: '%s'"), mapArgs["-mintxfee"]));
    }
    if (mapArgs.count("-fallbackfee"))
    {
        CAmount nFeePerK = 0;
        if (!ParseMoney(mapArgs["-fallbackfee"], nFeePerK))
            return InitError(strprintf(_("Invalid amount for -fallbackfee=<amount>: '%s'"), mapArgs["-fallbackfee"]));
        if (nFeePerK > nHighTransactionFeeWarning)
            InitWarning(_("-fallbackfee is set very high! This is the transaction fee you may pay when fee estimates are not available."));
        CWallet::fallbackFee = CFeeRate(nFeePerK);
    }
    if (mapArgs.count("-paytxfee")) // 交易费选项
    {
        CAmount nFeePerK = 0;
        if (!ParseMoney(mapArgs["-paytxfee"], nFeePerK))
            return InitError(strprintf(_("Invalid amount for -paytxfee=<amount>: '%s'"), mapArgs["-paytxfee"]));
        if (nFeePerK > nHighTransactionFeeWarning)
            InitWarning(_("-paytxfee is set very high! This is the transaction fee you will pay if you send a transaction."));
        payTxFee = CFeeRate(nFeePerK, 1000);
        if (payTxFee < ::minRelayTxFee)
        {
            return InitError(strprintf(_("Invalid amount for -paytxfee=<amount>: '%s' (must be at least %s)"),
                                       mapArgs["-paytxfee"], ::minRelayTxFee.ToString()));
        }
    }
    if (mapArgs.count("-maxtxfee")) // 最高交易费选项
    {
        CAmount nMaxFee = 0;
        if (!ParseMoney(mapArgs["-maxtxfee"], nMaxFee))
            return InitError(strprintf(_("Invalid amount for -maxtxfee=<amount>: '%s'"), mapArgs["-maxtxfee"]));
        if (nMaxFee > nHighTransactionMaxFeeWarning)
            InitWarning(_("-maxtxfee is set very high! Fees this large could be paid on a single transaction."));
        maxTxFee = nMaxFee;
        if (CFeeRate(maxTxFee, 1000) < ::minRelayTxFee)
        {
            return InitError(strprintf(_("Invalid amount for -maxtxfee=<amount>: '%s' (must be at least the minrelay fee of %s to prevent stuck transactions)"),
                                       mapArgs["-maxtxfee"], ::minRelayTxFee.ToString()));
        }
    }
    nTxConfirmTarget = GetArg("-txconfirmtarget", DEFAULT_TX_CONFIRM_TARGET);
    bSpendZeroConfChange = GetBoolArg("-spendzeroconfchange", DEFAULT_SPEND_ZEROCONF_CHANGE);
    fSendFreeTransactions = GetBoolArg("-sendfreetransactions", DEFAULT_SEND_FREE_TRANSACTIONS);

    std::string strWalletFile = GetArg("-wallet", "wallet.dat"); // 指定的钱包文件名，默认为 "wallet.dat"
#endif // ENABLE_WALLET

    fIsBareMultisigStd = GetBoolArg("-permitbaremultisig", DEFAULT_PERMIT_BAREMULTISIG);
    fAcceptDatacarrier = GetBoolArg("-datacarrier", DEFAULT_ACCEPT_DATACARRIER);
    nMaxDatacarrierBytes = GetArg("-datacarriersize", nMaxDatacarrierBytes);

    fAlerts = GetBoolArg("-alerts", DEFAULT_ALERTS); // 转发选项，默认关闭

    // Option to startup with mocktime set (used for regression testing): // 选择使用 mocktime 设置启动（用于回归测试）：
    SetMockTime(GetArg("-mocktime", 0)); // SetMockTime(0) is a no-op // SetMockTime(0) 表示无操作

    if (GetBoolArg("-peerbloomfilters", true))
        nLocalServices |= NODE_BLOOM;

    fEnableReplacement = GetBoolArg("-mempoolreplacement", DEFAULT_ENABLE_REPLACEMENT);
    if ((!fEnableReplacement) && mapArgs.count("-mempoolreplacement")) {
        // Minimal effort at forwards compatibility // 向前兼容性的最小努力
        std::string strReplacementModeList = GetArg("-mempoolreplacement", "");  // default is impossible // 默认是不可能
        std::vector<std::string> vstrReplacementModes;
        boost::split(vstrReplacementModes, strReplacementModeList, boost::is_any_of(","));
        fEnableReplacement = (std::find(vstrReplacementModes.begin(), vstrReplacementModes.end(), "fee") != vstrReplacementModes.end());
    }
    ...
};
{% endhighlight %}

1.调试选项的相关设置。<br>
2.一些过时的（现已不支持的）选项检测。<br>
3.交易内存池和区块索引检测，以及交易内存池限制选项设置。<br>
4.脚本检测线程数。<br>
5.服务选项设置，在 3.8 已设置为 true。<br>
6.区块修剪。<br>
7.禁用钱包选项。<br>
8.连接超时选项。<br>
9.交易相关选项设置。

<p id="Step04-ref"></p>
3.11.4.第四步，应用程序初始化，涉及到椭圆曲线的初始化、数据目录锁、守护进程后台化、进程号文件、调试日志文件。
这部分代码实现在“init.cpp”文件的 `AppInit2(...)` 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.0.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 4: application initialization: dir lock, daemonize, pidfile, debug log // 初始化 ECC，目录锁检查（保证只有一个 bitcoind 运行），pid 文件，debug 日志

    // Initialize elliptic curve code // 1.初始化椭圆曲线代码
    ECC_Start(); // 椭圆曲线编码启动
    globalVerifyHandle.reset(new ECCVerifyHandle()); // 创建椭圆曲线验证对象

    // Sanity check // 2.完整性检查
    if (!InitSanityCheck()) // 初始化完整性检查 pending
        return InitError(_("Initialization sanity check failed. Bitcoin Core is shutting down."));

    std::string strDataDir = GetDataDir().string(); // 3.获取数据目录路径
#ifdef ENABLE_WALLET // 若开启钱包功能
    // Wallet file must be a plain filename without a directory // 钱包文件必须是没有目录的文件名
    if (strWalletFile != boost::filesystem::basename(strWalletFile) + boost::filesystem::extension(strWalletFile)) // 验证钱包文件名的完整性，basename 获取文件基础名 "wallet"，extension 获取文件扩展名 ".dat"
        return InitError(strprintf(_("Wallet %s resides outside data directory %s"), strWalletFile, strDataDir));
#endif // 钱包名校验结束
    // Make sure only a single Bitcoin process is using the data directory. // 确保只有一个比特币进程使用该数据目录。
    boost::filesystem::path pathLockFile = GetDataDir() / ".lock"; // 空的 lock 隐藏文件，作用：作为临界资源，保证当前只有一个 Bitcoin 进程使用数据目录
    FILE* file = fopen(pathLockFile.string().c_str(), "a"); // empty lock file; created if it doesn't exist.
    if (file) fclose(file); // 若文件正常打开则关闭该空文件

    try {
        static boost::interprocess::file_lock lock(pathLockFile.string().c_str()); // 初始化文件锁对象
        if (!lock.try_lock()) // 上锁
            return InitError(strprintf(_("Cannot obtain a lock on data directory %s. Bitcoin Core is probably already running."), strDataDir)); // 第二个进程会在这里上锁失败并退出
    } catch(const boost::interprocess::interprocess_exception& e) {
        return InitError(strprintf(_("Cannot obtain a lock on data directory %s. Bitcoin Core is probably already running.") + " %s.", strDataDir, e.what()));
    }

#ifndef WIN32
    CreatePidFile(GetPidFile(), getpid()); // 4.非 win32 环境下，创建 pid 文件（记录当前 bitcoind 的进程号）
#endif
    if (GetBoolArg("-shrinkdebugfile", !fDebug)) // 5.收缩调试日志文件
        ShrinkDebugFile(); // pending

    if (fPrintToDebugLog) // 打印到调试日志标志，默认打开
        OpenDebugLog(); // pending

#ifdef ENABLE_WALLET
    LogPrintf("Using BerkeleyDB version %s\n", DbEnv::version(0, 0, 0)); // 6.钱包使用 BerkeleyDB
#endif
    if (!fLogTimestamps) // 时间戳标志，默认开启
        LogPrintf("Startup time: %s\n", DateTimeStrFormat("%Y-%m-%d %H:%M:%S", GetTime())); // 记录启动时间
    LogPrintf("Default data directory %s\n", GetDefaultDataDir().string()); // 记录默认数据目录
    LogPrintf("Using data directory %s\n", strDataDir); // 记录当前指定使用的数据目录
    LogPrintf("Using config file %s\n", GetConfigFile().string()); // 记录使用的配置文件
    LogPrintf("Using at most %i connections (%i file descriptors available)\n", nMaxConnections, nFD); // 记录最大连接数（可用的文件描述符数量）
    std::ostringstream strErrors; // 错误信息的字符串输出流

    LogPrintf("Using %u threads for script verification\n", nScriptCheckThreads); // 记录脚本验证线程数（默认为 CPU 核数）
    if (nScriptCheckThreads) { // 7.创建相应数量的脚本验证线程
        for (int i=0; i<nScriptCheckThreads-1; i++)
            threadGroup.create_thread(&ThreadScriptCheck); // CCheckQueue 类中的 loop 成员函数 pending
    }

    // Start the lightweight task scheduler thread // 8.启动轻量级任务调度线程
    CScheduler::Function serviceLoop = boost::bind(&CScheduler::serviceQueue, &scheduler); // Function/bind 绑定类成员函数 serviceQueue 到函数对象 serviceLoop
    threadGroup.create_thread(boost::bind(&TraceThread<CScheduler::Function>, "scheduler", serviceLoop)); // 线程组 threadGroup 创建一个轻量级任务调度线程

    /* Start the RPC server already.  It will be started in "warmup" mode
     * and not really process calls already (but it will signify connections
     * that the server is there and will be ready later).  Warmup mode will
     * be disabled when initialisation is finished.
     */ // 9.已经启动 RPC 服务。将以“预热”模式启动，而非真正地处理调用（但它表示服务器的连接并在之后准备好）。初始化完成后预热模式将被关闭。
    if (fServer) // 服务标志，默认打开
    {
        uiInterface.InitMessage.connect(SetRPCWarmupStatus); // 注册 设置 RPC 预热状态函数
        if (!AppInitServers(threadGroup)) // 应用程序初始化服务（启动 HTTP、RPC 相关服务）
            return InitError(_("Unable to start HTTP server. See debug log for details."));
    }

    int64_t nStart; // 启动标志
    ...
};
{% endhighlight %}

1.[初始化椭圆曲线代码。](/2018/06/30/bitcoin-source-anatomy-06#Init-ref)<br>
2.[初始化完整性检查。](/2018/07/07/bitcoin-source-anatomy-07#InitSanityCheck-ref)<br>
3.[数据目录上锁。](/2018/07/07/bitcoin-source-anatomy-07#DataDirLock-ref)<br>
4.[非 `WIN32` 环境，创建进程号文件。](/2018/07/07/bitcoin-source-anatomy-07#CreatePidFile-ref)<br>
5.[处理调试日志文件。](/2018/07/07/bitcoin-source-anatomy-07#ShrinkOrOpenDebugLogFile-ref)<br>
6.记录相关初始化信息到日志输出。<br>
7.[创建脚本验证线程。](/2018/07/14/bitcoin-source-anatomy-08#ThreadScriptCheck-ref)<br>
8.[创建轻量级任务调度线程。](/2018/07/14/bitcoin-source-anatomy-08#serviceQueue-ref)<br>
9.[启动 RPC 服务。](/2018/07/21/bitcoin-source-anatomy-09#AppInitServers-ref)

未完待续...<br>
请看下一篇[比特币源码剖析（六）](/2018/06/30/bitcoin-source-anatomy-06)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
