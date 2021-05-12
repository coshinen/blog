---
layout: post
title:  "比特币 RPC 命令剖析 \"listaccounts\""
date:   2018-08-31 20:29:08 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli listaccounts ( minconf includeWatchonly )
---
## 1. 帮助内容

```shell
listaccounts ( minconf includeWatchonly )

已过时。返回以账户名为关键字，账户余额为值的对象。

参数：
1. minconf         （数字，可选，默认为 1）只包含至少有这么多次确认的交易
2. includeWatchonly（布尔型，可选，默认为 false）包含 watchonly 地址上的余额（见 'importaddress'）

结果：
{                  （键为账户名，值为数字型余额的 json 对象）
  "account": x.xxx,（数字）属性名为账户名，值为该账户的总余额。
  ...
}

例子：

列出至少 1 次确认的账户余额
> bitcoin-cli listaccounts

列出包含未确认交易的账户余额
> bitcoin-cli listaccounts 0

列出 6 次或更多次确认的账户余额
> bitcoin-cli listaccounts 6

作为 json rpc 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listaccounts", "params": [6] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`listaccounts` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue listaccounts(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue listaccounts(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 2)
        throw runtime_error(
            "listaccounts ( minconf includeWatchonly)\n"
            "\nDEPRECATED. Returns Object that has account names as keys, account balances as values.\n"
            "\nArguments:\n"
            "1. minconf          (numeric, optional, default=1) Only include transactions with at least this many confirmations\n"
            "2. includeWatchonly (bool, optional, default=false) Include balances in watchonly addresses (see 'importaddress')\n"
            "\nResult:\n"
            "{                      (json object where keys are account names, and values are numeric balances\n"
            "  \"account\": x.xxx,  (numeric) The property name is the account name, and the value is the total balance for the account.\n"
            "  ...\n"
            "}\n"
            "\nExamples:\n"
            "\nList account balances where there at least 1 confirmation\n"
            + HelpExampleCli("listaccounts", "") +
            "\nList account balances including zero confirmation transactions\n"
            + HelpExampleCli("listaccounts", "0") +
            "\nList account balances for 6 or more confirmations\n"
            + HelpExampleCli("listaccounts", "6") +
            "\nAs json rpc call\n"
            + HelpExampleRpc("listaccounts", "6")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    int nMinDepth = 1;
    if (params.size() > 0)
        nMinDepth = params[0].get_int();
    isminefilter includeWatchonly = ISMINE_SPENDABLE;
    if(params.size() > 1)
        if(params[1].get_bool())
            includeWatchonly = includeWatchonly | ISMINE_WATCH_ONLY;

    map<string, CAmount> mapAccountBalances; // 账户余额映射列表
    BOOST_FOREACH(const PAIRTYPE(CTxDestination, CAddressBookData)& entry, pwalletMain->mapAddressBook) { // 遍历地址簿
        if (IsMine(*pwalletMain, entry.first) & includeWatchonly) // This address belongs to me // 该地址属于我
            mapAccountBalances[entry.second.name] = 0; // 加入账户余额映射列表，并初始化余额为 0
    }

    for (map<uint256, CWalletTx>::iterator it = pwalletMain->mapWallet.begin(); it != pwalletMain->mapWallet.end(); ++it)
    { // 遍历钱包交易索引列表
        const CWalletTx& wtx = (*it).second; // 获取钱包交易
        CAmount nFee; // 交易费
        string strSentAccount; // 发送账户名
        list<COutputEntry> listReceived; // 接收列表
        list<COutputEntry> listSent; // 发送列表
        int nDepth = wtx.GetDepthInMainChain(); // 获取该交易的深度
        if (wtx.GetBlocksToMaturity() > 0 || nDepth < 0) // 未成熟 或 未上链（深度小于 0）
            continue; // 跳过
        wtx.GetAmounts(listReceived, listSent, nFee, strSentAccount, includeWatchonly); // 获取相关金额
        mapAccountBalances[strSentAccount] -= nFee; // 账户余额减去交易费
        BOOST_FOREACH(const COutputEntry& s, listSent) // 遍历发送列表
            mapAccountBalances[strSentAccount] -= s.amount; // 账户余额减去发送的金额
        if (nDepth >= nMinDepth) // 交易深度大于等于最小深度
        {
            BOOST_FOREACH(const COutputEntry& r, listReceived) // 遍历接收列表
                if (pwalletMain->mapAddressBook.count(r.destination)) // 若目标地址存在于地址簿中
                    mapAccountBalances[pwalletMain->mapAddressBook[r.destination].name] += r.amount; // 对应账户余额加上接收金额
                else
                    mapAccountBalances[""] += r.amount; // 否则默认账户余额加上该接收金额
        }
    }

    const list<CAccountingEntry> & acentries = pwalletMain->laccentries; // 获取账户条目列表
    BOOST_FOREACH(const CAccountingEntry& entry, acentries) // 遍历该列表
        mapAccountBalances[entry.strAccount] += entry.nCreditDebit; // 信用借记

    UniValue ret(UniValue::VOBJ); // 创建对象类型结果
    BOOST_FOREACH(const PAIRTYPE(string, CAmount)& accountBalance, mapAccountBalances) { // 遍历账户余额映射列表
        ret.push_back(Pair(accountBalance.first, ValueFromAmount(accountBalance.second))); // 账户名和余额配对加入结果集
    }
    return ret;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
