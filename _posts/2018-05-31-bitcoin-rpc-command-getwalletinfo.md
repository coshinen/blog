---
layout: post
title:  "比特币 RPC 命令剖析 \"getwalletinfo\""
date:   2018-05-31 11:25:12 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getwalletinfo
---
## 提示说明

{% highlight shell %}
getwalletinfo # 获取一个包含各种钱包状态信息的对象
{% endhighlight %}

结果：<br>
{% highlight shell %}
{
  "walletversion": xxxxx,     （数字）钱包版本
  "balance": xxxxxxx,         （数字）钱包中以 BTC 为单位已确认的总余额
  "unconfirmed_balance": xxx, （数字）钱包中以 BTC 为单位未确认的总余额
  "immature_balance": xxxxxx, （数字）钱包中以 BTC 为单位未成熟的总余额
  "txcount": xxxxxxx,         （数字）钱包中交易总数
  "keypoololdest": xxxxxx,    （数字）密钥池中最早预生成密钥（从格林尼治时间开始以秒为单位）的时间戳
  "keypoolsize": xxxx,        （数字）预生成密钥的数量
  "unlocked_until": ttt,      （数字）从格林尼治时间（1970-01-01 00:00:00）开始以秒为单位钱包用于转账的解锁截止时间戳，若钱包锁定则为 0
  "paytxfee": x.xxxx,         （数字）交易费配置，以 BTC/kB 为单位
}
{% endhighlight %}

## 用法示例

### 比特币核心客户端

获取钱包信息。

{% highlight shell %}
$ bitcoin-cli getwalletinfo
{
  "walletversion": 60000,
  "balance": 117697.01429440,
  "unconfirmed_balance": 0.00000000,
  "immature_balance": 0.00000000,
  "txcount": 2413,
  "keypoololdest": 1530153420,
  "keypoolsize": 92,
  "unlocked_until": 0,
  "paytxfee": 0.00000000
}
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getwalletinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":{"walletversion":60000,"balance":117697.01429440,"unconfirmed_balance":0.00000000,"immature_balance":0.00000000,"txcount":2413,"keypoololdest":1530153420,"keypoolsize":92,"unlocked_until":0,"paytxfee":0.00000000},"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getwalletinfo` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getwalletinfo(const UniValue& params, bool fHelp); // 获取钱包信息
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue getwalletinfo(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保钱包当前可用
        return NullUniValue;
    
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "getwalletinfo\n"
            "Returns an object containing various wallet state info.\n"
            "\nResult:\n"
            "{\n"
            "  \"walletversion\": xxxxx,     (numeric) the wallet version\n"
            "  \"balance\": xxxxxxx,         (numeric) the total confirmed balance of the wallet in " + CURRENCY_UNIT + "\n"
            "  \"unconfirmed_balance\": xxx, (numeric) the total unconfirmed balance of the wallet in " + CURRENCY_UNIT + "\n"
            "  \"immature_balance\": xxxxxx, (numeric) the total immature balance of the wallet in " + CURRENCY_UNIT + "\n"
            "  \"txcount\": xxxxxxx,         (numeric) the total number of transactions in the wallet\n"
            "  \"keypoololdest\": xxxxxx,    (numeric) the timestamp (seconds since GMT epoch) of the oldest pre-generated key in the key pool\n"
            "  \"keypoolsize\": xxxx,        (numeric) how many new keys are pre-generated\n"
            "  \"unlocked_until\": ttt,      (numeric) the timestamp in seconds since epoch (midnight Jan 1 1970 GMT) that the wallet is unlocked for transfers, or 0 if the wallet is locked\n"
            "  \"paytxfee\": x.xxxx,         (numeric) the transaction fee configuration, set in " + CURRENCY_UNIT + "/kB\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("getwalletinfo", "")
            + HelpExampleRpc("getwalletinfo", "")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    UniValue obj(UniValue::VOBJ); // 创建目标类型对象
    obj.push_back(Pair("walletversion", pwalletMain->GetVersion())); // 钱包版本
    obj.push_back(Pair("balance",       ValueFromAmount(pwalletMain->GetBalance()))); // 钱包余额（可用，已确认，已成熟）
    obj.push_back(Pair("unconfirmed_balance", ValueFromAmount(pwalletMain->GetUnconfirmedBalance()))); // 未确认余额
    obj.push_back(Pair("immature_balance",    ValueFromAmount(pwalletMain->GetImmatureBalance()))); // 未成熟余额
    obj.push_back(Pair("txcount",       (int)pwalletMain->mapWallet.size())); // 该钱包内的交易数
    obj.push_back(Pair("keypoololdest", pwalletMain->GetOldestKeyPoolTime())); // 密钥池最早的密钥创建时间
    obj.push_back(Pair("keypoolsize",   (int)pwalletMain->GetKeyPoolSize())); // 密钥池大小
    if (pwalletMain->IsCrypted()) // 若钱包已加密
        obj.push_back(Pair("unlocked_until", nWalletUnlockTime)); // 解锁过期时间
    obj.push_back(Pair("paytxfee",      ValueFromAmount(payTxFee.GetFeePerK()))); // 交易费
    return obj; // 返回结果
}
{% endhighlight %}

基本流程：<br>
1.确保当前钱包可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.创建返回对象，追加相关的钱包状态信息并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getwalletinfo)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
