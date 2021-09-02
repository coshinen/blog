---
layout: post
title:  "比特币 RPC 命令「dumpprivkey」"
date:   2018-08-06 20:06:23 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help dumpprivkey
dumpprivkey "bitcoinaddress"

显示 'bitcoinaddress' 对应的私钥。
然后 importprivkey 可以使用这个输出

参数：
1. "bitcoinaddress"（字符串，必备）私钥对应的比特币地址

结果：
"key"（字符串）私钥

例子：
> bitcoin-cli dumpprivkey "myaddress"
> bitcoin-cli importprivkey "mykey"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "dumpprivkey", "params": ["myaddress"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`dumpprivkey` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue dumpprivkey(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcdump.cpp` 中。

```cpp
UniValue dumpprivkey(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() != 1)
        throw runtime_error(
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
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    EnsureWalletIsUnlocked(); // 3. 确保钱包解锁

    string strAddress = params[0].get_str(); // 4. 获取地址对应的私钥
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
```

### 1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#1-确保钱包可用)。

### 2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 3. 确保钱包解锁

### 4. 获取地址对应的私钥

函数 `address.SetString(strAddress)` 声明在文件 `base58.h` 的比特币地址类 `CBitcoinAddress` 中。

```cpp
/**
 * Base class for all base58-encoded data
 */
class CBase58Data // 所有 base58 编码数据的基类
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
```

实现在文件 `base58.cpp` 中。

```cpp
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
```

获取密钥索引函数 `address.GetKeyID(keyID)` 定义在文件 `base58.cpp` 中。

```cpp
bool CBitcoinAddress::GetKeyID(CKeyID& keyID) const
{
    if (!IsValid() || vchVersion != Params().Base58Prefix(CChainParams::PUBKEY_ADDRESS)) // 地址有效 且 版本号正确
        return false;
    uint160 id;
    memcpy(&id, &vchData[0], 20); // 获取前 20 个字节
    keyID = CKeyID(id); // 初始化公钥索引对象
    return true;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
* [bitcoin/rpcdump.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcdump.cpp){:target="_blank"}
* [bitcoin/base58.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/base58.h){:target="_blank"}
* [bitcoin/base58.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/base58.cpp){:target="_blank"}
