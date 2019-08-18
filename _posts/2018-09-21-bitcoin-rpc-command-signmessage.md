---
layout: post
title:  "比特币 RPC 命令剖析 \"signmessage\""
date:   2018-09-21 09:51:33 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli signmessage "bitcoinaddress" "message"
---
## 提示说明

{% highlight shell %}
signmessage "bitcoinaddress" "message" # 使用一个地址的私钥签名一个消息
{% endhighlight %}

参数：<br>
1.bitcoinaddress（字符串，必备）拥有对应私钥的比特币地址。<br>
2.message（字符串，必备）用于创建一个签名的消息。

结果：（字符串）返回 base64 编码的消息的签名。

## 用法示例

### 比特币核心客户端

1.若钱包加密了，需使用 [walletpassphrase](/blog/2018/09/bitcoin-rpc-command-walletpassphrase.html) 解锁钱包数秒。<br>
2.使用此命令对一条消息进行签名。<br>
3.使用 [verifymessage](/blog/2018/07/bitcoin-rpc-command-verifymessage.html) 验证消息。

{% highlight shell %}
$ bitcoin-cli walletpassphrase "mypasswd" 60
$ bitcoin-cli getnewaddress
1DMEoWsZoJJmaaGfhxRsE9yQmxdn6xSGfE
$ bitcoin-cli signmessage 1DMEoWsZoJJmaaGfhxRsE9yQmxdn6xSGfE "my message"
H/iROQoxdpDoQcWwbtd481fUZqyUhf2b/bFCsQqb/NanKrRAJtg9CkvGCFuTL9dn8BDfZULo4uduQi20mZFKDbQ=
$ bitcoin-cli verifymessage 1DMEoWsZoJJmaaGfhxRsE9yQmxdn6xSGfE H/iROQoxdpDoQcWwbtd481fUZqyUhf2b/bFCsQqb/NanKrRAJtg9CkvGCFuTL9dn8BDfZULo4uduQi20mZFKDbQ= "my message"
true
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "signmessage", "params": ["1DMEoWsZoJJmaaGfhxRsE9yQmxdn6xSGfE", "my message"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"H/iROQoxdpDoQcWwbtd481fUZqyUhf2b/bFCsQqb/NanKrRAJtg9CkvGCFuTL9dn8BDfZULo4uduQi20mZFKDbQ=","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
signmessage 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue signmessage(const UniValue& params, bool fHelp); // 签名消息
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue signmessage(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 2) // 参数必须为 2 个
        throw runtime_error( // 命令帮助反馈
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
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    EnsureWalletIsUnlocked(); // 确保当前钱包处于解密状态

    string strAddress = params[0].get_str(); // 获取指定地址
    string strMessage = params[1].get_str(); // 获取消息

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
{% endhighlight %}

基本流程：
1. 确保当前钱包可用。
2. 处理命令帮助和参数个数。
3. 钱包上锁，并确保当前钱包处于解密状态。
4. 获取指定的参数：比特币地址，用于签名的消息，并验证地址是否有效。
5. 获取地址对应的密钥索引，再通过索引获取对应私钥。
6. 创建哈希写入器对象，导入消息魔术头和指定消息。
7. 使用私钥对该消息进行签名，并获取签名数据。
8. base64 编码签名数据并返回。

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#signmessage){:target="_blank"}
