---
layout: post
title:  "比特币 RPC 命令剖析 \"gettxout\""
date:   2018-06-05 09:26:01 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli gettxout "txid" n ( includemempool )
---
## 提示说明

{% highlight shell %}
gettxout "txid" n ( includemempool ) # 获取关于一笔未花费交易输出的细节
{% endhighlight %}

参数：<br>
1. txid （字符串，必备）交易索引。<br>
2. n （数字，必备）输出序号（索引）。<br>
3. includemempool （布尔型，可选）是否在交易内存池中。

结果：<br>
{% highlight shell %}
{
  "bestblock" : "hash",    （字符串）区块哈希
  "confirmations" : n,       （数字）确认数
  "value" : x.xxx,           （数字）以 BTC 为单位的交易金额
  "scriptPubKey" : {         （json 对象）
     "asm" : "code",       （字符串）
     "hex" : "hex",        （字符串）
     "reqSigs" : n,          （数字）所需签名数
     "type" : "pubkeyhash", （字符串）类型，例 "pubkeyhash"
     "addresses" : [          （字符串数组）比特币地址数组
        "bitcoinaddress"     （字符串）比特币地址
        ,...
     ]
  },
  "version" : n,            （数字）版本
  "coinbase" : true|false   （布尔型）是创币交易或不是
}
{% endhighlight %}

## 用法示例

先使用 [listunspent](/blog/2018/09/bitcoin-rpc-command-listunspent.html) 命令列出未花费交易输出，
再通过交易索引和交易输出序号获取该交易输出的详细信息。

{% highlight shell %}
$ bitcoin-cli listunspent
[
  {
    "txid": "b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f",
    "vout": 1,
    "address": "17FGuwcea6vd7GLhBc16Xuwqfk7KFp5cZ3",
    "scriptPubKey": "76a9144483dc8ad0a184355b70b2767a832266b4c2df0a88ac",
    "amount": 48.99996160,
    "confirmations": 18,
    "spendable": true
  }, 
  {
    "txid": "fb61a61c6cc7b37cd0afd2152a77fa894d82629971c77e11d00e9aed1cd03dfc",
    "vout": 0,
    "address": "1NLvqp6kvunbmtWMWbzdn7puD91kTXwiYd",
    "scriptPubKey": "76a914ea1f7d4b14deb291956a3d5adb503ff9772072fa88ac",
    "amount": 48.99996160,
    "confirmations": 16,
    "spendable": true
  }
]
$ bitcoin-cli gettxout b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f 1
{
  "bestblock": "0000005672bf2346408496c275427a6a8037566e001ed3639fa297ce86a10f09",
  "confirmations": 43,
  "value": 48.99996160,
  "scriptPubKey": {
    "asm": "OP_DUP OP_HASH160 4483dc8ad0a184355b70b2767a832266b4c2df0a OP_EQUALVERIFY OP_CHECKSIG",
    "hex": "76a9144483dc8ad0a184355b70b2767a832266b4c2df0a88ac",
    "reqSigs": 1,
    "type": "pubkeyhash",
    "addresses": [
      "17FGuwcea6vd7GLhBc16Xuwqfk7KFp5cZ3"
    ]
  },
  "version": 1,
  "coinbase": false
}
{% endhighlight %}

### cURL

使用 json rpc 调用。

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxout", "params": ["txid", 1] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"bestblock":"0000012fa5815cb19a6012d2a42aecd0e6d99df2462cb107d752d5637441b54e","confirmations":656,"value":48.99996160,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 4483dc8ad0a184355b70b2767a832266b4c2df0a OP_EQUALVERIFY OP_CHECKSIG","hex":"76a9144483dc8ad0a184355b70b2767a832266b4c2df0a88ac","reqSigs":1,"type":"pubkeyhash","addresses":["17FGuwcea6vd7GLhBc16Xuwqfk7KFp5cZ3"]},"version":1,"coinbase":false},"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
gettxout 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue gettxout(const UniValue& params, bool fHelp); // 获取一笔交易输出（链上或内存池中）的细节
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue gettxout(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 2 || params.size() > 3) // 参数为 2 个或 3 个
        throw runtime_error( // 命令帮助反馈
            "gettxout \"txid\" n ( includemempool )\n"
            "\nReturns details about an unspent transaction output.\n"
            "\nArguments:\n"
            "1. \"txid\"       (string, required) The transaction id\n"
            "2. n              (numeric, required) vout value\n"
            "3. includemempool  (boolean, optional) Whether to included the mem pool\n"
            "\nResult:\n"
            "{\n"
            "  \"bestblock\" : \"hash\",    (string) the block hash\n"
            "  \"confirmations\" : n,       (numeric) The number of confirmations\n"
            "  \"value\" : x.xxx,           (numeric) The transaction value in " + CURRENCY_UNIT + "\n"
            "  \"scriptPubKey\" : {         (json object)\n"
            "     \"asm\" : \"code\",       (string) \n"
            "     \"hex\" : \"hex\",        (string) \n"
            "     \"reqSigs\" : n,          (numeric) Number of required signatures\n"
            "     \"type\" : \"pubkeyhash\", (string) The type, eg pubkeyhash\n"
            "     \"addresses\" : [          (array of string) array of bitcoin addresses\n"
            "        \"bitcoinaddress\"     (string) bitcoin address\n"
            "        ,...\n"
            "     ]\n"
            "  },\n"
            "  \"version\" : n,            (numeric) The version\n"
            "  \"coinbase\" : true|false   (boolean) Coinbase or not\n"
            "}\n"

            "\nExamples:\n"
            "\nGet unspent transactions\n"
            + HelpExampleCli("listunspent", "") +
            "\nView the details\n"
            + HelpExampleCli("gettxout", "\"txid\" 1") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("gettxout", "\"txid\", 1")
        );

    LOCK(cs_main);

    UniValue ret(UniValue::VOBJ); // 目标类型的结果对象

    std::string strHash = params[0].get_str(); // 获取交易索引
    uint256 hash(uint256S(strHash));
    int n = params[1].get_int(); // 获取交易输出索引
    bool fMempool = true; // 是否包含内存池内交易的标志，默认为 true
    if (params.size() > 2)
        fMempool = params[2].get_bool(); // 获取指定的内存池标志

    CCoins coins; // 创建一个被修剪的交易版本对象（只包含元数据和未花费的交易输出）
    if (fMempool) { // 若包含内存池中的交易
        LOCK(mempool.cs); // 内存池上锁
        CCoinsViewMemPool view(pcoinsTip, mempool); // 创建内存池引用查看对象
        if (!view.GetCoins(hash, coins)) // 获取修剪版交易
            return NullUniValue;
        mempool.pruneSpent(hash, coins); // TODO: this should be done by the CCoinsViewMemPool
    } else { // 若不包含内存池的交易
        if (!pcoinsTip->GetCoins(hash, coins)) // 直接获取真正缓存的币数据
            return NullUniValue;
    }
    if (n<0 || (unsigned int)n>=coins.vout.size() || coins.vout[n].IsNull()) // 输出索引范围检测，或该索引对应输出为空
        return NullUniValue;

    BlockMap::iterator it = mapBlockIndex.find(pcoinsTip->GetBestBlock()); // 获取最佳区块索引映射迭代器
    CBlockIndex *pindex = it->second; // 获取最佳区块索引
    ret.push_back(Pair("bestblock", pindex->GetBlockHash().GetHex())); // 最佳区块哈希
    if ((unsigned int)coins.nHeight == MEMPOOL_HEIGHT) // 若币的高度为 0x7FFFFFFF
        ret.push_back(Pair("confirmations", 0)); // 未上链，0 确认数
    else // 否则表示已上链
        ret.push_back(Pair("confirmations", pindex->nHeight - coins.nHeight + 1)); // 获取确认数
    ret.push_back(Pair("value", ValueFromAmount(coins.vout[n].nValue))); // 输出金额
    UniValue o(UniValue::VOBJ);
    ScriptPubKeyToJSON(coins.vout[n].scriptPubKey, o, true); // 公钥脚本转换为 JSON 格式
    ret.push_back(Pair("scriptPubKey", o)); // 公钥脚本
    ret.push_back(Pair("version", coins.nVersion)); // 版本号
    ret.push_back(Pair("coinbase", coins.fCoinBase)); // 是否为创币交易

    return ret;
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取相关参数：交易索引，交易输出索引，是否包含交易内存池标志。<br>
4.若包含交易内存池，则获取修剪版本交易，并标记该交易输出已花费。<br>
5.若不包含，直接获取缓存的币数据。<br>
6.交易输出索引检测。<br>
7.获取相关信息并追加到结果对象。<br>
8.返回结果。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#gettxout)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
