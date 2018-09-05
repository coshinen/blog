---
layout: post
title:  "比特币开发者术语表"
date:   2018-08-20 22:08:57 +0800
author: mistydew
categories: Blockchain Bitcoin 译文
tags: 区块链 比特币 术语表
---
这是一个专业术语汇编。普通用户应该使用[词汇表页面](/2018/08/21/some-bitcoin-words-you-might-hear)。

## 百分之 51 攻击 | 51% Attack

**定义**：控制大多数网络哈希率的某人修改交易历史并阻止新交易确认的能力。

**同义词**：`51 percent attack`, `Majority Hash Rate attack`

<p id="BlockChain"></p>
## 区块链 | Block Chain

**定义**：区块链，每个[区块](#Block)都引用其前面[区块](#Block)。最难重建的链是最佳区块链。

**同义词**：`Best block chain`

**不要混淆**：[`Header chain`](#HeaderChain)

<p id="HeaderChain"></p>
## 区块头链 | Header Chain

**定义**：区块头链，每个[区块头](#BlockHeader)都链接其前面的[区块头](#BlockHeader)；最难重建的链是最佳区块头链。

**同义词**：`Best header chain`

**不要混淆**：[`Block chain`](#BlockChain)

<p id="Block"></p>
## 区块 | Block

**定义**：以[区块头](#BlockHeader)开头并受[工作量证明](#POW)保护的一笔或多笔交易。区块是存储在[区块链](#BlockChain)上的数据。

**同义词**：`Block of transactions`

<p id="BlockHeader"></p>
## 区块头 | Block Header

**定义**：单个[区块](#Block)的 80 个字节的区块头，被反复地散列以创建[工作量证明](#POW)。

**同义词**：`Header`

<p id="POW"></p>
## 工作量证明 | Proof Of Work, POW

**定义**：低于[目标值](#Target)的散列，一般只能通过执行一定量的暴力工作获得—因此论证了工作量证明。

<p id="Target"></p>
## 难度对应值 | nBits

**定义**：该目标值是低于必须使[区块](#Block)有效的[区块头](#BlockHeader)散列值的阈值，并且难度对应值出现在[区块头](#BlockHeader)中，是目标阈值的编码形式。

**同义词**：`Target`, `Target threshold`（阈值）

**不要混淆**：[`Difficulty`](#Difficulty)（一个数字，用于衡量寻找[区块头](#BlockHeader)哈希的[难度](#Difficulty)，相对于最容易目标值寻找[区块头](#BlockHeader)哈希的[难度](#Difficulty)）

<p id="Difficulty"></p>
## 难度 | Difficulty

**定义**：相对找到最简单的[区块](#Block)的难度，找到一个[区块](#Block)有多难。最简单[区块](#Block)的工作量证明难度为 1。

**同义词**：`Network difficulty`

**不要混淆**：[`Target threshold`](#Target)（目标阈值，计算难度得到的值）

<p id="BlockHeight"></p>
## 区块高度 | Block Height

**定义**：[区块链](#BlockChain)上指定[区块](#Block)前的[区块](#Block)数。例如，因为[创世区块](#GenesisBlock)前面没有[区块](#Block)，所以其高度为 0。

**同义词**：`Height`, `Block chain height`

<p id="GenesisBlock"></p>
## 创世区块 | Genesis Block

**定义**：比特币[区块链](#BlockChain)上的第一个[区块](#Block)。

**同义词**：`Block 0`（0 号区块，高度为 0 的区块）

**不要混淆**：[`Generation transaction`](#CoinbaseTransaction)（创币交易，[区块](#Block)上的第一笔交易）

<p id="CoinbaseTransaction"></p>
## 创币交易 | Coinbase Transaction

**定义**：[区块](#Block)的第一笔交易。该区块总是通过[矿工](#Miner)创建，它包含一个[创币交易字段](#Coinbase)。

**同义词**：`Generation Transaction`

**不要混淆**：[`Coinbase`](#Coinbase)（创币交易的一部分）

<p id="Coinbase"></p>
## 创币交易字段 | Coinbase field

**定义**：一个特殊的字段，作为[创币交易](#CoinbaseTransaction)的唯一[输入](#TxIn)。创币交易字段允许声明[区块奖励](#BlockReward)并提供高达 100 个字节的任意数据。

**同义词**：`Coinbase`

**不要混淆**：[`Coinbase transaction`](#CoinbaseTransaction), [`Coinbase.com`](https://www.coinbase.com)

<p id="Miner"></p>
## 挖矿 | Mining

**定义**：挖矿是创建有效的比特币[区块](#Block)的行为，需要验证[工作量证明](#POW)，且矿工是挖矿的设备或拥有那些设备的人。

**同义词**：`Miner`

<p id="BlockReward"></p>
## 区块奖励 | Block Reward

**定义**：[矿工](#Miner)可能要求一定金额作为创建[区块](#Block)的奖励。等于[区块](#Block)补贴（新的可用的[聪](#Satoshis)）加[区块](#Block)交易支付的交易费的总和。

**同义词**：`Block miner reward`

**不要混淆**：`Block subsidy`, [`Transaction fees`](#TransactionFee)

<p id="Satoshis"></p>
## 衡量单位 | Denominations

**定义**：比特币值的衡量单位，通常用一些比特币来衡量，但有时用聪的数倍来衡量。
一个比特币等于 100,000,000 聪。

**同义词**：`Bitcoins`, `Satoshis`（聪）

**不要混淆**：二进制位，有两种可能取值的数据单元。

<p id="TransactionFee"></p>
## 交易费 | Transaction Fee

**定义**：一笔交易的全部[输入](#TxIn)减去全部[输出](#TxOut)值的剩余金额；该费用支付给包含该交易到[区块](#Block)的[矿工](#Miner)。

**同义词**：`Miners fee`

**不要混淆**：[`Minimum relay fee`](#MinimumRelayFee)（接收一笔交易到内存池并通过比特币核心[节点](#Node)中继必须支付的最低费用）

<p id="MinimumRelayFee"></p>
## 最小中继费 | Minimum Relay Fee

**定义**：最小[交易费](#TransactionFee)，用于中继到其他[节点](#Node)的交易必须支付给[全节点](#Node)的费用（如果它不是[高优先级交易](#FreeTx)）。并没有最低中继费—每个[节点](#Node)选择它自己的决策。

**同义词**：`Relay fee`

**不要混淆**：[`Transaction fee`](#TransactionFee)（最小中继费是过滤过低[交易费](#TransactionFee)交易的决策选项）

<p id="FreeTx"></p>
## 高优先级交易 | High-Priority Transaction

**定义**：没有支付[交易费](#TransactionFee)的交易，因为他们的[输入](#TxIn)空闲时间够长足以积累大量的优先级。注：[矿工](#Miner)选择是否接受免费交易。

**同义词**：`Free transaction`, `Free Tx`（免费交易，不含交易费）

<p id="TxIn"></p>
## 交易输入 | Transaction Input

**定义**：一笔交易的输入包含 3 个字段：[输出点](#Outpoint)，[签名脚本](#ScriptSig)，和[序列号](#Sequence)。[输出点](#Outpoint)引用前一笔[交易输出](#TxOut)且[签名脚本](#ScriptSig)允许花费它。

**同义词**：`Input`, `TxIn`

<p id="TxOut"></p>
## 交易输出 | Transaction Output

**定义**：一笔交易的输出包含 2 个字段：转账 0 或更多[聪](#Satoshis)的字段和指明必须满足哪些条件才能进一步使用这些[聪](#Satoshis)的[公钥脚本](#ScriptPubKey)。

**同义词**：`Output`, `TxOut`

**不要混淆**：[`Outpoint`](#Outpoint)（某交易输出的引用）

<p id="ScriptSig"></p>
## 签名脚本 | Signature Script

**定义**：通过付款人生成的数据，几乎总是用作满足[公钥脚本](#ScriptPubKey)的变量。签名脚本在代码中又称为脚本签名。

**同义词**：`ScriptSig`（脚本签名）

**不要混淆**：[`ECDSA signature`](#Signature)（一种签名，除了其他数据，能用于公钥脚本的一部分）

<p id="Sequence"></p>
## 交易序列号 | Sequence Number (Transactions)

**定义**：所有交易的一部分。一个数字，旨在允许锁定时间的[未确认的交易](#Confirmations)在序列化前更新；目前尚未使用，除非在交易中禁用[锁定时间](#nLockTime)。

**不要混淆**：`Output index number / vout`（后面的交易用来引用特定[输出](#TxOut)的交易中的 0 索引号[输出](#TxOut)）

<p id="Confirmations"></p>
## 确认分数 | Confirmation Score

**定义**：分数表明在[最佳区块链](#BlockChain)上需要修改的[区块](#Block)数，用来移除或修改特定的交易。确认的交易有一个或更高的确认分数。

**同义词**：`Confirmations`, `Confirmed transaction`, `Unconfirmed transaction`

<p id="nLockTime"></p>
## 锁定时间 | Locktime

**定义**：交易的一部分用于表明交易可能被添加到[区块链](#BlockChain)的最早时间或最早的[区块](#Block)。

**同义词**：`nLockTime`

<p id="ScriptPubKey"></p>
## 公钥脚本 | Pubkey Script

**定义**：包含在[输出](#TxOut)中的脚本，用于设置必须满足用于花费的[聪](#Satoshis)。在签名脚本中提供满足条件的数据。[公钥脚本](#ScriptPubKey)在代码中被称为[脚本公钥 "scriptPubKey"](#ScriptPubKey)。

**同义词**：`ScriptPubKey`（脚本公钥）

**不要混淆**：[`Pubkey`](#PublicKey)（[`公钥`](#PublicKey)，用作公钥脚本的一部分但不提供可编程的身份验证机制）, [`Signature script`](#ScriptSig)（给公钥脚本提供数据的脚本）

<p id="Signature"></p>
## 签名 | Signature

**定义**：与[公钥](#PublicKey)相关的值，该公钥只能由拥有创建[公钥](#PublicKey)的[私钥](#PrivateKey)的人来创建。在比特币中用于在发送到[公钥](#PublicKey)前验证花费的[聪](#Satoshis)。

**同义词**：`ECDSA signature`（椭圆曲线加密签名）

<p id="PrivateKey"></p>
## 私钥 | Private Key

**定义**：密钥对的私有部分，用于创建其他人都能使用[公钥](#PublicKey)验证的[签名](#Signature)。

**同义词**：`ECDSA private key`（椭圆曲线私钥）

**不要混淆**：[`Public key`](#PublicKey)（从私钥派生出的数据）, [`Parent key`](#ParentKey)（用于创建[子密钥](#ChildKey)的密钥，不一定是私钥）

<p id="PublicKey"></p>
## 公钥 | Public Key

**定义**：密钥对的公共部分，用于验证使用密钥对私有部分进行的[签名](#Signature)。

**同义词**：`ECDSA public key`（椭圆曲线公钥）

**不要混淆**：[`Private key`](#PrivateKey)（派生出公钥的数据）, [`Parent key`](#ParentKey)（用于创建[子密钥](#ChildKey)的密钥，不一定是公钥）

<p id="HDWallet"></p>
## HD 协议 | HD Protocol

**定义**：分层确定性（HD）密钥创建和传输协议（BIP32），允许从[父密钥](#ParentKey)的层次创建[子密钥](#ChildKey)。使用 HD 协议的[钱包](#Wallet)称为 HD 钱包。

**同义词**：`HD wallet`, `BIP32`

<p id="Wallet"></p>
## 钱包 | Wallet

**定义**：存储[私钥](#PrivateKey)和[区块链](#BlockChain)镜像的软件（有时作为执行处理的服务器的客户端），允许用户花费和接收[聪](#Satoshis)。

**不要混淆**：[`HD wallet`](#HDWallet)（允许钱包从单个种子创建全部密钥的协议，使用该协议的钱包）

<p id="ParentKey"></p>
## 父密钥 | Parent Key

**定义**：在 [HD 钱包](#HDWallet)中，该密钥用于生成[子密钥](#ChildKey)。该密钥可能是[私钥](#PrivateKey)或[公钥](#PublicKey)，且密钥的生成可能也需要[链编码](#ChainCode)。

**同义词**：`HD wallet parent key`, `Parent public key`, `Parent private key`

**不要混淆**：[`Public key`](#PublicKey)（从[私钥](#PrivateKey)派生，非父密钥）

<p id="ChildKey"></p>
## 子密钥 | Child Key

**定义**：在 [HD 钱包](#HDWallet)中，从[父密钥](#ParentKey)派生的密钥。该密钥可以是[私钥](#PrivateKey)，也可以是[公钥](#PublicKey)，密钥的推导（派生）可能需要[链编码](#ChainCode)。

**同义词**：`HD wallet child key`, `Child public key`, `Child private key`

**不要混淆**：[`Public key`](#PublicKey)（从[私钥](#PrivateKey)派生，非父密钥）

<p id="ChainCode"></p>
## 链编码 | Chain Code

**定义**：在 [HD 钱包](#HDWallet)中，256 位熵被添加到公钥和[私钥](#PrivateKey)中，来帮助它们生成安全的[子密钥](#ChildKey)；
[主链编码](#MasterChainCode)通常派生自携带[主私钥](#MasterPrivateKey)的种子。

**同义词**：`HD wallet chain code`

<p id="MasterChainCode"></p>
## 主链代码和主私钥 | Master Chain Code And Private Key

**定义**：在 [HD 钱包](#HDWallet)中，主链代码和主私钥是从[根种子](#RootSeed)派生的 2 个数据。

**同义词**：`Master chain code`, `Master private key`

<p id="RootSeed"></p>
## HD 钱包种子 | HD Wallet Seed

**定义**：用作为 [HD 钱包](#HDWallet)生成[主私钥](#MasterChainCode)和[主链代码](#MasterChainCode)的种子的潜在短值。

**同义词**：`Root seed`

**不要混淆**：`Mnemonic code / mnemonic seed`（助记代码/种子，二进制根种子格式化为单词，使人们更容易记录和记忆）

<p id="Node"></p>
## 节点 | Node

**定义**：连接到比特币网络的计算机。

**同义词**：`Full Node`（完整/全节点）, `Archival Node`, `Pruned Node`（修剪过的节点）, `Peer`

**不要混淆**：`Lightweight node`（轻量级节点）, [`SPV node`](#SPV)

<p id="SPV"></p>
## 简单支付验证 | SPV, Simplified Payment Verification

**定义**：用于验证某笔交易是否包含在某个未下载完整的[区块](#Block)中。该方法用于一些轻量级比特币客户端。

**同义词**：`Lightweight client`（轻量级客户端）, `Thin client`

<p id="Fork"></p>
## 分叉 | Fork

**定义**：当 2 个或 2 个以上的[区块](#Block)有相同的[高度](#BlockHeight)时，[区块链](#BlockChain)分叉。特别是发生在 2 个或 2 个以上的[矿工](#Miner)几乎同时找到[区块](#Block)时。也可以用于攻击。

**同义词**：`Accidental fork`（意外的分叉）

**不要混淆**：[`Hard fork`](#HardFork)（[共识规则](#ConsensusRules)的变化会破坏不升级[节点](#Node)的安全性）,
[`Soft fork`](#SoftFork)（[共识规则](#ConsensusRules)的变化会削弱不升级[节点](#Node)的安全性）,
`Software fork`（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
`Git fork`（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

<p id="HardFork"></p>
## 硬分叉 | Hard Fork

**定义**：[区块链](#BlockChain)上永久性的分叉，通常发生在未升级的[节点](#Node)不能验证通过遵守新的[共识规则](#ConsensusRules)的升级的[节点](#Node)创建的[区块](#Block)时。

**同义词**：`Hard-forking change`（硬分叉变化）

**不要混淆**：[`Fork`](#Fork)（所有[节点](#Node)遵循相同的[共识规则](#ConsensusRules)的常规的分叉，一旦一条链的[工作量证明](#POW)高于另一条，该分叉被解决）,
[`Soft fork`](#SoftFork)（[区块链](#BlockChain)上由未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的临时分叉）,
`Software fork`（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
`Git fork`（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

<p id="SoftFork"></p>
## 软分叉 | Soft Fork

**定义**：软分叉是比特币协议的改变，其中只有之前有效的[区块](#Block)/交易变得无效了。因为旧的[节点](#Node)将仍认为新[区块](#Block)是有效的，所以软分叉是向后兼容的。

**同义词**：`Soft-forking change`（软分叉变化）

**不要混淆**：[`Fork`](#Fork)（所有[节点](#Node)遵循相同的[共识规则](#ConsensusRules)的常规的分叉，一旦一条链的[工作量证明](#POW)高于另一条，该分叉被解决）,
[`Hard fork`](#HardFork)（[区块链](#BlockChain)上因未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的永久性的分叉）,
`Software fork`（当一个或多个开发人员与其他开发人员永久性地分开开发一份代码）,
`Git fork`（当一个或多个开发人员与其他开发人员临时分开开发一份代码）

<p id="MASF"></p>
## 矿工激活的软分叉 | Miner Activated Soft Fork, MASF

**定义**：通过[矿工](#Miner)信号激活的[软分叉](#SoftFork)。

**不要混淆**：[`User Activated Soft Fork`](#UASF)（通过标记日或[节点](#Node)强制而非[矿工](#Miner)信号激活的i[软分叉](#SoftFork)）,
[`Fork`](#Fork)（所有[节点](#Node)遵循相同的[共识规则](#ConsensusRules)的常规的分叉，一旦一条链的[工作量证明](#POW)高于另一条，该分叉被解决）,
[`Hard fork`](#HardFork)（[区块链](#BlockChain)上因未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的永久性的分叉）,
[`Soft fork`](#SoftFork)（[区块链](#BlockChain)上由未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的临时分叉）,
`Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
`Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

<p id="UASF"></p>
## 用户激活的软分叉 | User Activated Soft Fork, UASF

**定义**：通过标志日或[节点](#Node)强制代替[矿工](#Miner)信号激活的[软分叉](#SoftFork)。

**不要混淆**：[`Miner activated soft fork`](#MASF)（通过[矿工](#Miner)信号激活的[软分叉](#SoftFork)）,
[`Fork`](#Fork)（所有[节点](#Node)遵循相同的[共识规则](#ConsensusRules)的常规的分叉，一旦一条链的[工作量证明](#POW)高于另一条，该分叉被解决）,
[`Hard fork`](#HardFork)（[区块链](#BlockChain)上因未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的永久性的分叉）,
[`Soft fork`](#SoftFork)（[区块链](#BlockChain)上由未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的临时分叉）,
`Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
`Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

<p id="ConsensusRules"></p>
## 共识规则 | Consensus Rules

**定义**：全[节点](#Node)遵循与其他[节点](#Node)相同的[共识](#Consensus)的区块验证规则。

**同义词**：`Validation Rules`（验证规则）

**不要混淆**：[`Consensus`](#Consensus)（当[节点](#Node)遵循相同的共识规则就达成了共识）

<p id="Consensus"></p>
## 共识 | Consensus

**定义**：当几个[节点](#Node)（通常是网络上的大部分[节点](#Node)）在它们本地验证过的[最佳区块链](#BlockChain)中都有相同的[区块](#Block)。

**不要混淆**：`Social consensus`（社会共识，通常用于开发人员之间的讨论，以表明大多数人同意某个特定的方案）, [`Consensus rules`](#ConsensusRules)（允许[节点](#Node)维持共识的规则）

<p id="StaleBlock"></p>
## 陈旧的区块 | Stale Block

**定义**：成功挖出但没有包含在当前[最佳区块链](#BlockChain)上的[区块](#Block)，可能是因为在相同[高度](#BlockHeight)的其他[区块](#Block)首先扩展链。

**不要混淆**：[`Orphan block`](#OrphanBlock)（该[区块](#Block)的前一个区块哈希域指向一个未知的[区块](#Block)，意味着孤儿块不能被验证）

<p id="OrphanBlock"></p>
## 孤儿块 | Orphan Block

**定义**：父[区块](#Block)没有被本地[节点](#Node)处理的[区块](#Block)，以至于它们还不能被完全验证。

**不要混淆**：[`Stale block`](#StaleBlock)（陈旧的区块）

## 区块大小限制 | Block Size Limit

**定义**：[共识规则](#ConsensusRules)允许一个[区块](#Block)的以字节为单位的最大尺寸。当前[区块](#Block)大小限制是 1,000,000 字节。

**同义词**：`Maximum block size`

**不要混淆**：[`Block`](#Block), [`Blockchain`](#BlockChain), `Blockchain size`

<p id="Mainnet"></p>
## 主网 | Mainnet

**定义**：比特币交易的原始和主要网络，其中的[聪](#Satoshis)有真正经济价值。

**同义词**：`Bitcoin main network`

**不要混淆**：[`Testnet`](#Testnet)（非常类似主网的开放网络，其中的[聪](#Satoshis)没有价值）, [`Regtest`](#Regtest)（类似于[测试网](#Testnet)的私有测试[节点](#Node)）

<p id="Testnet"></p>
## 测试网 | Testnet

**定义**：开发人员能够在类似于比特币[主网](#Mainnet)的网络上获得并花费没有真正价值的[聪](#Satoshis)的全球测试环境。

**同义词**：`Testing network`

**不要混淆**：[`Regtest`](#Regtest)（开发人员可控制[区块](#Block)生成的本地测试环境）

<p id="Regtest"></p>
## 回归测试网 | Regtest

**定义**：开发人员能够立刻产生测试所需[区块](#Block)的本地测试环境，能够创建没有价值的私有[聪](#Satoshis)。

**同义词**：`Regression test mode`

**不要混淆**：[`Testnet`](#Testnet)（模仿[主网](#Mainnet)的全球测试环境）

## DNS 种子 | DNS Seed

**定义**：`DNS` 域名解析服务器返回比特币网络上的全[节点](#Node)的 IP 地址集来帮助进行对端的发现。

**不要混淆**：[`HD wallet seeds`](#RootSeed)

<p id="Base58check"></p>
## Base58 编码 | Base58check

**定义**：比特币中用于转换 160 位的哈希值到 P2PKH 和 [P2SH 地址](#P2SH)的方法。
也用于比特币的其他部分，例如用于 WIP 格式备份编码的[私钥](#PrivateKey)。与其他的 base58 实现不同。

**同义词**：`Bitcoin Address Encoding`

**不要混淆**：[`P2PKH address`](#P2PKH), [`P2SH address`](#P2SH), `IP address`

<p id="P2PKH"></p>
## P2PKH 地址 | 2PKH Address

**定义**：比特币[付款地址](#Address)，包含哈希的[公钥](#PublicKey)，允许付款人创建标准的支付给公钥哈希（P2PKH）的[公钥脚本](#ScriptPubKey)。

**同义词**：`Pay to pubkey hash`, `P2PKH output`

**不要混淆**：[`P2PK output`](#TxOut)（直接支付给[公钥](#PublicKey)的[输出](#TxOut)）, [`P2SH address / output`](#P2SH)（包括哈希的脚本和其相应的[输出](#TxOut)的[地址](#Address)）

<p id="P2SH"></p>
## P2SH 地址 | P2SH Address

**定义**：比特币付款[地址](#Address)包含一个哈希的脚本，允许付款人创建一个标准的支付到脚本哈希（P2SH）的[公钥脚本](#ScriptPubKey)。该脚本几乎可能是任何有效的[公钥脚本](#ScriptPubKey)。

**同义词**：`Pay to script hash`, `P2SH output`

**不要混淆**：[`P2PK output`](#TxOut)（直接支付到[公钥](#PublicKey)的[输出](#TxOut)）,
[`P2PKH address / output`](#P2PKH)（由散列的[公钥](#PublicKey)和其相应的[输出](#TxOut)组成的[地址](#Address)）,
[`P2SH multisig`](#P2SHMultisig)（P2SH 特定的实例，其中脚本使用一个[多签操作码](#Opcode)）

<p id="Address"></p>
## 付款地址 | Payment Addresses

**定义**：使用 [`base58check`](#Base58check) 格式化的 20 个字节的哈希值，用来生成 `P2PKH` 或 `P2SH` 类型的比特币地址。
目前用户交换支付信息的最常见方式。

**同义词**：`Address`

**不要混淆**：`IP address`

<p id="P2SHMultisig"></p>
## P2SH 多签 | P2SH Multisig

**定义**：[P2SH 输出](P2SHAddress)，其中[兑换脚本](#RedeemScript)使用其中一个[多签](#Multisig)[操作码](#Opcode)。直到比特币核心 0.10.0 版，[P2SH 多签脚本](#P2SHMultisig)是[标准交易](#StandardTransaction)，但大多数 P2SH 脚本不始。

**同义词**：`P2SH multisig output`

**不要混淆**：[`Multisig pubkey scripts`](#ScriptPubKey)（也称作“[裸多签](#Multisig)”，这些[多签](#Multisig)脚本不使用 P2SH 封装）, P2SH（通用 P2SH，其中 [P2SH 多签](#P2SHMultisig)是比特币核心 0.10.0 版特殊情况下的特定实例）

<p id="Opcode"></p>
## 操作码 | Opcode

**定义**：来自比特币脚本语言的操作码在[公钥脚本](#ScriptPubKey)或[签名脚本](#ScriptSig)内部推送数据或执行函数。

**同义词**：`Data-pushing opcode`, `Non-data-pushing opcode`

<p id="StandardTransaction"></p>
## 标准交易 | Standard Transaction

**定义**：传递给比特币核心 `IsStandard()` 和 `IsStandardTx()` 测试的交易。只有标准交易通过运行默认比特币核心软件的[对端节点](#Node)挖矿或广播。

## Watch-Only 地址 | Watch-Only Address

**定义**：钱包中不带相应私钥的地址或公钥脚本，允许钱包监视其输出但不能花费它们。

## 钱包导入格式 | Wallet Import Format, WIF

**定义**：一种数据交换格式，旨在允许导出和导入单个私钥，并带有指明其是否使用压缩公钥的标志。

**不要混淆**：Extended private keys（允许导入私钥的层次体系）

## 双重花费 | Double Spend

**定义**：使用与已经广播交易相同输入的交易。当有一个交易已经记录在区块链上时，将被当作重复，欺骗或转换的尝试。

## 孩子为父母付钱 | Child Pays For Parent, CPFP

**定义**：选择挖矿交易不仅基于它们的交易费，还基于它们祖先（父母）和后代（孩子）的交易费。

**同义词**：Ancestor mining（祖先挖矿）

**不要混淆**：Replace by Fee, RBF

## 通过交易费代替 | Replace-by-Fee, RBF

**定义**：使用支付更高交易费的不同版本的交易代替未确认交易的版本。可以使用 BIP125 信号。

**同义词**：Opt-in replace by fee（通过最优交易费代替）

**不要混淆**：Child pays for parent, CPFP（孩子为父母支付）

## 布鲁姆过滤器 | Bloom Filter

**定义**：主要由 SPV 客户端使用过滤器，用来从全节点请求匹配的交易并默尔克区块。

**不要混淆**：Bloom filter（通用计算机科学条目，比特币的布鲁姆过滤器是一个特定的实现）

## CompactSize 无符号整数 | CompactSize Unsigned Integer

**定义**：一种可变长度的整数，常用于比特币 P2P 协议和比特币序列化的数据结构。

**同义词**：CompactSize

**不要混淆**：VarInt（比特币核心用于本地数据存储的数据类型）, Compact（用于区块头中的难度对应值 nBits 的数据类型）

## 托管合同 | Escrow Contract

**定义**：一种交易，消费者和接收者把资金放入 2 比 2（或其他的 m 比 n）的多签输出中，均不会花费资金，直到他们对某些外部结果都满意时。

## 压缩公钥 | Compressed Public Key

**定义**：33 字节长的椭圆曲线公钥而非 65 字节的未压缩公钥。

## 扩展的密钥 | Extended Key

**定义**：在 HD 钱包的的情况中，使用链编码扩展的公钥或私钥允许它们导出子密钥。

**同义词**：HD wallet extended key（HD 钱包扩展的密钥）, Public extended key（扩展的公钥）, Private extended key（扩展的私钥）

## 硬化的扩展密钥 | Hardened Extended Key (HD Wallets)

**定义**：HD 钱包扩展密钥的一个变体，只有硬化的扩展私钥才能生成子密钥。防止链代码加任何私钥的组合使整个钱包处于风险中。

## 初始化区块下载 | Initial Block Download, IBD

**定义**：用于一个新节点（或长时间离线的节点）下载大量的区块来赶上最佳区块连的链尖的过程。

**不要混淆**：Blocks-first sync（同步包含获得任意数量的区块；IBD 仅用于大量区块）

## 区块首次同步 | Blocks-First

**定义**：通过从对端下载每个区块并进行验证来同步区块链。

**同义词**：BLocks-first sync

**不要混淆**：Headers-first sync（区块头首次同步）

## 区块头优先同步 | Headers-First Sync

**定义**：通过在下载完整区块前下载区块头来同步区块链。

**同义词**：Headers-First

**不要混淆**：Blocks-first sync（直接下载整个区块，不首先获取他们的头）

## 默尔克树 | Merkle Tree

**定义**：通过散列配对的数据（叶子）构建的树，然后对对结果进行配对和散列，直到剩余一个单散列值，即默尔克树根。在比特币中，叶子几乎总是来自单个区块的交易。

**不要混淆**：Partial merkle branch（连接一个或多个叶子到根的分支）, Merkle block（连接一笔或多笔交易从单个区块到区块默尔克根的部分默尔克分支）

## 默尔克树根 | Merkle Root

**定义**：默尔克树的根节点，树中所有哈希对的后代。区块头必须包含一个该块中所有交易的有效的默尔克树根。

**不要混淆**：Merkle tree（默尔克树根是根节点）, Merkle block（连接根到一笔或多笔叶子交易的部分默尔克分支）

## 默尔克区块 | Merkle Block

**定义**：连接匹配布鲁姆过滤器的交易到区块的默尔克树根的部分默尔克树。

**不要混淆**：MerkleBlock message（传输默尔克区块的 P2P 协议消息）

## 多签输出 | M-of-N Multisig, Multisig Output

**定义**：公钥脚本提供给 n 个公钥并需要对应的签名脚本提供对应提供公钥的最少 m 个签名。

**同义词**：Multisig（多签）, Bare multisig

**不要混淆**：P2SH multisig（包含在 P2SH 里的多签脚本）, 需要多个签名而不用 `OP_CHECKMULTISIG` 或 `OP_CHECKMULTISIGVERIFY`

## 内部字节序 | Internal Byte Order

**定义**：显示为字符串的散列摘要的标准字节序—相同的格式用于序列化的区块和交易。

**不要混淆**：RPC byte order（反转的字节序）

## RPC 字节序 | RPC Byte Order

**定义**：显示的逆序的哈希摘要；在比特币核心 RPCs，众多区块浏览器，和其他软件中使用。

**不要混淆**：Internal byte order（内部字节序，显示的典型顺序的哈希摘要；用于序列化的区块和序列化的交易）

## 消息头 | Message Header

**定义**：比特币 P2P 网络上所有消息前缀的 4 个头部字段。

## 网络魔数 | Network Magic

**定义**：在比特币 `P2P` 网络协议中定义的每条消息的 4 个字节的头部，用来寻找下一条消息。

**同义词**：Start String

## 支付协议 | Payment Protocol

**定义**：该协议在 BIP70（和其他 BIPs）中定义，让支付者从接收者获取签名的支付细节。

**同义词**：Payment request（支付请求）, BIP70

**不要混淆**：IP-to-IP payment protocol（包含在比特币早期版本中的不安全，已停止的协议）

## 库存 | Inventory

**定义**：一种数据类型标识和一个散列值；用于识别通过比特币 P2P 网络下载的交易和可用区块。

**同义词**：Block or transaction inventory（区块或交易内存）

**不要混淆**：Inv message（传输库存的 P2P 消息）

## 序列化区块 | Serialized Block

**定义**：以 2 进制格式完成区块——相同的格式用于计算总区块字节大小；常用 16 进制表示。

**同义词**：Raw block（原始区块）

## 序列化的交易 | Serialized Transaction

**定义**：以 2 进制格式完成交易；常用 16 进制表示。有时称为原始格式，因为多种比特币核心命令名中都带有 "raw" 字样。

**同义词**：Raw transaction（原始交易）

## SIGHASH_ALL

**定义**：签名除任意签名脚本的整个交易的默认的签名哈希类型，防止签名的部分修改。

## SIGHASH_ANYONECANPAY（任何人都可以支付）

**定义**：仅签名当前输入的签名哈希类型。

**不要混淆**：SIGHASH_SINGLE（签名该输入对应的输出和其他部分输入）

## SIGHASH_NONE

**定义**：仅签名输入的签名哈希类型，允许任何人改变他们想改变的输出。

## SIGHASH_SINGLE

**定义**：签名对应输入（具有相同索引值）的输出的签名哈希类型，该输入，和任意其他输入的一部分。允许其他输出和其他输入序列号的修改。

**不要混淆**：SIGHASH_ANYONECANPAY（仅签名该单个输入的签名哈希类型的标志）

## 签名哈希 | Signature Hash

**定义**：比特币签名的标志，用于表明签名签署的交易的部分。（默认是 SIGHASH_ALL）交易未签名的部分可能被修改。

**同义词**：Sighash

**不要混淆**：Signed hash（签名数据的哈希）, Transaction malleability / mutability（尽管非默认的签名哈希标志允许可选的延展性，延展性包含交易可能发生变化的任何方式）

## 赎回脚本 | Redeem Script

**定义**：功能上类似于公钥脚本的脚本。其中一个副本用于创建 P2SH 地址（用于实际的公钥脚本），另一个副本放在支出签名脚本用来强制其条件。

**同义词**：RedeemScript

**不要混淆**：Signature script（为公钥脚本提供数据的脚本，在 P2SH 输入中包含赎回脚本）

## 空数据交易 | Null Data (OP_RETURN) Transaction

**定义**：在比特币核心 0.9.0 版或新版中，中继和挖矿的交易类型，添加任意数据到可证明不可花费的公钥脚本，全节点不必存储在它们的 UTXO 数据库中。

**同义词**：Data carrier transaction（数据搬运交易）

**不要混淆**：OP_RETURN（用于 OP_RETURN 交易一个输出的操作码）

## 未花费的交易输出 | Unspent Transaction Output, UTXO

**定义**：能作为一笔交易输入的可花费的未花费的交易输出（UTXO）。

**不要混淆**：Output（任意输出，包含花费和未花费的。输出是 UTXO 的超集，UTXO 是输出的子集）

## 交易可变性 | Transaction Mutability

**定义**：某人改变的未确认交易且不使其无效的能力，这会改变交易号，使子交易无效。

**同义词**：Transaction malleability（交易延展性）

**不要混淆**：BIP62（可选的新交易版本的提议，减少了常见交易的已知变化集）

## 交易号 | Txid, Transaction Identifier

**定义**：用于唯一标识特定交易的识别符；具体来说，是交易的 `sha256` 双散列。

**不要混淆**：Outpoint（交易号和输出集的联合体，用于识别指定输出）

## 输出点 | Outpoint

**定义**：用于引用特定交易输出的数据结构，由 32 字节的交易索引和 4 字节的输出索引数字（vout）组成。

**不要混淆**：Output（交易的完整输出）, TxOut（和输出一样）

## 找零 | Change

**定义**：交易的输出把聪返给消费者，从而防止过多的输入转到交易费中。

**同义词**：Change address（找零地址）, Change output（找零输出）

**不要混淆**：Address reuse（地址重用）

## 代币 | Token

**定义**：代币使驻留在现存区块链中的具有其基本代码的可编程数字资产。代币有助于促进去中心化应用的创建。

**不要混淆**：Bitcoins（比特币）, Satoshis（聪）, Security token（安全代币）, Denominations（面额）

Thanks for your time.

## 参照
* [Developer Glossary - Bitcoin](https://bitcoin.org/en/developer-glossary)
* [...](https://github.com/mistydew/blockchain)
