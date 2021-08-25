---
layout: post
title:  "私钥到比特币地址的转换"
date:   2018-05-07 20:22:21 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin Address ECC
---
私钥使用单向的椭圆曲线乘法加密函数得到对应的公钥。
公钥经过一系列的哈希函数运算生成相应地址，这一过程涉及到 Base58 编码。

私钥是一个有固定的范围的 256 位二进制随机数，其作用是生成签名用于证明私钥持有者对相应公钥地址上资金的所有权。
比特币采用操作系统底层密码学安全的伪随机数生成器 CSPRNG 来产生 256 位随机数，只要保证生成的随机数“不可预测”且“不可重复”这两点即可。
从编程角度实现随机数，在一个密码学安全的随机源中取一长串随机字节，使用 SHA256 算法运算得到一个 256 位的数字，然后判断是否在指定范围内，若不在就重复上述过程。
**私钥很重要，持有私钥就拥有相应公钥地址上的比特币，一旦私钥丢失，对应的比特币将无法找回。**

使用 RPC 中的 getnewaddress 命令生成一个新的密钥对（含私钥和公钥）。
为了安全考虑，只显示生成的公钥地址，私钥默认存入本地钱包数据库。例：

```shell
$ ./bitcoin-cli getnewaddress
12PbLWS4h3qSmQfdu4oEgXCYMGY4TVbL3N
```

然后使用 RPC 中的 dumpprivkey 命令导出公钥地址对应的私钥。
以 WIF (wallet import format) 钱包导入格式即 Base58 校验和编码进行导出。例：

```shell
$ ./bitcoin-cli dumpprivkey 12PbLWS4h3qSmQfdu4oEgXCYMGY4TVbL3N
KzCFcgtfrPA2uWmXn4zjVNaKYMEUHbh732XzZ4aZ737545DqZ3V4
```

**注：该命令只适用于本地钱包数据库中的私钥。**

## 1. 流程

![mbc2_0401](https://raw.githubusercontent.com/bitcoinbook/bitcoinbook/develop/images/mbc2_0401.png){:.border}

**注：“私钥->公钥”、“公钥->地址”这两步是单向不可逆的。**

1. 使用伪随机数生成器 PRNG 生成一个给定范围内的 256 位随机数作为私钥 PrivKey。
2. 使用 OpenSSL 加密库中 secp256k1 标准的椭圆曲线相乘加密算法计算上一步生成私钥 PrivKey 得到相应的公钥 PubKey。
![mbc2_0405](https://raw.githubusercontent.com/bitcoinbook/bitcoinbook/develop/images/mbc2_0405.png){:.border}
3. 使用 "Double Hash" 或 "Hash160" 运算上一步生成的公钥 PubKey 得到公钥地址 PubKeyAddress，用户看到的是该地址经过 Base58Check 编码后得到地址 address。
   1. "Hash160" 是先后经过了 SHA256 和 RIPEMD160 两步运算得到 160 位及 20 个字节的公钥地址，PubKeyAddress = RIPEMD160(SHA256(PubKey))。
   2. 最后经过 Base58 编码得到最后的地址，address = Base58Check(PubKeyAddress)。
![mbc2_0406](https://raw.githubusercontent.com/bitcoinbook/bitcoinbook/develop/images/mbc2_0406.png){:.border}
      1. 在 20 个字节的公钥地址前附加 1 个字节的版本前缀，比特币主网的版本号为 "0x00" 对应前缀为 "1"，VersionPrefix + PubKeyAddress。
      2. 对上步得到的 21bytes 进行两次哈希 SHA256，SHA256(SHA256(VersionPrefix + PubKeyAddress))。
      3. 取上步结果的前 4 个字节作为校验和 Checksum 追加到 3.2.1 结果的后面，VersionPrefix + PubKeyAddress + Checksum。
      4. 对上步得到的 25bytes 进行 Base58 编码得到最终的地址，address = Base58(VersionPrefix + PubKeyAddress + Checksum)。

## 2. 源码剖析

椭圆曲线公钥到比特币地址转换：

![PubKeyToAddr](https://en.bitcoin.it/w/images/en/9/9b/PubKeyToAddr.png){:.border}

```shell
$ cd bitcoin/src
$ grep "getnewaddress" * -nir
rpcserver.cpp:344:    { "wallet",             "getnewaddress",          &getnewaddress,          true  },
rpcserver.h:199:extern UniValue getnewaddress(const UniValue& params, bool fHelp); // in rpcwallet.cpp
test/rpc_wallet_tests.cpp:174:     * 		getnewaddress
test/rpc_wallet_tests.cpp:176:    BOOST_CHECK_NO_THROW(CallRPC("getnewaddress"));
test/rpc_wallet_tests.cpp:177:    BOOST_CHECK_NO_THROW(CallRPC("getnewaddress getnewaddress_demoaccount"));
Binary file wallet/rpcwallet.cpp matches
wallet/wallet.h:439:    //! todo: add something to note what created it (user, getnewaddress, change)
```

`getnewaddress` 命令初始化在文件 `rpcserver.cpp` 中。

```cpp
/**
 * Call Table
 */
static const CRPCCommand vRPCCommands[] =
{ //  category              name                      actor (function)         okSafeMode
  //  --------------------- ------------------------  -----------------------  ----------
                                       ...
#ifdef ENABLE_WALLET
    /* Wallet */
                                       ...
    { "wallet",             "getnewaddress",          &getnewaddress,          true  },
                                       ...
#endif // ENABLE_WALLET
};
```

远程过程调用命令类 `CRPCCommand` 定义在文件 `rpcserver.h` 中。

```cpp
typedef UniValue(*rpcfn_type)(const UniValue& params, bool fHelp); // 回调函数类型定义

class CRPCCommand
{
public:
    std::string category;
    std::string name;
    rpcfn_type actor;
    bool okSafeMode;
};
```

`rpcfn_type` 是一个函数标签为 `UniValue(const UniValue&, bool)` 的回调函数类型。
形参 `fHelp` 是显示命令帮助的标志，对应[比特币客户端](/blog/2018/05/bitcoin-rpc-api.html#1-帮助信息)用法的第 3 条。

```shell
  bitcoin-cli [options] help <command>      Get help for a command
```

详见[比特币 RPC 命令「getnewaddress」](/blog/2018/08/bitcoin-rpc-getnewaddress.html)。

## 参考链接

* [Address - Bitcoin Wiki](https://en.bitcoin.it/wiki/Address){:target="_blank"}
* [List of address prefixes - Bitcoin Wiki](https://en.bitcoin.it/wiki/List_of_address_prefixes){:target="_blank"}
* [Base58Check encoding - Bitcoin Wiki](https://en.bitcoin.it/wiki/Base58Check_encoding){:target="_blank"}
* [bitcoin/base58.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/base58.cpp){:target="_blank"}
* [Technical background of version 1 Bitcoin addresses - Bitcoin Wiki](https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses){:target="_blank"}
* [bitcoinbook/bitcoinbook: Mastering Bitcoin 2nd Edition - Programming the Open Blockchain](https://github.com/bitcoinbook/bitcoinbook){:target="_blank"}
* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
