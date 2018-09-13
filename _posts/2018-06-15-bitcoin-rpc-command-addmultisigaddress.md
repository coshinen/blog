---
layout: post
title:  "比特币 RPC 命令剖析 \"addmultisigaddress\""
date:   2018-06-15 11:32:23 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli addmultisigaddress urequired ["key",...] ( "account" )
---
## 提示说明

{% highlight shell %}
addmultisigaddress urequired ["key",...] ( "account" ) # 添加一个需要 nrequired 个签名的多重签名地址到钱包
{% endhighlight %}

**每个密钥都是一个比特币地址或 16 进制编码公钥。<br>
如果指定了账户（已过时），则分配地址到该账户。**

参数：<br>
1.nrequired （数字，必备）n 个密钥或地址所需的签名数量。<br>
2.keysobject （字符串，必备）一个比特币地址或 16 进制编码公钥的 json 数组。
{% highlight shell %}
     [
       "key"    （字符串）比特币地址或 16 进制编码的公钥
       ,...
     ]
{% endhighlight %}
3.account （字符串，可选，已过时）分配地址到该账户。

结果：（字符串）返回一个关联密钥的比特币地址（base58 编码的脚本索引）。<br>

## 用法示例

### 比特币核心客户端

{% highlight shell %}
$ bitcoin-cli getnewaddress
1Ge7nrPf46ynNkzASjFxAtxim5qRJG3CVB
$ bitcoin-cli getnewaddress
1GdZoU57JSNfPzRcecLw182zPEE4DNwSL1
$ bitcoin-cli addmultisigaddress 2 "[\"1Ge7nrPf46ynNkzASjFxAtxim5qRJG3CVB\",\"1GdZoU57JSNfPzRcecLw182zPEE4DNwSL1\"]"
36cQfr8uciR5svcX5Ge3H3XuWiXTrbtAGQ
{% endhighlight %}

### cURL

{% highlight shell %}
暂无。
{% endhighlight %}

## 源码剖析
addmultisigaddress 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue addmultisigaddress(const UniValue& params, bool fHelp); // 添加多重签名地址
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue addmultisigaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 2 || params.size() > 3) // 参数为 2 或 3 个
    { // 命令帮助反馈
        string msg = "addmultisigaddress nrequired [\"key\",...] ( \"account\" )\n"
            "\nAdd a nrequired-to-sign multisignature address to the wallet.\n"
            "Each key is a Bitcoin address or hex-encoded public key.\n"
            "If 'account' is specified (DEPRECATED), assign address to that account.\n"

            "\nArguments:\n"
            "1. nrequired        (numeric, required) The number of required signatures out of the n keys or addresses.\n"
            "2. \"keysobject\"   (string, required) A json array of bitcoin addresses or hex-encoded public keys\n"
            "     [\n"
            "       \"address\"  (string) bitcoin address or hex-encoded public key\n"
            "       ...,\n"
            "     ]\n"
            "3. \"account\"      (string, optional) DEPRECATED. An account to assign the addresses to.\n"

            "\nResult:\n"
            "\"bitcoinaddress\"  (string) A bitcoin address associated with the keys.\n"

            "\nExamples:\n"
            "\nAdd a multisig address from 2 addresses\n"
            + HelpExampleCli("addmultisigaddress", "2 \"[\\\"16sSauSf5pF2UkUwvKGq4qjNRzBZYqgEL5\\\",\\\"171sgjn4YtPu27adkKGrdDwzRTxnRkBfKV\\\"]\"") +
            "\nAs json rpc call\n"
            + HelpExampleRpc("addmultisigaddress", "2, \"[\\\"16sSauSf5pF2UkUwvKGq4qjNRzBZYqgEL5\\\",\\\"171sgjn4YtPu27adkKGrdDwzRTxnRkBfKV\\\"]\"")
        ;
        throw runtime_error(msg);
    }

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    string strAccount;
    if (params.size() > 2)
        strAccount = AccountFromValue(params[2]); // 获取指定账户名

    // Construct using pay-to-script-hash: // 使用 P2SH 构建
    CScript inner = _createmultisig_redeemScript(params); // 创建多签赎回脚本
    CScriptID innerID(inner); // 获取脚本索引
    pwalletMain->AddCScript(inner); // 添加该脚本索引到钱包

    pwalletMain->SetAddressBook(innerID, strAccount, "send"); // 设置地址簿
    return CBitcoinAddress(innerID).ToString(); // 对脚本索引进行 base58 编码后返回
}
{% endhighlight %}

基本流程：<br>
1.确保当前钱包可用。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定的账户名，若未指定，则为默认账户 ""。<br>
5.创建多签赎回脚本，获取脚本索引并把该索引添加到钱包。<br>
6.设置脚本索引和指定账户到地址簿，脚本用途为 "send"。<br>
7.对脚本索引进行 base58 编码并返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#addmultisigaddress)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
