---
layout: post
title:  "比特币 RPC 命令剖析 \"listlockunspent\""
date:   2018-09-04 17:46:53 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli listlockunspent
---
## 提示说明

{% highlight shell %}
listlockunspent # 获取暂时不能花费（锁定的）交易输出列表
{% endhighlight %}

查看 [lockunspent](/blog/2018/06/bitcoin-rpc-command-lockunspent.html) 加解锁未花费的交易输出。

结果：<br>
{% highlight shell %}
[
  {
    "txid" : "transactionid",     （字符串）锁定的交易索引
    "vout" : n                      （数字）输出序号
  }
  ,...
]
{% endhighlight %}

## 用法示例

### 比特币核心客户端

1. 使用 [listunspent](/blog/2018/06/bitcoin-rpc-command-listunspent.html) 获取一笔未花费的交易输出。<br>
2. 使用 [lockunspent](/blog/2018/06/bitcoin-rpc-command-lockunspent.html) 锁定该为花费交易输出。<br>
3. 使用该命令查看锁定的未花费交易输出列表。

{% highlight shell %}
$ bitcoin-cli listunspent
[
  ...
  {
    "txid": "8d71b6c01c1a3710e1d7d2cfd7aeb827a0e0150579a9840b9ba51bf7a13d8aff",
    "vout": 0,
    "address": "1Z99Lsij11ajDEhipZbnifdFkBu8fC1Hb",
    "scriptPubKey": "21023d2f5ddafe8a161867bb9a9162aa5c84b0882af4bfca1fa89f4811b651761f10ac",
    "amount": 50.00000000,
    "confirmations": 6631,
    "spendable": true
  }
]
$ bitcoin-cli lockunspent false "[{\"txid\":\"8d71b6c01c1a3710e1d7d2cfd7aeb827a0e0150579a9840b9ba51bf7a13d8aff\",\"vout\":0}]"
true
$ bitcoin-cli listlockunspent
[
  {
    "txid": "8d71b6c01c1a3710e1d7d2cfd7aeb827a0e0150579a9840b9ba51bf7a13d8aff",
    "vout": 0
  }
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listlockunspent", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":[{"txid":"8d71b6c01c1a3710e1d7d2cfd7aeb827a0e0150579a9840b9ba51bf7a13d8aff","vout":0}],"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
listlockunspent 对应的函数在“rpcserver.h”文件中被引用。

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
4.获取锁定的交易输出列表。<br>
5.遍历该列表，获取每个输出点的交易索引和输出索引，加入结果集并返回。

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
