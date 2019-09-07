---
layout: post
title:  "比特币 RPC 命令剖析 \"disconnectnode\""
date:   2018-06-29 10:28:12 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli disconnectnode "node"
---
## 提示说明

```shell
disconnectnode "node" # 立刻断开与指定节点的连接
```

参数：
1. node（字符串，必备）节点（见 [getpeerinfo](/blog/2018/05/bitcoin-rpc-command-getpeerinfo.html) 获取的节点信息）。

结果：无返回值。

## 用法示例

### 比特币核心客户端

断开与指定节点的连接。

```shell
$ bitcoin-cli getconnectioncount
1
$ bitcoin-cli getaddednodeinfo true
[
  {
    "addednode": "192.168.0.2",
    "connected": true,
    "addresses": [
      {
        "address": "192.168.0.2:8333",
        "connected": "outbound"
      }
    ]
  }, 
  {
    "addednode": "192.168.0.6",
    "connected": false,
    "addresses": [
      {
        "address": "192.168.0.6:8333",
        "connected": "false"
      }
    ]
  }
]
$ bitcoin-cli disconnectnode 192.168.0.2
$ bitcoin-cli getconnectioncount
0
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "disconnectnode", "params": ["192.168.0.2:8333"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
```

## 源码剖析
getaddednodeinfo 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue disconnectnode(const UniValue& params, bool fHelp); // 断开与指定节点的连接
```

实现在“rpcnet.cpp”文件中。

```cpp
UniValue disconnectnode(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "disconnectnode \"node\" \n"
            "\nImmediately disconnects from the specified node.\n"
            "\nArguments:\n"
            "1. \"node\"     (string, required) The node (see getpeerinfo for nodes)\n"
            "\nExamples:\n"
            + HelpExampleCli("disconnectnode", "\"192.168.0.6:8333\"")
            + HelpExampleRpc("disconnectnode", "\"192.168.0.6:8333\"")
        );

    CNode* pNode = FindNode(params[0].get_str()); // 查找指定节点
    if (pNode == NULL) // 未找到要断开连接的节点
        throw JSONRPCError(RPC_CLIENT_NODE_NOT_CONNECTED, "Node not found in connected nodes");

    pNode->fDisconnect = true; // 标记该节点的断开连接标志为 true

    return NullUniValue;
}
```

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.在已建立连接的节点列表中查找指定节点。<br>
3.将找到的节点中断开连接标志置为 true。

第二步，调用 FindNode(params[0].get_str()) 函数在已建立连接的节点列表中查找指定节点。<br>
该函数声明在“net.h”文件中。

```cpp
CNode* FindNode(const CNetAddr& ip);
CNode* FindNode(const CSubNet& subNet);
CNode* FindNode(const std::string& addrName);
CNode* FindNode(const CService& ip);
```

实现在“net.cpp”文件中。

```cpp
CNode* FindNode(const std::string& addrName)
{
    LOCK(cs_vNodes);
    BOOST_FOREACH(CNode* pnode, vNodes) // 遍历建立连接的节点链表
        if (pnode->addrName == addrName) // 若找到指定节点
            return (pnode); // 返回该节点指针
    return NULL; // 否则返回空
}
```

已建立连接的节点列表 vNodes 定义在“net.cpp”文件中。

```cpp
vector<CNode*> vNodes; // 成功建立连接的节点列表
CCriticalSection cs_vNodes;
```

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#disconnectnode){:target="_blank"}
