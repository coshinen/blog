---
layout: post
title:  "比特币 RPC 命令剖析 \"listtransactions\""
date:   2018-06-06 11:04:40 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
listtransactions ( "account" count form includeWatchonly ) # 列出跳过账户 `account` 的 `from` 笔交易的 `count` 笔交易
{% endhighlight %}

参数：<br>
1. `account` （字符串，可选，已过时）账户名。应该为 `"*"`，表示全部账户。<br>
2. `count` （数字型，可选，默认为 10）返回的交易数量。<br>
3. `form` （数字型，可选，默认为 0）跳过的交易数量。<br>
4. `includeWatchonly` （布尔型，可选，默认为 false）包含到 watchonly 地址集的交易（见 [`importaddress`]()）。

结果：<br>
{% highlight shell %}
[
  {
    "account":"accountname",       (string) DEPRECATED. The account name associated with the transaction. 
                                                It will be "" for the default account.
    "address":"bitcoinaddress",    (string) The bitcoin address of the transaction. Not present for 
                                                move transactions (category = move).
    "category":"send|receive|move", (string) The transaction category. 'move' is a local (off blockchain)
                                                transaction between accounts, and not associated with an address,
                                                transaction id or block. 'send' and 'receive' transactions are 
                                                associated with an address, transaction id and block details
    "amount": x.xxx,          (numeric) The amount in BTC. This is negative for the 'send' category, and for the
                                         'move' category for moves outbound. It is positive for the 'receive' category,
                                         and for the 'move' category for inbound funds.
    "vout": n,                (numeric) the vout value
    "fee": x.xxx,             (numeric) The amount of the fee in BTC. This is negative and only available for the 
                                         'send' category of transactions.
    "confirmations": n,       (numeric) The number of confirmations for the transaction. Available for 'send' and 
                                         'receive' category of transactions. Negative confirmations indicate the
                                         transation conflicts with the block chain
    "trusted": xxx            (bool) Whether we consider the outputs of this unconfirmed transaction safe to spend.
    "blockhash": "hashvalue", (string) The block hash containing the transaction. Available for 'send' and 'receive'
                                          category of transactions.
    "blockindex": n,          (numeric) The block index containing the transaction. Available for 'send' and 'receive'
                                          category of transactions.
    "blocktime": xxx,         (numeric) The block time in seconds since epoch (1 Jan 1970 GMT).
    "txid": "transactionid", (string) The transaction id. Available for 'send' and 'receive' category of transactions.
    "time": xxx,              (numeric) The transaction time in seconds since epoch (midnight Jan 1 1970 GMT).
    "timereceived": xxx,      (numeric) The time received in seconds since epoch (midnight Jan 1 1970 GMT). Available 
                                          for 'send' and 'receive' category of transactions.
    "comment": "...",       (string) If a comment is associated with the transaction.
    "label": "label"        (string) A comment for the address/transaction, if any
    "otheraccount": "accountname",  (string) For the 'move' category of transactions, the account the funds came 
                                          from (for receiving funds, positive amounts), or went to (for sending funds,
                                          negative amounts).
    "bip125-replaceable": "yes|no|unknown"  (string) Whether this transaction could be replaced due to BIP125 (replace-by-fee);
                                                     may be unknown for unconfirmed transactions not in the mempool
  }
]
{% endhighlight %}

## 用法示例

用法一：列出系统中最近 10 笔交易。

{% highlight shell %}
$ bitcoin-cli listtransactions
[
  {
    "account": "",
    "address": "1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk",
    "category": "receive",
    "amount": 0.10000000,
    "label": "",
    "vout": 0,
    "confirmations": 22533,
    "instantlock": false,
    "blockhash": "0001b44de8ab1ff792930b96d4b5d1a25f6fce27eb9a79a9c4b0c1d950f00ca9",
    "blockindex": 3,
    "blocktime": 1527561500,
    "txid": "b7a3a029e68e8a0a42a4ef55a4bb76a7aa6af4ec426134d72dd8d5023e7660e6",
    "walletconflicts": [
    ],
    "time": 1527561500,
    "timereceived": 1527561505,
    "bip125-replaceable": "no"
  }, 
  ...
  {
    "account": "",
    "address": "1kGyNU2HyC4NWqEbCFbWX2rpzvjWHMhqsZ",
    "category": "send",
    "amount": -1.00000000,
    "vout": 1,
    "fee": -0.00001702,
    "confirmations": 1030,
    "instantlock": false,
    "blockhash": "00002d88af0743d798c7976699ce208e2c4947995c4e2b578aa76a6081228d43",
    "blockindex": 1,
    "blocktime": 1528250135,
    "txid": "c4a531e7f0c0b4cef74b8848e45b0216e213fa7dff3235a6750b1b53caa0bfe8",
    "walletconflicts": [
    ],
    "time": 1528250106,
    "timereceived": 1528250106,
    "bip125-replaceable": "no",
    "abandoned": false
  }
]
{% endhighlight %}

用法二：列出第 100 笔后开始的 1 笔交易。

{% highlight shell %}
$ bitcoin-cli listtransactions "*" 1 100
[
  {
    "account": "",
    "address": "1kGyNU2HyC4NWqEbCFbWX2rpzvjWHMhqsZ",
    "category": "send",
    "amount": -1.00000000,
    "vout": 1,
    "fee": -0.00001702,
    "confirmations": 1030,
    "instantlock": false,
    "blockhash": "00002d88af0743d798c7976699ce208e2c4947995c4e2b578aa76a6081228d43",
    "blockindex": 1,
    "blocktime": 1528250135,
    "txid": "c4a531e7f0c0b4cef74b8848e45b0216e213fa7dff3235a6750b1b53caa0bfe8",
    "walletconflicts": [
    ],
    "time": 1528250106,
    "timereceived": 1528250106,
    "bip125-replaceable": "no",
    "abandoned": false
  }
]
{% endhighlight %}

## 源码剖析
`listtransactions` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue listtransactions(const UniValue& params, bool fHelp); // 列出最近的交易信息
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定参数并进行验证。<br>
5.创建数组类型的结果集，获取钱包中有序的交易列表，遍历该列表，获取交易信息，直到 nCount+nFrom 个。<br>
6.获取临时的结果集，并计算得到要返回结果区间的首尾迭代器。<br>
7.去除首尾多余的元素，并反转临时结果集。<br>
8.清空原结果集，把临时结果放入结果集并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#listtransactions)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
