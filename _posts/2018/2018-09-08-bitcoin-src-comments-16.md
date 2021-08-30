---
layout: post
title:  "比特币源码剖析（十六）"
date:   2018-09-08 15:56:20 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoind
---
本篇主要分析 Step 11: start node 第十一步启动节点服务的详细过程。

## 源码剖析

<p id="Step11-ref"></p>
3.11.11.第十一步，启动节点服务相关线程。这部分代码实现在“init.cpp”文件的 AppInit2(...) 函数中。

```cpp
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 11: start node // 启动节点服务，监听网络 P2P 请求，挖矿线程

    if (!CheckDiskSpace()) // 1.检测硬盘剩余空间是否充足（最少 50MB），用于接收并存储新区块
        return false; // 若空间不足，返回 false 退出

    if (!strErrors.str().empty()) // 2.检查前面的初始化过程是否有错误信息
        return InitError(strErrors.str()); // 若存在错误信息，返回错误信息并退出

    RandAddSeedPerfmon(); // 3.用于给钱包生成随机私钥种子

    //// debug print // 4.调试打印，记录相关信息
    LogPrintf("mapBlockIndex.size() = %u\n",   mapBlockIndex.size()); // 区块索引大小
    LogPrintf("nBestHeight = %d\n",                   chainActive.Height()); // 最佳区块链高度
#ifdef ENABLE_WALLET
    LogPrintf("setKeyPool.size() = %u\n",      pwalletMain ? pwalletMain->setKeyPool.size() : 0); // 钱包内密钥池大小
    LogPrintf("mapWallet.size() = %u\n",       pwalletMain ? pwalletMain->mapWallet.size() : 0); // 钱包交易列表大小
    LogPrintf("mapAddressBook.size() = %u\n",  pwalletMain ? pwalletMain->mapAddressBook.size() : 0); // 钱包内地址簿的大小
#endif

    if (GetBoolArg("-listenonion", DEFAULT_LISTEN_ONION)) // 5.监听洋葱路由，默认打开
        StartTorControl(threadGroup, scheduler);

    StartNode(threadGroup, scheduler); // 6.启动各种线程

    // Monitor the chain, and alert if we get blocks much quicker or slower than expected
    // The "bad chain alert" scheduler has been disabled because the current system gives far
    // too many false positives, such that users are starting to ignore them.
    // This code will be disabled for 0.12.1 while a fix is deliberated in #7568
    // this was discussed in the IRC meeting on 2016-03-31.
    //
    // --- disabled ---
    //int64_t nPowTargetSpacing = Params().GetConsensus().nPowTargetSpacing;
    //CScheduler::Function f = boost::bind(&PartitionCheck, &IsInitialBlockDownload,
    //                                     boost::ref(cs_main), boost::cref(pindexBestHeader), nPowTargetSpacing);
    //scheduler.scheduleEvery(f, nPowTargetSpacing);
    // --- end disabled ---

    // Generate coins in the background // 7.挖矿作用：产生比特币，记录交易
    GenerateBitcoins(GetBoolArg("-gen", DEFAULT_GENERATE), GetArg("-genproclimit", DEFAULT_GENERATE_THREADS), chainparams); // 创建挖矿线程，默认关闭，线程数默认为 1（0 表示禁止挖矿，-1 表示 CPU 核数）
    ...
}
```

基本流程：
1. 检查硬盘可用空间是否充足。
2. 检查前面 10 步初始化过程是否存在错误。
3. 设置随机数种子，用于钱包生成私钥。
4. 记录区块链、钱包的相关数据大小。
5. 创建洋葱路由监听线程。
6. 启动比特币节点相关线程。
7. 创建比特币 CPU 挖矿线程。

1.调用 CheckDiskSpace() 检测硬盘剩余空间是否充足（最低 50MB），用于接收并存储新区块。
该函数声明在“main.h”文件中。

```cpp
/** Check whether enough disk space is available for an incoming block */
bool CheckDiskSpace(uint64_t nAdditionalBytes = 0); // 检查硬盘空间接收一个新区块是否充足
```

实现在“main.cpp”文件中，入参为：0。

```cpp
/** Abort with a message */ // 反馈信息并关闭节点服务
bool AbortNode(const std::string& strMessage, const std::string& userMessage="")
{
    strMiscWarning = strMessage;
    LogPrintf("*** %s\n", strMessage); // 记录日志
    uiInterface.ThreadSafeMessageBox(
        userMessage.empty() ? _("Error: A fatal internal error occurred, see debug.log for details") : userMessage,
        "", CClientUIInterface::MSG_ERROR); // UI 显示错误信息
    StartShutdown(); // 关闭节点服务
    return false;
}
...
bool CheckDiskSpace(uint64_t nAdditionalBytes) // 0
{
    uint64_t nFreeBytesAvailable = boost::filesystem::space(GetDataDir()).available; // 1.获取数据目录所在磁盘的剩余（可用）空间的大小，单位 Byte

    // Check for nMinDiskSpace bytes (currently 50MB) // 2.检查硬盘最小空间（当前为 50MB）
    if (nFreeBytesAvailable < nMinDiskSpace + nAdditionalBytes) // 磁盘剩余空间小于 50MB
        return AbortNode("Disk space is low!", _("Error: Disk space is low!")); // 返回相应信息并关闭节点

    return true; // 若剩余空间充足，则返回 true
}
```

1.1.获取当前硬盘可用空间。<br>
1.2.判断空间是否低于最小硬盘空间阈值。

2.调用 InitError(strErrors.str()) 输出错误信息并退出。
该函数实现在“init.cpp”文件中，入参为：错误信息字符串。

```cpp
bool static InitError(const std::string &str)
{
    uiInterface.ThreadSafeMessageBox(str, "", CClientUIInterface::MSG_ERROR); // 弹出消息框，提示用户
    return false;
}
```

5.调用 StartTorControl(threadGroup, scheduler) 启动洋葱路由服务线程。
该函数声明在“torcontrol.h”文件中。

```cpp
void StartTorControl(boost::thread_group& threadGroup, CScheduler& scheduler); // 启动洋葱路由服务
```

实现在“torcontrol.cpp”文件中，入参为：线程组对象，调度器对象。

```cpp
/****** Thread ********/
struct event_base *base;
boost::thread torControlThread;

static void TorControlThread()
{
    TorController ctrl(base, GetArg("-torcontrol", DEFAULT_TOR_CONTROL)); // 创建洋葱路由控制器对象

    event_base_dispatch(base);
}

void StartTorControl(boost::thread_group& threadGroup, CScheduler& scheduler)
{
    assert(!base);
#ifdef WIN32
    evthread_use_windows_threads();
#else
    evthread_use_pthreads();
#endif
    base = event_base_new();
    if (!base) {
        LogPrintf("tor: Unable to create event_base\n");
        return;
    }

    torControlThread = boost::thread(boost::bind(&TraceThread<void (*)()>, "torcontrol", &TorControlThread)); // 创建洋葱路由控制线程
}
```

类 TorController 定义在“torcontrol.cpp”文件中。

```cpp
/** Low-level handling for Tor control connection.
 * Speaks the SMTP-like protocol as defined in torspec/control-spec.txt
 */ // 洋葱路由控制连接的低级处理。说出类似 SMTP 的协议。
class TorControlConnection
{
public:
    typedef boost::function<void(TorControlConnection&)> ConnectionCB;
    typedef boost::function<void(TorControlConnection &,const TorControlReply &)> ReplyHandlerCB;

    /** Create a new TorControlConnection.
     */ // 创建一个新的洋葱路由控制连接对象。
    TorControlConnection(struct event_base *base);
    ~TorControlConnection();

    /**
     * Connect to a Tor control port.
     * target is address of the form host:port.
     * connected is the handler that is called when connection is succesfully established.
     * disconnected is a handler that is called when the connection is broken.
     * Return true on success.
     */ // 连接到洋葱路由控制端口。target 是“主机：端口”形式的地址。connected 是连接成功建立时调用的处理函数。disconnected 是连接断开时调用的处理函数。成功返回 true。
    bool Connect(const std::string &target, const ConnectionCB& connected, const ConnectionCB& disconnected);

    /**
     * Disconnect from Tor control port.
     */ // 断开洋葱路由控制端口。
    bool Disconnect();

    /** Send a command, register a handler for the reply.
     * A trailing CRLF is automatically added.
     * Return true on success.
     */ // 发送一条命令，注册响应的处理函数。自动在尾部添加回车换行 CRLF（即\r\n）
    bool Command(const std::string &cmd, const ReplyHandlerCB& reply_handler);
    ...
    /** Callback when ready for use */ // 用于连接准备的回调
    boost::function<void(TorControlConnection&)> connected;
    /** Callback when connection lost */ // 断开连接时的回调
    boost::function<void(TorControlConnection&)> disconnected;
    /** Libevent event base */
    struct event_base *base; // Libevent 事件基指针
    /** Connection to control socket */
    struct bufferevent *b_conn; // 连接到控制套接字
    /** Message being received */
    TorControlReply message; // 接收的信息
    /** Response handlers */ // 响应处理函数
    std::deque<ReplyHandlerCB> reply_handlers; // 处理函数队列
    ...
};
...
bool TorControlConnection::Connect(const std::string &target, const ConnectionCB& connected, const ConnectionCB& disconnected)
{
    if (b_conn) // 若连接已存在
        Disconnect(); // 先断开连接
    // Parse target address:port // 解析目标端口
    struct sockaddr_storage connect_to_addr;
    int connect_to_addrlen = sizeof(connect_to_addr);
    if (evutil_parse_sockaddr_port(target.c_str(),
        (struct sockaddr*)&connect_to_addr, &connect_to_addrlen)<0) { // 解析目标地址和目标端口
        LogPrintf("tor: Error parsing socket address %s\n", target);
        return false;
    }

    // Create a new socket, set up callbacks and enable notification bits // 创建一个新的套接字，设置回调并设置通知位
    b_conn = bufferevent_socket_new(base, -1, BEV_OPT_CLOSE_ON_FREE); // 设置新套接字
    if (!b_conn)
        return false;
    bufferevent_setcb(b_conn, TorControlConnection::readcb, NULL, TorControlConnection::eventcb, this); // 设置回调函数
    bufferevent_enable(b_conn, EV_READ|EV_WRITE);
    this->connected = connected; // 设置连接回调函数
    this->disconnected = disconnected; // 设置断开连接回调函数

    // Finally, connect to target // 最终，连接目标
    if (bufferevent_socket_connect(b_conn, (struct sockaddr*)&connect_to_addr, connect_to_addrlen) < 0) { // 连接套接字地址
        LogPrintf("tor: Error connecting to address %s\n", target);
        return false;
    }
    return true;
}
...
bool TorControlConnection::Command(const std::string &cmd, const ReplyHandlerCB& reply_handler)
{
    if (!b_conn)
        return false;
    struct evbuffer *buf = bufferevent_get_output(b_conn); // 获取输出缓冲区
    if (!buf)
        return false;
    evbuffer_add(buf, cmd.data(), cmd.size()); // 缓冲区追加命令
    evbuffer_add(buf, "\r\n", 2); // 追加 "\r\n"
    reply_handlers.push_back(reply_handler); // 加入响应函数处理队列
    return true;
}
...
/** Read full contents of a file and return them in a std::string.
 * Returns a pair <status, string>.
 * If an error occured, status will be false, otherwise status will be true and the data will be returned in string.
 *
 * @param maxsize Puts a maximum size limit on the file that is read. If the file is larger than this, truncated data
 *         (with len > maxsize) will be returned.
 */ // 读取某文件的整个内容并以字符串形式返回获取的内容。返回一个对 <状态，读取的字符串>
static std::pair<bool,std::string> ReadBinaryFile(const std::string &filename, size_t maxsize=std::numeric_limits<size_t>::max())
{
    FILE *f = fopen(filename.c_str(), "rb"); // 以 2 进制只读模式打开文件
    if (f == NULL) // 若打开失败
        return std::make_pair(false,""); // 返回<false,空串>对
    std::string retval; // 待获取的字符串类型的文件内容
    char buffer[128]; // 128 字节的缓冲区
    size_t n; // 保存实际读取的字节数
    while ((n=fread(buffer, 1, sizeof(buffer), f)) > 0) { // 读取 128 字节到 buffer，若到文件尾，下次实际读入字节为 0
        retval.append(buffer, buffer+n); // 把实际读取的字节追加到返回值中
        if (retval.size() > maxsize) // 当返回值字符串大小大于最大值时
            break; // 跳出
    }
    fclose(f); // 关闭文件
    return std::make_pair(true,retval); // 返回成功读取的内容<true,文件内容字符串>
}
...
/** Controller that connects to Tor control socket, authenticate, then create
 * and maintain a ephemeral hidden service.
 */ // 控制器连接到洋葱路由控制套接字，然后进行身份验证，然后创建并维持一个短暂的隐藏服务。
class TorController
{
public:
    TorController(struct event_base* base, const std::string& target);
    ~TorController();

    /** Get name fo file to store private key in */
    std::string GetPrivateKeyFile(); // 获取（拼接）洋葱路由私钥文件名

    /** Reconnect, after getting disconnected */
    void Reconnect(); // 断开连接后重连
private:
    struct event_base* base; // 事件基对象指针
    std::string target; // 目标
    TorControlConnection conn; // 洋葱路由控制连接对象
    std::string private_key; // 洋葱路由私钥
    std::string service_id;
    bool reconnect; // 再连接标志
    struct event *reconnect_ev; // 再连接事件对象指针
    float reconnect_timeout; // 再连接超时时间
    CService service; // 服务对象（IP+Port）
    ...
    /** Callback for PROTOCOLINFO result */ // 协议信息结果回调函数
    void protocolinfo_cb(TorControlConnection& conn, const TorControlReply& reply);
    /** Callback after succesful connection */ // 成功连接后的回调函数
    void connected_cb(TorControlConnection& conn);
    /** Callback after connection lost or failed connection attempt */ // 连接断开或失败的连接尝试后的回调函数
    void disconnected_cb(TorControlConnection& conn);
    ...
};

TorController::TorController(struct event_base* base, const std::string& target):
    base(base), // 初始化事件基对象
    target(target), conn(base), reconnect(true), reconnect_ev(0),
    reconnect_timeout(RECONNECT_TIMEOUT_START) // 设定再连接超时时间
{
    // Start connection attempts immediately // 立刻开始尝试连接
    if (!conn.Connect(target, boost::bind(&TorController::connected_cb, this, _1),
         boost::bind(&TorController::disconnected_cb, this, _1) )) { // 连接洋葱路由控制端口
        LogPrintf("tor: Initiating connection to Tor control port %s failed\n", target);
    }
    // Read service private key if cached // 如果已经缓存，则读取服务私钥
    std::pair<bool,std::string> pkf = ReadBinaryFile(GetPrivateKeyFile()); // 读取洋葱路由私钥文件内容
    if (pkf.first) { // 若读取成功
        LogPrint("tor", "tor: Reading cached private key from %s\n", GetPrivateKeyFile());
        private_key = pkf.second; // 设置私钥
    }
}
...
void TorController::connected_cb(TorControlConnection& conn)
{
    reconnect_timeout = RECONNECT_TIMEOUT_START; // 设置重连超时时间
    // First send a PROTOCOLINFO command to figure out what authentication is expected // 首先发送一条协议信息命令，用于找出预期的身份验证
    if (!conn.Command("PROTOCOLINFO 1", boost::bind(&TorController::protocolinfo_cb, this, _1, _2))) // 发送 "PROTOCOLINFO 1" 命令
        LogPrintf("tor: Error sending initial protocolinfo command\n");
}

void TorController::disconnected_cb(TorControlConnection& conn)
{
    // Stop advertizing service when disconnected // 当断开连接时，停止广告服务
    if (service.IsValid()) // 若服务有效
        RemoveLocal(service); // 移除本地服务
    service = CService(); // 创建服务空对象
    if (!reconnect) // 若重连关闭
        return; // 直接返回

    LogPrint("tor", "tor: Not connected to Tor control port %s, trying to reconnect\n", target);

    // Single-shot timer for reconnect. Use exponential backoff. // 用于重连的单次计时器。使用指数回退
    struct timeval time = MillisToTimeval(int64_t(reconnect_timeout * 1000.0));
    reconnect_ev = event_new(base, -1, 0, reconnect_cb, this); // 创建新的事件对象
    event_add(reconnect_ev, &time); // 添加事件对象和时间间隔
    reconnect_timeout *= RECONNECT_TIMEOUT_EXP;
}
...
std::string TorController::GetPrivateKeyFile()
{
    return (GetDataDir() / "onion_private_key").string(); // 返回凭借的数据文件名字符串
}
```

## 参考链接

* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
* [bitcoin/torcontrol.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/torcontrol.h){:target="_blank"}
* [bitcoin/torcontrol.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/torcontrol.cpp){:target="_blank"}
