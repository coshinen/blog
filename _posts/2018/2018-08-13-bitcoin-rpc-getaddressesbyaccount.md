---
layout: post
title:  "比特币 RPC 命令「getaddressesbyaccount」"
date:   2018-08-13 21:07:06 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help getaddressesbyaccount
getaddressesbyaccount "account"

已过时。返回给定账户的地址列表。

参数：
1. "account"（字符串，必备）账户名。

结果：
[                 （字符串的 json 数组）
  "bitcoinaddress"（字符串）一个关联给定账户的比特币地址
  ,...
]

例子：
> bitcoin-cli getaddressesbyaccount "tabby"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddressesbyaccount", "params": ["tabby"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`getaddressesbyaccount` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getaddressesbyaccount(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue getaddressesbyaccount(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "getaddressesbyaccount \"account\"\n"
            "\nDEPRECATED. Returns the list of addresses for the given account.\n"
            "\nArguments:\n"
            "1. \"account\"  (string, required) The account name.\n"
            "\nResult:\n"
            "[                     (json array of string)\n"
            "  \"bitcoinaddress\"  (string) a bitcoin address associated with the given account\n"
            "  ,...\n"
            "]\n"
            "\nExamples:\n"
            + HelpExampleCli("getaddressesbyaccount", "\"tabby\"")
            + HelpExampleRpc("getaddressesbyaccount", "\"tabby\"")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    string strAccount = AccountFromValue(params[0]);

    // Find all addresses that have the given account
    UniValue ret(UniValue::VARR); // 3. 找到给定帐户的所有地址
    BOOST_FOREACH(const PAIRTYPE(CBitcoinAddress, CAddressBookData)& item, pwalletMain->mapAddressBook)
    {
        const CBitcoinAddress& address = item.first;
        const string& strName = item.second.name;
        if (strName == strAccount)
            ret.push_back(address.ToString());
    }
    return ret;
}
```

### 1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#1-确保钱包可用)。

### 2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
