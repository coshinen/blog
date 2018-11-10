---
layout: post
title:  "比特币 RPC 命令剖析 \"getreceivedbyaddress\""
date:   2018-08-20 16:03:27 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getreceivedbyaddress "bitcoinaddress" ( minconf )
---
## 提示说明

{% highlight shell %}
getreceivedbyaddress "bitcoinaddress" ( minconf ) # 获取给定比特币地址交易中至少 minconf 次确认接收到的总金额
{% endhighlight %}

参数：<br>
1.bitcoinaddress（字符串，必备）交易的比特币地址。<br>
2.minconf（数字，可选，默认为 1）只包含至少 minconf 次确认的交易。

结果：（数字）该地址接收到的 BTC 总数。

## 用法示例

### 比特币核心客户端

用法一：获取指定地址下接收的至少 1 次确认的金额。

{% highlight shell %}
$ bitcoin-cli getreceivedbyaccount "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ"
0
{% endhighlight %}

用法二：获取指定地址下接收的包含未确认的金额。

{% highlight shell %}
$ bitcoin-cli getreceivedbyaccount "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ" 0
0
{% endhighlight %}

用法三：获取指定地址下接收的至少 6 次确认的金额，非常安全。

{% highlight shell %}
$ bitcoin-cli getreceivedbyaccount "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ" 6
0
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getreceivedbyaddress", "params": ["1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ", 6] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":0,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
getreceivedbyaddress 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getreceivedbyaddress(const UniValue& params, bool fHelp); // 获取某地址接收到的金额
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue getreceivedbyaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数为 1 或 2 个
        throw runtime_error( // 命令帮助反馈
            "getreceivedbyaddress \"bitcoinaddress\" ( minconf )\n"
            "\nReturns the total amount received by the given bitcoinaddress in transactions with at least minconf confirmations.\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"  (string, required) The bitcoin address for transactions.\n"
            "2. minconf             (numeric, optional, default=1) Only include transactions confirmed at least this many times.\n"
            "\nResult:\n"
            "amount   (numeric) The total amount in " + CURRENCY_UNIT + " received at this address.\n"
            "\nExamples:\n"
            "\nThe amount from transactions with at least 1 confirmation\n"
            + HelpExampleCli("getreceivedbyaddress", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\"") +
            "\nThe amount including unconfirmed transactions, zero confirmations\n"
            + HelpExampleCli("getreceivedbyaddress", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\" 0") +
            "\nThe amount with at least 6 confirmation, very safe\n"
            + HelpExampleCli("getreceivedbyaddress", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\" 6") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("getreceivedbyaddress", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\", 6")
       );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    // Bitcoin address
    CBitcoinAddress address = CBitcoinAddress(params[0].get_str()); // 获取指定的比特币地址
    if (!address.IsValid()) // 判断该地址是否有效
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address");
    CScript scriptPubKey = GetScriptForDestination(address.Get()); // 获取公钥脚本
    if (!IsMine(*pwalletMain,scriptPubKey)) // 检查是否属于自己
        return (double)0.0;

    // Minimum confirmations // 最小确认数
    int nMinDepth = 1; // 最小深度，默认为 1
    if (params.size() > 1)
        nMinDepth = params[1].get_int(); // 获取指定的确认数

    // Tally // 总计
    CAmount nAmount = 0;
    for (map<uint256, CWalletTx>::iterator it = pwalletMain->mapWallet.begin(); it != pwalletMain->mapWallet.end(); ++it) // 遍历钱包交易映射列表
    {
        const CWalletTx& wtx = (*it).second; // 获取钱包交易
        if (wtx.IsCoinBase() || !CheckFinalTx(wtx)) // 若为创币交易 或 非最后一笔交易
            continue; // 跳过

        BOOST_FOREACH(const CTxOut& txout, wtx.vout) // 遍历交易输出列表
            if (txout.scriptPubKey == scriptPubKey) // 若输出脚本为指定地址的公钥脚本
                if (wtx.GetDepthInMainChain() >= nMinDepth) // 且交易深度大于等于最小深度
                    nAmount += txout.nValue; // 累加交易金额
    }

    return  ValueFromAmount(nAmount); // 这里直接格式化 Satoshi 返回
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取最小确认数和指定比特币地址并验证该地址是否属于自己。<br>
5.遍历钱包交易映射列表，把满足一定条件的交易的金额累加。<br>
6.把上步得到的总金额格式化并验证后返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getreceivedbyaddress)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
