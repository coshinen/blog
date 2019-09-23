---
layout: post
title:  "比特币 RPC 命令剖析 \"getunconfirmedbalance\""
date:   2018-08-22 18:00:08 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getunconfirmedbalance
---
## 提示说明

```shell
getunconfirmedbalance # 获取服务器钱包未确认的（未打包交易/内存池中交易）总余额
```

结果：返回服务器钱包未确认的总余额。

## 用法示例

### 比特币核心客户端

获取服务器钱包未确认的余额。

```shell
$ bitcoin-cli getunconfirmedbalance
0.00000000
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getunconfirmedbalance", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":0.00000000,"error":null,"id":"curltest"}
```

## 源码剖析
getunconfirmedbalance 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getunconfirmedbalance(const UniValue& params, bool fHelp); // 获取未确认的余额
```

实现在“rpcwallet.cpp”文件中。

```cpp
UniValue getunconfirmedbalance(const UniValue &params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
                "getunconfirmedbalance\n"
                "Returns the server's total unconfirmed balance\n");

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    return ValueFromAmount(pwalletMain->GetUnconfirmedBalance()); // 获取未确认的余额并返回
}
```

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取未确认的总余额并返回。

第四步，调用 pwalletMain->GetUnconfirmedBalance() 函数获取未确认的金额总和，该函数定义在“wallet.cpp”文件中。

```cpp
bool CWalletTx::InMempool() const
{
    LOCK(mempool.cs);
    if (mempool.exists(GetHash())) { // 若该交易索引是否存在于内存池中
        return true; // 返回 true
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
    return nTotal; // 返回总余额
}
```

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getconfirmedbalance){:target="_blank"}
