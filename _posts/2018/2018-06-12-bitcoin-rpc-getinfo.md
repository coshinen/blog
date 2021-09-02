---
layout: post
title:  "比特币 RPC 命令「getinfo」"
date:   2018-06-12 21:40:02 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help getinfo
getinfo

返回一个包含各种状态信息的对象。

结果：
{
  "version": xxxxx,        （数字）服务器版本
  "protocolversion": xxxxx,（数字）协议版本
  "walletversion": xxxxx,  （数字）钱包版本
  "balance": xxxxxxx,      （数字）比特币钱包总余额
  "blocks": xxxxxx,        （数字）服务器上当前已处理的区块数目
  "timeoffset": xxxxx,     （数字）时间偏移量
  "connections": xxxxx,    （数字）连接数
  "proxy": "host:port",    （字符串，可选）服务器使用的代理
  "difficulty": xxxxxx,    （数字）当前的难度
  "testnet": true|false,   （布尔型）服务器是否在测试网
  "keypoololdest": xxxxxx, （数字）密钥池中最早预生成密钥的时间戳（从格里尼治时间开始以秒为单位）
  "keypoolsize": xxxx,     （数字）预生成新密钥的数量
  "unlocked_until": ttt,   （数字）从格里尼治时间开始以秒为单位（1970-01-01 00:00:00）的钱包解锁结束的时间戳，用于转账，若为 0 则表示钱包被锁定
  "paytxfee": x.xxxx,      （数字）以 BTC/kB 为单位的交易费
  "relayfee": x.xxxx,      （数字）以 BTC/kB 为单位的付费交易的最小中继费
  "errors": "..."          （字符串）任何错误信息
}

例子：
> bitcoin-cli getinfo
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`getinfo` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getinfo(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmisc.cpp` 中。

```cpp
/**
 * @note Do not add or change anything in the information returned by this
 * method. getinfo exists for backwards-compatibility only. It combines
 * information from wildly different sources in the program, which is a mess,
 * and is thus planned to be deprecated eventually.
 *
 * Based on the source of the information, new information should be added to:
 * - getblockchaininfo,
 * - getnetworkinfo or
 * - getwalletinfo
 *
 * Or alternatively, create a specific query method for the information.
 **/
UniValue getinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
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
        ); // 1. 帮助内容

#ifdef ENABLE_WALLET
    LOCK2(cs_main, pwalletMain ? &pwalletMain->cs_wallet : NULL);
#else
    LOCK(cs_main);
#endif

    proxyType proxy;
    GetProxy(NET_IPV4, proxy);

    UniValue obj(UniValue::VOBJ); // 2. 构建各种状态信息的对象并返回
    obj.push_back(Pair("version", CLIENT_VERSION)); // 客户端版本号
    obj.push_back(Pair("protocolversion", PROTOCOL_VERSION)); // 协议版本号
#ifdef ENABLE_WALLET
    if (pwalletMain) {
        obj.push_back(Pair("walletversion", pwalletMain->GetVersion())); // 钱包版本号
        obj.push_back(Pair("balance",       ValueFromAmount(pwalletMain->GetBalance()))); // 钱包可用余额
    }
#endif
    obj.push_back(Pair("blocks",        (int)chainActive.Height())); // 活跃链的高度
    obj.push_back(Pair("timeoffset",    GetTimeOffset())); // 时间偏移量
    obj.push_back(Pair("connections",   (int)vNodes.size())); // 已建立的连接数（出入）
    obj.push_back(Pair("proxy",         (proxy.IsValid() ? proxy.proxy.ToStringIPPort() : string()))); // 代理 IP 和端口
    obj.push_back(Pair("difficulty",    (double)GetDifficulty())); // 网络难度
    obj.push_back(Pair("testnet",       Params().TestnetToBeDeprecatedFieldRPC())); // 测试网弃用的字段 RPC
#ifdef ENABLE_WALLET
    if (pwalletMain) {
        obj.push_back(Pair("keypoololdest", pwalletMain->GetOldestKeyPoolTime())); // 最早密钥池时间
        obj.push_back(Pair("keypoolsize",   (int)pwalletMain->GetKeyPoolSize())); // 密钥池的大小
    }
    if (pwalletMain && pwalletMain->IsCrypted()) // 钱包是否被加密
        obj.push_back(Pair("unlocked_until", nWalletUnlockTime)); // 解锁结束的时间
    obj.push_back(Pair("paytxfee",      ValueFromAmount(payTxFee.GetFeePerK()))); // 交易费（每 KB）
#endif
    obj.push_back(Pair("relayfee",      ValueFromAmount(::minRelayTxFee.GetFeePerK()))); // 中继交易费（每 KB）
    obj.push_back(Pair("errors",        GetWarnings("statusbar"))); // 错误信息
    return obj;
}
```

不要添加或改变该方法返回的信息中的任何内容。
getinfo 的存在只是为了向后兼容。
它在程序中结合了来自不同源的信息，这是一个混乱，因此计划最终弃用。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmisc.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmisc.cpp){:target="_blank"}
