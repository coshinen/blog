---
layout: post
title:  "比特币 RPC 命令剖析 \"encryptwallet\""
date:   2018-05-31 11:44:43 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli encryptwallet "passphrase"
---
## 提示说明

{% highlight shell %}
encryptwallet "passphrase" # 使用 passphrase 加密钱包
{% endhighlight %}

用于第一次加密。<br>
在此之后，任何与私钥相关的调用，例如发送或签名，需要在调用前设置密钥解密。<br>
使用 [walletpassphrase](/2018/05/31/bitcoin-rpc-command-walletpassphrase) 解密钱包，或使用 [walletlock](/2018/05/31/bitcoin-rpc-command-walletlock) 锁定钱包。<br>
如果钱包已经加密，使用 [walletpassphrasechange](/2018/05/31/bitcoin-rpc-command-walletpassphrasechange) 更改密码。<br>
**注：该命令将会关闭服务器。**

参数：<br>
1. passphrase （字符串）用来加密钱包的密码。至少 1 个字符，应该较长。

结果：返回提示信息。

## 用法示例

### 比特币核心客户端

使用密码 mypasswd 加密钱包。

{% highlight shell %}
$ bitcoin-cli encryptwallet mypasswd
wallet encrypted; Bitcoin server stopping, restart to run with encrypted wallet. The keypool has been flushed, you need to make a new backup.
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "encryptwallet", "params": ["mypasswd"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"wallet encrypted; Bitcoin server stopping, restart to run with encrypted wallet. The keypool has been flushed, you need to make a new backup.","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
encryptwallet 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue encryptwallet(const UniValue& params, bool fHelp); // 加密钱包
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue encryptwallet(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保钱包当前可用
        return NullUniValue;
    
    if (!pwalletMain->IsCrypted() && (fHelp || params.size() != 1)) // 钱包未加密 且 参数只能有 1 个
        throw runtime_error( // 命令参数反馈
            "encryptwallet \"passphrase\"\n"
            "\nEncrypts the wallet with 'passphrase'. This is for first time encryption.\n"
            "After this, any calls that interact with private keys such as sending or signing \n"
            "will require the passphrase to be set prior the making these calls.\n"
            "Use the walletpassphrase call for this, and then walletlock call.\n"
            "If the wallet is already encrypted, use the walletpassphrasechange call.\n"
            "Note that this will shutdown the server.\n"
            "\nArguments:\n"
            "1. \"passphrase\"    (string) The pass phrase to encrypt the wallet with. It must be at least 1 character, but should be long.\n"
            "\nExamples:\n"
            "\nEncrypt you wallet\n"
            + HelpExampleCli("encryptwallet", "\"my pass phrase\"") +
            "\nNow set the passphrase to use the wallet, such as for signing or sending bitcoin\n"
            + HelpExampleCli("walletpassphrase", "\"my pass phrase\"") +
            "\nNow we can so something like sign\n"
            + HelpExampleCli("signmessage", "\"bitcoinaddress\" \"test message\"") +
            "\nNow lock the wallet again by removing the passphrase\n"
            + HelpExampleCli("walletlock", "") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("encryptwallet", "\"my pass phrase\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    if (fHelp) // 钱包加密时帮助处理，不反馈任何信息
        return true;
    if (pwalletMain->IsCrypted()) // 若钱包已加密
        throw JSONRPCError(RPC_WALLET_WRONG_ENC_STATE, "Error: running with an encrypted wallet, but encryptwallet was called.");

    // TODO: get rid of this .c_str() by implementing SecureString::operator=(std::string)
    // Alternately, find a way to make params[0] mlock()'d to begin with.
    SecureString strWalletPass; // 创建一个安全字符串对象，用来保存密码
    strWalletPass.reserve(100); // 预开辟 100 个字符的空间
    strWalletPass = params[0].get_str().c_str(); // 获取用户指定的密码

    if (strWalletPass.length() < 1) // 密码长度不能小于 1，至少为 1 个字符
        throw runtime_error(
            "encryptwallet <passphrase>\n"
            "Encrypts the wallet with <passphrase>.");

    if (!pwalletMain->EncryptWallet(strWalletPass)) // 加密钱包
        throw JSONRPCError(RPC_WALLET_ENCRYPTION_FAILED, "Error: Failed to encrypt the wallet.");

    // BDB seems to have a bad habit of writing old data into // Berkeley DB 似乎有一个坏习惯，
    // slack space in .dat files; that is bad if the old data is // 把旧数据写入 .dat 文件的松散空
    // unencrypted private keys. So: // 糟糕的是旧数据是没有加密的私钥，所以：
    StartShutdown(); // 关闭核心服务器
    return "wallet encrypted; Bitcoin server stopping, restart to run with encrypted wallet. The keypool has been flushed, you need to make a new backup."; // 返回该信息表示加密成功
}
{% endhighlight %}

基本流程：<br>
1.确保当前钱包可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.钱包加密时查看命令帮助，不返回任何信息。<br>
5.钱包已加密，再次加密直接返回提示信息。<br>
6.获取用户指定密码。<br>
7.密码长度检查，不能少于 1 个字符。<br>
8.加密钱包。<br>
9.关闭核心服务器。

第五步，调用 pwalletMain->IsCrypted() 函数判断钱包当前是否加密，定义在“crypter.h”文件的 CCryptoKeyStore 类中。

{% highlight C++ %}
/** Keystore which keeps the private keys encrypted.
 * It derives from the basic key store, which is used if no encryption is active.
 */ // 用于存储加密私钥的密钥库。
class CCryptoKeyStore : public CBasicKeyStore
{
    ...
    //! if fUseCrypto is true, mapKeys must be empty
    //! if fUseCrypto is false, vMasterKey must be empty
    bool fUseCrypto; // 如果使用加密标志为 true，mapKeys 必须为空；如果为 false，vMasterKey 必须为空
    ...
    bool IsCrypted() const // 返回当前钱包是否被用户加密的状态
    {
        return fUseCrypto;
    }
    ...
};
{% endhighlight %}

第六步，类型 SecureString 的定义在“secure.h”文件中。

{% highlight C++ %}
// This is exactly like std::string, but with a custom allocator. // 这是一个 std::string，但定制了空间配置器。
typedef std::basic_string<char, std::char_traits<char>, secure_allocator<char> > SecureString; // 安全字符串类型
{% endhighlight %}

第八步，调用 pwalletMain->EncryptWallet(strWalletPass) 函数加密钱包，该函数声明在“wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    bool EncryptWallet(const SecureString& strWalletPassphrase); // 使用用户指定密码加密钱包
    ...
};
{% endhighlight %}

实现在“wallet.cpp”文件中。

{% highlight C++ %}
bool CWallet::EncryptWallet(const SecureString& strWalletPassphrase)
{
    if (IsCrypted()) // 如果钱包已加密
        return false; // 直接退出

    CKeyingMaterial vMasterKey;
    RandAddSeedPerfmon(); // 创建随机数种子

    vMasterKey.resize(WALLET_CRYPTO_KEY_SIZE); // 预开辟密钥大小
    GetRandBytes(&vMasterKey[0], WALLET_CRYPTO_KEY_SIZE); // 获取 32 字节的随机字节

    CMasterKey kMasterKey; // 主密钥对象
    RandAddSeedPerfmon(); // 再次创建随机数种子

    kMasterKey.vchSalt.resize(WALLET_CRYPTO_SALT_SIZE); // 预开辟主密钥盐值大小
    GetRandBytes(&kMasterKey.vchSalt[0], WALLET_CRYPTO_SALT_SIZE); // 获取 8 字节的随机字节

    CCrypter crypter;
    int64_t nStartTime = GetTimeMillis(); // 记录起始时间
    crypter.SetKeyFromPassphrase(strWalletPassphrase, kMasterKey.vchSalt, 25000, kMasterKey.nDerivationMethod); // 从用户指定密码设置密钥
    kMasterKey.nDeriveIterations = 2500000 / ((double)(GetTimeMillis() - nStartTime)); // 计算迭代计数

    nStartTime = GetTimeMillis();
    crypter.SetKeyFromPassphrase(strWalletPassphrase, kMasterKey.vchSalt, kMasterKey.nDeriveIterations, kMasterKey.nDerivationMethod); // 第 2 次调用 sha512 进行加密
    kMasterKey.nDeriveIterations = (kMasterKey.nDeriveIterations + kMasterKey.nDeriveIterations * 100 / ((double)(GetTimeMillis() - nStartTime))) / 2; // 重新计算迭代计数

    if (kMasterKey.nDeriveIterations < 25000) // 迭代计数最低为 25000
        kMasterKey.nDeriveIterations = 25000;

    LogPrintf("Encrypting Wallet with an nDeriveIterations of %i\n", kMasterKey.nDeriveIterations);

    if (!crypter.SetKeyFromPassphrase(strWalletPassphrase, kMasterKey.vchSalt, kMasterKey.nDeriveIterations, kMasterKey.nDerivationMethod)) // 第 3 次调用 sha512 获取密钥和初始化向量
        return false;
    if (!crypter.Encrypt(vMasterKey, kMasterKey.vchCryptedKey)) // 
        return false;

    {
        LOCK(cs_wallet); // 钱包上锁
        mapMasterKeys[++nMasterKeyMaxID] = kMasterKey; // 加入主密钥映射
        if (fFileBacked)
        {
            assert(!pwalletdbEncryption);
            pwalletdbEncryption = new CWalletDB(strWalletFile);
            if (!pwalletdbEncryption->TxnBegin()) {
                delete pwalletdbEncryption;
                pwalletdbEncryption = NULL;
                return false;
            }
            pwalletdbEncryption->WriteMasterKey(nMasterKeyMaxID, kMasterKey); // 写主密钥到钱包数据库
        }

        if (!EncryptKeys(vMasterKey))
        {
            if (fFileBacked) {
                pwalletdbEncryption->TxnAbort();
                delete pwalletdbEncryption;
            } // 我们现在可能有一半加密的密钥在内存，另一半未加密...
            // We now probably have half of our keys encrypted in memory, and half not...
            // die and let the user reload the unencrypted wallet. // 关闭并让用户重新加载未加密的钱包
            assert(false);
        }

        // Encryption was introduced in version 0.4.0 // 加密在版本 0.4.0 引入
        SetMinVersion(FEATURE_WALLETCRYPT, pwalletdbEncryption, true);

        if (fFileBacked) // 文件备份标志
        {
            if (!pwalletdbEncryption->TxnCommit()) {
                delete pwalletdbEncryption;
                // We now have keys encrypted in memory, but not on disk... // 我们现在拥有内存中的加密密钥，但在磁盘上没有...
                // die to avoid confusion and let the user reload the unencrypted wallet. // 尽量避免混淆并让用户重新加载未加密的钱包
                assert(false);
            }

            delete pwalletdbEncryption;
            pwalletdbEncryption = NULL;
        }

        Lock(); // 上锁，标志加密状态
        Unlock(strWalletPassphrase); // 通过用户指定密码解锁
        NewKeyPool(); // 新建密钥池
        Lock(); // 再次上锁

        // Need to completely rewrite the wallet file; if we don't, bdb might keep
        // bits of the unencrypted private key in slack space in the database file.
        CDB::Rewrite(strWalletFile); // 需要完全重写钱包文件；如果我们不这么做，bdb 可能会保留未加密私钥比特位在数据库文件的松散空间。

    }
    NotifyStatusChanged(this); // 通知钱包状态已改变

    return true;
}
{% endhighlight %}

调用 NewKeyPool() 函数重新创建密钥池，定义在“wallet.h”文件中。

{% highlight C++ %}
/**
 * Mark old keypool keys as used,
 * and generate all new keys 
 */ // 标记旧密钥池密钥为已使用，并生成全部的新密钥
bool CWallet::NewKeyPool()
{
    {
        LOCK(cs_wallet); // 钱包上锁
        CWalletDB walletdb(strWalletFile); // 创建钱包数据库对象
        BOOST_FOREACH(int64_t nIndex, setKeyPool) // 遍历密钥池索引集合
            walletdb.ErasePool(nIndex); // 根据索引擦除数据库中的密钥
        setKeyPool.clear(); // 清空密钥池索引集合

        if (IsLocked()) // 检查钱包是否加密
            return false;

        int64_t nKeys = max(GetArg("-keypool", DEFAULT_KEYPOOL_SIZE), (int64_t)0); // 获取密钥池大小
        for (int i = 0; i < nKeys; i++)
        {
            int64_t nIndex = i+1;
            walletdb.WritePool(nIndex, CKeyPool(GenerateNewKey())); // 创建新密钥并和索引一起写入钱包数据库
            setKeyPool.insert(nIndex); // 插入密钥池索引集合
        }
        LogPrintf("CWallet::NewKeyPool wrote %d new keys\n", nKeys); // 记录写入新密钥的个数
    }
    return true;
}
{% endhighlight %}

第九步，调用 StartShutdown() 函数关闭比特币核心服务，该函数声明在“init.h”文件中。

{% highlight C++ %}
void StartShutdown(); // 关闭比特币核心服务
{% endhighlight %}

实现在“init.cpp”文件中。

{% highlight C++ %}
volatile bool fRequestShutdown = false; // 请求关闭标志，初始为 false

void StartShutdown()
{
    fRequestShutdown = true; // 把请求关闭标志置为 true
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#encryptwallet)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
