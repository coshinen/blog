---
layout: post
title:  "比特币 RPC 命令剖析 \"resendwallettransactions\""
date:   2018-06-14 11:20:08 +0800
author: mistydew
categories: Blockchain
hidden: true
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
resendwallettransactions # 立即重新广播未确认的钱包交易到全部对端
{% endhighlight %}

**仅用于测试；钱包代码周期性的自动重新广播。**

结果：返回重新广播的交易索引的数组。

## 用法示例

{% highlight shell %}
$ bitcoin-cli resendwallettransactions
[
  "c99589e3bb8bb1acd4aea8cb035cf9f2a165e46db5044fc53682f1ae5926aa0e", 
  "dd812b6757a9fcae4b48ffb9aae9d527a9c4645167317099e9288c796369f683"
]
{% endhighlight %}

## 源码剖析
`resendwallettransactions` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue resendwallettransactions(const UniValue& params, bool fHelp); // 重新发送钱包交易
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

基本流程：<br>
1.确保当前钱包可用。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.重新发送当前时间点之前的钱包交易并获取所有被发送交易的索引。<br>
5.构造数组类型结果集，遍历交易索引列表，加入结果集。<br>
6.返回结果。

第四步，调用 pwalletMain->ResendWalletTransactionsBefore(GetTime() 重新广播指定钱包交易，
该函数定义在“wallet/wallet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

调用 wtx.RelayWalletTransaction() 中继交易，该函数定义在“walle/wallet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

相关函数调用见 [`sendrawtransaction`](/2018/06/13/bitcoin-rpc-command-sendrawtransaction)。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#resendwallettransactions)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
