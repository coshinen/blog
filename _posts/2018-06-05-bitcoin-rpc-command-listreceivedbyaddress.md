---
layout: post
title:  "比特币 RPC 命令剖析 \"listreceivedbyaddress\""
date:   2018-06-05 10:23:32 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
listreceivedbyaddress ( minconf includeempty includeWatchonly ) # 列出接收地址余额
{% endhighlight %}

参数：<br>
1. `minconf` （数字型，可选，默认为 1）在包含付款前的最低确认数。<br>
2. `includeempty` （布尔型，可选，默认为 false）是否包括还未收到任何付款的账户。<br>
3. `includeWatchonly` （布尔型，可选，默认为 false）是否包含 watchonly 地址（见 [`importaddress`]()）。

结果：<br>
{% highlight shell %}
[
  {
    "involvesWatchonly" : true,        (bool) Only returned if imported addresses were involved in transaction
    "address" : "receivingaddress",  (string) The receiving address
    "account" : "accountname",       (string) DEPRECATED. The account of the receiving address. The default account is "".
    "amount" : x.xxx,                  (numeric) The total amount in BTC received by the address
    "confirmations" : n,               (numeric) The number of confirmations of the most recent transaction included
    "label" : "label"                (string) A comment for the address/transaction, if any
  }
  ,...
]
{% endhighlight %}

## 用法示例

{% highlight shell %}
$ bitcoin-cli listreceivedbyaddress
[
  {
    "address": "1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk",
    "account": "",
    "amount": 51.10000000,
    "confirmations": 12315,
    "label": "",
    "txids": [
      "0774341b8acca3129f4df467bac81e4bf325899b7604090d9b526ab969b52b00", 
      "ab8021f615021384fa4f5cf3c1a7f97d832a9fcc72d766e748b8c741332af201", 
    ]
  }
]
{% endhighlight %}

## 源码剖析
`listreceivedbyaddress` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue listreceivedbyaddress(const UniValue& params, bool fHelp); // 列出地址余额
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue listreceivedbyaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 3) // 参数最多为 3 个
        throw runtime_error( // 命令帮助反馈
            "listreceivedbyaddress ( minconf includeempty includeWatchonly)\n"
            "\nList balances by receiving address.\n"
            "\nArguments:\n"
            "1. minconf       (numeric, optional, default=1) The minimum number of confirmations before payments are included.\n"
            "2. includeempty  (numeric, optional, default=false) Whether to include addresses that haven't received any payments.\n"
            "3. includeWatchonly (bool, optional, default=false) Whether to include watchonly addresses (see 'importaddress').\n"

            "\nResult:\n"
            "[\n"
            "  {\n"
            "    \"involvesWatchonly\" : true,        (bool) Only returned if imported addresses were involved in transaction\n"
            "    \"address\" : \"receivingaddress\",  (string) The receiving address\n"
            "    \"account\" : \"accountname\",       (string) DEPRECATED. The account of the receiving address. The default account is \"\".\n"
            "    \"amount\" : x.xxx,                  (numeric) The total amount in " + CURRENCY_UNIT + " received by the address\n"
            "    \"confirmations\" : n,               (numeric) The number of confirmations of the most recent transaction included\n"
            "    \"label\" : \"label\"                (string) A comment for the address/transaction, if any\n"
            "  }\n"
            "  ,...\n"
            "]\n"

            "\nExamples:\n"
            + HelpExampleCli("listreceivedbyaddress", "")
            + HelpExampleCli("listreceivedbyaddress", "6 true")
            + HelpExampleRpc("listreceivedbyaddress", "6, true, true")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    return ListReceived(params, false); // 获取接收金额列表并返回
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.列出各账户余额并返回。

第四步，调用 ListReceived(params, false) 函数获取接收地址余额信息列表并返回，见 [`listreceivedbyaccount`](/2018/06/05/bitcoin-rpc-command-listreceivedbyaccount)。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#listreceivedbyaddress)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
