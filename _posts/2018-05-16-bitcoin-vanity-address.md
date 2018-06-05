---
layout: post
title:  "比特币“靓号”地址"
date:   2018-05-16 18:56:51 +0800
author: mistydew
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 概要
比特币靓号地址就是拥有个性化自定义前缀的公钥地址。<br>
比如以 `1kid` 开头的公钥地址 `1kidyp7EFY3xUdMGSTWpkEmLcfKu9yvoq`。<br>
这里的 3 位 `kid` 就是我们自定义的地址前缀了，当然地址本身的生成方式并没有改变，
而是不断地通过筛选得到的，或许在你拿到这个地址前，已经生成了 n 个地址，这个过程与挖矿有点类似。<br>
毫无疑问，随着指定前缀长度的增加，这个筛选过程所耗费的时间会呈指数级增长。

## 安全性
这里的安全指定的黑客可能会偷换博客或论坛等页面上的比特币捐赠地址，
利用的是人们用肉眼做地址验证时，只对比前几位地址，所以黑客往往会生成具有一定长度的和目标地址前缀相同的地址来欺骗捐赠者。
但若是指定前缀的“靓号”地址，黑客若想欺骗捐赠者，须要生成具有比该前缀长度更长的前缀的“新靓号”地址，而这个代价可能是巨大的。<br>
**注：指定的前缀必须符合 [Base58 编码](/2018/05/12/base58-encoding)的结果，即不能包含 0（零），O（大写字母 o），I（大写字母 i）和 l（小写字母 L）。**

## 源码剖析
“源码之前，了无秘密” — 侯捷<br>
要想让比特币启动时就生成指定地址前缀（长度大于 1）的公钥地址，就需要修改源码了。<br>
这里需要修改 2 个函数：
一个是 `GenerateNewKey` 函数，位于“wallet/wallet.cpp”文件中。
该函数的作用是生成一个私钥，并返回对应的公钥。<br>
实现：生成私钥，获取公钥地址，对比地址前缀，不满足则重复以上过程，直至找到指定前缀的地址。

{% highlight C++ %}
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
+       if (CBitcoinAddress(keyID).ToString.compare(0, 5, "1kids") == 0) { // 只有满足前缀为 "1kids" 的公钥地址才能返回
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
{% endhighlight %}

另一个是 RPC 命令 `getnewaddress` 函数，位于“wallet/rpcwallet.cpp”文件中。
该函数的作用是通过比特币核心客户端该调用 RPC 命令，获取一个新的公钥地址。<br>
这里只需要修改第 6 步，实现同上。

{% highlight C++ %}
UniValue getnewaddress(const UniValue& params, bool fHelp) // 在指定账户下新建一个地址，若不指定账户，默认添加到""空账户下
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1.确保钱包可用，即钱包已创建成功
        return NullUniValue;
    
    if (fHelp || params.size() > 1) // 参数个数为 0 或 1，即要么使用默认账户，要么指定账户
        throw runtime_error( // 2.查看该命令的帮助或命令参数个数超过 1 个均返回该命令的帮助
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
{% endhighlight %}

关于比特币地址前缀 `'1'` 的修改，[详见](/2018/05/13/how-to-make-an-altcoin)。

## 参照
* [Address - Bitcoin Wiki](https://en.bitcoin.it/wiki/Address)
* [List of address prefixes - Bitcoin Wiki](https://en.bitcoin.it/wiki/List_of_address_prefixes)
* [Technical background of version 1 Bitcoin addresses - Bitcoin Wiki](https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses)
* [精通比特币（第二版）第四章 密钥和地址 · 巴比特图书](http://book.8btc.com/books/6/masterbitcoin2cn/_book/ch04.html)
* [samr7/vanitygen](https://github.com/samr7/vanitygen) 比特币靓号地址生成器
* [手把手教你拥有个性化的BTC地址 \| 巴比特](http://www.8btc.com/get-a-vanitygen-address)
* [jonathanfoster/vanity-miner: Bitcoin vanity address miner](https://github.com/jonathanfoster/vanity-miner) C++ 版比特币靓号矿工（需要依赖）
* [BitcoinVanityGen.com - Bitcoin Vanity Address Generator Online, Free Bicoin Vanity Address Generation](http://bitcoinvanitygen.com) 在线比特币靓号地址生成器，最多定制 9 位，6 位（含 6 位）以内免费
* [...](https://github.com/mistydew/blockchain)
