---
layout: post
title:  "如何制作一枚山寨数字货币"
date:   2018-05-13 16:02:28 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 山寨币
---
**基于比特币制作一枚山寨币是了解数字货币比特币及其底层区块链技术的最好方式。**
在了解比特币及区块链的相关概念后，要开始接触源码了，侯捷说过“源码之前，了无秘密”。
现在，让我们来一探比特币源码的世界。

## 0. 准备

### 0.1. 平台和工具

> * 平台：Ubuntu 16.04.\* LTS
> * 工具：Git

### 0.2. 比特币源码

这里使用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1) 版本的源码，
因为这是比特币含 CPU 挖矿代码的最后一版。

```shell
$ git clone https://github.com/bitcoin/bitcoin.git
$ cd bitcoin
$ git checkout v0.12.1
```

尝试构建比特币源码，确保其在当前平台正常工作。
关于比特币源码的编译详见[编译比特币源码](/blog/2018/05/compile-bitcoin.html)篇。

## 1. 修改币名

### 1.1. 修改源码文件名中币名

```shell
$ mv bitcoin altcoin # 修改目录名
$ cd altcoin
$ find . -exec rename 's/bitcoin/altcoin/' {} ";" # 修改所有含币名的文件名
```

### 1.2. 修改源码中的币名

```shell
$ find . -type f -print0 | xargs -0 sed -i 's/bitcoin/altcoin/g'
$ find . -type f -print0 | xargs -0 sed -i 's/Bitcoin/Altcoin/g'
$ find . -type f -print0 | xargs -0 sed -i 's/BitCoin/AltCoin/g'
$ find . -type f -print0 | xargs -0 sed -i 's/BItCoin/AltCoin/g'
$ find . -type f -print0 | xargs -0 sed -i 's/BITCOIN/ALTCOIN/g'
```

### 1.3. 修改源码中的币单位

```shell
$ find . -type f -print0 | xargs -0 sed -i 's/btc/atc/g'
$ find . -type f -print0 | xargs -0 sed -i 's/BTC/ATC/g'
```

提示：使用 grep 命令查看是否修改成功。

### 1.4. 修改源码中的错误拼写

```shell
$ grep -inr bitc
```

从结果中可以看到部分拼写错误，如：“src/qt/locale/altcoin_et.ts”文件的 Bitconi、
“src/qt/locale/altcoin_ar.ts”文件中的 Bitcion 和“src/qt/locale/altcoin_da.ts”文件中的 bitcon，
修改这些误拼，或者选择忽略。

使用以下命令修改这些误拼：

```shell
$ sed -i 's/Bitconi/Altcoin/' src/qt/locale/altcoin_et.ts
$ sed -i 's/Bitcion/Altcoin/' src/qt/locale/altcoin_ar.ts
$ sed -i 's/bitcon/altcoin/' src/qt/locale/altcoin_da.ts
```

### 1.5. 修复版权信息

不要直接更改现有版权，你可以在现有版权下面新增一条自己的版权。

首先修复 Bitcoin 版权信息：

```shell
$ find . -type f -print0 | xargs -0 sed -i 's/\ The\ Altcoin\ Core\ developers/\ The\ Bitcoin\ Core\ developers/g'
```

然后在该版权信息下面增加自己的版权：

**注：src 目录下源码文件的版权信息（年份）并不统一。**

> // Copyright (c) 2009-2015 The Bitcoin Core developers<br>
> +// Copyright (c) 2018 The Altcoin Core developers

```shell
$ find src -type f -print0 | xargs -0 sed -i '/\ The\ Bitcoin\ Core\ developers/a\\/\/\ Copyright\ (c)\ 2018\ The\ Altcoin\ Core\ developers'
```

最后单独修改版权文件 COPYING：

> Copyright (c) 2009-2016 The Bitcoin Core developers<br>
> +Copyright (c) 2018 The Altcoin Core developers

```shell
$ sed -i '/Copyright\ (c)\ 2009-2016\ The\ Bitcoin\ Core\ developers/a\Copyright\ (c)\ 2018\ The\ Altcoin\ Core\ developers' COPYING
```

### 1.6. 修复旧发行版信息

```shell
$ sed -i 's/altcoin/bitcoin/g' doc/release-notes/*
$ sed -i 's/Altcoin/Bitcoin/g' doc/release-notes/*
```

### 1.7. 修改图标和图像

比特币的图标和图像保存在“src/qt/res”目录下，你可以使用 GIMP 进行编辑，
至少要修改 altcoin.ico、altcoin.png、altcoin_testnet.ico、altcoin_testnet.png 和 altcoin.icns。

### 1.8. 重新构建源码

第二次构建源码，确保以上修改不会影响其正常工作。

## 2. 修改默认端口

这一步修改的是节点间通讯的端口以及服务器端与客户端之间通讯的 RCP 端口。
从这里开始进入核心内容的修改。

**注：比特币源码的目录为 bitcoin/src，之后文件的位置若无特殊说明，则均以 src 为根目录。**

### 2.1. 修改节点间通讯的默认端口

节点间通讯的默认端口硬编在 3 个网络类的默认无参构造函数中。

> * CMainParams（主网，公有）
> * CTestNetParams（测试网，公有）
> * CRegTestParams（回归测试网，私有）

它们均定义在文件 “chainparams.cpp” 中，下面以**主网（Main network）**为例进行修改：

```cpp
/**
 * Main network
 */
/**
 * What makes a good checkpoint block?
 * + Is surrounded by blocks with reasonable timestamps
 *   (no blocks before with a timestamp after, none after with
 *    timestamp before)
 * + Contains no strange transactions
 */

class CMainParams : public CChainParams {
public:
    CMainParams() {
        ...
-       nDefaultPort = 8333; // 改为其它端口，例："8331"
+       nDefaultPort = 8331;
        ...
        };
    }
};
```

### 2.2. 修改服务器端（d）与客户端（cli）通讯的 RCP 默认端口

RPC 默认端口硬编在“chainparamsbase.cpp”文件中。修改如下：

```cpp
/**
 * Main network
 */
class CBaseMainParams : public CBaseChainParams
{
public:
    CBaseMainParams()
    {
-       nRPCPort = 8332; // 改为其它端口，例："8330"
+       nRPCPort = 8330;
    }
};
```

**注：nRPCPort 和 nDefaultPort 不能相同，否则会导致在节点启动时其中一个默认端口被占用而绑定失败。**

## 3. 修改 DNS 种子

比特币（核心）服务节点启动后会自动连接到区块链网络，底层通过 DNS 种子来获取正在运行的节点列表并进行连接。

如果没有该种子可以直接注释掉这部分，修改如下：

```cpp
class CMainParams : public CChainParams {
public:
    CMainParams() {
        ...
-       vSeeds.push_back(CDNSSeedData("bitcoin.sipa.be", "seed.bitcoin.sipa.be")); // Pieter Wuille
-       vSeeds.push_back(CDNSSeedData("bluematt.me", "dnsseed.bluematt.me")); // Matt Corallo
-       vSeeds.push_back(CDNSSeedData("dashjr.org", "dnsseed.bitcoin.dashjr.org")); // Luke Dashjr
-       vSeeds.push_back(CDNSSeedData("bitcoinstats.com", "seed.bitcoinstats.com")); // Christian Decker
-       vSeeds.push_back(CDNSSeedData("xf2.org", "bitseed.xf2.org")); // Jeff Garzik
-       vSeeds.push_back(CDNSSeedData("bitcoin.jonasschnelli.ch", "seed.bitcoin.jonasschnelli.ch")); // Jonas Schnelli
+       //vSeeds.push_back(CDNSSeedData("bitcoin.sipa.be", "seed.bitcoin.sipa.be")); // Pieter Wuille
+       //vSeeds.push_back(CDNSSeedData("bluematt.me", "dnsseed.bluematt.me")); // Matt Corallo
+       //vSeeds.push_back(CDNSSeedData("dashjr.org", "dnsseed.bitcoin.dashjr.org")); // Luke Dashjr
+       //vSeeds.push_back(CDNSSeedData("bitcoinstats.com", "seed.bitcoinstats.com")); // Christian Decker
+       //vSeeds.push_back(CDNSSeedData("xf2.org", "bitseed.xf2.org")); // Jeff Garzik
+       //vSeeds.push_back(CDNSSeedData("bitcoin.jonasschnelli.ch", "seed.bitcoin.jonasschnelli.ch")); // Jonas Schnelli
        ... 
-       vFixedSeeds = std::vector<SeedSpec6>(pnSeed6_main, pnSeed6_main + ARRAYLEN(pnSeed6_main));
+       //vFixedSeeds = std::vector<SeedSpec6>(pnSeed6_main, pnSeed6_main + ARRAYLEN(pnSeed6_main));
        ...
        };
    }
};
```

也可以使用官方的 py 工具生成 seeds，具体参考 [bitcoin/contrib/seeds at master · bitcoin/bitcoin · GitHub](https://github.com/bitcoin/bitcoin/tree/master/contrib/seeds){:target="_blank"}。

## 4. 修改网络协议魔数

所谓协议魔数就是节点在网络中传递信息的消息头，类似于 TCP 协议 20 个字节的报头和 IP 协议 20 个字节的报头，这里的消息头共 4 个字节。

可随意设置，不同于原魔数即可。修改如下：

```cpp
class CMainParams : public CChainParams {
public:
    CMainParams() {
        ...
        /**
         * The message start string is designed to be unlikely to occur in normal data.
         * The characters are rarely used upper ASCII, not valid as UTF-8, and produce
         * a large 32-bit integer with any alignment.
         */
-       pchMessageStart[0] = 0xf9;
-       pchMessageStart[1] = 0xbe;
-       pchMessageStart[2] = 0xb4;
-       pchMessageStart[3] = 0xd9;
+       pchMessageStart[0] = 0xca; // 例：0xcafecafe
+       pchMessageStart[1] = 0xfe;
+       pchMessageStart[2] = 0xca;
+       pchMessageStart[3] = 0xfe;
        ...
        };
    }
};
```

可以取一个有意义的单词作为魔数，例如：0xcafecafe。单词所含字母必须在 16 进制范围内，也就是在 a、b、c、d、e、f 中选取。

或使用随机数替代，方法如下：

```shell
$ echo $RANDOM
```

使用该命令获取随机数，取其后三位（当 <= 255 时取值）转换为 16 进制，取 4 个作为魔数。

## 5. 修改公钥地址前缀

```cpp
class CMainParams : public CChainParams {
public:
    CMainParams() {
        ...
        base58Prefixes[PUBKEY_ADDRESS] = std::vector<unsigned char>(1,0); // 公钥地址前缀，10 进制的 0 对应 base58 编码的 1
        base58Prefixes[SCRIPT_ADDRESS] = std::vector<unsigned char>(1,5); // 脚本地址前缀，10 进制的 5 对应 base58 编码的 3
        base58Prefixes[SECRET_KEY] =     std::vector<unsigned char>(1,128); // 密（私）钥前缀，10 进制的 128 对用 base58 编码的 K 或 L（压缩的私钥）
        base58Prefixes[EXT_PUBLIC_KEY] = boost::assign::list_of(0x04)(0x88)(0xB2)(0x1E).convert_to_container<std::vector<unsigned char> >();
        base58Prefixes[EXT_SECRET_KEY] = boost::assign::list_of(0x04)(0x88)(0xAD)(0xE4).convert_to_container<std::vector<unsigned char> >();
        ...
        };
    }
};
```

PUBKEY_ADDRESS 是 P2PKH 类型的地址，其前缀对应的 10 进制根据 [List of address prefixes](https://en.bitcoin.it/wiki/List_of_address_prefixes) 进行修改。

例：把比特币的公钥地址前缀 1 改为大写字母 C，通过查表得到 C 对应的 10 进制为 28，修改如下：

```cpp
-       base58Prefixes[PUBKEY_ADDRESS] = std::vector<unsigned char>(1,0);
+       base58Prefixes[PUBKEY_ADDRESS] = std::vector<unsigned char>(1,28);
```

**注：公钥地址和脚本地址以及私钥均采用 base58 编码后显示，方便人类使用，详见[Base58 编码](/blog/2018/05/base58-encoding.html)。**

这里的前缀只有一个字符，若想获取超过 1 个字符长度的前缀，可以参考[比特币“靓号”地址](/blog/2018/05/bitcoin-vanity-address.html)。

## 6. 修改创世区块内容

创世区块的内容包含 2 部分：基本信息和相关信息。基本信息直接保存在区块内，而相关信息则保存在在区块外。
相关信息通过某种方式转换为基本信息，即可以通过区块内的基本信息索引找到相关信息。

创世区块信息硬编在“chainparams.cpp”文件中，具体如下：

```cpp
...
static CBlock CreateGenesisBlock(const char* pszTimestamp, const CScript& genesisOutputScript, uint32_t nTime, uint32_t nNonce, uint32_t nBits, int32_t nVersion, const CAmount& genesisReward)
{
    CMutableTransaction txNew; // 创币交易 coinbase （区块中的第一笔交易）
    txNew.nVersion = 1;
    txNew.vin.resize(1);
    txNew.vout.resize(1);
    txNew.vin[0].scriptSig = CScript() << 486604799 << CScriptNum(4) << std::vector<unsigned char>((const unsigned char*)pszTimestamp, (const unsigned char*)pszTimestamp + strlen(pszTimestamp));
    txNew.vout[0].nValue = genesisReward; // 区块奖励
    txNew.vout[0].scriptPubKey = genesisOutputScript; // 私钥对应的公钥地址脚本，即创世区块奖励发送的地址

    CBlock genesis; // 创世区块基本信息
    genesis.nTime    = nTime; // 记录生成该区块的时间（时间戳）
    genesis.nBits    = nBits; // 对应难度
    genesis.nNonce   = nNonce; // 可根据其变化进行挖矿
    genesis.nVersion = nVersion; // 区块版本
    genesis.vtx.push_back(txNew); // 创币交易（区块体，其余 6 项为区块头信息）
    genesis.hashPrevBlock.SetNull(); // 创世区块之前没有区块
    genesis.hashMerkleRoot = BlockMerkleRoot(genesis); // 默克树根（区块体/交易 的索引）
    return genesis;
}

/**
 * Build the genesis block. Note that the output of its generation
 * transaction cannot be spent since it did not originally exist in the
 * database.
 *
 * CBlock(hash=000000000019d6, ver=1, hashPrevBlock=00000000000000, hashMerkleRoot=4a5e1e, nTime=1231006505, nBits=1d00ffff, nNonce=2083236893, vtx=1)
 *   CTransaction(hash=4a5e1e, ver=1, vin.size=1, vout.size=1, nLockTime=0)
 *     CTxIn(COutPoint(000000, -1), coinbase 04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73)
 *     CTxOut(nValue=50.00000000, scriptPubKey=0x5F1DF16B2B704C8A578D0B)
 *   vMerkleTree: 4a5e1e
 */
static CBlock CreateGenesisBlock(uint32_t nTime, uint32_t nNonce, uint32_t nBits, int32_t nVersion, const CAmount& genesisReward)
{
    const char* pszTimestamp = "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"; // 这里就是中本聪在创世区块中留下的泰晤士报的标题
    const CScript genesisOutputScript = CScript() << ParseHex("04678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f") << OP_CHECKSIG;
    return CreateGenesisBlock(pszTimestamp, genesisOutputScript, nTime, nNonce, nBits, nVersion, genesisReward);
}
...
class CMainParams : public CChainParams {
public:
    CMainParams() {
        ...
        consensus.powLimit = uint256S("00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff"); // 最低难度，可由 nBits 对应的 hashTarget 推出
        ... // 这里硬编的创世区块参数：创建时间，随机数，初始挖矿难度，版本号，奖励
        genesis = CreateGenesisBlock(1231006505, 2083236893, 0x1d00ffff, 1, 50 * COIN); // 这里创建创世区块
        consensus.hashGenesisBlock = genesis.GetHash(); // 并添加创世区块的哈希到共识对象
        assert(consensus.hashGenesisBlock == uint256S("0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f")); // 检验创世区块哈希
        assert(genesis.hashMerkleRoot == uint256S("0x4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b")); // 检验区块默尔克树根哈希
        ...
        };
    }
};
```

关于区块的内部构造，详见[比特币源码剖析—区块](/blog/2018/04/bitcoin-block.html)篇。

### 6.1. 修改创世区块相关信息

相关信息有：文字版时间戳。

文字版时间戳使用大多数人都知道的可以成为历史的（可追溯的）事件表示。
例：中本聪在比特币创世区块中留下的是泰晤士报的头条 "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"。

### 6.2. 修改创世区块基本信息

基本信息有：创建时间（时间戳），随机数（挖到块时），难度对应值（影响挖矿速度），版本（一般不变），奖励（包含在创币交易的输出中，影响货币的发行量）。

步骤如下：

> 1. 使用如下命令获取当前的 UNIX 时间戳：
> ```shell
> $ date +%s
> ```
> 2. 随机数置为 0，为挖创世区块做准备，挖到块后重置此值。
> 3. 难度可以设为回归测试网难度 0x207fffff（很低，可秒出块），同时修改共识中的工作量证明限制。
> 4. 版本一般不变。
> 5. 奖励根据货币发行量配合奖励减半时间间隔来更改。

例：修改了时间戳、随机数（非最终值）、难度对应值及共识中工作量证明限制，版本和奖励未改变。

```cpp
-       consensus.powLimit = uint256S("00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
+       consensus.powLimit = uint256S("7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
        ...
-       genesis = CreateGenesisBlock(1231006505, 2083236893, 0x1d00ffff, 1, 50 * COIN);
+       genesis = CreateGenesisBlock(1526197820, 0, 0x207fffff, 1, 50 * COIN);
```

接下来开始挖创世区块，其主要信息有随机数（nNonce）、区块哈希和默尔克树根哈希。

首先在“miner.cpp”文件中增加以下代码，用于寻找创世区块。

```cpp
+void getGenesisBlock(CBlock *pblock) // 获取创世区块的基本信息（nNonce, hash, merkleroot）
+{
+   arith_uint256 hashTarget = arith_uint256().SetCompact(pblock->nBits);
+   printf("hashTarget: %s\n", hashTarget.ToString().c_str());
+   uint256 hash;
+   uint32_t nNonce = 0;
+   int64_t nStart = GetTime();
+   while (true)
+   {
+       if (ScanHash(pblock, nNonce, &hash))
+       {
+           printf("block hash: %s", hash.ToString().c_str());
+           if (UintToArith256(hash) <= hashTarget)
+           {
+      	        printf(" true\n"
+       	        "Congratulation! You found the genesis block. total time: %lds\n"
+       	        "the nNonce: %u\n"
+       	        "genesis block hash: %s\n"
+       	        "genesis block merkle root: %s\n", GetTime() - nStart, nNonce, hash.ToString().c_str(), pblock->hashMerkleRoot.ToString().c_str());
+       	    break;
+           }
+           else
+           {
+               printf(" false\n");
+           }
+       }
+   }
+}
```

同时在“miner.h”头文件中增加该函数的声明。

```cpp
+/** Search the genesis block */
+void getGenesisBlock(CBlock *pblock);
```

然后在“chainparams.cpp”文件中包含该头文件，并在适当的位置调用即可获取创世区块剩余的基本信息。

```cpp
#include "chainparamsseeds.h"
+#include "miner.h"
```

最后在创世区块初始化完成的后面，调用该函数来挖创世区块，只需把创建好的创世区块作为实参传入即可。

```cpp
        genesis = CreateGenesisBlock(1526197820, 0, 0x207fffff, 1, 50 * COIN);
+       getGenesisBlock(&genesis);
        consensus.hashGenesisBlock = genesis.GetHash();
```

做完以上工作，只需重新 make，再次生成 altcoind 程序后，make 会失败，此时只需执行 altcoind 程序，喝杯咖啡静静等待创世区块的成功挖掘。
由于设置的难度很低，所以基本上是秒出块，记录下区块信息：随机数（nNonce）、区块哈希（hashGenesisBlock）和默尔克树根哈希（hashMerkleRoot），
替换以下对应位置即可。

```cpp
-       genesis = CreateGenesisBlock(1526197820, 0, 0x207fffff, 1, 50 * COIN);
+       genesis = CreateGenesisBlock(1526197820, nNonce, 0x207fffff, 1, 50 * COIN);
-       getGenesisBlock(&genesis);
-       assert(consensus.hashGenesisBlock == uint256S("0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"));
+       assert(consensus.hashGenesisBlock == uint256S("0xhashGenesisBlock"));
-       assert(genesis.hashMerkleRoot == uint256S("0x4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"));
+       assert(genesis.hashMerkleRoot == uint256S("0xhashMerkleRoot"));
```

至此，新的创世区块就诞生了。

## 7. 修改检测点

检测点用于验证区块链上的区块，是一个 kv 键值对，对应区块号（高度）和区块哈希。
检测点数据对象包含检测点映射列表、最后一个检测点区块的时间戳、创世区块与最后一个检测点区块间的总交易数以及对以后每天交易总量的估计值。

检测点硬编在主网参数类的默认无参构造函数中，修改如下：

```cpp
class CMainParams : public CChainParams {
public:
    CMainParams() {
        ...
-       checkpointData = (CCheckpointData) {
-           boost::assign::map_list_of
-           ( 11111, uint256S("0x0000000069e244f73d78e8fd29ba2fd2ed618bd6fa2ee92559f542fdb26e7c1d"))
-           ( 33333, uint256S("0x000000002dd5588a74784eaa7ab0507a18ad16a236e7b1ce69f00d7ddfb5d0a6"))
-           ( 74000, uint256S("0x0000000000573993a3c9e41ce34471c079dcf5f52a0e824a81e7f953b8661a20"))
-           (105000, uint256S("0x00000000000291ce28027faea320c8d2b054b2e0fe44a773f3eefb151d6bdc97"))
-           (134444, uint256S("0x00000000000005b12ffd4cd315cd34ffd4a594f430ac814c91184a0d42d2b0fe"))
-           (168000, uint256S("0x000000000000099e61ea72015e79632f216fe6cb33d7899acb35b75c8303b763"))
-           (193000, uint256S("0x000000000000059f452a5f7340de6682a977387c17010ff6e6c3bd83ca8b1317"))
-           (210000, uint256S("0x000000000000048b95347e83192f69cf0366076336c639f9b7228e9ba171342e"))
-           (216116, uint256S("0x00000000000001b4f4b433e81ee46494af945cf96014816a4e2370f11b23df4e"))
-           (225430, uint256S("0x00000000000001c108384350f74090433e7fcf79a606b8e797f065b130575932"))
-           (250000, uint256S("0x000000000000003887df1f29024b06fc2200b55f8af8f35453d7be294df2d214"))
-           (279000, uint256S("0x0000000000000001ae8c72a0b0c301f67e3afca10e819efa9041e458e9bd7e40"))
-           (295000, uint256S("0x00000000000000004d9b4ef50f0f9d686fd69db2e03af35a100370c64632a983")),
-           1397080064, // * Unix timestamp of last checkpoint block
-           36544669,   // * total number of transactions between genesis and last checkpoint
-                       //   (the tx=... number in the SetBestChain debug.log lines)
-           60000.0     // * estimated number of transactions per day after checkpoint
-       };
+       checkpointData = (CCheckpointData) {
+           boost::assign::map_list_of
+           (0, uint256S("0xhashGenesisBlock"))
+           1526197820, // * Unix timestamp of last checkpoint block
+           0,   // * total number of transactions between genesis and last checkpoint
+                       //   (the tx=... number in the SetBestChain debug.log lines)
+           500     // * estimated number of transactions per day after checkpoint
+       };
    }
};
```

> 1. 把检测点列表删除，增加创世区块检测点到该列表，创世区块的哈希由第六步得到。
> 2. 填入创世区块的创建时间。
> 3. 交易数为 0。
> 4. 估计交易数为 500（这个值随意填）。

**注：检测点的信息可随区块链的延伸不断更新。**

## 8. 修改最小链工作量（v0.13.2rc1）

在 v0.13.2rc1 版本中，增加 consensus.nMinimumChainWork 参数，用于替代初始化区块下载检查中的检测点。
引入了一个链参数“最小链工作量”，该参数用于表示软件发布时区块链的工作量。如果没有达到该工作量，说明你还没有赶上。
用于代替检测点的区块计数测试。
因为没有主观性，信任，或位置依赖等因素，所以该标准很容易保持更新。它也是同步状态的可靠度量，而非区块计数。

详见 [IBD check uses minimumchain work instead of checkpoints. · bitcoin/bitcoin@ad20cdd](https://github.com/bitcoin/bitcoin/commit/ad20cddce2097c6561202777fccd257deb1a9810)。

**注：rc1 即正式发行候选版（Release Candidate）的第一版。测试版一般有 3 种，分别为：alpha、beta、gamma。
alpha 表示内测版即 CB（Close Beta），beta 表示公测版即 OB（Open Beta），gamma 表示正式发布候选版即 RC（Release Candidate）。**

最小链工作量作为共识的成员变量，其初始化硬编在主网参数类的无参构造函数中，修改如下：

```cpp
class CMainParams : public CChainParams {
public:
    CMainParams() {
        ...
        // The best chain should have at least this much work.
-       consensus.nMinimumChainWork = uint256S("0x0000000000000000000000000000000000000000002cb971dd56d1c583c20f90");
+       consensus.nMinimumChainWork = uint256S("0x00");
        ...
    }
};
```

该值一开始置零（0x00），和检测点一样，随着区块链的延伸不断增加（更新），可通过 RPC 命令 [getbestblockhash](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html) 和 [getblock](/blog/2018/05/bitcoin-rpc-command-getblock.html) 获取最佳区块信息的链工作量（chainwork）值获取。

现在第三次编译源码，一枚基于比特币的山寨币就制作完成了。
通过这个过程，可以了解比特币源码的一小部分，为深入比特币底层区块链技术做铺垫。

## 参考链接

* [How to make an altcoin \| Bear's Den](http://dillingers.com/blog/2015/04/18/how-to-make-an-altcoin/){:target="_blank"}
* [如何仿照比特币创造自己的山寨币 \| Sunny's Blog](http://shusunny.github.io/2016/04/How-to-make-altcoin-1){:target="_blank"}
* [从 0 到 1 建立自己的区块链 \| 巴比特](http://www.8btc.com/build-your-own-blockchain){:target="_blank"}
* [mistydew/blockchain](https://github.com/mistydew/blockchain){:target="_blank"}
