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

{% highlight C++ %}
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（十）](/2018/07/28/bitcoin-source-anatomy-10)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
