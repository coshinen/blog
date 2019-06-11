---
layout: post
title:  "比特币源码剖析（四）"
date:   2018-06-16 16:21:35 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了数据目录路径的获取、配置文件中设置的启动选项的读取、不同网络链参数（包含创世区块信息）的选择、命令行参数完整性检测、Linux 下守护进程的后台化以及服务选项的设置，详见[比特币源码剖析（三）](/blog/2018/06/bitcoin-source-anatomy-03.html)。<br>
本篇主要分析 InitLogging() 初始化日志记录函数，InitParameterInteraction() 初始化参数交互函数，AppInit2(threadGroup, scheduler) 真正地初始化应用程序函数。

## 源码剖析

{% highlight C++ %}
bool AppInit(int argc, char* argv[]) // [P]3.0.应用程序初始化
{
    ...
    try
    {
        ...
        // Set this early so that parameter interactions go to console // 尽早设置该项使参数交互到控制台
        InitLogging(); // 3.9.初始化日志记录
        InitParameterInteraction(); // 3.10.初始化参数交互
        fRet = AppInit2(threadGroup, scheduler); // 3.11.应用程序初始化 2（本物入口）
    }
    catch (const std::exception& e) {
        PrintExceptionContinue(&e, "AppInit()");
    } catch (...) {
        PrintExceptionContinue(NULL, "AppInit()");
    }
    ...
}
{% endhighlight %}

<p id="InitLogging-ref"></p>
3.9.调用 InitLogging() 函数初始化日志记录，实际上只是初始化了部分启动选项，该函数声明在“init.h”文件中。

{% highlight C++ %}
//!Initialize the logging infrastructure // 初始化日志记录基础结构
void InitLogging();
{% endhighlight %}

实现在“init.cpp”文件中，没有入参。

{% highlight C++ %}
void InitLogging()
{
    fPrintToConsole = GetBoolArg("-printtoconsole", false); // 1.打印到控制台，默认关闭
    fLogTimestamps = GetBoolArg("-logtimestamps", DEFAULT_LOGTIMESTAMPS); // 记录日志时间戳，默认打开
    fLogTimeMicros = GetBoolArg("-logtimemicros", DEFAULT_LOGTIMEMICROS); // 时间戳微秒，默认关闭
    fLogIPs = GetBoolArg("-logips", DEFAULT_LOGIPS); // 记录 IPs，默认关闭

    LogPrintf("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"); // 2.n 个空行
    LogPrintf("Bitcoin version %s (%s)\n", FormatFullVersion(), CLIENT_DATE); // 记录比特币客户端版本号和构建时间
}
{% endhighlight %}

1.对记录日志的相关启动选项进行初始化。<br>
2.空出 n 行后，记录比特币客户端的版本号和构建时间。

宏定义 DEFAULT_LOGTIMESTAMPS、DEFAULT_LOGTIMEMICROS、DEFAULT_LOGIPS 均定义在“util.h”文件中。

{% highlight C++ %}
static const bool DEFAULT_LOGTIMEMICROS = false; // 时间戳微秒，默认为 false
static const bool DEFAULT_LOGIPS        = false; // 记录 IPs，默认关闭
static const bool DEFAULT_LOGTIMESTAMPS = true; // 记录时间戳，默认为 true
{% endhighlight %}

CLIENT_DATE 宏定义在“clientversion.cpp”文件中。

{% highlight C++ %}
#ifndef BUILD_DATE
#ifdef GIT_COMMIT_DATE
#define BUILD_DATE GIT_COMMIT_DATE // git 提交日期
#else
#define BUILD_DATE __DATE__ ", " __TIME__ // __DATE__ 为编译日期，__TIME__ 为编译时间
#endif
#endif
...
const std::string CLIENT_DATE(BUILD_DATE); // 客户端日期即构建日期
{% endhighlight %}

<p id="InitParameterInteraction-ref"></p>
3.10.调用 InitParameterInteraction() 函数初始化参数交互，该函数声明在“init.h”文件中。

{% highlight C++ %}
//!Parameter interaction: change current parameters depending on various rules // 参数交互：基于多种规则改变当前参数
void InitParameterInteraction();
{% endhighlight %}

实现在“init.cpp”文件中，没有入参。

{% highlight C++ %}
// Parameter interaction based on rules // 基于规则的参数交互
void InitParameterInteraction()
{
    // when specifying an explicit binding address, you want to listen on it
    // even when -connect or -proxy is specified
    if (mapArgs.count("-bind")) {
        if (SoftSetBoolArg("-listen", true))
            LogPrintf("%s: parameter interaction: -bind set -> setting -listen=1\n", __func__);
    }
    if (mapArgs.count("-whitebind")) {
        if (SoftSetBoolArg("-listen", true))
            LogPrintf("%s: parameter interaction: -whitebind set -> setting -listen=1\n", __func__);
    }

    if (mapArgs.count("-connect") && mapMultiArgs["-connect"].size() > 0) {
        // when only connecting to trusted nodes, do not seed via DNS, or listen by default
        if (SoftSetBoolArg("-dnsseed", false))
            LogPrintf("%s: parameter interaction: -connect set -> setting -dnsseed=0\n", __func__);
        if (SoftSetBoolArg("-listen", false))
            LogPrintf("%s: parameter interaction: -connect set -> setting -listen=0\n", __func__);
    }

    if (mapArgs.count("-proxy")) {
        // to protect privacy, do not listen by default if a default proxy server is specified
        if (SoftSetBoolArg("-listen", false))
            LogPrintf("%s: parameter interaction: -proxy set -> setting -listen=0\n", __func__);
        // to protect privacy, do not use UPNP when a proxy is set. The user may still specify -listen=1
        // to listen locally, so don't rely on this happening through -listen below.
        if (SoftSetBoolArg("-upnp", false))
            LogPrintf("%s: parameter interaction: -proxy set -> setting -upnp=0\n", __func__);
        // to protect privacy, do not discover addresses by default
        if (SoftSetBoolArg("-discover", false))
            LogPrintf("%s: parameter interaction: -proxy set -> setting -discover=0\n", __func__);
    }

    if (!GetBoolArg("-listen", DEFAULT_LISTEN)) {
        // do not map ports or try to retrieve public IP when not listening (pointless)
        if (SoftSetBoolArg("-upnp", false))
            LogPrintf("%s: parameter interaction: -listen=0 -> setting -upnp=0\n", __func__);
        if (SoftSetBoolArg("-discover", false))
            LogPrintf("%s: parameter interaction: -listen=0 -> setting -discover=0\n", __func__);
        if (SoftSetBoolArg("-listenonion", false))
            LogPrintf("%s: parameter interaction: -listen=0 -> setting -listenonion=0\n", __func__);
    }

    if (mapArgs.count("-externalip")) {
        // if an explicit public IP is specified, do not try to find others
        if (SoftSetBoolArg("-discover", false))
            LogPrintf("%s: parameter interaction: -externalip set -> setting -discover=0\n", __func__);
    }

    if (GetBoolArg("-salvagewallet", false)) {
        // Rewrite just private keys: rescan to find transactions
        if (SoftSetBoolArg("-rescan", true))
            LogPrintf("%s: parameter interaction: -salvagewallet=1 -> setting -rescan=1\n", __func__);
    }

    // -zapwallettx implies a rescan
    if (GetBoolArg("-zapwallettxes", false)) {
        if (SoftSetBoolArg("-rescan", true))
            LogPrintf("%s: parameter interaction: -zapwallettxes=<mode> -> setting -rescan=1\n", __func__);
    }

    // disable walletbroadcast and whitelistrelay in blocksonly mode
    if (GetBoolArg("-blocksonly", DEFAULT_BLOCKSONLY)) {
        if (SoftSetBoolArg("-whitelistrelay", false))
            LogPrintf("%s: parameter interaction: -blocksonly=1 -> setting -whitelistrelay=0\n", __func__);
#ifdef ENABLE_WALLET
        if (SoftSetBoolArg("-walletbroadcast", false))
            LogPrintf("%s: parameter interaction: -blocksonly=1 -> setting -walletbroadcast=0\n", __func__);
#endif
    }

    // Forcing relay from whitelisted hosts implies we will accept relays from them in the first place.
    if (GetBoolArg("-whitelistforcerelay", DEFAULT_WHITELISTFORCERELAY)) {
        if (SoftSetBoolArg("-whitelistrelay", true))
            LogPrintf("%s: parameter interaction: -whitelistforcerelay=1 -> setting -whitelistrelay=1\n", __func__);
    }
}
{% endhighlight %}

<p id="AppInit2-ref"></p>
3.11.调用 AppInit2(threadGroup, scheduler) 函数初始化应用程序，这里才是初始化真正的入口，该函数声明在“init.h”文件中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler);
{% endhighlight %}

<p id="Step01-ref"></p>
实现在“init.cpp”文件中，入参为：线程组对象，调度器对象。<br>
3.11.1.第一步：安装。主要初始化网络环境，注册信号处理函数。

{% highlight C++ %}
/** Initialize bitcoin.
 *  @pre Parameters should be parsed and config file should be read.
 */ // 初始化比特币。前提：参数应该被解析，配置文件应该被读取。
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.0.程序初始化，共 12 步
{
    // ********************************************************* Step 1: setup // 初始化网络环境，注册信号处理函数
#ifdef _MSC_VER // 1.设置 log 的输出级别为 WARNING 和 log 的输出文件
    // Turn off Microsoft heap dump noise // 关闭微软堆转储提示音
    _CrtSetReportMode(_CRT_WARN, _CRTDBG_MODE_FILE);
    _CrtSetReportFile(_CRT_WARN, CreateFileA("NUL", GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, 0));
#endif
#if _MSC_VER >= 1400 // 2.处理中断消息
    // Disable confusing "helpful" text message on abort, Ctrl-C // 禁用 Ctrl-C 崩溃时烦人的“帮助”文本消息
    _set_abort_behavior(0, _WRITE_ABORT_MSG | _CALL_REPORTFAULT);
#endif
#ifdef WIN32
    // Enable Data Execution Prevention (DEP) // 3.启用数据执行保护（DEP）
    // Minimum supported OS versions: WinXP SP3, WinVista >= SP1, Win Server 2008
    // A failure is non-critical and needs no further attention! // 失败不重要，不需要在意！
#ifndef PROCESS_DEP_ENABLE
    // We define this here, because GCCs winbase.h limits this to _WIN32_WINNT >= 0x0601 (Windows 7), // 我们在这里定义它，因为 GCCs winbase.h 将此限制到 _WIN32_WINNT >= 0x0601 (Windows 7)，
    // which is not correct. Can be removed, when GCCs winbase.h is fixed! // 这是错误的。GCCs winbase.h 修复时可以删除
#define PROCESS_DEP_ENABLE 0x00000001
#endif
    typedef BOOL (WINAPI *PSETPROCDEPPOL)(DWORD);
    PSETPROCDEPPOL setProcDEPPol = (PSETPROCDEPPOL)GetProcAddress(GetModuleHandleA("Kernel32.dll"), "SetProcessDEPPolicy");
    if (setProcDEPPol != NULL) setProcDEPPol(PROCESS_DEP_ENABLE);
#endif

    if (!SetupNetworking()) // 4.设置 Windows 套接字
        return InitError("Initializing networking failed");

#ifndef WIN32 // 5.非 WIN32 平台，处理文件权限和相关信号
    if (GetBoolArg("-sysperms", false)) { // 若设置了系统文件权限
#ifdef ENABLE_WALLET // 若启用了钱包
        if (!GetBoolArg("-disablewallet", false)) // 且未关闭钱包功能
            return InitError("-sysperms is not allowed in combination with enabled wallet functionality");
#endif
    } else {
        umask(077); // 设置掩码
    }

    // Clean shutdown on SIGTERM // 在 SIGTERM 信号下清空关闭
    struct sigaction sa;
    sa.sa_handler = HandleSIGTERM;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    sigaction(SIGTERM, &sa, NULL);
    sigaction(SIGINT, &sa, NULL);

    // Reopen debug.log on SIGHUP // 在 SIGHUP 信号下重新打开 debug.log 文件
    struct sigaction sa_hup;
    sa_hup.sa_handler = HandleSIGHUP;
    sigemptyset(&sa_hup.sa_mask);
    sa_hup.sa_flags = 0;
    sigaction(SIGHUP, &sa_hup, NULL);

    // Ignore SIGPIPE, otherwise it will bring the daemon down if the client closes unexpectedly
    signal(SIGPIPE, SIG_IGN); // 忽略 SIGPIPE 信号，否则如果客户端异常关闭它会使守护进程关闭
#endif
    ...
};
{% endhighlight %}

1.关闭微软堆转储提示音。<br>
2.关闭中断提示消息。<br>
3.启用数据执行保护（DEP）。<br>
4.设置网络，Windows 下初始套接字，其它平台直接返回 true。<br>
5.非 WIN32 平台，设置系统文件权限掩码，处理相关信号。

4.调用 SetupNetworking() 函数设置网络，该函数声明在“util.h”文件中。

{% highlight C++ %}
bool SetupNetworking(); // 初始化 Windows 套接字
{% endhighlight %}

实现在“util.cpp”文件中，没有入参。

{% highlight C++ %}
bool SetupNetworking()
{
#ifdef WIN32
    // Initialize Windows Sockets // 初始化 Windows 套接字
    WSADATA wsadata;
    int ret = WSAStartup(MAKEWORD(2,2), &wsadata);
    if (ret != NO_ERROR || LOBYTE(wsadata.wVersion ) != 2 || HIBYTE(wsadata.wVersion) != 2)
        return false;
#endif
    return true; // 非 WIN32 系统直接返回 true
}
{% endhighlight %}

<p id="Step02-ref"></p>
3.11.2.第二步，参数交互。主要进行区块裁剪和交易索引选项的冲突检测，文件描述符限制检测。
这部分实现在“init.cpp”文件的 AppInit2(...) 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.0.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 2: parameter interactions // 参数交互设置，如：区块裁剪 prune 与交易索引 txindex 的冲突检测、文件描述符限制的检查
    const CChainParams& chainparams = Params(); // 1.获取当前的链参数

    // also see: InitParameterInteraction()

    // if using block pruning, then disable txindex // 2.如果使用区块修剪，需要禁止交易索引
    if (GetArg("-prune", 0)) { // 修剪模式（禁用交易索引），默认关闭
        if (GetBoolArg("-txindex", DEFAULT_TXINDEX)) // 交易索引（与修剪模式不兼容），默认关闭
            return InitError(_("Prune mode is incompatible with -txindex.")); // 不兼容的原因：修剪模式只保留区块头，而区块体包含的是交易索引 txid
#ifdef ENABLE_WALLET // 若开启了钱包
        if (GetBoolArg("-rescan", false)) { // 再扫描（修剪模式下不能使用，你可以使用 -reindex 再次下载整个区块链），默认关闭
            return InitError(_("Rescans are not possible in pruned mode. You will need to use -reindex which will download the whole blockchain again."));
        }
#endif
    }

    // Make sure enough file descriptors are available // 3.确保足够的文件描述符可用
    int nBind = std::max((int)mapArgs.count("-bind") + (int)mapArgs.count("-whitebind"), 1); // bind 占用的文件描述符数量
    int nUserMaxConnections = GetArg("-maxconnections", DEFAULT_MAX_PEER_CONNECTIONS); // 最大连入数，默认 125
    nMaxConnections = std::max(nUserMaxConnections, 0); // 记录最大连接数，默认为 125

    // Trim requested connection counts, to fit into system limitations // 修剪请求的连接数，以适应系统限制
    nMaxConnections = std::max(std::min(nMaxConnections, (int)(FD_SETSIZE - nBind - MIN_CORE_FILEDESCRIPTORS)), 0); // Linux 下一个进程同时打开的文件描述的数量为 1024，使用 ulimit -a/-n 查看
    int nFD = RaiseFileDescriptorLimit(nMaxConnections + MIN_CORE_FILEDESCRIPTORS); // windows 下直接返回 2048，linux 下返回成功提升后的值 nMaxConnections + MIN_CORE_FILEDESCRIPTORS
    if (nFD < MIN_CORE_FILEDESCRIPTORS) // 可用描述符数量不能低于 0
        return InitError(_("Not enough file descriptors available."));
    nMaxConnections = std::min(nFD - MIN_CORE_FILEDESCRIPTORS, nMaxConnections); // 选取提升前后较小的数

    if (nMaxConnections < nUserMaxConnections) // 若提升后低于 125 个，发出警告，可能是由于系统限制导致的数量减少
        InitWarning(strprintf(_("Reducing -maxconnections from %d to %d, because of system limitations."), nUserMaxConnections, nMaxConnections));
    ...
};
{% endhighlight %}

1.获取当前选取的区块链参数。<br>
2.检查区块修剪和交易索引选项设置是否冲突。<br>
3.检查进程打开的文件描述符数量。

DEFAULT_TXINDEX 定义在“main.h”文件中。

{% highlight C++ %}
static const bool DEFAULT_TXINDEX = false; // 交易索引，默认关闭
{% endhighlight %}

DEFAULT_MAX_PEER_CONNECTIONS 定义在“net.h”文件中。

{% highlight C++ %}
/** The maximum number of peer connections to maintain. */ // 要维护的最大对端连接数
static const unsigned int DEFAULT_MAX_PEER_CONNECTIONS = 125;
{% endhighlight %}

FD_SETSIZE 定义在“compat.h”文件中。

{% highlight C++ %}
#define FD_SETSIZE 1024 // max number of fds in fd_set // fd_set 中 fds 的最大数量
{% endhighlight %}

MIN_CORE_FILEDESCRIPTORS 定义在“init.cpp”文件中。

{% highlight C++ %}
#ifdef WIN32
// Win32 LevelDB doesn't use filedescriptors, and the ones used for
// accessing block files don't count towards the fd_set size limit
// anyway. // Win32 LevelDB 不使用文件描述符，用于访问块文件的不会计入 fd_set 大小限制。
#define MIN_CORE_FILEDESCRIPTORS 0 // Windows
#else
#define MIN_CORE_FILEDESCRIPTORS 150 // UNIX/Linux
#endif
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（五）](/blog/2018/06/bitcoin-source-anatomy-05.html)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
