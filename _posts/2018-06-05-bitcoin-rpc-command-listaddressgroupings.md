---
layout: post
title:  "比特币 RPC 命令剖析 \"listaddressgroupings\""
date:   2018-06-05 11:32:59 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
listaddressgroupings # 列出作为输入公开使用的公共所有权或过去交易导致找零的地址分组
{% endhighlight %}

结果：<br>
{% highlight shell %}
[
  [
    [
      "bitcoinaddress",     （字符串）比特币地址
      amount,                 （数字）以 BTC 为单位的金额
      "account"             （字符串，可选，已过时）账户
    ]
    ,...
  ]
  ,...
]
{% endhighlight %}

## 用法示例

### 比特币核心客户端

获取核心服务器上钱包中地址分组（地址，余额，账户），包含找零地址。

{% highlight shell %}
$ bitcoin-cli listaddressgroupings
[
  [
    [
      "1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk", 
      300.00000000, 
      ""
    ]
  ]
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listaddressgroupings", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":[[["1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk", 300.00000000, ""]]],"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`listaddressgroupings` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue listaddressgroupings(const UniValue& params, bool fHelp); // 列出地址分组
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue listaddressgroupings(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp) // 没有参数
        throw runtime_error( // 命令帮助反馈
            "listaddressgroupings\n"
            "\nLists groups of addresses which have had their common ownership\n"
            "made public by common use as inputs or as the resulting change\n"
            "in past transactions\n"
            "\nResult:\n"
            "[\n"
            "  [\n"
            "    [\n"
            "      \"bitcoinaddress\",     (string) The bitcoin address\n"
            "      amount,                 (numeric) The amount in " + CURRENCY_UNIT + "\n"
            "      \"account\"             (string, optional) The account (DEPRECATED)\n"
            "    ]\n"
            "    ,...\n"
            "  ]\n"
            "  ,...\n"
            "]\n"
            "\nExamples:\n"
            + HelpExampleCli("listaddressgroupings", "")
            + HelpExampleRpc("listaddressgroupings", "")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    UniValue jsonGroupings(UniValue::VARR); // 创建数组类型结果对象
    map<CTxDestination, CAmount> balances = pwalletMain->GetAddressBalances(); // 获取地址余额映射列表
    BOOST_FOREACH(set<CTxDestination> grouping, pwalletMain->GetAddressGroupings()) // 遍历地址分组集合
    {
        UniValue jsonGrouping(UniValue::VARR);
        BOOST_FOREACH(CTxDestination address, grouping) // 遍历一个地址分组
        {
            UniValue addressInfo(UniValue::VARR);
            addressInfo.push_back(CBitcoinAddress(address).ToString()); // 获取地址
            addressInfo.push_back(ValueFromAmount(balances[address])); // 获取地址余额
            {
                if (pwalletMain->mapAddressBook.find(CBitcoinAddress(address).Get()) != pwalletMain->mapAddressBook.end()) // 若在地址簿中找到该地址
                    addressInfo.push_back(pwalletMain->mapAddressBook.find(CBitcoinAddress(address).Get())->second.name); // 把该地址关联的账户名加入地址信息
            }
            jsonGrouping.push_back(addressInfo);
        }
        jsonGroupings.push_back(jsonGrouping);
    }
    return jsonGroupings; // 返回结果集
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.遍历地址分组集合，获取每个地址，把相关信息加入结果集并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#listaddressgroupings)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
