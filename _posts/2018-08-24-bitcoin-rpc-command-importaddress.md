---
layout: post
title:  "比特币 RPC 命令剖析 \"importaddress\""
date:   2018-08-24 08:55:46 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli importaddress "address" ( "label" rescan p2sh )
---
## 提示说明

{% highlight shell %}
importaddress "address" ( "label" rescan p2sh ) # 导入一个脚本（16 进制）或地址用于监视
{% endhighlight %}

该地址好像在你的钱包，但不能用来花费。<br>
这就是所谓的 Watch-only 地址，在新版本中已经可以花费。<br>
参考[如何使用 Watch-only 地址](/blog/2018/06/how-to-use-watch-only-addresses.html)。

参数：<br>
1. script （字符串，必备）16 进制编码的脚本（或地址）。<br>
2. label （字符串，可选，默认为 ""）一个可选的标签（账户名）。<br>
3. rescan （布尔型，可选，默认为 true）再扫描钱包交易。<br>
4. p2sh （布尔型，可选，默认为 true）添加 P2SH 版本的脚本。

**注：如果 rescan 为 true，该调用可能需要数分钟来完成。
如果你有完整的公钥，你应该使用 [importpubkey](/blog/2018/06/bitcoin-rpc-command-importpubkey.html) 代替该命令。**

结果：无返回值。

## 用法示例

### 比特币核心客户端

用法一：导入一个脚本并进行再扫描。

{% highlight shell %}
$ bitcoin-cli getaddressesbyaccount ""
[
  ...
]
$ bitcoin-cli importaddress 1HvgGctUMNkHPwvayRFfPePBjke477ZqsH
$ bitcoin-cli getaddressesbyaccount ""
[
  ...
  "1HvgGctUMNkHPwvayRFfPePBjke477ZqsH"
]
{% endhighlight %}

用法二：导入地址到钱包账户 "testing" 中，并关闭再扫描。

{% highlight shell %}
$ bitcoin-cli getaddressesbyaccount "testing"
[
]
$ bitcoin-cli importaddress 1HvgGctUMNkHPwvayRFfPePBjke477ZqsH
$ bitcoin-cli getaddressesbyaccount "testing"
[
  "1HvgGctUMNkHPwvayRFfPePBjke477ZqsH"
]
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importaddress", "params": ["1HvgGctUMNkHPwvayRFfPePBjke477ZqsH", "testing", false] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
importaddress 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue importaddress(const UniValue& params, bool fHelp); // 导入地址或脚本
{% endhighlight %}

实现在“wallet/rpcdump.cpp”文件中。

{% highlight C++ %}
UniValue importaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 4) // 参数最少为 1 个，最多 4 个
        throw runtime_error( // 命令参数反馈
            "importaddress \"address\" ( \"label\" rescan p2sh )\n"
            "\nAdds a script (in hex) or address that can be watched as if it were in your wallet but cannot be used to spend.\n"
            "\nArguments:\n"
            "1. \"script\"           (string, required) The hex-encoded script (or address)\n"
            "2. \"label\"            (string, optional, default=\"\") An optional label\n"
            "3. rescan               (boolean, optional, default=true) Rescan the wallet for transactions\n"
            "4. p2sh                 (boolean, optional, default=false) Add the P2SH version of the script as well\n"
            "\nNote: This call can take minutes to complete if rescan is true.\n"
            "If you have the full public key, you should call importpublickey instead of this.\n"
            "\nExamples:\n"
            "\nImport a script with rescan\n"
            + HelpExampleCli("importaddress", "\"myscript\"") +
            "\nImport using a label without rescan\n"
            + HelpExampleCli("importaddress", "\"myscript\" \"testing\" false") +
            "\nAs a JSON-RPC call\n"
            + HelpExampleRpc("importaddress", "\"myscript\", \"testing\", false")
        );


    string strLabel = ""; // 账户名，默认为 ""
    if (params.size() > 1)
        strLabel = params[1].get_str(); // 获取账户名或脚本

    // Whether to perform rescan after import // 在导入后是否执行再扫描
    bool fRescan = true; // 再扫描选项，默认开启
    if (params.size() > 2)
        fRescan = params[2].get_bool(); // 获取再扫描设置

    if (fRescan && fPruneMode) // 再扫描和修剪模式不能兼容
        throw JSONRPCError(RPC_WALLET_ERROR, "Rescan is disabled in pruned mode");

    // Whether to import a p2sh version, too
    bool fP2SH = false; // 是否也导入 p2sh 版本的脚本
    if (params.size() > 3)
        fP2SH = params[3].get_bool(); // 获取选项设置

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    CBitcoinAddress address(params[0].get_str()); // 初始化比特币地址
    if (address.IsValid()) { // 若地址有效
        if (fP2SH) // 还开启了 P2SH 标志
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Cannot use the p2sh flag with an address - use a script instead"); // 抛出异常
        ImportAddress(address, strLabel); // 导入地址及其关联账户
    } else if (IsHex(params[0].get_str())) { // 若地址无效，表明是脚本
        std::vector<unsigned char> data(ParseHex(params[0].get_str())); // 把脚本放入 vector 容器中
        ImportScript(CScript(data.begin(), data.end()), strLabel, fP2SH); // 导入脚本
    } else {
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address or script");
    }

    if (fRescan) // 若再扫描开启
    {
        pwalletMain->ScanForWalletTransactions(chainActive.Genesis(), true); // 再扫描钱包交易
        pwalletMain->ReacceptWalletTransactions(); // 把交易放入内存池
    }

    return NullUniValue; // 返回空值
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.处理相关参数。<br>
4.钱包上锁。<br>
5.使用指定地址或脚本初始化一个比特币地址。<br>
6.若该地址有效且未开启 P2SH 选项，导入地址及其关联账户。<br>
7.若该地址无效，表示用户输入的可能是个脚本，导入脚本。<br>
8.若开启了再扫描选项，进行钱包交易再扫描并把交易放入内存池。

第六、七步，调用 ImportAddress(address, strLabel) 和 ImportScript(CScript(data.begin(), data.end()), strLabel, fP2SH) 函数分别导入地址和脚本，它们定义在“wallet/rpcdump.cpp”文件中。

{% highlight C++ %}
void ImportAddress(const CBitcoinAddress& address, const string& strLabel); // 导入地址到钱包
void ImportScript(const CScript& script, const string& strLabel, bool isRedeemScript) // 导入脚本
{
    if (!isRedeemScript && ::IsMine(*pwalletMain, script) == ISMINE_SPENDABLE) // P2SH 类型 且 是自己的脚本
        throw JSONRPCError(RPC_WALLET_ERROR, "The wallet already contains the private key for this address or script");

    pwalletMain->MarkDirty(); // 标记钱包已改变

    if (!pwalletMain->HaveWatchOnly(script) && !pwalletMain->AddWatchOnly(script)) // 若 watch-only 集合中没有指定脚本，则添加该脚本到 watch-only 脚本集合
        throw JSONRPCError(RPC_WALLET_ERROR, "Error adding address to wallet");

    if (isRedeemScript) { // 若为赎回脚本
        if (!pwalletMain->HaveCScript(script) && !pwalletMain->AddCScript(script))
            throw JSONRPCError(RPC_WALLET_ERROR, "Error adding p2sh redeemScript to wallet");
        ImportAddress(CBitcoinAddress(CScriptID(script)), strLabel); // 导入地址及关联账户
    }
}

void ImportAddress(const CBitcoinAddress& address, const string& strLabel)
{
    CScript script = GetScriptForDestination(address.Get()); // 通过脚本索引获取脚本
    ImportScript(script, strLabel, false); // 导入脚本
    // add to address book or update label // 添加到地址簿或更新账户
    if (address.IsValid()) // 若该地址有效
        pwalletMain->SetAddressBook(address.Get(), strLabel, "receive"); // 添加地址及关联账户、用途到地址簿
}
{% endhighlight %}

在 ImportScript(...) 函数中，对公钥地址对应脚本进行了验证，若不在 Watch-only 集中则将其添加到该集合中。<br>
Watch-only 集对象定义在“keystore.h”文件的 CBasicKeyStore 类中，实质上就是一个脚本对象的集合。

{% highlight C++ %}
typedef std::set<CScript> WatchOnlySet; // watch-only 脚本集合

/** Basic key store, that keeps keys in an address->secret map */
class CBasicKeyStore : public CKeyStore // 基础密钥存储，以 address->secret 映射维持私钥
{
protected:
    KeyMap mapKeys; // 私钥和索引的映射列表
    WatchKeyMap mapWatchKeys; // 公钥和索引的映射列表，用于 watch-only
    ScriptMap mapScripts; // 脚本索引映射列表
    WatchOnlySet setWatchOnly; // watch-only 脚本集合
    ...
};
{% endhighlight %}

第八步，调用 pwalletMain->ReacceptWalletTransactions() 函数把交易添加到内存池，该函数定义在“wallet/wallet.cpp”文件中。

{% highlight C++ %}
void CWallet::ReacceptWalletTransactions()
{
    // If transactions aren't being broadcasted, don't let them into local mempool either
    if (!fBroadcastTransactions) // 如果交易未被广播，也不让它们进入本地交易内存池
        return;
    LOCK2(cs_main, cs_wallet); // 钱包上锁
    std::map<int64_t, CWalletTx*> mapSorted; // 位置与钱包交易映射列表

    // Sort pending wallet transactions based on their initial wallet insertion order // 基于它们初始的钱包交易顺序来排序挂起的钱包交易
    BOOST_FOREACH(PAIRTYPE(const uint256, CWalletTx)& item, mapWallet) // 遍历钱包交易映射列表
    {
        const uint256& wtxid = item.first; // 获取交易索引
        CWalletTx& wtx = item.second; // 获取钱包交易
        assert(wtx.GetHash() == wtxid); // 验证交易与其索引是否一致

        int nDepth = wtx.GetDepthInMainChain(); // 获取交易在主链中的深度

        if (!wtx.IsCoinBase() && (nDepth == 0 && !wtx.isAbandoned())) { // 该交易不能是 coinbase 且 该交易深度为 0（表示该交易还未被接受）且该交易未被抛弃
            mapSorted.insert(std::make_pair(wtx.nOrderPos, &wtx)); // 加入临时映射列表
        }
    }

    // Try to add wallet transactions to memory pool // 尝试添加钱包交易到内存池
    BOOST_FOREACH(PAIRTYPE(const int64_t, CWalletTx*)& item, mapSorted) // 遍历该列表
    {
        CWalletTx& wtx = *(item.second); // 获取钱包交易

        LOCK(mempool.cs); // 内存池上锁
        wtx.AcceptToMemoryPool(false); // 把交易放入内存池
    }
}
...
bool CMerkleTx::AcceptToMemoryPool(bool fLimitFree, bool fRejectAbsurdFee)
{
    CValidationState state;
    return ::AcceptToMemoryPool(mempool, state, *this, fLimitFree, NULL, false, fRejectAbsurdFee); // 添加交易到内存池
}
{% endhighlight %}

未完成。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#importaddress)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
