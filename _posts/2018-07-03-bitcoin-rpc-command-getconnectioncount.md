---
layout: post
title:  "比特币 RPC 命令剖析 \"getconnectioncount\""
date:   2018-07-03 15:00:03 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getconnectioncount
---
## 提示说明

{% highlight shell %}
getconnectioncount # 获取当前连到其他节点的连接数
{% endhighlight %}

结果：（整型）连接数。

## 用法示例

### 比特币核心客户端

获取该核心服务节点当前建立的连接数。

{% highlight shell %}
$ bitcoin-cli getconnectioncount
1
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getconnectioncount", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":1,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
getconnectioncount 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getconnectioncount(const UniValue& params, bool fHelp); // 获取当前的连接数
{% endhighlight %}

实现在“rpcnet.cpp”文件中。

{% highlight C++ %}
UniValue getconnectioncount(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "getconnectioncount\n"
            "\nReturns the number of connections to other nodes.\n"
            "\nResult:\n"
            "n          (numeric) The connection count\n"
            "\nExamples:\n"
            + HelpExampleCli("getconnectioncount", "")
            + HelpExampleRpc("getconnectioncount", "")
        );

    LOCK2(cs_main, cs_vNodes);

    return (int)vNodes.size(); // 返回已建立连接的节点列表的大小
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.返回节点列表的大小。

以建立连接的节点列表 vNodes 在“net.h”文件中被引用。

{% highlight C++ %}
extern std::vector<CNode*> vNodes; // 已建立连接的节点列表
{% endhighlight %}

定义在”net.cpp”文件中。

{% highlight C++ %}
vector<CNode*> vNodes; // 成功建立连接的节点列表
{% endhighlight %}

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getconnectioncount){:target="_blank"}
