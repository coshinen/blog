---
layout: post
title:  "比特币 RPC 命令剖析 \"dumpprivkey\""
date:   2018-08-06 14:06:23 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli dumpprivkey "bitcoinaddress"
---
## 提示说明

{% highlight shell %}
dumpprivkey "bitcoinaddress" # 导出 bitcoinaddress 对应的私钥
{% endhighlight %}

RPC 命令 [importprivkey](/blog/2018/08/bitcoin-rpc-command-importprivkey.html) 可以使用该输出作为输入。

参数：<br>
1.bitcoinaddress（字符串，必备）私钥对应的比特币地址。

结果：（字符串）返回私钥。

## 用法示例

### 比特币核心客户端

使用 [getnewaddress](/blog/2018/08/bitcoin-rpc-command-getnewaddress.html) 命令获取一个比特币地址，
然后以该地址为输入，导出其对应的私钥。

{% highlight shell %}
$ bitcoin-cli getnewaddress
13m7dqxmjCxTgVTnRHNywcgqp7SCFUtV7X
$ bitcoin-cli dumpprivkey 13m7dqxmjCxTgVTnRHNywcgqp7SCFUtV7X
L26dH1T4tfSbmYax7jdGMNPanrLtSvMtKnwrPjyLcD1prmsKBTts
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "dumpprivkey", "params": ["13m7dqxmjCxTgVTnRHNywcgqp7SCFUtV7X"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"L26dH1T4tfSbmYax7jdGMNPanrLtSvMtKnwrPjyLcD1prmsKBTts","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
dumpprivkey 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue dumpprivkey(const UniValue& params, bool fHelp); // 导出私钥
{% endhighlight %}

实现在“wallet/rpcdump.cpp”文件中。

{% highlight C++ %}
UniValue dumpprivkey(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "dumpprivkey \"bitcoinaddress\"\n"
            "\nReveals the private key corresponding to 'bitcoinaddress'.\n"
            "Then the importprivkey can be used with this output\n"
            "\nArguments:\n"
            "1. \"bitcoinaddress\"   (string, required) The bitcoin address for the private key\n"
            "\nResult:\n"
            "\"key\"                (string) The private key\n"
            "\nExamples:\n"
            + HelpExampleCli("dumpprivkey", "\"myaddress\"")
            + HelpExampleCli("importprivkey", "\"mykey\"")
            + HelpExampleRpc("dumpprivkey", "\"myaddress\"")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    EnsureWalletIsUnlocked(); // 确保钱包当前解锁（为加密或加密了但处于解密状态）

    string strAddress = params[0].get_str(); // 获取指定的公钥地址
    CBitcoinAddress address;
    if (!address.SetString(strAddress)) // 初始化一个比特币地址对象
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address");
    CKeyID keyID;
    if (!address.GetKeyID(keyID)) // 获取该地址的索引
        throw JSONRPCError(RPC_TYPE_ERROR, "Address does not refer to a key");
    CKey vchSecret;
    if (!pwalletMain->GetKey(keyID, vchSecret)) // 通过索引获取对应的私钥
        throw JSONRPCError(RPC_WALLET_ERROR, "Private key for address " + strAddress + " is not known");
    return CBitcoinSecret(vchSecret).ToString(); // 对私钥进行 Base58 编码并返回结果
}
{% endhighlight %}

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.确保当前钱包处于解密状态。<br>
5.获取用户指定的公钥地址并初始化一个比特币地址对象。<br>
6.获取该地址的索引。<br>
7.通过密钥索引获取对应的私钥数据。<br>
8.对私钥进行 base58 编码并返回结果。

第五步，调用 address.SetString(strAddress) 函数初始化一个比特币地址对象，该函数声明在“base58.h”文件的 CBitcoinAddress 类中。

{% highlight C++ %}
/**
 * Base class for all base58-encoded data
 */ // 所有 base58 编码数据的基类
class CBase58Data // 包含一个版本号和一个编码
{
protected:
    //! the version byte(s)
    std::vector<unsigned char> vchVersion; // 对于公钥地址，对应公钥地址前缀

    //! the actually encoded data
    typedef std::vector<unsigned char, zero_after_free_allocator<unsigned char> > vector_uchar;
    vector_uchar vchData; // 实际编码后的数据
    ...
    bool SetString(const char* psz, unsigned int nVersionBytes = 1); // 使用 C 风格字符串初始化数据
    bool SetString(const std::string& str); // 调用上面的重载函数
    ...
};
{% endhighlight %}

实现在“base58.cpp”文件中。

{% highlight C++ %}
bool CBase58Data::SetString(const char* psz, unsigned int nVersionBytes)
{
    std::vector<unsigned char> vchTemp;
    bool rc58 = DecodeBase58Check(psz, vchTemp); // 解码 Base58 编码
    if ((!rc58) || (vchTemp.size() < nVersionBytes)) { // 解码失败 或 解码后的数据小于 1 个字节
        vchData.clear(); // 清空数据
        vchVersion.clear(); // 清空版本号
        return false; // 设置失败
    }
    vchVersion.assign(vchTemp.begin(), vchTemp.begin() + nVersionBytes); // 验证版本号
    vchData.resize(vchTemp.size() - nVersionBytes); // 重置大小为数据总大小 - 1 个字节的版本号，并初始化为 0
    if (!vchData.empty()) // 非空（全为 0）
        memcpy(&vchData[0], &vchTemp[nVersionBytes], vchData.size()); // 复制除版本号的数据
    memory_cleanse(&vchTemp[0], vchData.size()); // 清空数据（保留了最后一个字节？）
    return true;
}

bool CBase58Data::SetString(const std::string& str)
{
    return SetString(str.c_str()); // 转调上面的重载函数
}
{% endhighlight %}

第六步，调用 address.GetKeyID(keyID) 函数获取地址对应的密钥索引，该函数定义在“base58.cpp”文件中。

{% highlight C++ %}
bool CBitcoinAddress::GetKeyID(CKeyID& keyID) const
{
    if (!IsValid() || vchVersion != Params().Base58Prefix(CChainParams::PUBKEY_ADDRESS)) // 地址有效 且 版本号正确
        return false;
    uint160 id;
    memcpy(&id, &vchData[0], 20); // 获取前 20 个字节
    keyID = CKeyID(id); // 初始化公钥索引对象
    return true;
}
{% endhighlight %}

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#dumpprivkey){:target="_blank"}
