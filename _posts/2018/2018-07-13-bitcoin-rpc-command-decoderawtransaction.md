---
layout: post
title:  "比特币 RPC 命令剖析 \"decoderawtransaction\""
date:   2018-07-13 22:10:12 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli decoderawtransaction "hexstring"
---
## 1. 帮助内容

```shell
$ bitcoin-cli help decoderawtransaction
decoderawtransaction "hexstring"

返回一个表示序列化的 16 进制编码的交易的 JSON 对象。

参数：
1. "hex"              （字符串，必备）交易的 16 进制字符串

结果：
{
  "txid" : "id",      （字符串）交易索引
  "size" : n,         （数字）交易大小
  "version" : n,      （数字）交易版本
  "locktime" : ttt,   （数字）锁定时间
  "vin" : [           （json 对象们的数组）
     {
       "txid": "id",  （字符串）交易索引
       "vout": n,     （数字）输出序号
       "scriptSig": { （json 对象）脚本
         "asm": "asm",（字符串）脚本公钥
         "hex": "hex" （字符串）16 进制
       },
       "sequence": n  （数字）脚本序列号
     }
     ,...
  ],
  "vout" : [                   （json 对象们的数组）
     {
       "value" : x.xxx,        （数字）以 BTC 为单位的值
       "n" : n,                （数字）索引
       "scriptPubKey" : {      （json 对象）
         "asm" : "asm",        （字符串）脚本公钥
         "hex" : "hex",        （字符串）16 进制
         "reqSigs" : n,        （数字）所需的签名
         "type" : "pubkeyhash",（字符串）类型，例 'pubkeyhash'
         "addresses" : [       （字符串的 json 数组）
           "12tvKAXCxZjSmdNbao16dKXC8tRWfcF5oc"（字符串）比特币地址
           ,...
         ]
       }
     }
     ,...
  ],
}

例子：
> bitcoin-cli decoderawtransaction "hexstring"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "decoderawtransaction", "params": ["hexstring"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`decoderawtransaction` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue decoderawtransaction(const UniValue& params, bool fHelp);
```

实现在文件 `rpcrawtransaction.cpp` 中。

```cpp
UniValue decoderawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
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
        ); // 1. 帮助内容

    LOCK(cs_main);
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)); // 2. RPC 类型检测

    CTransaction tx;

    if (!DecodeHexTx(tx, params[0].get_str())) // 3. 解码 16 进制的交易
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "TX decode failed");

    UniValue result(UniValue::VOBJ);
    TxToJSON(tx, uint256(), result); // 4. 把交易转换为 JSON 对象

    return result;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcrawtransaction.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcrawtransaction.cpp){:target="_blank"}
