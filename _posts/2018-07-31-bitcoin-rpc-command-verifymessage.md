---
layout: post
title:  "比特币 RPC 命令剖析 \"verifymessage\""
date:   2018-07-31 09:40:29 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli verifymessage "bitcoinaddress" "signature" "message"
---
## 提示说明

```shell
verifymessage "bitcoinaddress" "signature" "message" # 验证一个签过名的消息
```

参数：
1. bitcoinaddress（字符串，必备）用于签名的比特币地址。
2. signature（字符串，必备）通过签名者提供的 base64 编码的签名（见 [signmessage](/blog/2018/06/bitcoin-rpc-command-signmessage.html)）。
3. message（字符串，必备）签过名的消息。

结果：（布尔型）返回 true 表示签名验证通过，反之不通过。

## 用法示例

### 比特币核心客户端

若钱包已加密，需要先进行解密，这里解密了 60 秒。

```shell
$ bitcoin-cli walletpassphrase "passphrase" 60
```

若钱包未加密，可忽略此步，直接进行消息验证。<br>
使用 [signmessage](/blog/2018/09/bitcoin-rpc-command-signmessage.html) 签名一个消息。

```shell
$ bitcoin-cli getnewaddress
1EseaaKaGH9HtQunHy46G6FTZCkvU68uqu
$ bitcoin-cli signmessage 1EseaaKaGH9HtQunHy46G6FTZCkvU68uqu "testmessage"
H/v9J/pOJ3zU7tuW2DUcQUphFpCpHzFbSLA62kac2BoIKJEgVOGjwOT+KtwbTJWSwGVCuoQ2ytTGQRdOYYzenvA=
$ bitcoin-cli verifymessage 1EseaaKaGH9HtQunHy46G6FTZCkvU68uqu H/v9J/pOJ3zU7tuW2DUcQUphFpCpHzFbSLA62kac2BoIKJEgVOGjwOT+KtwbTJWSwGVCuoQ2ytTGQRdOYYzenvA= "testmessage"
true
$ bitcoin-cli verifymessage 1EseaaKaGH9HtQunHy46G6FTZCkvU68uqu H/v9J/pOJ3zU7tuW2DUcQUphFpCpHzFbSLA62kac2BoIKJEgVOGjwOT+KtwbTJWSwGVCuoQ2ytTGQRdOYYzenvA= "message"
false
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifymessage", "params": ["1EseaaKaGH9HtQunHy46G6FTZCkvU68uqu", "H/v9J/pOJ3zU7tuW2DUcQUphFpCpHzFbSLA62kac2BoIKJEgVOGjwOT+KtwbTJWSwGVCuoQ2ytTGQRdOYYzenvA=", "testmessage"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":true,"error":null,"id":"curltest"}
```

## 源码剖析
verifymessage 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue verifymessage(const UniValue& params, bool fHelp); // 验证签名消息
```

实现在“rpcmisc.cpp”文件中。

```cpp
UniValue verifymessage(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 3) // 参数必须为 3 个
        throw runtime_error( // 命令帮助反馈
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
        );

    LOCK(cs_main); // 上锁

    string strAddress  = params[0].get_str(); // 获取指定地址
    string strSign     = params[1].get_str(); // 获取指定签名
    string strMessage  = params[2].get_str(); // 获取相应签名消息

    CBitcoinAddress addr(strAddress);
    if (!addr.IsValid()) // 验证地址是否有效
        throw JSONRPCError(RPC_TYPE_ERROR, "Invalid address");

    CKeyID keyID;
    if (!addr.GetKeyID(keyID)) // 获取密钥索引
        throw JSONRPCError(RPC_TYPE_ERROR, "Address does not refer to key");

    bool fInvalid = false;
    vector<unsigned char> vchSig = DecodeBase64(strSign.c_str(), &fInvalid); // 对签名进行 base64 解码

    if (fInvalid) // 验证解码是否成功
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Malformed base64 encoding");

    CHashWriter ss(SER_GETHASH, 0); // 创建哈希写入器对象
    ss << strMessageMagic; // 导入消息魔术头
    ss << strMessage; // 导入消息

    CPubKey pubkey;
    if (!pubkey.RecoverCompact(ss.GetHash(), vchSig)) // 从签名和消息的哈希获取公钥
        return false;

    return (pubkey.GetID() == keyID); // 若获取公钥的索引等于指定地址索引，验证成功，返回 true
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 上锁。
3. 获取指定参数：地址，签名和签名的消息，并验证地址是否有效。
4. 通过地址获取密钥索引。
5. 对签名进行 base64 解码，并验证解码是否成功。
6. 创建哈希写入器，导入消息魔术头和消息。
7. 通过解码的签名和消息写入器获取相应的公钥。
8. 若公钥对应索引等于指定地址的密钥索引，验证成功，返回 true。

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#verifymessage){:target="_blank"}
