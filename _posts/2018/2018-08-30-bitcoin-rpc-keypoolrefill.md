---
layout: post
title:  "比特币 RPC 命令「keypoolrefill」"
date:   2018-08-30 20:59:50 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli keypoolrefill ( newsize )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help keypoolrefill
keypoolrefill ( newsize )

填充密钥池。

注：
1. 需要调用 walletpassphrase 设置钱包密码。
2. 填充后大小必定比填充前大。
3. 填充后密钥池大小为指定或默认值 + 1。

参数：
1. newsize（整型，可选，默认为 100）新密钥池大小

例子：
> bitcoin-cli keypoolrefill
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "keypoolrefill", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`keypoolrefill` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue keypoolrefill(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue keypoolrefill(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 1)
        throw runtime_error(
            "keypoolrefill ( newsize )\n"
            "\nFills the keypool."
            + HelpRequiringPassphrase() + "\n"
            "\nArguments\n"
            "1. newsize     (numeric, optional, default=100) The new keypool size\n"
            "\nExamples:\n"
            + HelpExampleCli("keypoolrefill", "")
            + HelpExampleRpc("keypoolrefill", "")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    // 0 is interpreted by TopUpKeyPool() as the default keypool size given by -keypool
    unsigned int kpSize = 0; // 3. 0 被 TopUpKeyPool() 解释为 -keypool 给定的默认密钥池大小
    if (params.size() > 0) {
        if (params[0].get_int() < 0)
            throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid parameter, expected valid size.");
        kpSize = (unsigned int)params[0].get_int();
    }

    EnsureWalletIsUnlocked(); // 确保钱包未加密
    pwalletMain->TopUpKeyPool(kpSize); // 根据指定大小填充密钥池

    if (pwalletMain->GetKeyPoolSize() < kpSize)
        throw JSONRPCError(RPC_WALLET_ERROR, "Error refreshing keypool.");

    return NullUniValue;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

### 2.3. 0 被 TopUpKeyPool() 解释为 -keypool 给定的默认密钥池大小

确保钱包解锁函数 `EnsureWalletIsUnlocked()` 定义在文件 `rpcwallet.cpp` 中。

```cpp
void EnsureWalletIsUnlocked()
{
    if (pwalletMain->IsLocked())
        throw JSONRPCError(RPC_WALLET_UNLOCK_NEEDED, "Error: Please enter the wallet passphrase with walletpassphrase first."); // 抛出错误信息
}
```

填充密钥池函数 `pwalletMain->TopUpKeyPool(kpSize)` 声明在文件 `wallet.h` 的钱包类 `CWallet` 中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    bool TopUpKeyPool(unsigned int kpSize = 0);
    ...
};
```

实现在文件 `wallet.cpp` 中。

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

获取密钥池大小函数 `pwalletMain->GetKeyPoolSize()` 定义在文件 `wallet.h` 的钱包类 `CWallet` 中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */
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

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
* [bitcoin/wallet.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.h){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
