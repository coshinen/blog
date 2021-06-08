---
layout: post
title:  "比特币 RPC 命令「verifymessage」"
date:   2018-07-31 19:40:29 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli verifymessage "bitcoinaddress" "signature" "message"
---
## 1. 帮助内容

```shell
$ bitcoin-cli help verifymessage
verifymessage "bitcoinaddress" "signature" "message"

验证一个已签名的消息

参数：
1. "bitcoinaddress"（字符串，必备）用于该签名的比特币地址。
2. "signature"     （字符串，必备）通过签名者提供的 base 64 编码的签名（见 signmessage）。
3. "message"       （字符串，必备）已签名的消息。

结果：
true|false（布尔型）签名是否已验证。

例子：

解锁钱包 30 秒
> bitcoin-cli walletpassphrase "mypassphrase" 30

创建签名
> bitcoin-cli signmessage "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ" "my message"

验证签名
> bitcoin-cli verifymessage "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ" "signature" "my message"

作为 json rpc
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifymessage", "params": ["1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ", "signature", "my message"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`verifymessage` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue verifymessage(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmisc.cpp` 中。

```cpp
UniValue verifymessage(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 3)
        throw runtime_error(
            "verifymessage \"bitcoinaddress\" \"signature\" \"message\"\n"
            "\nVerify a signed message\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"  (string, required) The bitcoin address to use for the signature.\n"
            "2. \"signature\"       (string, required) The signature provided by the signer in base 64 encoding (see signmessage).\n"
            "3. \"message\"         (string, required) The message that was signed.\n"
            "\nResult:\n"
            "true|false   (boolean) If the signature is verified or not.\n"
            "\nExamples:\n"
            "\nUnlock the wallet for 30 seconds\n"
            + HelpExampleCli("walletpassphrase", "\"mypassphrase\" 30") +
            "\nCreate the signature\n"
            + HelpExampleCli("signmessage", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\" \"my message\"") +
            "\nVerify the signature\n"
            + HelpExampleCli("verifymessage", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\" \"signature\" \"my message\"") +
            "\nAs json rpc\n"
            + HelpExampleRpc("verifymessage", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\", \"signature\", \"my message\"")
        ); // 1. 帮助内容

    LOCK(cs_main);

    string strAddress  = params[0].get_str();
    string strSign     = params[1].get_str();
    string strMessage  = params[2].get_str();

    CBitcoinAddress addr(strAddress);
    if (!addr.IsValid()) // 2. 验证地址
        throw JSONRPCError(RPC_TYPE_ERROR, "Invalid address");

    CKeyID keyID;
    if (!addr.GetKeyID(keyID)) // 3. 获取地址对应的密钥索引
        throw JSONRPCError(RPC_TYPE_ERROR, "Address does not refer to key");

    bool fInvalid = false;
    vector<unsigned char> vchSig = DecodeBase64(strSign.c_str(), &fInvalid); // 4. 解码签名

    if (fInvalid)
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Malformed base64 encoding");

    CHashWriter ss(SER_GETHASH, 0);
    ss << strMessageMagic;
    ss << strMessage;

    CPubKey pubkey;
    if (!pubkey.RecoverCompact(ss.GetHash(), vchSig)) // 5. 恢复公钥后验证并返回
        return false;

    return (pubkey.GetID() == keyID);
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmisc.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmisc.cpp){:target="_blank"}
