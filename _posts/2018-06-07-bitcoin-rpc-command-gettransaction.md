---
layout: post
title:  "比特币 RPC 命令剖析 \"gettransaction\""
date:   2018-06-07 16:41:59 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
gettransaction "txid" ( includeWatchonly ) # 获取关于钱包内交易 `txid` 的详细信息
{% endhighlight %}

参数：<br>
1. `txid` （字符串，必备）交易索引。<br>
2. `includeWatchonly` （布尔型，可选，默认为 false）在余额计算和 `details[]` 是否包含 watchonly 地址。

结果：<br>
{% highlight shell %}
{
  "amount" : x.xxx,        (numeric) The transaction amount in BTC
  "confirmations" : n,     (numeric) The number of confirmations
  "blockhash" : "hash",  (string) The block hash
  "blockindex" : xx,       (numeric) The block index
  "blocktime" : ttt,       (numeric) The time in seconds since epoch (1 Jan 1970 GMT)
  "txid" : "transactionid",   (string) The transaction id.
  "time" : ttt,            (numeric) The transaction time in seconds since epoch (1 Jan 1970 GMT)
  "timereceived" : ttt,    (numeric) The time received in seconds since epoch (1 Jan 1970 GMT)
  "bip125-replaceable": "yes|no|unknown"  (string) Whether this transaction could be replaced due to BIP125 (replace-by-fee);
                                                   may be unknown for unconfirmed transactions not in the mempool
  "details" : [
    {
      "account" : "accountname",  (string) DEPRECATED. The account name involved in the transaction, can be "" for the default account.
      "address" : "bitcoinaddress",   (string) The bitcoin address involved in the transaction
      "category" : "send|receive",    (string) The category, either 'send' or 'receive'
      "amount" : x.xxx,                 (numeric) The amount in BTC
      "label" : "label",              (string) A comment for the address/transaction, if any
      "vout" : n,                       (numeric) the vout value
    }
    ,...
  ],
  "hex" : "data"         (string) Raw data for transaction
}
{% endhighlight %}

## 用法示例

用法一：获取指定交易的详细信息。

{% highlight shell %}
$ bitcoin-cli gettransaction c4a531e7f0c0b4cef74b8848e45b0216e213fa7dff3235a6750b1b53caa0bfe8
{
  "amount": -1.00000000,
  "fee": -0.00001702,
  "confirmations": 9379,
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
  "details": [
    {
      "account": "",
      "address": "1kGyNU2HyC4NWqEbCFbWX2rpzvjWHMhqsZ",
      "category": "send",
      "amount": -1.00000000,
      "vout": 1,
      "fee": -0.00001702,
      "abandoned": false
    }
  ],
  "hex": "010000000bb5542b850da29c18eaf4fd1cfe7b3cfb6e0576fda2d0e1b65f890dded6edd806000000006b483045022100bf70d703ca5cb3a3ba448027749576594e1c903d456a7a32e2f3c41a0833ec4802204c6852975494cf1c0fc27b037be85b298ab9212540883f217a5f17ba94053fd0012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffffd6b7e5e543ff5e6bcee5683d6b24011f55decbe6661d10b81677bf8baa3b1a52000000006a47304402201782061b9bdf8a4318c3e89506d698b084ce4d594b107fd0f4243f062caec672022067dd38f16bf67ec8856be1f2b55bb0d71605767e94006882a4c0883ee378bb58012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff0517347f6f66f10b07fae1f85043b61cf05cc2b680e4167a54c3aecb4d1df957000000006a47304402204ba70355a91c51c9dbb04b4e426df85c241e97f915915573404b4d046083543d02202e3fd3dc38d5c794e199d6b380791a9429102beaf3c047135649db2b2f071810012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff4a82e13178d62bb2bb6002e547d484aefcaaacc86d97094dc6b549f3a37e505b000000006b4830450221008fa92d273d58bb795e543c24e8a91b40574c1f38f7185c95fbaab6969a2ab09c02207be76315d738c7ec0ac28abaf7ab17ece9f88d784a339a0dbe0f191a3feb0552012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff553ac8e5af49a04b473d80806d2e8d08512e474a5812204851884866002caa74000000006b483045022100fdfc8ed8438ed4de8f319151166203c82cbe4e6cd408f99cfc2d07250e44a50b022011197855e8cfc72e10c4e9984303dda48354f109b7becb83081dc7496109eaa5012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0fefffffff0c54223b243c014105481121097e70fdfc1cd6d059a67fbaa3d70e43b001b94000000006a473044022016fa1810a3c2ec68c7e7d0af14dc7cad27f57ba28105bf09e7605f6d5db2d3fb02207674ca72e5fbf490e78c2ccf88545c68bb64d7154d8478855ccdf033d0021e7c012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffffbde9ba2988148ac2294de827433e699108e15279f149f2645488d16845ef42b7000000006a47304402203e4f3033699eaa44178b4a919b4c59428358de26eb1d5cd3017b9f498f65d1c302200e3d7cb718b123483db2d10032564cb7ace5d40e338e8e99676a87cb09c347ff012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff34a5d24b6cd48336a8af4ba30d03063044e1fd72d5df45318f1ac6bc4d2003bc000000006b483045022100f12b6e0b59da050c5919c91e13d2b6bb190b3f0be02e276270c505feff10d84d022005a55b59d2a8ae573764a26aea85c35feb3b4f8af5eb2a306e4846f4b04a12fa012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff7300321011ad83ba4dc0d4a106785974c777a4ce9c15e15c599e092fbf1221d0000000006a473044022061e4940f5abc0093975a3b52679b1433b1cdd9645880e743fa9a75865d4525bf0220155feb0f59dd0b3b61b7c1bc62b18f34ed3a1da973df18645c0b6f3e220bcff5012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff635848df35ea8145ae675bd8766fee61c9eb2064c6ca45324d7300584708ead5000000006a473044022041c35f24f3ce6028725b837617013b3fb04164d6701a7fe14760234ac9fa42a70220326d1b7013da0bb5a30a8494705c04f74ef465b9c27447dcc316bb9cfc3e2fa1012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffffcdadf4fecbdcd87c1ce1023f4b641ab43c5e50fff8ff9c81955acbb6ac9f0af4000000006b4830450221009ee9b816cf033890fcad93d3bf51d754fddcec71dcbdf6f26a05898c4afe260802202b8df11d35a9d83eda4ce65ea83c63a9fce5f774c1b5dbfd1ac6a4b3adca5c99012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff02da8f9800000000001976a914a35f0ae9e3065632eccc169538c8fd3969d9675d88ac00e1f505000000001976a9149fd693cdb19c17a4011f1fc41b35587c46a5096188ac62ed0000"
}
{% endhighlight %}

用法二：获取指定 watch-only 交易的详细信息。

{% highlight shell %}
$ bitcoin-cli gettransaction "txid" true
{% endhighlight %}

## 源码剖析
`gettransaction` 对应的函数在“rpcserver.h”文件中被引用。

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
