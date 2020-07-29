---
layout: post
title:  "比特币 RPC 命令剖析 \"listtransactions\""
date:   2018-09-10 11:04:40 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli listtransactions ( "account" count form includeWatchonly )
---
## 提示说明

```shell
listtransactions ( "account" count form includeWatchonly ) # 列出跳过账户 account 的 from 笔交易的最近 count 笔交易
```

参数：
1. account（字符串，可选，已过时）账户名。应该为 "*"，表示全部账户。
2. count（数字，可选，默认为 10）返回的交易数量。
3. form（数字，可选，默认为 0）跳过的交易数量。
4. includeWatchonly（布尔型，可选，默认为 false）包含到 watchonly 地址集的交易（见 [importaddress](/blog/2018/08/bitcoin-rpc-command-importaddress.html)）。

结果：
```shell
[
  {
    "account":"accountname",       （字符串，已过时）交易关联的帐户名。默认账户为 ""
    "address":"bitcoinaddress",    （字符串）交易的比特币地址。不存在 'move' 交易（类别为 move）
    "category":"send|receive|move", （字符串）交易类别。'move' 是一笔本地（非区块链上）帐户之间的交易，且不关联地址、交易索引或区块。
                                                'send' 和 'receive' 交易关联地址、交易索引和区块信息
    "amount": x.xxx,          （数字）以 BTC 为单位的金额。对于 'send' 类别该值为负数，且对于 'move' 类别是移出。
                                         对于 'receive' 类别该值为正数，且对于 'move' 类别移入资金。
    "vout": n,                （数字）输出序号
    "fee": x.xxx,             （数字）以 BTC 为单位的交易费。对于 'send' 类别的交易该值为负数。
    "confirmations": n,       （数字）交易的确认数。适用于 'send' 和 'receive' 类别的交易。负的确认数表明交易和区块链冲突
    "trusted": xxx            （布尔型）我们是否认为未确认的交易输出可安全花费。
    "blockhash": "hashvalue", （字符串）包含该交易的区块哈希。适用于 'send' 和 'receive' 类别的交易。
    "blockindex": n,          （数字）包含该交易的区块索引。适用于 'send' 和 'receive' 类别的交易。
    "blocktime": xxx,         （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的区块时间
    "txid": "transactionid", （字符串）交易索引。适用于 'send' 和 'receive' 类别的交易。
    "time": xxx,              （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易时间。
    "timereceived": xxx,      （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易接收时间。适用于 'send' 和 'receive' 类别的交易。
    "comment": "...",       （字符串）交易关联的备注。
    "label": "label"        （字符串）地址/交易的备注，如果有的话
    "otheraccount": "accountname",  （字符串）对于 'move' 类别的交易，资金来源帐户（对于接收的资金，正的金额），或目的帐户（对于发送的资金，负的金额）。
    "bip125-replaceable": "yes|no|unknown"  （字符串）该交易是否因 BIP125 （替换交易费）被替换；不在交易内存池中的未确认交易可能是 'unknown'
  }
]
```

## 用法示例

### 比特币核心客户端

用法一：列出系统中最近 10 笔交易。

```shell
$ bitcoin-cli listtransactions
[
  {
    "account": "",
    "address": "1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV",
    "category": "receive",
    "amount": 0.01000000,
    "label": "",
    "vout": 0,
    "confirmations": 4845,
    "blockhash": "000000de9c98ecf1bf6390391b950d36d86aa30a19a7484c0d9048ebfe121dc9",
    "blockindex": 1,
    "blocktime": 1530091755,
    "txid": "921483cfa069c91804fc95b3bfb949948fc0c8456d07da2731194728d2ca7bde",
    "walletconflicts": [
    ],
    "time": 1530091754,
    "timereceived": 1530091754,
    "bip125-replaceable": "no"
  }, 
  ...
  {
    "account": "",
    "address": "1PQyGCTohHc7y3MvKjLWk7NZQGyL9Wd6je",
    "category": "send",
    "amount": -100.00000000,
    "vout": 1,
    "fee": -0.00009080,
    "confirmations": 3180,
    "blockhash": "0000037a1b06a77e7fc0c8812e6e3200b137b4415fb8bcd1c603aa3dbc9c62b1",
    "blockindex": 1,
    "blocktime": 1530158339,
    "txid": "705493d021973fd635c9e24880de70c4b002ba3cbd066783d23bce316fe00a29",
    "walletconflicts": [
    ],
    "time": 1530158343,
    "timereceived": 1530158343,
    "bip125-replaceable": "no",
    "abandoned": false
  }
]
```

用法二：列出从第 100 笔后开始的 1 笔交易。

```shell
$ bitcoin-cli listtransactions "*" 1 100
[
  {
    "account": "",
    "address": "1Z99Lsij11ajDEhipZbnifdFkBu8fC1Hb",
    "category": "generate",
    "amount": 50.00000000,
    "vout": 0,
    "confirmations": 5912,
    "generated": true,
    "blockhash": "000000fd07cd03d25f2530ade4601d672398bc8ba09efc9a11a4ce580591d4b0",
    "blockindex": 0,
    "blocktime": 1529997362,
    "txid": "16c289710835cbb1b376f56b30f4514f7c6cf9d60003cfec70d30249e4faa494",
    "walletconflicts": [
    ],
    "time": 1529997362,
    "timereceived": 1529997362,
    "bip125-replaceable": "no"
  }
]
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listtransactions", "params": ["*", 1, 100] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":[{"account":"","address":"1Z99Lsij11ajDEhipZbnifdFkBu8fC1Hb","category":"generate","amount":50.00000000,"vout":0,"confirmations":5922,"generated":true,"blockhash":"000000fd07cd03d25f2530ade4601d672398bc8ba09efc9a11a4ce580591d4b0","blockindex":0,"blocktime":1529997362,"txid":"16c289710835cbb1b376f56b30f4514f7c6cf9d60003cfec70d30249e4faa494","walletconflicts":[],"time":1529997362,"timereceived":1529997362,"bip125-replaceable":"no"}],"error":null,"id":"curltest"}
```

## 源码剖析

listtransactions 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue listtransactions(const UniValue& params, bool fHelp); // 列出最近的交易信息
```

实现在“wallet/rpcwallet.cpp”文件中。

```cpp
UniValue listtransactions(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 4) // 参数最多为 4 个
        throw runtime_error( // 命令帮助反馈
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

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    string strAccount = "*"; // 账户名，默认为 "*" 表示全部账户
    if (params.size() > 0)
        strAccount = params[0].get_str(); // 获取帐户名
    int nCount = 10; // 交易数，默认 10 条
    if (params.size() > 1)
        nCount = params[1].get_int(); // 获取交易数
    int nFrom = 0; // 要跳过的交易数，默认 0 条
    if (params.size() > 2)
        nFrom = params[2].get_int(); // 获取要跳过的交易数
    isminefilter filter = ISMINE_SPENDABLE;
    if(params.size() > 3)
        if(params[3].get_bool())
            filter = filter | ISMINE_WATCH_ONLY; // 设置 watchonly

    if (nCount < 0) // 交易数非负
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Negative count");
    if (nFrom < 0) // 要跳过的交易数非负
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Negative from");

    UniValue ret(UniValue::VARR); // 创建数组类型的结果集

    const CWallet::TxItems & txOrdered = pwalletMain->wtxOrdered; // 获取有序的交易列表

    // iterate backwards until we have nCount items to return: // 向后迭代，直到我们有 nCount 个条目返回
    for (CWallet::TxItems::const_reverse_iterator it = txOrdered.rbegin(); it != txOrdered.rend(); ++it)
    { // 遍历有序的交易列表
        CWalletTx *const pwtx = (*it).second.first; // 获取钱包交易
        if (pwtx != 0)
            ListTransactions(*pwtx, strAccount, 0, true, ret, filter); // 获取交易信息到结果集
        CAccountingEntry *const pacentry = (*it).second.second; // 获取对应的账户条目
        if (pacentry != 0)
            AcentryToJSON(*pacentry, strAccount, ret); // 账户条目转换为 JSON 格式

        if ((int)ret.size() >= (nCount+nFrom)) break; // 若结果集大小大于等于 要获取的交易数量与要跳过交易数量的和，跳出
    }
    // ret is newest to oldest // 结果集是从最新到最旧

    if (nFrom > (int)ret.size()) // 结果集大小小于要跳过的交易数
        nFrom = ret.size(); // 要跳过的交易数等于结果集大小
    if ((nFrom + nCount) > (int)ret.size())
        nCount = ret.size() - nFrom;

    vector<UniValue> arrTmp = ret.getValues(); // 获取结果集中的数组作为临时对象

    vector<UniValue>::iterator first = arrTmp.begin();
    std::advance(first, nFrom); // 增加 first 迭代器 nFrom
    vector<UniValue>::iterator last = arrTmp.begin();
    std::advance(last, nFrom+nCount); // 增加 last 迭代器 nFrom+nCount

    if (last != arrTmp.end()) arrTmp.erase(last, arrTmp.end()); // 擦除尾部多余部分
    if (first != arrTmp.begin()) arrTmp.erase(arrTmp.begin(), first); // 擦除头部多余部分

    std::reverse(arrTmp.begin(), arrTmp.end()); // Return oldest to newest // 反转后为最老到最新，列表从上到下：旧->新

    ret.clear(); // 清空结果集
    ret.setArray(); // 设置为数组类型
    ret.push_backV(arrTmp); // 加入临时数组

    return ret; // 返回结果集
}
```

基本流程：
1. 确保钱包当前可用（已初始化完成）。
2. 处理命令帮助和参数个数。
3. 钱包上锁。
4. 获取指定参数并进行验证。
5. 创建数组类型的结果集，获取钱包中有序的交易列表，遍历该列表，获取交易信息，直到 nCount+nFrom 个。
6. 获取临时的结果集，并计算得到要返回结果区间的首尾迭代器。
7. 去除首尾多余的元素，并反转临时结果集。
8. 清空原结果集，把临时结果放入结果集并返回。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
