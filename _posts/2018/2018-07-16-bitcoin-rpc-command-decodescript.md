---
layout: post
title:  "比特币 RPC 命令剖析 \"decodescript\""
date:   2018-07-16 09:03:39 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli decodescript "hex"
---
## 提示说明

```shell
decodescript "hex" # 解码一个 16 进制编码的脚本
```

参数：
1. hex（字符串，必备）16 进制编码的脚本，可以为空 ""。

结果：
```shell
{
  "asm":"asm",   （字符串）脚本公钥
  "hex":"hex",   （字符串）16 进制编码的公钥
  "type":"type", （字符串）输出类型
  "reqSigs": n,    （数字）必备的签名
  "addresses": [   （字符串类型的 json 数组）
     "address"     （字符串）比特币地址
     ,...
  ],
  "p2sh","address" （字符串）脚本地址
}
```

## 用法示例

### 比特币核心客户端

方法一：解锁指定原始交易的输出的脚本。

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
$ bitcoin-cli decodescript 76a914e221b8a504199bec7c5fe8081edd011c3653118288ac
{
  "asm": "OP_DUP OP_HASH160 e221b8a504199bec7c5fe8081edd011c36531182 OP_EQUALVERIFY OP_CHECKSIG",
  "reqSigs": 1,
  "type": "pubkeyhash",
  "addresses": [
    "1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV"
  ],
  "p2sh": "37HPRCgvC7gKoVr9zPma7vboRGikgzEoJG"
}
```

方法二：解锁空脚本。

```cpp
$ bitcoin-cli decodescript ""
{
  "asm": "",
  "type": "nonstandard",
  "p2sh": "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"
}
```

### cURL

```cpp
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "decodescript", "params": ["76a914e221b8a504199bec7c5fe8081edd011c3653118288ac"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"asm":"OP_DUP OP_HASH160 e221b8a504199bec7c5fe8081edd011c36531182 OP_EQUALVERIFY OP_CHECKSIG","reqSigs":1,"type":"pubkeyhash","addresses":["1Mcg7MDBD38sSScsX3USbsCnkcMbPnLyTV"],"p2sh":"37HPRCgvC7gKoVr9zPma7vboRGikgzEoJG"},"error":null,"id":"curltest"}
```

## 源码剖析
decodescript 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue decodescript(const UniValue& params, bool fHelp); // 解码脚本
```

实现在“rpcrawtransaction.cpp”文件中。

```cpp
UniValue decodescript(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须是 1 个
        throw runtime_error( // 命令帮助反馈
            "decodescript \"hex\"\n"
            "\nDecode a hex-encoded script.\n"
            "\nArguments:\n"
            "1. \"hex\"     (string) the hex encoded script\n"
            "\nResult:\n"
            "{\n"
            "  \"asm\":\"asm\",   (string) Script public key\n"
            "  \"hex\":\"hex\",   (string) hex encoded public key\n"
            "  \"type\":\"type\", (string) The output type\n"
            "  \"reqSigs\": n,    (numeric) The required signatures\n"
            "  \"addresses\": [   (json array of string)\n"
            "     \"address\"     (string) bitcoin address\n"
            "     ,...\n"
            "  ],\n"
            "  \"p2sh\",\"address\" (string) script address\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("decodescript", "\"hexstring\"")
            + HelpExampleRpc("decodescript", "\"hexstring\"")
        );

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)); // 参数类型检查

    UniValue r(UniValue::VOBJ);
    CScript script;
    if (params[0].get_str().size() > 0){ // 若脚本非空字符串
        vector<unsigned char> scriptData(ParseHexV(params[0], "argument")); // 解析参数
        script = CScript(scriptData.begin(), scriptData.end()); // 构建序列化的脚本
    } else { // 空脚本是有效的
        // Empty scripts are valid
    }
    ScriptPubKeyToJSON(script, r, false); // 脚本公钥转换为 JSON 格式加入结果集

    r.push_back(Pair("p2sh", CBitcoinAddress(CScriptID(script)).ToString())); // Base58 编码的脚本哈希
    return r; // 返回结果集
}
```

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.检验参数类型，是否为字符串类型。<br>
3.构建序列化脚本对象，可为空。<br>
4.脚本公钥转换为 JSON 格式加入结果集。<br>
5.把 Base58 编码的脚本哈希加入结果集并返回。

第四步，调用 ScriptPubKeyToJSON(script, r, false) 把脚本公钥转换为 JSON 格式，
该函数定义在“rpcrawtransaction.cpp”文件中。

```cpp
void ScriptPubKeyToJSON(const CScript& scriptPubKey, UniValue& out, bool fIncludeHex)
{
    txnouttype type;
    vector<CTxDestination> addresses;
    int nRequired;

    out.push_back(Pair("asm", ScriptToAsmStr(scriptPubKey))); // 脚本操作码
    if (fIncludeHex)
        out.push_back(Pair("hex", HexStr(scriptPubKey.begin(), scriptPubKey.end()))); // 16 进制形式

    if (!ExtractDestinations(scriptPubKey, type, addresses, nRequired)) {
        out.push_back(Pair("type", GetTxnOutputType(type))); // 脚本类型
        return;
    }

    out.push_back(Pair("reqSigs", nRequired)); // 是否需要签名
    out.push_back(Pair("type", GetTxnOutputType(type))); // 类型

    UniValue a(UniValue::VARR);
    BOOST_FOREACH(const CTxDestination& addr, addresses)
        a.push_back(CBitcoinAddress(addr).ToString());
    out.push_back(Pair("addresses", a)); // 输出地址
}
```

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#decodescript){:target="_blank"}
