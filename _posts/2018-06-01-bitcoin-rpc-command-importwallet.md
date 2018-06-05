---
layout: post
title:  "比特币 RPC 命令剖析 \"importwallet\""
date:   2018-06-01 15:52:09 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
importwallet "filename" # 从一个钱包导出文件（见 `dumpwallet`）导入密钥
{% endhighlight %}

参数：<br>
1. `filename` （字符串，必备）文件名。

结果：无返回值。

## 用法示例

{% highlight shell %}
$ bitcoin-cli dumpwallet wallet.txt
$ ls ~
... wallet.txt ...
$ bitcoin-cli importwallet ~/wallet.txt
{% endhighlight %}

## 源码剖析
`importwallet` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue importwallet(const UniValue& params, bool fHelp); // 导入钱包
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue importwallet(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "importwallet \"filename\"\n"
            "\nImports keys from a wallet dump file (see dumpwallet).\n"
            "\nArguments:\n"
            "1. \"filename\"    (string, required) The wallet file\n"
            "\nExamples:\n"
            "\nDump the wallet\n"
            + HelpExampleCli("dumpwallet", "\"test\"") +
            "\nImport the wallet\n"
            + HelpExampleCli("importwallet", "\"test\"") +
            "\nImport using the json rpc call\n"
            + HelpExampleRpc("importwallet", "\"test\"")
        );

    if (fPruneMode) // 导入钱包在修剪模式下无效
        throw JSONRPCError(RPC_WALLET_ERROR, "Importing wallets is disabled in pruned mode");

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    EnsureWalletIsUnlocked(); // 确保钱包此时未加密

    ifstream file; // 文件输入流对象
    file.open(params[0].get_str().c_str(), std::ios::in | std::ios::ate); // 打开指定文件并立刻定位到文件流结尾
    if (!file.is_open()) // 判断文件的打开状态
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Cannot open wallet dump file");

    int64_t nTimeBegin = chainActive.Tip()->GetBlockTime(); // 获取最佳区块创建时间

    bool fGood = true;

    int64_t nFilesize = std::max((int64_t)1, (int64_t)file.tellg()); // 通过文件指针的位置获取文件大小，用于显示加载进度
    file.seekg(0, file.beg); // 文件指针定位到文件流开头

    pwalletMain->ShowProgress(_("Importing..."), 0); // show progress dialog in GUI
    while (file.good()) { // 文件流状态正常时
        pwalletMain->ShowProgress("", std::max(1, std::min(99, (int)(((double)file.tellg() / (double)nFilesize) * 100))));
        std::string line;
        std::getline(file, line); // 读取一行
        if (line.empty() || line[0] == '#') // 若该行为空 或 行首字符为 '#'
            continue; // 跳过空行 或 注释行

        std::vector<std::string> vstr;
        boost::split(vstr, line, boost::is_any_of(" ")); // 按空格 " " 分隔字符串
        if (vstr.size() < 2) // 字符串个数不能低于 2 个
            continue;
        CBitcoinSecret vchSecret;
        if (!vchSecret.SetString(vstr[0])) // Base58 编码的私钥
            continue;
        CKey key = vchSecret.GetKey(); // 获取私钥
        CPubKey pubkey = key.GetPubKey(); // 计算得到公钥
        assert(key.VerifyPubKey(pubkey)); // 验证公钥私钥是否匹配
        CKeyID keyid = pubkey.GetID(); // 获取公钥索引作为密钥索引
        if (pwalletMain->HaveKey(keyid)) { // 检查密钥索引对应密钥是否存在
            LogPrintf("Skipping import of %s (key already present)\n", CBitcoinAddress(keyid).ToString());
            continue;
        }
        int64_t nTime = DecodeDumpTime(vstr[1]); // 获取并编码时间
        std::string strLabel; // 保存 label 标签的值，账户名
        bool fLabel = true; // 账户标志，默认为 true
        for (unsigned int nStr = 2; nStr < vstr.size(); nStr++) { // 第三个参数，标签类别
            if (boost::algorithm::starts_with(vstr[nStr], "#")) // 没有标签，直接跳出
                break;
            if (vstr[nStr] == "change=1")
                fLabel = false;
            if (vstr[nStr] == "reserve=1")
                fLabel = false;
            if (boost::algorithm::starts_with(vstr[nStr], "label=")) {
                strLabel = DecodeDumpString(vstr[nStr].substr(6)); // 从下标为 6 的字符开始截取字串
                fLabel = true; // 账户标志置为 true
            }
        }
        LogPrintf("Importing %s...\n", CBitcoinAddress(keyid).ToString()); // 记录导入公钥地址
        if (!pwalletMain->AddKeyPubKey(key, pubkey)) { // 把公私对添加到钱包
            fGood = false;
            continue;
        }
        pwalletMain->mapKeyMetadata[keyid].nCreateTime = nTime; // 导入私钥创建时间
        if (fLabel) // 若该密钥有所属账户
            pwalletMain->SetAddressBook(keyid, strLabel, "receive"); // 设置到地址簿并设置其所属账户名
        nTimeBegin = std::min(nTimeBegin, nTime);
    }
    file.close(); // 关闭文件输入流
    pwalletMain->ShowProgress("", 100); // hide progress dialog in GUI

    CBlockIndex *pindex = chainActive.Tip(); // 获取链尖区块索引指针
    while (pindex && pindex->pprev && pindex->GetBlockTime() > nTimeBegin - 7200)
        pindex = pindex->pprev; // 寻找时间相差 2h 的块

    if (!pwalletMain->nTimeFirstKey || nTimeBegin < pwalletMain->nTimeFirstKey)
        pwalletMain->nTimeFirstKey = nTimeBegin;

    LogPrintf("Rescanning last %i blocks\n", chainActive.Height() - pindex->nHeight + 1);
    pwalletMain->ScanForWalletTransactions(pindex); // 从某个块开始扫描块上的交易
    pwalletMain->MarkDirty(); // 标记钱包已改变

    if (!fGood) // 某个密钥添加到钱包失败
        throw JSONRPCError(RPC_WALLET_ERROR, "Error adding some keys to wallet");

    return NullUniValue; // 返回空值
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.修剪模式下禁止导入钱包。<br>
4.钱包上锁。<br>
5.确保钱包当前未加密。<br>
6.创建文件输入流对象打开指定钱包导出文件。<br>
7.获取文件大小，用于加载密钥时显示进度。<br>
8.加载钱包数据：私钥、创建时间、标签。<br>
9.关闭文件输入流对象。<br>
10.标记钱包已改变。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#importwallet)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
