---
layout: post
title:  "比特币 RPC 命令「getpeerinfo」"
date:   2018-07-06 20:21:20 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli getpeerinfo
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getpeerinfo
getpeerinfo

以 json 数组对象的形式返回关于每个已连接的网络节点的数据。

结果：
[
  {
    "id": n,                      （数字）对端索引
    "addr":"host:port",           （字符串）对端的 ip 地址和端口号
    "addrlocal":"ip:port",        （字符串）本地地址
    "services":"xxxxxxxxxxxxxxxx",（字符串）提供的服务
    "relaytxes":true|false,       （布尔型）对端是否要求我们转发交易给它
    "lastsend": ttt,              （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的最后发送时间
    "lastrecv": ttt,              （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的最后接收时间
    "bytessent": n,               （数字）总发送的字节
    "bytesrecv": n,               （数字）总接收的字节
    "conntime": ttt,              （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的连接时间
    "timeoffset": ttt,            （数字）以秒为单位的时间偏移量
    "pingtime": n,                （数字）ping 时间
    "minping": n,                 （数字）观测到的最小 ping 时间
    "pingwait": n,                （数字）ping 等待时间
    "version": v,                 （数字）对端版本，例如 7001
    "subver": "/Satoshi:0.8.5/",  （字符串）字符串版本
    "inbound": true|false,        （布尔型）连入（true），或连出（false）
    "startingheight": n,          （数字）对端起始的高度（区块）
    "banscore": n,                （数字）禁止分数
    "synced_headers": n,          （数字）我们与该对端共同的最后一个区块头
    "synced_blocks": n,           （数字）我们与该对端共同的最后一个区块
    "inflight": [
       n,                         （数字）我们当前从该对端请求的区块高度
       ...
    ]
  }
  ,...
]

例子：
> bitcoin-cli getpeerinfo
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getpeerinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getpeerinfo` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getpeerinfo(const UniValue& params, bool fHelp);
```

实现在文件 `rpcnet.cpp` 中。

```cpp
UniValue getpeerinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "getpeerinfo\n"
            "\nReturns data about each connected network node as a json array of objects.\n"
            "\nResult:\n"
            "[\n"
            "  {\n"
            "    \"id\": n,                   (numeric) Peer index\n"
            "    \"addr\":\"host:port\",      (string) The ip address and port of the peer\n"
            "    \"addrlocal\":\"ip:port\",   (string) local address\n"
            "    \"services\":\"xxxxxxxxxxxxxxxx\",   (string) The services offered\n"
            "    \"relaytxes\":true|false,    (boolean) Whether peer has asked us to relay transactions to it\n"
            "    \"lastsend\": ttt,           (numeric) The time in seconds since epoch (Jan 1 1970 GMT) of the last send\n"
            "    \"lastrecv\": ttt,           (numeric) The time in seconds since epoch (Jan 1 1970 GMT) of the last receive\n"
            "    \"bytessent\": n,            (numeric) The total bytes sent\n"
            "    \"bytesrecv\": n,            (numeric) The total bytes received\n"
            "    \"conntime\": ttt,           (numeric) The connection time in seconds since epoch (Jan 1 1970 GMT)\n"
            "    \"timeoffset\": ttt,         (numeric) The time offset in seconds\n"
            "    \"pingtime\": n,             (numeric) ping time\n"
            "    \"minping\": n,              (numeric) minimum observed ping time\n"
            "    \"pingwait\": n,             (numeric) ping wait\n"
            "    \"version\": v,              (numeric) The peer version, such as 7001\n"
            "    \"subver\": \"/Satoshi:0.8.5/\",  (string) The string version\n"
            "    \"inbound\": true|false,     (boolean) Inbound (true) or Outbound (false)\n"
            "    \"startingheight\": n,       (numeric) The starting height (block) of the peer\n"
            "    \"banscore\": n,             (numeric) The ban score\n"
            "    \"synced_headers\": n,       (numeric) The last header we have in common with this peer\n"
            "    \"synced_blocks\": n,        (numeric) The last block we have in common with this peer\n"
            "    \"inflight\": [\n"
            "       n,                        (numeric) The heights of blocks we're currently asking from this peer\n"
            "       ...\n"
            "    ]\n"
            "  }\n"
            "  ,...\n"
            "]\n"
            "\nExamples:\n"
            + HelpExampleCli("getpeerinfo", "")
            + HelpExampleRpc("getpeerinfo", "")
        ); // 1. 帮助内容

    LOCK(cs_main);

    vector<CNodeStats> vstats; // 2. 获取每个对端的信息并返回
    CopyNodeStats(vstats);

    UniValue ret(UniValue::VARR);

    BOOST_FOREACH(const CNodeStats& stats, vstats) { // 遍历节点状态列表
        UniValue obj(UniValue::VOBJ);
        CNodeStateStats statestats;
        bool fStateStats = GetNodeStateStats(stats.nodeid, statestats);
        obj.push_back(Pair("id", stats.nodeid));
        obj.push_back(Pair("addr", stats.addrName));
        if (!(stats.addrLocal.empty()))
            obj.push_back(Pair("addrlocal", stats.addrLocal));
        obj.push_back(Pair("services", strprintf("%016x", stats.nServices)));
        obj.push_back(Pair("relaytxes", stats.fRelayTxes));
        obj.push_back(Pair("lastsend", stats.nLastSend));
        obj.push_back(Pair("lastrecv", stats.nLastRecv));
        obj.push_back(Pair("bytessent", stats.nSendBytes));
        obj.push_back(Pair("bytesrecv", stats.nRecvBytes));
        obj.push_back(Pair("conntime", stats.nTimeConnected));
        obj.push_back(Pair("timeoffset", stats.nTimeOffset));
        obj.push_back(Pair("pingtime", stats.dPingTime));
        obj.push_back(Pair("minping", stats.dPingMin));
        if (stats.dPingWait > 0.0)
            obj.push_back(Pair("pingwait", stats.dPingWait));
        obj.push_back(Pair("version", stats.nVersion));
        // Use the sanitized form of subver here, to avoid tricksy remote peers from
        // corrupting or modifiying the JSON output by putting special characters in
        // their ver message.
        obj.push_back(Pair("subver", stats.cleanSubVer));
        obj.push_back(Pair("inbound", stats.fInbound));
        obj.push_back(Pair("startingheight", stats.nStartingHeight));
        if (fStateStats) {
            obj.push_back(Pair("banscore", statestats.nMisbehavior));
            obj.push_back(Pair("synced_headers", statestats.nSyncHeight));
            obj.push_back(Pair("synced_blocks", statestats.nCommonHeight));
            UniValue heights(UniValue::VARR);
            BOOST_FOREACH(int height, statestats.vHeightInFlight) {
                heights.push_back(height);
            }
            obj.push_back(Pair("inflight", heights));
        }
        obj.push_back(Pair("whitelisted", stats.fWhitelisted));

        ret.push_back(obj);
    }

    return ret;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

### 2.2. 获取每个对端的信息并返回

复制节点状态函数 `CopyNodeStats(vstats)` 定义在文件 `rpcnet.cpp` 中。

```cpp
static void CopyNodeStats(std::vector<CNodeStats>& vstats)
{
    vstats.clear();

    LOCK(cs_vNodes);
    vstats.reserve(vNodes.size()); // 预开辟空间
    BOOST_FOREACH(CNode* pnode, vNodes) { // 遍历已建立连接的节点列表
        CNodeStats stats;
        pnode->copyStats(stats); // 复制节点状态
        vstats.push_back(stats);
    }
}
```

复制节点状态函数 `pnode->copyStats(stats)` 定义在文件 `net.h` 中。

```cpp
#undef X
#define X(name) stats.name = name
void CNode::copyStats(CNodeStats &stats)
{
    stats.nodeid = this->GetId();
    X(nServices);
    X(fRelayTxes);
    X(nLastSend);
    X(nLastRecv);
    X(nTimeConnected);
    X(nTimeOffset);
    X(addrName);
    X(nVersion);
    X(cleanSubVer);
    X(fInbound);
    X(nStartingHeight);
    X(nSendBytes);
    X(nRecvBytes);
    X(fWhitelisted);

    // It is common for nodes with good ping times to suddenly become lagged,
    // due to a new block arriving or other large transfer.
    // Merely reporting pingtime might fool the caller into thinking the node was still responsive,
    // since pingtime does not update until the ping is complete, which might take a while.
    // So, if a ping is taking an unusually long time in flight,
    // the caller can immediately detect that this is happening.
    int64_t nPingUsecWait = 0;
    if ((0 != nPingNonceSent) && (0 != nPingUsecStart)) {
        nPingUsecWait = GetTimeMicros() - nPingUsecStart;
    }

    // Raw ping time is in microseconds, but show it to user as whole seconds (Bitcoin users should be well used to small numbers with many decimal places by now :)
    stats.dPingTime = (((double)nPingUsecTime) / 1e6);
    stats.dPingMin  = (((double)nMinPingUsecTime) / 1e6);
    stats.dPingWait = (((double)nPingUsecWait) / 1e6);

    // Leave string empty if addrLocal invalid (not filled in yet)
    stats.addrLocal = addrLocal.IsValid() ? addrLocal.ToString() : "";
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
