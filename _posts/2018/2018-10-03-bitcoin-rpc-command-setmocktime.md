---
layout: post
title:  "比特币 RPC 命令剖析 \"setmocktime\""
date:   2018-10-03 11:02:08 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli setmocktime timestamp
---
## 提示说明

```shell
setmocktime timestamp # 设置本地时间为给定时间戳（仅限回归测试模式）
```

参数：
1. timestamp（整型，必备）UNIX 从格林尼治时间 1970-01-01 00:00:00 开始以秒为单位的时间戳，通过 0 返回到使用系统时间。

结果：无返回值。

## 用法示例

### 比特币核心客户端

设置当前系统时间为核心服务器的 mock 时间。

```shell
$ date +%s
1530005207
$ bitcoin-cli -regtest setmocktime 1530005207
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setmocktime", "params": [1530005207] }' -H 'content-type: text/plain;' http://127.0.0.1:18332/
{"result":null,"error":null,"id":"curltest"}
```

## 源码剖析

setmocktime 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue setmocktime(const UniValue& params, bool fHelp); // 设置 mocktime
```

实现在“rpcmisc.cpp”文件中。

```cpp
UniValue setmocktime(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "setmocktime timestamp\n"
            "\nSet the local time to given timestamp (-regtest only)\n"
            "\nArguments:\n"
            "1. timestamp  (integer, required) Unix seconds-since-epoch timestamp\n"
            "   Pass 0 to go back to using the system time."
        );

    if (!Params().MineBlocksOnDemand()) // 网络必须为 regtest 回归测试模式
        throw runtime_error("setmocktime for regression testing (-regtest mode) only");

    // cs_vNodes is locked and node send/receive times are updated
    // atomically with the time change to prevent peers from being
    // disconnected because we think we haven't communicated with them
    // in a long time.
    LOCK2(cs_main, cs_vNodes); // 节点列表上锁

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)); // 参数类型检查，整型
    SetMockTime(params[0].get_int64()); // 获取指定时间戳并设置本地 mock 时间

    uint64_t t = GetTime(); // 获取当前时间
    BOOST_FOREACH(CNode* pnode, vNodes) { // 遍历已建立链接的节点列表
        pnode->nLastSend = pnode->nLastRecv = t; // 设置节点最后一次发送和接收的时间
    }

    return NullUniValue; // 返回空值
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 检查网络模式，必须为回归测试模式。
3. 已建立连接的节点上锁。
4. 检查参数类型，获取该参数并设置本地 Mock 时间。
5. 获取当前时间，并遍历已建立连接的节点列表，设置最后一次发送和接收的时间为当前时间。
6. 返回空值。

第四步，调用 SetMockTime(params[0].get_int64()) 设置 MockTime，该函数声明在“utiltime.h”文件中。

```cpp
void SetMockTime(int64_t nMockTimeIn); // 设置 Mock 时间
```

实现在“utiltime.cpp”文件中。

```cpp
static int64_t nMockTime = 0;  //! For unit testing // 用于单元测试
...
void SetMockTime(int64_t nMockTimeIn)
{
    nMockTime = nMockTimeIn; // 设置指定的 mocktime
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcmisc.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmisc.cpp){:target="_blank"}
* [bitcoin/utiltime.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/utiltime.h){:target="_blank"}
* [bitcoin/utiltime.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/utiltime.cpp){:target="_blank"}
