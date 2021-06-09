---
layout: post
title:  "比特币 RPC 命令「getnewaddress」"
date:   2018-08-15 20:45:40 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli getnewaddress ( "account" )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getnewaddress
getnewaddress ( "account" )

返回一个用于接收付款的新的比特币地址。
如果 'account' 已指定（已过时），则将它添加到地址簿
以便接收付款的地址将被计入 'account'。

参数：
1. "account"（字符串，可选）已过时。用于地址链接到的账户名。如果未提供，则使用默认账户 ""。它也可以设置为空字符串 "" 以表示默认账户。该账户不需要存在，如果没有给定账户名那么它将会被创建。

结果：
"bitcoinaddress"（字符串）新的比特币地址

例子：
> bitcoin-cli getnewaddress
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnewaddress", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getnewaddress` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getnewaddress(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue getnewaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;

    if (fHelp || params.size() > 1)
        throw runtime_error(
            "getnewaddress ( \"account\" )\n"
            "\nReturns a new Bitcoin address for receiving payments.\n"
            "If 'account' is specified (DEPRECATED), it is added to the address book \n"
            "so payments received with the address will be credited to 'account'.\n"
            "\nArguments:\n"
            "1. \"account\"        (string, optional) DEPRECATED. The account name for the address to be linked to. If not provided, the default account \"\" is used. It can also be set to the empty string \"\" to represent the default account. The account does not need to exist, it will be created if there is no account by the given name.\n"
            "\nResult:\n"
            "\"bitcoinaddress\"    (string) The new bitcoin address\n"
            "\nExamples:\n"
            + HelpExampleCli("getnewaddress", "")
            + HelpExampleRpc("getnewaddress", "")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    // Parse the account first so we don't generate a key if there's an error
    string strAccount; // 3. 首先解析账户这样如果这里出错我们就不会生成密钥
    if (params.size() > 0)
        strAccount = AccountFromValue(params[0]);

    if (!pwalletMain->IsLocked())
        pwalletMain->TopUpKeyPool(); // 4. 填充密钥池

    // Generate a new key that is added to wallet
    CPubKey newKey; // 5. 生成一个新密钥并添加到钱包
    if (!pwalletMain->GetKeyFromPool(newKey))
        throw JSONRPCError(RPC_WALLET_KEYPOOL_RAN_OUT, "Error: Keypool ran out, please call keypoolrefill first");
    CKeyID keyID = newKey.GetID(); // 对 65 bytes 的公钥调用 hash160(即先 sha256, 再 ripemd160)

    pwalletMain->SetAddressBook(keyID, strAccount, "receive");

    return CBitcoinAddress(keyID).ToString(); // 160 位的公钥转化为公钥地址：Base58(1 + 20 + 4 bytes)
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

### 2.3. 首先解析账户这样如果这里出错我们就不会生成密钥

函数 `AccountFromValue(params[0])` 实现在文件 `wallet/rpcwllet.cpp` 中。

```cpp
string AccountFromValue(const UniValue& value)
{
    string strAccount = value.get_str();
    if (strAccount == "*") // 账户名不能为 "*"
        throw JSONRPCError(RPC_WALLET_INVALID_ACCOUNT_NAME, "Invalid account name");
    return strAccount;
}
```

### 2.4. 填充密钥池

函数 `pwalletMain->IsLocked()` 在文件 `wallet/crypter.h` 的密钥存储类 `CCryptoKeyStore` 中。

```cpp
typedef std::vector<unsigned char, secure_allocator<unsigned char> > CKeyingMaterial;
...
class CCryptoKeyStore : public CBasicKeyStore
{
private:
    ...
    CKeyingMaterial vMasterKey;

    //! if fUseCrypto is true, mapKeys must be empty
    //! if fUseCrypto is false, vMasterKey must be empty
    bool fUseCrypto; // ！如果使用加密标志为 true，密钥映射必须为空；如果为 false，主密钥必须为空
    ...
public:
    ...
    bool IsCrypted() const
    {
        return fUseCrypto;
    }

    bool IsLocked() const
    {
        if (!IsCrypted())
            return false;
        bool result;
        {
            LOCK(cs_KeyStore);
            result = vMasterKey.empty();
        }
        return result;
    }
    ...
};
```

函数 `pwalletMain->TopUpKeyPool()` 定义在文件 `wallet/wallet.h` 的钱包类 `CWallet` 中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    bool TopUpKeyPool(unsigned int kpSize = 0);
    ...
};
```

实现在文件 `wallet/wallet.cpp` 中。

```cpp
bool CWallet::TopUpKeyPool(unsigned int kpSize)
{
    {
        LOCK(cs_wallet);

        if (IsLocked())
            return false;

        CWalletDB walletdb(strWalletFile); // 通过钱包文件名创建钱包数据库对象

        // Top up key pool
        unsigned int nTargetSize;
        if (kpSize > 0) // 这里的 kpSize 默认为 0
            nTargetSize = kpSize;
        else // 所以走这里
            nTargetSize = max(GetArg("-keypool", DEFAULT_KEYPOOL_SIZE), (int64_t) 0); // 钥匙池大小，默认 100

        while (setKeyPool.size() < (nTargetSize + 1)) // 这里可以看出密钥池实际上最多有 nTargetSize + 1 个密钥，默认为 100 + 1 即 101 个
        {
            int64_t nEnd = 1;
            if (!setKeyPool.empty()) // 若密钥池集合为空，则从索引为 1 的密钥开始填充
                nEnd = *(--setKeyPool.end()) + 1; // 获取当前密钥池中密钥的最大数量（索引）并加 1
            if (!walletdb.WritePool(nEnd, CKeyPool(GenerateNewKey()))) // 创建一个密钥对并把公钥写入钱包数据库文件中
                throw runtime_error("TopUpKeyPool(): writing generated key failed");
            setKeyPool.insert(nEnd); // 将新密钥的索引插入密钥池集合
            LogPrintf("keypool added key %d, size=%u\n", nEnd, setKeyPool.size());
        }
    }
    return true;
}
```

默认密钥池的大小 `DEFAULT_KEYPOOL_SIZE` 定义在文件 `wallet/wallet.h` 中。

```cpp
static const unsigned int DEFAULT_KEYPOOL_SIZE = 100;
```

该值可通过 `-keypool=<n>` 启动选项改变。

生成新密钥函数 `GenerateNewKey()` 实现在文件 `wallet/wallet.cpp` 中。

```cpp
CPubKey CWallet::GenerateNewKey()
{
    AssertLockHeld(cs_wallet); // mapKeyMetadata
    bool fCompressed = CanSupportFeature(FEATURE_COMPRPUBKEY); // default to compressed public keys if we want 0.6.0 wallets

    CKey secret; // 创建一个私钥
    secret.MakeNewKey(fCompressed); // 随机生成一个数来初始化私钥，注意边界，下界为 1

    // Compressed public keys were introduced in version 0.6.0
    if (fCompressed) // 是否压缩公钥，0.6.0 版引入
        SetMinVersion(FEATURE_COMPRPUBKEY);

    CPubKey pubkey = secret.GetPubKey(); // 获取与私钥对应的公钥（椭圆曲线加密算法）
    assert(secret.VerifyPubKey(pubkey)); // 验证私钥公钥对是否匹配

    // Create new metadata // 创建新元数据/中继数据
    int64_t nCreationTime = GetTime(); // 获取当前时间
    mapKeyMetadata[pubkey.GetID()] = CKeyMetadata(nCreationTime);
    if (!nTimeFirstKey || nCreationTime < nTimeFirstKey)
        nTimeFirstKey = nCreationTime;

    if (!AddKeyPubKey(secret, pubkey))
        throw std::runtime_error("CWallet::GenerateNewKey(): AddKey failed");
    return pubkey; // 返回对应的公钥
}
```

该函数在规定范围内生成一个新的密钥，并通过椭圆曲线加密算法获取与之对应的公钥。
之后将返回的公钥转换为一个密钥池条目对象，与其索引一起写入钱包数据库的密钥池中。

```cpp
/** A key pool entry */
class CKeyPool // 一个密钥池条目
{
public:
    int64_t nTime; // 时间
    CPubKey vchPubKey; // 公钥

    CKeyPool();
    CKeyPool(const CPubKey& vchPubKeyIn);

    ADD_SERIALIZE_METHODS;

    template <typename Stream, typename Operation>
    inline void SerializationOp(Stream& s, Operation ser_action, int nType, int nVersion) {
        if (!(nType & SER_GETHASH))
            READWRITE(nVersion);
        READWRITE(nTime);
        READWRITE(vchPubKey);
    }
};
```

写入钱包数据库密钥池函数 `walletdb.WritePool(nEnd, CKeyPool(GenerateNewKey()))` 定义在文件 `wallet/walletdb.h` 的钱包数据库类 `CWalletDB` 中。

```cpp
/** Access to the wallet database (wallet.dat) */
class CWalletDB : public CDB // 访问钱包数据库（wallet.dat）
{
public:
    ...
    bool WritePool(int64_t nPool, const CKeyPool& keypool);
    ...
};
```

实现在文件 `wallet/walletdb.cpp` 中。

```cpp
bool CWalletDB::WritePool(int64_t nPool, const CKeyPool& keypool)
{
    nWalletDBUpdated++; // 升级次数加 1
    return Write(std::make_pair(std::string("pool"), nPool), keypool); // 打上 "pool" 标签并写入钱包数据库文件
}
```

密钥池是钱包数据库中一个打了标签 `pool` 的条目。

### 2.5. 生成一个新密钥并添加到钱包

从密钥池获取公钥函数 `pwalletMain->GetKeyFromPool(newKey)` 实现在文件 `wallet/wallet.cpp` 中。

```cpp
bool CWallet::GetKeyFromPool(CPubKey& result)
{
    int64_t nIndex = 0;
    CKeyPool keypool; // 密钥池条目
    {
        LOCK(cs_wallet);
        ReserveKeyFromKeyPool(nIndex, keypool); // 从密钥池中预定一个密钥，若获取失败，nIndex 为 -1
        if (nIndex == -1) // -1 表示当前 keypool 为空
        {
            if (IsLocked()) return false;
            result = GenerateNewKey(); // 创建新的私钥，并用椭圆曲线加密生成对应的公钥
            return true;
        }
        KeepKey(nIndex); // 从钱包数据库的密钥池中移除该索引对应的密钥
        result = keypool.vchPubKey;
    }
    return true;
}
```

从密钥池中取一个最早创建的密钥中的公钥，或密钥池为空，就生成一个新的私钥获取其对应的公钥。

移除密钥函数 `KeepKey(nIndex)` 实现在文件 `wallet/wallet.cpp` 中。

```cpp
void CWallet::KeepKey(int64_t nIndex)
{
    // Remove from key pool // 从密钥池移除指定索引的
    if (fFileBacked) // 若钱包文件已备份
    {
        CWalletDB walletdb(strWalletFile); // 通过钱包文件名构造钱包数据库对象
        walletdb.ErasePool(nIndex); // 根据索引擦除对应的密钥
    }
    LogPrintf("keypool keep %d\n", nIndex);
}
```

清除钱包数据库函数 `walletdb.ErasePool(nIndex)` 实现在文件 `wallet/walletdb.cpp`。

```cpp
bool CWalletDB::ErasePool(int64_t nPool)
{
    nWalletDBUpdated++; // 升级次数加 1
    return Erase(std::make_pair(std::string("pool"), nPool)); // 根据指定的索引移除钱包数据库中对应的密钥
}
```

若密钥池为空，则生成一个新的密钥，获取其对应的公钥。

从密钥池预定密钥函数 `ReserveKeyFromKeyPool(nIndex, keypool)` 实现在文件 `wallet/wallet.cpp` 中。

```cpp
void CWallet::ReserveKeyFromKeyPool(int64_t& nIndex, CKeyPool& keypool)
{
    nIndex = -1;
    keypool.vchPubKey = CPubKey();
    {
        LOCK(cs_wallet); // 钱包上锁

        if (!IsLocked()) // 若钱包未被加密
            TopUpKeyPool(); // 再次填充密钥池

        // Get the oldest key // 获取时间上最早的密钥
        if(setKeyPool.empty()) // 若密钥池集合为空
            return; // 直接返回

        CWalletDB walletdb(strWalletFile); // 根据钱包文件构造钱包数据库对象

        nIndex = *(setKeyPool.begin()); // 获取最先创建的密钥的索引，大于 0，最小为 1
        setKeyPool.erase(setKeyPool.begin()); // 从密钥池集合中擦除该密钥的索引
        if (!walletdb.ReadPool(nIndex, keypool)) // 根据密钥索引从钱包数据库中读取一个密钥池条目
            throw runtime_error("ReserveKeyFromKeyPool(): read failed");
        if (!HaveKey(keypool.vchPubKey.GetID())) // 通过获取的公钥 ID
            throw runtime_error("ReserveKeyFromKeyPool(): unknown key in key pool");
        assert(keypool.vchPubKey.IsValid()); // 检查公钥是否有效
        LogPrintf("keypool reserve %d\n", nIndex);
    }
}
```

获取索引函数 `GetID()` 定义在文件 `pubkey.h` 中。

```cpp
/** An encapsulated public key. */
/** A reference to a CKey: the Hash160 of its serialized public key */
class CKeyID : public uint160 // 一个公钥的引用：其序列化的公钥的 Hash160，共 160 位二进制，20bytes
{
public:
    CKeyID() : uint160() {}
    CKeyID(const uint160& in) : uint160(in) {}
};
...
class CPubKey // 一个封装的公钥
{
    ...
    //! Get the KeyID of this public key (hash of its serialization)
    CKeyID GetID() const // 获取公钥地址 ID，即公钥的 hash160，20个字节
    {
        return CKeyID(Hash160(vch, vch + size()));
    }
    ...
};
```

哈希 160 函数 `Hash160(vch, vch + size())` 用来计算一个对象并输出其 160 位的哈希值。
其模板实现在文件 `hash.h` 中。

```cpp
/** Compute the 160-bit hash an object. */
template<typename T1> // 计算一个对象的 160 位哈希值。
inline uint160 Hash160(const T1 pbegin, const T1 pend)
{
    static unsigned char pblank[1] = {};
    uint160 result;
    CHash160().Write(pbegin == pend ? pblank : (const unsigned char*)&pbegin[0], (pend - pbegin) * sizeof(pbegin[0]))
              .Finalize((unsigned char*)&result);
    return result;
}
```

得到公钥 ID 后，作为公钥的索引与指定的账户名和该地址的用途一起加入到地址簿中。

设置地址簿函数 `pwalletMain->SetAddressBook(keyID, strAccount, "receive")` 实现在文件 `wallet/wallet.cpp` 中。

```cpp
bool CWallet::SetAddressBook(const CTxDestination& address, const string& strName, const string& strPurpose)
{
    bool fUpdated = false; // 标记钱包地址簿是否更新，指地址已存在更新其用途，新增地址不算
    {
        LOCK(cs_wallet); // mapAddressBook
        std::map<CTxDestination, CAddressBookData>::iterator mi = mapAddressBook.find(address); // 首先在地址簿中查找该地址
        fUpdated = mi != mapAddressBook.end(); // 查找到的话，升级标志置为 true
        mapAddressBook[address].name = strName; // 账户名，若地址已存在，直接改变账户名，否则插入该地址
        if (!strPurpose.empty()) /* update purpose only if requested */ // 用途非空
            mapAddressBook[address].purpose = strPurpose; // 升级该已存在地址的用途
    }
    NotifyAddressBookChanged(this, address, strName, ::IsMine(*this, address) != ISMINE_NO,
                             strPurpose, (fUpdated ? CT_UPDATED : CT_NEW) ); // 通知地址簿已改变
    if (!fFileBacked) // 文件未备份
        return false;
    if (!strPurpose.empty() && !CWalletDB(strWalletFile).WritePurpose(CBitcoinAddress(address).ToString(), strPurpose)) // 用途非空时，写入钱包数据库该地址对应的用途
        return false;
    return CWalletDB(strWalletFile).WriteName(CBitcoinAddress(address).ToString(), strName); // 最后写入地址对应的账户名到钱包数据库
}
```

最后一步就是把公钥索引通过 `Base58` 编码转换为比特币公钥地址。

比特币地址转字符串函数 `CBitcoinAddress(keyID).ToString()` 分两步，先构造一个比特币地址类临时对象，然后再转换为字符串形式。

比特币地址类 `CBitcoinAddress` 定义在 `base58.h` 文件中。

```cpp
/** base58-encoded Bitcoin addresses.
 * Public-key-hash-addresses have version 0 (or 111 testnet).
 * The data vector contains RIPEMD160(SHA256(pubkey)), where pubkey is the serialized public key.
 * Script-hash-addresses have version 5 (or 196 testnet).
 * The data vector contains RIPEMD160(SHA256(cscript)), where cscript is the serialized redemption script.
 */
class CBitcoinAddress : public CBase58Data {
public:
    ...
    bool Set(const CTxDestination &dest);
    ...
    CBitcoinAddress(const CTxDestination &dest) { Set(dest); }
    ...
};
```

设置函数 `Set()` 的实现在文件 `base58.cpp` 中。

```cpp
bool CBitcoinAddress::Set(const CTxDestination& dest)
{
    return boost::apply_visitor(CBitcoinAddressVisitor(this), dest);
}
```

比特币地址转字符串函数 `CBitcoinAddress(keyID).ToString()` 定义在文件 `base58.h` 的 Base58 数据类 `CBase58Data` 中。

```cpp
/**
 * Base class for all base58-encoded data
 */
class CBase58Data // 所有 base58 编码的数据基类
{
    ...
    std::string ToString() const; // 为要编码的数据附加前缀，通过该值计算两次 sha256 后取 4 bytes 的前缀附加在该值后面，再进行 Base58 编码得到公钥地址
    ...
};
```

实现在文件 `base58.cpp` 中。

```cpp
std::string CBase58Data::ToString() const
{
    std::vector<unsigned char> vch = vchVersion;
    vch.insert(vch.end(), vchData.begin(), vchData.end()); // 附加公钥地址前缀到前面
    return EncodeBase58Check(vch); // 添加校验和的前 4 bytes 到末尾，并计算 Base58 得到地址
}
```

附加 1 个字节的网络中定义的公钥地址前缀后，调用 Base58 编码函数 `EncodeBase58Check(vch)`，计算并附加校验和的前 4 个字节到公钥后面，得到 25bytes 的数据。

```cpp
std::string EncodeBase58Check(const std::vector<unsigned char>& vchIn)
{
    // add 4-byte hash check to the end
    std::vector<unsigned char> vch(vchIn); // 添加 4 个字节的校验到末端
    uint256 hash = Hash(vch.begin(), vch.end()); // 2 次 sha256 计算校验和
    vch.insert(vch.end(), (unsigned char*)&hash, (unsigned char*)&hash + 4); // 将校验和添加到末尾
    return EncodeBase58(vch); // 计算 Base58 得到地址
}
```

把得到的 25bytes 的数据，通过调用  进行 Base58 编码得到最终的比特币公钥地址。

函数 `EncodeBase58(vch)` 实现在文件 `Base.cpp` 中，通过函数重载，在函数 `EncodeBase58(&vch[0], &vch[0] + vch.size())` 中实现 Base58 编码。

```cpp
/** All alphanumeric characters except for "0", "I", "O", and "l" */
static const char* pszBase58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // 10 + 26 * 2 - 4 = 58
...
std::string EncodeBase58(const unsigned char* pbegin, const unsigned char* pend) // Base58 编码
{
    // Skip & count leading zeroes.
    int zeroes = 0; // 1.跳过并统计开头 0 的个数，最多为 1 byte 的 0x00
    while (pbegin != pend && *pbegin == 0) {
        pbegin++;
        zeroes++;
    }
    // Allocate enough space in big-endian base58 representation.
    std::vector<unsigned char> b58((pend - pbegin) * 138 / 100 + 1); // log(256) / log(58), rounded up. // 2.为大端 base58 表示，开辟足够的空间（34 或 35 bytes），向上取整
    // Process the bytes.
    while (pbegin != pend) { // 3.256 进制转 58 进制
        int carry = *pbegin;
        // Apply "b58 = b58 * 256 + ch".
        for (std::vector<unsigned char>::reverse_iterator it = b58.rbegin(); it != b58.rend(); it++) {
            carry += 256 * (*it);
            *it = carry % 58;
            carry /= 58;
        }
        assert(carry == 0);
        pbegin++;
    }
    // Skip leading zeroes in base58 result.
    std::vector<unsigned char>::iterator it = b58.begin();
    while (it != b58.end() && *it == 0) // 4.跳过开头的 0
        it++;
    // Translate the result into a string.
    std::string str;
    str.reserve(zeroes + (b58.end() - it)); // 1 + 33 or 0 + 34 = 34
    str.assign(zeroes, '1'); // 5.在字符串前面的位置指派 zeroes 个字符 1
    while (it != b58.end()) // 6.查 Base58 字符表转换结果为字符串
        str += pszBase58[*(it++)]; // append *it then ++it
    return str; // 前缀为 0x00 不参与 Base58 运算，地址长度固定为 34 bytes 且前缀位 '1'，其他不为 0x00 的前缀，均参与 Base58 运算，地址长度变换范围 33 - 35 bytes
}

std::string EncodeBase58(const std::vector<unsigned char>& vch)
{
    return EncodeBase58(&vch[0], &vch[0] + vch.size());
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
* [bitcoin/crypter.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/crypter.h){:target="_blank"}
* [bitcoin/wallet.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.h){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
* [bitcoin/walletdb.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/walletdb.h){:target="_blank"}
* [bitcoin/walletdb.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/walletdb.cpp){:target="_blank"}
* [bitcoin/pubkey.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/pubkey.h){:target="_blank"}
* [bitcoin/hash.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/hash.h){:target="_blank"}
* [bitcoin/base58.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/base58.h){:target="_blank"}
* [bitcoin/base58.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/base58.cpp){:target="_blank"}
