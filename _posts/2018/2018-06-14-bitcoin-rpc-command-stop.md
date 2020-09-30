---
layout: post
title:  "比特币 RPC 命令剖析 \"stop\""
date:   2018-06-14 16:19:52 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli stop
---
## 1. 帮助内容

```shell
$ bitcoin-cli help stop
stop

停止比特币服务。

例子：
> bitcoin-cli stop
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "stop", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`stop` 对应的函数实现在文件 `rpcserver.cpp` 中。

```cpp
UniValue stop(const UniValue& params, bool fHelp)
{
    // Accept the deprecated and ignored 'detach' boolean argument
    if (fHelp || params.size() > 1)
        throw runtime_error(
            "stop\n"
            "\nStop Bitcoin server."); // 1. 帮助内容
    // Event loop will exit after current HTTP requests have been handled, so
    // this reply will get back to the client. // 在当前 HTTP 请求被处理后时间循环才会退出
    StartShutdown(); // 2. 开始关闭比特币核心服务
    return "Bitcoin server stopping"; // 3. 返回比特币服务器停止信息
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 开始关闭比特币核心服务

开始关闭函数 `StartShutdown()` 函数声明在文件 `init.h` 中。

```cpp
void StartShutdown();
```

实现在文件 `init.cpp` 中。

```cpp
volatile bool fRequestShutdown = false; // 请求关闭标志置，初始为 false

void StartShutdown()
{
    fRequestShutdown = true; // 把请求关闭标志置为 true
}
```

具体的关闭过程请参考[比特币源码剖析（零） 2. 源码剖析 比特币 v0.12.1 核心服务程序启动流程 3.xiii. Shutdown()](/blog/2018/05/the-annotated-bitcoin-sources.html#2-源码剖析)。

## 参考链接

* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
