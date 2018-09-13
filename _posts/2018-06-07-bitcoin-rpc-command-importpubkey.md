---
layout: post
title:  "比特币 RPC 命令剖析 \"importpubkey\""
date:   2018-06-07 10:40:03 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli importpubkey "pubkey" ( "label" rescan )
---
## 提示说明

{% highlight shell %}
importpubkey "pubkey" ( "label" rescan ) # 导入一个公钥（16 进制）用来监视
{% endhighlight %}

最终导入的还是公钥对应的地址。<br>
该公钥好像在你的钱包，但不能用于花费。

参数：<br>
1. pubkey （字符串，必备）16 进制的公钥。<br>
2. label （字符串，可选，默认为 ""）一个可选的标签（账户名）。<br>
3. rescan （布尔型，可选，默认为 true）再扫描钱包交易。

**注：如果 rescan 为 true，该调用可能需要数分钟来完成。**

结果：无返回值。

## 用法示例

### 比特币核心客户端

暂无。

用法一：导入公钥到钱包并使用再扫描。

{% highlight shell %}
$ bitcoin-cli importpubkey "mypubkey"
{% endhighlight %}

用法二：导入一个公钥及其关联账户到钱包，不使用再扫描。

{% highlight shell %}
$ bitcoin-cli importpubkey "mypubkey" "testing" false
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importpubkey", "params": ["mypubkey", "testing", flase] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
暂无。
{% endhighlight %}

## 源码剖析
importpubkey 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue importpubkey(const UniValue& params, bool fHelp); // 导入公钥
{% endhighlight %}

实现在“wallet/rpcdump.cpp”文件中。

{% highlight C++ %}
UniValue importpubkey(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;

    if (fHelp || params.size() < 1 || params.size() > 4) // 参数最少 1 个，最多 3 个，这里错了
        throw runtime_error( // 命令帮助反馈
            "importpubkey \"pubkey\" ( \"label\" rescan )\n"
            "\nAdds a public key (in hex) that can be watched as if it were in your wallet but cannot be used to spend.\n"
            "\nArguments:\n"
            "1. \"pubkey\"           (string, required) The hex-encoded public key\n"
            "2. \"label\"            (string, optional, default=\"\") An optional label\n"
            "3. rescan               (boolean, optional, default=true) Rescan the wallet for transactions\n"
            "\nNote: This call can take minutes to complete if rescan is true.\n"
            "\nExamples:\n"
            "\nImport a public key with rescan\n"
            + HelpExampleCli("importpubkey", "\"mypubkey\"") +
            "\nImport using a label without rescan\n"
            + HelpExampleCli("importpubkey", "\"mypubkey\" \"testing\" false") +
            "\nAs a JSON-RPC call\n"
            + HelpExampleRpc("importpubkey", "\"mypubkey\", \"testing\", false")
        );


    string strLabel = ""; // 帐户名，默认为 ""
    if (params.size() > 1)
        strLabel = params[1].get_str(); // 获取指定的帐户名

    // Whether to perform rescan after import // 在导入之后是否执行再扫描
    bool fRescan = true; // 再扫描选项，默认开启
    if (params.size() > 2)
        fRescan = params[2].get_bool(); // 获取再扫描设置

    if (fRescan && fPruneMode) // 再扫描与修剪模式步兼容
        throw JSONRPCError(RPC_WALLET_ERROR, "Rescan is disabled in pruned mode");

    if (!IsHex(params[0].get_str())) // 公钥必须为 16 进制
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Pubkey must be a hex string");
    std::vector<unsigned char> data(ParseHex(params[0].get_str()));
    CPubKey pubKey(data.begin(), data.end()); // 初始化公钥
    if (!pubKey.IsFullyValid()) // 该公钥是否有效
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Pubkey is not a valid public key");

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    ImportAddress(CBitcoinAddress(pubKey.GetID()), strLabel); // 导入地址及关联账户
    ImportScript(GetScriptForRawPubKey(pubKey), strLabel, false); // 导入脚本

    if (fRescan) // 若开启了再扫描
    {
        pwalletMain->ScanForWalletTransactions(chainActive.Genesis(), true); // 再扫描钱包交易
        pwalletMain->ReacceptWalletTransactions(); // 把交易放入内存池
    }

    return NullUniValue; // 返回空值
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.处理相关参数，获取并设置参数，以及正确性检验。<br>
4.钱包上锁。<br>
5.导入地址及其关联账户。<br>
7.导入脚本。<br>
8.若开启了再扫描选项，进行钱包交易再扫描并把交易放入内存池。

相关函数调用，见 [importaddress](/2018/06/07/bitcoin-rpc-command-importaddress)。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#importpubkey)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
