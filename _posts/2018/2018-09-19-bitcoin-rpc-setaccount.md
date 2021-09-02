---
layout: post
title:  "比特币 RPC 命令「setaccount」"
date:   2018-09-19 20:30:12 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help setaccount
setaccount "bitcoinaddress" "account"

已过时。设置给定地址关联的账户。

参数：
1. "bitcoinaddress"（字符串，必备）用于关联一个账户的比特币地址。
2. "account"       （字符串，必备）待指定地址的账户。

例子：
> bitcoin-cli setaccount "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ" "tabby"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setaccount", "params": ["1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ", "tabby"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`setaccount` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue setaccount(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue setaccount(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
            "setaccount \"bitcoinaddress\" \"account\"\n"
            "\nDEPRECATED. Sets the account associated with the given address.\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"  (string, required) The bitcoin address to be associated with an account.\n"
            "2. \"account\"         (string, required) The account to assign the address to.\n"
            "\nExamples:\n"
            + HelpExampleCli("setaccount", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\" \"tabby\"")
            + HelpExampleRpc("setaccount", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\", \"tabby\"")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    CBitcoinAddress address(params[0].get_str());
    if (!address.IsValid())
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address");

    string strAccount;
    if (params.size() > 1)
        strAccount = AccountFromValue(params[1]);

    // Only add the account if the address is yours.
    if (IsMine(*pwalletMain, address.Get())) // 如果该地址是你的则只添加账户。
    {
        // Detect when changing the account of an address that is the 'unused current key' of another account:
        if (pwalletMain->mapAddressBook.count(address.Get())) // 当改变一个账户的地址是另一账户的“当前未使用的密钥”时检测：
        {
            string strOldAccount = pwalletMain->mapAddressBook[address.Get()].name;
            if (address == GetAccountAddress(strOldAccount))
                GetAccountAddress(strOldAccount, true); // 3. 在旧账户下生成一个新地址
        }
        pwalletMain->SetAddressBook(address.Get(), strAccount, "receive"); // 4. 把该地址关联到指定账户
    }
    else
        throw JSONRPCError(RPC_MISC_ERROR, "setaccount can only be used with own address");

    return NullUniValue;
}
```

### 1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#1-确保钱包可用)。

### 2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 3. 在旧账户下生成一个新地址

函数 `GetAccountAddress(strOldAccount, true)` 定义在文件 `wallet/rpcwallet.cpp` 中。

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
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
