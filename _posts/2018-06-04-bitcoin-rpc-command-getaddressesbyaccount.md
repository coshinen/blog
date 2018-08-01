---
layout: post
title:  "比特币 RPC 命令剖析 \"getaddressesbyaccount\""
date:   2018-06-04 11:07:06 +0800
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
getaddressesbyaccount "account" # （已过时）获取指定账户的地址列表
{% endhighlight %}

参数：<br>
1. `account` （字符串，必备）账户名。

结果：
{% highlight shell %}
[                     （json 字符串数组）
  "bitcoinaddress"  （字符串）一个关联给定账户的比特币地址
  ,...
]
{% endhighlight %}

## 用法示例

### 比特币核心客户端

获取账户 "tabby" 下的所有地址。

{% highlight shell %}
$ bitcoin-cli getaddressesbyaccount "tabby"
[
  "1N7xDfRbkVwa2Co8q1KbDCVEr9rg8VWsfW", 
  "1QKe82sDGtbBRp1ymRqG5XXFzJCfjUmpsi",
  ...
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddressesbyaccount", "params": ["tabby"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":["1N7xDfRbkVwa2Co8q1KbDCVEr9rg8VWsfW","1QKe82sDGtbBRp1ymRqG5XXFzJCfjUmpsi"],"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getaddressesbyaccount` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getaddressesbyaccount(const UniValue& params, bool fHelp); // 获取账户下的所有地址
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue getaddressesbyaccount(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令参数反馈
            "getaddressesbyaccount \"account\"\n"
            "\nDEPRECATED. Returns the list of addresses for the given account.\n"
            "\nArguments:\n"
            "1. \"account\"  (string, required) The account name.\n"
            "\nResult:\n"
            "[                     (json array of string)\n"
            "  \"bitcoinaddress\"  (string) a bitcoin address associated with the given account\n"
            "  ,...\n"
            "]\n"
            "\nExamples:\n"
            + HelpExampleCli("getaddressesbyaccount", "\"tabby\"")
            + HelpExampleRpc("getaddressesbyaccount", "\"tabby\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    string strAccount = AccountFromValue(params[0]); // 获取指定账户名

    // Find all addresses that have the given account // 查找基于给定帐户名的所有地址
    UniValue ret(UniValue::VARR); // 创建数组类型的结果对象
    BOOST_FOREACH(const PAIRTYPE(CBitcoinAddress, CAddressBookData)& item, pwalletMain->mapAddressBook)
    { // 遍历地址簿
        const CBitcoinAddress& address = item.first; // 获取比特币地址
        const string& strName = item.second.name; // 获取账户名
        if (strName == strAccount) // 若与指定帐户名相同
            ret.push_back(address.ToString()); // 把该地址加入结果集
    }
    return ret; // 返回结果对象
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定账户，账户名不能为 `*`。<br>
5.遍历地址簿，把与指定账户相同的地址加入结果集。<br>
6.返回结果集。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getaddressesbyaccount)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
