---
layout: post
title:  "比特币 RPC 命令剖析 \"getreceivedbyaccount\""
date:   2018-06-07 15:14:02 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getreceivedbyaccount "account" ( minconf )
---
## 提示说明

{% highlight shell %}
getreceivedbyaccount "account" ( minconf ) # （已过时）获取账户 `account` 下所有地址至少 `minconf` 个确认的交易接收到的总金额
{% endhighlight %}

参数：<br>
1. `account` （字符串，必备）选择的账户，默认账户使用 `""`。<br>
2. `minconf` （数字，可选，默认为 1）只包含至少 `minconf` 次确认的交易。

结果：（数字）返回该账户接收到的 BTC 总数。

## 用法示例

### 比特币核心客户端

用法一：获取默认账户下接收的至少 1 次确认的金额。

{% highlight shell %}
$ bitcoin-cli getreceivedbyaccount ""
105.009878
{% endhighlight %}

用法二：获取指定账户下接收的包含未确认的金额。

{% highlight shell %}
$ bitcoin-cli getreceivedbyaccount "tabby" 0
0
{% endhighlight %}

用法三：获取指定账户下接收的至少 6 次确认的金额，非常安全。

{% highlight shell %}
$ bitcoin-cli getreceivedbyaccount "tabby" 6
0
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getreceivedbyaccount", "params": ["", 6] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":105.009878,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getreceivedbyaccount` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getreceivedbyaccount(const UniValue& params, bool fHelp); // 获取某账户接收到的金额
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue getreceivedbyaccount(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数为 1 个或 2 个
        throw runtime_error( // 命令参数反馈
            "getreceivedbyaccount \"account\" ( minconf )\n"
            "\nDEPRECATED. Returns the total amount received by addresses with <account> in transactions with at least [minconf] confirmations.\n"
            "\nArguments:\n"
            "1. \"account\"      (string, required) The selected account, may be the default account using \"\".\n"
            "2. minconf          (numeric, optional, default=1) Only include transactions confirmed at least this many times.\n"
            "\nResult:\n"
            "amount              (numeric) The total amount in " + CURRENCY_UNIT + " received for this account.\n"
            "\nExamples:\n"
            "\nAmount received by the default account with at least 1 confirmation\n"
            + HelpExampleCli("getreceivedbyaccount", "\"\"") +
            "\nAmount received at the tabby account including unconfirmed amounts with zero confirmations\n"
            + HelpExampleCli("getreceivedbyaccount", "\"tabby\" 0") +
            "\nThe amount with at least 6 confirmation, very safe\n"
            + HelpExampleCli("getreceivedbyaccount", "\"tabby\" 6") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("getreceivedbyaccount", "\"tabby\", 6")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    // Minimum confirmations // 最小确认数
    int nMinDepth = 1; // 最小深度，默认为 1
    if (params.size() > 1)
        nMinDepth = params[1].get_int(); // 获取指定确认数作为最小深度

    // Get the set of pub keys assigned to account // 获取指定账户的公钥集合
    string strAccount = AccountFromValue(params[0]); // 获取指定账户
    set<CTxDestination> setAddress = pwalletMain->GetAccountAddresses(strAccount); // 获取指定账户的地址集合

    // Tally // 总计
    CAmount nAmount = 0;
    for (map<uint256, CWalletTx>::iterator it = pwalletMain->mapWallet.begin(); it != pwalletMain->mapWallet.end(); ++it) // 遍历钱包交易映射列表
    {
        const CWalletTx& wtx = (*it).second; // 获取钱包交易
        if (wtx.IsCoinBase() || !CheckFinalTx(wtx)) // 若为创币交易 或 非最终交易
            continue; // 跳过

        BOOST_FOREACH(const CTxOut& txout, wtx.vout) // 遍历该交易的输出列表
        {
            CTxDestination address;
            if (ExtractDestination(txout.scriptPubKey, address) && IsMine(*pwalletMain, address) && setAddress.count(address)) // 若从输出公钥脚本中提取地址 且 该地址为自己的 且 属于指定账户地址集
                if (wtx.GetDepthInMainChain() >= nMinDepth) // 且交易深度大于最小深度
                    nAmount += txout.nValue; // 累加输出的金额
        }
    }

    return (double)nAmount / (double)COIN; // 换算单位 Satoshi 为 BTC
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取最小确认数和指定账户的地址集。<br>
5.遍历钱包交易映射列表，把满足一定条件的交易的金额累加。<br>
6.把上步得到的总金额除 10^8 得到以 BTC 为单位的结果并返回。

第四步，调用 pwalletMain->GetAccountAddresses(strAccount) 函数获取指定账户的地址集，
该函数声明在“wallet/wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    std::set<CTxDestination> GetAccountAddresses(const std::string& strAccount) const; // 根据指定的账户获取相关联的地址集
    ...
};
{% endhighlight %}

实现在“wallet/wallet.cpp”文件中。

{% highlight C++ %}
std::set<CTxDestination> CWallet::GetAccountAddresses(const std::string& strAccount) const
{
    LOCK(cs_wallet); // 钱包上锁
    set<CTxDestination> result; // 交易目的地址集
    BOOST_FOREACH(const PAIRTYPE(CTxDestination, CAddressBookData)& item, mapAddressBook) // 遍历地址簿映射列表
    {
        const CTxDestination& address = item.first; // 获取目的（交易输出）地址
        const string& strName = item.second.name; // 获取账户名
        if (strName == strAccount) // 若为指定账户名
            result.insert(address); // 插入交易目的地址集
    }
    return result; // 返回地址集
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getreceivedbyaccount)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
