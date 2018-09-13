---
layout: post
title:  "比特币源码剖析（十）"
date:   2018-07-28 10:30:02 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了应用程序初始化中初始化 HTTP 服务器的详细过程，详见[比特币源码剖析（九）](/2018/07/21/bitcoin-source-anatomy-09)。<br>
本篇主要分析 Step 4: application initialization: dir lock, daemonize, pidfile, debug log 第四步应用程序初始化服务器中启动 RPC 的详细过程。

## 源码剖析

9.2.5.调用 StartHTTPRPC() 函数启动 HTTP 和 RPC（在这里注册的 RPC 处理函数），该函数声明在“httprpc.h”文件中。

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

1.初始化 RPC 身份验证，用于验证 RPC 用户名和密码。<br>
2.注册 HTTP 处理函数。<br>
3.创建 HTTP 定时器接口对象，并注册定时器接口。

1.调用 InitRPCAuthentication() 初始化 RPC 验证（"用户名:密码"），该函数实现在“httprpc.cpp”文件中。

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

若启动选项 -rpcpassword 的值为空时，调用 GenerateAuthCookie(&strRPCUserColonPass) 随机生成身份验证 cookie，该函数声明在“rpcprotocol.h”文件中。

{% highlight C++ %}
/** Generate a new RPC authentication cookie and write it to disk */
bool GenerateAuthCookie(std::string *cookie_out); // 生成一个新的 RPC 身份验证 cookie 并写入磁盘
{% endhighlight %}

实现在“rpcprotocol.cpp”文件中，入参为：RPC 验证信息（用户名冒号密码）全局字符串对象。

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

若启动选项 -rpcpassword 的值非空，及指定了 RPC 密码，则直接以 "用户名:密码" 的形式拼接验证信息字符串。

**注：RPC 用户名可以为空。**

2.调用 RegisterHTTPHandler("/", true, HTTPReq_JSONRPC) 函数注册 HTTP 请求处理函数，它声明在“httpserver.h”文件中。

{% highlight C++ %}
/** Handler for requests to a certain HTTP path */ // 用于请求一个确定的 HTTP 路径的处理函数
typedef boost::function<void(HTTPRequest* req, const std::string &)> HTTPRequestHandler;
/** Register handler for prefix.
 * If multiple handlers match a prefix, the first-registered one will
 * be invoked.
 */ // 注册处理函数前缀。若多个处理函数匹配到一个前缀，则调用首个注册的函数。
void RegisterHTTPHandler(const std::string &prefix, bool exactMatch, const HTTPRequestHandler &handler);
{% endhighlight %}

实现在“httpserver.cpp”文件中，入参为：前缀，是否精准匹配，HTTP 请求处理函数对象。

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

处理 HTTP 请求函数定义在“httprpc.cpp”文件中，入参为：HTTP 请求，...。

{% highlight C++ %}
static bool HTTPReq_JSONRPC(HTTPRequest* req, const std::string &) // HTTP 请求处理函数
{
    // JSONRPC handles only POST // 1.JSONRPC 仅处理 POST 类型 HTTP 请求
    if (req->GetRequestMethod() != HTTPRequest::POST) { // 若非 POST 类型的请求
        req->WriteReply(HTTP_BAD_METHOD, "JSONRPC server handles only POST requests"); // 反馈信息
        return false; // 直接退出并返回 false
    }
    // Check authorization // 2.检查授权
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
        // Parse request // 3.解析请求
        UniValue valRequest; // 构造一个 JSON 对象
        if (!valRequest.read(req->ReadBody())) // 获取请求体
            throw JSONRPCError(RPC_PARSE_ERROR, "Parse error");

        std::string strReply; // 4.响应内容字符串
        // singleton request // 4.1.单例请求
        if (valRequest.isObject()) { // 请求体是一个对象
            jreq.parse(valRequest); // 解析请求，放入 JSON 请求对象中

            UniValue result = tableRPC.execute(jreq.strMethod, jreq.params); // 传入相应的参数执行方法并获取响应结果

            // Send reply // 发送响应
            strReply = JSONRPCReply(result, NullUniValue, jreq.id); // 包装为 JSONRPC 响应内容字符串

        // array of requests // 请求数组
        } else if (valRequest.isArray()) // 4.2.数组
            strReply = JSONRPCExecBatch(valRequest.get_array()); // 批量处理并获取请求的响应内容字符串
        else
            throw JSONRPCError(RPC_PARSE_ERROR, "Top-level object parse error");

        req->WriteHeader("Content-Type", "application/json"); // 5.写入响应头
        req->WriteReply(HTTP_OK, strReply); // 写入状态码和响应内容字符串
    } catch (const UniValue& objError) {
        JSONErrorReply(req, objError, jreq.id);
        return false;
    } catch (const std::exception& e) {
        JSONErrorReply(req, JSONRPCError(RPC_PARSE_ERROR, e.what()), jreq.id);
        return false;
    }
    return true; // 6.成功返回 true
}
{% endhighlight %}

2.1.检查请求类型，只处理 POST 类型的 HTTP 请求。<br>
2.2.检查授权信息，即请求头部的验证信息（用户名、密码）。<br>
2.3.获取请求内容，并构造 UniValue（JSON） 类型的对象。<br>
2.4.解析请求内容，执行响应方法，并获取反馈信息 JSON 字符串。<br>
2.4.1.若请求内容为一个 JSON 对象，则按 2.4 流程走。<br>
2.4.2.若请求内容为一个 JSON 数组（可能含 n 个 JSON 对象），则进行批处理并获取响应字符串。<br>
2.5.把状态码和结果字符串写入响应中，并进行反馈。<br>
2.6.执行成功，返回 true。

2.1.调用 req->GetRequestMethod() 获取 HTTP 请求的请求方式，该函数声明在“httpserver.h”文件的 HTTPRequest 类中。

{% highlight C++ %}
/** In-flight HTTP request.
 * Thin C++ wrapper around evhttp_request.
 */ // 正在进行的 HTTP 请求。evhttp_request 的 C++ 简易包装器。
class HTTPRequest
{
    ...
public:
    HTTPRequest(struct evhttp_request* req);
    ~HTTPRequest();

    enum RequestMethod { // HTTP 请求方式枚举
        UNKNOWN, // 未知
        GET,
        POST,
        HEAD,
        PUT
    };
    ...
    /** Get request method.
     */ // 获取请求方式。
    RequestMethod GetRequestMethod();
    ...
};
{% endhighlight %}

实现在“httpserver.cpp”文件中，没有入参。

{% highlight C++ %}
HTTPRequest::RequestMethod HTTPRequest::GetRequestMethod()
{
    switch (evhttp_request_get_command(req)) { // 获取请求命令（方式）
    case EVHTTP_REQ_GET: // 返回相应的方式
        return GET;
        break;
    case EVHTTP_REQ_POST:
        return POST;
        break;
    case EVHTTP_REQ_HEAD:
        return HEAD;
        break;
    case EVHTTP_REQ_PUT:
        return PUT;
        break;
    default:
        return UNKNOWN;
        break;
    }
}
{% endhighlight %}

2.2.先调用 req->GetHeader("authorization") 函数获取验证信息，再调用 RPCAuthorized(authHeader.second) 函数验证授权。
req->GetHeader("authorization") 声明在“httpserver.h”文件的 HTTPRequest 类中。

{% highlight C++ %}
class HTTPRequest
{
    ...
    /**
     * Get the request header specified by hdr, or an empty string.
     * Return an pair (isPresent,string).
     */ // 通过 hdr 获取请求头部指定的信息，或一个空字符串。返回一个 pair（是否存在，信息字符串）。
    std::pair<bool, std::string> GetHeader(const std::string& hdr);
    ...
};
{% endhighlight %}

实现在“httpserver.cpp”文件中，入参为：关键字的字符串。

{% highlight C++ %}
std::pair<bool, std::string> HTTPRequest::GetHeader(const std::string& hdr)
{
    const struct evkeyvalq* headers = evhttp_request_get_input_headers(req); // 获取请求头部
    assert(headers);
    const char* val = evhttp_find_header(headers, hdr.c_str()); // 获取头部指定键的值
    if (val) // 若该值存在
        return std::make_pair(true, val); // 配对返回
    else
        return std::make_pair(false, "");
}
{% endhighlight %}

RPCAuthorized(authHeader.second) 定义在“httprpc.cpp”文件中，入参为：验证信息字符串。

{% highlight C++ %}
static bool RPCAuthorized(const std::string& strAuth)
{
    if (strRPCUserColonPass.empty()) // Belt-and-suspenders measure if InitRPCAuthentication was not called
        return false; // 若未调用 InitRPCAuthentication 初始化 strRPCUserColonPass，则直接返回 false 表示验证失败
    if (strAuth.substr(0, 6) != "Basic ") // 若验证信息前 6 个字符非 "Basic "
        return false; // 直接返回 false 表示验证失败
    std::string strUserPass64 = strAuth.substr(6); // 截取从下标为 6 的字符开始的字串
    boost::trim(strUserPass64); // 去除原字符串头尾的空格
    std::string strUserPass = DecodeBase64(strUserPass64); // base64 解码
    
    //Check if authorized under single-user field // 检查是否在单用户字段下授权
    if (TimingResistantEqual(strUserPass, strRPCUserColonPass)) {
        return true; // 验证成功返回 true
    } // 否则
    return multiUserAuthorized(strUserPass); // 进行多用户授权检测
}
{% endhighlight %}

2.3.调用 valRequest.read(req->ReadBody()) 获取请求体并初始化一个 JSON 对象。
req->ReadBody() 声明在“httpserver.h”文件的 HTTPRequest 类中。

{% highlight C++ %}
class HTTPRequest
{
    ...
    /**
     * Read request body. // 读请求体。
     *
     * @note As this consumes the underlying buffer, call this only once.
     * Repeated calls will return an empty string.
     */ // 注：因为这会消耗底层缓冲区，所以仅调用一次。重复调用将返回一个空串。
    std::string ReadBody();
    ...
};
{% endhighlight %}

实现在“httpserver.cpp”文件中，没有入参。

{% highlight C++ %}
std::string HTTPRequest::ReadBody()
{
    struct evbuffer* buf = evhttp_request_get_input_buffer(req); // 获取请求的输入缓冲区
    if (!buf)
        return "";
    size_t size = evbuffer_get_length(buf); // 获取缓冲区大小
    /** Trivial implementation: if this is ever a performance bottleneck,
     * internal copying can be avoided in multi-segment buffers by using
     * evbuffer_peek and an awkward loop. Though in that case, it'd be even
     * better to not copy into an intermediate string but use a stream
     * abstraction to consume the evbuffer on the fly in the parsing algorithm.
     */ // 简单的实现：如果这是一个性能瓶颈，通过使用 evbuffer_peek 和笨拙的循环可以在多端缓冲区中避免内部复制。
    const char* data = (const char*)evbuffer_pullup(buf, size); // 获取指定大小的内容
    if (!data) // returns NULL in case of empty buffer // 若为空缓冲区
        return ""; // 返回 ""
    std::string rv(data, size); // 创建一个字符串对象
    evbuffer_drain(buf, size); // 把这部分获取的数据从缓冲区前面移除
    return rv; // 返回缓冲区内容
}
{% endhighlight %}

2.4.1.首先调用 jreq.parse(valRequest) 解析请求到一个 JSON 请求对象中。
该函数声明在“rpcserver.h”文件的 JSONRequest 类中。

{% highlight C++ %}
class JSONRequest // JSON 请求类
{
public:
    UniValue id; // 请求的 id
    std::string strMethod; // 请求的方法
    UniValue params;

    JSONRequest() { id = NullUniValue; }
    void parse(const UniValue& valRequest); // 解析 JSON 请求
};
{% endhighlight %}

实现在“rpcserver.cpp”文件中，入参为：JSON 请求对象。

{% highlight C++ %}
void JSONRequest::parse(const UniValue& valRequest)
{
    // Parse request // 解析请求
    if (!valRequest.isObject()) // 若该请求非 JSON 对象
        throw JSONRPCError(RPC_INVALID_REQUEST, "Invalid Request object"); // 抛出异常，无效请求对象
    const UniValue& request = valRequest.get_obj(); // 获取 JSON 请求对象

    // Parse id now so errors from here on will have the id
    id = find_value(request, "id"); // 现在解析 id，以至于来自此处的错误将有 id

    // Parse method // 解析方法
    UniValue valMethod = find_value(request, "method"); // 获取方法
    if (valMethod.isNull()) // 方法非空
        throw JSONRPCError(RPC_INVALID_REQUEST, "Missing method");
    if (!valMethod.isStr()) // 方法必须为字符串
        throw JSONRPCError(RPC_INVALID_REQUEST, "Method must be a string");
    strMethod = valMethod.get_str(); // 获取方法
    if (strMethod != "getblocktemplate") // 若方法非 "getblocktemplate"
        LogPrint("rpc", "ThreadRPCServer method=%s\n", SanitizeString(strMethod));

    // Parse params // 解析参数
    UniValue valParams = find_value(request, "params"); // 获取请求的参数
    if (valParams.isArray()) // 若参数为 json 数组
        params = valParams.get_array(); // 获取该数组
    else if (valParams.isNull()) // 若参数为空
        params = UniValue(UniValue::VARR); // 新建数组类型空对象
    else // 否则（方法的参数必须为 json 数组类型）
        throw JSONRPCError(RPC_INVALID_REQUEST, "Params must be an array"); // 抛出错误
}
{% endhighlight %}

然后调用 tableRPC.execute(jreq.strMethod, jreq.params) 执行相应的方法并获取反馈结果。
该函数声明在“rpcserver.h”文件的 CRPCTable 类中。

{% highlight C++ %}
/**
 * Bitcoin RPC command dispatcher.
 */ // 比特币 RPC 命令调度器
class CRPCTable // RPC 列表类
{
private:
    std::map<std::string, const CRPCCommand*> mapCommands; // RPC 命令列表
public:
    CRPCTable(); // 注册所有定义的 RPC 命令到 RPC 命令列表
    const CRPCCommand* operator[](const std::string& name) const; // 重载的下标运算符
    std::string help(const std::string& name) const;

    /**
     * Execute a method.
     * @param method   Method to execute
     * @param params   UniValue Array of arguments (JSON objects)
     * @returns Result of the call.
     * @throws an exception (UniValue) when an error happens.
     */ // 执行一个方法
    UniValue execute(const std::string &method, const UniValue &params) const;
};
{% endhighlight %}

实现在“rpcserver.cpp”文件中，入参为：方法名，对应的参数。

{% highlight C++ %}
UniValue CRPCTable::execute(const std::string &strMethod, const UniValue &params) const
{
    // Return immediately if in warmup // 1.如果处于预热状态，立刻返回
    {
        LOCK(cs_rpcWarmup); // rpc 预热状态上锁
        if (fRPCInWarmup) // 若处于预热状态
            throw JSONRPCError(RPC_IN_WARMUP, rpcWarmupStatus); // 抛出异常
    }

    // Find method // 2.查找方法
    const CRPCCommand *pcmd = tableRPC[strMethod]; // 通过方法名获取对应 RPC 命令方法
    if (!pcmd)
        throw JSONRPCError(RPC_METHOD_NOT_FOUND, "Method not found");

    g_rpcSignals.PreCommand(*pcmd); // 3.预处理命令，检查该命令是否开启安全模式

    try
    {
        // Execute // 4.执行
        return pcmd->actor(params, false); // 传入参数是，执行响应的函数行为
    }
    catch (const std::exception& e)
    {
        throw JSONRPCError(RPC_MISC_ERROR, e.what());
    }

    g_rpcSignals.PostCommand(*pcmd); // 5.后处理命令，该信号未注册处理函数
}
{% endhighlight %}

最后调用 JSONRPCReply(result, NullUniValue, jreq.id) 把上面得到的反馈结果包装为 JSON 格式的字符串。
该函数声明在“rpcprotocol.h”文件中。

{% highlight C++ %}
UniValue JSONRPCReplyObj(const UniValue& result, const UniValue& error, const UniValue& id); // JSONRPC 响应对象
std::string JSONRPCReply(const UniValue& result, const UniValue& error, const UniValue& id); // JSONRPC 响应
{% endhighlight %}

实现在“rpcprotocol.cpp”文件中，入参为：反馈结果 JSON 对象，空的 JSON 对象（用于保存错误信息），请求 id。

{% highlight C++ %}
UniValue JSONRPCReplyObj(const UniValue& result, const UniValue& error, const UniValue& id)
{
    UniValue reply(UniValue::VOBJ); // 构造对象类型的 JSON 对象
    if (!error.isNull()) // 若存在错误
        reply.push_back(Pair("result", NullUniValue)); // 返回空结果
    else // 否则
        reply.push_back(Pair("result", result)); // 追加响应的结果
    reply.push_back(Pair("error", error)); // 增加错误字段
    reply.push_back(Pair("id", id)); // 增加 id 字段
    return reply; // 返回响应对象
}

string JSONRPCReply(const UniValue& result, const UniValue& error, const UniValue& id)
{
    UniValue reply = JSONRPCReplyObj(result, error, id); // 转调 JSONRPC 响应对象
    return reply.write() + "\n"; // 结果转换为字符串，拼接换行后返回
}
{% endhighlight %}

2.4.2.调用 JSONRPCExecBatch(valRequest.get_array()) 批处理请求，并获取反馈结果组成的 JSON 对象。
该函数声明在“rpcserver.h”文件中。

{% highlight C++ %}
std::string JSONRPCExecBatch(const UniValue& vReq); // JSONRPC 批量执行
{% endhighlight %}

实现在“rpcserver.cpp”文件中，入参为：请求的 JSON 数组。

{% highlight C++ %}
static UniValue JSONRPCExecOne(const UniValue& req)
{
    UniValue rpc_result(UniValue::VOBJ); // 创建对象类型的 JSON 对象

    JSONRequest jreq;
    try {
        jreq.parse(req); // 解析请求

        UniValue result = tableRPC.execute(jreq.strMethod, jreq.params); // 转调 execute 传入参数并执行命令
        rpc_result = JSONRPCReplyObj(result, NullUniValue, jreq.id); // 包装结果为 JSON 对象
    }
    catch (const UniValue& objError)
    {
        rpc_result = JSONRPCReplyObj(NullUniValue, objError, jreq.id);
    }
    catch (const std::exception& e)
    {
        rpc_result = JSONRPCReplyObj(NullUniValue,
                                     JSONRPCError(RPC_PARSE_ERROR, e.what()), jreq.id);
    }

    return rpc_result; // 返回 rpc 结果对象
}

std::string JSONRPCExecBatch(const UniValue& vReq)
{
    UniValue ret(UniValue::VARR); // 创建数组类型的 JSON 对象
    for (unsigned int reqIdx = 0; reqIdx < vReq.size(); reqIdx++) // 遍历请求
        ret.push_back(JSONRPCExecOne(vReq[reqIdx])); // 执行一次并把响应内容追加到 JSON 对象中

    return ret.write() + "\n"; // 把 JSON 对象转换为字符串，拼接换行符后返回
}
{% endhighlight %}

2.5.先调用 req->WriteHeader("Content-Type", "application/json") 写入响应头信息，再调用 req->WriteReply(HTTP_OK, strReply) 写入状态码和反馈内容。
它们均声明在“httpserver.h”文件的 HTTPRequest 类中。

{% highlight C++ %}
class HTTPRequest
{
    ...
    /**
     * Write output header.
     *
     * @note call this before calling WriteErrorReply or Reply.
     */ // 写入输出（响应）头。注：在调用 WriteErrorReply 或 Reply 前调用该项。
    void WriteHeader(const std::string& hdr, const std::string& value);

    /**
     * Write HTTP reply.
     * nStatus is the HTTP status code to send.
     * strReply is the body of the reply. Keep it empty to send a standard message.
     *
     * @note Can be called only once. As this will give the request back to the
     * main thread, do not call any other HTTPRequest methods after calling this.
     */ // 写入 HTTP 响应。nStatus 是 HTTP 发送的状态码。strReply 是响应体。为空用来发送一条标准消息。
    void WriteReply(int nStatus, const std::string& strReply = "");
};
{% endhighlight %}

实现在“httpserver.cpp”文件中，WriteHeader 的入参为：类型字符串；WriteReply 的入参为：HTTP 状态码，反馈内容字符串。

{% highlight C++ %}
void HTTPRequest::WriteHeader(const std::string& hdr, const std::string& value)
{
    struct evkeyvalq* headers = evhttp_request_get_output_headers(req); // 获取请求头部指针
    assert(headers);
    evhttp_add_header(headers, hdr.c_str(), value.c_str()); // 把相关信息添加到请求头部
}

/** Closure sent to main thread to request a reply to be sent to
 * a HTTP request.
 * Replies must be sent in the main loop in the main http thread,
 * this cannot be done from worker threads.
 */ // 发送到主线程来请求响应用于发送一个 HTTP 请求。反馈必须在主 http 线程的主循环中发送，而不能从工作线程中发送。
void HTTPRequest::WriteReply(int nStatus, const std::string& strReply)
{
    assert(!replySent && req); // 响应未发送 且 存在 http 请求
    // Send event to main http thread to send reply message // 发送事件到主 http 线程来发送响应信息
    struct evbuffer* evb = evhttp_request_get_output_buffer(req); // 获取输出缓冲区结构体指针
    assert(evb);
    evbuffer_add(evb, strReply.data(), strReply.size()); // 添加响应数据和大小到输出缓冲区
    HTTPEvent* ev = new HTTPEvent(eventBase, true, // 构造一个 HTTP 事件对象
        boost::bind(evhttp_send_reply, req, nStatus, (const char*)NULL, (struct evbuffer *)NULL));
    ev->trigger(0); // 立刻触发该事件
    replySent = true; // 响应发送标志置为 true
    req = 0; // transferred back to main thread // 切换回主线程
}
{% endhighlight %}

3.创建 HTTP RPC 定时器接口对象，并调用 RPCRegisterTimerInterface(httpRPCTimerInterface) 注册定时器接口。
该函数声明在“rpcserver.h”文件中。

{% highlight C++ %}
/** Register factory function for timers */ // 注册定时器工厂函数
void RPCRegisterTimerInterface(RPCTimerInterface *iface);
{% endhighlight %}

实现在“rpcserver.cpp”文件中，入参为：HTTPRPC 定时器接口对象。

{% highlight C++ %}
/* Timer-creating functions */ // 定时器创建功能
static std::vector<RPCTimerInterface*> timerInterfaces; // RPC 定时器接口列表
...
void RPCRegisterTimerInterface(RPCTimerInterface *iface)
{
    timerInterfaces.push_back(iface); // 加入定时器接口列表
}
{% endhighlight %}

HTTPRPCTimerInterface  是类 RPCTimerInterface 的派生类，这里把派生类指针转换为基类指针（向上转型）。
该类定义在“httprpc.cpp”文件中。

{% highlight C++ %}
class HTTPRPCTimerInterface : public RPCTimerInterface // HTTPRPC 定时器接口类
{
...
};
{% endhighlight %}

9.2.6.若设置了 -rest 启动选项，则调用 StartREST() 函数启动 REST，它声明在“httprpc.h”文件中。

{% highlight C++ %}
/** Start HTTP REST subsystem.
 * Precondition; HTTP and RPC has been started.
 */ // 启动 HTTP REST 子系统。前提：HTTP 和 RPC 已经启动。
bool StartREST();
{% endhighlight %}

实现在“rest.cpp”文件中，没有入参。

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

遍历 uri_prefixes 结构体数组，调用 RegisterHTTPHandler(uri_prefixes[i].prefix, false, uri_prefixes[i].handler) 把路径对应的处理函数注册（加入）到处理函数列表中，
该函数声明在“httpserver.h”文件中。

{% highlight C++ %}
/** Register handler for prefix.
 * If multiple handlers match a prefix, the first-registered one will
 * be invoked.
 */ // 注册处理函数前缀。若多个处理函数匹配到一个前缀，则调用首个注册的函数。
void RegisterHTTPHandler(const std::string &prefix, bool exactMatch, const HTTPRequestHandler &handler);
{% endhighlight %}

实现在“httpserver.cpp”文件中，入参为：前缀（路径），false（前缀匹配），处理函数入口地址。

{% highlight C++ %}
//! Handlers for (sub)paths // 处理函数（子）路径
std::vector<HTTPPathHandler> pathHandlers; // http 请求路径对应的处理函数列表
...
void RegisterHTTPHandler(const std::string &prefix, bool exactMatch, const HTTPRequestHandler &handler)
{
    LogPrint("http", "Registering HTTP handler for %s (exactmatch %d)\n", prefix, exactMatch);
    pathHandlers.push_back(HTTPPathHandler(prefix, exactMatch, handler)); // 加入处理函数列表
}
{% endhighlight %}

9.2.7.调用 StartHTTPServer() 函数启动 HTTP 服务，它声明在“httpserver.h”文件中。

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
    int rpcThreads = std::max((long)GetArg("-rpcthreads", DEFAULT_HTTP_THREADS), 1L); // 1.获取 RPC 线程数，默认为 4，至少为 1
    LogPrintf("HTTP: starting %d worker threads\n", rpcThreads);
    threadHTTP = boost::thread(boost::bind(&ThreadHTTP, eventBase, eventHTTP)); // 2.创建 HTTP 线程，派发事件循环，http 协议启动

    for (int i = 0; i < rpcThreads; i++) // 3.创建 HTTP 工作队列处理线程
        boost::thread(boost::bind(&HTTPWorkQueueRun, workQueue));
    return true;
}
{% endhighlight %}

1.获取 RPC 线程数，可通过启动选项 -rpcthreads 设置，默认为 4。<br>
2.创建 HTTP 线程。<br>
3.创建 HTTP 工作队列处理线程。

2.调用 boost::thread(boost::bind(&ThreadHTTP, eventBase, eventHTTP)) 创建 HTTP 线程，进入 http 事件循环，
线程函数 ThreadHTTP 定义在“httpserver.cpp”文件中。

{% highlight C++ %}
/** Event dispatcher thread */ // 事件派发线程
static void ThreadHTTP(struct event_base* base, struct evhttp* http)
{
    RenameThread("bitcoin-http"); // 重命名线程
    LogPrint("http", "Entering http event loop\n");
    event_base_dispatch(base); // 进入 http 事件循环
    // Event loop will be interrupted by InterruptHTTPServer() // 事件循环将被 InterruptHTTPServer() 打断
    LogPrint("http", "Exited http event loop\n");
}
{% endhighlight %}

HTTPClosure 是一个虚基类，定义在“httpserver.h”文件中。
DEFAULT_HTTP_THREADS 定义在“httpserver.h”文件中，可通过 -rpcthreads 启动选项改变默认值。

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

3.调用 boost::thread(boost::bind(&HTTPWorkQueueRun, workQueue)) 创建 HTTP 工作队列处理线程，
线程函数 HTTPWorkQueueRun 定义在“httpserver.cpp”文件中。

{% highlight C++ %}
/** Simple wrapper to set thread name and run work queue */ // 设置线程名并运行工作队列的简单包装器
static void HTTPWorkQueueRun(WorkQueue<HTTPClosure>* queue)
{
    RenameThread("bitcoin-httpworker"); // 重命名线程
    queue->Run(); // 依次运行队列中的任务
}
{% endhighlight %}

调用 queue->Run() 运行工作队列，该函数定义在“httpserver.cpp”文件的 WorkQueue 类中。

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

至此，第四步应用程序初始化服务器（HTTP、RPC）完成。

未完待续...<br>
请看下一篇[比特币源码剖析（十一）](/2018/08/04/bitcoin-source-anatomy-11)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
