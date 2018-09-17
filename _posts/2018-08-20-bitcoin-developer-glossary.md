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

**同义词**：51 percent attack, Majority Hash Rate attack

<p id="BlockChain-ref"></p>
## 区块链 | Block Chain

**定义**：区块链，每个[区块](#Block-ref)都引用其前面[区块](#Block-ref)。最难重建的链是最佳区块链。

**同义词**：Best block chain

**不要混淆**：[Header chain](#HeaderChain-ref)

<p id="HeaderChain-ref"></p>
## 区块头链 | Header Chain

**定义**：区块头链，每个[区块头](#BlockHeader-ref)都链接其前面的[区块头](#BlockHeader-ref)；最难重建的链是最佳区块头链。

**同义词**：Best header chain

**不要混淆**：[Block chain](#BlockChain-ref)

<p id="Block-ref"></p>
## 区块 | Block

**定义**：以[区块头](#BlockHeader-ref)开头并受[工作量证明](#POW-ref)保护的一笔或多笔交易。区块是存储在[区块链](#BlockChain-ref)上的数据。

**同义词**：Block of transactions

<p id="BlockHeader-ref"></p>
## 区块头 | Block Header

**定义**：单个[区块](#Block-ref)的 80 个字节的区块头，被反复地散列以创建[工作量证明](#POW-ref)。

**同义词**：Header

<p id="SerializedBlock-ref"></p>
## 序列化区块 | Serialized Block

**定义**：2 进制格式表示的完整的[区块](#Block-ref)—相同的格式用于计算总[区块](#Block-ref)字节大小；常用 16 进制表示。

**同义词**：Raw block

<p id="POW-ref"></p>
## 工作量证明 | Proof Of Work, POW

**定义**：低于[目标值](#Target-ref)的散列，一般只能通过执行一定量的暴力工作获得—因此论证了工作量证明。

<p id="Target-ref"></p>
## 难度对应值 | nBits

**定义**：该目标值是低于必须使[区块](#Block-ref)有效的[区块头](#BlockHeader-ref)散列值的阈值，并且难度对应值出现在[区块头](#BlockHeader-ref)中，是目标阈值的编码形式。

**同义词**：Target, Target threshold（阈值）

**不要混淆**：[Difficulty](#Difficulty-ref)（一个数字，用于衡量寻找[区块头](#BlockHeader-ref)哈希的[难度](#Difficulty-ref)，相对于最容易目标值寻找[区块头](#BlockHeader-ref)哈希的[难度](#Difficulty-ref)）

<p id="Difficulty-ref"></p>
## 难度 | Difficulty

**定义**：相对找到最简单的[区块](#Block-ref)的难度，找到一个[区块](#Block-ref)有多难。最简单[区块](#Block-ref)的工作量证明难度为 1。

**同义词**：Network difficulty

**不要混淆**：[Target threshold](#Target-ref)（目标阈值，计算难度得到的值）

<p id="BlockHeight-ref"></p>
## 区块高度 | Block Height

**定义**：[区块链](#BlockChain-ref)上指定[区块](#Block-ref)前的[区块](#Block-ref)数。例如，因为[创世区块](#GenesisBlock-ref)前面没有[区块](#Block-ref)，所以其高度为 0。

**同义词**：Height, Block chain height

<p id="GenesisBlock-ref"></p>
## 创世区块 | Genesis Block

**定义**：比特币[区块链](#BlockChain-ref)上的第一个[区块](#Block-ref)。

**同义词**：Block 0（0 号区块，高度为 0 的区块）

**不要混淆**：[Generation transaction](#CoinbaseTransaction-ref)（创币交易，[区块](#Block-ref)上的第一笔交易）

<p id="CoinbaseTransaction-ref"></p>
## 创币交易 | Coinbase Transaction

**定义**：[区块](#Block-ref)的第一笔交易。该区块总是通过[矿工](#Miner-ref)创建，它包含一个[创币交易字段](#Coinbase-ref)。

**同义词**：Generation Transaction

**不要混淆**：[Coinbase](#Coinbase-ref)（创币交易的一部分）

<p id="Coinbase-ref"></p>
## 创币交易字段 | Coinbase field

**定义**：一个特殊的字段，作为[创币交易](#CoinbaseTransaction-ref)的唯一[输入](#TxIn-ref)。创币交易字段允许声明[区块奖励](#BlockReward-ref)并提供高达 100 个字节的任意数据。

**同义词**：Coinbase

**不要混淆**：[Coinbase transaction](#CoinbaseTransaction-ref), [Coinbase.com](https://www.coinbase.com)

<p id="Miner-ref"></p>
## 挖矿 | Mining

**定义**：挖矿是创建有效的比特币[区块](#Block-ref)的行为，需要验证[工作量证明](#POW-ref)，且矿工是挖矿的设备或拥有那些设备的人。

**同义词**：Miner

<p id="BlockReward-ref"></p>
## 区块奖励 | Block Reward

**定义**：[矿工](#Miner-ref)可能要求一定金额作为创建[区块](#Block-ref)的奖励。等于[区块](#Block-ref)补贴（新的可用的[聪](#Satoshis-ref)）加[区块](#Block-ref)交易支付的交易费的总和。

**同义词**：Block miner reward

**不要混淆**：Block subsidy, [Transaction fees](#TransactionFee-ref)

<p id="Satoshis-ref"></p>
## 衡量单位 | Denominations

**定义**：比特币值的衡量单位，通常用一些比特币来衡量，但有时用聪的数倍来衡量。
一个比特币等于 100,000,000 聪。

**同义词**：Bitcoins, Satoshis（聪）

**不要混淆**：二进制位，有两种可能取值的数据单元。

<p id="TransactionFee-ref"></p>
## 交易费 | Transaction Fee

**定义**：一笔交易的全部[输入](#TxIn-ref)减去全部[输出](#TxOut-ref)值的剩余金额；该费用支付给包含该交易到[区块](#Block-ref)的[矿工](#Miner-ref)。

**同义词**：Miners fee

**不要混淆**：[Minimum relay fee](#MinimumRelayFee-ref)（接收一笔交易到内存池并通过比特币核心[节点](#Node-ref)中继必须支付的最低费用）

<p id="MinimumRelayFee-ref"></p>
## 最小中继费 | Minimum Relay Fee

**定义**：最小[交易费](#TransactionFee-ref)，用于中继到其他[节点](#Node-ref)的交易必须支付给[全节点](#Node-ref)的费用（如果它不是[高优先级交易](#FreeTx-ref)）。并没有最低中继费—每个[节点](#Node-ref)选择它自己的决策。

**同义词**：Relay fee

**不要混淆**：[Transaction fee](#TransactionFee-ref)（最小中继费是过滤过低[交易费](#TransactionFee-ref)交易的决策选项）

<p id="FreeTx-ref"></p>
## 高优先级交易 | High-Priority Transaction

**定义**：没有支付[交易费](#TransactionFee-ref)的交易，因为他们的[输入](#TxIn-ref)空闲时间够长足以积累大量的优先级。注：[矿工](#Miner-ref)选择是否接受免费交易。

**同义词**：Free transaction, Free Tx（免费交易，不含交易费）

<p id="TxIn-ref"></p>
## 交易输入 | Transaction Input

**定义**：一笔交易的输入包含 3 个字段：[输出点](#Outpoint-ref)，[签名脚本](#ScriptSig-ref)，和[序列号](#Sequence-ref)。[输出点](#Outpoint-ref)引用前一笔[交易输出](#TxOut-ref)且[签名脚本](#ScriptSig-ref)允许花费它。

**同义词**：Input, TxIn

<p id="TxOut-ref"></p>
## 交易输出 | Transaction Output

**定义**：一笔交易的输出包含 2 个字段：转账 0 或更多[聪](#Satoshis-ref)的字段和指明必须满足哪些条件才能进一步使用这些[聪](#Satoshis-ref)的[公钥脚本](#ScriptPubKey-ref)。

**同义词**：Output, TxOut

**不要混淆**：[Outpoint](#Outpoint-ref)（某交易输出的引用）

<p id="Outpoint-ref"></p>
## 输出点 | Outpoint

**定义**：用于引用特定交易输出的数据结构，由 32 字节的[交易索引](#Txid-ref)和 4 字节的输出索引序号（vout）组成。

**不要混淆**：[Output](#TxOut-ref)（交易的完整输出）, [TxOut](#TxOut-ref)（和输出一样）

<p id="Txid-ref"></p>
## 交易号 | Txid, Transaction Identifier

**定义**：用于唯一标示特定交易的标识符；具体来说，是交易的双 sha256 散列。

**不要混淆**：[Outpoint](#Outpoint-ref)（交易号和输出集的联合体，用于识别指定输出）

<p id="ScriptSig-ref"></p>
## 签名脚本 | Signature Script

**定义**：通过付款人生成的数据，几乎总是用作满足[公钥脚本](#ScriptPubKey-ref)的变量。签名脚本在代码中又称为脚本签名。

**同义词**：ScriptSig（脚本签名）

**不要混淆**：[ECDSA signature](#Signature-ref)（一种签名，除了其他数据，能用于公钥脚本的一部分）

<p id="Sequence-ref"></p>
## 交易序列号 | Sequence Number (Transactions-ref)

**定义**：所有交易的一部分。一个数字，旨在允许锁定时间的[未确认的交易](#Confirmations-ref)在序列化前更新；目前尚未使用，除非在交易中禁用[锁定时间](#nLockTime-ref)。

**不要混淆**：Output index number / vout（后面的交易用来引用特定[输出](#TxOut-ref)的交易中的 0 索引号[输出](#TxOut-ref)）

<p id="Confirmations-ref"></p>
## 确认分数 | Confirmation Score

**定义**：分数表明在[最佳区块链](#BlockChain-ref)上需要修改的[区块](#Block-ref)数，用来移除或修改特定的交易。确认的交易有一个或更高的确认分数。

**同义词**：Confirmations, Confirmed transaction, Unconfirmed transaction

<p id="nLockTime-ref"></p>
## 锁定时间 | Locktime

**定义**：交易的一部分用于表明交易可能被添加到[区块链](#BlockChain-ref)的最早时间或最早的[区块](#Block-ref)。

**同义词**：nLockTime

<p id="ScriptPubKey-ref"></p>
## 公钥脚本 | Pubkey Script

**定义**：包含在[输出](#TxOut-ref)中的脚本，用于设置必须满足用于花费的[聪](#Satoshis-ref)。在签名脚本中提供满足条件的数据。[公钥脚本](#ScriptPubKey-ref)在代码中被称为[脚本公钥 "scriptPubKey"](#ScriptPubKey-ref)。

**同义词**：ScriptPubKey（脚本公钥）

**不要混淆**：[Pubkey](#PublicKey-ref)（[公钥](#PublicKey-ref)，用作公钥脚本的一部分但不提供可编程的身份验证机制）, [Signature script](#ScriptSig-ref)（给公钥脚本提供数据的脚本）

<p id="Signature-ref"></p>
## 签名 | Signature

**定义**：与[公钥](#PublicKey-ref)相关的值，该公钥只能由拥有创建[公钥](#PublicKey-ref)的[私钥](#PrivateKey-ref)的人来创建。在比特币中用于在发送到[公钥](#PublicKey-ref)前验证花费的[聪](#Satoshis-ref)。

**同义词**：ECDSA signature（椭圆曲线加密签名）

<p id="PrivateKey-ref"></p>
## 私钥 | Private Key

**定义**：密钥对的私有部分，用于创建其他人都能使用[公钥](#PublicKey-ref)验证的[签名](#Signature-ref)。

**同义词**：ECDSA private key（椭圆曲线私钥）

**不要混淆**：[Public key](#PublicKey-ref)（从私钥派生出的数据）, [Parent key](#ParentKey-ref)（用于创建[子密钥](#ChildKey-ref)的密钥，不一定是私钥）

<p id="PublicKey-ref"></p>
## 公钥 | Public Key

**定义**：密钥对的公共部分，用于验证使用密钥对私有部分进行的[签名](#Signature-ref)。

**同义词**：ECDSA public key（椭圆曲线公钥）

**不要混淆**：[Private key](#PrivateKey-ref)（派生出公钥的数据）, [Parent key](#ParentKey-ref)（用于创建[子密钥](#ChildKey-ref)的密钥，不一定是公钥）

<p id="HDWallet-ref"></p>
## HD 协议 | HD Protocol

**定义**：分层确定性（HD）密钥创建和传输协议（BIP32），允许从[父密钥](#ParentKey-ref)的层次创建[子密钥](#ChildKey-ref)。使用 HD 协议的[钱包](#Wallet-ref)称为 HD 钱包。

**同义词**：HD wallet, BIP32

<p id="Wallet-ref"></p>
## 钱包 | Wallet

**定义**：存储[私钥](#PrivateKey-ref)和[区块链](#BlockChain-ref)镜像的软件（有时作为执行处理的服务器的客户端），允许用户花费和接收[聪](#Satoshis-ref)。

**不要混淆**：[HD wallet](#HDWallet-ref)（允许钱包从单个种子创建全部密钥的协议，使用该协议的钱包）

<p id="ParentKey-ref"></p>
## 父密钥 | Parent Key

**定义**：在 [HD 钱包](#HDWallet-ref)中，该密钥用于生成[子密钥](#ChildKey-ref)。该密钥可能是[私钥](#PrivateKey-ref)或[公钥](#PublicKey-ref)，且密钥的生成可能也需要[链编码](#ChainCode-ref)。

**同义词**：HD wallet parent key, Parent public key, Parent private key

**不要混淆**：[Public key](#PublicKey-ref)（从[私钥](#PrivateKey-ref)派生，非父密钥）

<p id="ChildKey-ref"></p>
## 子密钥 | Child Key

**定义**：在 [HD 钱包](#HDWallet-ref)中，从[父密钥](#ParentKey-ref)派生的密钥。该密钥可以是[私钥](#PrivateKey-ref)，也可以是[公钥](#PublicKey-ref)，密钥的推导（派生）可能需要[链编码](#ChainCode-ref)。

**同义词**：HD wallet child key, Child public key, Child private key

**不要混淆**：[Public key](#PublicKey-ref)（从[私钥](#PrivateKey-ref)派生，非父密钥）

<p id="ChainCode-ref"></p>
## 链编码 | Chain Code

**定义**：在 [HD 钱包](#HDWallet-ref)中，256 位熵被添加到公钥和[私钥](#PrivateKey-ref)中，来帮助它们生成安全的[子密钥](#ChildKey-ref)；
[主链编码](#MasterChainCode-ref)通常派生自携带[主私钥](#MasterPrivateKey-ref)的种子。

**同义词**：HD wallet chain code

<p id="MasterChainCode-ref"></p>
## 主链代码和主私钥 | Master Chain Code And Private Key

**定义**：在 [HD 钱包](#HDWallet-ref)中，主链代码和主私钥是从[根种子](#RootSeed-ref)派生的 2 个数据。

**同义词**：Master chain code, Master private key

<p id="RootSeed-ref"></p>
## HD 钱包种子 | HD Wallet Seed

**定义**：用作为 [HD 钱包](#HDWallet-ref)生成[主私钥](#MasterChainCode-ref)和[主链代码](#MasterChainCode-ref)的种子的潜在短值。

**同义词**：Root seed

**不要混淆**：Mnemonic code / mnemonic seed（助记代码/种子，二进制根种子格式化为单词，使人们更容易记录和记忆）

<p id="Node-ref"></p>
## 节点 | Node

**定义**：连接到比特币网络的计算机。

**同义词**：Full Node（完整/全节点）, Archival Node, Pruned Node（修剪过的节点）, Peer

**不要混淆**：Lightweight node（轻量级节点）, [SPV node](#SPV-ref)

<p id="SPV-ref"></p>
## 简单支付验证 | SPV, Simplified Payment Verification

**定义**：用于验证某笔交易是否包含在某个未下载完整的[区块](#Block-ref)中。该方法用于一些轻量级比特币客户端。

**同义词**：Lightweight client（轻量级客户端）, Thin client

<p id="Fork-ref"></p>
## 分叉 | Fork

**定义**：当 2 个或 2 个以上的[区块](#Block-ref)有相同的[高度](#BlockHeight-ref)时，[区块链](#BlockChain-ref)分叉。特别是发生在 2 个或 2 个以上的[矿工](#Miner-ref)几乎同时找到[区块](#Block-ref)时。也可以用于攻击。

**同义词**：Accidental fork（意外的分叉）

**不要混淆**：[Hard fork](#HardFork-ref)（[共识规则](#ConsensusRules-ref)的变化会破坏不升级[节点](#Node-ref)的安全性）,
[Soft fork](#SoftFork-ref)（[共识规则](#ConsensusRules-ref)的变化会削弱不升级[节点](#Node-ref)的安全性）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

<p id="HardFork-ref"></p>
## 硬分叉 | Hard Fork

**定义**：[区块链](#BlockChain-ref)上永久性的分叉，通常发生在未升级的[节点](#Node-ref)不能验证通过遵守新的[共识规则](#ConsensusRules-ref)的升级的[节点](#Node-ref)创建的[区块](#Block-ref)时。

**同义词**：Hard-forking change（硬分叉变化）

**不要混淆**：[Fork](#Fork-ref)（所有[节点](#Node-ref)遵循相同的[共识规则](#ConsensusRules-ref)的常规的分叉，一旦一条链的[工作量证明](#POW-ref)高于另一条，该分叉被解决）,
[Soft fork](#SoftFork-ref)（[区块链](#BlockChain-ref)上由未升级的[节点](#Node-ref)不遵循新的[共识规则](#ConsensusRules-ref)导致的临时分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

<p id="SoftFork-ref"></p>
## 软分叉 | Soft Fork

**定义**：软分叉是比特币协议的改变，其中只有之前有效的[区块](#Block-ref)/交易变得无效了。因为旧的[节点](#Node-ref)将仍认为新[区块](#Block-ref)是有效的，所以软分叉是向后兼容的。

**同义词**：Soft-forking change（软分叉变化）

**不要混淆**：[Fork](#Fork-ref)（所有[节点](#Node-ref)遵循相同的[共识规则](#ConsensusRules-ref)的常规的分叉，一旦一条链的[工作量证明](#POW-ref)高于另一条，该分叉被解决）,
[Hard fork](#HardFork-ref)（[区块链](#BlockChain-ref)上因未升级的[节点](#Node-ref)不遵循新的[共识规则](#ConsensusRules-ref)导致的永久性的分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久性地分开开发一份代码）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码）

<p id="MASF-ref"></p>
## 矿工激活的软分叉 | Miner Activated Soft Fork, MASF

**定义**：通过[矿工](#Miner-ref)信号激活的[软分叉](#SoftFork-ref)。

**不要混淆**：[User Activated Soft Fork](#UASF-ref)（通过标记日或[节点](#Node-ref)强制而非[矿工](#Miner-ref)信号激活的i[软分叉](#SoftFork-ref)）,
[Fork](#Fork-ref)（所有[节点](#Node-ref)遵循相同的[共识规则](#ConsensusRules-ref)的常规的分叉，一旦一条链的[工作量证明](#POW-ref)高于另一条，该分叉被解决）,
[Hard fork](#HardFork-ref)（[区块链](#BlockChain-ref)上因未升级的[节点](#Node-ref)不遵循新的[共识规则](#ConsensusRules-ref)导致的永久性的分叉）,
[Soft fork](#SoftFork-ref)（[区块链](#BlockChain-ref)上由未升级的[节点](#Node-ref)不遵循新的[共识规则](#ConsensusRules-ref)导致的临时分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

<p id="UASF-ref"></p>
## 用户激活的软分叉 | User Activated Soft Fork, UASF

**定义**：通过标志日或[节点](#Node-ref)强制代替[矿工](#Miner-ref)信号激活的[软分叉](#SoftFork-ref)。

**不要混淆**：[Miner activated soft fork](#MASF-ref)（通过[矿工](#Miner-ref)信号激活的[软分叉](#SoftFork-ref)）,
[Fork](#Fork-ref)（所有[节点](#Node-ref)遵循相同的[共识规则](#ConsensusRules-ref)的常规的分叉，一旦一条链的[工作量证明](#POW-ref)高于另一条，该分叉被解决）,
[Hard fork](#HardFork-ref)（[区块链](#BlockChain-ref)上因未升级的[节点](#Node-ref)不遵循新的[共识规则](#ConsensusRules-ref)导致的永久性的分叉）,
[Soft fork](#SoftFork-ref)（[区块链](#BlockChain-ref)上由未升级的[节点](#Node-ref)不遵循新的[共识规则](#ConsensusRules-ref)导致的临时分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

<p id="ConsensusRules-ref"></p>
## 共识规则 | Consensus Rules

**定义**：全[节点](#Node-ref)遵循与其他[节点](#Node-ref)相同的[共识](#Consensus-ref)的区块验证规则。

**同义词**：Validation Rules（验证规则）

**不要混淆**：[Consensus](#Consensus-ref)（当[节点](#Node-ref)遵循相同的共识规则就达成了共识）

<p id="Consensus-ref"></p>
## 共识 | Consensus

**定义**：当几个[节点](#Node-ref)（通常是网络上的大部分[节点](#Node-ref)）在它们本地验证过的[最佳区块链](#BlockChain-ref)中都有相同的[区块](#Block-ref)。

**不要混淆**：Social consensus（社会共识，通常用于开发人员之间的讨论，以表明大多数人同意某个特定的方案）, [Consensus rules](#ConsensusRules-ref)（允许[节点](#Node-ref)维持共识的规则）

<p id="StaleBlock-ref"></p>
## 陈旧的区块 | Stale Block

**定义**：成功挖出但没有包含在当前[最佳区块链](#BlockChain-ref)上的[区块](#Block-ref)，可能是因为在相同[高度](#BlockHeight-ref)的其他[区块](#Block-ref)首先扩展链。

**不要混淆**：[Orphan block](#OrphanBlock-ref)（该[区块](#Block-ref)的前一个区块哈希域指向一个未知的[区块](#Block-ref)，意味着孤儿块不能被验证）

<p id="OrphanBlock-ref"></p>
## 孤儿块 | Orphan Block

**定义**：父[区块](#Block-ref)没有被本地[节点](#Node-ref)处理的[区块](#Block-ref)，以至于它们还不能被完全验证。

**不要混淆**：[Stale block](#StaleBlock-ref)（陈旧的区块）

## 区块大小限制 | Block Size Limit

**定义**：[共识规则](#ConsensusRules-ref)允许一个[区块](#Block-ref)的以字节为单位的最大尺寸。当前[区块](#Block-ref)大小限制是 1,000,000 字节。

**同义词**：Maximum block size

**不要混淆**：[Block](#Block-ref), [Blockchain](#BlockChain-ref), Blockchain size

<p id="Mainnet-ref"></p>
## 主网 | Mainnet

**定义**：比特币交易的原始和主要网络，其中的[聪](#Satoshis-ref)有真正经济价值。

**同义词**：Bitcoin main network

**不要混淆**：[Testnet](#Testnet-ref)（非常类似主网的开放网络，其中的[聪](#Satoshis-ref)没有价值）, [Regtest](#Regtest-ref)（类似于[测试网](#Testnet-ref)的私有测试[节点](#Node-ref)）

<p id="Testnet-ref"></p>
## 测试网 | Testnet

**定义**：开发人员能够在类似于比特币[主网](#Mainnet-ref)的网络上获得并花费没有真正价值的[聪](#Satoshis-ref)的全球测试环境。

**同义词**：Testing network

**不要混淆**：[Regtest](#Regtest-ref)（开发人员可控制[区块](#Block-ref)生成的本地测试环境）

<p id="Regtest-ref"></p>
## 回归测试网 | Regtest

**定义**：开发人员能够立刻产生测试所需[区块](#Block-ref)的本地测试环境，能够创建没有价值的私有[聪](#Satoshis-ref)。

**同义词**：Regression test mode

**不要混淆**：[Testnet](#Testnet-ref)（模仿[主网](#Mainnet-ref)的全球测试环境）

## DNS 种子 | DNS Seed

**定义**：DNS 域名解析服务器返回比特币网络上的全[节点](#Node-ref)的 IP 地址集来帮助进行对端的发现。

**不要混淆**：[HD wallet seeds](#RootSeed-ref)

<p id="Base58check-ref"></p>
## Base58 编码 | Base58check

**定义**：比特币中用于转换 160 位的哈希值到 P2PKH 和 [P2SH 地址](#P2SH-ref)的方法。
也用于比特币的其他部分，例如用于 WIP 格式备份编码的[私钥](#PrivateKey-ref)。与其他的 base58 实现不同。

**同义词**：Bitcoin Address Encoding

**不要混淆**：[P2PKH address](#P2PKH-ref), [P2SH address](#P2SH-ref), IP address

<p id="P2PKH-ref"></p>
## P2PKH 地址 | 2PKH Address

**定义**：比特币[付款地址](#Address-ref)，包含哈希的[公钥](#PublicKey-ref)，允许付款人创建标准的支付给公钥哈希（P2PKH）的[公钥脚本](#ScriptPubKey-ref)。

**同义词**：Pay to pubkey hash, P2PKH output

**不要混淆**：[P2PK output](#TxOut-ref)（直接支付给[公钥](#PublicKey-ref)的[输出](#TxOut-ref)）, [P2SH address / output](#P2SH-ref)（包括哈希的脚本和其相应的[输出](#TxOut-ref)的[地址](#Address-ref)）

<p id="P2SHAddress-ref"></p>
## P2SH 地址 | P2SH Address

**定义**：比特币付款[地址](#Address-ref)包含一个哈希的脚本，允许付款人创建一个标准的支付到脚本哈希（P2SH）的[公钥脚本](#ScriptPubKey-ref)。该脚本几乎可能是任何有效的[公钥脚本](#ScriptPubKey-ref)。

**同义词**：Pay to script hash, P2SH output

**不要混淆**：[P2PK output](#TxOut-ref)（直接支付到[公钥](#PublicKey-ref)的[输出](#TxOut-ref)）,
[P2PKH address / output](#P2PKH-ref)（由散列的[公钥](#PublicKey-ref)和其相应的[输出](#TxOut-ref)组成的[地址](#Address-ref)）,
[P2SH multisig](#P2SHMultisig-ref)（P2SH 特定的实例，其中脚本使用一个[多签操作码](#Opcode-ref)）

<p id="Address-ref"></p>
## 付款地址 | Payment Addresses

**定义**：使用 [base58check](#Base58check-ref) 格式化的 20 个字节的哈希值，用来生成 P2PKH 或 P2SH 类型的比特币地址。
目前用户交换支付信息的最常见方式。

**同义词**：Address

**不要混淆**：IP address

<p id="P2SHMultisig-ref"></p>
## P2SH 多签 | P2SH Multisig

**定义**：[P2SH 输出](#P2SHAddress-ref)，其中[兑换脚本](#RedeemScript-ref)使用其中一个[多签](#Multisig-ref)[操作码](#Opcode-ref)。直到比特币核心 0.10.0 版，[P2SH 多签脚本](#P2SHMultisig-ref)是[标准交易](#StandardTransaction-ref)，但大多数 P2SH 脚本不始。

**同义词**：P2SH multisig output

**不要混淆**：[Multisig pubkey scripts](#ScriptPubKey-ref)（也称作“[裸多签](#Multisig-ref)”，这些[多签](#Multisig-ref)脚本不使用 P2SH 封装）, P2SH（通用 P2SH，其中 [P2SH 多签](#P2SHMultisig-ref)是比特币核心 0.10.0 版特殊情况下的特定实例）

<p id="RedeemScript-ref"></p>
## 赎回脚本 | Redeem Script

**定义**：功能上类似于[公钥脚本](#ScriptPubKey-ref)的脚本。其中一个副本用于创建 [P2SH 地址](#P2SH-ref)（用于实际的[公钥脚本](#ScriptPubKey-ref)），另一个副本放在支出[签名脚本](#ScriptSig-ref)用来限制其条件。

**同义词**：RedeemScript

**不要混淆**：[Signature script](#ScriptSig-ref)（为[公钥脚本](#ScriptPubKey-ref)提供数据的脚本，在 P2SH [输入](#TxIn-ref)中包含赎回脚本）

<p id="Opcode-ref"></p>
## 操作码 | Opcode

**定义**：来自比特币脚本语言的操作码在[公钥脚本](#ScriptPubKey-ref)或[签名脚本](#ScriptSig-ref)内部推送数据或执行函数。

**同义词**：Data-pushing opcode, Non-data-pushing opcode

<p id="StandardTransaction-ref"></p>
## 标准交易 | Standard Transaction

**定义**：传递给比特币核心 IsStandard(-ref) 和 IsStandardTx(-ref) 测试的交易。只有标准交易通过运行默认比特币核心软件的[对端节点](#Node-ref)挖矿或广播。

## Watch-Only 地址 | Watch-Only Address

**定义**：[钱包](#Wallet-ref)中不带相应[私钥](#PrivateKey-ref)的[地址](#Address-ref)或[公钥脚本](#ScriptPubKey-ref)，允许[钱包](#Wallet-ref)监视其[输出](#TxOut-ref)但不能花费它们。

## 钱包导入格式 | Wallet Import Format, WIF

**定义**：一种数据交换格式，旨在允许导出和导入单个[私钥](#PrivateKey-ref)，并带有指明其是否使用[压缩公钥](#CompressedPublicKey-ref)的标志。

**不要混淆**：[Extended private keys](#PrivateKey-ref)（允许导入私钥的层次体系）

<p id="CompressedPublicKey-ref"></p>
## 压缩公钥 | Compressed Public Key

**定义**：33 字节的[椭圆曲线公钥](#PublicKey-ref)而非 65 字节的未压缩[公钥](#PublicKey-ref)。

## 双重花费 | Double Spend

**定义**：使用与已经广播交易相同[输入](#TxIn-ref)的交易。当有一个交易已经记录在[区块链](#BlockChain-ref)上时，将被当作重复，欺骗或转换的尝试。

<p id="CPFP-ref"></p>
## 孩子为父母付钱 | Child Pays For Parent, CPFP

**定义**：[挖矿](#Miner-ref)选择的交易不仅基于它们的交易费，还基于它们祖先（父母）交易和后代（孩子）交易的交易费。

**同义词**：Ancestor mining

**不要混淆**：[Replace by Fee](#RBF-ref), [RBF](#RBF-ref)

<p id="RBF-ref"></p>
## 通过交易费代替 | Replace-by-Fee, RBF

**定义**：使用支付更高[交易费](#TransactionFee-ref)的不同版本的交易代替[未确认交易](#UnconfirmedTransaction-ref)的版本。可以使用 [BIP125](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki) 信号。

**同义词**：Opt-in replace by fee（通过最优交易费代替）

**不要混淆**：[Child pays for parent](#CPFP-ref), [CPFP](#CPFP-ref)

<p id="BloomFilter-ref"></p>
## 布鲁姆过滤器 | Bloom Filter

**定义**：主要由 [SPV 客户端](#SPV-ref)使用过滤器，用来从全[节点](#Node-ref)请求匹配的交易和[默尔克区块](#MerkleBlock-ref)。

**不要混淆**：Bloom filter（通用计算机科学条目，比特币的布鲁姆过滤器是一个特定的实现）

<p id="MerkleBlock-ref"></p>
## 默尔克区块 | Merkle Block

**定义**：连接匹配[布鲁姆过滤器](#BloomFilter-ref)的交易到区块的[默尔克树根](#MerkleRoot-ref)的部分[默尔克树](#MerkleTree-ref)。

**不要混淆**：MerkleBlock message（传输默尔克区块的 P2P 协议消息）

<p id="MerkleTree-ref"></p>
## 默尔克树 | Merkle Tree

**定义**：通过散列配对的数据（叶子）构建的树，然后对结果进行配对和散列直到剩余单个散列值，即[默尔克树根](#MerkleRoot-ref)。在比特币中，叶子几乎总是来自单个[区块](#Block-ref)的交易。

**不要混淆**：Partial merkle branch（连接一个或多个叶子到根的分支）, [Merkle block](#MerkleBlock-ref)（连接一笔或多笔交易从单个[区块](#Block-ref)到区块默尔克根的部分默尔克分支）

<p id="MerkleRoot-ref"></p>
## 默尔克树根 | Merkle Root

**定义**：[默尔克树](#MerkleTree-ref)的根节点，树中所有哈希对的后代。[区块头](#BlockHeader-ref)必须包含一个该[区块](#Block-ref)中所有交易的有效的默尔克树根。

**不要混淆**：[Merkle tree](#MerkleTree-ref)（默尔克树根是根节点的树）, [Merkle block](#MerkleBlock-ref)（连接根到一笔或多笔叶子交易的部分默尔克分支）

## 初始化区块下载 | Initial Block Download, IBD

**定义**：用于通过新[节点](#Node-ref)（或长时间离线的[节点](#Node-ref)）下载大量的[区块](#Block-ref)来赶上[最佳区块连](#BlockChain-ref)的链尖的过程。

**不要混淆**：[Blocks-first sync](#Blocks-First-ref)（同步包含获得任意数量的[区块](#Block-ref)；IBD 仅用于大量[区块](#Block-ref)）

<p id="Blocks-First-ref"></p>
## 区块首次同步 | Blocks-First

**定义**：通过从[对端](#Peer-ref)下载每个[区块](#Block-ref)并进行验证来同步[区块链](#BlockChain-ref)。

**同义词**：BLocks-first sync

**不要混淆**：[Headers-first sync](#Headers-First-ref)

<p id="Headers-First-ref"></p>
## 区块头优先同步 | Headers-First Sync

**定义**：通过在下载整个[区块](#Block-ref)前下载[区块头](#BlockHeader-ref)来同步[区块链](#BlockChain-ref)。

**同义词**：Headers-First

**不要混淆**：[Blocks-first sync](#Blocks-First-ref)（直接下载整个[区块](#Block-ref)，不首先获取它们的[头](#BlockHeader-ref)）

## 消息头 | Message Header

**定义**：比特币 P2P 网络上所有消息前缀的 4 个头部字段。

## 网络魔数 | Network Magic

**定义**：在比特币 P2P 网络协议中定义的每条消息的 4 个字节的头部，用来寻找下一条消息。

**同义词**：Start String

## 支付协议 | Payment Protocol

**定义**：该协议在 [BIP70](https://github.com/bitcoin/bips/blob/master/bip-0070.mediawiki)（和其他 BIPs）中定义，让付款人从收款人获取签名的支付细节。

**同义词**：Payment request, BIP70

**不要混淆**：IP-to-IP payment protocol（包含在比特币早期版本中的不安全，已停止的协议）

<p id="InternalByteOrder-ref"></p>
## 内部字节序 | Internal Byte Order

**定义**：显示为字符串的散列摘要的标准字节序—相同的格式用于[序列化的区块](#SerializedBlock-ref)和交易。

**不要混淆**：[RPC byte order](#RPCByteOrder-ref)（反转的字节序）

<p id="RPCByteOrder-ref"></p>
## RPC 字节序 | RPC Byte Order

**定义**：逆序显示的哈希摘要；在比特币核心 RPCs，众多[区块](#Block-ref)浏览器，和其他软件中使用。

**不要混淆**：[Internal byte order](#InternalByteOrder-ref)（内部字节序，典型顺序显示的哈希摘要；用于[序列化的区块](#SerializedBlock-ref)和[序列化的交易](#SerializedTransaction-ref)）

<p id="SerializedTransaction-ref"></p>
## 序列化的交易 | Serialized Transaction

**定义**：2 进制格式表示的完整交易；常用 16 进制表示。有时称为原始格式，因为多种比特币核心命令名中都带有 "raw" 字样。

**同义词**：Raw transaction（原始交易）

## 库存 | Inventory

**定义**：一种数据类型标识和一个散列值；用于识别通过比特币 P2P 网络下载的交易和可用的[区块](#Block-ref)。

**同义词**：Block or transaction inventory

**不要混淆**：Inv message（传输库存的 P2P 消息）

## 找零 | Change

**定义**：交易的[输出](#TxIn-ref)把[聪](#Satoshis-ref)返给付款人，从而防止过多的[输入](#TxIn-ref)转到[交易费](#TransactionFee-ref)中。

**同义词**：Change address, Change output

**不要混淆**：Address reuse（地址重用）

## 代币 | Token

**定义**：代币是驻留在现存[区块链](#BlockChain-ref)中的具有其基本代码的可编程数字资产。代币有助于促进去中心化应用的创建。

**不要混淆**：[Bitcoins](#Satoshis-ref), [Satoshis](#Satoshis-ref), Security token, [Denominations](#Satoshis-ref)

## CompactSize 无符号整数 | CompactSize Unsigned Integer

**定义**：一种长度可变的整数，常用于比特币 P2P 协议和比特币序列化的数据结构。

**同义词**：CompactSize

**不要混淆**：VarInt（比特币核心用于本地数据存储的数据类型）, Compact（用于[区块头](#BlockHeader-ref)中的[难度对应值 nBits](#Target-ref) 的数据类型）

## 托管合同 | Escrow Contract

**定义**：一种交易，付款人和收款人把资金放入 2 比 2（或其他的 [m 比 n](#M-of-N-ref)）的[多签输出](#M-of-N-ref)中，均不会花费资金，直到都满足某些外部条件。

<p id="M-of-N-ref"></p>
## 多签输出 | M-of-N Multisig, Multisig Output

**定义**：[公钥脚本](#ScriptPubKey-ref)提供给 n 个[公钥](#PublicKey-ref)并需要对应的[签名脚本](#ScriptSig-ref)提供对应提供[公钥](#PublicKey-ref)的最少 m 个[签名](#Signature-ref)。

**同义词**：Multisig, Bare multisig

**不要混淆**：[P2SH multisig](#P2SH-ref)（包含在 P2SH 里的多签脚本）, 需要多个[签名](#Signature-ref)而不用 OP_CHECKMULTISIG 或 OP_CHECKMULTISIGVERIFY 的高级脚本

<p id="Sighash-ref"></p>
## 签名哈希 | Signature Hash

**定义**：比特币[签名](#Signature-ref)的标志，表明[签名](#Signature-ref)签署的交易部分。（默认是 [SIGHASH_ALL](#SIGHASH_ALL-ref)）交易未签名的部分可能被修改。

**同义词**：Sighash

**不要混淆**：Signed hash（签名的数据哈希）, [Transaction malleability / mutability](#TransactionMutability-ref)（尽管非默认的[签名哈希](#Sighash-ref)标志允许可选的延展性，延展性包含交易可能发生变化的任何方式）

<p id="TransactionMutability-ref"></p>
## 交易可变性 | Transaction Mutability

**定义**：某人改变的[未确认交易](#UnconfirmedTransaction-ref)且不使其无效的能力，这会改变[交易号](#Txid-ref)，使子交易无效。

**同义词**：Transaction malleability（交易延展性）

**不要混淆**：[BIP62](https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki)（可选的新交易版本的提议，减少了常见交易的已知变化集）

<p id="ExtendedKey-ref"></p>
## 扩展的密钥 | Extended Key

**定义**：在 [HD 钱包](#HDWallet-ref)的情况中，使用[链编码](#ChainCode-ref)扩展的[公钥](#PublicKey-ref)或[私钥](#PrivateKey-ref)允许它们导出[子密钥](#ChildKey-ref)。

**同义词**：HD wallet extended key, Public extended key, Private extended key

## 硬化的扩展密钥 | Hardened Extended Key (HD Wallets-ref)

**定义**：[HD 钱包扩展密钥](#ExtendedKey-ref)的一个变体，只有硬化的扩展私钥才能生成[子密钥](#ChildKey-ref)。防止[链代码](#ChainCode-ref)加任何[私钥](#PrivateKey-ref)的组合使整个[钱包](#Wallet-ref)处于风险中。

## SIGHASH_ALL

**定义**：签名除任意[脚本签名](#ScriptSig-ref)的整个交易的默认的[签名哈希](#Sighash-ref)类型，防止签名部分的修改。

## SIGHASH_NONE

**定义**：仅签名[输入](#TxIn-ref)的[签名哈希](#Sighash-ref)类型，允许任何人改变他们想改变的[输出](#TxOut-ref)。

<p id="SIGHASH_ANYONECANPAY-ref"></p>
## SIGHASH_ANYONECANPAY（任何人都可以支付）

**定义**：仅签名当前[输入](#TxIn-ref)的[签名哈希](#Sighash-ref)类型。

**不要混淆**：[SIGHASH_SINGLE](#SIGHASH_SINGLE-ref)（签名该[输入](#TxIn-ref)对应的[输出](#TxOut-ref)和其他部分[输入](#TxIn-ref)）

<p id="SIGHASH_SINGLE-ref"></p>
## SIGHASH_SINGLE

**定义**：签名对应[输入](#TxIn-ref)（具有相同索引值）的[输出](#TxOut-ref)的[签名哈希](#Sighash-ref)类型，该[输入](#TxIn-ref)，和任意其他[输入](#TxIn-ref)的一部分。允许其他[输出](#TxOut-ref)和其他[输入](#TxIn-ref)[序列号](#Sequence-ref)的修改。

**不要混淆**：[SIGHASH_ANYONECANPAY](#SIGHASH_ANYONECANPAY-ref)（仅签名该单个[输入](#TxIn-ref)的[签名哈希](#Sighash-ref)类型的标志）

## 空数据交易 | Null Data (OP_RETURN-ref) Transaction

**定义**：在比特币核心 0.9.0 版或更新的版本中，中继和挖矿的交易类型，添加任意数据到可证明不可花费的[公钥脚本](#ScriptPubKey-ref)，全[节点](#Node-ref)不必存储在它们的 [UTXO](#UTXO-ref) 数据库中。

**同义词**：Data carrier transaction

**不要混淆**：[OP_RETURN](#OP_RETURN-ref)（用于 OP_RETURN 交易一个[输出](#TxOut-ref)的[操作码](#Opcode-ref)）

<p id="UTXO-ref"></p>
## 未花费的交易输出 | Unspent Transaction Output, UTXO

**定义**：可作为一笔交易[输入](#TxIn-ref)的可花费的未花费的交易[输出](#TxOut-ref)（UTXO）。

**不要混淆**：[Output](#TxOut-ref)（任意[输出](#TxOut-ref)，包含花费和未花费的。[输出](#TxOut-ref)是 UTXO 的超集，UTXO 是输出的子集）

Thanks for your time.

## 参照
* [Developer Glossary - Bitcoin](https://bitcoin.org/en/developer-glossary)
* [...](https://github.com/mistydew/blockchain)
