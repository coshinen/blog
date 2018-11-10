---
layout: post
title:  "比特币 RPC 命令剖析 \"getaccountaddress\""
date:   2018-08-10 10:12:13 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli getaccountaddress "account"
---
## 提示说明

{% highlight shell %}
getaccountaddress "account" # （已过时）获取该账户 account 当前用于接收付款的比特币地址
{% endhighlight %}

参数：<br>
1.account（字符串，必备）地址所属的账户名。它也可以设置空字符串 "" 来表示默认账户。
该账户不需要存在，若给定的账户不存在，则它将被创建并新建一个地址。

结果：（字符串）返回该账户的比特币地址。

## 用法示例

### 比特币核心客户端

用法一：获取已存在账户的收款地址。

{% highlight shell %}
$ bitcoin-cli listaccounts
{
  "": 0.00000000
}
$ bitcoin-cli getaccountaddress ""
1N7xDfRbkVwa2Co8q1KbDCVEr9rg8VWsfW
{% endhighlight %}

用法二：获取不存在账户的收款地址，新建账户并在该账户下新建一个地址。

{% highlight shell %}
$ bitcoin-cli listaccounts
{
  "": 0.00000000
}
$ bitcoin-cli getaccountaddress "myaccount"
16WPqZuNvPU1SdGfv3PWcSeX47fhhYbuYa
$ bitcoin-cli listaccounts
{
  "": 0.00000000,
  "myaccount": 0.00000000
}
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaccountaddress", "params": [""] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"1N7xDfRbkVwa2Co8q1KbDCVEr9rg8VWsfW","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
getaccountaddress 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getaccountaddress(const UniValue& params, bool fHelp); // 获取账户收款地址
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue getaccountaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "getaccountaddress \"account\"\n"
            "\nDEPRECATED. Returns the current Bitcoin address for receiving payments to this account.\n"
            "\nArguments:\n"
            "1. \"account\"       (string, required) The account name for the address. It can also be set to the empty string \"\" to represent the default account. The account does not need to exist, it will be created and a new address created  if there is no account by the given name.\n"
            "\nResult:\n"
            "\"bitcoinaddress\"   (string) The account bitcoin address\n"
            "\nExamples:\n"
            + HelpExampleCli("getaccountaddress", "")
            + HelpExampleCli("getaccountaddress", "\"\"")
            + HelpExampleCli("getaccountaddress", "\"myaccount\"")
            + HelpExampleRpc("getaccountaddress", "\"myaccount\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    // Parse the account first so we don't generate a key if there's an error
    string strAccount = AccountFromValue(params[0]); // 首先解析账户，如果这里出错我们不会生成一个密钥

    UniValue ret(UniValue::VSTR);

    ret = GetAccountAddress(strAccount).ToString(); // 获取指定账户的收款地址
    return ret; // 返回一个比特币地址
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定账户，账户名不能为 *。<br>
5.获取指定账户的收款地址，若该账户不存在，则创建一个同时新建一个地址。<br>
6.返回指定账户的收款地址。

第四步，调用 AccountFromValue(params[0]) 函数获取指定账户，注意这里指定的账户名不能为 *。
该函数定义在“rpcwallet.cpp”文件中。

{% highlight C++ %}
string AccountFromValue(const UniValue& value) // 从参数中获取账户名
{
    string strAccount = value.get_str(); // 把 UniValue 类型的参数转化为 std::string 类型
    if (strAccount == "*") // 账户名不能为 "*"
        throw JSONRPCError(RPC_WALLET_INVALID_ACCOUNT_NAME, "Invalid account name");
    return strAccount; // 返回获取的账户名，可能为空
}
{% endhighlight %}

第五步，调用 GetAccountAddress(strAccount) 函数获取指定账户的收款地址，该函数定义在“rpcwallet.cpp”文件中。

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
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getaccountaddress)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
