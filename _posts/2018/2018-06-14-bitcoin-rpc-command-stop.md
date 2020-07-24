---
layout: post
title:  "比特币 RPC 命令剖析 \"stop\""
date:   2018-06-14 16:19:52 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli stop
---
## 提示说明

```shell
stop # 终止比特币核心服务 bitcoind
```

## 用法示例

### 比特币核心客户端

关闭比特币核心服务，使其有序退出。

```shell
$ bitcoin-cli stop
Bitcoin server stopping
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "stop", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"Bitcoin server stopping","error":null,"id":"curltest"}
```

## 源码剖析

stop 对应的函数实现在“rpcserver.cpp”文件中。

```cpp
UniValue stop(const UniValue& params, bool fHelp)
{
    // Accept the deprecated and ignored 'detach' boolean argument
    if (fHelp || params.size() > 1) // 1.参数最多为 1 个，这里已经过时，现无参数
        throw runtime_error(
            "stop\n"
            "\nStop Bitcoin server.");
    // Event loop will exit after current HTTP requests have been handled, so
    // this reply will get back to the client. // 在当前 HTTP 请求被处理后时间循环才会退出
    StartShutdown(); // 2.关闭比特币核心服务
    return "Bitcoin server stopping"; // 3.返回停止信息
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 关闭比特币核心服务。
3. 完全关闭前返回客端相关信息。

调用 StartShutdown() 函数关闭比特币核心服务，该函数声明在“init.h”文件中。

```cpp
void StartShutdown(); // 关闭比特币核心服务
```

实现在“init.cpp”文件中。

```cpp
volatile bool fRequestShutdown = false; // 请求关闭标志置，初始为 false

void StartShutdown()
{
    fRequestShutdown = true; // 把请求关闭标志置为 true
}
```

更多细节请参考[比特币核心服务启动过程](/blog/2018/05/the-annotated-bitcoin-sources-00.html)。

## 参考链接

* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
