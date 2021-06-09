---
layout: post
title:  "比特币 RPC 命令「signmessage」"
date:   2018-09-21 20:51:33 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli signmessage "bitcoinaddress" "message"
---
## 1. 帮助内容

```shell
$ bitcoin-cli help signmessage
signmessage "bitcoinaddress" "message"

使用一个地址的私钥签名一条消息。

参数：
1. "bitcoinaddress"（字符串，必备）用于私钥的比特币地址。
2. "message"       （字符串，必备）用来创建一个签名的消息。

结果：
"signature"（字符串）base 64 编码的消息的签名

例子：

解锁钱包 30 秒
> bitcoin-cli walletpassphrase "mypassphrase" 30

创建签名
> bitcoin-cli signmessage "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ" "my message"

验证签名
> bitcoin-cli verifymessage "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ" "signature" "my message"

作为 json rpc
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "signmessage", "params": ["1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ", "my message"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`signmessage` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue signmessage(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue signmessage(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 2)
        throw runtime_error(
            "signmessage \"bitcoinaddress\" \"message\"\n"
            "\nSign a message with the private key of an address"
            + HelpRequiringPassphrase() + "\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"  (string, required) The bitcoin address to use for the private key.\n"
            "2. \"message\"         (string, required) The message to create a signature of.\n"
            "\nResult:\n"
            "\"signature\"          (string) The signature of the message encoded in base 64\n"
            "\nExamples:\n"
            "\nUnlock the wallet for 30 seconds\n"
            + HelpExampleCli("walletpassphrase", "\"mypassphrase\" 30") +
            "\nCreate the signature\n"
            + HelpExampleCli("signmessage", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\" \"my message\"") +
            "\nVerify the signature\n"
            + HelpExampleCli("verifymessage", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\" \"signature\" \"my message\"") +
            "\nAs json rpc\n"
            + HelpExampleRpc("signmessage", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\", \"my message\"")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    EnsureWalletIsUnlocked(); // 3. 确保钱包已解锁

    string strAddress = params[0].get_str();
    string strMessage = params[1].get_str();

    CBitcoinAddress addr(strAddress);
    if (!addr.IsValid()) // 验证地址是否有效
        throw JSONRPCError(RPC_TYPE_ERROR, "Invalid address");

    CKeyID keyID;
    if (!addr.GetKeyID(keyID)) // 获取地址对应的密钥索引
        throw JSONRPCError(RPC_TYPE_ERROR, "Address does not refer to key");

    CKey key;
    if (!pwalletMain->GetKey(keyID, key)) // 通过索引获取对应私钥
        throw JSONRPCError(RPC_WALLET_ERROR, "Private key not available");

    CHashWriter ss(SER_GETHASH, 0); // 哈希写入器流对象
    ss << strMessageMagic; // 导入消息魔术头
    ss << strMessage; // 导入消息

    vector<unsigned char> vchSig;
    if (!key.SignCompact(ss.GetHash(), vchSig)) // 使用私钥对消息进行签名，并获取签名数据
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Sign failed");

    return EncodeBase64(&vchSig[0], vchSig.size()); // base64 编码签名并返回
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
