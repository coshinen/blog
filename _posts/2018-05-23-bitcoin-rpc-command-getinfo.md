---
layout: post
title:  "比特币 RPC 命令剖析 \"getinfo\""
date:   2018-05-23 11:40:02 +0800
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 用法示例

{% highlight shell %}
$ bitcoin-cli getinfo
{
  "version": 120100,
  "protocolversion": 70012,
  "walletversion": 60000,
  "balance": 0.00000000,
  "blocks": 0,
  "timeoffset": 0,
  "connections": 0,
  "proxy": "",
  "difficulty": 1,
  "testnet": false,
  "keypoololdest": 1526979070,
  "keypoolsize": 101,
  "paytxfee": 0.00000000,
  "relayfee": 0.00001000,
  "errors": ""
}
{% endhighlight %}

## 源码剖析
`getinfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getinfo(const UniValue& params, bool fHelp); // 获取信息
{% endhighlight %}

实现在“rpcmisc.cpp”文件中。

{% highlight C++ %}
/**
 * @note Do not add or change anything in the information returned by this
 * method. `getinfo` exists for backwards-compatibility only. It combines
 * information from wildly different sources in the program, which is a mess,
 * and is thus planned to be deprecated eventually.
 *
 * Based on the source of the information, new information should be added to:
 * - `getblockchaininfo`,
 * - `getnetworkinfo` or
 * - `getwalletinfo`
 *
 * Or alternatively, create a specific query method for the information.
 **/ // 在该信息通过此方式返回时不添加或改变任何东西
UniValue getinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 该方法没有参数
        throw runtime_error( // 帮助信息反馈
            "getinfo\n"
            "Returns an object containing various state info.\n"
            "\nResult:\n"
            "{\n"
            "  \"version\": xxxxx,           (numeric) the server version\n"
            "  \"protocolversion\": xxxxx,   (numeric) the protocol version\n"
            "  \"walletversion\": xxxxx,     (numeric) the wallet version\n"
            "  \"balance\": xxxxxxx,         (numeric) the total bitcoin balance of the wallet\n"
            "  \"blocks\": xxxxxx,           (numeric) the current number of blocks processed in the server\n"
            "  \"timeoffset\": xxxxx,        (numeric) the time offset\n"
            "  \"connections\": xxxxx,       (numeric) the number of connections\n"
            "  \"proxy\": \"host:port\",     (string, optional) the proxy used by the server\n"
            "  \"difficulty\": xxxxxx,       (numeric) the current difficulty\n"
            "  \"testnet\": true|false,      (boolean) if the server is using testnet or not\n"
            "  \"keypoololdest\": xxxxxx,    (numeric) the timestamp (seconds since GMT epoch) of the oldest pre-generated key in the key pool\n"
            "  \"keypoolsize\": xxxx,        (numeric) how many new keys are pre-generated\n"
            "  \"unlocked_until\": ttt,      (numeric) the timestamp in seconds since epoch (midnight Jan 1 1970 GMT) that the wallet is unlocked for transfers, or 0 if the wallet is locked\n"
            "  \"paytxfee\": x.xxxx,         (numeric) the transaction fee set in " + CURRENCY_UNIT + "/kB\n"
            "  \"relayfee\": x.xxxx,         (numeric) minimum relay fee for non-free transactions in " + CURRENCY_UNIT + "/kB\n"
            "  \"errors\": \"...\"           (string) any error messages\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("getinfo", "")
            + HelpExampleRpc("getinfo", "")
        );

#ifdef ENABLE_WALLET // 开启钱包功能
    LOCK2(cs_main, pwalletMain ? &pwalletMain->cs_wallet : NULL); // 钱包上锁
#else
    LOCK(cs_main);
#endif

    proxyType proxy;
    GetProxy(NET_IPV4, proxy);

    UniValue obj(UniValue::VOBJ); // 创建 VOBJ 类型对象
    obj.push_back(Pair("version", CLIENT_VERSION)); // 追加客户端版本号
    obj.push_back(Pair("protocolversion", PROTOCOL_VERSION)); // 协议版本号
#ifdef ENABLE_WALLET // 若开启钱包功能
    if (pwalletMain) {
        obj.push_back(Pair("walletversion", pwalletMain->GetVersion())); // 钱包版本号
        obj.push_back(Pair("balance",       ValueFromAmount(pwalletMain->GetBalance()))); // 钱包可用余额
    }
#endif
    obj.push_back(Pair("blocks",        (int)chainActive.Height())); // 激活的链高度（总区块数，不算创世区块）
    obj.push_back(Pair("timeoffset",    GetTimeOffset())); // 时间偏移
    obj.push_back(Pair("connections",   (int)vNodes.size())); // 已建立的连接数（连入、连出）
    obj.push_back(Pair("proxy",         (proxy.IsValid() ? proxy.proxy.ToStringIPPort() : string()))); // 代理 IP 和端口
    obj.push_back(Pair("difficulty",    (double)GetDifficulty())); // 挖矿难度
    obj.push_back(Pair("testnet",       Params().TestnetToBeDeprecatedFieldRPC())); // 是否为测试网
#ifdef ENABLE_WALLET
    if (pwalletMain) {
        obj.push_back(Pair("keypoololdest", pwalletMain->GetOldestKeyPoolTime())); // 密钥池中最早密钥的创建时间
        obj.push_back(Pair("keypoolsize",   (int)pwalletMain->GetKeyPoolSize())); // 密钥池的大小，比默认大小多 1
    }
    if (pwalletMain && pwalletMain->IsCrypted()) // 钱包是否被用户加密
        obj.push_back(Pair("unlocked_until", nWalletUnlockTime)); // 解锁结束的时间，0 表示未解锁
    obj.push_back(Pair("paytxfee",      ValueFromAmount(payTxFee.GetFeePerK()))); // 交易费（每 KB）
#endif
    obj.push_back(Pair("relayfee",      ValueFromAmount(::minRelayTxFee.GetFeePerK()))); // 中继费（每 KB）
    obj.push_back(Pair("errors",        GetWarnings("statusbar"))); // 错误信息
    return obj;
}
{% endhighlight %}

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getinfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
