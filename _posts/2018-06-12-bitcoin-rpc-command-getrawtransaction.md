---
layout: post
title:  "比特币 RPC 命令剖析 \"getrawtransaction\""
date:   2018-06-12 11:23:30 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
getrawtransaction "txid" ( verbose ) # 获取原始交易信息
{% endhighlight %}

**注：默认情况，此功能只在有时有效。
这是当交易在交易内存池或在此交易的未花费交易输出中有一个未花费输出时。
为了使其总是有效，你需要使用 `-txindex` 命令行选项来维护一个交易索引。**

参数：<br>
1. `txid` （字符串，必备）交易索引。<br>
2. `verbose` （数字型，可选，默认为 0）如果为 0，返回一个交易 `txid` 序列化的 16 进制编码数据的字符串，
否则返回一个关于交易 `txid` 信息的 json 对象。

结果：（如果 verbose 未设置或设置为 0）<br>
（字符串）返回交易 `txid` 序列化的 16 进制编码的数据。

结果：（如果 verbose 大于 0）<br>
{% highlight shell %}
{
  "hex" : "data",       (string) The serialized, hex-encoded data for 'txid'
  "txid" : "id",        (string) The transaction id (same as provided)
  "size" : n,             (numeric) The transaction size
  "version" : n,          (numeric) The version
  "locktime" : ttt,       (numeric) The lock time
  "vin" : [               (array of json objects)
     {
       "txid": "id",    (string) The transaction id
       "vout": n,         (numeric) 
       "scriptSig": {     (json object) The script
         "asm": "asm",  (string) asm
         "hex": "hex"   (string) hex
       },
       "sequence": n      (numeric) The script sequence number
     }
     ,...
  ],
  "vout" : [              (array of json objects)
     {
       "value" : x.xxx,            (numeric) The value in BTC
       "n" : n,                    (numeric) index
       "scriptPubKey" : {          (json object)
         "asm" : "asm",          (string) the asm
         "hex" : "hex",          (string) the hex
         "reqSigs" : n,            (numeric) The required sigs
         "type" : "pubkeyhash",  (string) The type, eg 'pubkeyhash'
         "addresses" : [           (json array of string)
           "bitcoinaddress"        (string) bitcoin address
           ,...
         ]
       }
     }
     ,...
  ],
  "blockhash" : "hash",   (string) the block hash
  "confirmations" : n,      (numeric) The confirmations
  "time" : ttt,             (numeric) The transaction time in seconds since epoch (Jan 1 1970 GMT)
  "blocktime" : ttt         (numeric) The block time in seconds since epoch (Jan 1 1970 GMT)
}
{% endhighlight %}

## 用法示例

用法一：使用默认 verbose 值，获取指定交易索引的序列化交易数据。

{% highlight shell %}
$ bitcoin-cli getrawtransaction 1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118
01000000017708d09c30b24ee303ef9fbcf4990d160fcf62a56d5218d4df0cef7c47321b15000000006b483045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff03be410f00000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acfe831e00000000001976a914a679db3ef39fe34161431507cba8b579ba90281388acc0cf6a00000000001976a9149e0342205ce74dc6bb782d99b3269826e8d655b488acaa1a0100
{% endhighlight %}

用法二：verbose 为 0，效果同上。

{% highlight shell %}
$ bitcoin-cli getrawtransaction 1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118 0
01000000017708d09c30b24ee303ef9fbcf4990d160fcf62a56d5218d4df0cef7c47321b15000000006b483045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff03be410f00000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acfe831e00000000001976a914a679db3ef39fe34161431507cba8b579ba90281388acc0cf6a00000000001976a9149e0342205ce74dc6bb782d99b3269826e8d655b488acaa1a0100
{% endhighlight %}

用法三：verbose 置为 1，获取指定索引的交易的相关信息。

{% highlight shell %}
$ bitcoin-cli getrawtransaction 1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118 1
{
  "hex": "01000000017708d09c30b24ee303ef9fbcf4990d160fcf62a56d5218d4df0cef7c47321b15000000006b483045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff03be410f00000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acfe831e00000000001976a914a679db3ef39fe34161431507cba8b579ba90281388acc0cf6a00000000001976a9149e0342205ce74dc6bb782d99b3269826e8d655b488acaa1a0100",
  "txid": "1903ac0fefc0bd63f15cef083c714d7a19f049e617dcc15ea2d655f81bf3d118",
  "size": 260,
  "version": 1,
  "locktime": 72362,
  "vin": [
    {
      "txid": "151b32477cef0cdfd418526da562cf0f160d99f4bc9fef03e34eb2309cd00877",
      "vout": 0,
      "scriptSig": {
        "asm": "3045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e[ALL] 02ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0",
        "hex": "483045022100841737a0cd634af22659dd8d663e7219863f49c4e151ccafa75656a79061f15202201f895c8ad9c2e576bd6efb9785248498a3f05da14d47f7fbd85e3f2e3057008e012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0"
      },
      "sequence": 4294967294
    }
  ],
  "vout": [
    {
      "value": 0.00999870,
      "valueSat": 999870,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 9dd5d8f38714a8b07a4e702777d445d388805ebd OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a9149dd5d8f38714a8b07a4e702777d445d388805ebd88ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1k6P9NNcWpqPR3CPz7i59doBeBMwepy7yD"
        ]
      }
    }, 
    {
      "value": 0.01999870,
      "valueSat": 1999870,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 a679db3ef39fe34161431507cba8b579ba902813 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914a679db3ef39fe34161431507cba8b579ba90281388ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1kt52SrJRMausYSQnsfQBCiYcJKxUdNvBB"
        ]
      }
    }, 
    {
      "value": 0.07000000,
      "valueSat": 7000000,
      "n": 2,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 9e0342205ce74dc6bb782d99b3269826e8d655b4 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a9149e0342205ce74dc6bb782d99b3269826e8d655b488ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1k7KYa17GZqhpeKEPjp6DMn11EdoGnyGeF"
        ]
      }
    }
  ],
  "blockhash": "000059ac90cf7439ea8186e4f4d35f349fe878c4723cde7ff18c66a8e33f1b73",
  "height": 72366,
  "confirmations": 6065,
  "time": 1528451744,
  "blocktime": 1528451744
}
{% endhighlight %}

## 源码剖析
`getrawtransaction` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getrawtransaction(const UniValue& params, bool fHelp); // 获取原始交易信息
{% endhighlight %}

实现在“rpcrawtransaction.cpp”文件中。

{% highlight C++ %}
UniValue getrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数为 1 或 2 个
        throw runtime_error( // 命令帮助反馈
            "getrawtransaction \"txid\" ( verbose )\n"
            "\nNOTE: By default this function only works sometimes. This is when the tx is in the mempool\n"
            "or there is an unspent output in the utxo for this transaction. To make it always work,\n"
            "you need to maintain a transaction index, using the -txindex command line option.\n"
            "\nReturn the raw transaction data.\n"
            "\nIf verbose=0, returns a string that is serialized, hex-encoded data for 'txid'.\n"
            "If verbose is non-zero, returns an Object with information about 'txid'.\n"

            "\nArguments:\n"
            "1. \"txid\"      (string, required) The transaction id\n"
            "2. verbose       (numeric, optional, default=0) If 0, return a string, other return a json object\n"

            "\nResult (if verbose is not set or set to 0):\n"
            "\"data\"      (string) The serialized, hex-encoded data for 'txid'\n"

            "\nResult (if verbose > 0):\n"
            "{\n"
            "  \"hex\" : \"data\",       (string) The serialized, hex-encoded data for 'txid'\n"
            "  \"txid\" : \"id\",        (string) The transaction id (same as provided)\n"
            "  \"size\" : n,             (numeric) The transaction size\n"
            "  \"version\" : n,          (numeric) The version\n"
            "  \"locktime\" : ttt,       (numeric) The lock time\n"
            "  \"vin\" : [               (array of json objects)\n"
            "     {\n"
            "       \"txid\": \"id\",    (string) The transaction id\n"
            "       \"vout\": n,         (numeric) \n"
            "       \"scriptSig\": {     (json object) The script\n"
            "         \"asm\": \"asm\",  (string) asm\n"
            "         \"hex\": \"hex\"   (string) hex\n"
            "       },\n"
            "       \"sequence\": n      (numeric) The script sequence number\n"
            "     }\n"
            "     ,...\n"
            "  ],\n"
            "  \"vout\" : [              (array of json objects)\n"
            "     {\n"
            "       \"value\" : x.xxx,            (numeric) The value in " + CURRENCY_UNIT + "\n"
            "       \"n\" : n,                    (numeric) index\n"
            "       \"scriptPubKey\" : {          (json object)\n"
            "         \"asm\" : \"asm\",          (string) the asm\n"
            "         \"hex\" : \"hex\",          (string) the hex\n"
            "         \"reqSigs\" : n,            (numeric) The required sigs\n"
            "         \"type\" : \"pubkeyhash\",  (string) The type, eg 'pubkeyhash'\n"
            "         \"addresses\" : [           (json array of string)\n"
            "           \"bitcoinaddress\"        (string) bitcoin address\n"
            "           ,...\n"
            "         ]\n"
            "       }\n"
            "     }\n"
            "     ,...\n"
            "  ],\n"
            "  \"blockhash\" : \"hash\",   (string) the block hash\n"
            "  \"confirmations\" : n,      (numeric) The confirmations\n"
            "  \"time\" : ttt,             (numeric) The transaction time in seconds since epoch (Jan 1 1970 GMT)\n"
            "  \"blocktime\" : ttt         (numeric) The block time in seconds since epoch (Jan 1 1970 GMT)\n"
            "}\n"

            "\nExamples:\n"
            + HelpExampleCli("getrawtransaction", "\"mytxid\"")
            + HelpExampleCli("getrawtransaction", "\"mytxid\" 1")
            + HelpExampleRpc("getrawtransaction", "\"mytxid\", 1")
        );

    LOCK(cs_main); // 上锁

    uint256 hash = ParseHashV(params[0], "parameter 1"); // 解析指定的交易哈希

    bool fVerbose = false; // 详细信息标志，默认为 false
    if (params.size() > 1)
        fVerbose = (params[1].get_int() != 0); // 获取详细信息设置

    CTransaction tx;
    uint256 hashBlock;
    if (!GetTransaction(hash, tx, Params().GetConsensus(), hashBlock, true)) // 获取交易及所在区块哈希
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "No information available about transaction");

    string strHex = EncodeHexTx(tx); // 编码交易

    if (!fVerbose) // 若为 false
        return strHex; // 直接返回编码后的数据

    UniValue result(UniValue::VOBJ); // 否则，构建对象类型返回结果
    result.push_back(Pair("hex", strHex)); // 加入序列化的交易
    TxToJSON(tx, hashBlock, result); // 交易信息转换为 JSON 格式加入结果
    return result; // 返回结果
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.获取相关参数：指定的交易索引和详细信息设置。<br>
4.通过指定交易索引获取交易和所在区块的哈希。<br>
5.编码交易。<br>
6.若 verbose 为 false，直接返回编码后的交易。<br>
7.否则把交易相关信息转换为 JSON 格式加入结果对象并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getrawtransaction)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
