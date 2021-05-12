---
layout: post
title:  "比特币 RPC 命令剖析 \"getnettotals\""
date:   2018-07-04 20:47:29 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getnettotals
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getnettotals
getnettotals

返回关于网络流量的信息，包含流入字节、流出字节和当前的时间。

结果：
{
  "totalbytesrecv": n,                    （数字）总接收的字节
  "totalbytessent": n,                    （数字）总发送的字节
  "timemillis": t,                        （数字）总 CPU 时间
  "uploadtarget":
  {
    "timeframe": n,                       （数字）以秒为单位的测量时间范围的长度
    "target": n,                          （数字）目标字节数
    "target_reached": true|false,         （布尔型）如果目标可抵达则为 true
    "serve_historical_blocks": true|false,（布尔型）如果服务历史区块则为 true
    "bytes_left_in_cycle": t,             （数字）当前时间周期剩余的字节数
    "time_left_in_cycle": t               （数字）当前时间周期剩余的秒数
  }
}

例子：
> bitcoin-cli getnettotals
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnettotals", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getnettotals` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getnettotals(const UniValue& params, bool fHelp);
```

实现在文件 `rpcnet.cpp` 中。

```cpp
UniValue getnettotals(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() > 0)
        throw runtime_error(
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
       ); // 1. 帮助内容

    UniValue obj(UniValue::VOBJ); // 2. 构建网络流量的对象并返回
    obj.push_back(Pair("totalbytesrecv", CNode::GetTotalBytesRecv()));
    obj.push_back(Pair("totalbytessent", CNode::GetTotalBytesSent()));
    obj.push_back(Pair("timemillis", GetTimeMillis()));

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
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
