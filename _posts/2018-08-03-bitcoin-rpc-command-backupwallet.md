---
layout: post
title:  "比特币 RPC 命令剖析 \"backupwallet\""
date:   2018-08-03 10:01:05 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli backupwallet "destination"
---
## 提示说明

{% highlight shell %}
backupwallet "destination" # 安全复制 wallet.dat 到目标 destination，它可以是一个目录或一个文件名
{% endhighlight %}

参数：<br>
1.destination（字符串）目标目录或文件。

结果：无返回值。

## 用法示例

### 比特币核心客户端

用法一：备份为指定文件名，默认保存在用户首次使用该命令的工作目录下。<br>
这里在家目录 ~ 下使用该命令。

{% highlight shell %}
$ bitcoin-cli backupwallet backup.dat
$ ls ~
... backup.dat ...
{% endhighlight %}

用法二：备份为指定全路径名的文件。

{% highlight shell %}
$ ls ~/.bitcoin
bitcoind.pid blocks chainstate database db.log debug.log wallet.dat
$ bitcoin-cli backupwallet ~/.bitcoin/backup.dat
$ ls ~/.bitcoin
backup.dat bitcoind.pid blocks chainstate database db.log debug.log wallet.dat
{% endhighlight %}

用法三：备份到指定目录下。

{% highlight shell %}
$ bitcoin-cli backupwallet ~
$ ls ~
... wallet.dat ...
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "backupwallet", "params": ["~/.bitcoin/backup.dat"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
backupwallet 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue backupwallet(const UniValue& params, bool fHelp); // 备份钱包
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue backupwallet(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "backupwallet \"destination\"\n"
            "\nSafely copies wallet.dat to destination, which can be a directory or a path with filename.\n"
            "\nArguments:\n"
            "1. \"destination\"   (string) The destination directory or file\n"
            "\nExamples:\n"
            + HelpExampleCli("backupwallet", "\"backup.dat\"")
            + HelpExampleRpc("backupwallet", "\"backup.dat\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    string strDest = params[0].get_str(); // 获取指定的输出目标
    if (!BackupWallet(*pwalletMain, strDest))
        throw JSONRPCError(RPC_WALLET_ERROR, "Error: Wallet backup failed!");

    return NullUniValue; // 返回空值
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定的备份位置。<br>
5.备份文件（复制原 wallet.dat 文件到指定位置）。

第五步，调用 BackupWallet(*pwalletMain, strDest) 函数复制原钱包数据文件到指定位置，达到备份钱包文件的效果。
该函数声明在“walletdb.h”文件中。

{% highlight C++ %}
bool BackupWallet(const CWallet& wallet, const std::string& strDest); // 备份钱包
{% endhighlight %}

实现在“walletdb.cpp”文件中。

{% highlight C++ %}
bool BackupWallet(const CWallet& wallet, const string& strDest)
{
    if (!wallet.fFileBacked) // 备份文件标志为 true
        return false;
    while (true)
    {
        {
            LOCK(bitdb.cs_db); // 数据库上锁
            if (!bitdb.mapFileUseCount.count(wallet.strWalletFile) || bitdb.mapFileUseCount[wallet.strWalletFile] == 0) // 文件名未使用过 或 文件名存在但使用次数为 0
            {
                // Flush log data to the dat file // 刷新日志数据到数据文件
                bitdb.CloseDb(wallet.strWalletFile);
                bitdb.CheckpointLSN(wallet.strWalletFile);
                bitdb.mapFileUseCount.erase(wallet.strWalletFile);

                // Copy wallet.dat // 复制 wallet.dat 文件
                boost::filesystem::path pathSrc = GetDataDir() / wallet.strWalletFile; // 原 wallet.dat 路径
                boost::filesystem::path pathDest(strDest); // 目标路径
                if (boost::filesystem::is_directory(pathDest)) // 若目标路径为目录
                    pathDest /= wallet.strWalletFile; // 拼接默认钱包文件名 "wallet.dat"

                try {
#if BOOST_VERSION >= 104000 // boost 版本为 104000 之后
                    boost::filesystem::copy_file(pathSrc, pathDest, boost::filesystem::copy_option::overwrite_if_exists); // copy 文件到目标位置，若文件已存在则覆盖
#else
                    boost::filesystem::copy_file(pathSrc, pathDest); // copy 文件到目标位置
#endif
                    LogPrintf("copied wallet.dat to %s\n", pathDest.string()); // 记录日志
                    return true;
                } catch (const boost::filesystem::filesystem_error& e) {
                    LogPrintf("error copying wallet.dat to %s - %s\n", pathDest.string(), e.what());
                    return false;
                }
            }
        }
        MilliSleep(100); // 睡 100 毫秒
    }
    return false;
}
{% endhighlight %}

Thanks for your time.

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#backupwallet){:target="_blank"}
