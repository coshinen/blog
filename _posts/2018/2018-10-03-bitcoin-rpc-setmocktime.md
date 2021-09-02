---
layout: post
title:  "比特币 RPC 命令「setmocktime」"
date:   2018-10-03 21:02:08 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
setmocktime timestamp

设置本地时间为给定的时间戳（仅用于 -regtest）

参数：
1. timestamp（整型，必备）UNIX 从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的时间戳
   传递 0 以回到使用系统时间。
</pre>

## 源码剖析

`setmocktime` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue setmocktime(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmisc.cpp` 中。

```cpp
UniValue setmocktime(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "setmocktime timestamp\n"
            "\nSet the local time to given timestamp (-regtest only)\n"
            "\nArguments:\n"
            "1. timestamp  (integer, required) Unix seconds-since-epoch timestamp\n"
            "   Pass 0 to go back to using the system time."
        ); // 1. 帮助内容

    if (!Params().MineBlocksOnDemand()) // 2. 检查网络是否为 regtest 回归测试模式
        throw runtime_error("setmocktime for regression testing (-regtest mode) only");

    // cs_vNodes is locked and node send/receive times are updated
    // atomically with the time change to prevent peers from being
    // disconnected because we think we haven't communicated with them
    // in a long time.
    LOCK2(cs_main, cs_vNodes);

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)); // 参数类型检查
    SetMockTime(params[0].get_int64()); // 3. 设置 Mock 时间

    uint64_t t = GetTime();
    BOOST_FOREACH(CNode* pnode, vNodes) { // 4. 遍历已建立连接的节点列表
        pnode->nLastSend = pnode->nLastRecv = t; // 更新节点最后一次发送和接收的时间
    }

    return NullUniValue;
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 3. 设置 Mock 时间

设置 MockTime 函数 `SetMockTime(params[0].get_int64()) ` 声明在文件 `utiltime.h` 中。

```cpp
void SetMockTime(int64_t nMockTimeIn);
```

实现在文件 `utiltime.cpp` 中。

```cpp
static int64_t nMockTime = 0;  //! For unit testing //! 用于单元测试
...
void SetMockTime(int64_t nMockTimeIn)
{
    nMockTime = nMockTimeIn;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmisc.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmisc.cpp){:target="_blank"}
* [bitcoin/utiltime.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/utiltime.h){:target="_blank"}
* [bitcoin/utiltime.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/utiltime.cpp){:target="_blank"}
