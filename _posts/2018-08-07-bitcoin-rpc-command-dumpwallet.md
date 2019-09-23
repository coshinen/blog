---
layout: post
title:  "比特币 RPC 命令剖析 \"dumpwallet\""
date:   2018-08-07 10:52:21 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli dumpwallet "filename"
---
## 提示说明

```shell
dumpwallet "filename" # 以可读的方式导出全部钱包密钥到指定文件 filename
```

参数：<br>
1.filename（字符串，必备）文件名。

结果：无返回值。

## 用法示例

### 比特币核心客户端

导出到指定文件，默认保存在用户首次使用该命令的工作目录下。<br>
这里在家目录 ~ 下使用该命令。

```shell
$ bitcoin-cli backupwallet wallet.txt
$ ls ~
... wallet.txt ...
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "dumpwallet", "params": ["./wallet.txt"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
```

## 源码剖析
dumpwallet 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue dumpwallet(const UniValue& params, bool fHelp); // 导出钱包
```

实现在“rpcwallet.cpp”文件中。

```cpp
UniValue dumpwallet(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "dumpwallet \"filename\"\n"
            "\nDumps all wallet keys in a human-readable format.\n"
            "\nArguments:\n"
            "1. \"filename\"    (string, required) The filename\n"
            "\nExamples:\n"
            + HelpExampleCli("dumpwallet", "\"test\"")
            + HelpExampleRpc("dumpwallet", "\"test\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    EnsureWalletIsUnlocked(); // 确保当前钱包未加密

    ofstream file; // 文件输出流对象
    file.open(params[0].get_str().c_str()); // 打开指定文件
    if (!file.is_open()) // 检测打开文件状态
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Cannot open wallet dump file");

    std::map<CKeyID, int64_t> mapKeyBirth; // 密钥创建时间
    std::set<CKeyID> setKeyPool; // 密钥池集合
    pwalletMain->GetKeyBirthTimes(mapKeyBirth); // 获取钱包密钥创建时间
    pwalletMain->GetAllReserveKeys(setKeyPool); // 获取所有预创建的密钥

    // sort time/key pairs
    std::vector<std::pair<int64_t, CKeyID> > vKeyBirth; // 密钥创建时间映射列表
    for (std::map<CKeyID, int64_t>::const_iterator it = mapKeyBirth.begin(); it != mapKeyBirth.end(); it++) {
        vKeyBirth.push_back(std::make_pair(it->second, it->first)); // 把 map 内的数据导入 vector
    }
    mapKeyBirth.clear(); // 清空 map
    std::sort(vKeyBirth.begin(), vKeyBirth.end()); // 对该列表按创建时间进行排序，默认升序

    // produce output
    file << strprintf("# Wallet dump created by Bitcoin %s (%s)\n", CLIENT_BUILD, CLIENT_DATE); // 客户端版本
    file << strprintf("# * Created on %s\n", EncodeDumpTime(GetTime())); // 当前时间
    file << strprintf("# * Best block at time of backup was %i (%s),\n", chainActive.Height(), chainActive.Tip()->GetBlockHash().ToString()); // 最佳块的高度和哈希
    file << strprintf("#   mined on %s\n", EncodeDumpTime(chainActive.Tip()->GetBlockTime())); // 最佳块产生的时间
    file << "\n";
    for (std::vector<std::pair<int64_t, CKeyID> >::const_iterator it = vKeyBirth.begin(); it != vKeyBirth.end(); it++) {
        const CKeyID &keyid = it->second; // 获取密钥索引
        std::string strTime = EncodeDumpTime(it->first); // 编码时间，按一定的格式输出
        std::string strAddr = CBitcoinAddress(keyid).ToString(); // 获取公钥地址
        CKey key;
        if (pwalletMain->GetKey(keyid, key)) {
            if (pwalletMain->mapAddressBook.count(keyid)) { // 密钥索引存在于地址簿映射列表
                file << strprintf("%s %s label=%s # addr=%s\n", CBitcoinSecret(key).ToString(), strTime, EncodeDumpString(pwalletMain->mapAddressBook[keyid].name), strAddr); // label=
            } else if (setKeyPool.count(keyid)) { // 密钥索引存在于密钥池集合
                file << strprintf("%s %s reserve=1 # addr=%s\n", CBitcoinSecret(key).ToString(), strTime, strAddr); // reserve=1
            } else { // 其他类型
                file << strprintf("%s %s change=1 # addr=%s\n", CBitcoinSecret(key).ToString(), strTime, strAddr); // change=1
            }
        }
    }
    file << "\n";
    file << "# End of dump\n"; // 导出结束
    file.close(); // 关闭文件输出流
    return NullUniValue; // 返回空值
}
```

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.确保钱包当前未加密。<br>
5.创建文件输出流对象打开指定文件。<br>
6.获取钱包密钥创建时间映射，和密钥池中预创建的密钥索引。<br>
7.根据密钥创建时间对密钥列表进行排序。<br>
8.按一定格式输出密钥到指定文件。<br>
9.关闭文件输出流对象。

第六步，调用 pwalletMain->GetKeyBirthTimes(mapKeyBirth) 和 pwalletMain->GetAllReserveKeys(setKeyPool) 函数声明在“wallet.h”文件的 CWallet 类中。

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

第八步，调用 pwalletMain->GetKey(keyid, key) 函数获取密钥索引对应的私钥，该函数声明在“crypter.h”文件的 CCryptoKeyStore 类中。

```cpp
/** Keystore which keeps the private keys encrypted.
 * It derives from the basic key store, which is used if no encryption is active.
 */ // 用于存储加密私钥的密钥库。
class CCryptoKeyStore : public CBasicKeyStore
{
private:
    CryptedKeyMap mapCryptedKeys; // 密钥索引对应公钥私钥对映射列表
    ...
    bool GetKey(const CKeyID &address, CKey& keyOut) const; // 通过密钥索引获取私钥
    ...
};
```

实现在“crypter.cpp”文件中。

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

若当前钱包未加密，则调用 CBasicKeyStore::GetKey(address, keyOut) 函数获取密钥索引对应的私钥。
该函数定义在“crypter.h”文件的 CBasicKeyStore 类中。

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

若钱包已加密，且能在密钥索引和公私钥对映射列表 mapCryptedKeys 中找到指定索引，
则调用  DecryptKey(vMasterKey, vchCryptedSecret, vchPubKey, keyOut) 函数解密并获取私钥。<br>
对象 mapCryptedKeys 的类型 CryptedKeyMap 定义在“keystore.h”文件中。

```cpp
typedef std::map<CKeyID, std::pair<CPubKey, std::vector<unsigned char> > > CryptedKeyMap; // 密钥索引对应公钥私钥对映射
```

函数 DecryptKey(vMasterKey, vchCryptedSecret, vchPubKey, keyOut) 定义在“crypter.cpp”文件中。

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

未完成。

## 参考链接

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#dumpwallet){:target="_blank"}
