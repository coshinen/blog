---
layout: post
title:  "比特币 RPC 命令剖析 \"getpeerinfo\""
date:   2018-05-29 15:21:20 +0800
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getpeerinfo # 获取关于每个连接的网络节点的 json 数组对象的数据
{% endhighlight %}

结果：<br>
{% highlight shell %}
[
  {
    "id": n,                   (numeric) Peer index
    "addr":"host:port",      (string) The ip address and port of the peer
    "addrlocal":"ip:port",   (string) local address
    "services":"xxxxxxxxxxxxxxxx",   (string) The services offered
    "relaytxes":true|false,    (boolean) Whether peer has asked us to relay transactions to it
    "lastsend": ttt,           (numeric) The time in seconds since epoch (Jan 1 1970 GMT) of the last send
    "lastrecv": ttt,           (numeric) The time in seconds since epoch (Jan 1 1970 GMT) of the last receive
    "bytessent": n,            (numeric) The total bytes sent
    "bytesrecv": n,            (numeric) The total bytes received
    "conntime": ttt,           (numeric) The connection time in seconds since epoch (Jan 1 1970 GMT)
    "timeoffset": ttt,         (numeric) The time offset in seconds
    "pingtime": n,             (numeric) ping time
    "minping": n,              (numeric) minimum observed ping time
    "pingwait": n,             (numeric) ping wait
    "version": v,              (numeric) The peer version, such as 7001
    "subver": "/Satoshi:0.8.5/",  (string) The string version
    "inbound": true|false,     (boolean) Inbound (true) or Outbound (false)
    "startingheight": n,       (numeric) The starting height (block) of the peer
    "banscore": n,             (numeric) The ban score
    "synced_headers": n,       (numeric) The last header we have in common with this peer
    "synced_blocks": n,        (numeric) The last block we have in common with this peer
    "inflight": [
       n,                        (numeric) The heights of blocks we're currently asking from this peer
       ...
    ]
  }
  ,...
]
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli getpeerinfo
[
  {
    "id": 9,
    "addr": "183.60.231.84",
    "addrlocal": "113.116.118.60:21312",
    "services": "0000000000000005",
    "relaytxes": true,
    "lastsend": 1527579016,
    "lastrecv": 1527579016,
    "bytessent": 2192,
    "bytesrecv": 6214,
    "conntime": 1527578935,
    "timeoffset": -4,
    "pingtime": 0.093315,
    "minping": 0.093315,
    "version": 70208,
    "subver": "/Foru Core:0.12.2.3/",
    "inbound": false,
    "startingheight": 42113,
    "banscore": 0,
    "synced_headers": 42128,
    "synced_blocks": 42128,
    "inflight": [
    ],
    "whitelisted": false,
    "bytessent_per_msg": {
      "getaddr": 24,
      "getdata": 976,
      "getheaders": 925,
      "headers": 25,
      "ping": 32,
      "pong": 32,
      "sendheaders": 24,
      "verack": 24,
      "version": 130
    },
    "bytesrecv_per_msg": {
      "addr": 55,
      "block": 3296,
      "getheaders": 925,
      "headers": 1696,
      "ping": 32,
      "pong": 32,
      "sendheaders": 24,
      "verack": 24,
      "version": 130
    }
  }
]
{% endhighlight %}

## 源码剖析
`getpeerinfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getpeerinfo(const UniValue& params, bool fHelp); // 获取同辈节点信息
{% endhighlight %}

实现在“rpcnet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.复制节点状态到局部节点状态列表对象 vstats。<br>
4.依次遍历该列表，追加节点相关信息。

第三步，调用 CopyNodeStats(vstats) 函数把已连接节点列表中节点的相关状态信息复制到 vstats。<br>
该函数定义在“rpcnet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

遍历已建立连接的节点列表，调用 pnode->copyStats(stats) 函数复制节点状态信息。<br>
该函数定义在“net.h”文件中。

{% highlight C++ %}
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
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getpeerinfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
