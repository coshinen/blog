---
layout: post
title:  "比特币 RPC 命令剖析 \"decoderawtransaction\""
date:   2018-07-13 12:10:12 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli decoderawtransaction "hexstring"
---
## 提示说明

```shell
decoderawtransaction "hexstring" # 获取一个表示序列化的 16 进制编码交易的 JSON 对象
```

参数：
1. hex（字符串，必备）交易的 16 进制字符串。

结果：
```shell
{
  "txid" : "id",        （字符串）交易索引
  "size" : n,             （数字）交易大小
  "version" : n,          （数字）版本
  "locktime" : ttt,       （数字）锁定时间
  "vin" : [               （json 对象数组）
     {
       "txid": "id",    （字符串）交易索引
       "vout": n,         （数字）输出序号
       "scriptSig": {     （json 对象）脚本
         "asm": "asm",  （字符串）脚本公钥
         "hex": "hex"   （字符串）16 进制公钥
       },
       "sequence": n     （数字）脚本序列号
     }
     ,...
  ],
  "vout" : [             （json 对象数组）
     {
       "value" : x.xxx,            （数字）以 BTC 为单位的金额
       "n" : n,                    （数字）索引/序号
       "scriptPubKey" : {          （json 对象）
         "asm" : "asm",          （字符串）脚本公钥
         "hex" : "hex",          （字符串）16 进制公钥
         "reqSigs" : n,            （数字）必备的签名
         "type" : "pubkeyhash",  （字符串）类型，例 'pubkeyhash'
         "addresses" : [           （字符串类型的 json 数组）
           "12tvKAXCxZjSmdNbao16dKXC8tRWfcF5oc"   （字符串）比特币地址
           ,...
         ]
       }
     }
     ,...
  ],
}
```

## 用法示例

### 比特币核心客户端

查看一笔通过 [createrawtransaction](/blog/2018/07/bitcoin-rpc-command-createrawtransaction.html) 创建的原始交易。

```shell
$ bitcoin-cli decoderawtransaction 0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000
{
  "txid": "6d5ea131dd69b0a04950cfd95b94412c3f3c70ec57f8558d9986946a37b3958e",
  "size": 85,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67",
      "vout": 0,
      "scriptSig": {
        "asm": "",
        "hex": ""
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

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "decoderawtransaction", "params": ["0100000001677e3c8d416184b42c753a8446f17b0b7997f0df7149449fbd0aef3cdfd29bfb0000000000ffffffff0140420f00000000001976a914e221b8a504199bec7c5fe8081edd011c3653118288ac00000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"txid":"6d5ea131dd69b0a04950cfd95b94412c3f3c70ec57f8558d9986946a37b3958e","size":85,"version":1,"locktime":0,"vin":[{"txid":"fb9bd2df3cef0abd9f444971dff097790b7bf146843a752cb48461418d3c7e67","vout":0,"scriptSig":{"asm":"","hex":""},"sequence":4294967295}],"vout":[{"value":0.01000000,"n":0,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 e221b8a504199bec7c5fe8081edd011c36531182 OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914e221b8a504199bec7c5fe8081edd011c3653118288ac","reqSigs":1,"type":"pubkeyhash","addresses":["1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV"]}}]},"error":null,"id":"curltest"}
```

## 源码剖析

decoderawtransaction 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue decoderawtransaction(const UniValue& params, bool fHelp); // 解码原始交易
```

实现在“rpcrawtransaction.cpp”文件中。

```cpp
UniValue decoderawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "decoderawtransaction \"hexstring\"\n"
            "\nReturn a JSON object representing the serialized, hex-encoded transaction.\n"

            "\nArguments:\n"
            "1. \"hex\"      (string, required) The transaction hex string\n"

            "\nResult:\n"
            "{\n"
            "  \"txid\" : \"id\",        (string) The transaction id\n"
            "  \"size\" : n,             (numeric) The transaction size\n"
            "  \"version\" : n,          (numeric) The version\n"
            "  \"locktime\" : ttt,       (numeric) The lock time\n"
            "  \"vin\" : [               (array of json objects)\n"
            "     {\n"
            "       \"txid\": \"id\",    (string) The transaction id\n"
            "       \"vout\": n,         (numeric) The output number\n"
            "       \"scriptSig\": {     (json object) The script\n"
            "         \"asm\": \"asm\",  (string) asm\n"
            "         \"hex\": \"hex\"   (string) hex\n"
            "       },\n"
            "       \"sequence\": n     (numeric) The script sequence number\n"
            "     }\n"
            "     ,...\n"
            "  ],\n"
            "  \"vout\" : [             (array of json objects)\n"
            "     {\n"
            "       \"value\" : x.xxx,            (numeric) The value in " + CURRENCY_UNIT + "\n"
            "       \"n\" : n,                    (numeric) index\n"
            "       \"scriptPubKey\" : {          (json object)\n"
            "         \"asm\" : \"asm\",          (string) the asm\n"
            "         \"hex\" : \"hex\",          (string) the hex\n"
            "         \"reqSigs\" : n,            (numeric) The required sigs\n"
            "         \"type\" : \"pubkeyhash\",  (string) The type, eg 'pubkeyhash'\n"
            "         \"addresses\" : [           (json array of string)\n"
            "           \"12tvKAXCxZjSmdNbao16dKXC8tRWfcF5oc\"   (string) bitcoin address\n"
            "           ,...\n"
            "         ]\n"
            "       }\n"
            "     }\n"
            "     ,...\n"
            "  ],\n"
            "}\n"

            "\nExamples:\n"
            + HelpExampleCli("decoderawtransaction", "\"hexstring\"")
            + HelpExampleRpc("decoderawtransaction", "\"hexstring\"")
        );

    LOCK(cs_main); // 上锁
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)); // 检测参数类型

    CTransaction tx;

    if (!DecodeHexTx(tx, params[0].get_str())) // 解码交易
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "TX decode failed");

    UniValue result(UniValue::VOBJ);
    TxToJSON(tx, uint256(), result); // 把交易信息转换为 JSON 加入结果对象

    return result; // 返回结果对象
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 上锁。
3. 检验参数类型，是否为字符串类型。
4. 解码交易。
5. 把交易信息转换为 JSON 格式加入到结果对象并返回。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcrawtransaction.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcrawtransaction.cpp){:target="_blank"}
