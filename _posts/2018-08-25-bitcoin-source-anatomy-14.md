---
layout: post
title:  "比特币源码剖析（十四）"
date:   2018-08-25 15:07:02 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了第七步加载区块链的详细过程，详见[比特币源码剖析（十三）](/blog/2018/08/bitcoin-source-anatomy-13.html)。<br>
本篇主要分析 Step 8: load wallet 第八步加载钱包的详细过程。

## 源码剖析

<p id="Step08-ref"></p>
3.11.8.第八步，加载钱包。这部分代码实现在“init.cpp”文件的 AppInit2(...) 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 8: load wallet // 若启用钱包功能，则加载钱包
#ifdef ENABLE_WALLET // 1.钱包有效的宏
    if (fDisableWallet) { // 默认 false
        pwalletMain = NULL; // 钱包指针置空
        LogPrintf("Wallet disabled!\n");
    } else {

        // needed to restore wallet transaction meta data after -zapwallettxes // 需要在 -zapwallettxes 后恢复钱包交易元数据
        std::vector<CWalletTx> vWtx; // 钱包交易列表

        if (GetBoolArg("-zapwallettxes", false)) { // 分离钱包交易选项，默认关闭
            uiInterface.InitMessage(_("Zapping all transactions from wallet..."));

            pwalletMain = new CWallet(strWalletFile); // 1.1.创建并初始化钱包对象
            DBErrors nZapWalletRet = pwalletMain->ZapWalletTx(vWtx); // 从钱包中分离所有交易到钱包交易列表
            if (nZapWalletRet != DB_LOAD_OK) {
                uiInterface.InitMessage(_("Error loading wallet.dat: Wallet corrupted"));
                return false;
            }

            delete pwalletMain; // 删除钱包对象
            pwalletMain = NULL; // 指针置空
        }

        uiInterface.InitMessage(_("Loading wallet...")); // 开始加载钱包

        nStart = GetTimeMillis(); // 获取当前时间
        bool fFirstRun = true; // 首次运行标志，初始为 true
        pwalletMain = new CWallet(strWalletFile); // 1.2.创建新的钱包对象
        DBErrors nLoadWalletRet = pwalletMain->LoadWallet(fFirstRun); // 加载钱包到内存（键值对）
        if (nLoadWalletRet != DB_LOAD_OK) // 加载钱包状态错误
        {
            if (nLoadWalletRet == DB_CORRUPT)
                strErrors << _("Error loading wallet.dat: Wallet corrupted") << "\n";
            else if (nLoadWalletRet == DB_NONCRITICAL_ERROR)
            {
                InitWarning(_("Error reading wallet.dat! All keys read correctly, but transaction data"
                             " or address book entries might be missing or incorrect."));
            }
            else if (nLoadWalletRet == DB_TOO_NEW)
                strErrors << _("Error loading wallet.dat: Wallet requires newer version of Bitcoin Core") << "\n";
            else if (nLoadWalletRet == DB_NEED_REWRITE)
            {
                strErrors << _("Wallet needed to be rewritten: restart Bitcoin Core to complete") << "\n";
                LogPrintf("%s", strErrors.str());
                return InitError(strErrors.str());
            }
            else
                strErrors << _("Error loading wallet.dat") << "\n";
        } // 加载钱包成功

        if (GetBoolArg("-upgradewallet", fFirstRun)) // 1.3.升级钱包选项，首次运行标志在这里应该为 false
        {
            int nMaxVersion = GetArg("-upgradewallet", 0);
            if (nMaxVersion == 0) // the -upgradewallet without argument case
            {
                LogPrintf("Performing wallet upgrade to %i\n", FEATURE_LATEST); // 60000
                nMaxVersion = CLIENT_VERSION; // 最大版本为当前客户端版本
                pwalletMain->SetMinVersion(FEATURE_LATEST); // permanently upgrade the wallet immediately // 这里设置的是最小版本
            }
            else
                LogPrintf("Allowing wallet upgrade up to %i\n", nMaxVersion);
            if (nMaxVersion < pwalletMain->GetVersion()) // 若最大版本小于当前钱包版本
                strErrors << _("Cannot downgrade wallet") << "\n";
            pwalletMain->SetMaxVersion(nMaxVersion); // 设置最大版本
        }

        if (fFirstRun) // 1.4.若是首次运行
        {
            // Create new keyUser and set as default key // 创建新用户密钥并设置为默认密钥
            RandAddSeedPerfmon(); // 随机数种子

            CPubKey newDefaultKey; // 新公钥对象
            if (pwalletMain->GetKeyFromPool(newDefaultKey)) { // 从钥匙池取一个公钥
                pwalletMain->SetDefaultKey(newDefaultKey); // 设置该公钥为默认公钥
                if (!pwalletMain->SetAddressBook(pwalletMain->vchDefaultKey.GetID(), "", "receive")) // 设置默认公钥到地址簿默认账户 "" 下，并设置目的为接收
                    strErrors << _("Cannot write default address") << "\n";
            }

            pwalletMain->SetBestChain(chainActive.GetLocator()); // 主钱包设置最佳链，记录最佳块的位置
        }

        LogPrintf("%s", strErrors.str());
        LogPrintf(" wallet      %15dms\n", GetTimeMillis() - nStart); // 记录钱包加载的时间

        RegisterValidationInterface(pwalletMain); // 注册一个钱包用于接收 bitcoin core 的升级

        CBlockIndex *pindexRescan = chainActive.Tip(); // 获取链尖区块索引
        if (GetBoolArg("-rescan", false)) // 1.5.再扫描选项，默认关闭
            pindexRescan = chainActive.Genesis(); // 获取当前链的创世区块索引
        else
        {
            CWalletDB walletdb(strWalletFile); // 通过钱包文件名创建钱包数据库对象
            CBlockLocator locator;
            if (walletdb.ReadBestBlock(locator)) // 获取最佳区块的位置
                pindexRescan = FindForkInGlobalIndex(chainActive, locator); // 在激活的链和最佳区块间找最新的一个公共块
            else
                pindexRescan = chainActive.Genesis();
        }
        if (chainActive.Tip() && chainActive.Tip() != pindexRescan) // 链尖非创世区块也非分叉区块
        {
            //We can't rescan beyond non-pruned blocks, stop and throw an error // 我们无法再扫描超出非修剪的区块，停止或抛出一个错误。
            //this might happen if a user uses a old wallet within a pruned node // 如果用户在已修剪节点中使用旧钱包或者在更长时间中运行的 -disablewallet，
            // or if he ran -disablewallet for a longer time, then decided to re-enable // 则可能发生这种情况。
            if (fPruneMode) // 修剪模式标志，默认为 false
            {
                CBlockIndex *block = chainActive.Tip(); // 获取激活的链尖区块索引
                while (block && block->pprev && (block->pprev->nStatus & BLOCK_HAVE_DATA) && block->pprev->nTx > 0 && pindexRescan != block) // 找到 pindexRescan 所对应区块
                    block = block->pprev;

                if (pindexRescan != block)
                    return InitError(_("Prune: last wallet synchronisation goes beyond pruned data. You need to -reindex (download the whole blockchain again in case of pruned node)"));
            }

            uiInterface.InitMessage(_("Rescanning...")); // 开始再扫描
            LogPrintf("Rescanning last %i blocks (from block %i)...\n", chainActive.Height() - pindexRescan->nHeight, pindexRescan->nHeight); // 记录从 pindexRescan->nHeight 开始再扫描的区块个数
            nStart = GetTimeMillis(); // 记录再扫描的开始时间
            pwalletMain->ScanForWalletTransactions(pindexRescan, true); // 再扫描钱包交易
            LogPrintf(" rescan      %15dms\n", GetTimeMillis() - nStart); // 记录再扫描的用时
            pwalletMain->SetBestChain(chainActive.GetLocator()); // 设置最佳链（内存、数据库）
            nWalletDBUpdated++; // 钱包数据库升级次数加 1

            // Restore wallet transaction metadata after -zapwallettxes=1 // 在 zapwallettxes 选项设置模式 1 后，恢复钱包交易元数据
            if (GetBoolArg("-zapwallettxes", false) && GetArg("-zapwallettxes", "1") != "2")
            { // 该选项设置会删除所有钱包交易且只恢复在启动时通过使用 -rescan 再扫描选项的部分区块链（模式）
                CWalletDB walletdb(strWalletFile); // 创建钱包数据库对象

                BOOST_FOREACH(const CWalletTx& wtxOld, vWtx) // 遍历钱包交易列表
                {
                    uint256 hash = wtxOld.GetHash(); // 获取钱包交易哈希
                    std::map<uint256, CWalletTx>::iterator mi = pwalletMain->mapWallet.find(hash); // 在钱包映射交易映射列表中查找该交易
                    if (mi != pwalletMain->mapWallet.end()) // 若找到
                    { // 更新该笔钱包交易
                        const CWalletTx* copyFrom = &wtxOld;
                        CWalletTx* copyTo = &mi->second;
                        copyTo->mapValue = copyFrom->mapValue;
                        copyTo->vOrderForm = copyFrom->vOrderForm;
                        copyTo->nTimeReceived = copyFrom->nTimeReceived;
                        copyTo->nTimeSmart = copyFrom->nTimeSmart;
                        copyTo->fFromMe = copyFrom->fFromMe;
                        copyTo->strFromAccount = copyFrom->strFromAccount;
                        copyTo->nOrderPos = copyFrom->nOrderPos;
                        copyTo->WriteToDisk(&walletdb); // 写入钱包数据文件中
                    }
                }
            }
        }
        pwalletMain->SetBroadcastTransactions(GetBoolArg("-walletbroadcast", DEFAULT_WALLETBROADCAST)); // 设置广播交易，默认为 true
    } // (!fDisableWallet)
#else // 2.!ENABLE_WALLET
    LogPrintf("No wallet support compiled in!\n");
#endif // !ENABLE_WALLET
    ...
}
{% endhighlight %}

1.若开启钱包功能<br>
1.1.创建并初始化钱包对象，获取钱包交易列表后，删除该钱包对象。<br>
1.2.创建新的钱包对象，并加载钱包到内存中。<br>
1.3.钱包版本号升级。<br>
1.4.若是首次运行，创建新的用户密钥并设置为默认密钥。<br>
1.5.重新扫描钱包。<br>
1.6.设置钱包交易广播。<br>
2.若关闭钱包功能，记录日志跳过此步。<br>

1.1.调用 pwalletMain->ZapWalletTx(vWtx) 获取钱包数据库中的钱包交易列表。
该函数声明在“wallet/wallet.h”文件的 CWallet 类中，实现在“wallet/wallet.cpp”文件中。

{% highlight C++ %}
DBErrors CWallet::ZapWalletTx(std::vector<CWalletTx>& vWtx)
{
    if (!fFileBacked) // 若钱包未备份
        return DB_LOAD_OK; // 返回 0
    DBErrors nZapWalletTxRet = CWalletDB(strWalletFile,"cr+").ZapWalletTx(this, vWtx); // 打开钱包数据库
    if (nZapWalletTxRet == DB_NEED_REWRITE)
    {
        if (CDB::Rewrite(strWalletFile, "\x04pool")) // 重写钱包数据库文件
        {
            LOCK(cs_wallet); // 钱包上锁
            setKeyPool.clear(); // 密钥池集合清空
            // Note: can't top-up keypool here, because wallet is locked. // 注：这里不能填充密钥池，因为钱包已锁定
            // User will be prompted to unlock wallet the next operation // 在需要新密钥的下一个操作时解锁钱包，
            // that requires a new key. // 系统将提示用户。
        }
    }

    if (nZapWalletTxRet != DB_LOAD_OK)
        return nZapWalletTxRet;

    return DB_LOAD_OK;
}
{% endhighlight %}

内部调用 CWalletDB(strWalletFile,"cr+").ZapWalletTx(this, vWtx) 实现获取钱包数据库中的钱包交易列表的功能。
该函数声明在“wallet/walletdb.h”文件的 CWalletDB 类中，实现在“wallet/walletdb.cpp”文件中。

{% highlight C++ %}
DBErrors CWalletDB::ZapWalletTx(CWallet* pwallet, vector<CWalletTx>& vWtx)
{
    // build list of wallet TXs // 构建钱包交易列表
    vector<uint256> vTxHash;
    DBErrors err = FindWalletTx(pwallet, vTxHash, vWtx); // 查询并获取指定钱包的钱包交易哈希和交易对象
    if (err != DB_LOAD_OK)
        return err;

    // erase each wallet TX // 擦除每笔钱包交易
    BOOST_FOREACH (uint256& hash, vTxHash) { // 遍历钱包交易哈希列表
        if (!EraseTx(hash)) // 擦除数据库中的钱包交易
            return DB_CORRUPT;
    }

    return DB_LOAD_OK;
}
{% endhighlight %}

1.2.调用 pwalletMain->LoadWallet(fFirstRun) 从数据库加载钱包到内存中，该函数声明在“wallet.h”文件的 CWallet 中。

{% highlight C++ %}
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    DBErrors LoadWallet(bool& fFirstRunRet); // 加载钱包到内存
    ...
};
{% endhighlight %}

实现在“wallet.cpp”文件中，入参为：首次运行标志（初始为 true）。

{% highlight C++ %}
DBErrors CWallet::LoadWallet(bool& fFirstRunRet)
{
    if (!fFileBacked) // 若非首次运行
        return DB_LOAD_OK; // 返回 0，表示加载完毕
    fFirstRunRet = false; // 首次运行，把该标志置为 false
    DBErrors nLoadWalletRet = CWalletDB(strWalletFile,"cr+").LoadWallet(this); // 从钱包文件中加载钱包到内存
    if (nLoadWalletRet == DB_NEED_REWRITE) // 5 需要重写
    {
        if (CDB::Rewrite(strWalletFile, "\x04pool"))
        {
            LOCK(cs_wallet); // 对钱包上锁
            setKeyPool.clear(); // 清空钥匙池
            // Note: can't top-up keypool here, because wallet is locked. // 注：不能在这里充值钥匙池，因为钱包被锁了。
            // User will be prompted to unlock wallet the next operation // 用户将被提示下一个操作需要一个新密钥来解锁钱包。
            // that requires a new key.
        }
    }

    if (nLoadWalletRet != DB_LOAD_OK) // 若加载错误
        return nLoadWalletRet; // 直接返回加载状态
    fFirstRunRet = !vchDefaultKey.IsValid(); // 否则验证默认公钥是否有效，若有效，设置第一次运行状态为 false

    uiInterface.LoadWallet(this); // UI 交互，加载钱包

    return DB_LOAD_OK; // 0
}
{% endhighlight %}

1.4.调用 pwalletMain->GetKeyFromPool(newDefaultKey) 从密钥池中获取一个新密钥（公钥）。
该函数声明在“wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    bool GetKeyFromPool(CPubKey &key); // 从密钥池中获取一个密钥的公钥
    ...
    void SetBestChain(const CBlockLocator& loc); // 设置最佳链
    ...
    bool SetAddressBook(const CTxDestination& address, const std::string& strName, const std::string& purpose); // 设置地址簿（地址，所属账户，地址用途）
    ...
    bool SetDefaultKey(const CPubKey &vchPubKey); // 设置默认密钥
    ...
};
{% endhighlight %}

实现在“wallet.cpp”文件中，入参为：待获取的新密钥（公钥）。

{% highlight C++ %}
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
        KeepKey(nIndex); // 从钱包数据库的密钥池中移除该密钥
        result = keypool.vchPubKey;
    }
    return true;
}
{% endhighlight %}

然后调用 pwalletMain->SetDefaultKey(newDefaultKey) 把上一步获取的新密钥设置为钱包的默认密钥。
该函数实现在“wallet.cpp”文件中，入参为：刚从密钥池中取出的密钥对应的公钥。

{% highlight C++ %}
bool CWallet::SetDefaultKey(const CPubKey &vchPubKey)
{
    if (fFileBacked)
    {
        if (!CWalletDB(strWalletFile).WriteDefaultKey(vchPubKey)) // 把默认公钥写入钱包数据库 wallet.dat 中
            return false;
    }
    vchDefaultKey = vchPubKey; // 设置该公钥为默认公钥
    return true;
}
{% endhighlight %}

然后调用 pwalletMain->SetAddressBook(pwalletMain->vchDefaultKey.GetID(), "", "receive") 把该默认密钥加入地址簿的默认账户中，用途为接收。
该函数实现在“wallet.cpp”文件中，入参为：公钥索引，帐户名，用途。

{% highlight C++ %}
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
{% endhighlight %}

最后调用 pwalletMain->SetBestChain(chainActive.GetLocator()) 来设置最佳链。
该函数实现在“wallet.cpp”文件中，入参为：激活的链的区块位置。

{% highlight C++ %}
void CWallet::SetBestChain(const CBlockLocator& loc)
{
    CWalletDB walletdb(strWalletFile); // 创建钱包数据库局部对象
    walletdb.WriteBestBlock(loc); // 写入最佳块位置到钱包数据库文件
}
{% endhighlight %}

1.6.调用 pwalletMain->SetBroadcastTransactions(GetBoolArg("-walletbroadcast", DEFAULT_WALLETBROADCAST)); 设置钱包交易广播标志。
该函数实现在“wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
static const bool DEFAULT_WALLETBROADCAST = true; // 钱包交易广播，默认开启
...
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    bool fBroadcastTransactions; // 广播交易的标志
    ...
    DBErrors LoadWallet(bool& fFirstRunRet); // 加载钱包到内存    /** Set whether this wallet broadcasts transactions. */ // 设置该钱包是否广播交易。
    void SetBroadcastTransactions(bool broadcast) { fBroadcastTransactions = broadcast; }
    ...
};
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（十五）](/blog/2018/09/bitcoin-source-anatomy-15.html)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
