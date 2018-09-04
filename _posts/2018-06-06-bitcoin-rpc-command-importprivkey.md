---
layout: post
title:  "比特币 RPC 命令剖析 \"importprivkey\""
date:   2018-06-06 15:10:01 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli importprivkey "bitcoinprivkey" ( "label" rescan )
---
## 提示说明

{% highlight shell %}
importprivkey "bitcoinprivkey" ( "label" rescan ) # 导入私钥（通过 `dumpprivkey` 返回）到你的钱包
{% endhighlight %}

参数：<br>
1. `bitcoinprivkey` （字符串，必备）私钥（见 [`dumpprivkey`](/2018/06/06/bitcoin-rpc-command-dumpprivkey)）。<br>
2. `label` （字符串，可选，默认为 ""）一个可选的标签（账户名）。<br>
3. `rescan` （布尔型，可选，默认为 true）再扫描钱包交易。

**注：如果 `rescan` 为 true，该调用可能需要数分钟来完成。**

结果：无返回值。

## 用法示例

### 比特币核心客户端

用法一：在钱包默认账户 `""` 中生成一个新地址，获取其私钥，再导入私钥到账户 `"tabby"` 中。

{% highlight shell %}
$ bitcoin-cli getnewaddress
1HvgGctUMNkHPwvayRFfPePBjke477ZqsH
$ bitcoin-cli dumpprivkey 1HvgGctUMNkHPwvayRFfPePBjke477ZqsH
L4fh51n2P8MpNP8hgNc9kLhS2e525GLNu4NGcWNphiLMRpE8rDGH
$ bitcoin-cli importprivkey L4fh51n2P8MpNP8hgNc9kLhS2e525GLNu4NGcWNphiLMRpE8rDGH "tabby"
$ bitcoin-cli getaddressesbyaccount "tabby"
[
  "1HvgGctUMNkHPwvayRFfPePBjke477ZqsH"
]
{% endhighlight %}

用法二：导入私钥到账户 `"testing"` 中，并关闭再扫描。

{% highlight shell %}
$ bitcoin-cli importprivkey L4fh51n2P8MpNP8hgNc9kLhS2e525GLNu4NGcWNphiLMRpE8rDGH "testing" false
$ bitcoin-cli getaddressesbyaccount "testing"
[
  "1HvgGctUMNkHPwvayRFfPePBjke477ZqsH"
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importprivkey", "params": ["L4fh51n2P8MpNP8hgNc9kLhS2e525GLNu4NGcWNphiLMRpE8rDGH", "testing", false] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`importprivkey` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue importprivkey(const UniValue& params, bool fHelp); // 导入私钥
{% endhighlight %}

实现在“wallet/rpcdump.cpp”文件中。

{% highlight C++ %}
UniValue importprivkey(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 3) // 参数至少为 1 个，至多为 3 个
        throw runtime_error( // 命令帮助反馈
            "importprivkey \"bitcoinprivkey\" ( \"label\" rescan )\n"
            "\nAdds a private key (as returned by dumpprivkey) to your wallet.\n"
            "\nArguments:\n"
            "1. \"bitcoinprivkey\"   (string, required) The private key (see dumpprivkey)\n"
            "2. \"label\"            (string, optional, default=\"\") An optional label\n"
            "3. rescan               (boolean, optional, default=true) Rescan the wallet for transactions\n"
            "\nNote: This call can take minutes to complete if rescan is true.\n"
            "\nExamples:\n"
            "\nDump a private key\n"
            + HelpExampleCli("dumpprivkey", "\"myaddress\"") +
            "\nImport the private key with rescan\n"
            + HelpExampleCli("importprivkey", "\"mykey\"") +
            "\nImport using a label and without rescan\n"
            + HelpExampleCli("importprivkey", "\"mykey\" \"testing\" false") +
            "\nAs a JSON-RPC call\n"
            + HelpExampleRpc("importprivkey", "\"mykey\", \"testing\", false")
        );


    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    EnsureWalletIsUnlocked(); // 确保钱包当前处于解密状态

    string strSecret = params[0].get_str(); // 获取指定的私钥
    string strLabel = ""; // 标签（账户），默认为 ""
    if (params.size() > 1)
        strLabel = params[1].get_str(); // 获取指定的帐户名

    // Whether to perform rescan after import // 在导入私钥后是否执行再扫描
    bool fRescan = true; // 再扫描标志，默认打开
    if (params.size() > 2)
        fRescan = params[2].get_bool(); // 获取指定的再扫描设置

    if (fRescan && fPruneMode) // 再扫描模式和修剪模式不能同时开启，二者不兼容
        throw JSONRPCError(RPC_WALLET_ERROR, "Rescan is disabled in pruned mode");

    CBitcoinSecret vchSecret;
    bool fGood = vchSecret.SetString(strSecret); // 初始化比特币密钥对象

    if (!fGood) throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid private key encoding");

    CKey key = vchSecret.GetKey(); // 获取私钥
    if (!key.IsValid()) throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Private key outside allowed range");

    CPubKey pubkey = key.GetPubKey(); // 获取公钥
    assert(key.VerifyPubKey(pubkey)); // 验证公私钥是否配对
    CKeyID vchAddress = pubkey.GetID(); // 获取公钥索引
    {
        pwalletMain->MarkDirty(); // 标记钱包以改变
        pwalletMain->SetAddressBook(vchAddress, strLabel, "receive"); // 设置地址簿并关联账户指定用途

        // Don't throw error in case a key is already there
        if (pwalletMain->HaveKey(vchAddress)) // 若密钥已存在，不抛出错误
            return NullUniValue; // 直接返回空值

        pwalletMain->mapKeyMetadata[vchAddress].nCreateTime = 1; // 初始化创建时间为 1

        if (!pwalletMain->AddKeyPubKey(key, pubkey)) // 添加公私钥到钱包
            throw JSONRPCError(RPC_WALLET_ERROR, "Error adding key to wallet");

        // whenever a key is imported, we need to scan the whole chain // 无论何时导入密钥，我们都需要扫描整个链
        pwalletMain->nTimeFirstKey = 1; // 0 would be considered 'no value' // 0 会被当作 '没有价值'

        if (fRescan) { // 若开启再扫描
            pwalletMain->ScanForWalletTransactions(chainActive.Genesis(), true); // 再扫描整个钱包交易
        }
    }

    return NullUniValue; // 成功返回空值
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.确保当前钱包处于解密状态。<br>
5.获取指定的参数。<br>
6.初始化比特币密钥对象，并通过密钥获取私钥。<br>
7.通过是私钥计算公钥，并验证公私钥是否配对。<br>
8.获取公钥索引，并查询该密钥是否存在，若存在直接返回空值。<br>
9.若不存在，添加公私钥到钱包。<br>
10.从创世区块开始再扫描钱包交易。

第九步，调用 pwalletMain->AddKeyPubKey(key, pubkey) 函数添加公私钥对到钱包，
该函数定义在“keystore.cpp”文件中。

{% highlight C++ %}
bool CBasicKeyStore::AddKeyPubKey(const CKey& key, const CPubKey &pubkey)
{
    LOCK(cs_KeyStore); // 密钥库上锁
    mapKeys[pubkey.GetID()] = key; // 加入公钥索引和私钥的映射列表
    return true;
}
{% endhighlight %}

这里只是把公私钥对添加到内存中的 mapKeys 对象，并没有本地化到数据库。
该对象定义在“keystore.h”文件的 CBasicKeyStore 类中。

{% highlight C++ %}
typedef std::map<CKeyID, CKey> KeyMap; // 密钥索引和私钥的映射
...
/** Basic key store, that keeps keys in an address->secret map */
class CBasicKeyStore : public CKeyStore // 基础密钥存储，以 address->secret 映射维持私钥
{
protected:
    KeyMap mapKeys; // 密钥索引和私钥的映射列表
    ...
};
{% endhighlight %}

第十步，调用 pwalletMain->ScanForWalletTransactions(chainActive.Genesis(), true) 函数再扫描钱包交易，该函数定义在“wallet.cpp”文件中。

{% highlight C++ %}
/**
 * Scan the block chain (starting in pindexStart) for transactions
 * from or to us. If fUpdate is true, found transactions that already
 * exist in the wallet will be updated.
 */ // 扫描区块链（从 pindexStart 开始）的交易。如果 fUpdate 为 true，在钱包中已存在的找到的交易将会升级。
int CWallet::ScanForWalletTransactions(CBlockIndex* pindexStart, bool fUpdate)
{
    int ret = 0; // 只要升级了一笔，该值就会 +1
    int64_t nNow = GetTime(); // 获取当前时间
    const CChainParams& chainParams = Params(); // 获取链参数

    CBlockIndex* pindex = pindexStart; // 拿到起始区块索引
    {
        LOCK2(cs_main, cs_wallet); // 钱包上锁

        // no need to read and scan block, if block was created before // 如果是在我们的钱包创建之前创建的块，
        // our wallet birthday (as adjusted for block time variability) // 不需要读取和扫描区块信息（根据块时间可变性进行调整）
        while (pindex && nTimeFirstKey && (pindex->GetBlockTime() < (nTimeFirstKey - 7200))) // 若区块时间在钱包创建前 2h
            pindex = chainActive.Next(pindex); // 跳过此区块

        ShowProgress(_("Rescanning..."), 0); // show rescan progress in GUI as dialog or on splashscreen, if -rescan on startup
        double dProgressStart = Checkpoints::GuessVerificationProgress(chainParams.Checkpoints(), pindex, false);
        double dProgressTip = Checkpoints::GuessVerificationProgress(chainParams.Checkpoints(), chainActive.Tip(), false);
        while (pindex) // 若该区块存在
        {
            if (pindex->nHeight % 100 == 0 && dProgressTip - dProgressStart > 0.0) // 扫描进度
                ShowProgress(_("Rescanning..."), std::max(1, std::min(99, (int)((Checkpoints::GuessVerificationProgress(chainParams.Checkpoints(), pindex, false) - dProgressStart) / (dProgressTip - dProgressStart) * 100))));

            CBlock block;
            ReadBlockFromDisk(block, pindex, Params().GetConsensus()); // 从磁盘上读取区块信息
            BOOST_FOREACH(CTransaction& tx, block.vtx) // 遍历区块交易列表
            {
                if (AddToWalletIfInvolvingMe(tx, &block, fUpdate)) // 升级该交易
                    ret++;
            }
            pindex = chainActive.Next(pindex); // 指向下一块
            if (GetTime() >= nNow + 60) { // 时间若超过 60s
                nNow = GetTime(); // 更新时间
                LogPrintf("Still rescanning. At block %d. Progress=%f\n", pindex->nHeight, Checkpoints::GuessVerificationProgress(chainParams.Checkpoints(), pindex));
            }
        }
        ShowProgress(_("Rescanning..."), 100); // hide progress dialog in GUI
    }
    return ret;
}
{% endhighlight %}

未完成。更新交易函数 AddToWalletIfInvolvingMe(tx, &block, fUpdate)。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#importprivkey)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
