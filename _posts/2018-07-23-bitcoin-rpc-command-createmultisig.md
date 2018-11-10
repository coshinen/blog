---
layout: post
title:  "比特币 RPC 命令剖析 \"createmultisig\""
date:   2018-07-23 10:48:50 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli createmultisig urequired ["key",...]
---
## 提示说明

{% highlight shell %}
createmultisig urequired ["key",...] # 创建一个需要 m 个密钥的 n 个签名的多重签名地址
{% endhighlight %}

参数：<br>
1.nrequired（数字，必备）n 个密钥或地址所需的签名数量。<br>
2.keys（字符串，必备）一个比特币地址或 16 进制编码的公钥的 json 数组。
{% highlight shell %}
     [
       "key"    （字符串）比特币地址或 16 进制编码的公钥
       ,...
     ]
{% endhighlight %}

结果：返回一个带有地址和赎回脚本的 json 对象。<br>
{% highlight shell %}
{
  "address":"multisigaddress",  （字符串）新的多签地址值
  "redeemScript":"script"       （字符串）16 进制编码的赎回脚本的字符串值
}
{% endhighlight %}

## 用法示例

### 比特币核心客户端

从 2 个地址创建一个需要 2 个签名的多签地址。

{% highlight shell %}
$ bitcoin-cli getnewaddress
16vpmdSDaX3Nv9UMuk2vSecMrdstjjSP4R
$ bitcoin-cli getnewaddress
1KfU9yv17ZSqMiX96hMDjys2oU2EBMrT9n
$ bitcoin-cli createmultisig 2 "[\"16vpmdSDaX3Nv9UMuk2vSecMrdstjjSP4R\",\"1KfU9yv17ZSqMiX96hMDjys2oU2EBMrT9n\"]"
{
  "address": "3B3ozHj9C7b9nXRypCWJg7s5AdDphUsqHA",
  "redeemScript": "522103da146818f8f3edb975287c53a0de7bd9066153be0818ce1c8fa996e83cd76fca2103abe35a69e0a8eb5e0cb2468b37418e9b9c44d25310a4c3815e3347849c4094c952ae"
}
{% endhighlight %}

### cURL

{% highlight shell %}
暂无。
{% endhighlight %}

## 源码剖析
createmultisig 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue createmultisig(const UniValue& params, bool fHelp); // 创建多重签名
{% endhighlight %}

实现在“rpcmisc.cpp”文件中。

{% highlight C++ %}
UniValue createmultisig(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 2 || params.size() > 2) // 参数必须为 2 个
    { // 命令帮助反馈
        string msg = "createmultisig nrequired [\"key\",...]\n"
            "\nCreates a multi-signature address with n signature of m keys required.\n"
            "It returns a json object with the address and redeemScript.\n"

            "\nArguments:\n"
            "1. nrequired      (numeric, required) The number of required signatures out of the n keys or addresses.\n"
            "2. \"keys\"       (string, required) A json array of keys which are bitcoin addresses or hex-encoded public keys\n"
            "     [\n"
            "       \"key\"    (string) bitcoin address or hex-encoded public key\n"
            "       ,...\n"
            "     ]\n"

            "\nResult:\n"
            "{\n"
            "  \"address\":\"multisigaddress\",  (string) The value of the new multisig address.\n"
            "  \"redeemScript\":\"script\"       (string) The string value of the hex-encoded redemption script.\n"
            "}\n"

            "\nExamples:\n"
            "\nCreate a multisig address from 2 addresses\n"
            + HelpExampleCli("createmultisig", "2 \"[\\\"16sSauSf5pF2UkUwvKGq4qjNRzBZYqgEL5\\\",\\\"171sgjn4YtPu27adkKGrdDwzRTxnRkBfKV\\\"]\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("createmultisig", "2, \"[\\\"16sSauSf5pF2UkUwvKGq4qjNRzBZYqgEL5\\\",\\\"171sgjn4YtPu27adkKGrdDwzRTxnRkBfKV\\\"]\"")
        ;
        throw runtime_error(msg);
    }

    // Construct using pay-to-script-hash: // 使用 P2SH 进行构建
    CScript inner = _createmultisig_redeemScript(params); // 创建多签赎回脚本
    CScriptID innerID(inner); // 获取脚本索引
    CBitcoinAddress address(innerID); // 获取比特币地址

    UniValue result(UniValue::VOBJ); // 目标对象
    result.push_back(Pair("address", address.ToString())); // 地址
    result.push_back(Pair("redeemScript", HexStr(inner.begin(), inner.end()))); // 赎回脚本

    return result; // 返回结果
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.创建多钱赎回脚本。<br>
3.通过脚本获取脚本索引。<br>
4.通过脚本索引获取比特币地址。<br>
5.添加地址或赎回脚本到结果对象并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#createmultisig)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
