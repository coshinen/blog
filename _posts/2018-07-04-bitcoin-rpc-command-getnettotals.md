---
layout: post
title:  "比特币 RPC 命令剖析 \"getnettotals\""
date:   2018-07-04 16:47:29 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getnettotals
---
## 提示说明

{% highlight shell %}
getnettotals # 获取关于网络流量的信息，包含流入字节，流出字节，和当前时间
{% endhighlight %}

结果：
{% highlight shell %}
{
  "totalbytesrecv": n,   （数字）接收的总字节
  "totalbytessent": n,   （数字）发送的总字节
  "timemillis": t,       （数字）总 CPU 时间
  "uploadtarget":
  {
    "timeframe": n,                         （数字）测量时间范围的长度，以秒为单位
    "target": n,                            （数字）目标字节数
    "target_reached": true|false,           （布尔型）如果目标可达则为 true
    "serve_historical_blocks": true|false,  （布尔型）如果服务历史的区块则为 true
    "bytes_left_in_cycle": t,               （数字）当前时间周期剩下的字节
    "time_left_in_cycle": t                 （数字）当前时间周期剩余的秒数
  }
}
{% endhighlight %}

## 用法示例

### 比特币核心客户端

获取当前网络总流量信息。

{% highlight shell %}
$ bitcoin-cli getnettotals
{
  "totalbytesrecv": 46172,
  "totalbytessent": 10696,
  "timemillis": 1529999588020,
  "uploadtarget": {
    "timeframe": 86400,
    "target": 0,
    "target_reached": false,
    "serve_historical_blocks": true,
    "bytes_left_in_cycle": 0,
    "time_left_in_cycle": 0
  }
}
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnettotals", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"totalbytesrecv":46794,"totalbytessent":10818,"timemillis":1529999617779,"uploadtarget":{"timeframe":86400,"target":0,"target_reached":false,"serve_historical_blocks":true,"bytes_left_in_cycle":0,"time_left_in_cycle":0}},"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
getnettotals 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getnettotals(const UniValue& params, bool fHelp); // 获取网络流量信息
{% endhighlight %}

实现在“rpcnet.cpp”文件中。

{% highlight C++ %}
UniValue getnettotals(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() > 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "getnettotals\n"
            "\nReturns information about network traffic, including bytes in, bytes out,\n"
            "and current time.\n"
            "\nResult:\n"
            "{\n"
            "  \"totalbytesrecv\": n,   (numeric) Total bytes received\n"
            "  \"totalbytessent\": n,   (numeric) Total bytes sent\n"
            "  \"timemillis\": t,       (numeric) Total cpu time\n"
            "  \"uploadtarget\":\n"
            "  {\n"
            "    \"timeframe\": n,                         (numeric) Length of the measuring timeframe in seconds\n"
            "    \"target\": n,                            (numeric) Target in bytes\n"
            "    \"target_reached\": true|false,           (boolean) True if target is reached\n"
            "    \"serve_historical_blocks\": true|false,  (boolean) True if serving historical blocks\n"
            "    \"bytes_left_in_cycle\": t,               (numeric) Bytes left in current time cycle\n"
            "    \"time_left_in_cycle\": t                 (numeric) Seconds left in current time cycle\n"
            "  }\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("getnettotals", "")
            + HelpExampleRpc("getnettotals", "")
       );

    UniValue obj(UniValue::VOBJ);
    obj.push_back(Pair("totalbytesrecv", CNode::GetTotalBytesRecv())); // 接收的总字节数
    obj.push_back(Pair("totalbytessent", CNode::GetTotalBytesSent())); // 发送的总字节数
    obj.push_back(Pair("timemillis", GetTimeMillis())); // 时间毫秒

    UniValue outboundLimit(UniValue::VOBJ);
    outboundLimit.push_back(Pair("timeframe", CNode::GetMaxOutboundTimeframe()));
    outboundLimit.push_back(Pair("target", CNode::GetMaxOutboundTarget()));
    outboundLimit.push_back(Pair("target_reached", CNode::OutboundTargetReached(false)));
    outboundLimit.push_back(Pair("serve_historical_blocks", !CNode::OutboundTargetReached(true)));
    outboundLimit.push_back(Pair("bytes_left_in_cycle", CNode::GetOutboundTargetBytesLeft()));
    outboundLimit.push_back(Pair("time_left_in_cycle", CNode::GetMaxOutboundTimeLeftInCycle()));
    obj.push_back(Pair("uploadtarget", outboundLimit));
    return obj;
}
{% endhighlight %}

基本流程：
1. 处理命令帮助和参数个数。
2. 创建一个对象类型的结果，追加相关信息到该对象。

Thanks for your time.

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getnettotals){:target="_blank"}
