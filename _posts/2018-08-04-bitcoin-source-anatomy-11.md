---
layout: post
title:  "比特币源码剖析（十一）"
date:   2018-08-04 10:25:26 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了应用程序初始化中启动 RPC 的详细过程，详见[比特币源码剖析（十）](/blog/2018/07/bitcoin-source-anatomy-10.html)。<br>
本篇主要分析 Step 5: verify wallet database integrity 第五步验证钱包数据库的完整性的详细过程。

## 源码剖析

<p id="Step05-ref"></p>
3.11.5.第五步，验证钱包数据库的完整性。这部分代码实现在“init.cpp”文件的 AppInit2(...) 函数中。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 5: verify wallet database integrity // 验证钱包数据库的完整性
#ifdef ENABLE_WALLET // 前提，ENABLE_WALLET 在 bitcoin-config.h 中定义，通过 ./configure --disable-wallet 来禁用钱包
    if (!fDisableWallet) { // 禁止钱包标志，默认关闭，即默认打开钱包功能
        LogPrintf("Using wallet %s\n", strWalletFile); // 记录钱包文件名（指定/默认）
        uiInterface.InitMessage(_("Verifying wallet...")); // UI 交互，初始化钱包信息

        std::string warningString; // 警告信息
        std::string errorString; // 错误信息

        if (!CWallet::Verify(strWalletFile, warningString, errorString)) // 验证钱包数据库
            return false;

        if (!warningString.empty()) // 警告信息非空
            InitWarning(warningString);
        if (!errorString.empty()) // 错误信息非空
            return InitError(errorString);

    } // (!fDisableWallet)
#endif // ENABLE_WALLET
    ...
};
{% endhighlight %}

这里调用了 CWallet::Verify(strWalletFile, warningString, errorString) 来验证会恢复钱包数据库，
该函数声明在“wallet/wallet.h”文件的 CWallet 类中。

{% highlight C++ %}
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    //! Verify the wallet database and perform salvage if required // 验证钱包数据库，若需要则实施挽救
    static bool Verify(const std::string& walletFile, std::string& warningString, std::string& errorString);
    ...
};
{% endhighlight %}

因为是静态成员函数，不与任何类对象关联（只与所在类相关），所以只能通过“类名::静态成员函数名”的方式调用。<br>
实现在“wallet/wallet.cpp”文件中，入参为：钱包文件位置，待获取的警告信息，待获取的错误信息。

{% highlight C++ %}
bool CWallet::Verify(const string& walletFile, string& warningString, string& errorString)
{
    if (!bitdb.Open(GetDataDir())) // 1.若打开数据库失败
    {
        // try moving the database env out of the way // 尝试移动数据库条目
        boost::filesystem::path pathDatabase = GetDataDir() / "database"; // 拼接数据库目录
        boost::filesystem::path pathDatabaseBak = GetDataDir() / strprintf("database.%d.bak", GetTime()); // 拼接数据库备份路径
        try {
            boost::filesystem::rename(pathDatabase, pathDatabaseBak); // 重命名为数据库备份名，允许失败
            LogPrintf("Moved old %s to %s. Retrying.\n", pathDatabase.string(), pathDatabaseBak.string());
        } catch (const boost::filesystem::filesystem_error&) { // 允许失败（好吧，不是真的，但并不比我们开始时糟）
            // failure is ok (well, not really, but it's not worse than what we started with)
        }
        
        // try again // 再试一次
        if (!bitdb.Open(GetDataDir())) { // 再次打开数据库，若仍失败，可能意味着我们仍然无法创建数据库环境
            // if it still fails, it probably means we can't even create the database env
            string msg = strprintf(_("Error initializing wallet database environment %s!"), GetDataDir());
            errorString += msg; // 追加错误信息
            return true; // 直接返回 true
        }
    }
    
    if (GetBoolArg("-salvagewallet", false)) // 2.拯救钱包选项，默认关闭
    {
        // Recover readable keypairs: // 恢复可读的密钥对：
        if (!CWalletDB::Recover(bitdb, walletFile, true)) // 恢复可读的密钥对
            return false;
    }
    
    if (boost::filesystem::exists(GetDataDir() / walletFile)) // 3.若钱包文件存在
    {
        CDBEnv::VerifyResult r = bitdb.Verify(walletFile, CWalletDB::Recover); // 验证钱包数据库文件，若文件异常，则进行恢复并返回恢复的结果
        if (r == CDBEnv::RECOVER_OK) // 恢复信息追加
        {
            warningString += strprintf(_("Warning: wallet.dat corrupt, data salvaged!"
                                     " Original wallet.dat saved as wallet.{timestamp}.bak in %s; if"
                                     " your balance or transactions are incorrect you should"
                                     " restore from a backup."), GetDataDir());
        }
        if (r == CDBEnv::RECOVER_FAIL)
            errorString += _("wallet.dat corrupt, salvage failed");
    }
    
    return true; // 4.验证成功，返回 true
}
{% endhighlight %}

1.若打开数据库文件失败，尝试重命名后再次打开，得到钱包数据库环境对象。<br>
2.若 -salvagewallet 选项开启，则恢复可读的密钥对。<br>
3.若钱包文件存在，则验证钱包数据库文件，若文件异常，则尝试恢复。<br>
4.验证成功返回 true。

2.调用 CWalletDB::Recover(bitdb, walletFile, true) 尝试恢复钱包可读的密钥对，
该函数声明在“wallet/walletdb.h”文件的 CWalletDB 类中。

{% highlight C++ %}
/** Access to the wallet database (wallet.dat) */ // 访问钱包数据库（wallet.dat）
class CWalletDB : public CDB // 钱包数据库类
{
    ...
    static bool Recover(CDBEnv& dbenv, const std::string& filename, bool fOnlyKeys); // 恢复钱包可读的密钥对
    ...
};
{% endhighlight %}

实现在“wallet/walletdb.cpp”文件中，入参为：钱包数据库环境对象，钱包文件名，true。

{% highlight C++ %}
//
// Try to (very carefully!) recover wallet.dat if there is a problem.
// // 如果发生问题，尝试（非常小心！）恢复 wallet.dat。
bool CWalletDB::Recover(CDBEnv& dbenv, const std::string& filename, bool fOnlyKeys)
{
    // Recovery procedure: // 恢复步骤：
    // move wallet.dat to wallet.timestamp.bak // 1.重命名钱包文件 wallet.dat 为 wallet.timestamp.bak
    // Call Salvage with fAggressive=true to // 2.调用 Salvage 函数挽救钱包数据，fAggressive 标志设为 true，表示开启 DB_AGGRESSIVE 模式
    // get as much data as possible. // 可能获取更多的数据。
    // Rewrite salvaged data to wallet.dat // 3.重写挽救的数据到 wallet.dat
    // Set -rescan so any missing transactions will be // 4.设置 -rescan 以便找回全部丢失的交易。
    // found.
    int64_t now = GetTime(); // 获取当前的时间戳
    std::string newFilename = strprintf("wallet.%d.bak", now); // 1.拼接数据库备份文件名

    int result = dbenv.dbenv->dbrename(NULL, filename.c_str(), NULL,
                                       newFilename.c_str(), DB_AUTO_COMMIT); // 数据库文件重命名
    if (result == 0) // rename 成功
        LogPrintf("Renamed %s to %s\n", filename, newFilename); // 记录日志
    else
    {
        LogPrintf("Failed to rename %s to %s\n", filename, newFilename);
        return false;
    }

    std::vector<CDBEnv::KeyValPair> salvagedData; // 2.挽救数据，KV 键值对列表
    bool fSuccess = dbenv.Salvage(newFilename, true, salvagedData); // 挽救钱包并获取挽救的数据
    if (salvagedData.empty()) // 若挽救的数据为空
    {
        LogPrintf("Salvage(aggressive) found no records in %s.\n", newFilename); // 表明没有在新文件中找到记录
        return false;
    }
    LogPrintf("Salvage(aggressive) found %u records\n", salvagedData.size()); // 记录挽救数据的大小

    boost::scoped_ptr<Db> pdbCopy(new Db(dbenv.dbenv, 0)); // 3.创建数据库副本堆对象，并打开 Berkeley DB
    int ret = pdbCopy->open(NULL,               // Txn pointer
                            filename.c_str(),   // Filename // e.g. "xx/wallet.dat"
                            "main",             // Logical db name
                            DB_BTREE,           // Database type
                            DB_CREATE,          // Flags
                            0);
    if (ret > 0)
    {
        LogPrintf("Cannot create database file %s\n", filename);
        return false;
    }
    CWallet dummyWallet; // 4.假钱包
    CWalletScanState wss; // 钱包扫描状态

    DbTxn* ptxn = dbenv.TxnBegin(); // 交易指针指向交易集中的第一笔交易
    BOOST_FOREACH(CDBEnv::KeyValPair& row, salvagedData) // 反复获取挽救的数据的一行
    {
        if (fOnlyKeys) // true
        {
            CDataStream ssKey(row.first, SER_DISK, CLIENT_VERSION); // key
            CDataStream ssValue(row.second, SER_DISK, CLIENT_VERSION); // value
            string strType, strErr;
            bool fReadOK;
            {
                // Required in LoadKeyMetadata(): // 需要 LoadKeyMetadata()：
                LOCK(dummyWallet.cs_wallet); // 假钱包上锁
                fReadOK = ReadKeyValue(&dummyWallet, ssKey, ssValue,
                                        wss, strType, strErr); // 把一个键值对（反序列化）读入假钱包（内存），并获取键的类型
            }
            if (!IsKeyType(strType)) // 非 Key 类型
                continue;
            if (!fReadOK)
            {
                LogPrintf("WARNING: CWalletDB::Recover skipping %s: %s\n", strType, strErr);
                continue;
            }
        }
        Dbt datKey(&row.first[0], row.first.size()); // 数据库键
        Dbt datValue(&row.second[0], row.second.size()); // 数据库值
        int ret2 = pdbCopy->put(ptxn, &datKey, &datValue, DB_NOOVERWRITE); // 放入数据库副本（文件）
        if (ret2 > 0)
            fSuccess = false;
    }
    ptxn->commit(0); // 5.提交交易，修改的内容将写入稳定的内存
    pdbCopy->close(0); // 关闭数据库副本

    return fSuccess; // 成功返回 true
}
{% endhighlight %}

2.1.重命名钱包文件。<br>
2.2.抢救钱包数据，并获取抢救的数据。<br>
2.3.创建新的数据库堆对象副本，并打开原数据库文件 wallet.dat。<br>
2.4.遍历抢救的数据，把键值对写入数据库副本中。<br>
2.5.提交更新的内容到数据库，并关闭数据库。

2.2.调用 dbenv.Salvage(newFilename, true, salvagedData) 抢救钱包，并获取恢复的数据，
该函数声明在“wallet/db.h”文件的 CDBEnv 类中。

{% highlight C++ %}
class CDBEnv // 数据库环境（钱包）
{
    ...
    /**
     * Salvage data from a file that Verify says is bad.
     * fAggressive sets the DB_AGGRESSIVE flag (see berkeley DB->verify() method documentation).
     * Appends binary key/value pairs to vResult, returns true if successful.
     * NOTE: reads the entire database into memory, so cannot be used
     * for huge databases.
     */ // 从验证一个文件出错抢救数据。fAggressive 设置 DB_AGGRESSIVE 标志（见 berkeley DB->verify() 方法文档）。把二进制键/值对追加到 vResult，如果成功则返回 true。注：把完整的数据库读入内存，所以不能使用过大的数据库。
    typedef std::pair<std::vector<unsigned char>, std::vector<unsigned char> > KeyValPair;
    bool Salvage(const std::string& strFile, bool fAggressive, std::vector<KeyValPair>& vResult); // 抢救钱包并获取抢救数据
    ...
};
{% endhighlight %}

实现在“wallet/db.cpp”文件中，入参为：钱包文件名，true，待获取的恢复的数据。

{% highlight C++ %}
bool CDBEnv::Salvage(const std::string& strFile, bool fAggressive, std::vector<CDBEnv::KeyValPair>& vResult)
{
    LOCK(cs_db); // 数据库上锁
    assert(mapFileUseCount.count(strFile) == 0); // 文件映射列表中不含该新的数据库文件

    u_int32_t flags = DB_SALVAGE; // 抢救标志
    if (fAggressive)
        flags |= DB_AGGRESSIVE;

    stringstream strDump;

    Db db(dbenv, 0); // 创建数据库对象
    int result = db.verify(strFile.c_str(), NULL, &strDump, flags); // 验证新的钱包文件，并获取导出数据
    if (result == DB_VERIFY_BAD) {
        LogPrintf("CDBEnv::Salvage: Database salvage found errors, all data may not be recoverable.\n");
        if (!fAggressive) {
            LogPrintf("CDBEnv::Salvage: Rerun with aggressive mode to ignore errors and continue.\n");
            return false;
        }
    }
    if (result != 0 && result != DB_VERIFY_BAD) { // 若验证结果非 DB_VERIFY_BAD
        LogPrintf("CDBEnv::Salvage: Database salvage failed with result %d.\n", result);
        return false;
    }

    // Format of bdb dump is ascii lines: // bdb 导出格式是 ascii 行：
    // header lines... // 头行...
    // HEADER=END // 头结束
    // hexadecimal key // 16 进制键
    // hexadecimal value // 16 进制值
    // ... repeated // ...重复
    // DATA=END // 数据结束

    string strLine;
    while (!strDump.eof() && strLine != "HEADER=END")
        getline(strDump, strLine); // Skip past header // 跳过头部数据

    std::string keyHex, valueHex;
    while (!strDump.eof() && keyHex != "DATA=END") { // 遍历数据体
        getline(strDump, keyHex); // 获取一行数据
        if (keyHex != "DATA=END") { // 若关键字非 "DATA=END"
            getline(strDump, valueHex); // 再获取一行数据
            vResult.push_back(make_pair(ParseHex(keyHex), ParseHex(valueHex))); // 解析为 16 进制后配对加入结果集
        }
    }

    return (result == 0); // 若抢救成功，返回 false
}
{% endhighlight %}

{% highlight C++ %}
{% endhighlight %}

{% highlight C++ %}
{% endhighlight %}

3.调用 bitdb.Verify(walletFile, CWalletDB::Recover) 验证数据库文件，
该函数声明在“wallet/db.h”文件的 CDBEnv 类中。

{% highlight C++ %}
class CDBEnv // 数据库环境（钱包）
{
    ...
    /**
     * Verify that database file strFile is OK. If it is not,
     * call the callback to try to recover.
     * This must be called BEFORE strFile is opened.
     * Returns true if strFile is OK.
     */ // 验证数据库文件 strFile 正确。若出错，调用回调尝试恢复。必须在 strFile 打开前调用。若 strFile 正确返回 true。
    enum VerifyResult { VERIFY_OK,
                        RECOVER_OK,
                        RECOVER_FAIL };
    VerifyResult Verify(const std::string& strFile, bool (*recoverFunc)(CDBEnv& dbenv, const std::string& strFile)); // 验证钱包数据库
    ...
};
{% endhighlight %}

实现在“wallet/db.cpp”文件中，入参为：钱包文件名，恢复钱包函数入口。

{% highlight C++ %}
CDBEnv::VerifyResult CDBEnv::Verify(const std::string& strFile, bool (*recoverFunc)(CDBEnv& dbenv, const std::string& strFile))
{
    LOCK(cs_db); // 1.临界资源，先上锁保护
    assert(mapFileUseCount.count(strFile) == 0); // 2.该文件不存在于文件使用次数映射列表中

    Db db(dbenv, 0); // 创建数据库对象
    int result = db.verify(strFile.c_str(), NULL, NULL, 0); // 3.验证数据库文件
    if (result == 0) // 数据库文件状态正常
        return VERIFY_OK;
    else if (recoverFunc == NULL) // 数据库文件状态异常，进行数据文件的恢复
        return RECOVER_FAIL;

    // Try to recover: // 4.尝试恢复：
    bool fRecovered = (*recoverFunc)(*this, strFile); // 恢复文件
    return (fRecovered ? RECOVER_OK : RECOVER_FAIL); // 返回恢复的结果
}
{% endhighlight %}

3.1.数据库上锁。<br>
3.2.验证该文件未打开过。<br>
3.3.验证数据库文件。<br>
3.4.若出现异常，则尝试恢复。

未完待续...<br>
请看下一篇[比特币源码剖析（十二）](/blog/2018/08/bitcoin-source-anatomy-12.html)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
