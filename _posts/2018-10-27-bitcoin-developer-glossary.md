---
layout: post
title:  "比特币开发者术语表"
date:   2018-10-27 22:08:57 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin Translations
tags: 区块链 比特币术语表 译文
---
这是一个专业术语汇编。普通用户应该使用[词汇表页面](/blog/2018/10/bitcoin-vocabulary.html)。

> * 5
>   * [百分之 51 攻击（51% attack）](#百分之-51-攻击--51-percent-attack)
> * A
>   * [地址（Payment addresses）](#地址--address)
>   * [祖先挖矿（Ancestor mining）](#祖先挖矿--ancestor-mining)
>   * [归档的节点（Archival node）](#归档的节点--archival-node)
> * B
>   * [足够的多签（Bare multisig）](#足够的多签--bare-multisig)
>   * [Base58 编码（Base58check）](#base58-编码--base58check)
>   * [最佳区块链（Best block chain）](#区块链--block-chain)
>   * [最佳区块头链（Best header chain）](#区块头链--header-chain)
>   * [比特币（Bitcoins）](#比特币--bitcoins)
>   * [区块（Block）](#区块--block)
>   * [0 号区块（Block 0）](#0-号区块--block-0)
>   * [区块链（Block chain）](#区块链--block-chain)
>   * [区块头（Block header）](#区块头--block-header)
>   * [区块高度（Block height）](#区块高度--block-height)
>   * [区块奖励（Block reward）](#区块奖励--block-reward)
>   * [区块初次同步（Blocks-first sync）](#区块初次同步--blocks-first-sync)
>   * [布鲁姆过滤器（Bloom filter）](#布鲁姆过滤器--bloom-filter)
> * C
>   * [链代码（Chain code）](#链代码--chain-code)
>   * [找零地址（Change address）](#找零地址--change-address)
>   * [找零输出（Change output）](#找零地址--change-address)
>   * [子密钥（Child key）](#子密钥--child-key)
>   * [孩子为父母付钱（Child pays for parent）](#祖先挖矿--ancestor-mining)
>   * [私有子密钥（Child private key）](#子密钥--child-key)
>   * [公共子密钥（Child public key）](#子密钥--child-key)
>   * [创币交易字段（Coinbase）](#创币交易字段--coinbase)
>   * [创币交易（Coinbase transaction）](#创币交易--coinbase-transaction)
>   * [压缩大小（CompactSize）](#压缩大小--compactsize)
>   * [已压缩的公钥（Compressed public key）](#已压缩的公钥--compressed-public-key)
>   * [确认分数（Confirmation score）](#确认数--confirmations)
>   * [确认数（Confirmations）](#确认数--confirmations)
>   * [已确认的交易（Confirmed transaction）](#确认数--confirmations)
>   * [共识（Consensus）](#共识--consensus)
>   * [共识规则（Consensus rules）](#共识规则--consensus-rules)
>   * [CPFP（Child Pays For Parent）](#祖先挖矿--ancestor-mining)
> * D
>   * [数据传输交易（Data carrier transaction）](#数据传输交易--data-carrier-transaction)
>   * [数据推送操作码（Data-pushing opcode）](#操作码--opcode)
>   * [衡量单位（Denomination）](#比特币--bitcoins)
>   * [难度（Difficulty）](#难度--difficulty)
>   * [DNS 种子（DNS seed）](#dns-种子--dns-seed)
>   * [双重花费（Double spend）](#双重花费--double-spend)
> * E
>   * [托管合同（Escrow contract）](#托管合同--escrow-contract)
>   * [扩展的密钥（Extended key）](#扩展的密钥--extended-key)
> * F
>   * [分叉（Fork）](#分叉--fork)
>   * [免费的交易（Free transaction）](#免费的交易--free-transaction)
>   * [全节点（Full node）](#归档的节点--archival-node)
> * G
>   * [创造交易（Generation transaction）](#创币交易--coinbase-transaction)
>   * [创世区块（Genesis block）](#0-号区块--block-0)
> * H
>   * [硬分叉（Hard fork）](#硬分叉--hard-fork)
>   * [加固的扩展密钥（Hardened extended key）](#加固的扩展密钥--hardened-extended-key)
>   * [HD 协议（HD protocol）](#hd-协议--hd-protocol)
>   * [HD 钱包（HD wallet）](#hd-协议--hd-protocol)
>   * [HD 钱包种子（HD wallet seed）](#hd-钱包种子--hd-wallet-seed)
>   * [头部（Header）](#区块头--block-header)
>   * [区块头链（Header chain）](#区块头链--header-chain)
>   * [区块头初次同步（Headers-first sync）](#区块头初次同步--headers-first-sync)
>   * [高度（Height）](#区块高度--block-height)
>   * [高优先级交易（High-priority transaction）](#免费的交易--free-transaction)
> * I
>   * [IBD（Initial Block Download）](#初始化区块下载--initial-block-download)
>   * [初始化区块下载（Initial block download）](#初始化区块下载--initial-block-download)
>   * [输入（Input）](#交易输入--transaction-input)
>   * [内部字节序（Internal byte order）](#内部字节序--internal-byte-order)
>   * [库存（Inventory）](#库存--inventory)
> * L
>   * [轻量级客户端（Lightweight client）](#简单支付验证--simplified-payment-verification)
>   * [锁定时间（Locktime）](#锁定时间--locktime)
> * M
>   * [主网（Mainnet）](#主网--mainnet)
>   * [大多数攻击（Majority attack）](#百分之-51-攻击--51-percent-attack)
>   * [MASF（Miner Activated Soft Fork）](#矿工激活的软分叉--miner-activated-soft-fork)
>   * [主链代码（Master chain code）](#主链代码--master-chain-code)
>   * [主私钥（Master private key）](#主链代码--master-chain-code)
>   * [最大区块大小（Maximum block size）](#最大区块大小--maximum-block-size)
>   * [默克尔区块（Merkle block）](#默克尔区块--merkle-block)
>   * [默克尔树根（Merkle root）](#默克尔树根--merkle-root)
>   * [默克尔树（Merkle tree）](#默克尔树--merkle-tree)
>   * [消息头（Message header）](#消息头--message-header)
>   * [矿工（Miner）](#矿工--miner)
>   * [矿工激活的软分叉（Miner activated soft fork）](#矿工激活的软分叉--miner-activated-soft-fork)
>   * [矿工费（Miners fee）](#交易费--transaction-fee)
>   * [最小中继费（Minimum relay fee）](#中继费--relay-fee)
>   * [挖矿（Mining）](#矿工--miner)
>   * [多签（Multisig）](#足够的多签--bare-multisig)
> * N
>   * [难度对应值（nBits）](#难度对应值--nbits)
>   * [网络难度（Network difficulty）](#难度--difficulty)
>   * [网络魔数（Network magic）](#网络魔数--network-magic)
>   * [锁定时间（nLockTime）](#锁定时间--locktime)
>   * [节点（Node）](#归档的节点--archival-node)
>   * [非数据推送操作码（Non-data-pushing opcode）](#操作码--opcode)
>   * [空数据交易（Null data transaction）](#数据传输交易--data-carrier-transaction)
> * O
>   * [OP_RETURN transaction](#OP_RETURN-transaction)
>   * [操作码（Opcode）](#操作码--opcode)
>   * [通过交易费代替选择（Opt-in replace by fee）](#通过交易费代替选择--opt-in-replace-by-fee)
>   * [孤儿区块（Orphan block）](#孤儿区块--orphan-block)
>   * [输出点（Outpoint）](#输出点--outpoint)
>   * [输出（Output）](#交易输出--transaction-output)
> * P
>   * [P2PKH 地址（P2PKH address）](#p2pkh-地址--p2pkh-address)
>   * [P2PKH 输出（P2PKH output）](#p2pkh-地址--p2pkh-address)
>   * [P2SH 地址（P2SH address）](#p2sh-地址--p2sh-address)
>   * [P2SH 多签（P2SH multisig）](#p2sh-多签--p2sh-multisig)
>   * [P2SH 输出（P2SH output）](#p2sh-地址--p2sh-address)
>   * [父钥（Parent key）](#父钥--parent-key)
>   * [私有父钥（Parent private key）](#父钥--parent-key)
>   * [公共父钥（Parent public key）](#父钥--parent-key)
>   * [支付协议（Payment protocol）](#支付协议--payment-protocol)
>   * [支付请求（Payment request）](#支付协议--payment-protocol)
>   * [对端（Peer）](#归档的节点--archival-node)
>   * [POW（Proof of work）](#工作量证明--proof-of-work)
>   * [扩展的私钥（Private extended key）](#扩展的密钥--extended-key)
>   * [私钥（Private key）](#私钥--private-key)
>   * [工作量证明（Proof of work）](#工作量证明--proof-of-work)
>   * [已修剪的节点（Pruned node）](#归档的节点--archival-node)
>   * [公钥脚本（Pubkey script）](#公钥脚本--pubkey-script)
>   * [扩展的公钥（Public extended key）](#扩展的密钥--extended-key)
>   * [公钥（Public key）](#公钥--public-key)
> * R
>   * [原始交易（Raw transaction）](#序列化的交易--serialized-transaction)
>   * [RBF（Replace by fee）](#通过交易费代替选择--opt-in-replace-by-fee)
>   * [赎回脚本（Redeem Script）](#赎回脚本--redeem-script)
>   * [赎回脚本（RedeemScript）](#赎回脚本--redeem-script)
>   * [回归测试模式（Regression test mode）](#回归测试网--regtest)
>   * [回归测试网（Regtest）](#回归测试网--regtest)
>   * [中继费（Relay fee）](#中继费--relay-fee)
>   * [通过交易费代替（Replace by fee）](#通过交易费代替选择--opt-in-replace-by-fee)
>   * [根种子（Root seed）](#hd-钱包种子--hd-wallet-seed)
>   * [RPC 字节序（RPC byte order）](#rpc-字节序--rpc-byte-order)
> * S
>   * [聪（Satoshis）](#比特币--bitcoins)
>   * [脚本公钥（ScriptPubKey）](#公钥脚本--pubkey-script)
>   * [脚本签名（ScriptSig）](#签名脚本--signature-script)
>   * [序列号（Sequence number）](#序列号--sequence-number)
>   * [序列化的区块（Serialized block）](#序列化的区块--serialized-block)
>   * [序列化的交易（Serialized transaction）](#序列化的交易--serialized-transaction)
>   * [签名哈希（Sighash）](#签名哈希--signature-hash)
>   * [SIGHASH_ALL](#sighash_all)
>   * [SIGHASH_ANYONECANPAY](#sighash_anyonecanpay)
>   * [SIGHASH_NONE](#sighash_none)
>   * [SIGHASH_SINGLE](#sighash_single)
>   * [签名（Signature）](#签名--signature)
>   * [签名哈希（Signature hash）](#签名哈希--signature-hash)
>   * [签名脚本（Signature script）](#签名脚本--signature-script)
>   * [简单支付验证（Simplified payment verification）](#简单支付验证--simplified-payment-verification)
>   * [软分叉（Soft fork）](#软分叉--soft-fork)
>   * [SPV（Simplified Payment Verification）](#简单支付验证--simplified-payment-verification)
>   * [旧的区块（Stale block）](#旧的区块--stale-block)
>   * [标准交易（Standard transaction）](#标准交易--standard-transaction)
>   * [起始字符串（Start string）](#网络魔数--network-magic)
> * T
>   * [Target](#target)
>   * [公共测试网（Testnet）](#公共测试网--testnet)
>   * [瘦客户端（Thin client）](#简单支付验证--simplified-payment-verification)
>   * [代币（Token）](#代币--token)
>   * [交易费（Transaction fee）](#交易费--transaction-fee)
>   * [交易延展性（Transaction malleability）](#交易可变性--transaction-mutability)
>   * [交易可变性（Transaction mutability）](#交易可变性--transaction-mutability)
>   * [交易号（Txid）](#交易号--txid)
>   * [交易输入（TxIn）](#交易输入--transaction-input)
>   * [交易输出（TxOut）](#交易输出--transaction-output)
> * U
>   * [UASF（User Activated Soft Fork）](#用户激活的软分叉--user-activated-soft-fork)
>   * [未确认的交易（Unconfirmed transaction）](#确认数--confirmations)
>   * [用户激活的软分叉（User activated soft fork）](#用户激活的软分叉--user-activated-soft-fork)
>   * [未花费的交易输出（UTXO）](#未花费的交易输出--utxo)
> * W
>   * [钱包（Wallet）](#钱包--wallet)
>   * [钱包导入格式（Wallet import format）](#钱包导入格式--wallet-import-format)
>   * [Watch-only 地址（Watch-only address）](#watch-only-地址--watch-only-address)
>   * [WIF（Wallet Import Format）](#钱包导入格式--wallet-import-format)

## 百分之 51 攻击 | 51 percent attack

**定义：**
控制大多数网络哈希率的某人修改交易历史并阻止新交易确认的能力。

**同义词：**
51% 攻击（51% attack），大多数哈希率攻击（Majority hash rate attack）

## 地址 | Address

**定义：**
使用 [Base58 编码](#base58-编码--base58check) 格式化的 20 个字节的哈希值，用来生成 P2PKH 或 P2SH 类型的比特币地址。
目前用户交换支付信息的最常见方式。

**同义词：**
付款地址（Payment addresses）

**不要混淆：**
IP 地址（IP address）

## 祖先挖矿 | Ancestor mining

**定义：**
[挖矿](#挖矿--miner)选择的交易不仅基于它们的交易费，还基于它们祖先（父母）交易和后代（孩子）交易的交易费。

**同义词：**
孩子为父母付钱（Child pays for parent，CPFP）

**不要混淆：**
通过费用替代（[Replace by Fee](#RBF)，[RBF](#RBF)）

## 归档的节点 | Archival Node

**定义：**
连接到比特币网络的计算机。

**同义词：**
节点（Node），全节点（Full node），已修剪的节点（Pruned node），对端（Peer）

**不要混淆：**
轻量节点（Lightweight node），SPV 节点（[SPV node](#SPV)）

## 足够的多签 | Bare multisig

**定义：**
[公钥脚本](#ScriptPubKey)提供给 n 个[公钥](#PublicKey)并需要对应的[签名脚本](#ScriptSig)提供对应提供[公钥](#PublicKey)的最少 m 个[签名](#Signature)。

**同义词：**
多签（Multisig），N 分之 M 多签（M-of-N multisig），多签输出（Multisig output）

**不要混淆：**
包含在 P2SH 里的多签脚本（[P2SH multisig](#P2SH)），需要多个[签名](#Signature)而不用 OP_CHECKMULTISIG 或 OP_CHECKMULTISIGVERIFY 的高级脚本

## Base58 编码 | Base58check

**定义：**
比特币中用于转换 160 位的哈希值到 P2PKH 和 [P2SH 地址](#P2SH)的方法。
也用于比特币的其他部分，例如用于 WIP 格式备份编码的[私钥](#PrivateKey)。与其他的 base58 实现不同。

**同义词：**
比特币地址编码（Bitcoin address encoding）

**不要混淆：**
P2PKH 地址（[P2PKH address](#P2PKH)），P2SH 地址（[P2SH address](#P2SH)），IP 地址（IP address）

## 区块链 | Block chain

**定义：**
区块链，每个[区块](#区块--block)都引用其前面[区块](#区块--block)。
最难重建的链是最佳区块链。

**同义词：**
最佳区块链（Best block chain）

**不要混淆：**
区块头链（[Header chain](#区块头链--header-chain)）

## 区块头链 | Header chain

**定义：**
区块头链，每个[区块头](#区块头--Block-Header)都链接其前面的[区块头](#区块头--Block-Header)；
最难重建的链是最佳区块头链。

**同义词：**
最佳区块头链（Best header chain）

**不要混淆：**
区块链（[Block chain](#区块链--block-chain)）

## 比特币 | Bitcoins

**定义：**
比特币值的衡量单位，通常用一些比特币来衡量，但有时用聪的数倍来衡量。
一个比特币等于 100,000,000 聪。

**同义词：**
衡量单位（Denominations），聪（Satoshis）

**不要混淆：**
二进制位，有两种可能取值的数据单元。

## 区块 | Block

**定义：**
以[区块头](#区块头--block-header)开头并受[工作量证明](#工作量证明--POW)保护的一笔或多笔交易。
区块是存储在[区块链](#区块链--block-chain)上的数据。

**同义词：**
交易的区块（Block of transactions）

## 0 号区块 | Block 0

**定义：**
比特币[区块链](#BlockChain)上的第一个[区块](#Block)。

**同义词：**
创世区块（Genesis block）

**不要混淆：**
创币交易，[区块](#区块--Block)上的第一笔交易（[Generation transaction](#创币交易--Coinbase-Transaction)）

## 区块头 | Block header

**定义：**
单个[区块](#区块--Block)的 80 个字节的区块头，被反复地散列以创建[工作量证明](#工作量证明--POW)。

**同义词：**
头部（Header）

## 区块高度 | Block height

**定义：**
[区块链](#区块链--block-chain)上指定[区块](#区块--block)前的[区块](#区块--block)数。例如，因为[创世区块](#0-号区块--Block-0)前面没有[区块](#区块--block)，所以其高度为 0。

**同义词：**
高度（Height），区块链高度（Block chain height）

## 区块奖励 | Block reward

**定义：**
[矿工](#矿工--miner)可能要求一定金额作为创建[区块](#区块--block)的奖励。
等于[区块](#区块--block)补贴（新的可用的[聪](#比特币--bitcoins)）加[区块](#区块--block)交易支付的交易费的总和。

**同义词：**
区块矿工奖励（Block miner reward）

**不要混淆：**
区块补贴（Block subsidy），交易费（[Transaction fees](#transaction-fee)）

## 区块初次同步 | Blocks-first sync

**定义：**
通过从[对端](#peer)下载每个[区块](#区块--block)并进行验证来同步[区块链](#BlockChain)。

**同义词：**
区块首次（Blocks-first）

**不要混淆：**
区块头初次同步（[Headers-first sync](#headers-first)）

## 布鲁姆过滤器 | Bloom filter

**定义：**
主要由 [SPV 客户端](#SPV)使用过滤器，用来从全[节点](#node)请求匹配的交易和[默克尔区块](#MerkleBlock)。

**不要混淆：**
Bloom filter（通用计算机科学条目，比特币的布鲁姆过滤器是一个特定的实现）

## 链代码 | Chain code

**定义：**
在 [HD 钱包](#HDWallet)中，256 位熵被添加到公钥和[私钥](#PrivateKey)中，来帮助它们生成安全的[子密钥](#ChildKey)；
[主链代码](#MasterChainCode)通常派生自携带[主私钥](#MasterPrivateKey)的种子。

**同义词：**
HD 钱包链代码（HD wallet chain code）

## 找零地址 | Change address

**定义：**
交易的[输出](#TxIn)把[聪](#Satoshis)返给付款人，从而防止过多的[输入](#TxIn)转到[交易费](#TransactionFee)中。

**同义词：**
找零（Change），找零输出（Change output）

**不要混淆：**
地址重用（Address reuse）

## 子密钥 | Child key

**定义：**
在 [HD 钱包](#HDWallet)中，从[父密钥](#ParentKey)派生的密钥。
该密钥可以是[私钥](#PrivateKey)，也可以是[公钥](#PublicKey)，密钥的推导（派生）可能需要[链代码](#ChainCode)。

**同义词：**
HD 钱包子密钥（HD wallet child key），公共子密钥（Child public key），私有子密钥（Child private key）

**不要混淆：**
公钥（[Public key](#PublicKey)）（从[私钥](#PrivateKey)派生，非父密钥）

## 创币交易字段 | Coinbase

**定义：**
一个特殊的字段，作为[创币交易](#创币交易--Coinbase-Transaction)的唯一[输入](#输入--TxIn)。
创币交易字段允许声明[区块奖励](#区块奖励--Block-Reward)并提供高达 100 个字节的任意数据。

**同义词：**
创币交易字段（Coinbase field）

**不要混淆：**
创币交易（[Coinbase transaction](#创币交易--Coinbase-Transaction)），[Coinbase.com](https://www.coinbase.com){:target="_blank"}

## 创币交易 | Coinbase Transaction

**定义：**
[区块](#区块--block)的第一笔交易。
该区块总是通过[矿工](#矿工--miner)创建，它包含一个[创币交易字段](#创币交易字段--coinbase)。

**同义词：**
创造交易（Generation transaction）

**不要混淆：**
创币交易字段（[Coinbase](#创币交易字段--coinbase)）（创币交易的一部分）

## 压缩大小 | CompactSize

**定义：**
一种长度可变的整数，常用于比特币 P2P 协议和比特币序列化的数据结构。

**同义词：**
压缩大小无符号整数（CompactSize unsigned integer）

**不要混淆：**
整形变量（VarInt）（比特币核心用于本地数据存储的数据类型），压缩（Compact）（用于[区块头](#BlockHeader)中的[难度对应值 nBits](#Target) 的数据类型）

## 已压缩的公钥 | Compressed public key

**定义：**
33 字节的[椭圆曲线公钥](#PublicKey)而非 65 字节的未压缩[公钥](#PublicKey)。

## 确认数 | Confirmations

**定义：**
分数表明在[最佳区块链](#BlockChain)上需要修改的[区块](#Block)数，用来移除或修改特定的交易。
确认的交易有一个或更高的确认分数。

**同义词：**
确认分数（Confirmation score），已确认的交易（Confirmed transaction），未确认的交易（Unconfirmed transaction）

## 共识 | Consensus

**定义：**
当几个[节点](#Node)（通常是网络上的大部分[节点](#Node)）在它们本地验证过的[最佳区块链](#BlockChain)中都有相同的[区块](#Block)。

**不要混淆：**
Social consensus（社会共识，通常用于开发人员之间的讨论，以表明大多数人同意某个特定的方案）, [Consensus rules](#ConsensusRules)（允许[节点](#Node)维持共识的规则）

## 共识规则 | Consensus rules

**定义：**
全[节点](#Node)遵循与其他[节点](#Node)相同的[共识](#Consensus)的区块验证规则。

**同义词：**
验证规则（Validation rules）

**不要混淆：**
共识（[Consensus](#共识--consensus)）（当[节点](#Node)遵循相同的共识规则就达成了共识）

## 数据传输交易 | Data carrier transaction

**定义：**
在比特币核心 0.9.0 版或更新的版本中，中继和挖矿的交易类型，添加任意数据到可证明不可花费的[公钥脚本](#ScriptPubKey)，全[节点](#Node)不必存储在它们的 [UTXO](#UTXO) 数据库中。

**同义词：**
空数据交易（Null data transaction）

**不要混淆：**
[OP_RETURN](#OP_RETURN)（用于 OP_RETURN 交易一个[输出](#TxOut)的[操作码](#Opcode)）

## 操作码 | Opcode

**定义**：
来自比特币脚本语言的操作码在[公钥脚本](#ScriptPubKey)或[签名脚本](#ScriptSig)内部推送数据或执行函数。

**同义词**：
数据推送操作码（Data-pushing opcode），非数据推送操作码（Non-data-pushing opcode）

## 难度 | Difficulty

**定义：**
相对找到最简单的[区块](#区块--Block)的难度，找到一个[区块](#Block)有多难。
最简单[区块](#区块--Block)的工作量证明难度为 1。

**同义词：**
网络难度（Network difficulty）

**不要混淆：**
[Target threshold](#目标值--Target)（目标阈值，计算难度得到的值）

## DNS 种子 | DNS Seed

**定义：**
DNS 域名解析服务器返回比特币网络上的全[节点](#Node)的 IP 地址集来帮助进行对端的发现。

**不要混淆：**
HD 钱包种子（[HD wallet seeds](#RootSeed)）

## 双重花费 | Double spend

**定义：**
使用与已经广播交易相同[输入](#TxIn)的交易。
当有一个交易已经记录在[区块链](#BlockChain)上时，将被当作重复，欺骗或转换的尝试。

## 托管合同 | Escrow contract

**定义：**
一种交易，付款人和收款人把资金放入 2 比 2（或其他的 [m 比 n](#M-of-N)）的[多签输出](#M-of-N)中，均不会花费资金，直到都满足某些外部条件。

## 扩展的密钥 | Extended key

**定义：**
在 [HD 钱包](#HDWallet)的情况中，使用[链编码](#ChainCode)扩展的[公钥](#PublicKey)或[私钥](#PrivateKey)允许它们导出[子密钥](#ChildKey)。

**同义词：**
HD 钱包扩展的密钥（HD wallet extended key），扩展的公钥（Public extended key），扩展的私钥（Private extended key）

## 分叉 | Fork

**定义：**
当 2 个或 2 个以上的[区块](#Block)有相同的[高度](#BlockHeight)时，[区块链](#BlockChain)分叉。
特别是发生在 2 个或 2 个以上的[矿工](#Miner)几乎同时找到[区块](#Block)时。
也可以用于攻击。

**同义词：**
意外的分叉（Accidental fork）

**不要混淆：**
[Hard fork](#HardFork)（[共识规则](#ConsensusRules)的变化会破坏不升级[节点](#Node)的安全性）,
[Soft fork](#SoftFork)（[共识规则](#ConsensusRules)的变化会削弱不升级[节点](#Node)的安全性）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

## 免费的交易 | Free transaction

**定义：**
没有支付[交易费](#TransactionFee)的交易，因为他们的[输入](#TxIn)空闲时间够长足以积累大量的优先级。
注：[矿工](#Miner)选择是否接受免费交易。

**同义词：**
高优先级交易（High-priority transaction），Free Tx（免费的交易，不含交易费）

## 硬分叉 | Hard fork

**定义：**
[区块链](#BlockChain)上永久性的分叉，通常发生在未升级的[节点](#Node)不能验证通过遵守新的[共识规则](#ConsensusRules)的升级的[节点](#Node)创建的[区块](#Block)时。

**同义词：**
硬分叉变化（Hard-forking change）

**不要混淆：**
[Fork](#Fork)（所有[节点](#Node)遵循相同的[共识规则](#ConsensusRules)的常规的分叉，一旦一条链的[工作量证明](#POW)高于另一条，该分叉被解决）,
[Soft fork](#SoftFork)（[区块链](#BlockChain)上由未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的临时分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

## 加固的扩展密钥 | Hardened extended key

**定义：**
[HD 钱包扩展密钥](#ExtendedKey)的一个变体，只有硬化的扩展私钥才能生成[子密钥](#ChildKey)。
防止[链代码](#ChainCode)加任何[私钥](#PrivateKey)的组合使整个[钱包](#Wallet)处于风险中。

## HD 协议 | HD protocol

**定义：**
分层确定性（HD）密钥创建和传输协议（BIP32），允许从[父密钥](#ParentKey)的层次创建[子密钥](#ChildKey)。
使用 HD 协议的[钱包](#Wallet)称为 HD 钱包。

**同义词：**
HD 钱包（HD wallet），BIP32

## HD 钱包种子 | HD wallet seed

**定义：**
用作为 [HD 钱包](#HDWallet)生成[主私钥](#MasterChainCode)和[主链代码](#MasterChainCode)的种子的潜在短值。

**同义词：**
根种子（Root seed）

**不要混淆：**
Mnemonic code / mnemonic seed（助记代码/种子，二进制根种子格式化为单词，使人们更容易记录和记忆）

## 区块头初次同步 | Headers-first sync

**定义：**
通过在下载整个[区块](#Block)前下载[区块头](#BlockHeader)来同步[区块链](#BlockChain)。

**同义词：**
头部优先（Headers-first）

**不要混淆：**
区块初次同步（[Blocks-first sync](#Blocks-First)）（直接下载整个[区块](#Block)，不首先获取它们的[头](#BlockHeader)）

## 初始化区块下载 | Initial block download

**定义：**
用于通过新[节点](#Node)（或长时间离线的[节点](#Node)）下载大量的[区块](#Block)来赶上[最佳区块连](#BlockChain)的链尖的过程。

**同义词：**
IBD

**不要混淆：**
[Blocks-first sync](#Blocks-First)（同步包含获得任意数量的[区块](#Block)；IBD 仅用于大量[区块](#Block)）

## 交易输入 | Transaction input

**定义：**
一笔交易的输入包含 3 个字段：[输出点](#Outpoint)，[签名脚本](#ScriptSig)，和[序列号](#Sequence)。
[输出点](#Outpoint)引用前一笔[交易输出](#TxOut)且[签名脚本](#ScriptSig)允许花费它。

**同义词：**
输入（Input），TxIn

## 内部字节序 | Internal byte order

**定义：**
显示为字符串的散列摘要的标准字节序—相同的格式用于[序列化的区块](#SerializedBlock)和交易。

**不要混淆：**
RPC 字节序（[RPC byte order](#RPCByteOrder)）（反转的字节序）

## 库存 | Inventory

**定义：**
一种数据类型标识和一个散列值；
用于识别通过比特币 P2P 网络下载的交易和可用的[区块](#Block)。

**同义词：**
区块或交易库存（Block or transaction inventory）

**不要混淆：**
库存消息（Inv message）（传输库存的 P2P 消息）

## 简单支付验证 | Simplified payment verification

**定义：**
用于验证某笔交易是否包含在某个未下载完整的[区块](#Block)中。
该方法用于一些轻量级比特币客户端。

**同义词**：
轻量级客户端（Lightweight client），瘦客户端（Thin client），SPV

## 锁定时间 | Locktime

**定义：**
交易的一部分用于表明交易可能被添加到[区块链](#BlockChain)的最早时间或最早的[区块](#Block)。

**同义词：**
锁定时间（nLockTime）

## 主网 | Mainnet

**定义：**
比特币交易的原始和主要网络，其中的[聪](#Satoshis)有真正经济价值。

**同义词：**
比特币主网（Bitcoin main network）

**不要混淆：**
公共测试网（[Testnet](#Testnet)）（非常类似主网的开放网络，其中的[聪](#Satoshis)没有价值），回归测试网（[Regtest](#Regtest)）（类似于[测试网](#Testnet)的私有测试[节点](#Node)）

## 矿工激活的软分叉 | Miner activated soft fork

**定义：**
通过[矿工](#Miner)信号激活的[软分叉](#SoftFork)。

**同义词：**
MASF

**不要混淆：**
[User Activated Soft Fork](#UASF)（通过标记日或[节点](#Node)强制而非[矿工](#Miner)信号激活的i[软分叉](#SoftFork)），
[Fork](#Fork)（所有[节点](#Node)遵循相同的[共识规则](#ConsensusRules)的常规的分叉，一旦一条链的[工作量证明](#POW)高于另一条，该分叉被解决），
[Hard fork](#HardFork)（[区块链](#BlockChain)上因未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的永久性的分叉），
[Soft fork](#SoftFork)（[区块链](#BlockChain)上由未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的临时分叉），
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库），
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

## 主链代码 | Master chain code

**定义：**
在 [HD 钱包](#HDWallet)中，主链代码和主私钥是从[根种子](#RootSeed)派生的 2 个数据。

**同义词：**
主私钥（Master private key）

## 最大区块大小 | Maximum block size

**定义：**
[共识规则](#ConsensusRules)允许一个[区块](#Block)的以字节为单位的最大尺寸。
当前[区块](#Block)大小限制是 1,000,000 字节。

**同义词：**
区块大小限制（Block size limit）

**不要混淆：**
区块（[Block](#Block)），区块链（[Blockchain](#BlockChain)），区块链大小（Blockchain size）

## 默克尔区块 | Merkle block

**定义：**
连接匹配[布鲁姆过滤器](#BloomFilter)的交易到区块的[默克尔树根](#MerkleRoot)的部分[默克尔树](#MerkleTree)。

**不要混淆**：
默克尔区块消息（MerkleBlock message）（传输默尔克区块的 P2P 协议消息）

## 默克尔树根 | Merkle root

**定义**：
[默克尔树](#MerkleTree)的根节点，树中所有哈希对的后代。
[区块头](#BlockHeader)必须包含一个该[区块](#Block)中所有交易的有效的默克尔树根。

**不要混淆**：
默克尔树（[Merkle tree](#MerkleTree)）（默克尔树根是根节点的树），默克尔区块（[Merkle block](#MerkleBlock)）（连接根到一笔或多笔叶子交易的部分默尔克分支）

## 默克尔树 | Merkle tree

**定义：**
通过散列配对的数据（叶子）构建的树，然后对结果进行配对和散列直到剩余单个散列值，即[默尔克树根](#MerkleRoot)。
在比特币中，叶子几乎总是来自单个[区块](#Block)的交易。

**不要混淆：**
部分默克尔分支（Partial merkle branch）（连接一个或多个叶子到根的分支），默克尔区块（[Merkle block](#MerkleBlock)）（连接一笔或多笔交易从单个[区块](#Block)到区块默尔克根的部分默尔克分支）

## 消息头 | Message header

**定义：**
比特币 P2P 网络上所有消息前缀的 4 个头部字段。

## 矿工 | Miner

**定义：**
挖矿是创建有效的比特币[区块](#区块--Block)的行为，需要验证[工作量证明](#工作量证明--POW)，且矿工是挖矿的设备或拥有那些设备的人。

**同义词：**
挖矿（Mining）

## 交易费 | Transaction fee

**定义：**
一笔交易的全部[输入](#输入--TxIn)减去全部[输出](#输出--TxOut)值的剩余金额；
该费用支付给包含该交易到[区块](#区块--Block)的[矿工](#矿工--Miner)。

**同义词：**
矿工费（Miners fee）

**不要混淆：**
最小中继费（[Minimum relay fee](#MinimumRelayFee)）（接收一笔交易到内存池并通过比特币核心[节点](#节点--Node)中继必须支付的最低费用）

## 中继费 | Relay fee

**定义：**
最小[交易费](#交易费--Transaction-Fee)，用于中继到其他[节点](#节点--Node)的交易必须支付给[全节点](#全节点--Node)的费用（如果它不是[高优先级交易](#高优先级交易--FreeTx)）。并没有最低中继费—每个[节点](#节点--Node)选择它自己的决策。

**同义词：**
最小中继费（Minimum relay fee）

**不要混淆：**
交易费（[Transaction fee](#交易费--Transaction-Fee)）（最小中继费是过滤过低[交易费](#交易费--Transaction-Fee)交易的决策选项）

## 难度对应值 | nBits

**定义：**
该目标值是低于必须使[区块](#区块--Block)有效的[区块头](#区块头--Block-Header)散列值的阈值，并且难度对应值出现在[区块头](#区块头--Block-Header)中，是目标阈值的编码形式。

**同义词：**
目标值（Target），目标阈值（Target threshold）

**不要混淆：**
难度（[Difficulty](#难度--Difficulty)）（一个数字，用于衡量寻找[区块头](#区块头--Block-Header)哈希的[难度](#难度--Difficulty)，相对于最容易目标值寻找[区块头](#区块头--Block-Header)哈希的[难度](#难度--Difficulty)）

## 网络魔数 | Network magic

**定义：**
在比特币 P2P 网络协议中定义的每条消息的 4 个字节的头部，用来寻找下一条消息。

**同义词：**
起始字符串（Start string）

## 通过交易费代替选择 | Opt-in replace by fee

**定义：**
使用支付更高[交易费](#TransactionFee)的不同版本的交易代替[未确认交易](#UnconfirmedTransaction)的版本。
可以使用 [BIP125](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki){:target="_blank"} 信号。

**同义词：**
通过交易费代替（Replace-by-fee），RBF

**不要混淆：**
孩子为父母付款（[Child pays for parent](#CPFP)），[CPFP](#CPFP)

## 孤儿区块 | Orphan block

**定义：**
父[区块](#Block)没有被本地[节点](#Node)处理的[区块](#Block)，以至于它们还不能被完全验证。

**不要混淆：**
陈旧的区块（[Stale block](#StaleBlock)）

## 输出点 | Outpoint

**定义：**
用于引用特定交易输出的数据结构，由 32 字节的[交易索引](#Txid)和 4 字节的输出索引序号（vout）组成。

**不要混淆：**
交易输出（[Output](#TxOut)），[TxOut](#TxOut)（和输出一样）

## 交易输出 | Transaction output

**定义：**
一笔交易的输出包含 2 个字段：转账 0 或更多[聪](#Satoshis)的字段和指明必须满足哪些条件才能进一步使用这些[聪](#Satoshis)的[公钥脚本](#ScriptPubKey)。

**同义词：**
输出（Output），TxOut

**不要混淆：**
输出点（[Outpoint](#Outpoint)）（某交易输出的引用）

## P2PKH 地址 | P2PKH address

**定义：**
比特币[付款地址](#Address)，包含哈希的[公钥](#PublicKey)，允许付款人创建标准的支付给公钥哈希（P2PKH）的[公钥脚本](#ScriptPubKey)。

**同义词：**
支付到公钥哈希（Pay to pubkey hash），P2PKH 输出（P2PKH output）

**不要混淆：**
[P2PK output](#TxOut)（直接支付给[公钥](#PublicKey)的[输出](#TxOut)），[P2SH address / output](#P2SH)（包括哈希的脚本和其相应的[输出](#TxOut)的[地址](#Address)）

## P2SH 地址 | P2SH address

**定义：**
比特币付款[地址](#Address)包含一个哈希的脚本，允许付款人创建一个标准的支付到脚本哈希（P2SH）的[公钥脚本](#ScriptPubKey)。
该脚本几乎可能是任何有效的[公钥脚本](#ScriptPubKey)。

**同义词：**
支付到脚本哈希（Pay to script hash），P2SH 输出（P2SH output）

**不要混淆：**
[P2PK output](#TxOut)（直接支付到[公钥](#PublicKey)的[输出](#TxOut)），
[P2PKH address / output](#P2PKH)（由散列的[公钥](#PublicKey)和其相应的[输出](#TxOut)组成的[地址](#Address)），
[P2SH multisig](#P2SHMultisig)（P2SH 特定的实例，其中脚本使用一个[多签操作码](#Opcode)）

## P2SH 多签 | P2SH multisig

**定义：**
[P2SH 输出](#P2SHAddress)，其中[兑换脚本](#RedeemScript)使用其中一个[多签](#Multisig)[操作码](#Opcode)。
直到比特币核心 0.10.0 版，[P2SH 多签脚本](#P2SHMultisig)是[标准交易](#StandardTransaction)，但大多数 P2SH 脚本不始。

**同义词：**
P2SH 多签输出（P2SH multisig output）

**不要混淆：**
多签公钥脚本（[Multisig pubkey scripts](#ScriptPubKey)）（也称作“[裸多签](#Multisig)”，这些[多签](#Multisig)脚本不使用 P2SH 封装）, P2SH（通用 P2SH，其中 [P2SH 多签](#P2SHMultisig)是比特币核心 0.10.0 版特殊情况下的特定实例）

## 父钥 | Parent key

**定义：**
在 [HD 钱包](#HDWallet)中，该密钥用于生成[子密钥](#ChildKey)。
该密钥可能是[私钥](#PrivateKey)或[公钥](#PublicKey)，且密钥的生成可能也需要[链编码](#ChainCode)。

**同义词：**
HD 钱包父钥（HD wallet parent key），公共父钥（Parent public key），私有服药（Parent private key）

**不要混淆：**
公钥（[Public key](#PublicKey)）（从[私钥](#PrivateKey)派生，非父密钥）

## 支付协议 | Payment protocol

**定义：**
该协议在 [BIP70](https://github.com/bitcoin/bips/blob/master/bip-0070.mediawiki){:target="_blank"}（和其他 BIPs）中定义，让付款人从收款人获取签名的支付细节。

**同义词：**
支付请求（Payment request），BIP70

**不要混淆：**
IP 到 IP 支付协议（IP-to-IP payment protocol）（包含在比特币早期版本中的不安全，已停止的协议）

## 工作量证明 | Proof of work

**定义：**
低于[目标值](#目标值--Target)的散列，一般只能通过执行一定量的暴力工作获得—因此论证了工作量证明。

**同义词：**
POW

## 私钥 | Private key

**定义：**
密钥对的私有部分，用于创建其他人都能使用[公钥](#PublicKey)验证的[签名](#Signature)。

**同义词：**
椭圆曲线私钥（ECDSA private key）

**不要混淆：**
[Public key](#PublicKey)（从私钥派生出的数据），[Parent key](#ParentKey)（用于创建[子密钥](#ChildKey)的密钥，不一定是私钥）

## 公钥脚本 | Pubkey script

**定义**：
包含在[输出](#TxOut)中的脚本，用于设置必须满足用于花费的[聪](#Satoshis)。
在签名脚本中提供满足条件的数据。
[公钥脚本](#ScriptPubKey)在代码中被称为[脚本公钥 "scriptPubKey"](#ScriptPubKey)。

**同义词：**
脚本公钥（ScriptPubKey）

**不要混淆：**
[Pubkey](#PublicKey)（[公钥](#PublicKey)，用作公钥脚本的一部分但不提供可编程的身份验证机制），[Signature script](#ScriptSig)（给公钥脚本提供数据的脚本）

## 公钥 | Public key

**定义：**
密钥对的公共部分，用于验证使用密钥对私有部分进行的[签名](#Signature)。

**同义词：**
椭圆曲线公钥（ECDSA public key）

**不要混淆：**
私钥（[Private key](#PrivateKey)）（派生出公钥的数据），[Parent key](#ParentKey)（用于创建[子密钥](#ChildKey)的密钥，不一定是公钥）

## 序列化的区块 | Serialized block

**定义：**
2 进制格式表示的完整的[区块](#区块--Block)—相同的格式用于计算总[区块](#区块--Block)字节大小；常用 16 进制表示。

**同义词：**
原始区块（Raw block）

## 序列化的交易 | Serialized transaction

**定义：**
2 进制格式表示的完整交易；常用 16 进制表示。
有时称为原始格式，因为多种比特币核心命令名中都带有 "raw" 字样。

**同义词：**
原始交易（Raw transaction）

## 赎回脚本 | Redeem script

**定义**：
功能上类似于[公钥脚本](#ScriptPubKey)的脚本。
其中一个副本用于创建 [P2SH 地址](#P2SH)（用于实际的[公钥脚本](#ScriptPubKey)），另一个副本放在支出[签名脚本](#ScriptSig)用来限制其条件。

**同义词**：
赎回脚本（RedeemScript）

**不要混淆**：
签名脚本（[Signature script](#ScriptSig)）（为[公钥脚本](#ScriptPubKey)提供数据的脚本，在 P2SH [输入](#TxIn)中包含赎回脚本）

## 回归测试网 | Regtest

**定义：**
开发人员能够立刻产生测试所需[区块](#Block)的本地测试环境，能够创建没有价值的私有[聪](#Satoshis)。

**同义词：**
回归测试模式（Regression test mode）

**不要混淆：**
公共测试网（[Testnet](#Testnet)）（模仿[主网](#Mainnet)的全球测试环境）

## RPC 字节序 | RPC byte order

**定义：**
逆序显示的哈希摘要；在比特币核心 RPCs，众多[区块](#Block)浏览器，和其他软件中使用。

**不要混淆：**
内部字节序（[Internal byte order](#InternalByteOrder)）（内部字节序，典型顺序显示的哈希摘要；用于[序列化的区块](#SerializedBlock)和[序列化的交易](#SerializedTransaction)）

## 签名脚本 | Signature script

**定义**：
通过付款人生成的数据，几乎总是用作满足[公钥脚本](#ScriptPubKey)的变量。
签名脚本在代码中又称为脚本签名。

**同义词：**
脚本签名（ScriptSig）

**不要混淆：**
椭圆曲线签名（[ECDSA signature](#Signature)）（一种签名，除了其他数据，能用于公钥脚本的一部分）

## 序列号 | Sequence number

**定义：**
所有交易的一部分。
一个数字，旨在允许锁定时间的[未确认的交易](#Confirmations)在序列化前更新；目前尚未使用，除非在交易中禁用[锁定时间](#nLockTime)。

**不要混淆：**
输出索引数字（Output index number / vout）（后面的交易用来引用特定[输出](#TxOut)的交易中的 0 索引号[输出](#TxOut)）

## 签名哈希 | Signature hash

**定义：**
比特币[签名](#Signature)的标志，表明[签名](#Signature)签署的交易部分。
（默认是 [SIGHASH_ALL](#SIGHASH_ALL)）交易未签名的部分可能被修改。

**同义词：**
签名哈希（Sighash）

**不要混淆：**已签名的哈希（Signed hash），[Transaction malleability / mutability](#TransactionMutability)（尽管非默认的[签名哈希](#Sighash)标志允许可选的延展性，延展性包含交易可能发生变化的任何方式）

## SIGHASH_ALL

**定义：**
签名除任意[脚本签名](#ScriptSig)的整个交易的默认的[签名哈希](#Sighash)类型，防止签名部分的修改。

## SIGHASH_ANYONECANPAY

**定义：**
仅签名当前[输入](#TxIn)的[签名哈希](#Sighash)类型。

**不要混淆：**
[SIGHASH_SINGLE](#SIGHASH_SINGLE)（签名该[输入](#TxIn)对应的[输出](#TxOut)和其他部分[输入](#TxIn)）

## SIGHASH_NONE

**定义：**
仅签名[输入](#TxIn)的[签名哈希](#Sighash)类型，允许任何人改变他们想改变的[输出](#TxOut)。

## SIGHASH_SINGLE

**定义：**
签名对应[输入](#TxIn)（具有相同索引值）的[输出](#TxOut)的[签名哈希](#Sighash)类型，该[输入](#TxIn)，和任意其他[输入](#TxIn)的一部分。允许其他[输出](#TxOut)和其他[输入](#TxIn)[序列号](#Sequence)的修改。

**不要混淆：**
[SIGHASH_ANYONECANPAY](#SIGHASH_ANYONECANPAY)（仅签名该单个[输入](#TxIn)的[签名哈希](#Sighash)类型的标志）

## 签名 | Signature

**定义：**
与[公钥](#PublicKey)相关的值，该公钥只能由拥有创建[公钥](#PublicKey)的[私钥](#PrivateKey)的人来创建。
在比特币中用于在发送到[公钥](#PublicKey)前验证花费的[聪](#Satoshis)。

**同义词：**
椭圆曲线签名（ECDSA signature）

## 软分叉 | Soft fork

**定义：**
软分叉是比特币协议的改变，其中只有之前有效的[区块](#Block)/交易变得无效了。
因为旧的[节点](#Node)将仍认为新[区块](#Block)是有效的，所以软分叉是向后兼容的。

**同义词：**
软分叉变化（Soft-forking change）

**不要混淆：**
[Fork](#Fork)（所有[节点](#Node)遵循相同的[共识规则](#ConsensusRules)的常规的分叉，一旦一条链的[工作量证明](#POW)高于另一条，该分叉被解决）,
[Hard fork](#HardFork)（[区块链](#BlockChain)上因未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的永久性的分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久性地分开开发一份代码）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码）

## 旧的区块 | Stale block

**定义：**
成功挖出但没有包含在当前[最佳区块链](#BlockChain)上的[区块](#Block)，可能是因为在相同[高度](#BlockHeight)的其他[区块](#Block)首先扩展链。

**不要混淆：**
孤儿区块（[Orphan block](#OrphanBlock)）（该[区块](#Block)的前一个区块哈希域指向一个未知的[区块](#Block)，意味着孤儿块不能被验证）

## 标准交易 | Standard transaction

**定义：**
传递给比特币核心 IsStandard 和 IsStandardTx 测试的交易。
只有标准交易通过运行默认比特币核心软件的[对端节点](#Node)挖矿或广播。

## 公共测试网 | Testnet

**定义：**
开发人员能够在类似于比特币[主网](#Mainnet)的网络上获得并花费没有真正价值的[聪](#Satoshis)的全球测试环境。

**同义词：**
测试网络（Testing network）

**不要混淆：**
回归测试网络（[Regtest](#Regtest)）（开发人员可控制[区块](#Block)生成的本地测试环境）

## 代币 | Token

**定义：**
代币是驻留在现存[区块链](#BlockChain)中的具有其基本代码的可编程数字资产。
代币有助于促进去中心化应用的创建。

**不要混淆：**
比特币（[Bitcoins](#Satoshis)），聪（[Satoshis](#Satoshis)），安全代币（Security token），衡量单位（[Denominations](#Satoshis)）

## 交易可变性 | Transaction mutability

**定义：**
某人改变的[未确认交易](#UnconfirmedTransaction)且不使其无效的能力，这会改变[交易号](#Txid)，使子交易无效。

**同义词：**
交易延展性（Transaction malleability）

**不要混淆：**
[BIP62](https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki){:target="_blank"}（可选的新交易版本的提议，减少了常见交易的已知变化集）

## 交易号 | Txid

**定义：**
用于唯一标示特定交易的标识符；具体来说，是交易的双 sha256 散列。

**同义词：**
交易识别码（Transaction Identifier）

**不要混淆**：
输出点（[Outpoint](#Outpoint)）（交易号和输出集的联合体，用于识别指定输出）

## 用户激活的软分叉 | User activated soft fork

**定义：**
通过标志日或[节点](#Node)强制代替[矿工](#Miner)信号激活的[软分叉](#SoftFork)。

**同义词：**
UASF

**不要混淆：**
[Miner activated soft fork](#MASF)（通过[矿工](#Miner)信号激活的[软分叉](#SoftFork)）,
[Fork](#Fork)（所有[节点](#Node)遵循相同的[共识规则](#ConsensusRules)的常规的分叉，一旦一条链的[工作量证明](#POW)高于另一条，该分叉被解决）,
[Hard fork](#HardFork)（[区块链](#BlockChain)上因未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的永久性的分叉）,
[Soft fork](#SoftFork)（[区块链](#BlockChain)上由未升级的[节点](#Node)不遵循新的[共识规则](#ConsensusRules)导致的临时分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

## 未花费的交易输出 | UTXO

**定义：**
可作为一笔交易[输入](#TxIn)的可花费的未花费的交易[输出](#TxOut)（UTXO）。

**同义词：**
未花费的交易输出（Unspent transaction output）

**不要混淆：**
[Output](#TxOut)（任意[输出](#TxOut)，包含花费和未花费的。[输出](#TxOut)是 UTXO 的超集，UTXO 是输出的子集）

## 钱包 | Wallet

**定义：**
存储[私钥](#PrivateKey)和[区块链](#BlockChain)镜像的软件（有时作为执行处理的服务器的客户端），允许用户花费和接收[聪](#Satoshis)。

**不要混淆：**
[HD wallet](#HDWallet)（允许钱包从单个种子创建全部密钥的协议，使用该协议的钱包）

## 钱包导入格式 | Wallet import format

**定义：**
一种数据交换格式，旨在允许导出和导入单个[私钥](#PrivateKey)，并带有指明其是否使用[压缩公钥](#CompressedPublicKey)的标志。

**同义词：**
WIF

**不要混淆：**
扩展的私钥（[Extended private keys](#PrivateKey)）（允许导入私钥的层次体系）

## Watch-Only 地址 | Watch-Only address

**定义：**
[钱包](#Wallet)中不带相应[私钥](#PrivateKey)的[地址](#Address)或[公钥脚本](#ScriptPubKey)，允许[钱包](#Wallet)监视其[输出](#TxOut)但不能花费它们。

## 参考链接

* [Developer Glossary - Bitcoin](https://bitcoin.org/en/developer-glossary){:target="_blank"}
