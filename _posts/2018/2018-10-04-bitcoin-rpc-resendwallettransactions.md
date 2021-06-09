---
layout: post
title:  "比特币 RPC 命令「resendwallettransactions」"
date:   2018-10-04 21:20:08 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli resendwallettransactions
---
## 1. 帮助内容

```shell
resendwallettransactions
立刻重新广播未确认的钱包交易到所有对端。
仅用于测试；钱包代码会定期自动重新广播。
返回重新广播的交易索引的数组。
```

## 2. 源码剖析

`resendwallettransactions` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue resendwallettransactions(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue resendwallettransactions(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "resendwallettransactions\n"
            "Immediately re-broadcast unconfirmed wallet transactions to all peers.\n"
            "Intended only for testing; the wallet code periodically re-broadcasts\n"
            "automatically.\n"
            "Returns array of transaction ids that were re-broadcast.\n"
            ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    std::vector<uint256> txids = pwalletMain->ResendWalletTransactionsBefore(GetTime()); // 3. 重新发送钱包交易并返回交易索引
    UniValue result(UniValue::VARR);
    BOOST_FOREACH(const uint256& txid, txids)
    {
        result.push_back(txid.ToString());
    }
    return result;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

### 2.3. 重新发送钱包交易并返回交易索引

重新发送钱包交易函数 `pwalletMain->ResendWalletTransactionsBefore(GetTime()` 实现在文件 `wallet/wallet.cpp` 中。

```cpp
std::vector<uint256> CWallet::ResendWalletTransactionsBefore(int64_t nTime)
{
    std::vector<uint256> result;

    LOCK(cs_wallet);
    // Sort them in chronological order // 按时间顺序排序
    multimap<unsigned int, CWalletTx*> mapSorted; // 排过序的交易列表
    BOOST_FOREACH(PAIRTYPE(const uint256, CWalletTx)& item, mapWallet) // 遍历钱包交易映射列表
    {
        CWalletTx& wtx = item.second; // 获取钱包交易
        // Don't rebroadcast if newer than nTime: // 指定时间点后的交易不再广播
        if (wtx.nTimeReceived > nTime)
            continue;
        mapSorted.insert(make_pair(wtx.nTimeReceived, &wtx)); // 加入排过序的交易列表
    }
    BOOST_FOREACH(PAIRTYPE(const unsigned int, CWalletTx*)& item, mapSorted) // 遍历该交易列表
    {
        CWalletTx& wtx = *item.second; // 获取交易
        if (wtx.RelayWalletTransaction()) // 中继该钱包交易
            result.push_back(wtx.GetHash()); // 获取交易哈希加入交易索引列表
    }
    return result;
}
```

中继交易函数 `wtx.RelayWalletTransaction()` 实现在文件 `walle/wallet.cpp` 中。

```cpp
bool CWalletTx::RelayWalletTransaction()
{
    assert(pwallet->GetBroadcastTransactions()); // 验证钱包是否广播交易
    if (!IsCoinBase()) // 该交易非创币交易
    {
        if (GetDepthInMainChain() == 0 && !isAbandoned()) { // 链深度为 0（即未上链）且 未被标记为已抛弃
            LogPrintf("Relaying wtx %s\n", GetHash().ToString()); // 记录中继交易哈希
            RelayTransaction((CTransaction)*this); // 进行交易中继
            return true;
        }
    }
    return false;
}
```

参考 [sendrawtransaction](/blog/2018/07/bitcoin-rpc-sendrawtransaction.html)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
