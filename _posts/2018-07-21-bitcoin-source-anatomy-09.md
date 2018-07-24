---
layout: post
title:  "比特币源码剖析（九）"
date:   2018-07-21 23:05:28 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin src
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 概要
上一篇分析了应用程序初始化中创建脚本验证的线程函数，详见[比特币源码剖析（八）](/2018/07/14/bitcoin-source-anatomy-08)。<br>
本篇主要分析 `Step 4: application initialization: dir lock, daemonize, pidfile, debug log` 第四步应用程序初始中创建轻量级任务调度线程的详细过程。

## 源码剖析

<p id="serviceQueue-ref"></p>
8.创建轻量级任务调度线程，这部分代码实现在“init.cpp”文件的 `AppInit2(...)` 函数的第四步 `Step 4: application initialization: dir lock, daemonize, pidfile, debug log`。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // Start the lightweight task scheduler thread // 8.启动轻量级任务调度线程
    CScheduler::Function serviceLoop = boost::bind(&CScheduler::serviceQueue, &scheduler); // 8.1.Function/bind 绑定类成员函数 serviceQueue 到函数对象 serviceLoop
    threadGroup.create_thread(boost::bind(&TraceThread<CScheduler::Function>, "scheduler", serviceLoop)); // 8.2.线程组 threadGroup 创建一个轻量级任务调度线程
    ...
}
{% endhighlight %}

8.1.`Function/bind` 绑定线程函数 `CScheduler::serviceQueue` 到函数对象 `serviceLoop`。<br>
8.2.创建一个轻量级任务调度线程加入线程组 `threadGroup`。

线程函数 `CScheduler::serviceQueue` 声明在“scheduler.h”文件的 `CScheduler` 类中。

{% highlight C++ %}
class CScheduler // 调度器类
{
public:
    ...
    typedef boost::function<void(void)> Function;
    ...
    // To keep things as simple as possible, there is no unschedule. // 为了使事情尽可能的简单，这里没有调度。

    // Services the queue 'forever'. Should be run in a thread, // “永远”服务队列。应该运行一个线程，
    // and interrupted using boost::interrupt_thread // 并使用 boost::interrupt_thread 打断。
    void serviceQueue(); // scheduler 调度器线程函数循环主体
    ...
private:
    std::multimap<boost::chrono::system_clock::time_point, Function> taskQueue; // 任务队列
    boost::condition_variable newTaskScheduled; // 任务队列条件变量
    mutable boost::mutex newTaskMutex; // 任务队列锁
    int nThreadsServicingQueue; // 记录服务队列的线程数
    ...
}
{% endhighlight %}

实现在“scheduler.cpp”文件中，没有入参。

{% highlight C++ %}
void CScheduler::serviceQueue()
{
    boost::unique_lock<boost::mutex> lock(newTaskMutex); // 1.上锁，保证函数线程安全
    ++nThreadsServicingQueue; // 2.使用队列的线程数加 1

    // newTaskMutex is locked throughout this loop EXCEPT
    // when the thread is waiting or when the user's function
    // is called. // 当线程正在等待或调用用户函数时，newTaskMutex 在整个循环中锁定。
    while (!shouldStop()) { // 3.loop
        try {
            while (!shouldStop() && taskQueue.empty()) { // 3.1.任务队列为空
                // Wait until there is something to do. // 等待直到这里有事可做（任务队列非空）。
                newTaskScheduled.wait(lock); // 等待条件满足
            }

            // Wait until either there is a new task, or until // 等待直到有一个新任务，
            // the time of the first item on the queue: // 或直到队列中首个项目超时：

// wait_until needs boost 1.50 or later; older versions have timed_wait: // wait_until 需要 boost 1.50 或更新版本；旧版本有 timed_wait：
#if BOOST_VERSION < 105000 // 任务队列非空
            while (!shouldStop() && !taskQueue.empty() &&
                   newTaskScheduled.timed_wait(lock, toPosixTime(taskQueue.begin()->first))) { // 3.2.获取新任务的 key（时间），进行等待
                // Keep waiting until timeout // 等待直到超时
            }
#else // 高版本 boost 库
            // Some boost versions have a conflicting overload of wait_until that returns void. // 一些 boost 版本有一个 wait_until 冲突的重载函数，返回 void。
            // Explicitly use a template here to avoid hitting that overload. // 精确使用模板以避免方式发生重载。
            while (!shouldStop() && !taskQueue.empty() &&
                   newTaskScheduled.wait_until<>(lock, taskQueue.begin()->first) != boost::cv_status::timeout) { // 105000 之后的 boost 版本
                // Keep waiting until timeout // 等待直到超时
            }
#endif
            // If there are multiple threads, the queue can empty while we're waiting (another // 如果这里有多个线程，队列可在我们等待时清空
            // thread may service the task we were waiting on). // （另一个线程可在我们等待时取任务）。
            if (shouldStop() || taskQueue.empty()) // 3.3.任务队列被清空
                continue; // 跳过本次循环

            Function f = taskQueue.begin()->second; // 3.4.获取队列中第一个任务
            taskQueue.erase(taskQueue.begin()); // 清除该任务

            {
                // Unlock before calling f, so it can reschedule itself or another task
                // without deadlocking: // 在调用 f 之前解锁，以至于它能重新安排自己或其他任务而不会死锁：
                reverse_lock<boost::unique_lock<boost::mutex> > rlock(lock); // 3.5.在调用 f 前解锁，防止死锁
                f(); // 执行任务
            }
        } catch (...) {
            --nThreadsServicingQueue; // 使用任务队列的线程数减 1
            throw;
        }
    } // end of loop
    --nThreadsServicingQueue; // 4.使用任务队列的线程数减 1
}
{% endhighlight %}

1.任务队列上锁。<br>
2.使用队列的线程数加 1。<br>
3.线程函数循环体。<br>
3.1.当任务队列为空时，等待条件满足。<br>
3.2.超时等待。<br>
3.3.若任务队列被清空，跳过本次循环。<br>
3.4.取出队列中第一个任务。<br>
3.5.解锁并执行该任务。<br>
4.使用任务队列的线程数减 1。

3.5.调用模板类 `reverse_lock` 创建对象，执行反转锁操作：它提供 `RAII` 功能，在构造时解锁并在析构时上锁。
另外，它会临时转移所有权，所以互斥锁不能用该锁锁定。其实例永远不会持有锁。详见 [`reverse_lock`](https://www.boost.org/doc/libs/1_65_0/doc/html/thread/synchronization.html#thread.synchronization.other_locks.reverse_lock)。

<p id="AppInitServers-ref"></p>
9.，这部分代码实现在“init.cpp”文件的 `AppInit2(...)` 函数的第四步 `Step 4: application initialization: dir lock, daemonize, pidfile, debug log`。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    /* Start the RPC server already.  It will be started in "warmup" mode
     * and not really process calls already (but it will signify connections
     * that the server is there and will be ready later).  Warmup mode will
     * be disabled when initialisation is finished.
     */ // 9.已经启动 RPC 服务。将以“预热”模式启动，而非已经真正地开始处理调用（但它表示服务器的连接并在之后准备好）。初始化完成后预热模式将被关闭。
    if (fServer) // 服务标志，默认打开，-server 选项，为 -cli 提供服务
    {
        uiInterface.InitMessage.connect(SetRPCWarmupStatus); // 9.1.注册设置 RPC 预热状态函数
        if (!AppInitServers(threadGroup)) // 9.2.应用程序初始化服务（启动 HTTP、RPC 相关服务）
            return InitError(_("Unable to start HTTP server. See debug log for details."));
    }

    int64_t nStart; // 启动标志
    ...
}
{% endhighlight %}

9.1.连接设置 `RPC` 预热状态函数。<br>
9.2.应用程序初始化服务（`HTTP`、`RPC`）。

9.1.调用 `uiInterface.InitMessage.connect(SetRPCWarmupStatus)` 函数把信号连接到处理函数 `SetRPCWarmupStatus` 上。
该处理函数声明在“rpcserver.h”文件中。

{% highlight C++ %}
**
 * Set the RPC warmup status.  When this is done, all RPC calls will error out
 * immediately with RPC_IN_WARMUP.
 */ // 设置 RPC 预热新状态。当这步完成时，全部 RPC 调用将立刻使用 RPC_IN_WARMUP 错误输出。
void SetRPCWarmupStatus(const std::string& newStatus);
{% endhighlight %}

实现在“rpcserver.cpp”文件中，入参为：新的 `RPC` 热身状态。

{% highlight C++ %}
static std::string rpcWarmupStatus("RPC server started"); // 全局静态 rpc 预热状态字符串
static CCriticalSection cs_rpcWarmup; // rpc 预热状态锁
...
void SetRPCWarmupStatus(const std::string& newStatus)
{
    LOCK(cs_rpcWarmup); // rpc 预热状态上锁
    rpcWarmupStatus = newStatus; // 设置新状态
}
{% endhighlight %}

9.2.调用 `AppInitServers(threadGroup)` 函数初始化服务设置，该服务用于和客户端命令行 `RPC` 通讯。
该函数定义在“init.cpp”文件中。

{% highlight C++ %}
bool AppInitServers(boost::thread_group& threadGroup)
{
    RPCServer::OnStopped(&OnRPCStopped); // 1.连接停止 `RPC` 信号函数
    RPCServer::OnPreCommand(&OnRPCPreCommand); // 2.连接监控 `RPC` 安全模式信号函数
    if (!InitHTTPServer()) //3. 初始化 HTTP 服务
        return false;
    if (!StartRPC()) // 4.启动 RPC 远程过程调用
        return false;
    if (!StartHTTPRPC()) // 5.启动 HTTP RPC（这里注册的 RPC 处理函数）
        return false;
    if (GetBoolArg("-rest", DEFAULT_REST_ENABLE) && !StartREST()) // 6.启动 REST 服务，默认关闭
        return false;
    if (!StartHTTPServer()) // 7.启动 HTTP 服务
        return false;
    return true;
}
{% endhighlight %}

9.2.1.连接停止 `RPC` 信号函数。<br>
9.2.2.连接监控 `RPC` 安全模式信号函数。<br>
9.2.3.初始化 `HTTP` 服务。<br>
9.2.4.启动 `RPC`。<br>
9.2.5.启动 `HTTPRPC`。<br>
9.2.6.启动 `REST`。<br>
9.2.7.启动 `HTTP` 服务。

9.2.1.调用 `RPCServer::OnStopped(&OnRPCStopped)` 函数设置的回调函数，用于停止 `RPC`，内部还是连接信号函数。<br>
9.2.2.调用 `RPCServer::OnPreCommand(&OnRPCPreCommand)` 函数设置的回调函数，用于监控 `RPC` 安全模式。
`OnStopped` 和 `OnPreCommand` 均声明在“rpcserver.h”文件的 `RPCServer` 命名空间中。

{% highlight C++ %}
namespace RPCServer // RPC 服务
{
    void OnStarted(boost::function<void ()> slot);
    void OnStopped(boost::function<void ()> slot);
    void OnPreCommand(boost::function<void (const CRPCCommand&)> slot);
    void OnPostCommand(boost::function<void (const CRPCCommand&)> slot);
}
{% endhighlight %}

实现在“rpcserver.cpp”文件中，入参为：指定函数标签的函数入口。

{% highlight C++ %}
static struct CRPCSignals // RPC 信号
{
    boost::signals2::signal<void ()> Started;
    boost::signals2::signal<void ()> Stopped;
    boost::signals2::signal<void (const CRPCCommand&)> PreCommand;
    boost::signals2::signal<void (const CRPCCommand&)> PostCommand;
} g_rpcSignals; // rpc 信号全局对象
...
void RPCServer::OnStopped(boost::function<void ()> slot)
{
    g_rpcSignals.Stopped.connect(slot);
}

void RPCServer::OnPreCommand(boost::function<void (const CRPCCommand&)> slot)
{
    g_rpcSignals.PreCommand.connect(boost::bind(slot, _1));
}
{% endhighlight %}

信号函数 `OnRPCStopped` 和 `OnRPCPreCommand` 均定义在“init.cpp”文件中。

{% highlight C++ %}
void OnRPCStopped()
{
    cvBlockChange.notify_all(); // 通知所有等待条件 cvBlockChange 的线程
    LogPrint("rpc", "RPC stopped.\n"); // 记录日志
}

void OnRPCPreCommand(const CRPCCommand& cmd)
{
    // Observe safe mode // 监控安全模式
    string strWarning = GetWarnings("rpc"); // 获取 rpc 警告信息
    if (strWarning != "" && !GetBoolArg("-disablesafemode", DEFAULT_DISABLE_SAFEMODE) &&
        !cmd.okSafeMode) // 若有警告信息 且 未禁用安全模式 且 RPC 命令非安全模式命令
        throw JSONRPCError(RPC_FORBIDDEN_BY_SAFE_MODE, string("Safe mode: ") + strWarning); // 抛出异常
}
{% endhighlight %}

`cvBlockChange` 是一个条件变量，定义在“main.cpp”文件中，在“main.h”文件中引用。

{% highlight C++ %}
/** Just a typedef for boost::condition_variable, can be wrapped later if desired */
typedef boost::condition_variable CConditionVariable; // 只是一个定义类型的 boost 条件变量，如果需要可以在稍后包装
{% endhighlight %}

其类型定义在“sync.h”文件中。

{% highlight C++ %}
CConditionVariable cvBlockChange; // 区块改变的条件变量
{% endhighlight %}

类 `CRPCCommand` 定义在“rpcserver.h”文件中。

{% highlight C++ %}
typedef UniValue(*rpcfn_type)(const UniValue& params, bool fHelp); // RPC 命令对应函数行为的回调函数

class CRPCCommand // RPC 命令类
{
public:
    std::string category; // 所属类别
    std::string name; // 名称
    rpcfn_type actor; // 对应的函数行为
    bool okSafeMode; // 是否开启安全模式
};
{% endhighlight %}

9.2.3.调用 `InitHTTPServer()` 函数初始化 `HTTP` 服务，声明在“httpserver.h”文件中。

{% highlight C++ %}
/** Initialize HTTP server.
 * Call this before RegisterHTTPHandler or EventBase().
 */ // 初始化 HTTP 服务。在 RegisterHTTPHandler 或 EventBase() 前调用该函数。
bool InitHTTPServer();
{% endhighlight %}

实现在“httpserver.cpp”文件中，没有入参。

{% highlight C++ %}
bool InitHTTPServer()
{
    struct evhttp* http = 0;
    struct event_base* base = 0;

    if (!InitHTTPAllowList()) // 初始化 HTTP ACL 访问控制列表（白名单）
        return false;

    if (GetBoolArg("-rpcssl", false)) { // rpcssl 默认关闭，当前版本不支持，如果设置了就报错
        uiInterface.ThreadSafeMessageBox(
            "SSL mode for RPC (-rpcssl) is no longer supported.",
            "", CClientUIInterface::MSG_ERROR);
        return false;
    }

    // Redirect libevent's logging to our own log
    event_set_log_callback(&libevent_log_cb); // 重定向 libevent 日志到当前日志系统
#if LIBEVENT_VERSION_NUMBER >= 0x02010100
    // If -debug=libevent, set full libevent debugging.
    // Otherwise, disable all libevent debugging.
    if (LogAcceptCategory("libevent"))
        event_enable_debug_logging(EVENT_DBG_ALL);
    else
        event_enable_debug_logging(EVENT_DBG_NONE);
#endif
#ifdef WIN32 // 初始化 libevent 的 http 服务端协议
    evthread_use_windows_threads();
#else
    evthread_use_pthreads();
#endif

    base = event_base_new(); // XXX RAII // 1.创建 event_base 对象
    if (!base) {
        LogPrintf("Couldn't create an event_base: exiting\n");
        return false;
    }

    /* Create a new evhttp object to handle requests. */
    http = evhttp_new(base); // XXX RAII 2.利用 base 创建 evhttp 对象
    if (!http) {
        LogPrintf("couldn't create evhttp. Exiting.\n");
        event_base_free(base);
        return false;
    }

    evhttp_set_timeout(http, GetArg("-rpcservertimeout", DEFAULT_HTTP_SERVER_TIMEOUT)); // 设置 http 服务超时时间为 rpc 服务超时，默认 30 秒
    evhttp_set_max_headers_size(http, MAX_HEADERS_SIZE); // http 头大小，默认 8K
    evhttp_set_max_body_size(http, MAX_SIZE); // 设置消息体大小，默认 32M
    evhttp_set_gencb(http, http_request_cb, NULL); // 4.设置处理请求的回调函数 http_request_cb

    if (!HTTPBindAddresses(http)) { // 3.evhttp_bind_socket(http, "0.0.0.0", port),绑定 IP 地址和端口
        LogPrintf("Unable to bind any endpoint for RPC server\n");
        evhttp_free(http);
        event_base_free(base);
        return false;
    }

    LogPrint("http", "Initialized HTTP server\n");
    int workQueueDepth = std::max((long)GetArg("-rpcworkqueue", DEFAULT_HTTP_WORKQUEUE), 1L); // 获取 HTTP 任务队列最大容量，默认 16，最小为 1
    LogPrintf("HTTP: creating work queue of depth %d\n", workQueueDepth);

    workQueue = new WorkQueue<HTTPClosure>(workQueueDepth); // 创建任务队列
    eventBase = base;
    eventHTTP = http;
    return true;
}
{% endhighlight %}

这里用到了 `libevent` 事件库中的 `evhttp` 用来初始化 `http` 的服务端。

9.2.4.调用 `StartRPC()` 启动 `RPC`，该函数声明在“rpcserver.h”文件中。

{% highlight C++ %}
bool StartRPC(); // 启动 RPC
{% endhighlight %}

实现在“rpcserver.cpp”文件中，没有入参。

{% highlight C++ %}
static bool fRPCRunning = false; // RPC 运行状态，默认为 false
...
bool StartRPC()
{
    LogPrint("rpc", "Starting RPC\n");
    fRPCRunning = true; // 设置 RPC 运行状态为 true
    g_rpcSignals.Started(); // 此版本未找到信号注册
    return true; // 成功返回 true
}
{% endhighlight %}

**注：这里调用的 `g_rpcSignals.Started()` 信号函数在该版本中并未注册。**

9.2.5.调用 `StartHTTPRPC()` 函数启动 `HTTP` 和 `RPC`（在这里注册的 `RPC` 处理函数），该函数声明在“httprpc.h”文件中。

{% highlight C++ %}
/** Start HTTP RPC subsystem.
 * Precondition; HTTP and RPC has been started.
 */ // 启动 HTTP RPC 子系统。前提：HTTP 和 RPC 已经启动。
bool StartHTTPRPC();
{% endhighlight %}

实现在“httprpc.cpp”文件中，没有入参。

{% highlight C++ %}
bool StartHTTPRPC()
{
    LogPrint("rpc", "Starting HTTP RPC server\n");
    if (!InitRPCAuthentication()) // 1.初始化 RPC 身份验证（rpc "用户名:密码"）
        return false;

    RegisterHTTPHandler("/", true, HTTPReq_JSONRPC); // 2.注册 http url 处理函数

    assert(EventBase()); // 返回 event_base 对象指针
    httpRPCTimerInterface = new HTTPRPCTimerInterface(EventBase()); // 3.创建 http 定时器接口对象
    RPCRegisterTimerInterface(httpRPCTimerInterface); // 注册 RPC 定时器接口
    return true;
}
{% endhighlight %}

1.初始化 `RPC` 身份验证，用于验证 `RPC` 用户名和密码。<br>
2.注册 `HTTP` 处理函数。<br>
3.创建 `HTTP` 定时器接口对象，并注册定时器接口。

1.调用 `InitRPCAuthentication()` 初始化 `RPC` 验证（`"用户名:密码"`），该函数实现在“httprpc.cpp”文件中。

{% highlight C++ %}
/* Pre-base64-encoded authentication token */
static std::string strRPCUserColonPass; // base64 预编码的身份验证令牌
...
static bool InitRPCAuthentication()
{
    if (mapArgs["-rpcpassword"] == "")
    { // 密码为空
        LogPrintf("No rpcpassword set - using random cookie authentication\n");
        if (!GenerateAuthCookie(&strRPCUserColonPass)) { // 生成 cookie 字符串
            uiInterface.ThreadSafeMessageBox(
                _("Error: A fatal internal error occurred, see debug.log for details"), // Same message as AbortNode
                "", CClientUIInterface::MSG_ERROR);
            return false;
        }
    } else { // 密码非空
        LogPrintf("Config options rpcuser and rpcpassword will soon be deprecated. Locally-run instances may remove rpcuser to use cookie-based auth, or may be replaced with rpcauth. Please see share/rpcuser for rpcauth auth generation.\n");
        strRPCUserColonPass = mapArgs["-rpcuser"] + ":" + mapArgs["-rpcpassword"]; // 拼接 RPC "user:pass" 字符串
    }
    return true;
}
{% endhighlight %}

若启动选项 `-rpcpassword` 的值为空时，调用 `GenerateAuthCookie(&strRPCUserColonPass)` 随机生成身份验证 `cookie`，该函数声明在“rpcprotocol.h”文件中。

{% highlight C++ %}
/** Generate a new RPC authentication cookie and write it to disk */
bool GenerateAuthCookie(std::string *cookie_out); // 生成一个新的 RPC 身份验证 cookie 并写入磁盘
{% endhighlight %}

实现在“rpcprotocol.cpp”文件中，入参为：`RPC` 验证信息（用户名冒号密码）全局字符串对象。

{% highlight C++ %}
bool GenerateAuthCookie(std::string *cookie_out)
{
    unsigned char rand_pwd[32];
    GetRandBytes(rand_pwd, 32); // 生成随机数
    std::string cookie = COOKIEAUTH_USER + ":" + EncodeBase64(&rand_pwd[0],32); // 拼接 cookie 字符串

    /** the umask determines what permissions are used to create this file -
     * these are set to 077 in init.cpp unless overridden with -sysperms.
     */ // 掩码确定用于创建文件的权限，在 init.cpp 中设置为 077，除非使用 -sysperms 选项覆盖。
    std::ofstream file;
    boost::filesystem::path filepath = GetAuthCookieFile(); // 获取验证 cookie 文件路径
    file.open(filepath.string().c_str()); // 打开文件
    if (!file.is_open()) {
        LogPrintf("Unable to open cookie authentication file %s for writing\n", filepath.string());
        return false;
    }
    file << cookie; // 把 cookie 写入 cookie 文件中
    file.close(); // 关闭并刷新文件输出流缓冲区
    LogPrintf("Generated RPC authentication cookie %s\n", filepath.string());

    if (cookie_out)
        *cookie_out = cookie; // 内存 cookie
    return true; // 成功返回 true
}
{% endhighlight %}

若启动选项 `-rpcpassword` 的值非空，及指定了 `RPC` 密码，则直接以 `"用户名:密码"` 的形式拼接验证信息字符串。

**注：`RPC` 用户名可以为空。**

2.调用 `RegisterHTTPHandler("/", true, HTTPReq_JSONRPC)` 函数注册 `HTTP` 请求处理函数，它声明在“httpserver.h”文件中。

{% highlight C++ %}
/** Handler for requests to a certain HTTP path */ // 用于请求一个确定的 HTTP 路径的处理函数
typedef boost::function<void(HTTPRequest* req, const std::string &)> HTTPRequestHandler;
/** Register handler for prefix.
 * If multiple handlers match a prefix, the first-registered one will
 * be invoked.
 */ // 注册处理函数前缀。若多个处理函数匹配到一个前缀，则调用首个注册的函数。
void RegisterHTTPHandler(const std::string &prefix, bool exactMatch, const HTTPRequestHandler &handler);
{% endhighlight %}

实现在“httpserver.cpp”文件中，入参为：前缀，是否精准匹配，`HTTP` 请求处理函数对象。

{% highlight C++ %}
struct HTTPPathHandler
{
    HTTPPathHandler() {}
    HTTPPathHandler(std::string prefix, bool exactMatch, HTTPRequestHandler handler):
        prefix(prefix), exactMatch(exactMatch), handler(handler)
    {
    }
    std::string prefix; // 请求的路径
    bool exactMatch; // 精确匹配 或 前缀匹配（在 http_request_cb 中完成验证）
    HTTPRequestHandler handler; // 对某个 http 路径请求
};
...
std::vector<HTTPPathHandler> pathHandlers; // http 请求路径对应的处理函数列表
...
void RegisterHTTPHandler(const std::string &prefix, bool exactMatch, const HTTPRequestHandler &handler)
{
    LogPrint("http", "Registering HTTP handler for %s (exactmatch %d)\n", prefix, exactMatch);
    pathHandlers.push_back(HTTPPathHandler(prefix, exactMatch, handler)); // 加入处理函数列表
}
{% endhighlight %}

处理 `HTTP` 请求函数定义在“httprpc.cpp”文件中，入参为：`HTTP` 请求，...。

{% highlight C++ %}
static bool HTTPReq_JSONRPC(HTTPRequest* req, const std::string &) // HTTP 请求处理函数
{
    // JSONRPC handles only POST // JSONRPC 仅处理 POST 类型 HTTP 请求
    if (req->GetRequestMethod() != HTTPRequest::POST) { // 若非 POST 类型的请求
        req->WriteReply(HTTP_BAD_METHOD, "JSONRPC server handles only POST requests"); // 反馈信息
        return false; // 直接退出并返回 false
    }
    // Check authorization // 检查授权
    std::pair<bool, std::string> authHeader = req->GetHeader("authorization"); // 获取头部授权字段
    if (!authHeader.first) { // 若不存在
        req->WriteHeader("WWW-Authenticate", WWW_AUTH_HEADER_DATA);
        req->WriteReply(HTTP_UNAUTHORIZED);
        return false; // 退出并返回 false
    }

    if (!RPCAuthorized(authHeader.second)) { // 对获取授权信息进行验证
        LogPrintf("ThreadRPCServer incorrect password attempt from %s\n", req->GetPeer().ToString());

        /* Deter brute-forcing // 阻止暴力
           If this results in a DoS the user really // 如果这导致 DoS，用户实际上不应该暴露其端口。
           shouldn't have their RPC port exposed. */
        MilliSleep(250); // 睡 250ms

        req->WriteHeader("WWW-Authenticate", WWW_AUTH_HEADER_DATA);
        req->WriteReply(HTTP_UNAUTHORIZED);
        return false;
    }

    JSONRequest jreq; // JSON 请求对象
    try {
        // Parse request // 解析请求
        UniValue valRequest;
        if (!valRequest.read(req->ReadBody())) // 获取请求体
            throw JSONRPCError(RPC_PARSE_ERROR, "Parse error");

        std::string strReply; // 响应内容
        // singleton request // 单例请求
        if (valRequest.isObject()) { // 请求体是一个对象
            jreq.parse(valRequest); // 解析请求

            UniValue result = tableRPC.execute(jreq.strMethod, jreq.params); // 执行相应方法及其参数

            // Send reply // 发送响应
            strReply = JSONRPCReply(result, NullUniValue, jreq.id); // 包装为 JSONRPC 响应内容

        // array of requests // 请求数组
        } else if (valRequest.isArray()) // 数组
            strReply = JSONRPCExecBatch(valRequest.get_array()); // 批量处理并获取请求的内容
        else
            throw JSONRPCError(RPC_PARSE_ERROR, "Top-level object parse error");

        req->WriteHeader("Content-Type", "application/json"); // 写入响应头
        req->WriteReply(HTTP_OK, strReply); // 写入状态码和响应体
    } catch (const UniValue& objError) {
        JSONErrorReply(req, objError, jreq.id);
        return false;
    } catch (const std::exception& e) {
        JSONErrorReply(req, JSONRPCError(RPC_PARSE_ERROR, e.what()), jreq.id);
        return false;
    }
    return true; // 成功返回 true
}
{% endhighlight %}

3.创建 `HTTP RPC` 定时器接口对象，并调用 `RPCRegisterTimerInterface(httpRPCTimerInterface)` 注册定时器接口。
该函数声明在“rpcserver.h”文件中。

{% highlight C++ %}
/** Register factory function for timers */ // 注册定时器工厂函数
void RPCRegisterTimerInterface(RPCTimerInterface *iface);
{% endhighlight %}

实现在“rpcserver.cpp”文件中，入参为：`HTTPRPC` 定时器接口对象。

{% highlight C++ %}
/* Timer-creating functions */ // 定时器创建功能
static std::vector<RPCTimerInterface*> timerInterfaces; // RPC 定时器接口列表
...
void RPCRegisterTimerInterface(RPCTimerInterface *iface)
{
    timerInterfaces.push_back(iface); // 加入定时器接口列表
}
{% endhighlight %}

`HTTPRPCTimerInterface ` 是类 `RPCTimerInterface` 的派生类，这里把派生类指针转换为基类指针（向上转型）。
该类定义在“httprpc.cpp”文件中。

{% highlight C++ %}
class HTTPRPCTimerInterface : public RPCTimerInterface // HTTPRPC 定时器接口类
{
...
};
{% endhighlight %}

9.2.6.若设置了 `-rest` 启动选项，则调用 `StartREST()` 函数启动 `REST`，它声明在“httprpc.h”文件中。

{% highlight C++ %}
/** Start HTTP REST subsystem.
 * Precondition; HTTP and RPC has been started.
 */ // 启动 HTTP REST 子系统。前提：HTTP 和 RPC 已经启动。
bool StartREST();
{% endhighlight %}

实现在“httprpc.cpp”文件中，没有入参。

{% highlight C++ %}
static const struct {
    const char* prefix; // 前缀字符串
    bool (*handler)(HTTPRequest* req, const std::string& strReq); // HTTP 请求回调函数
} uri_prefixes[] = { // uri 前缀结构体对象
      {"/rest/tx/", rest_tx},
      {"/rest/block/notxdetails/", rest_block_notxdetails},
      {"/rest/block/", rest_block_extended},
      {"/rest/chaininfo", rest_chaininfo},
      {"/rest/mempool/info", rest_mempool_info},
      {"/rest/mempool/contents", rest_mempool_contents},
      {"/rest/headers/", rest_headers},
      {"/rest/getutxos", rest_getutxos},
};
...
bool StartREST()
{
    for (unsigned int i = 0; i < ARRAYLEN(uri_prefixes); i++) // 把 uri_prefixes 数组中的 url 路径和对应的处理函数
        RegisterHTTPHandler(uri_prefixes[i].prefix, false, uri_prefixes[i].handler); // 通过该函数存入 pathHandlers 列表中，这里均为前缀匹配
    return true;
}
{% endhighlight %}

9.2.7.调用 `StartHTTPServer()` 函数启动 `HTTP` 服务，它声明在“httpserver.h”文件中。

{% highlight C++ %}
/** Start HTTP server.
 * This is separate from InitHTTPServer to give users race-condition-free time
 * to register their handlers between InitHTTPServer and StartHTTPServerStartHTTPServer.
 */ // 启动 HTTP 服务。该操作从 InitHTTPServer 中分离出来为用户提供无竞争条件时间，用于在 InitHTTPServer 和 StartHTTPServer 之间注册其处理函数。
bool StartHTTPServer();
{% endhighlight %}

实现在“httpserver.cpp”文件中，没有入参。

{% highlight C++ %}
//! Work queue for handling longer requests off the event loop thread
static WorkQueue<HTTPClosure>* workQueue = 0; // 用于处理事件循环线程中较长请求的工作队列
...
bool StartHTTPServer()
{
    LogPrint("http", "Starting HTTP server\n");
    int rpcThreads = std::max((long)GetArg("-rpcthreads", DEFAULT_HTTP_THREADS), 1L); // 获取 RPC 线程数，默认为 4，至少为 1
    LogPrintf("HTTP: starting %d worker threads\n", rpcThreads);
    threadHTTP = boost::thread(boost::bind(&ThreadHTTP, eventBase, eventHTTP)); // 5.派发事件循环，http 协议启动

    for (int i = 0; i < rpcThreads; i++) // 创建 HTTP 服务（任务队列运行）线程
        boost::thread(boost::bind(&HTTPWorkQueueRun, workQueue));
    return true;
}
{% endhighlight %}

`HTTPClosure` 是一个虚基类，定义在“httpserver.h”文件中。
`DEFAULT_HTTP_THREADS` 定义在“httpserver.h”文件中，可通过 `-rpcthreads` 启动选项改变默认值。

{% highlight C++ %}
static const int DEFAULT_HTTP_THREADS=4; // HTTP RPC 线程数，默认为 4
...
/** Event handler closure.
 */ // 事件处理关闭
class HTTPClosure // HTTP 关闭虚基类
{
public:
    virtual void operator()() = 0;
    virtual ~HTTPClosure() {}
};
{% endhighlight %}

线程函数 `HTTPWorkQueueRun` 定义在“httpserver.cpp”文件中。

{% highlight C++ %}
/** Simple wrapper to set thread name and run work queue */ // 设置线程名并运行工作队列的简单包装器
static void HTTPWorkQueueRun(WorkQueue<HTTPClosure>* queue)
{
    RenameThread("bitcoin-httpworker"); // 重命名线程
    queue->Run(); // 依次运行队列中的任务
}
{% endhighlight %}

1.重命名线程。<br>
2.运行任务队列。

2.调用 `queue->Run()` 运行工作队列。

{% highlight C++ %}
/** Simple work queue for distributing work over multiple threads.
 * Work items are simply callable objects.
 */ // 御用在多个线程上分配工作的简单工作队列。工作项是简易可调用对象。
template <typename WorkItem>
class WorkQueue
{
private:
    /** Mutex protects entire object */ // 互斥锁保护整个对象
    CWaitableCriticalSection cs; // 临界资源
    CConditionVariable cond; // 条件变量
    /* XXX in C++11 we can use std::unique_ptr here and avoid manual cleanup */ // 在 C++11 中我们使用在这里 std::unique_ptr 来避免手动清理
    std::deque<WorkItem*> queue; // 任务队列
    bool running; // 运行状态（决定是否运行/退出循环）
    size_t maxDepth; // 最大深度（容量）
    int numThreads; // 线程数

    /** RAII object to keep track of number of running worker threads */
    class ThreadCounter // 嵌套类，RAII 对象，用于追踪运行的工作线程数
    {
    public:
        WorkQueue &wq; // 外类对象引用
        ThreadCounter(WorkQueue &w): wq(w) // 构造函数
        {
            boost::lock_guard<boost::mutex> lock(wq.cs); // 上锁
            wq.numThreads += 1; // 线程数加 1
        }
        ~ThreadCounter() // 析构函数
        {
            boost::lock_guard<boost::mutex> lock(wq.cs); // 上锁
            wq.numThreads -= 1; // 线程数减 1
            wq.cond.notify_all(); // 通知等待在条件 cond 上的所有线程
        }
    };

public:
    ...
    /** Thread function */ // 线程函数
    void Run() // 不断从任务队列中读取、删除并执行任务，任务类型为 WorkItem（类类型）
    {
        ThreadCounter count(*this); // 创建线程计数局部对象
        while (running) { // loop
            WorkItem* i = 0;
            {
                boost::unique_lock<boost::mutex> lock(cs);
                while (running && queue.empty()) // 任务队列为空
                    cond.wait(lock); // 等待条件被激活（往队列里添加任务时）
                if (!running)
                    break; // break out of loop
                i = queue.front(); // 取队头元素（任务队列中第一个元素）
                queue.pop_front(); // 队头出队
            }
            (*i)(); // 执行任务
            delete i; // 执行后删除
        }
    }
    ...
};
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（十）](/2018/07/28/bitcoin-source-anatomy-10)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
