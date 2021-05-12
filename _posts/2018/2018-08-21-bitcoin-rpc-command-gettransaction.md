---
layout: post
title:  "比特币 RPC 命令剖析 \"gettransaction\""
date:   2018-08-21 20:41:59 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli gettransaction "txid" ( includeWatchonly )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help gettransaction
gettransaction "txid" ( includeWatchonly )

获取关于钱包内交易 <txid> 的详细信息

参数：
1. "txid"          （字符串，必备）交易索引
2. includeWatchonly（布尔型，可选，默认为 false）在余额计算和 details[] 中是否包含 watchonly 地址

结果：
{
  "amount" : x.xxx,        （数字）以 BTC 为单位的交易金额
  "confirmations" : n,     （数字）确认数
  "blockhash" : "hash",    （字符串）区块哈希
  "blockindex" : xx,       （数字）区块索引
  "blocktime" : ttt,       （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的区块时间
  "txid" : "transactionid",（字符串）交易索引
  "time" : ttt,            （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易时间
  "timereceived" : ttt,    （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的收到交易时间
  "bip125-replaceable": "yes|no|unknown"（字符串）该交易是否由于 BIP125 （通过交易费替换）被替换；
                                                  可能不知道未确认的交易不在内存池中
  "details" : [
    {
      "account" : "accountname",   （字符串）已过时。包含在交易中的账户名，对于默认账户可以为 ""
      "address" : "bitcoinaddress",（字符串）包含在交易中的比特币地址
      "category" : "send|receive", （字符串）类别，'send' 或 'receive'
      "amount" : x.xxx,            （数字）以 BTC 为单位的金额
      "label" : "label",           （字符串）一条地址/交易的评论，如果存在
      "vout" : n,                  （数字）输出序号
    }
    ,...
  ],
  "hex" : "data"                   （字符串）交易原始数据
}

例子：
> bitcoin-cli gettransaction "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"
> bitcoin-cli gettransaction "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d" true
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettransaction", "params": ["1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`gettransaction` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue gettransaction(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue gettransaction(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
            "gettransaction \"txid\" ( includeWatchonly )\n"
            "\nGet detailed information about in-wallet transaction <txid>\n"
            "\nArguments:\n"
            "1. \"txid\"    (string, required) The transaction id\n"
            "2. \"includeWatchonly\"    (bool, optional, default=false) Whether to include watchonly addresses in balance calculation and details[]\n"
            "\nResult:\n"
            "{\n"
            "  \"amount\" : x.xxx,        (numeric) The transaction amount in " + CURRENCY_UNIT + "\n"
            "  \"confirmations\" : n,     (numeric) The number of confirmations\n"
            "  \"blockhash\" : \"hash\",  (string) The block hash\n"
            "  \"blockindex\" : xx,       (numeric) The block index\n"
            "  \"blocktime\" : ttt,       (numeric) The time in seconds since epoch (1 Jan 1970 GMT)\n"
            "  \"txid\" : \"transactionid\",   (string) The transaction id.\n"
            "  \"time\" : ttt,            (numeric) The transaction time in seconds since epoch (1 Jan 1970 GMT)\n"
            "  \"timereceived\" : ttt,    (numeric) The time received in seconds since epoch (1 Jan 1970 GMT)\n"
            "  \"bip125-replaceable\": \"yes|no|unknown\"  (string) Whether this transaction could be replaced due to BIP125 (replace-by-fee);\n"
            "                                                   may be unknown for unconfirmed transactions not in the mempool\n"
            "  \"details\" : [\n"
            "    {\n"
            "      \"account\" : \"accountname\",  (string) DEPRECATED. The account name involved in the transaction, can be \"\" for the default account.\n"
            "      \"address\" : \"bitcoinaddress\",   (string) The bitcoin address involved in the transaction\n"
            "      \"category\" : \"send|receive\",    (string) The category, either 'send' or 'receive'\n"
            "      \"amount\" : x.xxx,                 (numeric) The amount in " + CURRENCY_UNIT + "\n"
            "      \"label\" : \"label\",              (string) A comment for the address/transaction, if any\n"
            "      \"vout\" : n,                       (numeric) the vout value\n"
            "    }\n"
            "    ,...\n"
            "  ],\n"
            "  \"hex\" : \"data\"         (string) Raw data for transaction\n"
            "}\n"

            "\nExamples:\n"
            + HelpExampleCli("gettransaction", "\"1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d\"")
            + HelpExampleCli("gettransaction", "\"1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d\" true")
            + HelpExampleRpc("gettransaction", "\"1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d\"")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    uint256 hash;
    hash.SetHex(params[0].get_str());

    isminefilter filter = ISMINE_SPENDABLE;
    if(params.size() > 1)
        if(params[1].get_bool())
            filter = filter | ISMINE_WATCH_ONLY; // 设置 watch-only 选项

    UniValue entry(UniValue::VOBJ); // 3. 获取交易信息
    if (!pwalletMain->mapWallet.count(hash)) // 验证钱包中是否存在该交易
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid or non-wallet transaction id");
    const CWalletTx& wtx = pwalletMain->mapWallet[hash]; // 获取索引对应的钱包交易

    CAmount nCredit = wtx.GetCredit(filter); // 贷款金额
    CAmount nDebit = wtx.GetDebit(filter); // 借出金额
    CAmount nNet = nCredit - nDebit; // 净赚
    CAmount nFee = (wtx.IsFromMe(filter) ? wtx.GetValueOut() - nDebit : 0); // 交易费

    entry.push_back(Pair("amount", ValueFromAmount(nNet - nFee))); // 余额
    if (wtx.IsFromMe(filter)) // 如果该交易属于自己（发送）
        entry.push_back(Pair("fee", ValueFromAmount(nFee))); // 余额

    WalletTxToJSON(wtx, entry); // 钱包交易转换为 JSON 格式

    UniValue details(UniValue::VARR);
    ListTransactions(wtx, "*", 0, false, details, filter); // 获取交易细节
    entry.push_back(Pair("details", details)); // 加入细节信息

    string strHex = EncodeHexTx(static_cast<CTransaction>(wtx)); // 对钱包交易进行 16 进制编码
    entry.push_back(Pair("hex", strHex)); // 交易的 16 进制编码形式（非交易索引）

    return entry;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.3. 获取交易信息

函数 `WalletTxToJSON(wtx, entry)` 定义在文件 `wallet/rpcwallet.cpp` 中。

```cpp
void WalletTxToJSON(const CWalletTx& wtx, UniValue& entry)
{
    int confirms = wtx.GetDepthInMainChain();
    entry.push_back(Pair("confirmations", confirms)); // 确认数
    if (wtx.IsCoinBase())
        entry.push_back(Pair("generated", true)); // 为创币交易
    if (confirms > 0) // 已上链
    {
        entry.push_back(Pair("blockhash", wtx.hashBlock.GetHex())); // 区块哈希
        entry.push_back(Pair("blockindex", wtx.nIndex)); // 交易索引
        entry.push_back(Pair("blocktime", mapBlockIndex[wtx.hashBlock]->GetBlockTime())); // 区块创建时间
    } else { // 还在内存池中（未上链）
        entry.push_back(Pair("trusted", wtx.IsTrusted())); // 该交易可信
    }
    uint256 hash = wtx.GetHash();
    entry.push_back(Pair("txid", hash.GetHex())); // 交易索引
    UniValue conflicts(UniValue::VARR);
    BOOST_FOREACH(const uint256& conflict, wtx.GetConflicts())
        conflicts.push_back(conflict.GetHex());
    entry.push_back(Pair("walletconflicts", conflicts)); // 钱包冲突
    entry.push_back(Pair("time", wtx.GetTxTime())); // 交易发起时间
    entry.push_back(Pair("timereceived", (int64_t)wtx.nTimeReceived)); // 交易接收时间

    // Add opt-in RBF status // 添加选择性的 RBF 状态
    std::string rbfStatus = "no";
    if (confirms <= 0) {
        LOCK(mempool.cs);
        if (!mempool.exists(hash)) {
            if (SignalsOptInRBF(wtx)) {
                rbfStatus = "yes";
            } else {
                rbfStatus = "unknown";
            }
        } else if (IsRBFOptIn(*mempool.mapTx.find(hash), mempool)) {
            rbfStatus = "yes";
        }
    }
    entry.push_back(Pair("bip125-replaceable", rbfStatus));

    BOOST_FOREACH(const PAIRTYPE(string,string)& item, wtx.mapValue)
        entry.push_back(Pair(item.first, item.second));
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
