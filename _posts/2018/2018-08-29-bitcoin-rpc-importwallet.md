---
layout: post
title:  "比特币 RPC 命令「importwallet」"
date:   2018-08-29 20:52:09 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help importwallet
importwallet "filename"

从一个钱包导出文件（见 dumpwallet）导入。

参数：
1. "filename"（字符串，必备）钱包文件

例子：

导出钱包
> bitcoin-cli dumpwallet "test"

导入钱包
> bitcoin-cli importwallet "test"

使用 json rpc 调用导入
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importwallet", "params": ["test"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`importwallet` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue importwallet(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue importwallet(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1)
        throw runtime_error(
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
        ); // 2. 帮助内容

    if (fPruneMode)
        throw JSONRPCError(RPC_WALLET_ERROR, "Importing wallets is disabled in pruned mode");

    LOCK2(cs_main, pwalletMain->cs_wallet);

    EnsureWalletIsUnlocked(); // 3. 确保钱包被解锁

    ifstream file;
    file.open(params[0].get_str().c_str(), std::ios::in | std::ios::ate); // 打开指定文件并立刻定位到文件流结尾
    if (!file.is_open())
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

    return NullUniValue;
}
```

### 1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#1-确保钱包可用)。

### 2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
