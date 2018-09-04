---
layout: post
title:  "比特币源码剖析（十二）"
date:   2018-08-11 13:07:25 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了第五步验证钱包数据库的完整性的详细过程，详见[比特币源码剖析（十一）](/2018/08/04/bitcoin-source-anatomy-11)。<br>
本篇主要分析 `Step 6: network initialization` 第六步网络初始化的详细过程。

## 源码剖析

<p id="Step06-ref"></p>
3.11.6.第六步，网络初始化。这部分代码实现在“init.cpp”文件的 `AppInit2(...)` 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 6: network initialization // 网络初始化

    RegisterNodeSignals(GetNodeSignals()); // 1.注册节点信号，获取节点信号全局对象，传入进行注册

    // sanitize comments per BIP-0014, format user agent and check total size // 根据 BIP-0014 清理评论，格式化用户代理并检查总大小
    std::vector<string> uacomments; // 2.存放用户代理评论列表
    BOOST_FOREACH(string cmt, mapMultiArgs["-uacomment"]) // 依次遍历所有评论
    {
        if (cmt != SanitizeString(cmt, SAFE_CHARS_UA_COMMENT)) // 序列化字符串后进行比较，保证不含不安全的字符
            return InitError(strprintf(_("User Agent comment (%s) contains unsafe characters."), cmt));
        uacomments.push_back(SanitizeString(cmt, SAFE_CHARS_UA_COMMENT)); // 加入评论列表
    }
    strSubVersion = FormatSubVersion(CLIENT_NAME, CLIENT_VERSION, uacomments); // 6.3.获取客户子版本信息
    if (strSubVersion.size() > MAX_SUBVERSION_LENGTH) { // 版本信息不得超过 256 个字节
        return InitError(strprintf(_("Total length of network version string (%i) exceeds maximum length (%i). Reduce the number or size of uacomments."),
            strSubVersion.size(), MAX_SUBVERSION_LENGTH));
    }

    if (mapArgs.count("-onlynet")) { // 3.指定网络选项，只连接到指定网络中的节点
        std::set<enum Network> nets; // 存放指定网络的集合
        BOOST_FOREACH(const std::string& snet, mapMultiArgs["-onlynet"]) { // 遍历 -onlynet 的所有值
            enum Network net = ParseNetwork(snet); // 解析网络
            if (net == NET_UNROUTABLE)
                return InitError(strprintf(_("Unknown network specified in -onlynet: '%s'"), snet));
            nets.insert(net); // 放入指定网络的集合
        }
        for (int n = 0; n < NET_MAX; n++) { // 遍历网络类型，共 5 种
            enum Network net = (enum Network)n;
            if (!nets.count(net)) // 若该网络类型未指定
                SetLimited(net); // 禁用未指定的网络类型
        }
    }

    if (mapArgs.count("-whitelist")) { // 4.白名单选项
        BOOST_FOREACH(const std::string& net, mapMultiArgs["-whitelist"]) { // 遍历指定的白名单列表
            CSubNet subnet(net); // 构建子网对象
            if (!subnet.IsValid()) // 检测子网是否有效
                return InitError(strprintf(_("Invalid netmask specified in -whitelist: '%s'"), net));
            CNode::AddWhitelistedRange(subnet); // 把有效的子网加入白名单列表
        }
    }

    bool proxyRandomize = GetBoolArg("-proxyrandomize", DEFAULT_PROXYRANDOMIZE); // 5.代理随机化选项，默认开启
    // -proxy sets a proxy for all outgoing network traffic // -proxy 设置全部向外网络流量的代理
    // -noproxy (or -proxy=0) as well as the empty string can be used to not set a proxy, this is the default // -noproxy（或 -proxy=0）以及空字符串用于不设置代理，这是默认值
    std::string proxyArg = GetArg("-proxy", ""); // 代理选项，指定代理地址，默认为 ""
    if (proxyArg != "" && proxyArg != "0") { // 值非 0 且 非空表示设置了代理
        proxyType addrProxy = proxyType(CService(proxyArg, 9050), proxyRandomize); // 设置代理地址和端口，端口默认为 9050
        if (!addrProxy.IsValid()) // 验证代理地址的有效性
            return InitError(strprintf(_("Invalid -proxy address: '%s'"), proxyArg));

        SetProxy(NET_IPV4, addrProxy); // 设置 IPV4 代理
        SetProxy(NET_IPV6, addrProxy); // 设置 IPV6 代理
        SetProxy(NET_TOR, addrProxy); // 设置 TOR 洋葱路由代理
        SetNameProxy(addrProxy); // 设置名字代理
        SetReachable(NET_TOR); // by default, -proxy sets onion as reachable, unless -noonion later
    }

    // -onion can be used to set only a proxy for .onion, or override normal proxy for .onion addresses // -onion 选项用于仅为 .onion 设置代理，或覆盖 .onion 地址的普通代理
    // -noonion (or -onion=0) disables connecting to .onion entirely // -noonion（或 -onion=0）完全关闭连接到 .onion
    // An empty string is used to not override the onion proxy (in which case it defaults to -proxy set above, or none) // 空字符串用于不覆盖洋葱代理（在此情况下，默认 -proxy 设置上面，或无）
    std::string onionArg = GetArg("-onion", ""); // 洋葱路由选项，默认关闭
    if (onionArg != "") { // 值非空时
        if (onionArg == "0") { // Handle -noonion/-onion=0
            SetReachable(NET_TOR, false); // set onions as unreachable
        } else { // 设置洋葱路由
            proxyType addrOnion = proxyType(CService(onionArg, 9050), proxyRandomize); // 设置洋葱路由地址和端口
            if (!addrOnion.IsValid()) // 检测洋葱路由地址可用性
                return InitError(strprintf(_("Invalid -onion address: '%s'"), onionArg));
            SetProxy(NET_TOR, addrOnion); // 设置洋葱代理
            SetReachable(NET_TOR); // 设置洋葱网络可达
        }
    }

    // see Step 2: parameter interactions for more information about these // 6.获取更多相关信息，查看第二步：参数交互
    fListen = GetBoolArg("-listen", DEFAULT_LISTEN); // 监听选项，默认开启
    fDiscover = GetBoolArg("-discover", true); // 发现选项，默认开启
    fNameLookup = GetBoolArg("-dns", DEFAULT_NAME_LOOKUP); // dns 名字发现，默认打开

    bool fBound = false; // 绑定状态，初始化为 false
    if (fListen) { // 默认 true
        if (mapArgs.count("-bind") || mapArgs.count("-whitebind")) { // 指定了 -bind 选项或 -whitebind
            BOOST_FOREACH(const std::string& strBind, mapMultiArgs["-bind"]) { // 遍历 bind 地址
                CService addrBind;
                if (!Lookup(strBind.c_str(), addrBind, GetListenPort(), false)) // 解析 bind 地址
                    return InitError(strprintf(_("Cannot resolve -bind address: '%s'"), strBind));
                fBound |= Bind(addrBind, (BF_EXPLICIT | BF_REPORT_ERROR)); // bind 绑定指定地址
            }
            BOOST_FOREACH(const std::string& strBind, mapMultiArgs["-whitebind"]) { // 遍历待绑定的白名单
                CService addrBind;
                if (!Lookup(strBind.c_str(), addrBind, 0, false))
                    return InitError(strprintf(_("Cannot resolve -whitebind address: '%s'"), strBind));
                if (addrBind.GetPort() == 0)
                    return InitError(strprintf(_("Need to specify a port with -whitebind: '%s'"), strBind));
                fBound |= Bind(addrBind, (BF_EXPLICIT | BF_REPORT_ERROR | BF_WHITELIST));
            }
        }
        else { // 未设置 bind
            struct in_addr inaddr_any;
            inaddr_any.s_addr = INADDR_ANY; // 则绑定任意地址类型
            fBound |= Bind(CService(in6addr_any, GetListenPort()), BF_NONE); // 绑定本地 ipv6
            fBound |= Bind(CService(inaddr_any, GetListenPort()), !fBound ? BF_REPORT_ERROR : BF_NONE); // 绑定本地 ipv4，0.0.0.0:port 表示所有地址 或 任意地址
        }
        if (!fBound) // !false 绑定失败，记录错误日志并退出
            return InitError(_("Failed to listen on any port. Use -listen=0 if you want this."));
    }

    if (mapArgs.count("-externalip")) { // 外部的 ip 地址选项
        BOOST_FOREACH(const std::string& strAddr, mapMultiArgs["-externalip"]) { // 遍历指定的外部 ip 地址
            CService addrLocal(strAddr, GetListenPort(), fNameLookup); // 创建一个连接（地址和端口）对象
            if (!addrLocal.IsValid()) // 验证地址有效性
                return InitError(strprintf(_("Cannot resolve -externalip address: '%s'"), strAddr));
            AddLocal(CService(strAddr, GetListenPort(), fNameLookup), LOCAL_MANUAL); // 添加到本地主机映射列表
        }
    }

    BOOST_FOREACH(const std::string& strDest, mapMultiArgs["-seednode"]) // 遍历添加的种子节点 IP 地址
        AddOneShot(strDest); // 加入双端队列 vOneShots

#if ENABLE_ZMQ // 7.开启 ZeroMQ 选项，一套嵌入式的网络链接库，类似于 Socket 的一系列接口
    pzmqNotificationInterface = CZMQNotificationInterface::CreateWithArguments(mapArgs); // 初始化

    if (pzmqNotificationInterface) {
        RegisterValidationInterface(pzmqNotificationInterface); // 注册 zmq 通知接口
    }
#endif
    if (mapArgs.count("-maxuploadtarget")) { // 8.尝试保持外接流量低于给定目标值
        CNode::SetMaxOutboundTarget(GetArg("-maxuploadtarget", DEFAULT_MAX_UPLOAD_TARGET)*1024*1024); // 默认为 0 表示无限制
    }
    ...
}
{% endhighlight %}

1.注册节点信号函数。<br>
2.处理用户代理字符串，防止出现不安全字符。<br>
3.禁用未指定的网络类型。<br>
4.构建白名单列表。<br>
5.设置代理，洋葱网络。<br>
6.部分参数交互。<br>
7.设置 `ZMQ`。<br>
8.设置最大向外流量阈值。

1.调用 `RegisterNodeSignals(GetNodeSignals())` 注册节点信号，
首先调用 `GetNodeSignals()` 获取节点信号全局对象 `g_signals` 的引用，该函数声明在“net.h”文件中。

{% highlight C++ %}
CNodeSignals& GetNodeSignals(); // 获取节点信号全局对象的引用
{% endhighlight %}

实现在“net.cpp”文件中，没有入参。

{% highlight C++ %}
// Signals for message handling // 处理消息的全局静态信号对象
static CNodeSignals g_signals;
CNodeSignals& GetNodeSignals() { return g_signals; } // 获取节点信号全局对象的引用
{% endhighlight %}

函数 `RegisterNodeSignals(...)` 声明在“main.h”文件中。

{% highlight C++ %}
/** Register with a network node to receive its signals */ // 注册网络节点来接收其信号
void RegisterNodeSignals(CNodeSignals& nodeSignals);
{% endhighlight %}

实现在“main.cpp”文件中，入参为：节点信号对象。

{% highlight C++ %}
void RegisterNodeSignals(CNodeSignals& nodeSignals)
{
    nodeSignals.GetHeight.connect(&GetHeight); // 获取激活的链高度
    nodeSignals.ProcessMessages.connect(&ProcessMessages); // 处理消息，并进行响应
    nodeSignals.SendMessages.connect(&SendMessages); // 发送消息
    nodeSignals.InitializeNode.connect(&InitializeNode); // 初始化节点
    nodeSignals.FinalizeNode.connect(&FinalizeNode); // 终止节点
}
{% endhighlight %}

这里连接（注册）的 5 个信号函数先不展开，等调用时在分析。

3.调用 `SetLimited(net)` 禁用未指定的网络类型，该函数声明在“net.h”文件中。

{% highlight C++ %}
void SetLimited(enum Network net, bool fLimited = true); // 设置网络类型限制
{% endhighlight %}

实现在“net.cpp”文件中，入参为：枚举的网络类型。

{% highlight C++ %}
/** Make a particular network entirely off-limits (no automatic connects to it) */ // 使特定网络完全禁止（不自动连接到该网络）
void SetLimited(enum Network net, bool fLimited) // fLimited 默认为 true
{
    if (net == NET_UNROUTABLE) // 不可路由类型的网络
        return; // 什么也不做直接返回
    LOCK(cs_mapLocalHost); // 上锁
    vfLimited[net] = fLimited; // 把未指定的网络类型设为 true，表示该网络类型被限制
}
{% endhighlight %}

网络类型共 4 种，分别为 `NET_UNROUTABLE`，`NET_IPV4`，`NET_IPV6` 和 `NET_TOR`，其枚举定义在“netbase.h”文件中。

{% highlight C++ %}
enum Network // 网络类型枚举
{
    NET_UNROUTABLE = 0,
    NET_IPV4, // 1
    NET_IPV6, // 2
    NET_TOR, // 3

    NET_MAX, // 4
};
{% endhighlight %}

4.调用 `CNode::AddWhitelistedRange(subnet)` 添加子网到白名单，该函数声明在“net.h”文件的 `CNode` 类中。

{% highlight C++ %}
/** Information about a peer */ // 关于对端节点的信息
class CNode // 对端节点信息类
{
    ...
    // Whitelisted ranges. Any node connecting from these is automatically // 白名单范围。从这些节点连接的任何节点都会自动加入白名单
    // whitelisted (as well as those connecting to whitelisted binds). // （且连接到白名单绑定的节点）
    static std::vector<CSubNet> vWhitelistedRange;
    ...
    static void AddWhitelistedRange(const CSubNet &subnet); // 添加子网到白名单
    ...
};
{% endhighlight %}

实现在“net.cpp”文件中，入参为：子网对象。

{% highlight C++ %}
std::vector<CSubNet> CNode::vWhitelistedRange; // 白名单列表
...
void CNode::AddWhitelistedRange(const CSubNet &subnet) {
    LOCK(cs_vWhitelistedRange);
    vWhitelistedRange.push_back(subnet); // 添加到白名单列表中
}
{% endhighlight %}

5.调用 `SetProxy(NET_IPV4, addrProxy)` 设置 `IPv4`，`IPv6` 和 `TOR` 网络代理，
调用 `SetNameProxy(addrProxy)` 设置名字代理，
它们均声明在“netbase.h”文件中。

{% highlight C++ %}
bool SetProxy(enum Network net, const proxyType &addrProxy); // 设置代理
...
bool SetNameProxy(const proxyType &addrProxy); // 设置名字代理
{% endhighlight %}

实现在“netbase.cpp”文件中，入参为：枚举的网络类型，代理对象。

{% highlight C++ %}
// Settings // 设置
static proxyType proxyInfo[NET_MAX]; // 代理列表（数组）
static proxyType nameProxy; // 名字代理
static CCriticalSection cs_proxyInfos; // 代理信息列表锁
...
bool SetProxy(enum Network net, const proxyType &addrProxy) {
    assert(net >= 0 && net < NET_MAX); // 验证网络类型
    if (!addrProxy.IsValid()) // 若地址代理无效
        return false; // 返回 false
    LOCK(cs_proxyInfos); // 代理信息上锁
    proxyInfo[net] = addrProxy; // 放入代理列表（数组）
    return true; // 设置成功返回 true
}
...
bool SetNameProxy(const proxyType &addrProxy) {
    if (!addrProxy.IsValid()) // 若地址代理无效
        return false; // 返回 false
    LOCK(cs_proxyInfos); // 代理信息上锁
    nameProxy = addrProxy; // 设置名字代理
    return true; // 成功返回 true
}
{% endhighlight %}

然后调用 `SetReachable(NET_TOR)` 设置洋葱路由可达，该函数声明在“net.h”文件中。

{% highlight C++ %}
void SetReachable(enum Network net, bool fFlag = true); // 设置网络可达
{% endhighlight %}

实现在“net.cpp”文件中，入参为：枚举的网络类型。

{% highlight C++ %}
CCriticalSection cs_mapLocalHost; // 本地主机映射锁
...
static bool vfReachable[NET_MAX] = {}; // 网络可达列表
...
void SetReachable(enum Network net, bool fFlag)
{
    LOCK(cs_mapLocalHost); // 上锁
    vfReachable[net] = fFlag; // 默认为 true
    if (net == NET_IPV6 && fFlag) // 若指定的是 NET_IPV6
        vfReachable[NET_IPV4] = true; // 则 NET_IPV4 也设置为 true
}
{% endhighlight %}

6.调用 `Lookup(strBind.c_str(), addrBind, GetListenPort(), false)` 解析并获取首个连接节点（地址和端口），
该函数声明在“netbase.h”文件中。

{% highlight C++ %}
bool Lookup(const char *pszName, CService& addr, int portDefault = 0, bool fAllowLookup = true); // 转调下面的重载函数
bool Lookup(const char *pszName, std::vector<CService>& vAddr, int portDefault = 0, bool fAllowLookup = true, unsigned int nMaxSolutions = 0);
{% endhighlight %}

实现在“netbase.cpp”文件中，入参为：指定待绑定的地址，待获取的链接节点对象，监听的端口号，false。

{% highlight C++ %}
bool Lookup(const char *pszName, std::vector<CService>& vAddr, int portDefault, bool fAllowLookup, unsigned int nMaxSolutions)
{
    if (pszName[0] == 0) // IP 不能为空
        return false;
    int port = portDefault; // 默认端口
    std::string hostname = ""; // 保存主机名
    SplitHostPort(std::string(pszName), port, hostname); // 分离主机名和端口

    std::vector<CNetAddr> vIP; // IP 地址列表
    bool fRet = LookupIntern(hostname.c_str(), vIP, nMaxSolutions, fAllowLookup); // 发现内部
    if (!fRet)
        return false;
    vAddr.resize(vIP.size()); // 预开辟同样个数的空间
    for (unsigned int i = 0; i < vIP.size(); i++) // 遍历 IP 地址列表
        vAddr[i] = CService(vIP[i], port); // 传入默认端口创建地址端口对象放入连接节点列表
    return true; // 成功返回 true
}

bool Lookup(const char *pszName, CService& addr, int portDefault, bool fAllowLookup)
{
    std::vector<CService> vService; // 创建连接节点列表
    bool fRet = Lookup(pszName, vService, portDefault, fAllowLookup, 1); // 转调重载函数
    if (!fRet)
        return false;
    addr = vService[0]; // 取列表中的首个
    return true; // 成功返回 true
}
{% endhighlight %}

然后调用 `Bind(addrBind, (BF_EXPLICIT | BF_REPORT_ERROR))` 绑定并监听上面获取的节点
该函数实现在“init.cpp”文件中，入参为：链接节点对象，标志位。

{% highlight C++ %}
bool static Bind(const CService &addr, unsigned int flags) { // 绑定并获取状态
    if (!(flags & BF_EXPLICIT) && IsLimited(addr))
        return false;
    std::string strError;
    if (!BindListenPort(addr, strError, (flags & BF_WHITELIST) != 0)) { // 绑定并监听端口
        if (flags & BF_REPORT_ERROR)
            return InitError(strError);
        return false;
    }
    return true; // 成功返回 true
}
{% endhighlight %}

其中调用 `BindListenPort(addr, strError, (flags & BF_WHITELIST)` 绑定并监听套接字，该函数声明在“net.h”文件中。

{% highlight C++ %}
bool BindListenPort(const CService &bindAddr, std::string& strError, bool fWhitelisted = false); // 绑定并监听端口
{% endhighlight %}

实现在“net.cpp”文件中，入参为：节点对象，待获取的错误信息，标志位。

{% highlight C++ %}
bool BindListenPort(const CService &addrBind, string& strError, bool fWhitelisted)
{
    strError = ""; // 错误信息
    int nOne = 1;

    // Create socket for listening for incoming connections // 创建套接字用于监听接入的连接
    struct sockaddr_storage sockaddr;
    socklen_t len = sizeof(sockaddr);
    if (!addrBind.GetSockAddr((struct sockaddr*)&sockaddr, &len)) // 获取套接字地址
    {
        strError = strprintf("Error: Bind address family for %s not supported", addrBind.ToString());
        LogPrintf("%s\n", strError);
        return false;
    }

    SOCKET hListenSocket = socket(((struct sockaddr*)&sockaddr)->sa_family, SOCK_STREAM, IPPROTO_TCP); // 创建监听套接字，typedef u_int SOCKET; 定义在 compat.h
    if (hListenSocket == INVALID_SOCKET) // (SOCKET)(~0) 定义在 compat.h
    {
        strError = strprintf("Error: Couldn't open socket for incoming connections (socket returned error %s)", NetworkErrorString(WSAGetLastError()));
        LogPrintf("%s\n", strError);
        return false;
    }
    if (!IsSelectableSocket(hListenSocket)) // 若该套接字为不可选 socket
    {
        strError = "Error: Couldn't create a listenable socket for incoming connections";
        LogPrintf("%s\n", strError);
        return false;
    }


#ifndef WIN32 // Unix/Linux
#ifdef SO_NOSIGPIPE // BSD
    // Different way of disabling SIGPIPE on BSD // 在 BSD 使用不同的方式禁止 SIGPIPE 信号
    setsockopt(hListenSocket, SOL_SOCKET, SO_NOSIGPIPE, (void*)&nOne, sizeof(int));
#endif
    // Allow binding if the port is still in TIME_WAIT state after // 如果端口在该程序关闭并重启后
    // the program was closed and restarted. // 仍处于 TIME_WAIT 状态，允许绑定。（设置端口重用）
    setsockopt(hListenSocket, SOL_SOCKET, SO_REUSEADDR, (void*)&nOne, sizeof(int));
    // Disable Nagle's algorithm // 禁用 Nagle 算法
    setsockopt(hListenSocket, IPPROTO_TCP, TCP_NODELAY, (void*)&nOne, sizeof(int));
#else
    setsockopt(hListenSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&nOne, sizeof(int));
    setsockopt(hListenSocket, IPPROTO_TCP, TCP_NODELAY, (const char*)&nOne, sizeof(int));
#endif

    // Set to non-blocking, incoming connections will also inherit this // 设置非阻塞，接入连接将继承该特性
    if (!SetSocketNonBlocking(hListenSocket, true)) { // 对套接字设置非阻塞
        strError = strprintf("BindListenPort: Setting listening socket to non-blocking failed, error %s\n", NetworkErrorString(WSAGetLastError()));
        LogPrintf("%s\n", strError);
        return false;
    }

    // some systems don't have IPV6_V6ONLY but are always v6only; others do have the option // 一些系统没有 IPV6_V6ONLY 但总是开启 v6only 模式；
    // and enable it by default or not. Try to enable it, if possible. // 其它有选项默认开启或关闭它。如果可能，则尝试开启。
    if (addrBind.IsIPv6()) { // 若为 IPv6
#ifdef IPV6_V6ONLY
#ifdef WIN32
        setsockopt(hListenSocket, IPPROTO_IPV6, IPV6_V6ONLY, (const char*)&nOne, sizeof(int));
#else
        setsockopt(hListenSocket, IPPROTO_IPV6, IPV6_V6ONLY, (void*)&nOne, sizeof(int));
#endif
#endif
#ifdef WIN32
        int nProtLevel = PROTECTION_LEVEL_UNRESTRICTED;
        setsockopt(hListenSocket, IPPROTO_IPV6, IPV6_PROTECTION_LEVEL, (const char*)&nProtLevel, sizeof(int));
#endif
    }

    if (::bind(hListenSocket, (struct sockaddr*)&sockaddr, len) == SOCKET_ERROR) // bind
    {
        int nErr = WSAGetLastError();
        if (nErr == WSAEADDRINUSE)
            strError = strprintf(_("Unable to bind to %s on this computer. Bitcoin Core is probably already running."), addrBind.ToString());
        else
            strError = strprintf(_("Unable to bind to %s on this computer (bind returned error %s)"), addrBind.ToString(), NetworkErrorString(nErr));
        LogPrintf("%s\n", strError);
        CloseSocket(hListenSocket);
        return false;
    }
    LogPrintf("Bound to %s\n", addrBind.ToString());

    // Listen for incoming connections // 监听接入连接
    if (listen(hListenSocket, SOMAXCONN) == SOCKET_ERROR) // listen SOMAXCONN 128?
    {
        strError = strprintf(_("Error: Listening for incoming connections failed (listen returned error %s)"), NetworkErrorString(WSAGetLastError()));
        LogPrintf("%s\n", strError);
        CloseSocket(hListenSocket); // 监听失败关闭该套接字
        return false; // 失败返回 false
    } // 监听成功

    vhListenSocket.push_back(ListenSocket(hListenSocket, fWhitelisted)); // 加入监听的套接字列表

    if (addrBind.IsRoutable() && fDiscover && !fWhitelisted) // 若绑定地址端口可达，发现标志开启，且未加入白名单
        AddLocal(addrBind, LOCAL_BIND); // 加入本地主机映射列表

    return true; // 绑定，监听套接字成功返回 true
}
{% endhighlight %}

8.调用 `CNode::SetMaxOutboundTarget(GetArg("-maxuploadtarget", DEFAULT_MAX_UPLOAD_TARGET)*1024*1024)` 设置向外流量最大值，
该函数声明在“net.h”文件的 `CNode` 类中。

{% highlight C++ %}
class CNode // 对端节点信息类
{
    ...
    //!set the max outbound target in bytes // 以字节为单位设置最大向外目标值（发送流量阈值）
    static void SetMaxOutboundTarget(uint64_t limit);
    ...
};
{% endhighlight %}

实现在“net.cpp”文件中，入参为：指定的最大值。

{% highlight C++ %}
uint64_t CNode::nTotalBytesSent = 0; // 发送总字节数最大值
...
CCriticalSection CNode::cs_totalBytesSent; // 发送总字节数锁
...
void CNode::SetMaxOutboundTarget(uint64_t limit)
{
    LOCK(cs_totalBytesSent); // 总发送字节上锁
    uint64_t recommendedMinimum = (nMaxOutboundTimeframe / 600) * MAX_BLOCK_SIZE; // 设置推荐的最小值
    nMaxOutboundLimit = limit; // 设置最大值

    if (limit > 0 && limit < recommendedMinimum) // 若最大值大于 0，则最大值不能低于最小值
        LogPrintf("Max outbound target is very small (%s bytes) and will be overshot. Recommended minimum is %s bytes.\n", nMaxOutboundLimit, recommendedMinimum);
}
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（十三）](/2018/08/18/bitcoin-source-anatomy-13)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
