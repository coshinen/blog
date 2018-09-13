---
layout: post
title:  "比特币 RPC 命令剖析 \"gettransaction\""
date:   2018-06-07 16:41:59 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli gettransaction "txid" ( includeWatchonly )
---
## 提示说明

{% highlight shell %}
gettransaction "txid" ( includeWatchonly ) # 获取关于钱包内交易 txid 的详细信息
{% endhighlight %}

参数：<br>
1. txid （字符串，必备）交易索引。<br>
2. includeWatchonly （布尔型，可选，默认为 false）在余额计算和 details[] 是否包含 watchonly 地址。

结果：<br>
{% highlight shell %}
{
  "amount" : x.xxx,        （数字）以 BTC 为单位的交易金额
  "confirmations" : n,     （数字）确认数
  "blockhash" : "hash",  （字符串）区块哈希
  "blockindex" : xx,       （数字）区块索引
  "blocktime" : ttt,       （数字）从格林尼治时间 1970-01-01 00:00:00 开始以秒为单位的区块创建时间
  "txid" : "transactionid",   （字符串）交易索引
  "time" : ttt,            （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易时间
  "timereceived" : ttt,    （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的接收交易时间
  "bip125-replaceable": "yes|no|unknown"  （字符串）该交易是否因 BIP125 （替换交易费）被替换；
                                                   不在内存池中未确认的交易可能是未知
  "details" : [
    {
      "account" : "accountname",  （字符串，已过时）包含在交易中的账户名，对于默认账户可以为 ""
      "address" : "bitcoinaddress",   （字符串）包含在交易中的比特币地址
      "category" : "send|receive",    （字符串）类别，'send' 或 'receive'
      "amount" : x.xxx,                 （数字）以 BTC 为单位的金额
      "label" : "label",              （字符串）地址/交易的评论，如果有的话
      "vout" : n,                       （数字）输出序号
    }
    ,...
  ],
  "hex" : "data"         （字符串）交易原始数据
}
{% endhighlight %}

## 用法示例

### 比特币核心客户端

用法一：获取指定交易的详细信息。<br>
先使用 [listtransactions](/2018/06/06/bitcoin-rpc-command-listtransactions) 获取钱包交易。

{% highlight shell %}
$ bitcoin-cli listtransactions
[
  ...
  {
    "account": "",
    "address": "1PQyGCTohHc7y3MvKjLWk7NZQGyL9Wd6je",
    "category": "send",
    "amount": -100.00000000,
    "vout": 1,
    "fee": -0.00009080,
    "confirmations": 961,
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
$ bitcoin-cli gettransaction 705493d021973fd635c9e24880de70c4b002ba3cbd066783d23bce316fe00a29
{
  "amount": -100.00000000,
  "fee": -0.00009080,
  "confirmations": 1046,
  "blockhash": "0000037a1b06a77e7fc0c8812e6e3200b137b4415fb8bcd1c603aa3dbc9c62b1",
  "blockindex": 1,
  "blocktime": 1530158339,
  "txid": "705493d021973fd635c9e24880de70c4b002ba3cbd066783d23bce316fe00a29",
  "walletconflicts": [
  ],
  "time": 1530158343,
  "timereceived": 1530158343,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1PQyGCTohHc7y3MvKjLWk7NZQGyL9Wd6je",
      "category": "send",
      "amount": -100.00000000,
      "vout": 1,
      "fee": -0.00009080,
      "abandoned": false
    }
  ],
  "hex": "0100000002b03499f612ae5dbea794c5bcddddfb852544b9d9d457f1f84a94fa3002318b0f000000006b483045022100d48191b7f76da6e834c44b83328712ba9b7b7c54c6791331d2452e22d68e59ce022063c656e21e208712cf50ce66085d12e2ed4852dea52f5d4e18aef96932cb212d01210331fcac9ec8ba6114af93b70ea597ee3b7b1ca0fe8c8a2c9109b94e69e25216b5feffffffb03499f612ae5dbea794c5bcddddfb852544b9d9d457f1f84a94fa3002318b0f010000006b483045022100f7a9ded4489a74c771adeddf09a8e23b44d2dd4dd9eeb76626a6a3419f35565c022058478e76ae77ccda4afd3b0e46e77939729c5f12237604697103f7cdc8f1560a012103f32793907cbd21775461028c9b9d0a0947b953d28e500d24b03bf001fbd5dcf6feffffff02dcf91500000000001976a91489cb30247007174e3eb0a33cfcad743494bc9f6a88ac00e40b54020000001976a914f5db4caea89179c63d8870ee2d0ad1d5ebf1235a88ac25880000"
}
{% endhighlight %}

用法二：获取包含 watch-only 地址交易的详细信息。

暂无。

{% highlight shell %}
$ bitcoin-cli gettransaction "txid" true
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettransaction", "params": ["705493d021973fd635c9e24880de70c4b002ba3cbd066783d23bce316fe00a29"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"amount":-100.00000000,"fee":-0.00009080,"confirmations":1128,"blockhash":"0000037a1b06a77e7fc0c8812e6e3200b137b4415fb8bcd1c603aa3dbc9c62b1","blockindex":1,"blocktime":1530158339,"txid":"705493d021973fd635c9e24880de70c4b002ba3cbd066783d23bce316fe00a29","walletconflicts":[],"time":1530158343,"timereceived":1530158343,"bip125-replaceable":"no","details":[{"account":"","address":"1PQyGCTohHc7y3MvKjLWk7NZQGyL9Wd6je","category":"send","amount":-100.00000000,"vout":1,"fee":-0.00009080,"abandoned":false}],"hex":"0100000002b03499f612ae5dbea794c5bcddddfb852544b9d9d457f1f84a94fa3002318b0f000000006b483045022100d48191b7f76da6e834c44b83328712ba9b7b7c54c6791331d2452e22d68e59ce022063c656e21e208712cf50ce66085d12e2ed4852dea52f5d4e18aef96932cb212d01210331fcac9ec8ba6114af93b70ea597ee3b7b1ca0fe8c8a2c9109b94e69e25216b5feffffffb03499f612ae5dbea794c5bcddddfb852544b9d9d457f1f84a94fa3002318b0f010000006b483045022100f7a9ded4489a74c771adeddf09a8e23b44d2dd4dd9eeb76626a6a3419f35565c022058478e76ae77ccda4afd3b0e46e77939729c5f12237604697103f7cdc8f1560a012103f32793907cbd21775461028c9b9d0a0947b953d28e500d24b03bf001fbd5dcf6feffffff02dcf91500000000001976a91489cb30247007174e3eb0a33cfcad743494bc9f6a88ac00e40b54020000001976a914f5db4caea89179c63d8870ee2d0ad1d5ebf1235a88ac25880000"},"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
gettransaction 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue gettransaction(const UniValue& params, bool fHelp); // 获取交易详细信息
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue gettransaction(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数为 1 或 2 个
        throw runtime_error( // 命令帮助反馈
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
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    uint256 hash;
    hash.SetHex(params[0].get_str()); // 获取交易哈希

    isminefilter filter = ISMINE_SPENDABLE;
    if(params.size() > 1)
        if(params[1].get_bool())
            filter = filter | ISMINE_WATCH_ONLY; // 设置 watch-only 选项

    UniValue entry(UniValue::VOBJ);
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

    return entry; // 返回结果对象
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取相关参数：交易索引和 watch-only 设置。<br>
5.验证钱包中是否含指定交易，并获取该交易。<br>
6.计算余额及其他相关信息加入结果集并返回。

第六步，调用 WalletTxToJSON(wtx, entry) 函数把钱包交易信息转换为 JSON 格式并加入结果集 entry，
该函数定义在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#gettransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
