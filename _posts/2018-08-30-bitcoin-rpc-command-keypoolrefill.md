---
layout: post
title:  "比特币 RPC 命令剖析 \"keypoolrefill\""
date:   2018-08-30 08:59:50 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli keypoolrefill ( newsize )
---
## 提示说明

```shell
keypoolrefill ( newsize ) # 填充满密钥池
```

**注：<br>
1.需要调用 [walletpassphrase](/blog/2018/09/bitcoin-rpc-command-walletpassphrase.html) 设置钱包密码。<br>
2.填充后大小必定比填充前大。<br>
3.填充后密钥池大小为指定或默认值 + 1。**

参数：<br>
1.newsize（整型，可选，默认为 100）新密钥池大小。

结果：无返回值。

## 用法示例

### 比特币核心客户端

**注：若钱包设置了密码，使用该命令前先用 [walletpassphrase](/blog/2018/09/bitcoin-rpc-command-walletpassphrase.html) 解密钱包。**

用法一：使用比特币核心服务启动时的 -keypool 选项对应的默认值进行填充，填充大小为默认值 + 1。

```shell
$ bitcoin-cli getinfo | grep keypoolsize
  "keypoolsize": 100
$ bitcoin-cli getnewaddress
17HgY9ieCzTse44eFbX1bEyPUHKJKjMVEB
$ bitcoin-cli getinfo | grep keypoolsize
  "keypoolsize": 99
$ bitcoin-cli keypoolrefill
$ bitcoin-cli getinfo | grep keypoolsize
  "keypoolsize": 101
```

用法二：指定大于当前密钥池大小的数字进行填充。

```shell
$ bitcoin-cli getinfo | grep keypoolsize
  "keypoolsize": 101
$ bitcoin-cli keypoolrefill 200
$ bitcoin-cli getinfo | grep keypoolsize
  "keypoolsize": 201
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "keypoolrefill", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
```

## 源码剖析
keypoolrefill 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue keypoolrefill(const UniValue& params, bool fHelp); // 再填充密钥池
```

实现在“rpcwallet.cpp”文件中。

```cpp
UniValue keypoolrefill(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保钱包当前可用
        return NullUniValue;
    
    if (fHelp || params.size() > 1) // 至多 1 个参数
        throw runtime_error( // 命令帮助反馈
            "keypoolrefill ( newsize )\n"
            "\nFills the keypool."
            + HelpRequiringPassphrase() + "\n"
            "\nArguments\n"
            "1. newsize     (numeric, optional, default=100) The new keypool size\n"
            "\nExamples:\n"
            + HelpExampleCli("keypoolrefill", "")
            + HelpExampleRpc("keypoolrefill", "")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    // 0 is interpreted by TopUpKeyPool() as the default keypool size given by -keypool
    unsigned int kpSize = 0; // 0 表示通过 TopUpKeyPool() 基于 -keypool 选项的默认密钥池大小
    if (params.size() > 0) {
        if (params[0].get_int() < 0) // 密钥池大小不能小于 0
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, expected valid size.");
        kpSize = (unsigned int)params[0].get_int(); // 获取密钥池大小
    }

    EnsureWalletIsUnlocked(); // 确保钱包当前未加密
    pwalletMain->TopUpKeyPool(kpSize); // 根据指定大小填充密钥池

    if (pwalletMain->GetKeyPoolSize() < kpSize) // 填充后的密钥池大小不能小于 kpSize
        throw JSONRPCError(RPC_WALLET_ERROR, "Error refreshing keypool.");

    return NullUniValue; // 返回空值
}
```

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定的密钥池大小，不能小于 0。<br>
5.确保钱包当前未加密。<br>
6.填充满密钥池。<br>
7.检测填充后的密钥池大小。

第五步，调用 EnsureWalletIsUnlocked() 函数确保当前钱包未加密，若已加密，先使用 [wallepassphrase](/blog/2018/05/bitcoin-rpc-command-walletpassphrase.html) 解密钱包。
该函数定义在“rpcwallet.cpp”文件中。

```cpp
void EnsureWalletIsUnlocked()
{
    if (pwalletMain->IsLocked()) // 若钱包加密
        throw JSONRPCError(RPC_WALLET_UNLOCK_NEEDED, "Error: Please enter the wallet passphrase with walletpassphrase first."); // 抛出错误信息
}
```

第六步，调用 pwalletMain->TopUpKeyPool(kpSize) 函数按指定大小填充密钥池，该函数声明在“wallet.h”文件的 CWallet 类中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    bool TopUpKeyPool(unsigned int kpSize = 0); // 填充满密钥池
    ...
};
```

实现在“wallet.cpp”文件中。

```cpp
bool CWallet::TopUpKeyPool(unsigned int kpSize)
{
    {
        LOCK(cs_wallet);

        if (IsLocked()) // 再次检查钱包是否被锁
            return false;

        CWalletDB walletdb(strWalletFile); // 通过钱包文件名创建钱包数据库对象

        // Top up key pool
        unsigned int nTargetSize;
        if (kpSize > 0) // 这里的 kpSize 默认为 0
            nTargetSize = kpSize;
        else // 所以走这里
            nTargetSize = max(GetArg("-keypool", DEFAULT_KEYPOOL_SIZE), (int64_t) 0); // 钥匙池大小，默认 100

        while (setKeyPool.size() < (nTargetSize + 1)) // 这里可以看出密钥池实际上最多有 nTargetSize + 1 个密钥，默认为 100 + 1 即 101 个
        {
            int64_t nEnd = 1;
            if (!setKeyPool.empty()) // 若密钥集合为空，则从索引为 1 的密钥开始填充
                nEnd = *(--setKeyPool.end()) + 1; // 获取当前密钥池中密钥的最大数量（索引）并加 1
            if (!walletdb.WritePool(nEnd, CKeyPool(GenerateNewKey()))) // 创建一个密钥对并把公钥写入钱包数据库文件中
                throw runtime_error("TopUpKeyPool(): writing generated key failed");
            setKeyPool.insert(nEnd); // 将新密钥的索引插入密钥池集合
            LogPrintf("keypool added key %d, size=%u\n", nEnd, setKeyPool.size());
        }
    }
    return true;
}
```

第七步，调用 pwalletMain->GetKeyPoolSize() 函数获取当前即填充后密钥池的大小，该函数定义在“wallet.h”文件的 CWallet 类中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    std::set<int64_t> setKeyPool; // 密钥池集合，用于记录密钥索引，从数字 1 开始递增
    ...
    unsigned int GetKeyPoolSize() // 获取密钥池大小
    {
        AssertLockHeld(cs_wallet); // setKeyPool
        return setKeyPool.size(); // 返回密钥池索引集合的大小
    }
    ...
};
```

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#keypoolrefill){:target="_blank"}
