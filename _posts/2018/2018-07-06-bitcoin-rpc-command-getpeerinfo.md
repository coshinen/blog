---
layout: post
title:  "比特币 RPC 命令剖析 \"getpeerinfo\""
date:   2018-07-06 15:21:20 +0800
author: mistydew
comments: true
categories: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getpeerinfo
---
## 提示说明

```shell
getpeerinfo # 获取关于每个连接的网络节点的数据的 json 数组对象
```

结果：<br>
```shell
[
  {
    "id": n,                   （数字）对端索引
    "addr":"host:port",      （字符串）对端的 ip 地址和端口号
    "addrlocal":"ip:port",   （字符串）本地地址
    "services":"xxxxxxxxxxxxxxxx",   （字符串）提供的服务
    "relaytxes":true|false,    （布尔型）对端是否要求我们中继交易给它
    "lastsend": ttt,           （数字）从格林尼治时间 1970-01-01 00:00:00 开始以秒为单位的最后发送时间
    "lastrecv": ttt,           （数字）从格林尼治时间 1970-01-01 00:00:00 开始以秒为单位的最后接收时间
    "bytessent": n,            （数字）发送的总字节
    "bytesrecv": n,            （数字）接收的总字节
    "conntime": ttt,           （数字）以秒为单位的连接时间（从格林尼治时间 1970-01-01 00:00:00 开始）
    "timeoffset": ttt,         （数字）以秒为单位的时间偏移量
    "pingtime": n,             （数字）ping 时间
    "minping": n,              （数字）观测到的最短 ping 时间
    "pingwait": n,             （数字）ping 等待时间
    "version": v,              （数字）对端版本，例如 7001
    "subver": "/Satoshi:0.8.5/",  （字符串）字符串版本
    "inbound": true|false,     （布尔型）true 为连入，false 为连出
    "startingheight": n,       （数字）对端起始的区块高度
    "banscore": n,             （数字）禁止分数
    "synced_headers": n,       （数字）我们与对端共同的最后一个区块头
    "synced_blocks": n,        （数字）我们与对端共同的最后一个区块
    "inflight": [
       n,                        （数字）我们当前从对端请求的区块高度
       ...
    ]
  }
  ,...
]
```

## 用法示例

### 比特币核心客户端

获取连接的对端的信息。

```shell
$ bitcoin-cli getpeerinfo
[
  {
    "id": 2,
    "addr": "192.168.0.2",
    "addrlocal": "192.168.0.6:61196",
    "services": "0000000000000005",
    "relaytxes": true,
    "lastsend": 1529995706,
    "lastrecv": 1529995706,
    "bytessent": 468894,
    "bytesrecv": 492077,
    "conntime": 1529984676,
    "timeoffset": -16,
    "pingtime": 0.015573,
    "minping": 0.00713,
    "version": 70012,
    "subver": "/Satoshi:0.12.1/",
    "inbound": false,
    "startingheight": 29256,
    "banscore": 0,
    "synced_headers": 31796,
    "synced_blocks": 31796,
    "inflight": [
    ],
    "whitelisted": false
  }
]
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getpeerinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":[{"id":1,"addr":"192.168.0.2:8333","addrlocal":"192.168.0.6:61196","services":"0000000000000005","relaytxes":true,"lastsend":1529998204,"lastrecv":1529998204,"bytessent":1804,"bytesrecv":3780,"conntime":1529998140,"timeoffset":-16,"pingtime":0.012278,"minping":0.012278,"version":70012,"subver":"/Satoshi:0.12.1/","inbound":false,"startingheight":32318,"banscore":0,"synced_headers":32326,"synced_blocks":32326,"inflight":[],"whitelisted":false}],"error":null,"id":"curltest"}
```

## 源码剖析
getpeerinfo 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getpeerinfo(const UniValue& params, bool fHelp); // 获取同辈节点信息
```

实现在“rpcnet.cpp”文件中。

```cpp
UniValue getpeerinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令参数反馈
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
        );

    LOCK(cs_main);

    vector<CNodeStats> vstats; // 节点状态列表
    CopyNodeStats(vstats); // 复制节点状态到 vstats

    UniValue ret(UniValue::VARR); // 创建数组类型的结果对象

    BOOST_FOREACH(const CNodeStats& stats, vstats) { // 遍历节点状态列表
        UniValue obj(UniValue::VOBJ);
        CNodeStateStats statestats;
        bool fStateStats = GetNodeStateStats(stats.nodeid, statestats);
        obj.push_back(Pair("id", stats.nodeid)); // 节点 id
        obj.push_back(Pair("addr", stats.addrName)); // 节点地址
        if (!(stats.addrLocal.empty()))
            obj.push_back(Pair("addrlocal", stats.addrLocal)); // 本地地址
        obj.push_back(Pair("services", strprintf("%016x", stats.nServices)));
        obj.push_back(Pair("relaytxes", stats.fRelayTxes));
        obj.push_back(Pair("lastsend", stats.nLastSend));
        obj.push_back(Pair("lastrecv", stats.nLastRecv));
        obj.push_back(Pair("bytessent", stats.nSendBytes));
        obj.push_back(Pair("bytesrecv", stats.nRecvBytes));
        obj.push_back(Pair("conntime", stats.nTimeConnected)); // 建立连接的时间
        obj.push_back(Pair("timeoffset", stats.nTimeOffset));
        obj.push_back(Pair("pingtime", stats.dPingTime)); // ping 时间
        obj.push_back(Pair("minping", stats.dPingMin)); // 最小 ping 时间
        if (stats.dPingWait > 0.0)
            obj.push_back(Pair("pingwait", stats.dPingWait)); // ping 等待时间
        obj.push_back(Pair("version", stats.nVersion)); // 版本号
        // Use the sanitized form of subver here, to avoid tricksy remote peers from
        // corrupting or modifiying the JSON output by putting special characters in
        // their ver message.
        obj.push_back(Pair("subver", stats.cleanSubVer));
        obj.push_back(Pair("inbound", stats.fInbound));
        obj.push_back(Pair("startingheight", stats.nStartingHeight));
        if (fStateStats) {
            obj.push_back(Pair("banscore", statestats.nMisbehavior));
            obj.push_back(Pair("synced_headers", statestats.nSyncHeight)); // 已同步的区块头数
            obj.push_back(Pair("synced_blocks", statestats.nCommonHeight)); // 已同步的区块数
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

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.复制节点状态到局部节点状态列表对象 vstats。<br>
4.依次遍历该列表，追加节点相关信息。

第三步，调用 CopyNodeStats(vstats) 函数把已连接节点列表中节点的相关状态信息复制到 vstats。<br>
该函数定义在“rpcnet.cpp”文件中。

```cpp
static void CopyNodeStats(std::vector<CNodeStats>& vstats)
{
    vstats.clear(); // 清空

    LOCK(cs_vNodes); // 上锁
    vstats.reserve(vNodes.size()); // 与开辟空间，防止自动扩容
    BOOST_FOREACH(CNode* pnode, vNodes) { // 遍历以建立连接的节点列表
        CNodeStats stats;
        pnode->copyStats(stats); // 获取节点状态到 stats
        vstats.push_back(stats); // 加入状态列表
    }
}
```

遍历已建立连接的节点列表，调用 pnode->copyStats(stats) 函数复制节点状态信息。<br>
该函数定义在“net.h”文件中。

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

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getpeerinfo){:target="_blank"}
