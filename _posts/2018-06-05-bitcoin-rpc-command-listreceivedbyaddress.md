---
layout: post
title:  "比特币 RPC 命令剖析 \"listreceivedbyaddress\""
date:   2018-06-05 10:23:32 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin bitcoin-cli commands
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
1. `minconf` （数字，可选，默认为 1）在被包含到付款前的最低确认数。<br>
2. `includeempty` （布尔型，可选，默认为 false）是否包括还未收到任何付款的地址。<br>
3. `includeWatchonly` （布尔型，可选，默认为 false）是否包含 watchonly 地址（见 [`importaddress`](/2018/06/07/bitcoin-rpc-command-importaddress)）。

结果：<br>
{% highlight shell %}
[
  {
    "involvesWatchonly" : true,        （布尔型）若被导入的地址包含交易中则只返回此项
    "address" : "receivingaddress",  （字符串）接收地址
    "account" : "accountname",       （字符串，已过时）接收地址的帐户名。默认帐户是 ""。
    "amount" : x.xxx,                  （数字）通过该地址接受的以 BTC 为单位的总金额
    "confirmations" : n,               （数字）包含最近交易的确认数
    "label" : "label"                （字符串）地址/交易的备注，若有的话
  }
  ,...
]
{% endhighlight %}

## 用法示例

### 比特币核心客户端

用法一：列出全部接收到付款的地址信息。

{% highlight shell %}
$ bitcoin-cli listreceivedbyaddress
[
  ...
  {
    "address": "1Pd97Ru8KYJCgovZzPNYi3VDkXmLQZbtKx",
    "account": "",
    "amount": 3.00000000,
    "confirmations": 6185,
    "label": "",
    "txids": [
      "6e54ab6ac385e19fa4eea08fa985db00512a7084c83a4419179240ce17ee1244", 
      "58ae3bdc2d76457e3e536e7bac3238383b9f1e048feb86f5164aab39ceeac853"
    ]
  }
]
{% endhighlight %}

用法二：列出至少 6 个确认，且包含未收到付款的地址信息。

{% highlight shell %}
$ bitcoin-cli listreceivedbyaddress 6 true
[
  ...
  {
    "address": "1Pd97Ru8KYJCgovZzPNYi3VDkXmLQZbtKx",
    "account": "",
    "amount": 3.00000000,
    "confirmations": 6189,
    "label": "",
    "txids": [
      "6e54ab6ac385e19fa4eea08fa985db00512a7084c83a4419179240ce17ee1244", 
      "58ae3bdc2d76457e3e536e7bac3238383b9f1e048feb86f5164aab39ceeac853"
    ]
  }, 
  {
    "address": "36cQfr8uciR5svcX5Ge3H3XuWiXTrbtAGQ",
    "account": "",
    "amount": 0.00000000,
    "confirmations": 0,
    "label": "",
    "txids": [
    ]
  }
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listreceivedbyaddress", "params": [6, true, true] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":[{"address":"36cQfr8uciR5svcX5Ge3H3XuWiXTrbtAGQ","account":"","amount":0.00000000,"confirmations":0,"label":"","txids":[]}],"error":null,"id":"curltest"}
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
