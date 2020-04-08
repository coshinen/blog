---
layout: post
title:  "比特币源码剖析—私钥、公钥、地址"
date:   2018-05-07 20:22:21 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin Address ECC
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
以 WIF(wallet import format) 钱包导入格式即 Base58 校验和编码进行导出。例：

```shell
$ ./bitcoin-cli dumpprivkey 12PbLWS4h3qSmQfdu4oEgXCYMGY4TVbL3N
KzCFcgtfrPA2uWmXn4zjVNaKYMEUHbh732XzZ4aZ737545DqZ3V4
```

**注：该命令只适用于本地钱包数据库中的私钥。**

## 私钥、公钥、地址之间的转换流程

![private-public-key-address](https://mistydew.github.io/assets/images/bitcoin/address/private-public-key-address.png){:.border}

**注：“私钥->公钥”、“公钥->地址”这两步是单向不可逆的。**

## 从私钥到公钥地址的详细步骤

1.使用伪随机数生成器 PRNG 生成一个给定范围内的 256 位随机数作为私钥 PrivKey。<br>
2.使用 OpenSSL 加密库中 secp256k1 标准的椭圆曲线相乘加密算法计算上一步生成私钥 PrivKey 得到相应的公钥 PubKey。

![public-key-to-bitcoin-address](https://mistydew.github.io/assets/images/bitcoin/address/public-key-to-bitcoin-address.png){:.border}

3.使用 "Double Hash" 或 "Hash160" 运算上一步生成的公钥 PubKey 得到公钥地址 PubKeyAddress，用户看到的是该地址经过 Base58Check 编码后得到地址 address。<br>
3.1."Hash160" 是先后经过了 SHA256 和 RIPEMD160 两步运算得到 160 位及 20 个字节的公钥地址，PubKeyAddress = RIPEMD160(SHA256(PubKey))。<br>
3.2.最后经过 Base58 编码得到最后的地址，address = Base58Check(PubKeyAddress)。

![base58check-encoding](https://mistydew.github.io/assets/images/bitcoin/address/base58check-encoding.png){:.border}

3.2.1.在 20 个字节的公钥地址前附加 1 个字节的版本前缀，比特币主网的版本号为 "0x00" 对应前缀为 "1"，VersionPrefix + PubKeyAddress。<br>
3.2.2.对上步得到的 21bytes 进行两次哈希 SHA256，SHA256(SHA256(VersionPrefix + PubKeyAddress))。<br>
3.2.3.取上步结果的前 4 个字节作为校验和 Checksum 追加到 3.2.1 结果的后面，VersionPrefix + PubKeyAddress + Checksum。<br>
3.2.4.对上步得到的 25bytes 进行 Base58 编码得到最终的地址，address = Base58(VersionPrefix + PubKeyAddress + Checksum)。

## 源码剖析

从公钥到地址转换的流程图：

![public-key-to-btc-address](https://mistydew.github.io/assets/images/bitcoin/address/public-key-to-btc-address.png)

```shell
$ cd bitcoin/src # 进入比特币根目录下的 src 目录，之后未作特殊说明的均以该目录作为比特币源码的根目录。
$ grep "getnewaddress" * -nir # 搜索 RPC 命令 getnewaddress 所出现的文件及位置，grep 是 Linux 下的一个查找字符串命令，其他平台或 IDE 请自行忽略。
rpcserver.cpp:344:    { "wallet",             "getnewaddress",          &getnewaddress,          true  },
rpcserver.h:199:extern UniValue getnewaddress(const UniValue& params, bool fHelp); // in rpcwallet.cpp
test/rpc_wallet_tests.cpp:174:     * 		getnewaddress
test/rpc_wallet_tests.cpp:176:    BOOST_CHECK_NO_THROW(CallRPC("getnewaddress"));
test/rpc_wallet_tests.cpp:177:    BOOST_CHECK_NO_THROW(CallRPC("getnewaddress getnewaddress_demoaccount"));
Binary file wallet/rpcwallet.cpp matches
wallet/wallet.h:439:    //! todo: add something to note what created it (user, getnewaddress, change)
```

从结果中我们可以看到出现该命令的文件名以及在该文件中出现的行号。
分别出现在“rpcserver.cpp”、“rpcserver.h”、“test/rpc_wallet_tests.cpp”、“wallet/rpcwallet.cpp”、“wallet/wallet.h”这 5 个文件中。
打开“rpcserver.cpp”文件，找到该命令出现的位置。

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

vRPCCommands[] 是一个静态常量类对象数组，在“rpcserver.h”文件中找到类 CRPCCommand 的定义如下：

```cpp
typedef UniValue(*rpcfn_type)(const UniValue& params, bool fHelp); // 回调函数类型定义

class CRPCCommand // 远程过程调用命令类
{
public:
    std::string category; // 所属类别
    std::string name; // 名称
    rpcfn_type actor; // 对应的函数行为
    bool okSafeMode; // 是否打开安全模式
};
```

该类的 4 个成员变量对应注释的 4 个列名。
rpcfn_type 是一个函数标签为 UniValue(const UniValue&, bool) 的回调函数类型，形参 params 为 RPC 命令的参数，形参 fHelp 为显示该命令帮助的标志，对应[比特币核心客户端基础命令](/blog/2018/05/bitcoin-cli-commands.html)用法的第 3 条。

```shell
  bitcoin-cli [options] help <command>      Get help for a command # 获取一条命令的帮助信息（用法示例）
```

详见 [比特币 RCP 命令剖析 getnewaddress](/blog/2018/08/bitcoin-rpc-command-getnewaddress.html)。

## 参考链接

* [Technical background of version 1 Bitcoin addresses - Bitcoin Wiki](https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses){:target="_blank"}
* [List of address prefixes - Bitcoin Wiki](https://en.bitcoin.it/wiki/List_of_address_prefixes){:target="_blank"}
* [Address - Bitcoin Wiki](https://en.bitcoin.it/wiki/Address){:target="_blank"}
* [Base58 - Wikipedia](https://en.wikipedia.org/wiki/Base58){:target="_blank"}
* [Base58Check encoding - Bitcoin Wiki](https://en.bitcoin.it/wiki/Base58Check_encoding){:target="_blank"}
* [bitcoin/bitcoin/src/base58.cpp](https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp){:target="_blank"}
