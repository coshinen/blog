---
layout: post
title:  "比特币 RPC 命令剖析 \"getunconfirmedbalance\""
date:   2018-08-22 20:00:08 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getunconfirmedbalance
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getunconfirmedbalance
getunconfirmedbalance
返回服务器端未确认的总余额
```

## 2. 源码剖析

`getunconfirmedbalance` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getunconfirmedbalance(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue getunconfirmedbalance(const UniValue &params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 0)
        throw runtime_error(
                "getunconfirmedbalance\n"
                "Returns the server's total unconfirmed balance\n"); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    return ValueFromAmount(pwalletMain->GetUnconfirmedBalance()); // 3. 获取未确认的余额
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.3. 获取未确认的余额

获取未确认的余额函数 `pwalletMain->GetUnconfirmedBalance()` 定义在文件 `wallet.cpp` 中。

```cpp
bool CWalletTx::InMempool() const
{
    LOCK(mempool.cs);
    if (mempool.exists(GetHash())) {
        return true;
    }
    return false;
}
...
CAmount CWallet::GetUnconfirmedBalance() const
{
    CAmount nTotal = 0;
    {
        LOCK2(cs_main, cs_wallet);
        for (map<uint256, CWalletTx>::const_iterator it = mapWallet.begin(); it != mapWallet.end(); ++it)
        { // 遍历钱包交易映射列表
            const CWalletTx* pcoin = &(*it).second; // 获取钱包交易
            if (!pcoin->IsTrusted() && pcoin->GetDepthInMainChain() == 0 && pcoin->InMempool()) // 该交易不可信（未确认） 且 交易所在链深度为 0 且 交易在内存池中（未上链）
                nTotal += pcoin->GetAvailableCredit(); // 获取累加可用余额
        }
    }
    return nTotal;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
