---
layout: post
title:  "比特币 RPC 命令剖析 \"getrawchangeaddress\""
date:   2018-06-07 14:28:37 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getrawchangeaddress
---
## 提示说明

{% highlight shell %}
getrawchangeaddress # 获取一个新的用于接收找零的比特币地址
{% endhighlight %}

**这是用于原始交易，而非普通交易。**

结果：（字符串）返回地址。

## 用法示例

### 比特币核心客户端

获取一个新的用于原始交易的找零地址。

{% highlight shell %}
$ bitcoin-cli getrawchangeaddress
16h8G5hCrbHKU6ihp3RaBNP4uctzac1S6k
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawchangeaddress", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"1UtBfdBGyzJjWPe7VYCASooGdkUAVosRg","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getrawchangeaddress` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getrawchangeaddress(const UniValue& params, bool fHelp); // 获取元交易找零地址
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue getrawchangeaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 1) // 没有参数，这里错了
        throw runtime_error( // 命令帮助反馈
            "getrawchangeaddress\n"
            "\nReturns a new Bitcoin address, for receiving change.\n"
            "This is for use with raw transactions, NOT normal use.\n"
            "\nResult:\n"
            "\"address\"    (string) The address\n"
            "\nExamples:\n"
            + HelpExampleCli("getrawchangeaddress", "")
            + HelpExampleRpc("getrawchangeaddress", "")
       );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    if (!pwalletMain->IsLocked()) // 若当前钱包处于未加密状态
        pwalletMain->TopUpKeyPool(); // 填充密钥池

    CReserveKey reservekey(pwalletMain); // 创建一个密钥池条目
    CPubKey vchPubKey;
    if (!reservekey.GetReservedKey(vchPubKey)) // 获取一个密钥池中的密钥的公钥
        throw JSONRPCError(RPC_WALLET_KEYPOOL_RAN_OUT, "Error: Keypool ran out, please call keypoolrefill first");

    reservekey.KeepKey(); // 从密钥池中移除获取的密钥，并清空密钥池条目信息

    CKeyID keyID = vchPubKey.GetID(); // 获取公钥索引

    return CBitcoinAddress(keyID).ToString(); // Base58 编码获取公钥地址并返回
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.若当前钱包处于解密状态，填充满密钥池。<br>
5.从密钥池中取出一个密钥，并获取对应的公钥。<br>
6.从密钥池中移除获取的密钥。<br>
7.获取公钥索引，经 Base58 编码转化为公钥地址并返回。

源码中貌似未体现出获取的地址不能用于普通交易。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getrawchangeaddress)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
