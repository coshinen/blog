---
layout: post
title:  "比特币 RPC 命令剖析 \"getaccount\""
date:   2018-08-09 09:22:55 +0800
author: mistydew
comments: true
categories: 区块链
tags: CLI bitcoin-cli Blockchain Bitcoin
excerpt: $ bitcoin-cli getaccount "bitcoinaddress"
---
## 提示说明

```shell
getaccount "bitcoinaddress" # （已过时）获取指定地址关联的账户
```

参数：<br>
1. bitcoinaddress （字符串，必备）用于查询所属账户的比特币地址。

结果：（字符串）返回地址所属的账户名。

## 用法示例

### 比特币核心客户端

使用 [getnewaddress](/blog/2018/08/bitcoin-rpc-command-getnewaddress.html) 在指定账户下创建一个地址，
根据该地址查询账户。

```shell
$ bitcoin-cli getnewaddress "myaccount"
13CagJ3iVhG1LPSQFD8Yh3TgR4y5zRnbUS
$ bitcoin-cli 13CagJ3iVhG1LPSQFD8Yh3TgR4y5zRnbUS
myaccount
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaccount", "params": ["13CagJ3iVhG1LPSQFD8Yh3TgR4y5zRnbUS"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"myaccount","error":null,"id":"curltest"}
```

## 源码剖析
getaccount 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue getaccount(const UniValue& params, bool fHelp); // 获取地址所属账户
```

实现在“rpcwallet.cpp”文件中。

```cpp
UniValue getaccount(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "getaccount \"bitcoinaddress\"\n"
            "\nDEPRECATED. Returns the account associated with the given address.\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"  (string, required) The bitcoin address for account lookup.\n"
            "\nResult:\n"
            "\"accountname\"        (string) the account address\n"
            "\nExamples:\n"
            + HelpExampleCli("getaccount", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\"")
            + HelpExampleRpc("getaccount", "\"1D1ZrZNe3JUo7ZycKEYQQiQAWd9y54F4XZ\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    CBitcoinAddress address(params[0].get_str()); // 获取指定的比特币地址
    if (!address.IsValid()) // 检测地址是否有效
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address");

    string strAccount; // 保存账户名
    map<CTxDestination, CAddressBookData>::iterator mi = pwalletMain->mapAddressBook.find(address.Get()); // 获取地址簿中对应地址索引的数据
    if (mi != pwalletMain->mapAddressBook.end() && !(*mi).second.name.empty()) // 若存在该数据且账户名非空
        strAccount = (*mi).second.name; // 获取账户名
    return strAccount; // 返回所属账户名
}
```

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定的比特币地址并检测该地址是否有效。<br>
5.获取指定地址在地址簿中对应的账户名。<br>
6.返回该账户名。

第四步，类 CBitcoinAddress 定义在“base58.h”文件中，是一个 base58 编码的比特币地址。

```cpp
/** base58-encoded Bitcoin addresses.
 * Public-key-hash-addresses have version 0 (or 111 testnet).
 * The data vector contains RIPEMD160(SHA256(pubkey)), where pubkey is the serialized public key.
 * Script-hash-addresses have version 5 (or 196 testnet).
 * The data vector contains RIPEMD160(SHA256(cscript)), where cscript is the serialized redemption script.
 */ // base58 编码的比特币地址
class CBitcoinAddress : public CBase58Data {
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

相关函数实现在“base58.cpp”文件中。

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

第五步，对象 mapAddressBook 定义在“wallet.h”文件的 CWallet 类中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    std::map<CTxDestination, CAddressBookData> mapAddressBook; // 地址簿映射列表
    ...
};
```

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getaccount){:target="_blank"}
