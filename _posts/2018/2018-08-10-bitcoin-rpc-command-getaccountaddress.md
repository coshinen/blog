---
layout: post
title:  "比特币 RPC 命令剖析 \"getaccountaddress\""
date:   2018-08-10 20:12:13 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getaccountaddress "account"
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getaccountaddress
getaccountaddress "account"

已过时。返回当前这个账户用于接收付款的比特币地址。

参数：
1. "account"（字符串，必备）地址所属的账户名。它也可以设置空字符串 "" 来表示默认账户。该账户不需要存在，若给定的账户名不存在，则它将被创建并新建一个地址。

结果：
"bitcoinaddress"（字符串）该账户的比特币地址

例子：
> bitcoin-cli getaccountaddress
> bitcoin-cli getaccountaddress ""
> bitcoin-cli getaccountaddress "myaccount"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaccountaddress", "params": ["myaccount"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getaccountaddress` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getaccountaddress(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue getaccountaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1)
        throw runtime_error(
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
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    // Parse the account first so we don't generate a key if there's an error
    string strAccount = AccountFromValue(params[0]); // 3. 首先解析账户，所以如果这里出错我们将不会生成一个密钥

    UniValue ret(UniValue::VSTR);

    ret = GetAccountAddress(strAccount).ToString(); // 获取账户地址
    return ret;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.3. 首先解析账户，所以如果这里出错我们将不会生成一个密钥

获取账户函数 `AccountFromValue(params[0])` 定义在文件 `rpcwallet.cpp` 中。

```cpp
string AccountFromValue(const UniValue& value)
{
    string strAccount = value.get_str();
    if (strAccount == "*") // 账户名不能为 "*"
        throw JSONRPCError(RPC_WALLET_INVALID_ACCOUNT_NAME, "Invalid account name");
    return strAccount;
}
```

获取账户地址函数 `GetAccountAddress(strAccount)` 定义在文件 `rpcwallet.cpp` 中。

```cpp
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
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
