---
layout: post
title:  "比特币 RPC 命令剖析 \"getbalance\""
date:   2018-06-04 11:42:32 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getbalance ( "account" minconf includeWatchonly )
---
## 提示说明

{% highlight shell %}
getbalance ( "account" minconf includeWatchonly ) # 获取钱包余额
{% endhighlight %}

如果未指定账户，返回服务器钱包总可用余额。<br>
如果指定了账户（已过时），返回账户的余额。<br>
**注：默认账户 "" 与没有参数不同。服务器钱包总余额可能与默认账户 "" 余额不同。**

参数：<br>
1. account （字符串，可选，已过时）选择的账户，或 * 表示整个钱包。可能是默认账户 ""。<br>
2. minconf （数字，可选，默认为 1）。只包含至少确认 minconf 次的交易。<br>
3. includeWatchonly （布尔型，可选，默认为 false）也包括包含在 watchonly 地址中的余额（参阅 [importaddress](/blog/2018/06/bitcoin-rpc-command-importaddress.html)）。

结果：（数字）返回该账户收到的 BTC 的总金额。

## 用法示例

### 比特币核心客户端

用法一：获取当前整个钱包的余额。

{% highlight shell %}
$ bitcoin-cli getbalance
0.00000000
{% endhighlight %}

用法二：获取当前整个钱包的余额，结果同上。

{% highlight shell %}
$ bitcoin-cli getbalance * 1 true
0.00000000
{% endhighlight %}

用法三：获取当前整个钱包至少确认 6 次交易的余额。

{% highlight shell %}
$ bitcoin-cli getbalance * 6
0.00000000
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getbalance", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":0.00000000,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
getbalance 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getbalance(const UniValue& params, bool fHelp); // 获取余额
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue getbalance(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 3) // 参数最多为 3 个
        throw runtime_error( // 命令帮助反馈
            "getbalance ( \"account\" minconf includeWatchonly )\n"
            "\nIf account is not specified, returns the server's total available balance.\n"
            "If account is specified (DEPRECATED), returns the balance in the account.\n"
            "Note that the account \"\" is not the same as leaving the parameter out.\n"
            "The server total may be different to the balance in the default \"\" account.\n"
            "\nArguments:\n"
            "1. \"account\"      (string, optional) DEPRECATED. The selected account, or \"*\" for entire wallet. It may be the default account using \"\".\n"
            "2. minconf          (numeric, optional, default=1) Only include transactions confirmed at least this many times.\n"
            "3. includeWatchonly (bool, optional, default=false) Also include balance in watchonly addresses (see 'importaddress')\n"
            "\nResult:\n"
            "amount              (numeric) The total amount in " + CURRENCY_UNIT + " received for this account.\n"
            "\nExamples:\n"
            "\nThe total amount in the wallet\n"
            + HelpExampleCli("getbalance", "") +
            "\nThe total amount in the wallet at least 5 blocks confirmed\n"
            + HelpExampleCli("getbalance", "\"*\" 6") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("getbalance", "\"*\", 6")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    if (params.size() == 0) // 若无参数
        return  ValueFromAmount(pwalletMain->GetBalance()); // 直接返回当前整个钱包的余额

    int nMinDepth = 1; // 最小深度，默认为 1
    if (params.size() > 1)
        nMinDepth = params[1].get_int(); // 获取最小深度
    isminefilter filter = ISMINE_SPENDABLE; // ismine 过滤器
    if(params.size() > 2)
        if(params[2].get_bool())
            filter = filter | ISMINE_WATCH_ONLY; // 获取 watchonly

    if (params[0].get_str() == "*") { // 若指定账户名为 "*"
        // Calculate total balance a different way from GetBalance() // 以不同于 GetBalance() 的方式计算总余额
        // (GetBalance() sums up all unspent TxOuts) // （GetBalance() 总计全部未花费的输出）
        // getbalance and "getbalance * 1 true" should return the same number // getbalance 和 "getbalance * 1 true" 应该返回相同的数字
        CAmount nBalance = 0;
        for (map<uint256, CWalletTx>::iterator it = pwalletMain->mapWallet.begin(); it != pwalletMain->mapWallet.end(); ++it)
        { // 遍历钱包交易映射列表
            const CWalletTx& wtx = (*it).second; // 获取钱包交易
            if (!CheckFinalTx(wtx) || wtx.GetBlocksToMaturity() > 0 || wtx.GetDepthInMainChain() < 0) // 检测是否为最终交易 或 未成熟 或 所在链深度小于 0
                continue; // 跳过

            CAmount allFee;
            string strSentAccount;
            list<COutputEntry> listReceived; // 接收列表
            list<COutputEntry> listSent; // 发送列表
            wtx.GetAmounts(listReceived, listSent, allFee, strSentAccount, filter); // 获取相应的金额
            if (wtx.GetDepthInMainChain() >= nMinDepth) // 该交易在链上的深度大于等于最小深度
            {
                BOOST_FOREACH(const COutputEntry& r, listReceived) // 遍历接收列表
                    nBalance += r.amount; // 累加金额
            }
            BOOST_FOREACH(const COutputEntry& s, listSent) // 遍历发送列表
                nBalance -= s.amount; // 减去花费的金额
            nBalance -= allFee; // 减去交易费
        }
        return  ValueFromAmount(nBalance); // 得到钱包总余额并返回
    }

    string strAccount = AccountFromValue(params[0]); // 获取指定的账户名

    CAmount nBalance = GetAccountBalance(strAccount, nMinDepth, filter); // 获取账户余额

    return ValueFromAmount(nBalance); // 返回账户余额
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.若无参数，直接获取钱包总余额并返回。<br>
5.若指定了参数，处理相应的参数。<br>
6.若指定的账户为 "*"，以不同于 4 的方式获取钱包总余额并返回。<br>
7.若指定的账户非 "*"，获取指定账户下的余额并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getbalance)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
