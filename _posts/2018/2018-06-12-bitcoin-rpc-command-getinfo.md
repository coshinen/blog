---
layout: post
title:  "比特币 RPC 命令剖析 \"getinfo\""
date:   2018-06-12 11:40:02 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getinfo
---
## 提示说明

```shell
getinfo # 获取比特币核心信息
```

结果：返回一个包含变量状态信息的对象。<br>
```shell
{
  "version": xxxxx,           （数字）服务器版本
  "protocolversion": xxxxx,   （数字）协议版本
  "walletversion": xxxxx,     （数字）钱包版本
  "balance": xxxxxxx,         （数字）比特币钱包总余额
  "blocks": xxxxxx,           （数字）服务器上当前已处理的区块数
  "timeoffset": xxxxx,        （数字）时间偏移
  "connections": xxxxx,       （数字）连接数
  "proxy": "host:port",     （字符串，可选）服务器使用的代理
  "difficulty": xxxxxx,       （数字）当前的挖矿难度
  "testnet": true|false,      （布尔型）服务器适用测试网或非测试网
  "keypoololdest": xxxxxx,    （数字）密钥池中预先生成的最早的密钥时间戳（从格里尼治时间开始以秒为单位）
  "keypoolsize": xxxx,        （数字）预生成新密钥的数量
  "unlocked_until": ttt,      （数字）从格里尼治时间开始以秒为单位的钱包解锁结束的时间戳，用于转账，若为 0 表示钱包被锁定，若未出现该字段，说明此时钱包未加密上锁
  "paytxfee": x.xxxx,         （数字）以 BTC/kB 为单位的交易费
  "relayfee": x.xxxx,         （数字）对于不免费交易的最小中继费，以 BTC/kB 为单位
  "errors": "..."           （字符串）任何错误信息
}
```

## 用法示例

### 比特币核心客户端

获取当前比特币核心服务器基本信息。

```shell
$ bitcoin-cli getinfo
{
  "version": 120100,
  "protocolversion": 70012,
  "walletversion": 60000,
  "balance": 97.99992320,
  "blocks": 25738,
  "timeoffset": 0,
  "connections": 1,
  "proxy": "",
  "difficulty": 0.001532956637923291,
  "testnet": false,
  "keypoololdest": 1529572814,
  "keypoolsize": 101,
  "paytxfee": 0.00000000,
  "relayfee": 0.00001000,
  "errors": ""
}
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"version":120100,"protocolversion":70012,"walletversion":60000,"balance":97.99992320,"blocks":25759,"timeoffset":0,"connections":1,"proxy":"","difficulty":0.001532956637923291,"testnet":false,"keypoololdest":1529572814,"keypoolsize":101,"paytxfee":0.00000000,"relayfee":0.00001000,"errors":""},"error":null,"id":"curltest"}
```

## 源码剖析
getinfo 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getinfo(const UniValue& params, bool fHelp); // 获取比特币核心信息
```

实现在“rpcmisc.cpp”文件中。

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
 **/ // 在该信息通过此方式返回时不添加或改变任何东西
UniValue getinfo(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 1.该方法没有参数
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
    LOCK2(cs_main, pwalletMain ? &pwalletMain->cs_wallet : NULL); // 2.钱包上锁
#else
    LOCK(cs_main);
#endif

    proxyType proxy;
    GetProxy(NET_IPV4, proxy);

    UniValue obj(UniValue::VOBJ); // 3.创建 VOBJ 类型对象
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
```

基本流程：
1. 处理命令帮助和参数个数。
2. 上锁，避免并发。
3. 相关信息的追加。

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getinfo){:target="_blank"}
