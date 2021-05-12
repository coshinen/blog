---
layout: post
title:  "比特币 RPC 命令剖析 \"disconnectnode\""
date:   2018-06-29 20:28:12 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli disconnectnode "node"
---
## 1. 帮助内容

```shell
$ bitcoin-cli help disconnectnode
disconnectnode "node"

立刻断开指定节点的连接。

参数：
1. node（字符串，必备）节点（见 getpeerinfo 获取节点）

例子：
> bitcoin-cli disconnectnode "192.168.0.6:8333"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "disconnectnode", "params": ["192.168.0.6:8333"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getaddednodeinfo` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue disconnectnode(const UniValue& params, bool fHelp);
```

实现在文件 `rpcnet.cpp` 中。

```cpp
UniValue disconnectnode(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "disconnectnode \"node\" \n"
            "\nImmediately disconnects from the specified node.\n"
            "\nArguments:\n"
            "1. \"node\"     (string, required) The node (see getpeerinfo for nodes)\n"
            "\nExamples:\n"
            + HelpExampleCli("disconnectnode", "\"192.168.0.6:8333\"")
            + HelpExampleRpc("disconnectnode", "\"192.168.0.6:8333\"")
        ); // 1. 帮助内容

    CNode* pNode = FindNode(params[0].get_str()); // 2. 在已连接的节点中查找指定节点
    if (pNode == NULL)
        throw JSONRPCError(RPC_CLIENT_NODE_NOT_CONNECTED, "Node not found in connected nodes");

    pNode->fDisconnect = true; // 进行标记

    return NullUniValue;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 在已连接的节点中查找指定节点

查找节点函数 `FindNode(params[0].get_str())` 声明在文件 `net.h` 中。

```cpp
CNode* FindNode(const CNetAddr& ip);
CNode* FindNode(const CSubNet& subNet);
CNode* FindNode(const std::string& addrName);
CNode* FindNode(const CService& ip);
```

实现在文件 `net.cpp` 中。

```cpp
vector<CNode*> vNodes;
CCriticalSection cs_vNodes;
...
CNode* FindNode(const std::string& addrName)
{
    LOCK(cs_vNodes);
    BOOST_FOREACH(CNode* pnode, vNodes)
        if (pnode->addrName == addrName)
            return (pnode);
    return NULL;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
