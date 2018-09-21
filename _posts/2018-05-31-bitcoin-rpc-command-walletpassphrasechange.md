---
layout: post
title:  "比特币 RPC 命令剖析 \"walletpassphrasechange\""
date:   2018-05-31 17:24:02 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli walletpassphrasechange "oldpassphrase" "newpassphrase"
---
## 提示说明

{% highlight shell %}
walletpassphrasechange "oldpassphrase" "newpassphrase" # 更改钱包密码 oldpassphrase 为 newpassphrase
{% endhighlight %}

参数：<br>
1. oldpassphrase （字符串）当前密码。<br>
2. newpassphrase （字符串）新密码。

结果：无返回值。

## 用法示例

### 比特币核心客户端

修改钱包密码 mypasswd 为 newpasswd。

{% highlight shell %}
$ bitcoin-cli walletpassphrase mypasswd newpasswd
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "walletpassphrasechange", "params": ["mypasswd", "newpasswd"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
walletpassphrase 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue walletpassphrasechange(const UniValue& params, bool fHelp); // 修改钱包密码
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue walletpassphrasechange(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保钱包当前可用
        return NullUniValue;
    
    if (pwalletMain->IsCrypted() && (fHelp || params.size() != 2)) // 钱包已加密 且 参数必须为 2 个
        throw runtime_error( // 命令帮助反馈
            "walletpassphrasechange \"oldpassphrase\" \"newpassphrase\"\n"
            "\nChanges the wallet passphrase from 'oldpassphrase' to 'newpassphrase'.\n"
            "\nArguments:\n"
            "1. \"oldpassphrase\"      (string) The current passphrase\n"
            "2. \"newpassphrase\"      (string) The new passphrase\n"
            "\nExamples:\n"
            + HelpExampleCli("walletpassphrasechange", "\"old one\" \"new one\"")
            + HelpExampleRpc("walletpassphrasechange", "\"old one\", \"new one\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    if (fHelp) // 若钱包未加密，则无法显示该命令帮助
        return true;
    if (!pwalletMain->IsCrypted()) // 若钱包未加密，则无法使用该命令
        throw JSONRPCError(RPC_WALLET_WRONG_ENC_STATE, "Error: running with an unencrypted wallet, but walletpassphrasechange was called.");

    // TODO: get rid of these .c_str() calls by implementing SecureString::operator=(std::string)
    // Alternately, find a way to make params[0] mlock()'d to begin with.
    SecureString strOldWalletPass;
    strOldWalletPass.reserve(100);
    strOldWalletPass = params[0].get_str().c_str(); // 获取用户指定的旧密码

    SecureString strNewWalletPass;
    strNewWalletPass.reserve(100);
    strNewWalletPass = params[1].get_str().c_str(); // 获取用户指定的新密码

    if (strOldWalletPass.length() < 1 || strNewWalletPass.length() < 1) // 新旧密码长度都不能小于 1
        throw runtime_error(
            "walletpassphrasechange <oldpassphrase> <newpassphrase>\n"
            "Changes the wallet passphrase from <oldpassphrase> to <newpassphrase>.");

    if (!pwalletMain->ChangeWalletPassphrase(strOldWalletPass, strNewWalletPass)) // 改变钱包密码
        throw JSONRPCError(RPC_WALLET_PASSPHRASE_INCORRECT, "Error: The wallet passphrase entered was incorrect.");

    return NullUniValue; // 返回空值
}
{% endhighlight %}

基本流程：<br>
1.确保当前钱包可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.钱包未加密时查看命令帮助，不返回任何信息。<br>
5.钱包未加密时无法使用该命令。<br>
6.获取用户指定新旧密码。<br>
7.新旧密码长度检查，均不能少于 1 个字符。<br>
8.改变钱包密码。

第七步，调用 pwalletMain->ChangeWalletPassphrase(strOldWalletPass, strNewWalletPass) 函数改变钱包密码，先解密旧密码，后加密新密码，定义在“wallet.cpp”文件中。

{% highlight C++ %}
bool CWallet::ChangeWalletPassphrase(const SecureString& strOldWalletPassphrase, const SecureString& strNewWalletPassphrase)
{
    bool fWasLocked = IsLocked(); // 获取当前钱包加密状态作为以前加密状态

    {
        LOCK(cs_wallet); // 钱包上锁
        Lock(); // 锁定（加密）钱包

        CCrypter crypter;
        CKeyingMaterial vMasterKey;
        BOOST_FOREACH(MasterKeyMap::value_type& pMasterKey, mapMasterKeys) // 遍历主密钥映射列表
        {
            if(!crypter.SetKeyFromPassphrase(strOldWalletPassphrase, pMasterKey.second.vchSalt, pMasterKey.second.nDeriveIterations, pMasterKey.second.nDerivationMethod)) // 从旧密码设置密钥
                return false;
            if (!crypter.Decrypt(pMasterKey.second.vchCryptedKey, vMasterKey)) // 解密
                return false;
            if (CCryptoKeyStore::Unlock(vMasterKey)) // 解锁
            {
                int64_t nStartTime = GetTimeMillis();
                crypter.SetKeyFromPassphrase(strNewWalletPassphrase, pMasterKey.second.vchSalt, pMasterKey.second.nDeriveIterations, pMasterKey.second.nDerivationMethod); // 使用新密码获取密钥
                pMasterKey.second.nDeriveIterations = pMasterKey.second.nDeriveIterations * (100 / ((double)(GetTimeMillis() - nStartTime))); // 计算迭代计数

                nStartTime = GetTimeMillis();
                crypter.SetKeyFromPassphrase(strNewWalletPassphrase, pMasterKey.second.vchSalt, pMasterKey.second.nDeriveIterations, pMasterKey.second.nDerivationMethod); // 第 2 次设置
                pMasterKey.second.nDeriveIterations = (pMasterKey.second.nDeriveIterations + pMasterKey.second.nDeriveIterations * 100 / ((double)(GetTimeMillis() - nStartTime))) / 2; // 重新计算迭代计数

                if (pMasterKey.second.nDeriveIterations < 25000) // 迭代计数最小 25000
                    pMasterKey.second.nDeriveIterations = 25000;

                LogPrintf("Wallet passphrase changed to an nDeriveIterations of %i\n", pMasterKey.second.nDeriveIterations);

                if (!crypter.SetKeyFromPassphrase(strNewWalletPassphrase, pMasterKey.second.vchSalt, pMasterKey.second.nDeriveIterations, pMasterKey.second.nDerivationMethod)) // 第 3 次设置
                    return false;
                if (!crypter.Encrypt(vMasterKey, pMasterKey.second.vchCryptedKey)) // 加密
                    return false;
                CWalletDB(strWalletFile).WriteMasterKey(pMasterKey.first, pMasterKey.second); // 把新密钥写入钱包数据库
                if (fWasLocked) // 若密码改变前未加密状态
                    Lock(); // 锁定（加密)
                return true;
            }
        }
    }

    return false;
}
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#walletpassphrasechange)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
