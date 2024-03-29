---
layout: post
title:  "比特币靓号地址"
date:   2018-05-18 18:56:51 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin Address
---
比特币靓号地址是拥有个性化前缀的公钥地址。
例如以字符串 `"1kid"` 开头的地址 `1kidyp7EFY3xUdMGSTWpkEmLcfKu9yvoq`。

## 1. 思路

一种较为简单的方法是，不改变地址原有的生成方式，把前缀为 `"1kid"` 的地址筛选出来。
在获取到这个地址前，可能已经生成了 n 个地址，这个过程有点像挖矿。
该方法虽然容易实现，但随着前缀长度的增加，筛选过程耗费的时间将会急剧增长。

关于比特币地址前缀字符 `'1'` 的修改，参考[如何制作一枚山寨数字货币 5. 修改公钥地址前缀](/blog/2018/05/how-to-make-an-altcoin.html#5-修改公钥地址前缀)。

## 2. 安全性

安全指的是黑客可能会偷换博客或论坛等页面上作者留下的比特币捐赠地址，利用的是人们用肉眼做地址验证时，通常只对比地址的前几位，所以黑客往往会生成具有一定长度的和目标地址前缀相同的地址来欺骗捐赠者。
但如果是指定前缀的“靓号”地址，黑客若想欺骗捐赠者，就必须生成比该前缀长度具有更长前缀的新“靓号”地址，然而这个代价可能是巨大的。

**指定的前缀必须符合 Base58 编码，即不能包含 0（数字零）、O（大写字母 o）、I（大写字母 i）和 l（小写字母 L）。**

## 3. 源码实现

筛选“靓号”地址，共需要修改 3 个位置。

### 3.1. GenerateNewKey

函数 `GenerateNewKey` 实现在文件 `wallet/wallet.cpp` 中。

实现步骤：
1. 生成私钥。
2. 获取公钥地址。
3. 对比地址前缀，若不符合则重复以上过程，直至找到指定前缀的地址。

```cpp
CPubKey CWallet::GenerateNewKey()
{
    AssertLockHeld(cs_wallet); // mapKeyMetadata
    bool fCompressed = CanSupportFeature(FEATURE_COMPRPUBKEY); // default to compressed public keys if we want 0.6.0 wallets

+   while (true)
+   {
        CKey secret; // 创建一个私钥
        secret.MakeNewKey(fCompressed); // 随机生成一个数来初始化私钥，注意边界，下界为 1
    
        // Compressed public keys were introduced in version 0.6.0
        if (fCompressed) // 是否压缩公钥，0.6.0 版引入
            SetMinVersion(FEATURE_COMPRPUBKEY);
    
        CPubKey pubkey = secret.GetPubKey(); // 获取与私钥对应的公钥（椭圆曲线加密算法）
        assert(secret.VerifyPubKey(pubkey)); // 验证私钥公钥对是否匹配

+       CKeyID keyID = pubkey.GetID();
+       if (CBitcoinAddress(keyID).ToString().compare(0, 5, "1kids") == 0) { // 只有满足前缀为 "1kids" 的公钥地址才能返回
            // Create new metadata // 创建新元数据/中继数据
            int64_t nCreationTime = GetTime(); // 获取当前时间
            mapKeyMetadata[pubkey.GetID()] = CKeyMetadata(nCreationTime);
            if (!nTimeFirstKey || nCreationTime < nTimeFirstKey)
                nTimeFirstKey = nCreationTime;
    
            if (!AddKeyPubKey(secret, pubkey))
                throw std::runtime_error("CWallet::GenerateNewKey(): AddKey failed");
            return pubkey; // 返回对应的公钥
+       }
+   }
}
```

### 3.2. getnewaddress

RPC 命令 `getnewaddress` 实现在文件 `wallet/rpcwallet.cpp` 中。
在新密钥添加到钱包之前，对指定前缀的地址进行筛选。

```cpp
// 在指定账户下新建一个地址。若未指定账户，则默认添加到空账户 "" 下
UniValue getnewaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用，即钱包已创建成功
        return NullUniValue;
    
    if (fHelp || params.size() > 1) // 0 或 1 个参数（有缺省值）
        throw runtime_error( // 2. 查看该命令的帮助或命令参数个数超过 1 个均返回该命令的帮助
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
    string strAccount; // 用于保存帐户名
    if (params.size() > 0) // 有 1 个参数的情况
        strAccount = AccountFromValue(params[0]); // 4.解析第一个参数并将其作为账户名

    if (!pwalletMain->IsLocked()) // 检查钱包是否上锁（被用户加密）
        pwalletMain->TopUpKeyPool(); // 5.填充密钥池

    // Generate a new key that is added to wallet
    CPubKey newKey; // 6.生成一个新密钥并添加到钱包，返回一个对应的比特币地址
+   while (true)
+   {
        if (!pwalletMain->GetKeyFromPool(newKey)) // 获取一个公钥
            throw JSONRPCError(RPC_WALLET_KEYPOOL_RAN_OUT, "Error: Keypool ran out, please call keypoolrefill first");
        CKeyID keyID = newKey.GetID(); // 对 65 bytes 的公钥调用 hash160(即先 sha256, 再 ripemd160)
    
+       if (CBitcoinAddress(keyID).ToString().compare(0, 5, "1kids") == 0) { // 只有满足前缀为 "1kids" 的公钥地址才能返回
            pwalletMain->SetAddressBook(keyID, strAccount, "receive");
    
            return CBitcoinAddress(keyID).ToString(); // 160 位的公钥转化为公钥地址：Base58(1 + 20 + 4 bytes)
+       }
+   }
}
```

### 3.3. validateaddress

RPC 命令 `validateaddress` 实现在文件 `rpcmisc.cpp` 中。
增加地址有效性的验证，因为是筛选前缀得到的地址，所以此步可以省略。

```cpp
UniValue validateaddress(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 1 个参数
        throw runtime_error(
            "validateaddress \"bitcoinaddress\"\n"
            "\nReturn information about the given bitcoin address.\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"     (string, required) The bitcoin address to validate\n"
            "\nResult:\n"
            "{\n"
            "  \"isvalid\" : true|false,       (boolean) If the address is valid or not. If not, this is the only property returned.\n"
            "  \"address\" : \"bitcoinaddress\", (string) The bitcoin address validated\n"
            "  \"scriptPubKey\" : \"hex\",       (string) The hex encoded scriptPubKey generated by the address\n"
            "  \"ismine\" : true|false,        (boolean) If the address is yours or not\n"
            "  \"iswatchonly\" : true|false,   (boolean) If the address is watchonly\n"
            "  \"isscript\" : true|false,      (boolean) If the key is a script\n"
            "  \"pubkey\" : \"publickeyhex\",    (string) The hex value of the raw public key\n"
            "  \"iscompressed\" : true|false,  (boolean) If the address is compressed\n"
            "  \"account\" : \"account\"         (string) DEPRECATED. The account associated with the address, \"\" is the default account\n"
            "}\n"
            "\nExamples:\n"
            + HelpExampleCli("validateaddress", "\"1PSSGeFHDnKNxiEyFrD1wcEaHr9hrQDDWc\"")
            + HelpExampleRpc("validateaddress", "\"1PSSGeFHDnKNxiEyFrD1wcEaHr9hrQDDWc\"")
        );

#ifdef ENABLE_WALLET
    LOCK2(cs_main, pwalletMain ? &pwalletMain->cs_wallet : NULL); // 钱包上锁
#else
    LOCK(cs_main);
#endif

    CBitcoinAddress address(params[0].get_str()); // 获取指定的比特币地址
    bool isValid = address.IsValid(); // 判断地址是否有效
+   isValid = address.ToString().compare(0, 5, "1kids") == 0; // 若前缀非 "1kids"，则该地址无效

    UniValue ret(UniValue::VOBJ); // 对象类型的返回结果
    ret.push_back(Pair("isvalid", isValid)); // 有效性
    if (isValid) // 若有效
    {
        CTxDestination dest = address.Get(); // 从比特币地址获取交易目的地址
        string currentAddress = address.ToString();
        ret.push_back(Pair("address", currentAddress)); // 当前比特币地址

        CScript scriptPubKey = GetScriptForDestination(dest); // 从交易目的地址获取脚本公钥
        ret.push_back(Pair("scriptPubKey", HexStr(scriptPubKey.begin(), scriptPubKey.end()))); // 脚本公钥

#ifdef ENABLE_WALLET
        isminetype mine = pwalletMain ? IsMine(*pwalletMain, dest) : ISMINE_NO;
        ret.push_back(Pair("ismine", (mine & ISMINE_SPENDABLE) ? true : false)); // 是否属于我的
        ret.push_back(Pair("iswatchonly", (mine & ISMINE_WATCH_ONLY) ? true: false)); // 是否为 watch-only 地址
        UniValue detail = boost::apply_visitor(DescribeAddressVisitor(), dest); // 排序
        ret.pushKVs(detail); // 地址细节
        if (pwalletMain && pwalletMain->mapAddressBook.count(dest)) // 若钱包可用 且 该目的地址在地址簿中
            ret.push_back(Pair("account", pwalletMain->mapAddressBook[dest].name)); // 获取该地址关联的账户名
#endif
    }
    return ret;
}
```

## 参考链接

* [Address - Bitcoin Wiki](https://en.bitcoin.it/wiki/Address){:target="_blank"}
* [List of address prefixes - Bitcoin Wiki](https://en.bitcoin.it/wiki/List_of_address_prefixes){:target="_blank"}
* [Technical background of version 1 Bitcoin addresses - Bitcoin Wiki](https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/rpcmisc.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmisc.cpp){:target="_blank"}
