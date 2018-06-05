---
layout: post
title:  "比特币 RPC 命令剖析 \"getnetworkinfo\""
date:   2018-05-29 16:14:11 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getnetworkinfo # 获取一个包含 P2P 网络各种状态信息的对象
{% endhighlight %}

结果：<br>
{% highlight shell %}
{
  "version": xxxxx,                      (numeric) the server version
  "subversion": "/Satoshi:x.x.x/",     (string) the server subversion string
  "protocolversion": xxxxx,              (numeric) the protocol version
  "localservices": "xxxxxxxxxxxxxxxx", (string) the services we offer to the network
  "timeoffset": xxxxx,                   (numeric) the time offset
  "connections": xxxxx,                  (numeric) the number of connections
  "networks": [                          (array) information per network
  {
    "name": "xxx",                     (string) network (ipv4, ipv6 or onion)
    "limited": true|false,               (boolean) is the network limited using -onlynet?
    "reachable": true|false,             (boolean) is the network reachable?
    "proxy": "host:port"               (string) the proxy that is used for this network, or empty if none
  }
  ,...
  ],
  "relayfee": x.xxxxxxxx,                (numeric) minimum relay fee for non-free transactions in BTC/kB
  "localaddresses": [                    (array) list of local addresses
  {
    "address": "xxxx",                 (string) network address
    "port": xxx,                         (numeric) network port
    "score": xxx                         (numeric) relative score
  }
  ,...
  ]
  "warnings": "..."                    (string) any network warnings (such as alert messages) 
}
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli getnetworkinfo
{
  "version": 120100,
  "subversion": "/Satoshi:0.12.1/",
  "protocolversion": 70012,
  "localservices": "0000000000000005",
  "timeoffset": 0,
  "connections": 0,
  "networks": [
    {
      "name": "ipv4",
      "limited": false,
      "reachable": false,
      "proxy": "",
      "proxy_randomize_credentials": false
    }, 
    {
      "name": "ipv6",
      "limited": false,
      "reachable": false,
      "proxy": "",
      "proxy_randomize_credentials": false
    }, 
    {
      "name": "onion",
      "limited": false,
      "reachable": false,
      "proxy": "",
      "proxy_randomize_credentials": false
    }
  ],
  "relayfee": 0.00001000,
  "localaddresses": [
  ],
  "warnings": ""
}
{% endhighlight %}

## 源码剖析
`getnetworkinfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getnetworkinfo(const UniValue& params, bool fHelp); // 获取网络状态信息
{% endhighlight %}

实现在“rpcnet.cpp”文件中。

{% highlight C++ %}
UniValue getnetworkinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "getnetworkinfo\n"
            "Returns an object containing various state info regarding P2P networking.\n"
            "\nResult:\n"
            "{\n"
            "  \"version\": xxxxx,                      (numeric) the server version\n"
            "  \"subversion\": \"/Satoshi:x.x.x/\",     (string) the server subversion string\n"
            "  \"protocolversion\": xxxxx,              (numeric) the protocol version\n"
            "  \"localservices\": \"xxxxxxxxxxxxxxxx\", (string) the services we offer to the network\n"
            "  \"timeoffset\": xxxxx,                   (numeric) the time offset\n"
            "  \"connections\": xxxxx,                  (numeric) the number of connections\n"
            "  \"networks\": [                          (array) information per network\n"
            "  {\n"
            "    \"name\": \"xxx\",                     (string) network (ipv4, ipv6 or onion)\n"
            "    \"limited\": true|false,               (boolean) is the network limited using -onlynet?\n"
            "    \"reachable\": true|false,             (boolean) is the network reachable?\n"
            "    \"proxy\": \"host:port\"               (string) the proxy that is used for this network, or empty if none\n"
            "  }\n"
            "  ,...\n"
            "  ],\n"
            "  \"relayfee\": x.xxxxxxxx,                (numeric) minimum relay fee for non-free transactions in " + CURRENCY_UNIT + "/kB\n"
            "  \"localaddresses\": [                    (array) list of local addresses\n"
            "  {\n"
            "    \"address\": \"xxxx\",                 (string) network address\n"
            "    \"port\": xxx,                         (numeric) network port\n"
            "    \"score\": xxx                         (numeric) relative score\n"
            "  }\n"
            "  ,...\n"
            "  ]\n"
            "  \"warnings\": \"...\"                    (string) any network warnings (such as alert messages) \n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("getnetworkinfo", "")
            + HelpExampleRpc("getnetworkinfo", "")
        );

    LOCK(cs_main);

    UniValue obj(UniValue::VOBJ); // 创建一个对象类型的结果对象
    obj.push_back(Pair("version",       CLIENT_VERSION)); // 版本
    obj.push_back(Pair("subversion",    strSubVersion)); // 子版本
    obj.push_back(Pair("protocolversion",PROTOCOL_VERSION)); // 协议版本
    obj.push_back(Pair("localservices",       strprintf("%016x", nLocalServices))); // 本地服务
    obj.push_back(Pair("timeoffset",    GetTimeOffset()));
    obj.push_back(Pair("connections",   (int)vNodes.size())); // 连接数
    obj.push_back(Pair("networks",      GetNetworksInfo())); // 网络信息
    obj.push_back(Pair("relayfee",      ValueFromAmount(::minRelayTxFee.GetFeePerK())));
    UniValue localAddresses(UniValue::VARR); // 数组类型对象
    {
        LOCK(cs_mapLocalHost);
        BOOST_FOREACH(const PAIRTYPE(CNetAddr, LocalServiceInfo) &item, mapLocalHost)
        {
            UniValue rec(UniValue::VOBJ);
            rec.push_back(Pair("address", item.first.ToString())); // 地址
            rec.push_back(Pair("port", item.second.nPort)); // 端口
            rec.push_back(Pair("score", item.second.nScore));
            localAddresses.push_back(rec);
        }
    }
    obj.push_back(Pair("localaddresses", localAddresses)); // 本地地址
    obj.push_back(Pair("warnings",       GetWarnings("statusbar"))); // 警告
    return obj;
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.创建一个对象类型的结果，追加相关信息到该对象。

第三步，调用 GetNetworksInfo() 函数来获取网络信息，该函数实现在“rpcnet.cpp”文件中。

{% highlight C++ %}
static UniValue GetNetworksInfo()
{
    UniValue networks(UniValue::VARR);
    for(int n=0; n<NET_MAX; ++n)
    { // 遍历所有网络类型
        enum Network network = static_cast<enum Network>(n); // 强制类型转换为枚举 Network
        if(network == NET_UNROUTABLE) // != 0
            continue;
        proxyType proxy;
        UniValue obj(UniValue::VOBJ);
        GetProxy(network, proxy);
        obj.push_back(Pair("name", GetNetworkName(network))); // 网络名
        obj.push_back(Pair("limited", IsLimited(network))); // 是否受限
        obj.push_back(Pair("reachable", IsReachable(network))); // 是否可接入
        obj.push_back(Pair("proxy", proxy.IsValid() ? proxy.proxy.ToStringIPPort() : string())); // 代理
        obj.push_back(Pair("proxy_randomize_credentials", proxy.randomize_credentials)); // 代理随机化证书
        networks.push_back(obj);
    }
    return networks;
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getnetworkinfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
