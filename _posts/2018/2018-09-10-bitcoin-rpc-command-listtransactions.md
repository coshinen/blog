---
layout: post
title:  "比特币 RPC 命令剖析 \"listtransactions\""
date:   2018-09-10 21:04:40 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli listtransactions ( "account" count form includeWatchonly )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help listtransactions
listtransactions ( "account" count form includeWatchonly )

返回跳过账户 'account' 的前 'from' 笔交易的最近 'count' 笔交易。

参数：
1. "account"       （字符串，可选）已过时。该账户名。应该为 "*"。
2. count           （数字，可选，默认为 10）返回交易的数量
3. form            （数字，可选，默认为 0）跳过交易的数量
4. includeWatchonly（布尔型，可选，默认为 false）包含 watchonly 地址集的交易（见 'importaddress'）

结果：
[
  {
    "account":"accountname",       （字符串）已过时。该交易关联的帐户名。默认账户为 ""。
    "address":"bitcoinaddress",    （字符串）该交易的比特币地址。不代表移动交易（类别 = move）。
    "category":"send|receive|move",（字符串）交易类别。'move' 是一笔账户间的本地（非区块链上）的交易，且不关联地址、交易索引或区块。
                                             'send' 和 'receive' 交易关联一个地址、交易索引和区块信息
    "amount": x.xxx,               （数字）以 BTC 为单位的金额。对于 'send' 类别为负，且对于 'move' 类别为移出。
                                           对于 'receive' 类别为正，且对于 'move' 类别为移入资金。
    "vout": n,                     （数字）输出序号
    "fee": x.xxx,                  （数字）以 BTC 为单位的交易费。对于 'send' 类别的交易为负。
    "confirmations": n,            （数字）该交易的确认数。适用于 'send' 和 'receive' 类别的交易。负确认数表明交易和区块链冲突
    "trusted": xxx                 （布尔型）我们是否考虑未确认的交易输出可安全花费。
    "blockhash": "hashvalue",      （字符串）包含该交易的区块哈希。适用于 'send' 和 'receive' 类别的交易。
    "blockindex": n,               （数字）包含该交易的区块索引。适用于 'send' 和 'receive' 类别的交易。
    "blocktime": xxx,              （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的区块时间。
    "txid": "transactionid",       （字符串）交易索引。适用于 'send' 和 'receive' 类别的交易。
    "time": xxx,                   （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易时间。
    "timereceived": xxx,           （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易接收时间。适用于 'send' 和 'receive' 类别的交易。
    "comment": "...",              （字符串）该交易关联的一条备注。
    "label": "label"               （字符串）该地址/交易的一条备注，如果存在
    "otheraccount": "accountname", （字符串）对于 'move' 类别的交易，资金来源帐户（对于接收资金，正的金额），或目标帐户（对于发送资金，负的金额）。
    "bip125-replaceable": "yes|no|unknown"（字符串）这笔交易是否因 BIP125 （由交易费替换）被替换；不在交易内存池中的未确认交易可能是未知的
  }
]

例子：

列出系统中最近 10 笔交易
> bitcoin-cli listtransactions

列出从第 100 笔到第 120 笔交易
> bitcoin-cli listtransactions "*" 20 100

作为一个 json rpc 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listtransactions", "params": ["*", 20, 100] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`listtransactions` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue listtransactions(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue listtransactions(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 4)
        throw runtime_error(
            "listtransactions ( \"account\" count from includeWatchonly)\n"
            "\nReturns up to 'count' most recent transactions skipping the first 'from' transactions for account 'account'.\n"
            "\nArguments:\n"
            "1. \"account\"    (string, optional) DEPRECATED. The account name. Should be \"*\".\n"
            "2. count          (numeric, optional, default=10) The number of transactions to return\n"
            "3. from           (numeric, optional, default=0) The number of transactions to skip\n"
            "4. includeWatchonly (bool, optional, default=false) Include transactions to watchonly addresses (see 'importaddress')\n"
            "\nResult:\n"
            "[\n"
            "  {\n"
            "    \"account\":\"accountname\",       (string) DEPRECATED. The account name associated with the transaction. \n"
            "                                                It will be \"\" for the default account.\n"
            "    \"address\":\"bitcoinaddress\",    (string) The bitcoin address of the transaction. Not present for \n"
            "                                                move transactions (category = move).\n"
            "    \"category\":\"send|receive|move\", (string) The transaction category. 'move' is a local (off blockchain)\n"
            "                                                transaction between accounts, and not associated with an address,\n"
            "                                                transaction id or block. 'send' and 'receive' transactions are \n"
            "                                                associated with an address, transaction id and block details\n"
            "    \"amount\": x.xxx,          (numeric) The amount in " + CURRENCY_UNIT + ". This is negative for the 'send' category, and for the\n"
            "                                         'move' category for moves outbound. It is positive for the 'receive' category,\n"
            "                                         and for the 'move' category for inbound funds.\n"
            "    \"vout\": n,                (numeric) the vout value\n"
            "    \"fee\": x.xxx,             (numeric) The amount of the fee in " + CURRENCY_UNIT + ". This is negative and only available for the \n"
            "                                         'send' category of transactions.\n"
            "    \"confirmations\": n,       (numeric) The number of confirmations for the transaction. Available for 'send' and \n"
            "                                         'receive' category of transactions. Negative confirmations indicate the\n"
            "                                         transation conflicts with the block chain\n"
            "    \"trusted\": xxx            (bool) Whether we consider the outputs of this unconfirmed transaction safe to spend.\n"
            "    \"blockhash\": \"hashvalue\", (string) The block hash containing the transaction. Available for 'send' and 'receive'\n"
            "                                          category of transactions.\n"
            "    \"blockindex\": n,          (numeric) The block index containing the transaction. Available for 'send' and 'receive'\n"
            "                                          category of transactions.\n"
            "    \"blocktime\": xxx,         (numeric) The block time in seconds since epoch (1 Jan 1970 GMT).\n"
            "    \"txid\": \"transactionid\", (string) The transaction id. Available for 'send' and 'receive' category of transactions.\n"
            "    \"time\": xxx,              (numeric) The transaction time in seconds since epoch (midnight Jan 1 1970 GMT).\n"
            "    \"timereceived\": xxx,      (numeric) The time received in seconds since epoch (midnight Jan 1 1970 GMT). Available \n"
            "                                          for 'send' and 'receive' category of transactions.\n"
            "    \"comment\": \"...\",       (string) If a comment is associated with the transaction.\n"
            "    \"label\": \"label\"        (string) A comment for the address/transaction, if any\n"
            "    \"otheraccount\": \"accountname\",  (string) For the 'move' category of transactions, the account the funds came \n"
            "                                          from (for receiving funds, positive amounts), or went to (for sending funds,\n"
            "                                          negative amounts).\n"
            "    \"bip125-replaceable\": \"yes|no|unknown\"  (string) Whether this transaction could be replaced due to BIP125 (replace-by-fee);\n"
            "                                                     may be unknown for unconfirmed transactions not in the mempool\n"
            "  }\n"
            "]\n"

            "\nExamples:\n"
            "\nList the most recent 10 transactions in the systems\n"
            + HelpExampleCli("listtransactions", "") +
            "\nList transactions 100 to 120\n"
            + HelpExampleCli("listtransactions", "\"*\" 20 100") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("listtransactions", "\"*\", 20, 100")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet);

    string strAccount = "*";
    if (params.size() > 0)
        strAccount = params[0].get_str();
    int nCount = 10;
    if (params.size() > 1)
        nCount = params[1].get_int();
    int nFrom = 0;
    if (params.size() > 2)
        nFrom = params[2].get_int();
    isminefilter filter = ISMINE_SPENDABLE;
    if(params.size() > 3)
        if(params[3].get_bool())
            filter = filter | ISMINE_WATCH_ONLY;

    if (nCount < 0)
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Negative count");
    if (nFrom < 0)
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Negative from");

    UniValue ret(UniValue::VARR);

    const CWallet::TxItems & txOrdered = pwalletMain->wtxOrdered;

    // iterate backwards until we have nCount items to return:
    for (CWallet::TxItems::const_reverse_iterator it = txOrdered.rbegin(); it != txOrdered.rend(); ++it)
    { // 向后迭代直到我们有 nCount 个条目返回：
        CWalletTx *const pwtx = (*it).second.first;
        if (pwtx != 0)
            ListTransactions(*pwtx, strAccount, 0, true, ret, filter); // 3. 列出交易
        CAccountingEntry *const pacentry = (*it).second.second;
        if (pacentry != 0)
            AcentryToJSON(*pacentry, strAccount, ret);

        if ((int)ret.size() >= (nCount+nFrom)) break;
    }
    // ret is newest to oldest
    // 结果集是从最新到最旧
    if (nFrom > (int)ret.size())
        nFrom = ret.size();
    if ((nFrom + nCount) > (int)ret.size())
        nCount = ret.size() - nFrom;

    vector<UniValue> arrTmp = ret.getValues();

    vector<UniValue>::iterator first = arrTmp.begin();
    std::advance(first, nFrom);
    vector<UniValue>::iterator last = arrTmp.begin();
    std::advance(last, nFrom+nCount);

    if (last != arrTmp.end()) arrTmp.erase(last, arrTmp.end());
    if (first != arrTmp.begin()) arrTmp.erase(arrTmp.begin(), first);

    std::reverse(arrTmp.begin(), arrTmp.end()); // Return oldest to newest
    // 返回最旧到最新
    ret.clear();
    ret.setArray();
    ret.push_backV(arrTmp);

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
