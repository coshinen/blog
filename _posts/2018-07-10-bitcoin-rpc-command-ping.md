---
layout: post
title:  "比特币 RPC 命令剖析 \"ping\""
date:   2018-07-10 14:18:16 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli ping
---
## 提示说明

{% highlight shell %}
ping # 把一个 ping 发送到其他全部节点的请求，用以衡量 ping 时间
{% endhighlight %}

[getpeerinfo](/blog/2018/07/bitcoin-rpc-command-getpeerinfo.html) 提供的结果 pingtime 和 pingwait 字段是以 10 进制的秒为单位。<br>
ping 命令和所有其他命令在队列中被处理，所以它测量处理积压，而不仅是网络 ping。

结果：无返回值。

## 用法示例

### 比特币核心客户端

配合使用 RPC 命令 [getpeerinfo](/blog/2018/07/bitcoin-rpc-command-getpeerinfo.html) 查看 ping 时间。

{% highlight shell %}
$ bitcoin-cli getpeerinfo | grep ping
    "pingtime": 0.015589,
    "minping": 0.00713,
$ bitcoin-cli ping
$ bitcoin-cli getpeerinfo | grep ping
    "pingtime": 0.013607,
    "minping": 0.00713,
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "ping", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
ping 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue ping(const UniValue& params, bool fHelp); // ping 命令在 getpeerinfo 结果的 pingtime 字段查看
{% endhighlight %}

实现在“rpcnet.cpp”文件中。

{% highlight C++ %}
UniValue ping(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "ping\n"
            "\nRequests that a ping be sent to all other nodes, to measure ping time.\n"
            "Results provided in getpeerinfo, pingtime and pingwait fields are decimal seconds.\n"
            "Ping command is handled in queue with all other commands, so it measures processing backlog, not just network ping.\n"
            "\nExamples:\n"
            + HelpExampleCli("ping", "")
            + HelpExampleRpc("ping", "")
        );

    // Request that each node send a ping during next message processing pass
    LOCK2(cs_main, cs_vNodes); // 请求在下一条消息处理完后每个节点发送一个 ping

    BOOST_FOREACH(CNode* pNode, vNodes) { // 遍历已建立连接的每个节点
        pNode->fPingQueued = true; // 设置其 ping 请求队列标志为 true
    }

    return NullUniValue;
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.遍历已建立连接的节点，把每个节点中的请求 ping 标志置为 true。

第三步，数据成员 pNode->fPingQueued 定义在“net.h”文件的 CNode 类中。

{% highlight C++ %}
/** Information about a peer */
class CNode // 关于同辈的信息
{
    ...
    // Whether a ping is requested.
    bool fPingQueued; // 是否请求一个 ping
    ...
};
{% endhighlight %}

Thanks for your time.

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#ping)
