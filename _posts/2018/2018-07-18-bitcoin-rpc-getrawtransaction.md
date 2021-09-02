---
layout: post
title:  "比特币 RPC 命令「getrawtransaction」"
date:   2018-07-18 21:23:30 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help getrawtransaction
getrawtransaction "txid" ( verbose )

注意：默认情况下，该功能尽在某些时候工作。
这是当交易在内存池或在该交易的 utxo 中有一笔未花费的输出时。
为了使其始终正常工作，你需要使用 -txindex 命令行选项来维护一个交易索引。

返回原始交易数据。

如果 verbose 等于 0，则返回一个 'txid' 的序列化的 16 进制编码的数据的字符串。
如果 verbose 非 0，则返回一个有关 'txid' 信息的对象。

参数：
1. "txid" （字符串，必备）交易索引
2. verbose（数字型，可选，默认为 0）若为 0，则返回一个字符串，否则返回一个 json 对象

结果：（如果 verbose 未设置或设置为 0）
"data"（字符串）'txid' 的序列化的 16 进制编码的数据

结果：（如果 verbose 大于 0）
{
  "hex" : "data",     （字符串）'txid' 的序列化的 16 进制编码的数据
  "txid" : "id",      （字符串）交易索引（与提供的一样）
  "size" : n,         （数字）交易大小
  "version" : n,      （数字）版本
  "locktime" : ttt,   （数字）锁定时间
  "vin" : [           （json 对象的数组）
     {
       "txid": "id",  （字符串）交易索引
       "vout": n,     （数字）
       "scriptSig": { （json 对象）脚本
         "asm": "asm",（字符串）脚本公钥
         "hex": "hex" （字符串）16 进制
       },
       "sequence": n  （数字）脚本序列号
     }
     ,...
  ],
  "vout" : [                   （json 对象的数组）
     {
       "value" : x.xxx,        （数字）以 BTC 为单位的值
       "n" : n,                （数字）索引
       "scriptPubKey" : {      （json 对象）
         "asm" : "asm",        （字符串）脚本公钥
         "hex" : "hex",        （字符串）16 进制
         "reqSigs" : n,        （数字）所需的签名
         "type" : "pubkeyhash",（字符串）类型，例 'pubkeyhash'
         "addresses" : [       （字符串的 json 数组）
           "bitcoinaddress"    （字符串）比特币地址
           ,...
         ]
       }
     }
     ,...
  ],
  "blockhash" : "hash",（字符串）区块哈希
  "confirmations" : n, （数字）确认数
  "time" : ttt,        （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的交易时间
  "blocktime" : ttt    （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位的区块时间
}

例子：
> bitcoin-cli getrawtransaction "mytxid"
> bitcoin-cli getrawtransaction "mytxid" 1
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawtransaction", "params": ["mytxid", 1] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`getrawtransaction` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getrawtransaction(const UniValue& params, bool fHelp);
```

实现在文件 `rpcrawtransaction.cpp` 中。

```cpp
UniValue getrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
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
        ); // 1. 帮助内容

    LOCK(cs_main);

    uint256 hash = ParseHashV(params[0], "parameter 1");

    bool fVerbose = false;
    if (params.size() > 1)
        fVerbose = (params[1].get_int() != 0);

    CTransaction tx;
    uint256 hashBlock;
    if (!GetTransaction(hash, tx, Params().GetConsensus(), hashBlock, true)) // 2. 获取交易信息
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "No information available about transaction");

    string strHex = EncodeHexTx(tx);

    if (!fVerbose)
        return strHex;

    UniValue result(UniValue::VOBJ);
    result.push_back(Pair("hex", strHex));
    TxToJSON(tx, hashBlock, result);
    return result;
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 2. 获取交易信息

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
