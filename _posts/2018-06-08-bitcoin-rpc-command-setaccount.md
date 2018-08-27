---
layout: post
title:  "比特币 RPC 命令剖析 \"setaccount\""
date:   2018-06-08 09:30:12 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin bitcoin-cli commands
excerpt: $ bitcoin-cli setaccount "bitcoinaddress" "account"
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
setaccount "bitcoinaddress" "account" # （已过时）设置给定地址关联的账户
{% endhighlight %}

参数：<br>
1. `bitcoinaddress` （字符串，必备）用于关联一个账户的比特币地址。<br>
2. `account` （字符串，必备）要分配地址的账户。

结果：无返回值。

## 用法示例

### 比特币核心客户端

获取一个新的比特币地址，在默认账户下，
重新设置该地址关联账户为 `tabby`。

{% highlight shell %}
$ bitcoin-cli getnewaddress
1MfmEDut9v3b2MEQG8GB1s5fqRSguMw3fs
$ bitcoin-cli getaccount 1MfmEDut9v3b2MEQG8GB1s5fqRSguMw3fs
$ bitcoin-cli setaccount 1MfmEDut9v3b2MEQG8GB1s5fqRSguMw3fs "tabby"
$ bitcoin-cli getaccount 1MfmEDut9v3b2MEQG8GB1s5fqRSguMw3fs
tabby
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setaccount", "params": ["1MfmEDut9v3b2MEQG8GB1s5fqRSguMw3fs", "tabby"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`setaccount` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue setaccount(const UniValue& params, bool fHelp); // 设置地址关联账户
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue setaccount(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保钱包当前可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 2) // 参数为 1 或 2 个
        throw runtime_error( // 命令帮助反馈
            "setaccount \"bitcoinaddress\" \"account\"\n"
            "\nDEPRECATED. Sets the account associated with the given address.\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"  (string, required) The bitcoin address to be associated with an account.\n"
            "2. \"account\"         (string, required) The account to assign the address to.\n"
            "\nExamples:\n"
            + HelpExampleCli("setaccount", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\" \"tabby\"")
            + HelpExampleRpc("setaccount", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\", \"tabby\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    CBitcoinAddress address(params[0].get_str()); // 获取指定的比特币地址
    if (!address.IsValid()) // 验证地址是否有效
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address");

    string strAccount;
    if (params.size() > 1)
        strAccount = AccountFromValue(params[1]); // 获取指定的账户

    // Only add the account if the address is yours. // 如果该地址是你的，只需添加账户
    if (IsMine(*pwalletMain, address.Get())) // 若该地址是我的
    {
        // Detect when changing the account of an address that is the 'unused current key' of another account: // 侦测到
        if (pwalletMain->mapAddressBook.count(address.Get())) // 若该地址在地址簿中
        {
            string strOldAccount = pwalletMain->mapAddressBook[address.Get()].name; // 获取地址关联的旧账户名
            if (address == GetAccountAddress(strOldAccount)) // 若旧账户关联的地址为指定地址
                GetAccountAddress(strOldAccount, true); // 先在旧账户下生成一个新地址
        }
        pwalletMain->SetAddressBook(address.Get(), strAccount, "receive"); // 再把该地址关联到指定账户
    }
    else
        throw JSONRPCError(RPC_MISC_ERROR, "setaccount can only be used with own address");

    return NullUniValue; // 返回空值
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取相关参数：指定的地址和账户，并验证地址是否有效。<br>
5.若该地址属于自己，只需在原账户下新建地址并改变指定地址关联的账户，否则报错。<br>
6.返回空值。

第五步，调用 GetAccountAddress(strOldAccount, true) 函数在旧账户下生成新地址，
该函数定义在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
CBitcoinAddress GetAccountAddress(string strAccount, bool bForceNew=false)
{
    CWalletDB walletdb(pwalletMain->strWalletFile); // 创建钱包数据库对象

    CAccount account;
    walletdb.ReadAccount(strAccount, account); // 从数据库中获取指定账户的数据

    bool bKeyUsed = false; // 该密钥是否正在使用标志

    // Check if the current key has been used
    if (account.vchPubKey.IsValid()) // 若该公钥有效
    {
        CScript scriptPubKey = GetScriptForDestination(account.vchPubKey.GetID());
        for (map<uint256, CWalletTx>::iterator it = pwalletMain->mapWallet.begin();
             it != pwalletMain->mapWallet.end() && account.vchPubKey.IsValid();
             ++it)
        {
            const CWalletTx& wtx = (*it).second;
            BOOST_FOREACH(const CTxOut& txout, wtx.vout) // 遍历交易输出集
                if (txout.scriptPubKey == scriptPubKey) // 若公钥脚本一致
                    bKeyUsed = true; // 标志置为 true
        }
    }

    // Generate a new key
    if (!account.vchPubKey.IsValid() || bForceNew || bKeyUsed) // 无效时生成新密钥
    {
        if (!pwalletMain->GetKeyFromPool(account.vchPubKey)) // 从密钥池中获取一个密钥的公钥
            throw JSONRPCError(RPC_WALLET_KEYPOOL_RAN_OUT, "Error: Keypool ran out, please call keypoolrefill first");

        pwalletMain->SetAddressBook(account.vchPubKey.GetID(), strAccount, "receive"); // 设置地址簿
        walletdb.WriteAccount(strAccount, account); // 把该账户写入钱包数据库中
    }

    return CBitcoinAddress(account.vchPubKey.GetID()); // 获取公钥对应的索引并返回
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#setaccount)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
