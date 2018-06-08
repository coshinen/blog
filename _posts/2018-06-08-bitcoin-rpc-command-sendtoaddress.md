---
layout: post
title:  "比特币 RPC 命令剖析 \"sendtoaddress\""
date:   2018-06-08 11:10:38 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
sendtoaddress "bitcoinaddress" amount ( "comment" "comment-to" subtractfeefromamount ) # 发送一个金额到指定地址
{% endhighlight %}

参数：<br>
1. `bitcoinaddress` （字符串，必备）要发送到的比特币地址。<br>
2. `amount` （数字型或字符串，必备）要发送的金额。例如 `0.1`。<br>
3. `comment` （字符串，可选）用于存储交易的备注。这不是交易的一部分，只存在你的钱包中。<br>
4. `comment-to` （字符串，可选）存储你要发送交易的个人或组织名的备注。这不是交易的一部分，只存在你的钱包中。<br>
5. `subtractfeefromamount` （布尔型，可选，默认为 false）交易费用将从发送金额中扣除。接收者将收到少于你在金额栏输入数量的比特币。
若该值为 true，则发送金额包含交易费，默认 false，交易费另算。

结果：（字符串）交易索引。

## 用法示例

用法一：向指定地址发送 0.1 BTC。

{% highlight shell %}
$ bitcoin-cli sendtoaddress 1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd 0.1
533ac3682be8723cca63f37a75178155c0b6e69d06606010d5cee1c0f7ccba97
{% endhighlight %}

用法二：向指定地址发送 0.1 BTC，增加交易备注 `donation` 和交易组织名 `seans outpost`。

{% highlight shell %}
$ bitcoin-cli sendtoaddress 1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd 0.1 "donation" "seans outpost"
f3748b3e27f22dbf04eed3d779b54507c839f89dd34c0263f9b4d21928083014
$ bitcoin-cli gettransaction f3748b3e27f22dbf04eed3d779b54507c839f89dd34c0263f9b4d21928083014
{
  "amount": -0.10000000,
  "fee": -0.00000373,
  "confirmations": 23,
  "instantlock": false,
  "blockhash": "000065e66f10b6b4e46558967e213f2973fb746ab077f209e254121983b1e0b6",
  "blockindex": 1,
  "blocktime": 1528443900,
  "txid": "f3748b3e27f22dbf04eed3d779b54507c839f89dd34c0263f9b4d21928083014",
  "walletconflicts": [
  ],
  "time": 1528443879,
  "timereceived": 1528443879,
  "bip125-replaceable": "no",
  "comment": "donation",
  "to": "seans outpost",
  "details": [
    {
      "account": "",
      "address": "1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd",
      "category": "send",
      "amount": -0.10000000,
      "vout": 1,
      "fee": -0.00000373,
      "abandoned": false
    }
  ],
  "hex": "010000000297baccf7c0e1ced5106060069de6b6c0558117757af363ca3c72e82b68c33a53000000006a4730440220301dd1386f1f17937ecbe62193cf94772ea536cb0f2a1ef0721ace1a3086e945022007c1706db1d282022cf99eb66dde50cdd640dadaaf444fd0627b95dc09c2bfa20121026c992de443610f0775ff4ea7eab3fc2c9cecb1ec61383d1f8b0b54b4fdcc45d5feffffff1625da83e5b868b1bedd69b6579449fb2746416e73cc70fc2a8dc6df8b6863b8000000006a47304402202f1dcd475339b71578941fc10ebe3411f14b40b02d1c9a1e7dbeaa6e63c1c1a4022017b38c7628056a083f49728514b00ae1046e94724e8bea80a61c661af92dc7dc012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff02ef8c9800000000001976a914a2fe6cb25949dc7f1da3da93086c164a1bf72ef888ac80969800000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acd0150100"
}
{% endhighlight %}

用法三：向指定地址发送 0.1 BTC，没有备注，发送金额扣掉交易费。

{% highlight shell %}
$ bitcoin-cli sendtoaddress 1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd 0.1 "" "" true
191e845fc0427be5128779cbee8a25b41d2f5cf07eb6df7438c5a67f92104eee
$ bitcoin-cli gettransaction 191e845fc0427be5128779cbee8a25b41d2f5cf07eb6df7438c5a67f92104eee
{
  "amount": -0.09999808,
  "fee": -0.00000192,
  "confirmations": 4,
  "instantlock": false,
  "blockhash": "00001bdcb2a48929fe02ad604a73df673267a00873f2644cb8b2c2278e9bb589",
  "blockindex": 1,
  "blocktime": 1528444190,
  "txid": "191e845fc0427be5128779cbee8a25b41d2f5cf07eb6df7438c5a67f92104eee",
  "walletconflicts": [
  ],
  "time": 1528444187,
  "timereceived": 1528444187,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd",
      "category": "send",
      "amount": -0.09999808,
      "vout": 0,
      "fee": -0.00000192,
      "abandoned": false
    }
  ],
  "hex": "010000000173f50ee4ecd6a810f0177c9ce42a53a7da9579a836d78ded0733397af4d8d72b000000006b483045022100eb59463fd150c1fbc1fd4389e703df7916be15abd4aa294aa40746213f329272022039c089685f4feb23847db90b039a2ba2e41b0c07b63a8d029df46c07d1e0cc61012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff01c0959800000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88ac00160100"
}
{% endhighlight %}

## 源码剖析
`sendtoaddress` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue sendtoaddress(const UniValue& params, bool fHelp); // 发送比特币到指定地址
{% endhighlight %}

实现在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue sendtoaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 验证钱包当前可用
        return NullUniValue;
    
    if (fHelp || params.size() < 2 || params.size() > 5) // 参数至少为 2 个，至多为 5 个
        throw runtime_error( // 命令帮助反馈
            "sendtoaddress \"bitcoinaddress\" amount ( \"comment\" \"comment-to\" subtractfeefromamount )\n"
            "\nSend an amount to a given address.\n"
            + HelpRequiringPassphrase() +
            "\nArguments:\n"
            "1. \"bitcoinaddress\"  (string, required) The bitcoin address to send to.\n"
            "2. \"amount\"      (numeric or string, required) The amount in " + CURRENCY_UNIT + " to send. eg 0.1\n"
            "3. \"comment\"     (string, optional) A comment used to store what the transaction is for. \n"
            "                             This is not part of the transaction, just kept in your wallet.\n"
            "4. \"comment-to\"  (string, optional) A comment to store the name of the person or organization \n"
            "                             to which you're sending the transaction. This is not part of the \n"
            "                             transaction, just kept in your wallet.\n"
            "5. subtractfeefromamount  (boolean, optional, default=false) The fee will be deducted from the amount being sent.\n"
            "                             The recipient will receive less bitcoins than you enter in the amount field.\n"
            "\nResult:\n"
            "\"transactionid\"  (string) The transaction id.\n"
            "\nExamples:\n"
            + HelpExampleCli("sendtoaddress", "\"1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd\" 0.1")
            + HelpExampleCli("sendtoaddress", "\"1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd\" 0.1 \"donation\" \"seans outpost\"")
            + HelpExampleCli("sendtoaddress", "\"1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd\" 0.1 \"\" \"\" true")
            + HelpExampleRpc("sendtoaddress", "\"1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd\", 0.1, \"donation\", \"seans outpost\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    CBitcoinAddress address(params[0].get_str()); // 获取指定的比特币地址
    if (!address.IsValid()) // 验证地址是否有效
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address");

    // Amount
    CAmount nAmount = AmountFromValue(params[1]); // 获取转账金额
    if (nAmount <= 0) // 金额不能小于等于 0
        throw JSONRPCError(RPC_TYPE_ERROR, "Invalid amount for send");

    // Wallet comments // 钱包备注
    CWalletTx wtx; // 一个钱包交易对象
    if (params.size() > 2 && !params[2].isNull() && !params[2].get_str().empty())
        wtx.mapValue["comment"] = params[2].get_str(); // 交易备注
    if (params.size() > 3 && !params[3].isNull() && !params[3].get_str().empty())
        wtx.mapValue["to"]      = params[3].get_str(); // 交易的个人或组织名备注

    bool fSubtractFeeFromAmount = false; // 扣除交易费标志，默认关闭
    if (params.size() > 4)
        fSubtractFeeFromAmount = params[4].get_bool(); // 获取设置

    EnsureWalletIsUnlocked(); // 确保当前钱包处于解密状态

    SendMoney(address.Get(), nAmount, fSubtractFeeFromAmount, wtx); // 发送金额到指定地址

    return wtx.GetHash().GetHex(); // 获取交易哈希，转化为 16 进制并返回
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取相关参数：目标地址，发送金额，交易备注和是否扣除交易费标志。<br>
5.确保钱包当前处于解密状态。<br>
6.发送金额到指定的地址。<br>
7.获取交易哈希，转化为 16 进制并返回。

第六步，调用 SendMoney(address.Get(), nAmount, fSubtractFeeFromAmount, wtx) 发送指定金额到指定比特币地址，
该函数定义在“wallet/rpcwallet.cpp”文件中。

{% highlight C++ %}
static void SendMoney(const CTxDestination &address, CAmount nValue, bool fSubtractFeeFromAmount, CWalletTx& wtxNew)
{
    CAmount curBalance = pwalletMain->GetBalance(); // 获取钱包余额

    // Check amount // 检查发送的金额
    if (nValue <= 0) // 该金额必须为正数
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid amount");

    if (nValue > curBalance) // 要发送的金额不能大于当前钱包余额
        throw JSONRPCError(RPC_WALLET_INSUFFICIENT_FUNDS, "Insufficient funds");

    // Parse Bitcoin address // 解析比特币地址
    CScript scriptPubKey = GetScriptForDestination(address); // 从目标地址中获取脚本

    // Create and send the transaction // 创建并发送交易
    CReserveKey reservekey(pwalletMain); // 初始化一个密钥池密钥对象
    CAmount nFeeRequired; // 所需交易费
    std::string strError; // 错误信息
    vector<CRecipient> vecSend; // 发送列表
    int nChangePosRet = -1;
    CRecipient recipient = {scriptPubKey, nValue, fSubtractFeeFromAmount}; // 初始化一个接收者对象
    vecSend.push_back(recipient); // 加入发送列表
    if (!pwalletMain->CreateTransaction(vecSend, wtxNew, reservekey, nFeeRequired, nChangePosRet, strError)) { // 创建一笔交易
        if (!fSubtractFeeFromAmount && nValue + nFeeRequired > pwalletMain->GetBalance()) // 若发送金额不包含交易费，发送金额与交易费的和不能大于钱包余额
            strError = strprintf("Error: This transaction requires a transaction fee of at least %s because of its amount, complexity, or use of recently received funds!", FormatMoney(nFeeRequired));
        throw JSONRPCError(RPC_WALLET_ERROR, strError);
    }
    if (!pwalletMain->CommitTransaction(wtxNew, reservekey)) // 提交交易
        throw JSONRPCError(RPC_WALLET_ERROR, "Error: The transaction was rejected! This might happen if some of the coins in your wallet were already spent, such as if you used a copy of wallet.dat and coins were spent in the copy but not marked as spent here.");
}
{% endhighlight %}

这里最后调用 pwalletMain->CommitTransaction(wtxNew, reservekey) 提交交易，包含广播。
该函数定义在“wallet/wallet.cpp”文件中。

{% highlight C++ %}
/**
 * Call after CreateTransaction unless you want to abort
 */ // 除非你想要崩溃，在 CreateTransaction 之后调用
bool CWallet::CommitTransaction(CWalletTx& wtxNew, CReserveKey& reservekey)
{
    {
        LOCK2(cs_main, cs_wallet); // 钱包上锁
        LogPrintf("CommitTransaction:\n%s", wtxNew.ToString()); // 记录交易信息
        {
            // This is only to keep the database open to defeat the auto-flush for the // 这只是为了在该期间内保持数据库打开以防自动刷新。
            // duration of this scope.  This is the only place where this optimization // 这是唯一这种优化可能有意义的地方。
            // maybe makes sense; please don't do it anywhere else. // 请不要在其他地方做这个。
            CWalletDB* pwalletdb = fFileBacked ? new CWalletDB(strWalletFile,"r+") : NULL;

            // Take key pair from key pool so it won't be used again // 从密钥池中拿出密钥对，以至它无法再次被使用
            reservekey.KeepKey();

            // Add tx to wallet, because if it has change it's also ours, // 添加交易到钱包，因为如果它有找零也是我们的，
            // otherwise just for transaction history. // 否则仅用于交易交易历史记录。
            AddToWallet(wtxNew, false, pwalletdb);

            // Notify that old coins are spent // 通知旧的币被花费
            set<CWalletTx*> setCoins; // 钱包交易索引集合
            BOOST_FOREACH(const CTxIn& txin, wtxNew.vin) // 遍历新交易的输入列表
            {
                CWalletTx &coin = mapWallet[txin.prevout.hash]; // 获取输入的上一个输出对应的钱包交易
                coin.BindWallet(this); // 绑定钱包，并标记钱包已变动
                NotifyTransactionChanged(this, coin.GetHash(), CT_UPDATED); // 通知钱包交易改变（更新）
            }

            if (fFileBacked) // 若钱包文件已备份
                delete pwalletdb; // 销毁钱包数据库对象
        }

        // Track how many getdata requests our transaction gets
        mapRequestCount[wtxNew.GetHash()] = 0; // 追踪我们的交易获取了多少次 getdata 请求，初始化为 0 次

        if (fBroadcastTransactions) // 若开启了交易广播标志
        {
            // Broadcast // 广播
            if (!wtxNew.AcceptToMemoryPool(false)) // 把交易添加到内存池中
            { // 这步不能失败。该交易已经签署并记录。
                // This must not fail. The transaction has already been signed and recorded.
                LogPrintf("CommitTransaction(): Error: Transaction not valid\n");
                return false;
            }
            wtxNew.RelayWalletTransaction(); // 中继钱包交易
        }
    }
    return true;
}
{% endhighlight %}

在广播交易中，先把该交易添加到交易内存池，然后调用 wtxNew.RelayWalletTransaction() 进行交易的中继。
这里中继的意思是两个节点间进行交易的广播（发送和接收）。该函数定义在“wallet/wallet.cpp”文件中。

{% highlight C++ %}
bool CWalletTx::RelayWalletTransaction()
{
    assert(pwallet->GetBroadcastTransactions()); // 验证钱包是否广播交易
    if (!IsCoinBase()) // 该交易非创币交易
    {
        if (GetDepthInMainChain() == 0 && !isAbandoned()) { // 链深度为 0（即未上链）且 未被标记为已抛弃
            LogPrintf("Relaying wtx %s\n", GetHash().ToString()); // 记录中继交易哈希
            RelayTransaction((CTransaction)*this); // 进行交易中继
            return true;
        }
    }
    return false;
}
{% endhighlight %}

该函数对交易进行了简单的验证，然后调用 RelayTransaction((CTransaction)*this) 开始中继交易，它声明在“net.h”文件中。

{% highlight C++ %}
class CTransaction;
void RelayTransaction(const CTransaction& tx); // 转调下面重载函数
void RelayTransaction(const CTransaction& tx, const CDataStream& ss); // 中继交易
{% endhighlight %}

定义在“net.cpp”文件中。

{% highlight C++ %}
void RelayTransaction(const CTransaction& tx)
{
    CDataStream ss(SER_NETWORK, PROTOCOL_VERSION);
    ss.reserve(10000); // 预开辟 10000 个字节
    ss << tx; // 导入交易
    RelayTransaction(tx, ss); // 开始中继
}

void RelayTransaction(const CTransaction& tx, const CDataStream& ss)
{
    CInv inv(MSG_TX, tx.GetHash()); // 根据交易哈希创建 inv 对象
    {
        LOCK(cs_mapRelay);
        // Expire old relay messages // 使旧的中继数据过期
        while (!vRelayExpiration.empty() && vRelayExpiration.front().first < GetTime())
        { // 中继到期队列非空 且 中继过期队列队头元素过期时间小于当前时间（表示已过期）
            mapRelay.erase(vRelayExpiration.front().second); // 从中继数据映射列表中擦除中继过期队列的队头
            vRelayExpiration.pop_front(); // 中继过期队列出队
        }

        // Save original serialized message so newer versions are preserved // 保存原始的序列化消息，以便保留新版本
        mapRelay.insert(std::make_pair(inv, ss)); // 插入中继数据映射列表
        vRelayExpiration.push_back(std::make_pair(GetTime() + 15 * 60, inv)); // 加上 15min 的过期时间，加入过期队列
    }
    LOCK(cs_vNodes);
    BOOST_FOREACH(CNode* pnode, vNodes) // 遍历当前已建立链接的节点列表
    {
        if(!pnode->fRelayTxes) // 若中继交易状态为 false
            continue; // 跳过该节点
        LOCK(pnode->cs_filter);
        if (pnode->pfilter) // 布鲁姆过滤器
        {
            if (pnode->pfilter->IsRelevantAndUpdate(tx))
                pnode->PushInventory(inv);
        } else // 没有使用 bloom filter
            pnode->PushInventory(inv); // 直接推送 inv 消息到该节点
    }
}
{% endhighlight %}

这里遍历了建立连接的节点链表，调用 pnode->PushInventory(inv) 把 inv 消息发送到对端节点，
该函数定义在“net.h”文件的 CNode 类中。

{% highlight C++ %}
/** Information about a peer */
class CNode // 关于对端节点的信息
{
    ...
    // inventory based relay // 用于中继的库存数据
    CRollingBloomFilter filterInventoryKnown; // 布鲁姆过滤器
    std::vector<CInv> vInventoryToSend; // 发送库存列表
    ...
    void PushInventory(const CInv& inv)
    {
        {
            LOCK(cs_inventory); // 库存上锁
            if (inv.type == MSG_TX && filterInventoryKnown.contains(inv.hash)) // 若为交易类型 且 布鲁姆过滤器包含了该交易所在 inv 的哈希
                return; // 啥也不做直接返回
            vInventoryToSend.push_back(inv); // 否则加入发送库存列表
        }
    }
    ...
};
{% endhighlight %}

最终只是把 inv 消息对象加入到要发送的库存消息列表。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#sendtoaddress)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
