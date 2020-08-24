---
layout: post
title:  "比特币 RPC 命令剖析 \"sendtoaddress\""
date:   2018-09-18 20:10:38 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli sendtoaddress "bitcoinaddress" amount ( "comment" "comment-to" subtractfeefromamount )
---
## 提示说明

```shell
sendtoaddress "bitcoinaddress" amount ( "comment" "comment-to" subtractfeefromamount ) # 发送一笔金额到指定地址
```

参数：
1. bitcoinaddress（字符串，必备）要发送到的比特币地址。
2. amount（数字或字符串，必备）以 BTC 为单位的发送的金额。例 0.1。
3. comment（字符串，可选）用于存储交易的备注。这不是交易的一部分，只保存在你的钱包中。
4. comment-to（字符串，可选）存储你要发送交易的个人或组织名的备注。这不是交易的一部分，只保存在你的钱包中。
5. subtractfeefromamount（布尔型，可选，默认为 false）交易费将从发送金额中扣除。接收者将收到少于你在金额栏输入的比特币。
若该值为 true，则发送金额包含交易费，默认 false，交易费另算。

结果：（字符串）返回交易索引。

## 用法示例

### 比特币核心客户端

**使用该命令前，先调用 [walletpassphrase](/blog/2018/09/bitcoin-rpc-command-walletpassphrase.html) 解锁钱包，<br>
使用该命令后，再调用 [walletlock](/blog/2018/09/bitcoin-rpc-command-walletlock.html) 锁定钱包。**

用法一：向指定地址发送 0.1 BTC。

```shell
$ bitcoin-cli sendtoaddress 1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd 0.1
533ac3682be8723cca63f37a75178155c0b6e69d06606010d5cee1c0f7ccba97
$ bitcoin-cli gettransaction 533ac3682be8723cca63f37a75178155c0b6e69d06606010d5cee1c0f7ccba97
{
  "amount": -0.10000000,
  "fee": -0.00000226,
  "confirmations": 9,
  "blockhash": "000065e66f10b6b4e46558967e213f2973fb746ab077f209e254121983b1e0b6",
  "blockindex": 1,
  "blocktime": 1528443900,
  "txid": "533ac3682be8723cca63f37a75178155c0b6e69d06606010d5cee1c0f7ccba97",
  "walletconflicts": [
  ],
  "time": 1528443879,
  "timereceived": 1528443879,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd",
      "category": "send",
      "amount": -0.10000000,
      "label": "",
      "vout": 1,
      "fee": -0.00000226,
      "abandoned": false
    }
  ],
  "hex": "010000000297baccf7c0e1ced5106060069de6b6c0558117757af363ca3c72e82b68c33a53000000006a4730440220301dd1386f1f17937ecbe62193cf94772ea536cb0f2a1ef0721ace1a3086e945022007c1706db1d282022cf99eb66dde50cdd640dadaaf444fd0627b95dc09c2bfa20121026c992de443610f0775ff4ea7eab3fc2c9cecb1ec61383d1f8b0b54b4fdcc45d5feffffff1625da83e5b868b1bedd69b6579449fb2746416e73cc70fc2a8dc6df8b6863b8000000006a47304402202f1dcd475339b71578941fc10ebe3411f14b40b02d1c9a1e7dbeaa6e63c1c1a4022017b38c7628056a083f49728514b00ae1046e94724e8bea80a61c661af92dc7dc012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff02ef8c9800000000001976a914a2fe6cb25949dc7f1da3da93086c164a1bf72ef888ac80969800000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acd0150100"
}
```

用法二：向指定地址发送 0.1 BTC，增加交易备注 donation 和交易组织名 seans outpost。

```shell
$ bitcoin-cli sendtoaddress 1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd 0.1 "donation" "seans outpost"
f3748b3e27f22dbf04eed3d779b54507c839f89dd34c0263f9b4d21928083014
$ bitcoin-cli gettransaction f3748b3e27f22dbf04eed3d779b54507c839f89dd34c0263f9b4d21928083014
{
  "amount": -0.10000000,
  "fee": -0.00000374,
  "confirmations": 0,
  "trusted": true,
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
      "label": "",
      "vout": 0,
      "fee": -0.00000374,
      "abandoned": false
    }
  ],
  "hex": "010000000297baccf7c0e1ced5106060069de6b6c0558117757af363ca3c72e82b68c33a53000000006a4730440220301dd1386f1f17937ecbe62193cf94772ea536cb0f2a1ef0721ace1a3086e945022007c1706db1d282022cf99eb66dde50cdd640dadaaf444fd0627b95dc09c2bfa20121026c992de443610f0775ff4ea7eab3fc2c9cecb1ec61383d1f8b0b54b4fdcc45d5feffffff1625da83e5b868b1bedd69b6579449fb2746416e73cc70fc2a8dc6df8b6863b8000000006a47304402202f1dcd475339b71578941fc10ebe3411f14b40b02d1c9a1e7dbeaa6e63c1c1a4022017b38c7628056a083f49728514b00ae1046e94724e8bea80a61c661af92dc7dc012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff02ef8c9800000000001976a914a2fe6cb25949dc7f1da3da93086c164a1bf72ef888ac80969800000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88acd0150100"
}
```

用法三：向指定地址发送 0.1 BTC，没有备注，从发送金额中扣掉交易费。

```shell
$ bitcoin-cli sendtoaddress 1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd 0.1 "" "" true
191e845fc0427be5128779cbee8a25b41d2f5cf07eb6df7438c5a67f92104eee
$ bitcoin-cli gettransaction 191e845fc0427be5128779cbee8a25b41d2f5cf07eb6df7438c5a67f92104eee
{
  "amount": -0.09999808,
  "fee": -0.00000192,
  "confirmations": 4,
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
      "label": "",
      "vout": 0,
      "fee": -0.00000192,
      "abandoned": false
    }
  ],
  "hex": "010000000173f50ee4ecd6a810f0177c9ce42a53a7da9579a836d78ded0733397af4d8d72b000000006b483045022100eb59463fd150c1fbc1fd4389e703df7916be15abd4aa294aa40746213f329272022039c089685f4feb23847db90b039a2ba2e41b0c07b63a8d029df46c07d1e0cc61012102ef09fb034dc26337de85e77c6b519bfeb2500f2cd69ca4c0c34e5425144ffaa0feffffff01c0959800000000001976a9149dd5d8f38714a8b07a4e702777d445d388805ebd88ac00160100"
}
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendtoaddress", "params": ["1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd", 0.1, "donation", "seans outpost"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"f3748b3e27f22dbf04eed3d779b54507c839f89dd34c0263f9b4d21928083014","error":null,"id":"curltest"}
```

## 源码剖析

sendtoaddress 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue sendtoaddress(const UniValue& params, bool fHelp); // 发送比特币到指定地址
```

实现在“wallet/rpcwallet.cpp”文件中。

```cpp
UniValue sendtoaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1.确保钱包当前可用
        return NullUniValue;
    
    if (fHelp || params.size() < 2 || params.size() > 5) // 2.参数至少为 2 个，至多为 5 个
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

    LOCK2(cs_main, pwalletMain->cs_wallet); // 3.钱包上锁

    CBitcoinAddress address(params[0].get_str()); // 4.获取指定的比特币地址
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

    EnsureWalletIsUnlocked(); // 5.确保钱包当前处于解密状态

    SendMoney(address.Get(), nAmount, fSubtractFeeFromAmount, wtx); // 6.发送金额到指定地址

    return wtx.GetHash().GetHex(); // 7.获取交易哈希，转化为 16 进制并返回
}
```

基本流程：
1. 确保钱包当前可用（已初始化完成）。
2. 处理命令帮助和参数个数。
3. 钱包上锁。
4. 获取相关参数：目标地址，发送金额，交易备注和是否扣除交易费标志。
5. 确保钱包当前处于解密状态。
6. 发送金额到指定的地址。
7. 获取交易哈希，转化为 16 进制并返回。

6.调用 SendMoney(address.Get(), nAmount, fSubtractFeeFromAmount, wtx) 发送指定金额到指定比特币地址，
该函数定义在“wallet/rpcwallet.cpp”文件中，入参为：交易目的地址，金额，从金额中减去交易费标志，添加了备注的钱包交易。

```cpp
static void SendMoney(const CTxDestination &address, CAmount nValue, bool fSubtractFeeFromAmount, CWalletTx& wtxNew)
{
    CAmount curBalance = pwalletMain->GetBalance(); // 1.获取钱包余额

    // Check amount // 检查发送的金额
    if (nValue <= 0) // 该金额必须为正数
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Invalid amount");

    if (nValue > curBalance) // 要发送的金额不能大于当前钱包余额
        throw JSONRPCError(RPC_WALLET_INSUFFICIENT_FUNDS, "Insufficient funds");

    // Parse Bitcoin address // 解析比特币地址
    CScript scriptPubKey = GetScriptForDestination(address); // 2.从目标地址中获取脚本

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
    if (!pwalletMain->CommitTransaction(wtxNew, reservekey)) // 3.提交交易
        throw JSONRPCError(RPC_WALLET_ERROR, "Error: The transaction was rejected! This might happen if some of the coins in your wallet were already spent, such as if you used a copy of wallet.dat and coins were spent in the copy but not marked as spent here.");
}
```

6.1.获取钱包当前余额，检查发送的金额与钱包余额是否冲突。<br>
6.2.从目的地址中获取脚本公钥，初始化接收者并加入发送列表，创建交易。<br>
6.3.提交交易。

6.2.从目的地址中获取脚本公钥，初始化接收者并加入发送列表，调用 pwalletMain->CreateTransaction(vecSend, wtxNew, reservekey, nFeeRequired, nChangePosRet, strError) 创建一笔交易。
该函数声明在“wallet/wallet.h”文件的CWallet类中。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */ // CWallet 是密钥库的扩展，可以维持一组交易和余额，并提供创建新交易的能力。
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    /**
     * Create a new transaction paying the recipients with a set of coins
     * selected by SelectCoins(); Also create the change output, when needed
     */ // 通过 SelectCoins() 筛选的一组金额创建一笔支付给接收者新交易；在需要时也创建找零输出。
    bool CreateTransaction(const std::vector<CRecipient>& vecSend, CWalletTx& wtxNew, CReserveKey& reservekey, CAmount& nFeeRet, int& nChangePosRet,
                           std::string& strFailReason, const CCoinControl *coinControl = NULL, bool sign = true);
    ...
};
```

定义在“wallet/wallet.cpp”文件中。入参为：发送列表，待创建的新钱包交易，密钥池条目，待计算所需交易费，找零输出的位置，错误信息。

```cpp
bool CWallet::CreateTransaction(const vector<CRecipient>& vecSend, CWalletTx& wtxNew, CReserveKey& reservekey, CAmount& nFeeRet,
                                int& nChangePosRet, std::string& strFailReason, const CCoinControl* coinControl, bool sign)
{
    CAmount nValue = 0; // 1.记录发送的总金额
    unsigned int nSubtractFeeFromAmount = 0; // 从发送金额减去的总交易费
    BOOST_FOREACH (const CRecipient& recipient, vecSend) // 遍历发送列表
    {
        if (nValue < 0 || recipient.nAmount < 0) // 发送金额为负数
        {
            strFailReason = _("Transaction amounts must be positive"); // 创建交易失败
            return false;
        }
        nValue += recipient.nAmount; // 累加发送金额

        if (recipient.fSubtractFeeFromAmount) // 若从金额中减去交易费
            nSubtractFeeFromAmount++; // 减去交易费累加
    }
    if (vecSend.empty() || nValue < 0) // 发送列表为空 或 发送的总金额为负数
    {
        strFailReason = _("Transaction amounts must be positive"); // 创建交易失败
        return false;
    }

    wtxNew.fTimeReceivedIsTxTime = true; // 接收时间是交易时间标志置为 true
    wtxNew.BindWallet(this); // 交易绑定当前钱包
    CMutableTransaction txNew; // 易变的交易对象

    // Discourage fee sniping. // 阻止交易费用。
    //
    // For a large miner the value of the transactions in the best block and
    // the mempool can exceed the cost of deliberately attempting to mine two
    // blocks to orphan the current best block. By setting nLockTime such that
    // only the next block can include the transaction, we discourage this
    // practice as the height restricted and limited blocksize gives miners
    // considering fee sniping fewer options for pulling off this attack.
    //
    // A simple way to think about this is from the wallet's point of view we
    // always want the blockchain to move forward. By setting nLockTime this
    // way we're basically making the statement that we only want this
    // transaction to appear in the next block; we don't want to potentially
    // encourage reorgs by allowing transactions to appear at lower heights
    // than the next block in forks of the best chain.
    //
    // Of course, the subsidy is high enough, and transaction volume low
    // enough, that fee sniping isn't a problem yet, but by implementing a fix
    // now we ensure code won't be written that makes assumptions about
    // nLockTime that preclude a fix later.
    txNew.nLockTime = chainActive.Height(); // 获取激活的链高度作为该交易的锁定时间

    // Secondly occasionally randomly pick a nLockTime even further back, so
    // that transactions that are delayed after signing for whatever reason,
    // e.g. high-latency mix networks and some CoinJoin implementations, have
    // better privacy. // 其次偶尔会随机选择一个锁定时间，处于任何原因在签名后延迟的交易。
    if (GetRandInt(10) == 0) // 若随机数为 0
        txNew.nLockTime = std::max(0, (int)txNew.nLockTime - GetRandInt(100)); // 使用一个相对随机时间作为锁定时间

    assert(txNew.nLockTime <= (unsigned int)chainActive.Height()); // 锁定时间必须小于等于当前激活的链高度
    assert(txNew.nLockTime < LOCKTIME_THRESHOLD); // 锁定时间必须小于其阈值

    {
        LOCK2(cs_main, cs_wallet); // 钱包上锁
        {
            nFeeRet = 0;
            // Start with no fee and loop until there is enough fee // 开始时没有交易费，循环直到有足够的交易费
            while (true)
            {
                txNew.vin.clear(); // 清空交易输入列表
                txNew.vout.clear(); // 清空交易输出列表
                wtxNew.fFromMe = true; // 标记为自己发出的交易
                nChangePosRet = -1;
                bool fFirst = true; // 第一次循环标志

                CAmount nValueToSelect = nValue; // 要发送的总金额
                if (nSubtractFeeFromAmount == 0) // 若不需要从金额中减去交易费
                    nValueToSelect += nFeeRet; // 发送的金额加上交易费
                double dPriority = 0; // 优先级
                // vouts to the payees // 输出到收款人
                BOOST_FOREACH (const CRecipient& recipient, vecSend) // 3.遍历发送列表
                {
                    CTxOut txout(recipient.nAmount, recipient.scriptPubKey); // 构造交易输出对象

                    if (recipient.fSubtractFeeFromAmount) // 若从金额中减去交易费
                    {
                        txout.nValue -= nFeeRet / nSubtractFeeFromAmount; // Subtract fee equally from each selected recipient // 减去平均要减去的交易费（本笔交易 / 总共要减去的交易费）

                        if (fFirst) // first receiver pays the remainder not divisible by output count
                        { // 若是第一次循环
                            fFirst = false; // 首次循环标志置为 false
                            txout.nValue -= nFeeRet % nSubtractFeeFromAmount; // 输出金额再减去多出来的部分
                        }
                    }

                    if (txout.IsDust(::minRelayTxFee)) // 根据最小中继交易费判断该交易是否为粉尘交易
                    {
                        if (recipient.fSubtractFeeFromAmount && nFeeRet > 0) // 若需减去交易费 且 交易费大于 0
                        {
                            if (txout.nValue < 0) // 若交易输出的金额为负数
                                strFailReason = _("The transaction amount is too small to pay the fee");
                            else
                                strFailReason = _("The transaction amount is too small to send after the fee has been deducted");
                        }
                        else
                            strFailReason = _("Transaction amount too small");
                        return false; // 创建交易失败
                    } // 非粉尘交易
                    txNew.vout.push_back(txout); // 加入交易输出列表
                }

                // Choose coins to use // 4.选择要使用的币
                set<pair<const CWalletTx*,unsigned int> > setCoins; // 硬币集合
                CAmount nValueIn = 0; // 记录选择的硬币总金额
                if (!SelectCoins(nValueToSelect, setCoins, nValueIn, coinControl)) // 选择硬币
                {
                    strFailReason = _("Insufficient funds");
                    return false; // 创建交易失败
                }
                BOOST_FOREACH(PAIRTYPE(const CWalletTx*, unsigned int) pcoin, setCoins) // 5.遍历硬币集合
                {
                    CAmount nCredit = pcoin.first->vout[pcoin.second].nValue; // 获取钱包交易输出金额
                    //The coin age after the next block (depth+1) is used instead of the current, // 使用下一个块（深度+1）之后的币龄代替当前，
                    //reflecting an assumption the user would accept a bit more delay for
                    //a chance at a free transaction. // 反应了用户会在免费交易中更多延迟以获得机会的假设。
                    //But mempool inputs might still be in the mempool, so their age stays 0 // 但内存池输入可能仍然在内存池中，所以它们的币龄为 0
                    int age = pcoin.first->GetDepthInMainChain(); // 获取交易深度作为币龄
                    assert(age >= 0); // 检测币龄
                    if (age != 0)
                        age += 1;
                    dPriority += (double)nCredit * age; // 币龄和币数量用于计算优先级
                }

                const CAmount nChange = nValueIn - nValueToSelect; // 6.找零
                if (nChange > 0) // 大于 0 表示存在找零
                {
                    // Fill a vout to ourself // 填充一个输出列表到我们自己
                    // TODO: pass in scriptChange instead of reservekey so // TODO：传递找零脚本而非 reservekey
                    // change transaction isn't always pay-to-bitcoin-address // 所以找零交易不总是 P2PKH
                    CScript scriptChange; // 创建一个找零脚本

                    // coin control: send change to custom address // 币控制：发送找零到指定地址
                    if (coinControl && !boost::get<CNoDestination>(&coinControl->destChange))
                        scriptChange = GetScriptForDestination(coinControl->destChange); // 从找零地址获取找零脚本

                    // no coin control: send change to newly generated address
                    else // 非币控制：发送找零到新生成的地址
                    {
                        // Note: We use a new key here to keep it from being obvious which side is the change.
                        //  The drawback is that by not reusing a previous key, the change may be lost if a
                        //  backup is restored, if the backup doesn't have the new private key for the change.
                        //  If we reused the old key, it would be possible to add code to look for and
                        //  rediscover unknown transactions that were written with keys of ours to recover
                        //  post-backup change.

                        // Reserve a new key pair from key pool // 从密钥池拿一个密钥对
                        CPubKey vchPubKey;
                        bool ret;
                        ret = reservekey.GetReservedKey(vchPubKey); // 从密钥池获取一个公钥
                        assert(ret); // should never fail, as we just unlocked // 应该不会失败，因为我们刚解锁

                        scriptChange = GetScriptForDestination(vchPubKey.GetID()); // 根据公钥索引获取找零脚本
                    }

                    CTxOut newTxOut(nChange, scriptChange); // 通过找零金额和脚本创建一笔新的交易输出

                    // We do not move dust-change to fees, because the sender would end up paying more than requested. // 我们不会把粉尘找零转到交易费，因为发送者最终会支付超过请求的费用。
                    // This would be against the purpose of the all-inclusive feature. // 这将违背包含全部功能的目的。
                    // So instead we raise the change and deduct from the recipient. // 所以我们提高找零并减少接收者金额。
                    if (nSubtractFeeFromAmount > 0 && newTxOut.IsDust(::minRelayTxFee)) // 从金额中减去的交易费大于 0 且 新交易输出是粉尘交易（通过最小中继交易费判断）
                    {
                        CAmount nDust = newTxOut.GetDustThreshold(::minRelayTxFee) - newTxOut.nValue; // 计算粉尘金额
                        newTxOut.nValue += nDust; // raise change until no more dust // 增加找零直到没有粉尘
                        for (unsigned int i = 0; i < vecSend.size(); i++) // subtract from first recipient // 从第一个接收者中减去
                        { // 遍历发送列表
                            if (vecSend[i].fSubtractFeeFromAmount)
                            {
                                txNew.vout[i].nValue -= nDust; // 减去粉尘
                                if (txNew.vout[i].IsDust(::minRelayTxFee)) // 若交易输出是粉尘
                                {
                                    strFailReason = _("The transaction amount is too small to send after the fee has been deducted");
                                    return false; // 创建交易失败
                                }
                                break; // 只改变第一个，所以跳出
                            }
                        }
                    }

                    // Never create dust outputs; if we would, just
                    // add the dust to the fee. // 从不创建粉尘输出；如果我们想，只添加粉尘到交易费
                    if (newTxOut.IsDust(::minRelayTxFee)) // 新的交易输出是粉尘
                    {
                        nFeeRet += nChange; // 增加找零到交易费
                        reservekey.ReturnKey(); // 把找零地址对应密钥放回密钥池
                    }
                    else
                    { // 输出不是粉尘
                        // Insert change txn at random position:
                        nChangePosRet = GetRandInt(txNew.vout.size()+1); // 获取一个随机位置
                        vector<CTxOut>::iterator position = txNew.vout.begin()+nChangePosRet;
                        txNew.vout.insert(position, newTxOut); // 插入找零交易到交易输出列表的随机位置
                    }
                } // 否则不存在找零
                else
                    reservekey.ReturnKey(); // 把密钥放回密钥池

                // Fill vin // 7.填充输入列表
                //
                // Note how the sequence number is set to max()-1 so that the
                // nLockTime set above actually works. // 注：序号如何设置到 max()-1 以至上面设置的锁定时间实际工作。
                BOOST_FOREACH(const PAIRTYPE(const CWalletTx*,unsigned int)& coin, setCoins) // 遍历币集合
                    txNew.vin.push_back(CTxIn(coin.first->GetHash(),coin.second,CScript(), // 加入交易输入列表
                                              std::numeric_limits<unsigned int>::max()-1));

                // Sign // 8.签名
                int nIn = 0; // 输入索引
                CTransaction txNewConst(txNew); // 通过易变的交易构建一笔不变的交易
                BOOST_FOREACH(const PAIRTYPE(const CWalletTx*,unsigned int)& coin, setCoins) // 遍历币集合
                {
                    bool signSuccess; // 签名状态
                    const CScript& scriptPubKey = coin.first->vout[coin.second].scriptPubKey; // 获取脚本公钥
                    CScript& scriptSigRes = txNew.vin[nIn].scriptSig; // 获取脚本签名的引用
                    if (sign) // true 进行签名
                        signSuccess = ProduceSignature(TransactionSignatureCreator(this, &txNewConst, nIn, SIGHASH_ALL), scriptPubKey, scriptSigRes); // 进行签名
                    else
                        signSuccess = ProduceSignature(DummySignatureCreator(this), scriptPubKey, scriptSigRes);

                    if (!signSuccess) // 签名失败
                    {
                        strFailReason = _("Signing transaction failed");
                        return false;
                    }
                    nIn++; // 交易输入序号加 1
                }

                unsigned int nBytes = ::GetSerializeSize(txNew, SER_NETWORK, PROTOCOL_VERSION); // 获取序列化后交易的字节数

                // Remove scriptSigs if we used dummy signatures for fee calculation
                if (!sign) { // 如果我们使用虚拟签名进行计费，则移除脚本签名
                    BOOST_FOREACH (CTxIn& vin, txNew.vin) // 遍历交易输入列表
                        vin.scriptSig = CScript(); // 创建空脚本
                }

                // Embed the constructed transaction data in wtxNew. // 9.把构造的交易嵌入到 txNew
                *static_cast<CTransaction*>(&wtxNew) = CTransaction(txNew);

                // Limit size // 限制交易大小
                if (nBytes >= MAX_STANDARD_TX_SIZE) // 序列化的交易大小必须小于交易大小上限
                {
                    strFailReason = _("Transaction too large");
                    return false; // 创建交易失败
                }

                dPriority = wtxNew.ComputePriority(dPriority, nBytes); // 计算交易优先级

                // Can we complete this as a free transaction? // 我们可以把它作为免费交易来完成吗？
                if (fSendFreeTransactions && nBytes <= MAX_FREE_TRANSACTION_CREATE_SIZE) // 若免费发送 且 交易大小小于等于免费交易阈值
                {
                    // Not enough fee: enough priority? // 没有足够的交易费：足够的优先级？
                    double dPriorityNeeded = mempool.estimateSmartPriority(nTxConfirmTarget); // 智能估计优先级
                    // Require at least hard-coded AllowFree. // 至少需要硬编的 AllowFree
                    if (dPriority >= dPriorityNeeded && AllowFree(dPriority))
                        break;
                }

                CAmount nFeeNeeded = GetMinimumFee(nBytes, nTxConfirmTarget, mempool); // 获取所需最小交易费
                if (coinControl && nFeeNeeded > 0 && coinControl->nMinimumTotalFee > nFeeNeeded) {
                    nFeeNeeded = coinControl->nMinimumTotalFee;
                }

                // If we made it here and we aren't even able to meet the relay fee on the next pass, give up // 如果我们做到这里，且我们无法满足下次的中继交易费，放弃
                // because we must be at the maximum allowed fee. // 因为我们必须达到允许的最大费用（最小中继费）。
                if (nFeeNeeded < ::minRelayTxFee.GetFee(nBytes)) // 若所需交易费小于最小中继交易费
                {
                    strFailReason = _("Transaction too large for fee policy");
                    return false; // 创建交易失败
                }

                if (nFeeRet >= nFeeNeeded) // 当前交易费等于所需交易费时
                    break; // Done, enough fee included. // 完成，跳出

                // Include more fee and try again.
                nFeeRet = nFeeNeeded; // 设置交易费
                continue; // while
            }
        }
    }

    return true; // 创建成功，返回 true
}
```

6.2.1.遍历发送列表，获取待发送总金额并计算从金额中减去的总交易费。<br>
6.2.2.创建一个易变交易对象，获取一个相对随机时间作为交易的锁定时间。<br>
6.2.3.遍历发送列表，构造交易输出对象，计算交易费，检查粉尘交易，把输出对象加入交易输出列表。<br>
6.2.4.选择使用的币（可花费的 UTXO）组成硬币集合。<br>
6.2.5.遍历硬币集合，通过币龄（交易深度）和数量计算交易优先级。<br>
6.2.6.计算找零，用选择的硬币总金额减去待发送的总金额，若存在找零，则构造找零输出，否则把找零密钥放回密钥池。<br>
6.2.7.构造输入列表，遍历所选的硬币集合，构造交易输入对象并加入交易输入列表。<br>
6.2.8.签名，遍历硬币集合，获取每个币（钱包交易）地址的脚本公钥和交易输入列表中对应的交易签名，对通过易变交易构造的不易变交易进行签名。<br>
6.2.9.把签好名的交易嵌入到待创建的新钱包交易中，检验序列化的交易大小，计算交易优先级，计算交易费，若当前交易费小于所需交易费，回到 6.2.3 直至大于等于。

6.3.调用 pwalletMain->CommitTransaction(wtxNew, reservekey) 提交交易，包含广播。
该函数定义在“wallet/wallet.cpp”文件中。入参为：创建好的新钱包交易（输入、输出、找零、签名），找零密钥。

```cpp
/**
 * Call after CreateTransaction unless you want to abort
 */ // 除非你想要崩溃，在 CreateTransaction 之后调用
bool CWallet::CommitTransaction(CWalletTx& wtxNew, CReserveKey& reservekey)
{
    {
        LOCK2(cs_main, cs_wallet); // 1.钱包上锁
        LogPrintf("CommitTransaction:\n%s", wtxNew.ToString()); // 记录交易信息
        {
            // This is only to keep the database open to defeat the auto-flush for the // 这只是为了在该期间内保持数据库打开以防自动刷新。
            // duration of this scope.  This is the only place where this optimization // 这是唯一这种优化可能有意义的地方。
            // maybe makes sense; please don't do it anywhere else. // 请不要在其他地方做这个。
            CWalletDB* pwalletdb = fFileBacked ? new CWalletDB(strWalletFile,"r+") : NULL; // 创建钱包数据库对象，r+ 表示可读写方式打开钱包数据库文件

            // Take key pair from key pool so it won't be used again // 从密钥池中拿出密钥对，以至它无法再次被使用
            reservekey.KeepKey(); // 从密钥池中移除该密钥

            // Add tx to wallet, because if it has change it's also ours, // 添加交易到钱包，因为如果它有找零也是我们的，
            // otherwise just for transaction history. // 否则仅用于交易交易历史记录。
            AddToWallet(wtxNew, false, pwalletdb); // 添加钱包交易到钱包数据库

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

        // Track how many getdata requests our transaction gets // 2.追踪我们的交易获取了多少次 getdata 请求
        mapRequestCount[wtxNew.GetHash()] = 0; // 初始化为 0 次

        if (fBroadcastTransactions) // 若开启了交易广播标志
        {
            // Broadcast // 广播
            if (!wtxNew.AcceptToMemoryPool(false)) // 3.把交易添加到内存池中
            { // 这步不能失败。该交易已经签署并记录。
                // This must not fail. The transaction has already been signed and recorded.
                LogPrintf("CommitTransaction(): Error: Transaction not valid\n");
                return false;
            }
            wtxNew.RelayWalletTransaction(); // 4.中继钱包交易
        }
    }
    return true;
}
```

6.3.1.钱包上锁，打开钱包数据库，移除找零密钥防止该找零地址再次被使用，添加交易到钱包数据库，并把该交易输入列表中所有 UTXO 对应交易绑定到当前钱包。<br>
6.3.2.把新交易添加到 getdata 消息请求次数映射列表并初始化次数为 0，用于追踪该交易获取的 getdata 请求次数。<br>
6.3.3.若开启了交易广播，先把该交易添加到交易内存池中。<br>
6.3.4.然后广播（中继/发送）该交易。

6.3.3.调用 wtxNew.AcceptToMemoryPool(false) 把该交易添加到交易内存池中。
该函数声明在“wallet/wallet.h”文件的 CMerkleTx 类中。

```cpp
/** A transaction with a merkle branch linking it to the block chain. */
class CMerkleTx : public CTransaction // 一个连接它到区块链的默克分支交易
{
    ...
    bool AcceptToMemoryPool(bool fLimitFree=true, bool fRejectAbsurdFee=true); // 把当前交易添加到内存池
    ...
};
```

定义在“wallet/wallet.cpp”文件中。入参为：false，true。

```cpp
bool CMerkleTx::AcceptToMemoryPool(bool fLimitFree, bool fRejectAbsurdFee)
{
    CValidationState state;
    return ::AcceptToMemoryPool(mempool, state, *this, fLimitFree, NULL, false, fRejectAbsurdFee); // 添加交易到内存池
}
```

转调 ::AcceptToMemoryPool(mempool, state, *this, fLimitFree, NULL, false, fRejectAbsurdFee) 函数来尝试添加交易至内存池。
该函数定义在“main.cpp”文件中。入参为：交易内存池全局对象，待获取的验证状态，该交易，false，NULL，false，true。

```cpp
bool AcceptToMemoryPool(CTxMemPool& pool, CValidationState &state, const CTransaction &tx, bool fLimitFree,
                        bool* pfMissingInputs, bool fOverrideMempoolLimit, bool fRejectAbsurdFee)
{
    std::vector<uint256> vHashTxToUncache; // 未缓存交易哈希列表
    bool res = AcceptToMemoryPoolWorker(pool, state, tx, fLimitFree, pfMissingInputs, fOverrideMempoolLimit, fRejectAbsurdFee, vHashTxToUncache); // 接收到内存池工作者
    if (!res) { // 若添加失败
        BOOST_FOREACH(const uint256& hashTx, vHashTxToUncache) // 遍历未缓存的交易哈希列表
            pcoinsTip->Uncache(hashTx); // 从缓存中移除该交易索引
    }
    return res;
}
```

6.3.4.调用 wtxNew.RelayWalletTransaction() 进行钱包交易的中继。
这里中继的意思是两个节点间进行交易的广播（发送和接收）。<br>
该函数定义在“wallet/wallet.cpp”文件中。

```cpp
bool CWalletTx::RelayWalletTransaction()
{
    assert(pwallet->GetBroadcastTransactions()); // 验证钱包广播交易是否开启
    if (!IsCoinBase()) // 若该交易非创币交易
    {
        if (GetDepthInMainChain() == 0 && !isAbandoned()) { // 若链深度为 0（即未上链）且 未被标记为已抛弃
            LogPrintf("Relaying wtx %s\n", GetHash().ToString()); // 记录中继交易哈希
            RelayTransaction((CTransaction)*this); // 进行交易中继
            return true;
        }
    }
    return false;
}
```

该函数对交易进行了简单的验证，然后调用 RelayTransaction((CTransaction)*this) 开始中继交易，它声明在“net.h”文件中。

```cpp
class CTransaction;
void RelayTransaction(const CTransaction& tx); // 转调下面重载函数
void RelayTransaction(const CTransaction& tx, const CDataStream& ss); // 中继交易
```

定义在“net.cpp”文件中。入参为：该钱包交易。

```cpp
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
        LOCK(cs_mapRelay); // 中继映射列表上锁
        // Expire old relay messages // 使旧的中继数据过期
        while (!vRelayExpiration.empty() && vRelayExpiration.front().first < GetTime())
        { // 中继到期队列非空 且 中继过期队列队头元素过期时间小于当前时间（表示已过期）
            mapRelay.erase(vRelayExpiration.front().second); // 从中继数据映射列表中擦除中继过期队列的队头
            vRelayExpiration.pop_front(); // 中继过期队列出队
        }

        // Save original serialized message so newer versions are preserved // 保存原始的序列化消息，以便保留新版本
        mapRelay.insert(std::make_pair(inv, ss)); // 把该交易插入中继数据映射列表
        vRelayExpiration.push_back(std::make_pair(GetTime() + 15 * 60, inv)); // 加上 15min 的过期时间，加入过期队列
    }
    LOCK(cs_vNodes); // 已建立连接的节点列表上锁
    BOOST_FOREACH(CNode* pnode, vNodes) // 遍历当前已建立连接的节点列表
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
```

这里先检查了中继过期队列把过期元素移除，接着把该交易加入中继列表同时设置 15 分钟的过期时间并加入中继过期队列。
然后遍历了已建立连接的节点链表，调用 pnode->PushInventory(inv) 把 inv 消息发送到对端节点，
该函数定义在“net.h”文件的 CNode 类中。入参为：该交易的库存条目对象。

```cpp
/** Information about a peer */ // 关于对端节点的信息
class CNode // 对端节点信息类
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
```

最终只是把库存条目 inv 消息对象加入到发送库存消息列表。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/wallet.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.h){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
