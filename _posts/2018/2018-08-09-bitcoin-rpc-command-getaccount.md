---
layout: post
title:  "比特币 RPC 命令剖析 \"getaccount\""
date:   2018-08-09 19:22:55 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getaccount "bitcoinaddress"
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getaccount
getaccount "bitcoinaddress"

已过时。返回给定地址关联的账户。

参数：
1. "bitcoinaddress"（字符串，必备）用于账户查询的比特币地址。

结果：
"accountname"（字符串）地址所属的账户名

例子：
> bitcoin-cli getaccount "1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaccount", "params": ["1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getaccount` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getaccount(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue getaccount(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "getaccount \"bitcoinaddress\"\n"
            "\nDEPRECATED. Returns the account associated with the given address.\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"  (string, required) The bitcoin address for account lookup.\n"
            "\nResult:\n"
            "\"accountname\"        (string) the account address\n"
            "\nExamples:\n"
            + HelpExampleCli("getaccount", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\"")
            + HelpExampleRpc("getaccount", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\"")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    CBitcoinAddress address(params[0].get_str());
    if (!address.IsValid()) // 3. 检测地址是否有效
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address");

    string strAccount;
    map<CTxDestination, CAddressBookData>::iterator mi = pwalletMain->mapAddressBook.find(address.Get());
    if (mi != pwalletMain->mapAddressBook.end() && !(*mi).second.name.empty())
        strAccount = (*mi).second.name; // 4. 获取对应账户名
    return strAccount;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.3. 检测地址是否有效

比特币地址类 `CBitcoinAddress` 定义在文件 `base58.h` 中。

```cpp
/** base58-encoded Bitcoin addresses.
 * Public-key-hash-addresses have version 0 (or 111 testnet).
 * The data vector contains RIPEMD160(SHA256(pubkey)), where pubkey is the serialized public key.
 * Script-hash-addresses have version 5 (or 196 testnet).
 * The data vector contains RIPEMD160(SHA256(cscript)), where cscript is the serialized redemption script.
 */
class CBitcoinAddress : public CBase58Data { // base58 编码的比特币地址。
public:
    ...
    bool IsValid() const; // 转调下面的重载函数
    bool IsValid(const CChainParams &params) const; // 验证地址是否有效
    ...
    CBitcoinAddress(const std::string& strAddress) { SetString(strAddress); }
    ...
    CTxDestination Get() const; // 获取公钥索引或脚本索引
    ...
};
```

相关函数实现在文件 `base58.cpp` 中。

```cpp
bool CBitcoinAddress::IsValid() const
{
    return IsValid(Params()); // 转调有参重载函数
}

bool CBitcoinAddress::IsValid(const CChainParams& params) const
{
    bool fCorrectSize = vchData.size() == 20; // 真正编码数据大小是否为 20 字节
    bool fKnownVersion = vchVersion == params.Base58Prefix(CChainParams::PUBKEY_ADDRESS) || // 版本号即地址前缀为公钥地址前缀
                         vchVersion == params.Base58Prefix(CChainParams::SCRIPT_ADDRESS); // 或脚本地址前缀
    return fCorrectSize && fKnownVersion;
}

CTxDestination CBitcoinAddress::Get() const
{
    if (!IsValid())
        return CNoDestination();
    uint160 id;
    memcpy(&id, &vchData[0], 20); // 复制编码数据的 20 位
    if (vchVersion == Params().Base58Prefix(CChainParams::PUBKEY_ADDRESS))
        return CKeyID(id); // 返回公钥索引
    else if (vchVersion == Params().Base58Prefix(CChainParams::SCRIPT_ADDRESS))
        return CScriptID(id);
    else
        return CNoDestination();
}
```

### 2.4. 获取对应账户名

地址簿映射对象 `mapAddressBook` 定义在文件 `wallet.h` 的钱包类 `CWallet` 中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    std::map<CTxDestination, CAddressBookData> mapAddressBook;
    ...
};
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/base58.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/base58.h){:target="_blank"}
* [bitcoin/base58.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/base58.cpp){:target="_blank"}
* [bitcoin/wallet.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.h){:target="_blank"}
