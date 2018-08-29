---
layout: post
title:  "比特币 RPC 命令剖析 \"getaddednodeinfo\""
date:   2018-05-30 08:51:03 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getaddednodeinfo dns ( "node" )
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getaddednodeinfo dns ( "node" ) # 获取关于给定或全部添加节点的信息（注意 `addnode` 命令中 `onetry` 选项不在这儿列出）
{% endhighlight %}

参数：<br>
1. `dns` （布尔型，必备）如果为 false，只提供一个添加节点的列表，否则显示连接信息。<br>
2. `node` （字符串，可选）如果提供，则返回关于指定节点的信息，否则返回所有节点信息。

结果：<br>
{% highlight shell %}
[
  {
    "addednode" : "192.168.0.201",   （字符串）节点 ip 地址
    "connected" : true|false,          （布尔型）是否已连接
    "addresses" : [
       {
         "address" : "192.168.0.201:8333",  （字符串）比特币服务器主机和端口
         "connected" : "outbound"           （字符串）3 种连接类型 connection, inbound or outbound
       }
       ,...
     ]
  }
  ,...
]
{% endhighlight %}

## 用法示例

### 比特币核心客户端

用法一：获取所有添加的节点列表。

{% highlight shell %}
$ bitcoin-cli addnode 192.168.0.2 add
$ bitcoin-cli addnode 192.168.0.6 add
$ bitcoin-cli getaddednodeinfo false
[
  {
    "addednode": "192.168.0.2"
  }, 
  {
    "addednode": "192.168.0.6"
  }
]
{% endhighlight %}

用法二：获取所有添加的节点列表的连接信息。

{% highlight shell %}
$ bitcoin-cli addnode 192.168.0.2 add
$ bitcoin-cli addnode 192.168.0.6 add
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
{% endhighlight %}

用法三：获取指定添加的节点的信息。

{% highlight shell %}
$ bitcoin-cli getaddednodeinfo false 192.168.0.2
[
  {
    "addednode": "192.168.0.2"
  }
]
{% endhighlight %}

用法四：获取指定添加的节点的连接信息。

{% highlight shell %}
$ bitcoin-cli getaddednodeinfo true 192.168.0.2
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
  }
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddednodeinfo", "params": [false] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":[{"addednode":"192.168.0.2"},{"addednode":"192.168.0.6"}],"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getaddednodeinfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getaddednodeinfo(const UniValue& params, bool fHelp); // 获取添加节点的信息
{% endhighlight %}

实现在“rpcnet.cpp”文件中。

{% highlight C++ %}
UniValue getaddednodeinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数至少为 1 个，至多为 2 个
        throw runtime_error( // 命令帮助反馈
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
        );

    bool fDns = params[0].get_bool(); // 获取 dns 标志

    list<string> laddedNodes(0); // 添加节点 IP 的双向环状链表
    if (params.size() == 1) // 只有一个参数，未指定节点
    {
        LOCK(cs_vAddedNodes);
        BOOST_FOREACH(const std::string& strAddNode, vAddedNodes) // 遍历添加节点 IP 的列表
            laddedNodes.push_back(strAddNode); // 依次添加到该双向环状链表
    }
    else
    { // 超过 1 个参数
        string strNode = params[1].get_str(); // 获取指定节点 IP 的字符串
        LOCK(cs_vAddedNodes);
        BOOST_FOREACH(const std::string& strAddNode, vAddedNodes) { // 遍历添加节点 IP 的列表
            if (strAddNode == strNode) // 若指定了节点
            {
                laddedNodes.push_back(strAddNode); // 添加到双向环状链表
                break; // 跳出
            }
        }
        if (laddedNodes.size() == 0) // 若该链表大小为 0，表示没有节点被添加
            throw JSONRPCError(RPC_CLIENT_NODE_NOT_ADDED, "Error: Node has not been added.");
    }

    UniValue ret(UniValue::VARR); // 创建数组类型的结果对象
    if (!fDns) // 若关闭了 dns
    {
        BOOST_FOREACH (const std::string& strAddNode, laddedNodes) { // 遍历添加节点 IP 的列表
            UniValue obj(UniValue::VOBJ);
            obj.push_back(Pair("addednode", strAddNode));
            ret.push_back(obj); // 加入结果对象
        }
        return ret; // 返回结果
    } // 若开启了 dns

    list<pair<string, vector<CService> > > laddedAddreses(0); // 添加地址的双向环状链表
    BOOST_FOREACH(const std::string& strAddNode, laddedNodes) { // 遍历添加节点的链表
        vector<CService> vservNode(0);
        if(Lookup(strAddNode.c_str(), vservNode, Params().GetDefaultPort(), fNameLookup, 0)) // IP + 端口 获取服务节点
            laddedAddreses.push_back(make_pair(strAddNode, vservNode)); // 追加到添加地址的双向环状链表
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
    for (list<pair<string, vector<CService> > >::iterator it = laddedAddreses.begin(); it != laddedAddreses.end(); it++) // 遍历添加地址的双向环状链表
    {
        UniValue obj(UniValue::VOBJ);
        obj.push_back(Pair("addednode", it->first));

        UniValue addresses(UniValue::VARR);
        bool fConnected = false; // 连接标志
        BOOST_FOREACH(const CService& addrNode, it->second) {
            bool fFound = false; // 是否在连接的节点列表中找到
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
            if (!fFound) // 未找到，未连接
                node.push_back(Pair("connected", "false"));
            addresses.push_back(node);
        }
        obj.push_back(Pair("connected", fConnected));
        obj.push_back(Pair("addresses", addresses));
        ret.push_back(obj); // 加入结果集
    }

    return ret; // 返回数组类型的结果
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.获取布尔型的 dns 标志。<br>
3.创建添加节点 IP 的链表，根据是否有第二个参数，添加相应（全部或指定）节点到该链表。<br>
4.若关闭了 dns，只添加节点 IP 到结果集并返回。<br>
5.若开启了 dns，则追加相应的连接状态以及端口号到结果集并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getaddednodeinfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
