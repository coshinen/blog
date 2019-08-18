---
layout: post
title:  "比特币源码剖析（九）"
date:   2018-07-21 23:05:28 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了应用程序初始化中创建脚本验证的线程函数和创建轻量级任务调度线程函数，详见[比特币源码剖析（八）](/blog/2018/07/bitcoin-source-anatomy-08.html)。
本篇主要分析 Step 4: application initialization: dir lock, daemonize, pidfile, debug log 第四步应用程序初始化中初始化服务器的详细过程。

## 源码剖析

<p id="AppInitServers-ref"></p>
9.应用程序初始化服务器，这部分代码实现在“init.cpp”文件的 AppInit2(...) 函数的第四步 Step 4: application initialization: dir lock, daemonize, pidfile, debug log。

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

9.1.连接设置 RPC 预热状态函数。<br>
9.2.应用程序初始化服务（HTTP、RPC）。

9.1.调用 uiInterface.InitMessage.connect(SetRPCWarmupStatus) 函数把信号连接到处理函数 SetRPCWarmupStatus 上。
该处理函数声明在“rpcserver.h”文件中。

{% highlight C++ %}
**
 * Set the RPC warmup status.  When this is done, all RPC calls will error out
 * immediately with RPC_IN_WARMUP.
 */ // 设置 RPC 预热新状态。当这步完成时，全部 RPC 调用将立刻使用 RPC_IN_WARMUP 错误输出。
void SetRPCWarmupStatus(const std::string& newStatus);
{% endhighlight %}

实现在“rpcserver.cpp”文件中，入参为：新的 RPC 热身状态。

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

9.2.调用 AppInitServers(threadGroup) 函数初始化服务设置，该服务用于和客户端命令行 RPC 通讯。
该函数定义在“init.cpp”文件中。

{% highlight C++ %}
bool AppInitServers(boost::thread_group& threadGroup)
{
    RPCServer::OnStopped(&OnRPCStopped); // 1.连接停止 RPC 信号函数
    RPCServer::OnPreCommand(&OnRPCPreCommand); // 2.连接监控 RPC 安全模式信号函数
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

9.2.1.连接停止 RPC 信号函数。<br>
9.2.2.连接监控 RPC 安全模式信号函数。<br>
9.2.3.初始化 HTTP 服务。<br>
9.2.4.启动 RPC。<br>
9.2.5.启动 HTTPRPC。<br>
9.2.6.启动 REST。<br>
9.2.7.启动 HTTP 服务。

9.2.1.调用 RPCServer::OnStopped(&OnRPCStopped) 函数设置的回调函数，用于停止 RPC，内部还是连接信号函数。<br>
9.2.2.调用 RPCServer::OnPreCommand(&OnRPCPreCommand) 函数设置的回调函数，用于监控 RPC 安全模式。
OnStopped 和 OnPreCommand 均声明在“rpcserver.h”文件的 RPCServer 命名空间中。

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

信号函数 OnRPCStopped 和 OnRPCPreCommand 均定义在“init.cpp”文件中。

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

cvBlockChange 是一个条件变量，定义在“main.cpp”文件中，在“main.h”文件中引用。

{% highlight C++ %}
/** Just a typedef for boost::condition_variable, can be wrapped later if desired */
typedef boost::condition_variable CConditionVariable; // 只是一个定义类型的 boost 条件变量，如果需要可以在稍后包装
{% endhighlight %}

其类型定义在“sync.h”文件中。

{% highlight C++ %}
CConditionVariable cvBlockChange; // 区块改变的条件变量
{% endhighlight %}

类 CRPCCommand 定义在“rpcserver.h”文件中。

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

9.2.3.调用 InitHTTPServer() 函数初始化 HTTP 服务，声明在“httpserver.h”文件中。

{% highlight C++ %}
/** Initialize HTTP server.
 * Call this before RegisterHTTPHandler or EventBase().
 */ // 初始化 HTTP 服务。在 RegisterHTTPHandler 或 EventBase() 前调用该函数。
bool InitHTTPServer();
{% endhighlight %}

实现在“httpserver.cpp”文件中，没有入参。

{% highlight C++ %}
/** HTTP module state */ // HTTP 模块状态

//! libevent event loop // libevent 事件循环
static struct event_base* eventBase = 0;
//! HTTP server // HTTP 服务
struct evhttp* eventHTTP = 0;
//! List of subnets to allow RPC connections from // 允许 RPC 连接进来的子网列表
static std::vector<CSubNet> rpc_allow_subnets; // acl 列表（白名单）
//! Work queue for handling longer requests off the event loop thread
static WorkQueue<HTTPClosure>* workQueue = 0; // 用于处理事件循环线程中较长请求的工作队列
...
bool InitHTTPServer()
{
    struct evhttp* http = 0;
    struct event_base* base = 0;

    if (!InitHTTPAllowList()) // 1.初始化 HTTP ACL 访问控制列表（白名单）
        return false;

    if (GetBoolArg("-rpcssl", false)) { // rpcssl 默认关闭，当前版本不支持，如果设置了就报错
        uiInterface.ThreadSafeMessageBox(
            "SSL mode for RPC (-rpcssl) is no longer supported.",
            "", CClientUIInterface::MSG_ERROR);
        return false;
    }

    // Redirect libevent's logging to our own log // 2.重定向 libevent 的日志到当前日志系统
    event_set_log_callback(&libevent_log_cb); // 设置 libevent 日志回调函数
#if LIBEVENT_VERSION_NUMBER >= 0x02010100
    // If -debug=libevent, set full libevent debugging. // 如果 -debug=libevent，设置完整的 libevent 调试信息。
    // Otherwise, disable all libevent debugging. // 否则，禁止全部 libevent 调试信息。
    if (LogAcceptCategory("libevent")) // 根据调试选项设置调试日志记录内容
        event_enable_debug_logging(EVENT_DBG_ALL);
    else
        event_enable_debug_logging(EVENT_DBG_NONE);
#endif
#ifdef WIN32 // 3.初始化 libevent 的 evhttp 服务端
    evthread_use_windows_threads();
#else
    evthread_use_pthreads(); // 3.1.初始化 libevent 多线程支持
#endif

    base = event_base_new(); // XXX RAII // 3.2.创建 event_base 对象
    if (!base) {
        LogPrintf("Couldn't create an event_base: exiting\n");
        return false;
    }

    /* Create a new evhttp object to handle requests. */ // 3.3.创建一个新的 evhttp 对象来处理请求。
    http = evhttp_new(base); // XXX RAII 利用 event_base 创建 evhttp 对象
    if (!http) {
        LogPrintf("couldn't create evhttp. Exiting.\n");
        event_base_free(base);
        return false;
    }

    evhttp_set_timeout(http, GetArg("-rpcservertimeout", DEFAULT_HTTP_SERVER_TIMEOUT)); // 3.4.设置 http 服务超时时间为 rpc 服务超时，默认 30 秒
    evhttp_set_max_headers_size(http, MAX_HEADERS_SIZE); // http 头大小，默认 8K
    evhttp_set_max_body_size(http, MAX_SIZE); // 设置消息体大小，默认 32M
    evhttp_set_gencb(http, http_request_cb, NULL); // 3.5.设置处理请求的回调函数 http_request_cb

    if (!HTTPBindAddresses(http)) { // 3.6.evhttp_bind_socket(http, "0.0.0.0", port),绑定服务地址和端口
        LogPrintf("Unable to bind any endpoint for RPC server\n");
        evhttp_free(http);
        event_base_free(base);
        return false;
    }

    LogPrint("http", "Initialized HTTP server\n"); // evhttp 服务器端初始化完成
    int workQueueDepth = std::max((long)GetArg("-rpcworkqueue", DEFAULT_HTTP_WORKQUEUE), 1L); // 获取 HTTP 任务队列最大容量，默认 16，最小为 1
    LogPrintf("HTTP: creating work queue of depth %d\n", workQueueDepth);

    workQueue = new WorkQueue<HTTPClosure>(workQueueDepth); // 4.创建任务队列
    eventBase = base;
    eventHTTP = http;
    return true; // 成功返回 true
}
{% endhighlight %}

**这里用到了 libevent 事件库中的 evhttp 用来初始化 http 的服务端。**

1.初始化 HTTP 访问控制列表 ACL（即白名单）。<br>
2.重定向 libevent 日志到我们自己的日志系统。<br>
3.初始化 libevent 的 evhttp 服务端。<br>
3.1.初始化 libevent 多线程支持。<br>
3.2.（必备）新建 event_base 对象。<br>
3.3.（必备）根据上面创建的 event_base 新建 evhttp 对象。<br>
3.4.设置 http 相关参数：超时，协议头上限，消息体上限。<br>
3.5.（必备）设置处理 http 请求的回调函数。<br>
3.6.（必备）绑定 http 服务的地址和端口，至此 evhttp 服务端初始化完毕。<br>
4.创建 HTTP 任务队列。

1.调用 InitHTTPAllowList() 来初始化 ACL 列表（即白名单），在该列表中的 IP 对应的节点才能连入本节点，
该函数定义在“httpserver.cpp”文件中。

{% highlight C++ %}
/** Initialize ACL list for HTTP server */ // 初始化 HTTP 服务器的 ACL 访问控制列表
static bool InitHTTPAllowList() // ACL: Allow Control List
{
    rpc_allow_subnets.clear(); // 清空子网列表
    rpc_allow_subnets.push_back(CSubNet("127.0.0.0/8")); // always allow IPv4 local subnet // 总是允许 IPv4 本地子网
    rpc_allow_subnets.push_back(CSubNet("::1"));         // always allow IPv6 localhost // 总是允许 IPv6 本地主机
    if (mapMultiArgs.count("-rpcallowip")) { // 若 -rpcallowip 选项设置了
        const std::vector<std::string>& vAllow = mapMultiArgs["-rpcallowip"]; // 获取该 acl 列表
        BOOST_FOREACH (std::string strAllow, vAllow) { // 遍历该列表
            CSubNet subnet(strAllow); // 创建子网对象
            if (!subnet.IsValid()) { // 检查子网有效性
                uiInterface.ThreadSafeMessageBox(
                    strprintf("Invalid -rpcallowip subnet specification: %s. Valid are a single IP (e.g. 1.2.3.4), a network/netmask (e.g. 1.2.3.4/255.255.255.0) or a network/CIDR (e.g. 1.2.3.4/24).", strAllow),
                    "", CClientUIInterface::MSG_ERROR);
                return false;
            }
            rpc_allow_subnets.push_back(subnet); // 加入 ACL 列表
        }
    }
    std::string strAllowed; // 记录日志
    BOOST_FOREACH (const CSubNet& subnet, rpc_allow_subnets) // 遍历 acl 列表
        strAllowed += subnet.ToString() + " "; // 拼接
    LogPrint("http", "Allowing HTTP connections from: %s\n", strAllowed); // 记录白名单
    return true; // 成功返回 true
}
{% endhighlight %}

2.调用 event_set_log_callback(&libevent_log_cb) 设置回调函数，把 libevent 库中的日志信息重定向（转入）到我们自己的日志系统。
回调函数 libevent_log_cb 定义在“httpserver.cpp”文件中。

{% highlight C++ %}
/** libevent event log callback */ // libevent 事件日志回调函数
static void libevent_log_cb(int severity, const char *msg)
{
#ifndef EVENT_LOG_WARN // EVENT_LOG_WARN 在 2.0.19 中添加；但在 _EVENT_LOG_WARN 已存在。
// EVENT_LOG_WARN was added in 2.0.19; but before then _EVENT_LOG_WARN existed.
# define EVENT_LOG_WARN _EVENT_LOG_WARN
#endif
    if (severity >= EVENT_LOG_WARN) // Log warn messages and higher without debug category
        LogPrintf("libevent: %s\n", msg); // 记录警告信息和更高的没有调试类别的信息
    else
        LogPrint("libevent", "libevent: %s\n", msg);
}
{% endhighlight %}

3.5.调用 evhttp_set_gencb(http, http_request_cb, NULL) 设置处理 http 请求的回调函数，
回调函数 http_request_cb 定义在“httpserver.cpp”文件中。

{% highlight C++ %}
/** HTTP request callback */ // HTTP 请求回调函数
static void http_request_cb(struct evhttp_request* req, void* arg)
{
    std::auto_ptr<HTTPRequest> hreq(new HTTPRequest(req)); // 根据 HTTP 请求创建一个 HTTPRequest 对象

    LogPrint("http", "Received a %s request for %s from %s\n",
             RequestMethodString(hreq->GetRequestMethod()), hreq->GetURI(), hreq->GetPeer().ToString());

    // Early address-based allow check // 检查请求连入地址是否被允许
    if (!ClientAllowed(hreq->GetPeer())) { // 即该请求的源地址是否存在于 ACL 访问控制列表中
        hreq->WriteReply(HTTP_FORBIDDEN);
        return;
    }

    // Early reject unknown HTTP methods // 提前拒绝未知的 HTTP 方法
    if (hreq->GetRequestMethod() == HTTPRequest::UNKNOWN) { // 若请求方法未知
        hreq->WriteReply(HTTP_BADMETHOD); // 响应错误方法
        return; // 直接退出
    }

    // Find registered handler for prefix // 通过前缀查找注册的处理函数
    std::string strURI = hreq->GetURI(); // 获取 URI（Uniform Resource Identifier，统一资源标识符，包含 URL）
    std::string path; // 处理函数对应的路径
    std::vector<HTTPPathHandler>::const_iterator i = pathHandlers.begin();
    std::vector<HTTPPathHandler>::const_iterator iend = pathHandlers.end();
    for (; i != iend; ++i) { // 遍历处理函数
        bool match = false; // 匹配标志，初始化为 false
        if (i->exactMatch) // 若为精确匹配
            match = (strURI == i->prefix); // 检查是否匹配
        else // 否则，为前缀匹配
            match = (strURI.substr(0, i->prefix.size()) == i->prefix); // 比较前缀是否匹配
        if (match) { // 若匹配
            path = strURI.substr(i->prefix.size()); // 获取相应路径
            break; // 跳出
        }
    } // 否则，继续 loop

    // Dispatch to worker thread // 派发到工作线程
    if (i != iend) { // 若找到了对应的处理函数，则派发到工作线程
        std::auto_ptr<HTTPWorkItem> item(new HTTPWorkItem(hreq.release(), path, i->handler)); // 把请求，请求的路径和对应的处理函数封装为 HTTPWorkItem 对象
        assert(workQueue);
        if (workQueue->Enqueue(item.get())) // 把该工作对象加入任务队列，该任务队列由工作线程不断处理
            item.release(); /* if true, queue took ownership */ // 如果为 true，队列获得所有权
        else
            item->req->WriteReply(HTTP_INTERNAL, "Work queue depth exceeded");
    } else { // 否则，响应未找到相应函数
        hreq->WriteReply(HTTP_NOTFOUND);
    }
}
{% endhighlight %}

3.6.调用 HTTPBindAddresses(http) 绑定 http 服务端的地址和端口，该函数定义在“httpserver.cpp”文件中。

{% highlight C++ %}
//! Bound listening sockets // 绑定的用于监听的套接字
std::vector<evhttp_bound_socket *> boundSockets; // 已绑定的 http socket 列表
...
/** Bind HTTP server to specified addresses */ // 绑定 HTTP 服务器到指定地址
static bool HTTPBindAddresses(struct evhttp* http)
{
    int defaultPort = GetArg("-rpcport", BaseParams().RPCPort()); // 设置 RPC 端口
    std::vector<std::pair<std::string, uint16_t> > endpoints; // std::pair<IP, PORT>

    // Determine what addresses to bind to // 确定要绑定的地址集
    if (!mapArgs.count("-rpcallowip")) { // Default to loopback if not allowing external IPs // 若不允许外部 IP，则默认为环回地址
        endpoints.push_back(std::make_pair("::1", defaultPort));
        endpoints.push_back(std::make_pair("127.0.0.1", defaultPort));
        if (mapArgs.count("-rpcbind")) { // 若 -rpcallowip 为设置时，-rpcbind 无效
            LogPrintf("WARNING: option -rpcbind was ignored because -rpcallowip was not specified, refusing to allow everyone to connect\n");
        }
    } else if (mapArgs.count("-rpcbind")) { // Specific bind address // 指定的绑定地址
        const std::vector<std::string>& vbind = mapMultiArgs["-rpcbind"]; // 获取绑定地址列表
        for (std::vector<std::string>::const_iterator i = vbind.begin(); i != vbind.end(); ++i) { // 遍历该列表
            int port = defaultPort; // 获取端口号
            std::string host;
            SplitHostPort(*i, port, host); // 分离主机和端口
            endpoints.push_back(std::make_pair(host, port)); // 加入端点列表
        }
    } else { // No specific bind address specified, bind to any // 未指定绑定地址，则绑定任意
        endpoints.push_back(std::make_pair("::", defaultPort));
        endpoints.push_back(std::make_pair("0.0.0.0", defaultPort));
    }

    // Bind addresses // 绑定地址集
    for (std::vector<std::pair<std::string, uint16_t> >::iterator i = endpoints.begin(); i != endpoints.end(); ++i) { // 遍历端点列表
        LogPrint("http", "Binding RPC on address %s port %i\n", i->first, i->second);
        evhttp_bound_socket *bind_handle = evhttp_bind_socket_with_handle(http, i->first.empty() ? NULL : i->first.c_str(), i->second); // 绑定地址和端口
        if (bind_handle) { // 若绑定成功
            boundSockets.push_back(bind_handle); // 加入已绑定的 http socket 列表
        } else {
            LogPrintf("Binding RPC on address %s port %i failed.\n", i->first, i->second);
        }
    }
    return !boundSockets.empty(); // 若绑定成功，返回 true
}
{% endhighlight %}

9.2.4.调用 StartRPC() 启动 RPC，该函数声明在“rpcserver.h”文件中。

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

**注：这里调用的 g_rpcSignals.Started() 信号函数在该版本中并未注册。**

未完待续...<br>
请看下一篇[比特币源码剖析（十）](/blog/2018/07/bitcoin-source-anatomy-10.html)。

## 参照

* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1){:target="_blank"}
* [mistydew/blockchain](https://github.com/mistydew/blockchain){:target="_blank"}
