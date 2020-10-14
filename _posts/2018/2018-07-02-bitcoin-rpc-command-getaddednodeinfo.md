---
layout: post
title:  "比特币 RPC 命令剖析 \"getaddednodeinfo\""
date:   2018-07-02 08:51:03 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getaddednodeinfo dns ( "node" )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getaddednodeinfo
getaddednodeinfo dns ( "node" )

返回有关给定或所有已添加节点的信息
（注意这里没有列出 addnode onetry）
如果 dns 为 false，则只提供已添加的节点列表，
否则已连接的信息也将可用。

参数：
1. dns   （布尔型，必备）如果为 false，则只提供一个已添加节点的列表，否则已连接的信息也将可用。
2. "node"（字符串，可选）如果已提供，则返回有关该指定节点的信息，否则返回所有节点。

结果：
[
  {
    "addednode" : "192.168.0.201",        （字符串）节点的 ip 地址
    "connected" : true|false,             （布尔型）是否已连接
    "addresses" : [
       {
         "address" : "192.168.0.201:8333",（字符串）比特币服务器主机和端口
         "connected" : "outbound"         （字符串）connection，inbound 或 outbound
       }
       ,...
     ]
  }
  ,...
]

例子：
> bitcoin-cli getaddednodeinfo true
> bitcoin-cli getaddednodeinfo true "192.168.0.201"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddednodeinfo", "params": [true, "192.168.0.201"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getaddednodeinfo` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getaddednodeinfo(const UniValue& params, bool fHelp);
```

实现在文件 `rpcnet.cpp` 中。

```cpp
UniValue getaddednodeinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
            "getaddednodeinfo dns ( \"node\" )\n"
            "\nReturns information about the given added node, or all added nodes\n"
            "(note that onetry addnodes are not listed here)\n"
            "If dns is false, only a list of added nodes will be provided,\n"
            "otherwise connected information will also be available.\n"
            "\nArguments:\n"
            "1. dns        (boolean, required) If false, only a list of added nodes will be provided, otherwise connected information will also be available.\n"
            "2. \"node\"   (string, optional) If provided, return information about this specific node, otherwise all nodes are returned.\n"
            "\nResult:\n"
            "[\n"
            "  {\n"
            "    \"addednode\" : \"192.168.0.201\",   (string) The node ip address\n"
            "    \"connected\" : true|false,          (boolean) If connected\n"
            "    \"addresses\" : [\n"
            "       {\n"
            "         \"address\" : \"192.168.0.201:8333\",  (string) The bitcoin server host and port\n"
            "         \"connected\" : \"outbound\"           (string) connection, inbound or outbound\n"
            "       }\n"
            "       ,...\n"
            "     ]\n"
            "  }\n"
            "  ,...\n"
            "]\n"
            "\nExamples:\n"
            + HelpExampleCli("getaddednodeinfo", "true")
            + HelpExampleCli("getaddednodeinfo", "true \"192.168.0.201\"")
            + HelpExampleRpc("getaddednodeinfo", "true, \"192.168.0.201\"")
        ); // 1. 帮助内容

    bool fDns = params[0].get_bool();

    list<string> laddedNodes(0); // 2. 处理指定节点的情况
    if (params.size() == 1) // 未指定节点
    {
        LOCK(cs_vAddedNodes);
        BOOST_FOREACH(const std::string& strAddNode, vAddedNodes) // 遍历已添加的节点列表
            laddedNodes.push_back(strAddNode); // 依次添加到链表
    }
    else // 指定节点
    {
        string strNode = params[1].get_str();
        LOCK(cs_vAddedNodes);
        BOOST_FOREACH(const std::string& strAddNode, vAddedNodes) { // 遍历添加节点 IP 的列表
            if (strAddNode == strNode) // 若存在指定的节点
            {
                laddedNodes.push_back(strAddNode); // 则添加到链表
                break;
            }
        }
        if (laddedNodes.size() == 0) // 若该链表大小为 0，则表示没有节点被添加。
            throw JSONRPCError(RPC_CLIENT_NODE_NOT_ADDED, "Error: Node has not been added.");
    }

    UniValue ret(UniValue::VARR); // 3. 处理 dns
    if (!fDns) // 若关闭了 dns
    {
        BOOST_FOREACH (const std::string& strAddNode, laddedNodes) { // 遍历已添加节点的链表
            UniValue obj(UniValue::VOBJ);
            obj.push_back(Pair("addednode", strAddNode));
            ret.push_back(obj);
        }
        return ret;
    } // 若开启了 dns

    list<pair<string, vector<CService> > > laddedAddreses(0);
    BOOST_FOREACH(const std::string& strAddNode, laddedNodes) { // 遍历已添加节点的链表
        vector<CService> vservNode(0);
        if(Lookup(strAddNode.c_str(), vservNode, Params().GetDefaultPort(), fNameLookup, 0)) // 查找节点
            laddedAddreses.push_back(make_pair(strAddNode, vservNode)); // 追加到已添加的地址链表
        else
        {
            UniValue obj(UniValue::VOBJ);
            obj.push_back(Pair("addednode", strAddNode));
            obj.push_back(Pair("connected", false));
            UniValue addresses(UniValue::VARR);
            obj.push_back(Pair("addresses", addresses));
        }
    }

    LOCK(cs_vNodes);
    for (list<pair<string, vector<CService> > >::iterator it = laddedAddreses.begin(); it != laddedAddreses.end(); it++) // 遍历已添加的地址链表
    {
        UniValue obj(UniValue::VOBJ);
        obj.push_back(Pair("addednode", it->first));

        UniValue addresses(UniValue::VARR);
        bool fConnected = false;
        BOOST_FOREACH(const CService& addrNode, it->second) {
            bool fFound = false;
            UniValue node(UniValue::VOBJ);
            node.push_back(Pair("address", addrNode.ToString()));
            BOOST_FOREACH(CNode* pnode, vNodes) { // 遍历已建立连接的节点列表
                if (pnode->addr == addrNode) // 若该节点已建立连接
                {
                    fFound = true;
                    fConnected = true;
                    node.push_back(Pair("connected", pnode->fInbound ? "inbound" : "outbound")); // 追加该节点的连接状态
                    break;
                }
            }
            if (!fFound) // 若未找到，则表示未连接
                node.push_back(Pair("connected", "false"));
            addresses.push_back(node);
        }
        obj.push_back(Pair("connected", fConnected));
        obj.push_back(Pair("addresses", addresses));
        ret.push_back(obj);
    }

    return ret;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
