---
layout: post
title:  "比特币 RPC 命令「ping」"
date:   2018-07-10 20:18:16 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli ping
---
## 1. 帮助内容

```shell
$ bitcoin-cli help ping
ping

把一个 ping 发送到所有其他节点的请求，用来测量 ping 时间。
getpeerinfo 提供的结果，pingtime 和 pingwait 字段是以 10 进制的秒为单位。
ping 命令和所有其他命令一起在队列中处理，所以它测量处理积压工作，而不仅仅是网络 ping。

例子：
> bitcoin-cli ping
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "ping", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`ping` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue ping(const UniValue& params, bool fHelp);
```

实现在文件 `rpcnet.cpp` 中。

```cpp
UniValue ping(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "ping\n"
            "\nRequests that a ping be sent to all other nodes, to measure ping time.\n"
            "Results provided in getpeerinfo, pingtime and pingwait fields are decimal seconds.\n"
            "Ping command is handled in queue with all other commands, so it measures processing backlog, not just network ping.\n"
            "\nExamples:\n"
            + HelpExampleCli("ping", "")
            + HelpExampleRpc("ping", "")
        ); // 1. 帮助内容

    // Request that each node send a ping during next message processing pass
    LOCK2(cs_main, cs_vNodes); // 每个节点在下一条消息处理过程中发送一个 ping

    BOOST_FOREACH(CNode* pNode, vNodes) { // 2. 遍历已建立连接的节点列表
        pNode->fPingQueued = true; // 把节点的 ping 队列标志置为 true
    }

    return NullUniValue;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

### 2.2. 遍历已建立连接的节点列表，把节点的 ping 队列标志置为 true

数据成员 `pNode->fPingQueued` 定义在文件 `net.h` 的节点类 `CNode` 中。

```cpp
/** Information about a peer */
class CNode
{
    ...
    // Whether a ping is requested.
    bool fPingQueued; // 是否请求一个 ping。
    ...
};
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
