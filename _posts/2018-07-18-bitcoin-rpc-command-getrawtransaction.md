---
layout: post
title:  "比特币 RPC 命令剖析 \"getrawtransaction\""
date:   2018-07-18 11:23:30 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getrawtransaction "txid" ( verbose )
---
## 提示说明

```shell
getrawtransaction "txid" ( verbose ) # 获取原始交易信息
```

**注：默认情况，此功能只在某些情况下有效。
这是当交易在交易内存池或在此交易的未花费交易输出集中有一个未花费输出时。
为了使其总是有效，你需要使用 -txindex 命令行选项来维护一个交易索引。**

参数：<br>
1.txid（字符串，必备）交易索引。<br>
2.verbose（数字型，可选，默认为 0）如果为 0，返回一个交易 txid 序列化的 16 进制编码的交易索引数据的字符串，
否则返回一个关于交易 txid 信息的 json 对象。

结果：（如果 verbose 未设置或设置为 0）<br>
（字符串）返回交易 txid 序列化的 16 进制编码的数据。

结果：（如果 verbose 大于 0）<br>
```shell
{
  "hex" : "data",       （字符串）序列化的 16 进制编码的交易 'txid' 数据
  "txid" : "id",        （字符串）交易索引（和提供的一样）
  "size" : n,             （数字）交易大小
  "version" : n,          （数字）版本
  "locktime" : ttt,       （锁定时间）
  "vin" : [               （json 对象数组）
     {
       "txid": "id",    （字符串）交易索引
       "vout": n,         （数字）
       "scriptSig": {     （json 对象）脚本
         "asm": "asm",  （字符串）脚本公钥
         "hex": "hex"   （字符串）16 进制公钥
       },
       "sequence": n      （数字）脚本序列号
     }
     ,...
  ],
  "vout" : [              （json 对象数组）
     {
       "value" : x.xxx,            （数字）以 BTC 为单位的金额
       "n" : n,                    （数字）索引/序号
       "scriptPubKey" : {          （json 对象）
         "asm" : "asm",          （字符串）脚本公钥
         "hex" : "hex",          （字符串）16 进制公钥
         "reqSigs" : n,            （数字）必备的签名
         "type" : "pubkeyhash",  （字符串）类型，例 'pubkeyhash'
         "addresses" : [           （json 字符串数组）
           "bitcoinaddress"        （字符串）比特币地址
           ,...
         ]
       }
     }
     ,...
  ],
  "blockhash" : "hash",   （字符串）区块哈希
  "confirmations" : n,      （数字）确认数(numeric) The confirmations
  "time" : ttt,             （数字）从格林尼治时间 1970-01-01 00:00:00 开始以秒为单位的交易时间
  "blocktime" : ttt         （数字）从格林尼治时间 1970-01-01 00:00:00 开始以秒为单位的区块创建时间
}
```

## 用法示例

用法一：获取指定原始交易的序列化数据。

```shell
$ bitcoin-cli getrawtransaction 684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746
0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
```

用法二：设置 verbose 为 0，获取指定原始交易的序列化数据，效果同上。

```shell
$ bitcoin-cli getrawtransaction 684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746
0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
```

用法三：设置 verbose 为 1，获取指定索引的原始交易信息。

```shell
$ bitcoin-cli getrawtransaction 684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746 1
{
  "hex": "0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000",
  "txid": "684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746",
  "size": 192,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67",
      "vout": 0,
      "scriptSig": {
        "asm": "30450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d[ALL] 03583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546",
        "hex": "4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546"
      },
      "sequence": 4294967295
    }
  ],
  "vout": [
    {
      "value": 0.01000000,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 e221b8a504199bec7c5fe8081edd011c36531182 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914e221b8a504199bec7c5fe8081edd011c3653118288ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV"
        ]
      }
    }
  ]
}
```

**注：该交易还未上链，所以没有区块信息。**

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawtransaction", "params": ["684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746", 1] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"hex":"0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb000000006b4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000","txid":"684f6ed5b6e127ba76c07ef4c3fcc02a02c7e2ccef9ed0d2cc16c2896159c746","size":192,"version":1,"locktime":0,"vin":[{"txid":"fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67","vout":0,"scriptSig":{"asm":"30450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d[ALL] 03583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546","hex":"4830450221009b29490f5e1709bc3cce16c6433a0b8895add5a9d3c2fa63da11da065105ad59022022d068337cd3b20be04513e539f0bbbb5319ed1b3a3a8ec6262a30a8bd393b3d012103583eb3acb7f0b9c431d97a4872a270f4e519fbca0ec519adf16764c663e36546"},"sequence":4294967295}],"vout":[{"value":0.01000000,"n":0,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 e221b8a504199bec7c5fe8081edd011c36531182 OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914e221b8a504199bec7c5fe8081edd011c3653118288ac","reqSigs":1,"type":"pubkeyhash","addresses":["1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV"]}}]},"error":null,"id":"curltest"}
```

## 源码剖析
getrawtransaction 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getrawtransaction(const UniValue& params, bool fHelp); // 获取原始交易信息
```

实现在“rpcrawtransaction.cpp”文件中。

```cpp
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
```

基本流程：
1. 处理命令帮助和参数个数。
2. 上锁。
3. 获取相关参数：指定的交易索引和详细信息设置。
4. 通过指定交易索引获取交易和所在区块的哈希。
5. 编码交易。
6. 若 verbose 为 false，直接返回编码后的交易。
7. 否则把交易相关信息转换为 JSON 格式加入结果对象并返回。

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getrawtransaction){:target="_blank"}
