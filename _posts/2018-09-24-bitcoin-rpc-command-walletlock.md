---
layout: post
title:  "比特币 RPC 命令剖析 \"walletlock\""
date:   2018-09-24 16:52:09 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli walletlock
---
## 提示说明

```shell
walletlock # 从内存中移除钱包密钥，锁定钱包
```

在调用此方法后，在调用任何需要钱包解锁的方法之前
你将需要再次调用 [walletpassphrase](/blog/2018/09/bitcoin-rpc-command-walletpassphrase.html)。

结果：无返回值。

## 用法示例

### 比特币核心客户端

先解锁钱包 120 秒，然后锁定钱包。

```shell
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 0,
$ bitcoin-cli walletpassphrase "mypasswd" 120
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 1527757245,
$ bitcoin-cli walletlock
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 0,
```

**一般先解锁钱包数秒，在发送比特币之后，使用该命令锁定钱包。**

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "walletlock", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
```

## 源码剖析
walletlock 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue walletlock(const UniValue& params, bool fHelp); // 锁定钱包
```

实现在“rpcwallet.cpp”文件中。

```cpp
UniValue walletlock(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保钱包当前可用
        return NullUniValue;
    
    if (pwalletMain->IsCrypted() && (fHelp || params.size() != 0)) // 钱包已加密 且 没有参数
        throw runtime_error( // 命令帮助反馈
            "walletlock\n"
            "\nRemoves the wallet encryption key from memory, locking the wallet.\n"
            "After calling this method, you will need to call walletpassphrase again\n"
            "before being able to call any methods which require the wallet to be unlocked.\n"
            "\nExamples:\n"
            "\nSet the passphrase for 2 minutes to perform a transaction\n"
            + HelpExampleCli("walletpassphrase", "\"my pass phrase\" 120") +
            "\nPerform a send (requires passphrase set)\n"
            + HelpExampleCli("sendtoaddress", "\"1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd\" 1.0") +
            "\nClear the passphrase since we are done before 2 minutes is up\n"
            + HelpExampleCli("walletlock", "") +
            "\nAs json rpc call\n"
            + HelpExampleRpc("walletlock", "")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    if (fHelp) // 钱包未加密时无法查看该命令帮助
        return true;
    if (!pwalletMain->IsCrypted()) // 钱包未加密时无法使用该命令
        throw JSONRPCError(RPC_WALLET_WRONG_ENC_STATE, "Error: running with an unencrypted wallet, but walletlock was called.");

    {
        LOCK(cs_nWalletUnlockTime);
        pwalletMain->Lock(); // 锁定钱包
        nWalletUnlockTime = 0; // 钱包解锁过期时间置 0
    }

    return NullUniValue; // 返回空值
}
```

基本流程：<br>
1.确保当前钱包可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.钱包未加密时查看命令帮助，不返回任何信息。<br>
5.钱包未加密时无法使用该命令。<br>
6.锁定钱包。<br>
7.把解锁钱包过期时间置为 0。

第六步，调用 pwalletMain->Lock() 函数清空主密钥，锁定钱包。该函数定义在“crypter.cpp”文件中。

```cpp
bool CCryptoKeyStore::SetCrypted() // 设置加密状态为 true
{
    LOCK(cs_KeyStore);
    if (fUseCrypto)
        return true;
    if (!mapKeys.empty())
        return false;
    fUseCrypto = true;
    return true;
}

bool CCryptoKeyStore::Lock()
{
    if (!SetCrypted()) // 设置加密状态
        return false;

    {
        LOCK(cs_KeyStore); // 上锁
        vMasterKey.clear(); // 清空主密钥
    }

    NotifyStatusChanged(this); // 通知状态改变
    return true;
}
```

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#walletlock){:target="_blank"}
