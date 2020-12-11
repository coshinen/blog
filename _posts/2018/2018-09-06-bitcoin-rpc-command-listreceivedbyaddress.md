---
layout: post
title:  "比特币 RPC 命令剖析 \"listreceivedbyaddress\""
date:   2018-09-06 20:23:32 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli listreceivedbyaddress ( minconf includeempty includeWatchonly )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help listreceivedbyaddress
listreceivedbyaddress ( minconf includeempty includeWatchonly )

列出接收地址的余额。

参数：
1. minconf         （数字，可选，默认为 1）包含支付前的最小确认数。
2. includeempty    （布尔型，可选，默认为 false）是否包含未收到任何付款的地址。
3. includeWatchonly（布尔型，可选，默认为 false）是否包含 watchonly 地址（见 'importaddress'）。

结果：
[
  {
    "involvesWatchonly" : true,    （布尔型）如果被导入的地址包含在交易中则只返回此项
    "address" : "receivingaddress",（字符串）接收地址
    "account" : "accountname",     （字符串）已过时。接收地址的帐户名。默认帐户是 ""。
    "amount" : x.xxx,              （数字）通过该地址接收的以 BTC 为单位的总金额
    "confirmations" : n,           （数字）包含最多最近交易的确认数
    "label" : "label"              （字符串）一条地址/交易的备注，如果存在
  }
  ,...
]

例子：
> bitcoin-cli listreceivedbyaddress
> bitcoin-cli listreceivedbyaddress 6 true
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listreceivedbyaddress", "params": [6, true, true] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`listreceivedbyaddress` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue listreceivedbyaddress(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue listreceivedbyaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 3)
        throw runtime_error(
            "listreceivedbyaddress ( minconf includeempty includeWatchonly)\n"
            "\nList balances by receiving address.\n"
            "\nArguments:\n"
            "1. minconf       (numeric, optional, default=1) The minimum number of confirmations before payments are included.\n"
            "2. includeempty  (numeric, optional, default=false) Whether to include addresses that haven't received any payments.\n"
            "3. includeWatchonly (bool, optional, default=false) Whether to include watchonly addresses (see 'importaddress').\n"

            "\nResult:\n"
            "[\n"
            "  {\n"
            "    \"involvesWatchonly\" : true,        (bool) Only returned if imported addresses were involved in transaction\n"
            "    \"address\" : \"receivingaddress\",  (string) The receiving address\n"
            "    \"account\" : \"accountname\",       (string) DEPRECATED. The account of the receiving address. The default account is \"\".\n"
            "    \"amount\" : x.xxx,                  (numeric) The total amount in " + CURRENCY_UNIT + " received by the address\n"
            "    \"confirmations\" : n,               (numeric) The number of confirmations of the most recent transaction included\n"
            "    \"label\" : \"label\"                (string) A comment for the address/transaction, if any\n"
            "  }\n"
            "  ,...\n"
            "]\n"

            "\nExamples:\n"
            + HelpExampleCli("listreceivedbyaddress", "")
            + HelpExampleCli("listreceivedbyaddress", "6 true")
            + HelpExampleRpc("listreceivedbyaddress", "6, true, true")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    return ListReceived(params, false); // 3. 获取接收金额列表
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.3. 获取接收金额列表

参考 [比特币 RPC 命令剖析 "listreceivedbyaccount" 2.3. 列出账户余额](/blog/2018/09/bitcoin-rpc-command-listreceivedbyaccount.html#23-列出账户余额)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
