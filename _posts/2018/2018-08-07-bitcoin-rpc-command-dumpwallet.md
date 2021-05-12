---
layout: post
title:  "比特币 RPC 命令剖析 \"dumpwallet\""
date:   2018-08-07 20:52:21 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli dumpwallet "filename"
---
## 1. 帮助内容

```shell
$ bitcoin-cli help dumpwallet
dumpwallet "filename"

用人类可读的方式导出所有钱包密钥。

参数：
1. "filename"（字符串，必备）文件名

例子：
> bitcoin-cli backupwallet "test"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "dumpwallet", "params": ["test"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`dumpwallet` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue dumpwallet(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue dumpwallet(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "dumpwallet \"filename\"\n"
            "\nDumps all wallet keys in a human-readable format.\n"
            "\nArguments:\n"
            "1. \"filename\"    (string, required) The filename\n"
            "\nExamples:\n"
            + HelpExampleCli("dumpwallet", "\"test\"")
            + HelpExampleRpc("dumpwallet", "\"test\"")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    EnsureWalletIsUnlocked(); // 3. 确保钱包解锁

    ofstream file;
    file.open(params[0].get_str().c_str());
    if (!file.is_open())
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Cannot open wallet dump file");

    std::map<CKeyID, int64_t> mapKeyBirth;
    std::set<CKeyID> setKeyPool;
    pwalletMain->GetKeyBirthTimes(mapKeyBirth);
    pwalletMain->GetAllReserveKeys(setKeyPool);

    // sort time/key pairs
    std::vector<std::pair<int64_t, CKeyID> > vKeyBirth; // 4. 排序时间/密钥对
    for (std::map<CKeyID, int64_t>::const_iterator it = mapKeyBirth.begin(); it != mapKeyBirth.end(); it++) {
        vKeyBirth.push_back(std::make_pair(it->second, it->first));
    }
    mapKeyBirth.clear();
    std::sort(vKeyBirth.begin(), vKeyBirth.end());

    // produce output
    file << strprintf("# Wallet dump created by Bitcoin %s (%s)\n", CLIENT_BUILD, CLIENT_DATE); // 5. 产生输出
    file << strprintf("# * Created on %s\n", EncodeDumpTime(GetTime()));
    file << strprintf("# * Best block at time of backup was %i (%s),\n", chainActive.Height(), chainActive.Tip()->GetBlockHash().ToString());
    file << strprintf("#   mined on %s\n", EncodeDumpTime(chainActive.Tip()->GetBlockTime()));
    file << "\n";
    for (std::vector<std::pair<int64_t, CKeyID> >::const_iterator it = vKeyBirth.begin(); it != vKeyBirth.end(); it++) {
        const CKeyID &keyid = it->second;
        std::string strTime = EncodeDumpTime(it->first);
        std::string strAddr = CBitcoinAddress(keyid).ToString();
        CKey key;
        if (pwalletMain->GetKey(keyid, key)) {
            if (pwalletMain->mapAddressBook.count(keyid)) {
                file << strprintf("%s %s label=%s # addr=%s\n", CBitcoinSecret(key).ToString(), strTime, EncodeDumpString(pwalletMain->mapAddressBook[keyid].name), strAddr); // label=
            } else if (setKeyPool.count(keyid)) {
                file << strprintf("%s %s reserve=1 # addr=%s\n", CBitcoinSecret(key).ToString(), strTime, strAddr); // reserve=1
            } else {
                file << strprintf("%s %s change=1 # addr=%s\n", CBitcoinSecret(key).ToString(), strTime, strAddr); // change=1
            }
        }
    }
    file << "\n";
    file << "# End of dump\n";
    file.close();
    return NullUniValue;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.3. 确保钱包解锁

函数 `pwalletMain->GetKeyBirthTimes(mapKeyBirth)` 和 `pwalletMain->GetAllReserveKeys(setKeyPool)` 声明在文件 `wallet.h` 的钱包类 `CWallet` 中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    void GetKeyBirthTimes(std::map<CKeyID, int64_t> &mapKeyBirth) const;
    ...
    void GetAllReserveKeys(std::set<CKeyID>& setAddress) const; // 获取密钥池中全部预创建的密钥
    ...
};
```

均实现在“wallet.h”文件中。

```cpp
void CWallet::GetAllReserveKeys(set<CKeyID>& setAddress) const
{
    setAddress.clear(); // 清空地址集合

    CWalletDB walletdb(strWalletFile); // 创建钱包数据库对象

    LOCK2(cs_main, cs_wallet); // 钱包上锁
    BOOST_FOREACH(const int64_t& id, setKeyPool) // 遍历密钥池索引集合
    {
        CKeyPool keypool; // 创建一个密钥池条目
        if (!walletdb.ReadPool(id, keypool)) // 根据索引从数据库中读相应的密钥到密钥池条目
            throw runtime_error("GetAllReserveKeyHashes(): read failed");
        assert(keypool.vchPubKey.IsValid()); // 检查该密钥对应公钥是否有效
        CKeyID keyID = keypool.vchPubKey.GetID(); // 获取公钥索引
        if (!HaveKey(keyID)) // 检查该索引对应密钥是否存在
            throw runtime_error("GetAllReserveKeyHashes(): unknown key in key pool");
        setAddress.insert(keyID); // 插入地址集合
    }
}
...
void CWallet::GetKeyBirthTimes(std::map<CKeyID, int64_t> &mapKeyBirth) const {
    AssertLockHeld(cs_wallet); // mapKeyMetadata
    mapKeyBirth.clear(); // 清空密钥创建时间映射列表

    // get birth times for keys with metadata // 获取密钥元数据的创建时间
    for (std::map<CKeyID, CKeyMetadata>::const_iterator it = mapKeyMetadata.begin(); it != mapKeyMetadata.end(); it++) // 遍历密钥元数据列表
        if (it->second.nCreateTime) // 若创建时间非 0
            mapKeyBirth[it->first] = it->second.nCreateTime; // 加入映射

    // map in which we'll infer heights of other keys
    CBlockIndex *pindexMax = chainActive[std::max(0, chainActive.Height() - 144)]; // the tip can be reorganised; use a 144-block safety margin
    std::map<CKeyID, CBlockIndex*> mapKeyFirstBlock; // 密钥区块索引映射列表
    std::set<CKeyID> setKeys; // 密钥索引集合
    GetKeys(setKeys);
    BOOST_FOREACH(const CKeyID &keyid, setKeys) { // 遍历该索引集合
        if (mapKeyBirth.count(keyid) == 0) // 该密钥索引在密钥创建时间映射列表中不存在
            mapKeyFirstBlock[keyid] = pindexMax; // 加入密钥区块索引映射列表
    }
    setKeys.clear(); // 清空密钥索引集合

    // if there are no such keys, we're done
    if (mapKeyFirstBlock.empty()) // 若密钥区块索引映射列表为空
        return;

    // find first block that affects those keys, if there are any left // 找到影响这些密钥的首个区块，如果有剩余
    std::vector<CKeyID> vAffected;
    for (std::map<uint256, CWalletTx>::const_iterator it = mapWallet.begin(); it != mapWallet.end(); it++) {
        // iterate over all wallet transactions... // 迭代全部钱包交易
        const CWalletTx &wtx = (*it).second;
        BlockMap::const_iterator blit = mapBlockIndex.find(wtx.hashBlock);
        if (blit != mapBlockIndex.end() && chainActive.Contains(blit->second)) {
            // ... which are already in a block // 已经在一个块中
            int nHeight = blit->second->nHeight;
            BOOST_FOREACH(const CTxOut &txout, wtx.vout) {
                // iterate over all their outputs // 迭代全部输出
                CAffectedKeysVisitor(*this, vAffected).Process(txout.scriptPubKey);
                BOOST_FOREACH(const CKeyID &keyid, vAffected) {
                    // ... and all their affected keys // 受影响的全部密钥
                    std::map<CKeyID, CBlockIndex*>::iterator rit = mapKeyFirstBlock.find(keyid);
                    if (rit != mapKeyFirstBlock.end() && nHeight < rit->second->nHeight)
                        rit->second = blit->second;
                }
                vAffected.clear();
            }
        }
    }

    // Extract block timestamps for those keys // 提取这些密钥的区块时间戳
    for (std::map<CKeyID, CBlockIndex*>::const_iterator it = mapKeyFirstBlock.begin(); it != mapKeyFirstBlock.end(); it++)
        mapKeyBirth[it->first] = it->second->GetBlockTime() - 7200; // block times can be 2h off // 和块时间相差 2h
}
```

### 2.4. 排序时间/密钥对

### 2.5. 产生输出

获取密钥函数 `pwalletMain->GetKey(keyid, key)` 声明在文件 `crypter.h` 的密钥存储类 `CCryptoKeyStore` 中。

```cpp
/** Keystore which keeps the private keys encrypted.
 * It derives from the basic key store, which is used if no encryption is active.
 */
class CCryptoKeyStore : public CBasicKeyStore // 存储加密私钥的密钥库。
{
private:
    CryptedKeyMap mapCryptedKeys; // 密钥索引对应公钥私钥对映射列表
    ...
    bool GetKey(const CKeyID &address, CKey& keyOut) const; // 通过密钥索引获取私钥
    ...
};
```

实现在文件 `crypter.cpp` 中。

```cpp
bool CCryptoKeyStore::GetKey(const CKeyID &address, CKey& keyOut) const
{
    {
        LOCK(cs_KeyStore);
        if (!IsCrypted()) // 若当前钱包未加密
            return CBasicKeyStore::GetKey(address, keyOut);

        CryptedKeyMap::const_iterator mi = mapCryptedKeys.find(address); // 在密钥索引和公钥私钥对映射列表中查找
        if (mi != mapCryptedKeys.end()) // 若找到
        {
            const CPubKey &vchPubKey = (*mi).second.first; // 取出公钥
            const std::vector<unsigned char> &vchCryptedSecret = (*mi).second.second; // 取出加密的密钥
            return DecryptKey(vMasterKey, vchCryptedSecret, vchPubKey, keyOut); // 解密私钥
        }
    }
    return false;
}
```

若钱包未加密，则调用函数 `CBasicKeyStore::GetKey(address, keyOut)` 获取密钥索引对应的私钥。
该函数定义在文件 `crypter.h` 的基础密钥存储类 `CBasicKeyStore` 中。

```cpp
typedef std::map<CKeyID, CKey> KeyMap; // 密钥索引和私钥的映射
...
/** Basic key store, that keeps keys in an address->secret map */
class CBasicKeyStore : public CKeyStore // 基础密钥存储，以 address->secret 映射维持私钥
{
protected:
    KeyMap mapKeys; // 密钥索引和私钥的映射列表
    ...
    bool GetKey(const CKeyID &address, CKey &keyOut) const
    {
        {
            LOCK(cs_KeyStore);
            KeyMap::const_iterator mi = mapKeys.find(address); // 在密钥索引和私钥映射列表中查找
            if (mi != mapKeys.end()) // 若找到指定密钥索引
            {
                keyOut = mi->second; // 获取对应的私钥
                return true;
            }
        }
        return false;
    }
    ...
};
```

若钱包已加密，且能在密钥索引和公私钥对映射列表 `mapCryptedKeys` 中找到指定索引，则调用函数 `DecryptKey(vMasterKey, vchCryptedSecret, vchPubKey, keyOut)` 解密并获取私钥。
密钥映射对象 `mapCryptedKeys` 的类型 `CryptedKeyMap` 定义在文件 `keystore.h` 中。

```cpp
typedef std::map<CKeyID, std::pair<CPubKey, std::vector<unsigned char> > > CryptedKeyMap; // 密钥索引对应公钥私钥对映射
```

函数 `DecryptKey(vMasterKey, vchCryptedSecret, vchPubKey, keyOut)` 定义在文件 `crypter.cpp` 中。

```cpp
static bool DecryptKey(const CKeyingMaterial& vMasterKey, const std::vector<unsigned char>& vchCryptedSecret, const CPubKey& vchPubKey, CKey& key)
{
    CKeyingMaterial vchSecret;
    if(!DecryptSecret(vMasterKey, vchCryptedSecret, vchPubKey.GetHash(), vchSecret)) // 解密私钥，获取私钥元数据
        return false;

    if (vchSecret.size() != 32) // 密钥大小为 32 字节
        return false;

    key.Set(vchSecret.begin(), vchSecret.end(), vchPubKey.IsCompressed()); // 初始化私钥
    return key.VerifyPubKey(vchPubKey); // 验证获取的私钥与公钥是否匹配
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
* [bitcoin/wallet.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.h){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
* [bitcoin/crypter.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/crypter.h){:target="_blank"}
* [bitcoin/crypter.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/crypter.cpp){:target="_blank"}
