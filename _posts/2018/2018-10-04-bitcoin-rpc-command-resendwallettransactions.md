---
layout: post
title:  "比特币 RPC 命令剖析 \"resendwallettransactions\""
date:   2018-10-04 11:20:08 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli resendwallettransactions
---
## 提示说明

```shell
resendwallettransactions # 立即重新广播未确认的（交易内存池中）钱包交易到全部对端
```

**仅用于测试；钱包代码会周期性的自动重新广播交易。**

结果：返回重新广播的交易索引的 json 数组。

## 用法示例

### 比特币核心客户端

在无连接的情况下，新建 2 笔交易，并确认它们进入内存池，此时建立连接，连接建立后我们在对端节点查看该交易并未被广播，回到该节点重新发送钱包交易，可在对端节点查看到交易以被广播。

```shell
$ bitcoin-cli getconnectioncount
0
$ bitcoin-cli getnewaddress
1Pd97Ru8KYJCgovZzPNYi3VDkXmLQZbtKx
$ bitcoin-cli sendtoaddress 1Pd97Ru8KYJCgovZzPNYi3VDkXmLQZbtKx 1
6e54ab6ac385e19fa4eea08fa985db00512a7084c83a4419179240ce17ee1244
$ bitcoin-cli sendtoaddress 1Pd97Ru8KYJCgovZzPNYi3VDkXmLQZbtKx 2
58ae3bdc2d76457e3e536e7bac3238383b9f1e048feb86f5164aab39ceeac853
$ bitcoin-cli getmempoolinfo
{
  "size": 2,
  "bytes": 450,
  "usage": 1856,
  "maxmempool": 300000000,
  "mempoolminfee": 0.00000000
}
$ bitcoin-cli getrawmempool
[
  "6e54ab6ac385e19fa4eea08fa985db00512a7084c83a4419179240ce17ee1244", 
  "58ae3bdc2d76457e3e536e7bac3238383b9f1e048feb86f5164aab39ceeac853"
]
$ bitcoin-cli addnode 192.168.0.2 onetry
$ bitcoin-cli getconnectioncount
1
$ bitcoin-cli resendwallettransactions
[
  "6e54ab6ac385e19fa4eea08fa985db00512a7084c83a4419179240ce17ee1244", 
  "58ae3bdc2d76457e3e536e7bac3238383b9f1e048feb86f5164aab39ceeac853"
]
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "resendwallettransactions", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"6e54ab6ac385e19fa4eea08fa985db00512a7084c83a4419179240ce17ee1244", "58ae3bdc2d76457e3e536e7bac3238383b9f1e048feb86f5164aab39ceeac853"},"error":null,"id":"curltest"}
```

## 源码剖析
resendwallettransactions 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue resendwallettransactions(const UniValue& params, bool fHelp); // 重新发送钱包交易
```

实现在“wallet/rpcwallet.cpp”文件中。

```cpp
UniValue resendwallettransactions(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "resendwallettransactions\n"
            "Immediately re-broadcast unconfirmed wallet transactions to all peers.\n"
            "Intended only for testing; the wallet code periodically re-broadcasts\n"
            "automatically.\n"
            "Returns array of transaction ids that were re-broadcast.\n"
            );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    std::vector<uint256> txids = pwalletMain->ResendWalletTransactionsBefore(GetTime()); // 重新发送钱包交易并获取这些交易的索引
    UniValue result(UniValue::VARR); // 数组类型的结果对象
    BOOST_FOREACH(const uint256& txid, txids) // 遍历索引列表
    {
        result.push_back(txid.ToString()); // 加入结果集
    }
    return result; // 返回结果
}
```

基本流程：<br>
1.确保当前钱包可用。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.重新发送当前时间点之前的钱包交易并获取所有被发送交易的索引。<br>
5.构造数组类型结果集，遍历交易索引列表，加入结果集。<br>
6.返回结果。

第四步，调用 pwalletMain->ResendWalletTransactionsBefore(GetTime() 重新广播指定钱包交易，
该函数定义在“wallet/wallet.cpp”文件中。

```cpp
std::vector<uint256> CWallet::ResendWalletTransactionsBefore(int64_t nTime)
{
    std::vector<uint256> result; // 交易索引列表

    LOCK(cs_wallet); // 钱包上锁
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
    return result; // 返回发送的交易索引列表
}
```

调用 wtx.RelayWalletTransaction() 中继交易，该函数定义在“walle/wallet.cpp”文件中。

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

相关函数调用见 [sendrawtransaction](/blog/2018/07/bitcoin-rpc-command-sendrawtransaction.html)。

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#resendwallettransactions){:target="_blank"}
