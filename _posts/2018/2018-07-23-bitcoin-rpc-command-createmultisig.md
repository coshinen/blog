---
layout: post
title:  "比特币 RPC 命令剖析 \"createmultisig\""
date:   2018-07-23 20:48:50 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli createmultisig urequired ["key",...]
---
## 1. 帮助内容

```shell
createmultisig urequired ["key",...]

创建一个需要 m 个密钥的 n 个签名的多签地址。
它会返回一个带有地址和赎回脚本的 json 对象。

参数：
1. nrequired（数字，必备）n 个密钥或地址所需的签名数。
2. "keys"   （字符串，必备）一个比特币地址或 16 进制编码公钥的 json 数组
     [
       "key"（字符串）比特币地址或 16 进制编码的公钥
       ,...
     ]

结果：
{
  "address":"multisigaddress",（字符串）新的多签地址值。
  "redeemScript":"script"     （字符串）16 进制编码的赎回脚本的字符串值。
}

例子：

从 2 个地址创建一个多签地址
> bitcoin-cli createmultisig 2 "[\"16sSauSf5pF2UkUwvKGq4qjNRzBZYqgEL5\",\"171sgjn4YtPu27adkKGrdDwzRTxnRkBfKV\"]"

作为一个 json rpc 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "createmultisig", "params": [2, "[\"16sSauSf5pF2UkUwvKGq4qjNRzBZYqgEL5\",\"171sgjn4YtPu27adkKGrdDwzRTxnRkBfKV\"]"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`createmultisig` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue createmultisig(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmisc.cpp` 中。

```cpp
UniValue createmultisig(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 2 || params.size() > 2)
    {
        string msg = "createmultisig nrequired [\"key\",...]\n"
            "\nCreates a multi-signature address with n signature of m keys required.\n"
            "It returns a json object with the address and redeemScript.\n"

            "\nArguments:\n"
            "1. nrequired      (numeric, required) The number of required signatures out of the n keys or addresses.\n"
            "2. \"keys\"       (string, required) A json array of keys which are bitcoin addresses or hex-encoded public keys\n"
            "     [\n"
            "       \"key\"    (string) bitcoin address or hex-encoded public key\n"
            "       ,...\n"
            "     ]\n"

            "\nResult:\n"
            "{\n"
            "  \"address\":\"multisigaddress\",  (string) The value of the new multisig address.\n"
            "  \"redeemScript\":\"script\"       (string) The string value of the hex-encoded redemption script.\n"
            "}\n"

            "\nExamples:\n"
            "\nCreate a multisig address from 2 addresses\n"
            + HelpExampleCli("createmultisig", "2 \"[\\\"16sSauSf5pF2UkUwvKGq4qjNRzBZYqgEL5\\\",\\\"171sgjn4YtPu27adkKGrdDwzRTxnRkBfKV\\\"]\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("createmultisig", "2, \"[\\\"16sSauSf5pF2UkUwvKGq4qjNRzBZYqgEL5\\\",\\\"171sgjn4YtPu27adkKGrdDwzRTxnRkBfKV\\\"]\"")
        ;
        throw runtime_error(msg);
    } // 1. 帮助内容

    // Construct using pay-to-script-hash:
    CScript inner = _createmultisig_redeemScript(params); // 2. 使用 P2SH 构造多签并返回
    CScriptID innerID(inner);
    CBitcoinAddress address(innerID);

    UniValue result(UniValue::VOBJ);
    result.push_back(Pair("address", address.ToString()));
    result.push_back(Pair("redeemScript", HexStr(inner.begin(), inner.end())));

    return result;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmisc.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmisc.cpp){:target="_blank"}
