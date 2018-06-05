---
layout: post
title:  "比特币 RPC 命令剖析 \"listlockunspent\""
date:   2018-06-05 17:46:53 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
listlockunspent # 获取不能花费（锁定的）交易输出列表
{% endhighlight %}

见 [`lockunspent`](/2018/06/05/bitcoin-rpc-command-lockunspent) 调用，加解锁交易输出。

结果：<br>
{% highlight shell %}
[
  {
    "txid" : "transactionid",     (string) The transaction id locked
    "vout" : n                      (numeric) The vout value
  }
  ,...
]
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli listunspent
[
  {
    "txid": "cf9f8c8bac02b3012ab99864a2294b88cc6105fdefcd16bbe8f7d1531fc895fe",
    "vout": 0,
    "address": "1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk",
    "account": "",
    "scriptPubKey": "76a914a4d938a6461a0d6f24946b9bfcda0862a1db6f7488ac",
    "amount": 0.10000000,
    "confirmations": 34533,
    "ps_rounds": -2,
    "spendable": true,
    "solvable": true
  }, 
  ...
]
$ bitcoin-cli lockunspent false "[{\"txid\":\"cf9f8c8bac02b3012ab99864a2294b88cc6105fdefcd16bbe8f7d1531fc895fe\",\"vout\":0}]"
true
$ bitcoin-cli listlockunspent
[
  {
    "txid": "cf9f8c8bac02b3012ab99864a2294b88cc6105fdefcd16bbe8f7d1531fc895fe",
    "vout": 0
  }
]
{% endhighlight %}

## 源码剖析
`listlockunspent` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue listlockunspent(const UniValue& params, bool fHelp); // 列出锁定的未花费交易输出
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue listlockunspent(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "listlockunspent\n"
            "\nReturns list of temporarily unspendable outputs.\n"
            "See the lockunspent call to lock and unlock transactions for spending.\n"
            "\nResult:\n"
            "[\n"
            "  {\n"
            "    \"txid\" : \"transactionid\",     (string) The transaction id locked\n"
            "    \"vout\" : n                      (numeric) The vout value\n"
            "  }\n"
            "  ,...\n"
            "]\n"
            "\nExamples:\n"
            "\nList the unspent transactions\n"
            + HelpExampleCli("listunspent", "") +
            "\nLock an unspent transaction\n"
            + HelpExampleCli("lockunspent", "false \"[{\\\"txid\\\":\\\"a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0\\\",\\\"vout\\\":1}]\"") +
            "\nList the locked transactions\n"
            + HelpExampleCli("listlockunspent", "") +
            "\nUnlock the transaction again\n"
            + HelpExampleCli("lockunspent", "true \"[{\\\"txid\\\":\\\"a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0\\\",\\\"vout\\\":1}]\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("listlockunspent", "")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    vector<COutPoint> vOutpts; // 创建输出点列表
    pwalletMain->ListLockedCoins(vOutpts); // 获取锁定的交易输出集合

    UniValue ret(UniValue::VARR); // 创建数组类型的结果集

    BOOST_FOREACH(COutPoint &outpt, vOutpts) { // 遍历输出点列表
        UniValue o(UniValue::VOBJ);

        o.push_back(Pair("txid", outpt.hash.GetHex())); // 获取输出点的交易索引
        o.push_back(Pair("vout", (int)outpt.n)); // 获取输出点的输出索引
        ret.push_back(o); // 加入结果集
    }

    return ret; // 返回结果集
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
3.获取锁定的交易输出列表。<br>
4.遍历该列表，获取每个输出点的交易索引和输出索引，加入结果集并返回。

相关加解锁函数声明在“wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    void ListLockedCoins(std::vector<COutPoint>& vOutpts); // 获取锁定的交易输出集合
    ...
};
{% endhighlight %}

实现在“wallet.cpp”文件中。

{% highlight C++ %}
void CWallet::ListLockedCoins(std::vector<COutPoint>& vOutpts)
{
    AssertLockHeld(cs_wallet); // setLockedCoins
    for (std::set<COutPoint>::iterator it = setLockedCoins.begin();
         it != setLockedCoins.end(); it++) {
        COutPoint outpt = (*it);
        vOutpts.push_back(outpt);
    }
}
{% endhighlight %}

{% highlight C++ %}
/** An outpoint - a combination of a transaction hash and an index n into its vout */
class COutPoint // 用于交易的输入 CTxIn 中，确认当前输出的来源
{
public:
    uint256 hash; // （前）一笔交易的哈希
    uint32_t n; // （前）一笔交易的索引/输出的序列号，即第 n 个输出
    ...
};
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#listlockunspent)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
