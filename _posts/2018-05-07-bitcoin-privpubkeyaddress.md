---
layout: post
title:  "比特币源码剖析 - 私钥、公钥、地址"
date:   2018-05-07 20:22:21 +0800
categories: jekyll update
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 概要
私钥使用单向的椭圆曲线乘法加密函数得到对应的公钥。<br>
公钥经过一系列的哈希函数运算生成相应地址，这一过程涉及到 Base58 编码。

私钥是一个有固定的范围的 256 位二进制随机数，其作用是生成签名用于证明私钥持有者对相应公钥地址上资金的所有权。<br>
比特币采用操作系统底层密码学安全的伪随机数生成器 CSPRNG 来产生 256 位随机数，只要保证生成的随机数“不可预测”且“不可重复”这两点即可。<br>
从编程角度实现随机数，在一个密码学安全的随机源中取一长串随机字节，使用 SHA256 算法运算得到一个 256 位的数字，然后判断是否在指定范围内，若不在就重复上述过程。<br>
**注：私钥很重要，持有私钥就拥有相应公钥地址上的比特币，一旦私钥丢失，对应的比特币将无法找回。**

使用 RPC 中的 `getnewaddress` 命令生成一个新的密钥（私钥、公钥对）。<br>
为了安全考虑，只显示生成的公钥地址，私钥默认存入本地钱包数据库。例：

{% highlight shell %}
$ ./bitcoin-cli getnewaddress
12PbLWS4h3qSmQfdu4oEgXCYMGY4TVbL3N
{% endhighlight %}

然后使用 RPC 中的 `dumpprivkey` 命令导出公钥地址对应的私钥。<br>
以 WIF(wallet import format) 钱包导入格式即 Base58 校验和编码进行导出。<br>
**注：该命令只适用于本地钱包数据库中的私钥。**例：

{% highlight shell %}
$ ./bitcoin-cli dumpprivkey 12PbLWS4h3qSmQfdu4oEgXCYMGY4TVbL3N
KzCFcgtfrPA2uWmXn4zjVNaKYMEUHbh732XzZ4aZ737545DqZ3V4
{% endhighlight %}

## 私钥、公钥、地址之间的转换流程
![privpubkeyaddr](/images/20180507/privpubkeyaddr.png)<br>
**注：“私钥->公钥”、“公钥->地址”这两步是单向不可逆的。**

## 从私钥到公钥地址的详细步骤
1.使用伪随机数生成器 PRNG 生成一个给定范围内的 256 位随机数作为私钥 PrivKey。<br>
2.使用 OpenSSL 加密库中 secp256k1 标准的椭圆曲线相乘加密算法计算上一步生成私钥 PrivKey 得到相应的公钥 PubKey。<br>
![pubkeytoaddress](/images/20180507/pubkeytoaddress.png)<br>
3.使用 "Double Hash" 或 "Hash160" 运算上一步生成的公钥 PubKey 得到公钥地址 PubKeyAddress，用户看到的是该地址经过 Base58Check 编码后得到地址 address。<br>
3.1."Hash160" 是先后经过了 SHA256 和 RIPEMD160 两步运算得到 160 位及 20 个字节的公钥地址，PubKeyAddress = RIPEMD160(SHA256(PubKey))。<br>
3.2.最后经过 Base58 编码得到最后的地址，address = Base58Check(PubKeyAddress)。<br>
![base58check](/images/20180507/base58check.png)<br>
3.2.1.在 20 个字节的公钥地址前附加 1 个字节的版本前缀，比特币主网的版本号为 "0x00" 对应前缀为 "1"，VersionPrefix + PubKeyAddress。<br>
3.2.2.对上步得到的 21bytes 进行两次哈希 SHA256，SHA256(SHA256(VersionPrefix + PubKeyAddress))。<br>
3.2.3.取上步结果的前 4 个字节作为校验和 Checksum 追加到 3.2.1 结果的后面，VersionPrefix + PubKeyAddress + Checksum。<br>
3.2.4.对上步得到的 25bytes 进行 Base58 编码得到最终的地址，address = Base58(VersionPrefix + PubKeyAddress + Checksum)。

## 源码剖析
“源码之前，了无秘密” — 侯捷<br>
最后放上一张从公钥到地址转换的总流程图，就开始我们的源码之旅。<br>
![pubkeytoaddr](/images/20180507/pubkeytoaddr.png)

{% highlight shell %}
$ cd bitcoin/src # 进入比特币根目录下的 src 目录，之后未作特殊说明的均以该目录作为比特币源码的根目录。
$ grep "getnewaddress" * -nir # 搜索 RPC 命令 `getnewaddress` 所出现的文件及位置，`grep` 是 Linux 下的一个查找字符串命令，其他平台或 IDE 请自行忽略。
rpcserver.cpp:344:    { "wallet",             "getnewaddress",          &getnewaddress,          true  },
rpcserver.h:199:extern UniValue getnewaddress(const UniValue& params, bool fHelp); // in rpcwallet.cpp
test/rpc_wallet_tests.cpp:174:     * 		getnewaddress
test/rpc_wallet_tests.cpp:176:    BOOST_CHECK_NO_THROW(CallRPC("getnewaddress"));
test/rpc_wallet_tests.cpp:177:    BOOST_CHECK_NO_THROW(CallRPC("getnewaddress getnewaddress_demoaccount"));
Binary file wallet/rpcwallet.cpp matches
wallet/wallet.h:439:    //! todo: add something to note what created it (user, getnewaddress, change)
{% endhighlight %}

从结果中我们可以看到出现该命令的文件名以及在该文件中出现的行号。<br>
分别出现在“rpcserver.cpp”、“rpcserver.h”、“test/rpc_wallet_tests.cpp”、“wallet/rpcwallet.cpp”、“wallet/wallet.h”这 5 个文件中。<br>
打开“rpcserver.cpp”文件，找到该命令出现的位置。

{% highlight C++ %}
/**
 * Call Table
 */
static const CRPCCommand vRPCCommands[] =
{ //  category              name                      actor (function)         okSafeMode
  //  --------------------- ------------------------  -----------------------  ----------
                                       ...
#ifdef ENABLE_WALLET
    /* Wallet */
                                       ...
    { "wallet",             "getnewaddress",          &getnewaddress,          true  },
                                       ...
#endif // ENABLE_WALLET
};
{% endhighlight %}

vRPCCommands[] 是一个静态常量类对象数组，在“rpcserver.h”文件中找到类 CRPCCommand 的定义如下：

{% highlight C++ %}
typedef UniValue(*rpcfn_type)(const UniValue& params, bool fHelp); // 回调函数类型定义

class CRPCCommand // 远程过程调用命令类
{
public:
    std::string category; // 所属类别
    std::string name; // 名称
    rpcfn_type actor; // 对应的函数行为
    bool okSafeMode; // 是否打开安全模式
};
{% endhighlight %}

该类的 4 个成员变量对应注释的 4 个列名。<br>
rpcfn_type 是一个函数标签为 UniValue(const UniValue&, bool) 的回调函数类型，
形参 params 为 RPC 命令的参数，形参 fHelp 为显示该命令帮助的标志，对应[比特币核心客户端基础命令](https://mistydew.github.io/jekyll/update/2018/05/06/bitcoin-cli-commands.html)用法的第 3 条。

{% highlight shell %}
  bitcoin-cli [options] help <command>      Get help for a command # 获取一条命令的帮助信息（用法示例）
{% endhighlight %}

在“rpcserver.h”文件中找到 RPC 命令 `getnewaddress` 对应的函数的引用。

{% highlight C++ %}
extern UniValue getnewaddress(const UniValue& params, bool fHelp); // in rpcwallet.cpp
{% endhighlight %}

该函数定义在“wallet/rpcwllet.cpp”文件中。

{% highlight C++ %}
UniValue getnewaddress(const UniValue& params, bool fHelp) // 在指定账户下新建一个地址，若不指定账户，默认添加到""空账户下
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1.确保钱包可用，即当前钱包已存在
        return NullUniValue;

    if (fHelp || params.size() > 1) // 参数个数为 0 或 1，即要么使用默认账户，要么指定账户
        throw runtime_error( // 2.查看该命令的帮助或命令的参数个数错误均返回该命令的帮助
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
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 3.对钱包加锁

    // Parse the account first so we don't generate a key if there's an error
    string strAccount; // 用于保存账户名
    if (params.size() > 0) // 有 1 个参数的情况
        strAccount = AccountFromValue(params[0]); // 4.解析第一个参数并将其作为账户名

    if (!pwalletMain->IsLocked()) // 检查钱包是否上锁（被用户加密）
        pwalletMain->TopUpKeyPool(); // 5.填充密钥池

    // Generate a new key that is added to wallet
    CPubKey newKey; // 6.生成一个新密钥并添加到钱包，返回一个对应的比特币地址
    if (!pwalletMain->GetKeyFromPool(newKey)) // 获取一个公钥
        throw JSONRPCError(RPC_WALLET_KEYPOOL_RAN_OUT, "Error: Keypool ran out, please call keypoolrefill first");
    CKeyID keyID = newKey.GetID(); // 对 65 bytes 的公钥调用 hash160(即先 sha256, 再 ripemd160)

    pwalletMain->SetAddressBook(keyID, strAccount, "receive");

    return CBitcoinAddress(keyID).ToString(); // 160 位的公钥转化为公钥地址：Base58(1 + 20 + 4 bytes)
}
{% endhighlight %}

该函数的作用是在指定账户下生成一个新地址，若未指定账户，则默认保存在 "" 空账户下。<br>
基本流程：<br>
1.检查钱包是否可用（存在）。<br>
2.命令帮助和命令参数个数的处理。<br>
3.钱包加锁，涉及临界资源的操作，防止并发。<br>
4.解析参数获取指定的帐户名。<br>
5.填充密钥池，在此之前需判断钱包是否上锁。<br>
6.生成一个新密钥并添加到钱包，同时得到对应的公钥地址并返回。<br>

第一步，检查钱包是否可用（存在）。<br>
进入 EnsureWalletIsAvailable() 函数，在“wallet/rpcwllet.cpp”文件中。

{% highlight C++ %}
bool EnsureWalletIsAvailable(bool avoidException) // 确保钱包当前可用
{
    if (!pwalletMain) // 钱包未创建成功
    {
        if (!avoidException)
            throw JSONRPCError(RPC_METHOD_NOT_FOUND, "Method not found (disabled)");
        else
            return false;
    }
    return true; // 钱包已创建完成，返回 true
}
{% endhighlight %}

pwalletMain 是钱包对象指针，指向一个钱包对象，其引用在“init.h”文件中。

{% highlight C++ %}
extern CWallet* pwalletMain; // 钱包对象指针
{% endhighlight %}

pwalletMain 在“init.cpp”文件中的 AppInit2() 函数的第 8 步加载钱包中进行初始化，这里不再赘述，详见。

{% highlight C++ %}
    // ********************************************************* Step 8: load wallet // 若启用钱包功能，则加载钱包
                       ...
            pwalletMain = new CWallet(strWalletFile); // 根据指定的钱包文件名创建并初始化钱包对象
{% endhighlight %}

第四步，解析参数获取指定的帐户名，只需满足帐户名不为 "*" 即可。<br>
进入 AccountFromValue() 函数，在“wallet/rpcwllet.cpp”文件中。

{% highlight C++ %}
string AccountFromValue(const UniValue& value) // 从参数中获取账户名
{
    string strAccount = value.get_str(); // 把 UniValue 类型的参数转化为 std::string 类型
    if (strAccount == "*") // 账户名不能为 "*"
        throw JSONRPCError(RPC_WALLET_INVALID_ACCOUNT_NAME, "Invalid account name");
    return strAccount; // 返回获取的账户名，可能为空
}
{% endhighlight %}

第五步，填充密钥池，在此之前需判断钱包是否上锁。<br>
进入 pwalletMain->IsLocked() 函数，在“wallet/crypter.h”文件的 CCryptoKeyStore 类中。

{% highlight C++ %}
typedef std::vector<unsigned char, secure_allocator<unsigned char> > CKeyingMaterial;
...
class CCryptoKeyStore : public CBasicKeyStore
{
private:
    ...
    CKeyingMaterial vMasterKey; // 主密钥

    //! if fUseCrypto is true, mapKeys must be empty
    //! if fUseCrypto is false, vMasterKey must be empty
    bool fUseCrypto; // 如果使用加密标志为 true，mapKeys 必须为空；如果为 false，vMasterKey 必须为空
    ...
public:
    ...
    bool IsCrypted() const
    {
        return fUseCrypto; // 返回当前钱包是否被用户加密的状态
    }

    bool IsLocked() const
    {
        if (!IsCrypted()) // 当 fUseCrypto 为 false
            return false;
        bool result; // 当 fUseCrypto 为 true
        {
            LOCK(cs_KeyStore);
            result = vMasterKey.empty();
        }
        return result;
    }
    ...
};
{% endhighlight %}

当 fUseCrypto 为 false 即用户没有加密钱包时，<br>
进入 pwalletMain->TopUpKeyPool() 函数，定义在“wallet/wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    bool TopUpKeyPool(unsigned int kpSize = 0);
    ...
};
{% endhighlight %}

实现在“wallet/wallet.cpp”文件中。

{% highlight C++ %}
bool CWallet::TopUpKeyPool(unsigned int kpSize)
{
    { // 这里是一个技巧，在函数返回前可提前析构创建的局部对象
        LOCK(cs_wallet);

        if (IsLocked()) // 再次检查钱包是否被锁
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
{% endhighlight %}

接下来就开始生成新密钥了，进入 GenerateNewKey() 函数，同样属于 CWallet 类，实现在“wallet/wallet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

该函数在规定范围内生成一个新的密钥，并通过椭圆曲线加密算法获取与之对应的公钥。

## 参照
* [Technical background of version 1 Bitcoin addresses - Bitcoin Wiki](https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses)
* [List of address prefixes - Bitcoin Wiki](https://en.bitcoin.it/wiki/List_of_address_prefixes)
* [Address - Bitcoin Wiki](https://en.bitcoin.it/wiki/Address)
* [Base58Check encoding - Bitcoin Wiki](https://en.bitcoin.it/wiki/Base58Check_encoding)
* [bitcoin/bitcoin/src/base58.cpp](https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp)
* [精通比特币（第二版）第四章 密钥和地址 · 巴比特图书](http://book.8btc.com/books/6/masterbitcoin2cn/_book/ch04.html)
* [...](https://github.com/mistydew/blockchain)
