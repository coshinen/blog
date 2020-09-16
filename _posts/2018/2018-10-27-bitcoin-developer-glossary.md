---
layout: post
title:  "比特币开发者术语表"
date:   2018-10-27 22:08:57 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin Translations
---
这是一个专业术语汇编。普通用户应该使用[词汇表页面](/blog/2018/10/bitcoin-vocabulary.html)。

> ## 51 percent attack / Majority attack
> 
> The ability of someone controlling a majority of network hash rate to revise transaction history and prevent new transactions from confirming.

## 百分之 51 攻击 / 主要攻击

控制大多数网络哈希率的某人修改交易历史并阻止新交易确认的能力。

> ## Address
> 
> A 20-byte hash formatted using base58check to produce either a P2PKH or P2SH Bitcoin address. Currently the most common way users exchange payment information.
> 
> **Not to be confused with:** IP address

## 地址

使用 Base58 编码格式化的 20 个字节的哈希值，用来生成 P2PKH 或 P2SH 类型的比特币地址。
目前用户交换支付信息的最常见方式。

**不要混淆：** IP 地址

> ## Base58check
> 
> The method used in Bitcoin for converting 160-bit hashes into P2PKH and P2SH addresses. Also used in other parts of Bitcoin, such as encoding private keys for backup in WIP format. Not the same as other base58 implementations.
> 
> **Not to be confused with:** P2PKH address, P2SH address, IP address

## Base58 编码

比特币中用于转换 160 位的哈希值到 P2PKH 和 P2SH 地址的方法。
也用于比特币的其他部分，例如用于 WIP 格式备份编码的私钥。
与其他的 base58 实现不同。

**不要混淆：** P2PKH 地址，P2SH 地址，IP 地址

> ## Block
> 
> One or more transactions prefaced by a block header and protected by proof of work. Blocks are the data stored on the block chain.

## 区块

以区块头开头并受工作量证明保护的一笔或多笔交易。
区块是存储在区块链上的数据。

> ## Block chain / Best block chain
> 
> A chain of blocks with each block referencing the block that preceded it. The most-difficult-to-recreate chain is the best block chain.
> 
> **Not to be confused with:** Header chain

## 区块链 / 最佳区块链

区块链，每个区块都引用其前面区块。
最难重建的链是最佳区块链。

**不要混淆：** 区块头链

> ## Block header / Header
> 
> An 80-byte header belonging to a single block which is hashed repeatedly to create proof of work.

## 区块头 / 头部

单个区块的 80 个字节的区块头，被反复地散列以创建工作量证明。

> ## Height / Block height
> 
> The number of blocks preceding a particular block on a block chain. For example, the genesis block has a height of zero because zero block preceded it.

## 高度 / 区块高度

区块链上指定区块前的区块数。
例如，因为创世区块前面没有区块，所以其高度为 0。

> ## Block reward
> 
> The amount that miners may claim as a reward for creating a block. Equal to the sum of the block subsidy (newly available satoshis) plus the transactions fees paid by transactions included in the block.
> 
> **Not to be confused with:** Block subsidy, Transaction fees

## 区块奖励

矿工可能要求一定金额作为创建区块的奖励。
等于区块补贴（新的可用的聪）加区块交易支付的交易费的总和。

**不要混淆：** 区块补贴，交易费

> ## Maximum Block Size
> 
> The maximum size of a block according to the consensus rules. The current block size limit is 4 million weight units (1 million vbytes).
> 
> **Not to be confused with:** Block, Blockchain, Blockchain size

## 最大区块大小

共识规则允许一个区块的以字节为单位的最大尺寸。
当前区块大小限制是 1,000,000 字节。

**不要混淆：** 区块，区块链，区块链大小

> ## Blocks-first sync
> 
> Synchronizing the block chain by downloading each block from a peer and then validating it.
> 
> **Not to be confused with:** Headers-first sync

## 区块初次同步

通过从对端下载每个区块并进行验证来同步区块链。

**不要混淆：** 区块头初次同步

> ## Bloom filter
> 
> A filter used primarily by SPV clients to request only matching transactions and merkle blocks from full nodes.
> 
> **Not to be confused with:** Bloom filter (general computer science term, of which Bitcoin’s bloom filters are a specific implementation)

## 布鲁姆过滤器

主要由 SPV 客户端使用过滤器，用来从全节点请求匹配的交易和默克尔区块。

**不要混淆：** 布鲁姆过滤器（通用计算机科学条目，比特币的布鲁姆过滤器是一个特定的实现）

> ## Chain code
> 
> In HD wallets, 256 bits of entropy added to the public and private keys to help them generate secure child keys; the master chain code is usually derived from a seed along with the master private key

## 链代码

在 HD 钱包中，256 位熵被添加到公钥和私钥中，来帮助它们生成安全的子密钥；
主链代码通常派生自携带主私钥的种子。

> ## Change address / Change output
> 
> An output in a transaction which returns satoshis to the spender, thus preventing too much of the input value from going to transaction fees.
> 
> **Not to be confused with:** Address reuse

## 找零地址 / 找零输出

交易的输出把聪返给付款人，从而防止过多的输入转到交易费中。

**不要混淆：** 地址重用

> ## Child key / Child public key / Child private key
> 
> In HD wallets, a key derived from a parent key. The key can be either a private key or a public key, and the key derivation may also require a chain code.
> 
> **Not to be confused with:** Public key (derived from a private key, not a parent key)

## 子密钥 / 公共子密钥 / 私有子密钥

在 HD 钱包中，从父密钥派生的密钥。
该密钥可以是私钥，也可以是公钥，密钥的推导（派生）可能需要链代码。

**不要混淆：** 公钥（从私钥派生，非父密钥）

> ## Coinbase
> 
> A special field used as the sole input for coinbase transactions. The coinbase allows claiming the block reward and provides up to 100 bytes for arbitrary data.
> 
> **Not to be confused with:** Coinbase transaction, Coinbase.com

## 创币交易字段

一个特殊的字段，作为创币交易的唯一输入。
创币交易字段允许声明区块奖励并提供高达 100 个字节的任意数据。

**不要混淆：** 创币交易，Coinbase.com

> ## Coinbase transaction / Generation transaction
> 
> The first transaction in a block. Always created by a miner, it includes a single coinbase.
> 
> **Not to be confused with:** Coinbase (the unique part of a coinbase transaction)

## 创币交易 / 创造交易

区块的第一笔交易。
该区块总是通过矿工创建，它包含一个创币交易字段。

**不要混淆：** 创币交易字段（创币交易的一部分）

> ## CompactSize
> 
> A type of variable-length integer commonly used in the Bitcoin P2P protocol and Bitcoin serialized data structures.
> 
> **Not to be confused with:** VarInt (a data type Bitcoin Core uses for local data storage), Compact (the data type used for nBits in the block header)

## 压缩大小

一种长度可变的整数，常用于比特币 P2P 协议和比特币序列化的数据结构。

**不要混淆：** 整形变量（比特币核心用于本地数据存储的数据类型），压缩（用于区块头中的难度对应值 nBits 的数据类型）

> ## Compressed public key
> 
> An ECDSA public key that is 33 bytes long rather than the 65 bytes of an uncompressed public key.

## 压缩的公钥

33 字节的椭圆曲线公钥而非 65 字节的未压缩公钥。

> ## Confirmation score / Confirmations / Confirmed transaction / Unconfirmed transaction
> 
> A score indicating the number of blocks on the best block chain that would need to be modified to remove or modify a particular transaction. A confirmed transaction has a confirmation score of one or higher.

## 确认分数 / 确认数 / 确认的交易 / 未确认的交易

分数表明在最佳区块链上需要修改的区块数，用来移除或修改特定的交易。
确认的交易有一个或更高的确认分数。

> ## Consensus
> 
> When several nodes (usually most nodes on the network) all have the same blocks in their locally-validated best block chain.
> 
> **Not to be confused with:** Social consensus (often used in discussion among developers to indicate that most people agree with a particular plan), Consensus rules (the rules that allow nodes to maintain consensus)

## 共识

当几个节点（通常是网络上的大部分节点）在它们本地验证过的最佳区块链中都有相同的区块。

**不要混淆：** 社会共识（通常用于开发人员之间的讨论，以表明大多数人同意某个特定的方案），共识规则（允许节点维持共识的规则）

> ## Consensus rules
> 
> The block validation rules that full nodes follow to stay in consensus with other nodes.
> 
> **Not to be confused with:** Consensus (what happens when nodes follow the same consensus rules)

## 共识规则

全节点遵循与其他节点相同的共识的区块验证规则。

**不要混淆：** 共识（当节点遵循相同的共识规则就达成了共识）

> ## Child pays for parent / CPFP / Ancestor mining
> 
> Selecting transactions for mining not just based on their fees but also based on the fees of their ancestors (parents) and descendants (children).
> 
> **Not to be confused with:** Replace by Fee, RBF

## 孩子为父母付钱 / CPFP / 祖先挖矿

挖矿选择的交易不仅基于它们的交易费，还基于它们祖先（父母）交易和后代（孩子）交易的交易费。

**不要混淆：** 通过费用替代，RBF

> ## Denomination / Bitcoins / Satoshis
> 
> Denominations of Bitcoin value, usually measured in fractions of a bitcoin but sometimes measured in multiples of a satoshi. One bitcoin equals 100,000,000 satoshis.
> 
> **Not to be confused with:** Binary bits, a unit of data with two possible values

## 衡量单位 / 比特币 / 聪

比特币值的衡量单位，通常用一些比特币来衡量，但有时用聪的数倍来衡量。
一个比特币等于 100,000,000 聪。

**不要混淆：** 二进制位，有两种可能取值的数据单元。

> ## Difficulty / Network difficulty
> 
> How difficult it is to find a block relative to the difficulty of finding the easiest possible block. The easiest possible block has a proof-of-work difficulty of 1.
> 
> **Not to be confused with:** Target threshold (the value from which difficulty is calculated)

## 难度 / 网络难度

相对找到最简单的区块的难度，找到一个区块有多难。
最简单区块的工作量证明难度为 1。

**不要混淆：** 目标阈值（计算难度得到的值）

> ## DNS seed
> 
> A DNS server which returns IP addresses of full nodes on the Bitcoin network to assist in peer discovery.
> 
> **Not to be confused with:** HD wallet seeds

## DNS 种子

DNS 域名解析服务器返回比特币网络上的全节点的 IP 地址集来帮助进行对端的发现。

**不要混淆：** HD 钱包种子

> ## Double spend
> 
> A transaction that uses the same input as an already broadcast transaction. The attempt of duplication, deceit, or conversion, will be adjudicated when only one of the transactions is recorded in the blockchain.

## 双重花费

使用与已经广播交易相同输入的交易。
当有一个交易已经记录在区块链上时，将被当作重复，欺骗或转换的尝试。

> ## Escrow contract
> 
> A transaction in which a spender and receiver place funds in a 2-of-2 (or other m-of-n) multisig output so that neither can spend the funds until they’re both satisfied with some external outcome.

## 托管合同

一种交易，付款人和收款人把资金放入 2 比 2（或其他的 m 比 n）的多签输出中，均不会花费资金，直到都满足某些外部条件。

> ## Extended key / Public extended key / Private extended key
> 
> In the context of HD wallets, a public key or private key extended with the chain code to allow them to derive child keys.

## 扩展的密钥 / 扩展的公钥 / 扩展的私钥

在 [HD 钱包](#HDWallet)的情况中，使用[链编码](#ChainCode)扩展的[公钥](#PublicKey)或[私钥](#PrivateKey)允许它们导出[子密钥](#ChildKey)。

> ## Fork
> 
> When two or more blocks have the same block height, forking the block chain. Typically occurs when two or more miners find blocks at nearly the same time. Can also happen as part of an attack.
> 
> **Not to be confused with:** Hard fork (a change in consensus rules that breaks security for nodes that don’t upgrade), Soft fork (a change in consensus rules that weakens security for nodes that don’t upgrade), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers)

## 分叉

当 2 个或 2 个以上的区块有相同的高度时，区块链分叉。
特别是发生在 2 个或 2 个以上的矿工几乎同时找到区块时。
也可以用于攻击。

**不要混淆：**
硬分叉（共识规则的变化会破坏不升级节点的安全性）,
软分叉（共识规则的变化会削弱不升级节点的安全性）,
软件分支（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git 分支（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

> ## Genesis block / Block 0
> 
> The first block in the Bitcoin block chain.
> 
> **Not to be confused with:** Generation transaction (the first transaction in a block)

## 创世区块 / 0 号区块

比特币区块链上的第一个区块。

**不要混淆：** 创币交易（区块上的第一笔交易）

> ## Hard fork
> 
> A permanent divergence in the block chain, commonly occurs when non-upgraded nodes can’t validate blocks created by upgraded nodes that follow newer consensus rules.
> 
> **Not to be confused with:** Fork (a regular fork where all nodes follow the same consensus rules, so the fork is resolved once one chain has more proof of work than another), Soft fork (a temporary divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers

## 硬分叉

区块链上永久性的分叉，通常发生在未升级的节点不能验证通过遵守新的共识规则的升级的节点创建的区块时。

**不要混淆：**
分叉（所有节点遵循相同的共识规则的常规的分叉，一旦一条链的工作量证明高于另一条，该分叉被解决）,
软分叉（区块链上由未升级的节点不遵循新的共识规则导致的临时分叉）,
软件分支（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git 分支（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

> ## Hardened extended key
> 
> A variation on HD wallet extended keys where only the hardened extended private key can derive child keys. This prevents compromise of the chain code plus any private key from putting the whole wallet at risk.

## 加固的扩展密钥

HD 钱包扩展密钥的一个变体，只有硬化的扩展私钥才能生成子密钥。
防止链代码加任何私钥的组合使整个钱包处于风险中。

> ## HD protocol / HD wallet
> 
> The Hierarchical Deterministic (HD) key creation and transfer protocol (BIP32), which allows creating child keys from parent keys in a hierarchy. Wallets using the HD protocol are called HD wallets.

## HD 协议 / HD 钱包

分层确定性（HD）密钥创建和传输协议（BIP32），允许从父密钥的层次创建子密钥。
使用 HD 协议的钱包称为 HD 钱包。

> ## HD wallet seed / Root seed
> 
> A potentially-short value used as a seed to generate the master private key and master chain code for an HD wallet.
> 
> **Not to be confused with:** Mnemonic code / mnemonic seed (a binary root seed formatted as words to make it easier for humans to transcribe and possibly remember)

## HD 钱包种子 / 根种子

用作为 HD 钱包生成主私钥和主链代码的种子的潜在短值。

**不要混淆：** 助记代码 / 助记种子（二进制根种子格式化为单词，使人们更容易记录和记忆）

> ## Header chain / Best header chain
> 
> A chain of block headers with each header linking to the header that preceded it; the most-difficult-to-recreate chain is the best header chain
> 
> **Not to be confused with:** Block chain

## 区块头链 / 最佳区块头链

区块头链，每个区块头都链接其前面的区块头；
最难重建的链是最佳区块头链。

**不要混淆：** 区块链

> ## Headers-first sync
> 
> Synchronizing the block chain by downloading block headers before downloading the full blocks.
> 
> **Not to be confused with:** Blocks-first sync (Downloading entire blocks immediately without first getting their headers)

## 区块头初次同步

通过在下载整个区块前下载区块头来同步区块链。

**不要混淆：** 区块初次同步（直接下载整个区块，不首先获取它们的头）

> ## High-priority transaction / Free transaction
> 
> Transactions that don’t have to pay a transaction fee because their inputs have been idle long enough to accumulated large amounts of priority. Note: miners choose whether to accept free transactions.

## 高优先级交易 / 免费的交易

没有支付交易费的交易，因为他们的输入空闲时间够长足以积累大量的优先级。
注：矿工选择是否接受免费交易。

> ## Initial block download / IBD
> 
> The process used by a new node (or long-offline node) to download a large number of blocks to catch up to the tip of the best block chain.
> 
> **Not to be confused with:** Blocks-first sync (syncing includes getting any amount of blocks; IBD is only used for large numbers of blocks)

## 初始化区块下载 / IBD

用于通过新节点（或长时间离线的节点）下载大量的区块来赶上最佳区块连的链尖的过程。

**不要混淆：** 区块初次同步（同步包含获得任意数量的区块；IBD 仅用于大量区块）

> ## Input / TxIn
> 
> An input in a transaction which contains three fields: an outpoint, a signature script, and a sequence number. The outpoint references a previous output and the signature script allows spending it.

## 交易输入 / TxIn

一笔交易的输入包含 3 个字段：输出点，签名脚本，和序列号。
输出点引用前一笔交易输出且签名脚本允许花费它。

> ## Internal byte order
> 
> The standard order in which hash digests are displayed as strings—the same format used in serialized blocks and transactions.
> 
> **Not to be confused with:** RPC byte order (where the byte order is reversed)

## 内部字节序

显示为字符串的散列摘要的标准字节序—相同的格式用于序列化的区块和交易。

**不要混淆：** RPC 字节序（反转的字节序）

> ## Inventory
> 
> A data type identifier and a hash; used to identify transactions and blocks available for download through the Bitcoin P2P network.
> 
> **Not to be confused with:** Inv message (one of the P2P messages that transmits inventories)

## 库存

一种数据类型标识和一个散列值；
用于识别通过比特币 P2P 网络下载的交易和可用的区块。

**不要混淆：** 库存消息（传输库存的 P2P 消息）

> ## Locktime / nLockTime
> 
> Part of a transaction which indicates the earliest time or earliest block when that transaction may be added to the block chain.

## 锁定时间 / nLockTime

交易的一部分用于表明交易可能被添加到区块链的最早时间或最早的区块。

> ## Mainnet
> 
> The original and main network for Bitcoin transactions, where satoshis have real economic value.
> 
> **Not to be confused with:** Testnet (an open network very similar to mainnet where satoshis have no value), Regtest (a private testing node similar to testnet)

## 主网

比特币交易的原始和主要网络，其中的聪有真正经济价值。

**不要混淆：** 公共测试网（非常类似主网的开放网络，其中的聪没有价值），回归测试网（类似于测试网的私有测试节点）

> ## Transaction malleability / Transaction mutability
> 
> The ability of someone to change (mutate) unconfirmed transactions without making them invalid, which changes the transaction’s txid, making child transactions invalid.
> 
> **Not to be confused with:** BIP62 (a proposal for an optional new transaction version that reduces the set of known mutations for common transactions)

## 交易可变性 / 交易延展性

某人改变的未确认交易且不使其无效的能力，这会改变交易号，使子交易无效。

**不要混淆：** BIP62（可选的新交易版本的提议，减少了常见交易的已知变化集）

> ## Miner-activated soft fork / MASF
> 
> A Soft Fork activated by through miner signalling.
> 
> **Not to be confused with:** User Activated Soft Fork (a soft fork activated by flag day or node enforcement instead of miner signalling.), Fork (a regular fork where all nodes follow the same consensus rules, so the fork is resolved once one chain has more proof of work than another), Hard fork (a permanent divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Soft fork (a temporary divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers

## 矿工激活的软分叉 / MASF

通过矿工信号激活的软分叉。

**不要混淆：**
用户激活的软分叉（通过标记日或节点强制而非矿工信号激活的软分叉），
分叉（所有节点遵循相同的共识规则的常规的分叉，一旦一条链的工作量证明高于另一条，该分叉被解决），
硬分叉（区块链上因未升级的节点不遵循新的共识规则导致的永久性的分叉），
软分叉（区块链上由未升级的节点不遵循新的共识规则导致的临时分叉），
软件分支（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库），
Git 分支（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

> ## Master chain code / Master private key
> 
> In HD wallets, the master chain code and master private key are the two pieces of data derived from the root seed.

## 主链代码 / 主私钥

在 HD 钱包中，主链代码和主私钥是从根种子派生的 2 个数据。

> ## Merkle block
> 
> A partial merkle tree connecting transactions matching a bloom filter to the merkle root of a block.
> 
> **Not to be confused with:** MerkleBlock message (a P2P protocol message that transmits a merkle block)

## 默克尔区块

连接匹配布鲁姆过滤器的交易到区块的默克尔树根的部分默克尔树。

**不要混淆：** 默克尔区块消息（传输默尔克区块的 P2P 协议消息）

> ## Merkle root
> 
> The root node of a merkle tree, a descendant of all the hashed pairs in the tree. Block headers must include a valid merkle root descended from all transactions in that block.
> 
> **Not to be confused with:** Merkle tree (the tree of which the merkle root is the root node), Merkle block (a partial merkle branch connecting the root to one or more leaves [transactions])

## 默克尔树根

默克尔树的根节点，树中所有哈希对的后代。
区块头必须包含一个该区块中所有交易的有效的默克尔树根。

**不要混淆：** 默克尔树（默克尔树根是根节点的树），默克尔区块（连接根到一笔或多笔叶子交易的部分默尔克分支）

> ## Merkle tree
> 
> A tree constructed by hashing paired data (the leaves), then pairing and hashing the results until a single hash remains, the merkle root. In Bitcoin, the leaves are almost always transactions from a single block.
> 
> **Not to be confused with:** Partial merkle branch (a branch connecting one or more leaves to the root), Merkle block (a partial merkle branch connecting one or more transactions from a single block to the block merkle root)

## 默克尔树

通过散列配对的数据（叶子）构建的树，然后对结果进行配对和散列直到剩余单个散列值，即默尔克树根。
在比特币中，叶子几乎总是来自单个区块的交易。

**不要混淆：** 部分默克尔分支（连接一个或多个叶子到根的分支），默克尔区块（连接一笔或多笔交易从单个区块到区块默尔克根的部分默尔克分支）

> ## Message header
> 
> The four header fields prefixed to all messages on the Bitcoin P2P network.

## 消息头

比特币 P2P 网络上所有消息前缀的 4 个头部字段。

> ## Minimum relay fee / Relay fee
> 
> The minimum transaction fee a transaction must pay (if it isn’t a high-priority transaction) for a full node to relay that transaction to other nodes. There is no one minimum relay fee—each node chooses its own policy.
> 
> **Not to be confused with:** Transaction fee (the minimum relay fee is a policy setting that filters out transactions with too-low transaction fees)

## 最小中继费 / 中继费

最小交易费，用于中继到其他节点的交易必须支付给全节点的费用（如果它不是高优先级交易）。
并没有最低中继费—每个节点选择它自己的决策。

**不要混淆：** 交易费（最小中继费是过滤过低交易费交易的决策选项）

> ## Mining / Miner
> 
> Mining is the act of creating valid Bitcoin blocks, which requires demonstrating proof of work, and miners are devices that mine or people who own those devices.

## 挖矿 / 矿工

挖矿是创建有效的比特币区块的行为，需要验证工作量证明，且矿工是挖矿的设备或拥有那些设备的人。

> ## Multisig / Bare multisig
> 
> A pubkey script that provides n number of pubkeys and requires the corresponding signature script provide m minimum number signatures corresponding to the provided pubkeys.
> 
> **Not to be confused with:** P2SH multisig (a multisig script contained inside P2SH), Advanced scripts that require multiple signatures without using OP_CHECKMULTISIG or OP_CHECKMULTISIGVERIFY

## 多签 / 足够的多签

公钥脚本提供给 n 个公钥并需要对应的签名脚本提供对应提供公钥的最少 m 个签名。

**不要混淆：** 包含在 P2SH 里的多签脚本，需要多个签名而不用 OP_CHECKMULTISIG 或 OP_CHECKMULTISIGVERIFY 的高级脚本

> ## nBits / Target
> 
> The target is the threshold below which a block header hash must be in order for the block to be valid, and nBits is the encoded form of the target threshold as it appears in the block header.
> 
> **Not to be confused with:** Difficulty (a number measuring the difficulty of finding a header hash relative to the difficulty of finding a header hash with the easiest target)

## 难度对应值 / 目标值

该目标值是低于必须使区块有效的区块头散列值的阈值，并且难度对应值出现在区块头中，是目标阈值的编码形式。

**不要混淆：** 难度（一个数字，用于衡量寻找区块头哈希的难度，相对于最容易目标值寻找区块头哈希的难度）

> ## Node / Full node / Archival node / Pruned node / Peer
> 
> A computer that connects to the Bitcoin network.
> 
> **Not to be confused with:** Lightweight node, SPV node

## 节点 / 全节点 / 归档的节点 / 已修剪的节点 / 对端

连接到比特币网络的计算机。

**不要混淆：** 轻量节点，SPV 节点

> ## Null data transaction / OP_RETURN transaction / Data carrier transaction
> 
> A transaction type relayed and mined by default in Bitcoin Core 0.9.0 and later that adds arbitrary data to a provably unspendable pubkey script that full nodes don’t have to store in their UTXO database.
> 
> **Not to be confused with:** OP_RETURN (an opcode used in one of the outputs in an OP_RETURN transaction)

## 空数据交易 / OP_RETURN 交易 / 数据传输交易

在比特币核心 0.9.0 版或更新的版本中，中继和挖矿的交易类型，添加任意数据到可证明不可花费的公钥脚本，全节点不必存储在它们的 UTXO 数据库中。

**不要混淆：** OP_RETURN（用于 OP_RETURN 交易一个输出的操作码）

> ## Opcode / Data-pushing opcode / Non-data-pushing opcode
> 
> Operation codes from the Bitcoin Script language which push data or perform functions within a pubkey script or signature script.

## 操作码 / 数据推送操作码 / 非数据推送操作码

来自比特币脚本语言的操作码在公钥脚本或签名脚本内部推送数据或执行函数。

> ## Orphan block
> 
> Blocks whose parent block has not been processed by the local node, so they can’t be fully validated yet.
> 
> **Not to be confused with:** Stale block

## 孤儿区块

父区块没有被本地节点处理的区块，以至于它们还不能被完全验证。

**不要混淆：** 陈旧的区块

> ## Outpoint
> 
> The data structure used to refer to a particular transaction output, consisting of a 32-byte TXID and a 4-byte output index number (vout).
> 
> **Not to be confused with:** Output (an entire output from a transaction), TxOut (same as output)

## 输出点

用于引用特定交易输出的数据结构，由 32 字节的交易索引和 4 字节的输出索引序号（vout）组成。

**不要混淆：** 交易输出，TxOut（和输出一样）

> ## Output / TxOut
> 
> An output in a transaction which contains two fields: a value field for transferring zero or more satoshis and a pubkey script for indicating what conditions must be fulfilled for those satoshis to be further spent.
> 
> **Not to be confused with:** Outpoint (a reference to a particular output)

## 输出 / 交易输出

一笔交易的输出包含 2 个字段：转账 0 或更多聪的字段和指明必须满足哪些条件才能进一步使用这些聪的公钥脚本。

**不要混淆：** 输出点（某交易输出的引用）

> ## P2PKH address / P2PKH output
> 
> A Bitcoin payment address comprising a hashed public key, allowing the spender to create a standard pubkey script that Pays To PubKey Hash (P2PKH).
> 
> **Not to be confused with:** P2PK output (an output paying a public key directly), P2SH address, P2SH output (an address comprising a hashed script, and its corresponding output)

## P2PKH 地址 / P2PKH 输出

比特币付款地址，包含哈希的公钥，允许付款人创建标准的支付给公钥哈希（P2PKH）的公钥脚本。

**不要混淆：** P2PK 输出（直接支付给公钥的输出），P2SH 地址 / 输出（包括哈希的脚本和其相应的输出的地址）

> ## P2SH address / P2SH output
> 
> A Bitcoin payment address comprising a hashed script, allowing the spender to create a standard pubkey script that Pays To Script Hash (P2SH). The script can be almost any valid pubkey script.
> 
> **Not to be confused with:** P2PK output (an output paying a public key directly), P2PKH address, P2PKH output (an address comprising a hashed pubkey, and its corresponding output), P2SH multisig (a particular instance of P2SH where the script uses a multisig opcode)

## P2SH 地址 / P2SH 输出

比特币付款地址包含一个哈希的脚本，允许付款人创建一个标准的支付到脚本哈希（P2SH）的公钥脚本。
该脚本几乎可能是任何有效的公钥脚本。

**不要混淆：**
P2PK 输出（直接支付到公钥的输出），
P2PKH 地址 / 输出（由散列的公钥和其相应的输出组成的地址），
P2SH 多签（P2SH 特定的实例，其中脚本使用一个多签操作码）

> ## P2SH multisig
> 
> A P2SH output where the redeem script uses one of the multisig opcodes. Up until Bitcoin Core 0.10.0, P2SH multisig scripts were standard transactions, but most other P2SH scripts were not.
> 
> **Not to be confused with:** Multisig pubkey scripts (also called “bare multisig”, these multisig scripts don’t use P2SH encapsulation), P2SH (general P2SH, of which P2SH multisig is a specific instance that was special cased up until Bitcoin Core 0.10.0)

## P2SH 多签

P2SH 输出，其中兑换脚本使用其中一个多签操作码。
直到比特币核心 0.10.0 版，P2SH 多签脚本是标准交易，但大多数 P2SH 脚本不始。

**不要混淆：** 多签公钥脚本（也称作“裸多签”，这些多签脚本不使用 P2SH 封装）, P2SH（通用 P2SH，其中 P2SH 多签是比特币核心 0.10.0 版特殊情况下的特定实例）

> ## Parent key / Parent public key / Parent private key
> 
> In HD wallets, a key used to derive child keys. The key can be either a private key or a public key, and the key derivation may also require a chain code.
> 
> **Not to be confused with:** Public key (derived from a private key, not a parent key)

## 父钥 / 公共父密钥 / 私有父密钥

在 HD 钱包中，该密钥用于生成子密钥。
该密钥可能是私钥或公钥，且密钥的生成可能也需要链编码。

**不要混淆：** 公钥（从私钥派生，非父密钥）

> ## Payment protocol / Payment request
> 
> The deprecated protocol defined in BIP70 (and other BIPs) which lets spenders get signed payment details from receivers.
> 
> **Not to be confused with:** IP-to-IP payment protocol (an insecure, discontinued protocol included in early versions of Bitcoin)

## 支付协议 / 支付请求

该协议在 BIP70（和其他 BIPs）中定义，让付款人从收款人获取签名的支付细节。

**不要混淆：** IP 到 IP 支付协议（包含在比特币早期版本中的不安全，已停止的协议）

> ## Private key
> 
> The private portion of a keypair which can create signatures that other people can verify using the public key.
> 
> **Not to be confused with:** Public key (data derived from the private key), Parent key (a key used to create child keys, not necessarily a private key)

## 私钥

密钥对的私有部分，用于创建其他人都能使用公钥验证的签名。

**不要混淆：** 公钥（从私钥派生出的数据），父密钥（用于创建子密钥的密钥，不一定是私钥）

> ## Proof of work / POW
> 
> A hash below a target value which can only be obtained, on average, by performing a certain amount of brute force work—therefore demonstrating proof of work.

## 工作量证明 / POW

低于目标值的散列，一般只能通过执行一定量的暴力工作获得—因此论证了工作量证明。

> ## Pubkey script / ScriptPubKey
> 
> A script included in outputs which sets the conditions that must be fulfilled for those satoshis to be spent. Data for fulfilling the conditions can be provided in a signature script. Pubkey Scripts are called a scriptPubKey in code.
> 
> **Not to be confused with:** Pubkey (a public key, which can be used as part of a pubkey script but don’t provide a programmable authentication mechanism), Signature script (a script that provides data to the pubkey script)

## 公钥脚本 / 脚本公钥

包含在输出中的脚本，用于设置必须满足用于花费的聪。
在签名脚本中提供满足条件的数据。
公钥脚本在代码中被称为脚本公钥 "scriptPubKey"。

**不要混淆：** 公钥（用作公钥脚本的一部分但不提供可编程的身份验证机制），签名脚本（给公钥脚本提供数据的脚本）

> ## Public key
> 
> The public portion of a keypair which can be used to verify signatures made with the private portion of the keypair.
> 
> **Not to be confused with:** Private key (data from which the public key is derived), Parent key (a key used to create child keys, not necessarily a public key)

## 公钥

密钥对的公共部分，用于验证使用密钥对私有部分进行的签名。

**不要混淆：** 私钥（派生出公钥的数据），父密钥（用于创建子密钥的密钥，不一定是公钥）

> ## Replace by fee / RBF / Opt-in replace by fee
> 
> Replacing one version of an unconfirmed transaction with a different version of the transaction that pays a higher transaction fee. May use BIP125 signaling.
> 
> **Not to be confused with:** Child pays for parent, CPFP

## 通过交易费代替 / RBF / 通过交易费代替选择

使用支付更高交易费的不同版本的交易代替未确认交易的版本。
可以使用 BIP125 信号。

**不要混淆：** 孩子为父母付款，CPFP

> ## Redeem script / RedeemScript
> 
> A script similar in function to a pubkey script. One copy of it is hashed to create a P2SH address (used in an actual pubkey script) and another copy is placed in the spending signature script to enforce its conditions.
> 
> **Not to be confused with:** Signature script (a script that provides data to the pubkey script, which includes the redeem script in a P2SH input)

## 赎回脚本

功能上类似于公钥脚本的脚本。
其中一个副本用于创建 P2SH 地址（用于实际的公钥脚本），另一个副本放在支出签名脚本用来限制其条件。

**不要混淆：** 签名脚本（为公钥脚本提供数据的脚本，在 P2SH 输入中包含赎回脚本）

> ## Regtest / Regression test mode
> 
> A local testing environment in which developers can almost instantly generate blocks on demand for testing events, and can create private satoshis with no real-world value.
> 
> **Not to be confused with:** Testnet (a global testing environment which mostly mimics mainnet)

## 回归测试网 / 回归测试模式

开发人员能够立刻产生测试所需区块的本地测试环境，能够创建没有价值的私有聪。

**不要混淆：** 公共测试网（模仿主网的全球测试环境）

> ## RPC byte order
> 
> A hash digest displayed with the byte order reversed; used in Bitcoin Core RPCs, many block explorers, and other software.
> 
> **Not to be confused with:** Internal byte order (hash digests displayed in their typical order; used in serialized blocks and serialized transactions)

## RPC 字节序

逆序显示的哈希摘要；在比特币核心 RPCs，众多区块浏览器，和其他软件中使用。

**不要混淆：** 内部字节序（内部字节序，典型顺序显示的哈希摘要；用于序列化的区块和序列化的交易）

> ## Sequence number
> 
> Part of all transactions. A number intended to allow unconfirmed time-locked transactions to be updated before being finalized; not currently used except to disable locktime in a transaction
> 
> **Not to be confused with:** Output index number / vout (this is the 0-indexed number of an output within a transaction used by a later transaction to refer to that specific output)

## 序列号

所有交易的一部分。
一个数字，旨在允许锁定时间的未确认的交易在序列化前更新；
目前尚未使用，除非在交易中禁用锁定时间。

**不要混淆：** 输出索引数字（后面的交易用来引用特定输出的交易中的 0 索引号输出）

> ## Serialized block
> 
> A complete block in its binary format—the same format used to calculate total block byte size; often represented using hexadecimal.

## 序列化的区块

2 进制格式表示的完整的区块—相同的格式用于计算总区块字节大小；
常用 16 进制表示。

**同义词：** 原始区块

> ## Serialized transaction / Raw transaction
> 
> Complete transactions in their binary format; often represented using hexadecimal. Sometimes called raw format because of the various Bitcoin Core commands with “raw” in their names.

## 序列化的交易 / 原始交易

2 进制格式表示的完整交易；常用 16 进制表示。
有时称为原始格式，因为多种比特币核心命令名中都带有 "raw" 字样。

> ## SIGHASH_ALL
> 
> Default signature hash type which signs the entire transaction except any signature scripts, preventing modification of the signed parts.

## SIGHASH_ALL

签名除任意脚本签名的整个交易的默认的签名哈希类型，防止签名部分的修改。

> ## SIGHASH_ANYONECANPAY
> 
> A signature hash type which signs only the current input.
> 
> **Not to be confused with:** SIGHASH_SINGLE (which signs this input, its corresponding output, and other inputs partially)

## SIGHASH_ANYONECANPAY

仅签名当前输入的签名哈希类型。

**不要混淆：** SIGHASH_SINGLE（签名该输入对应的输出和其他部分输入）

> ## SIGHASH_NONE
> 
> Signature hash type which only signs the inputs, allowing anyone to change the outputs however they’d like.

## SIGHASH_NONE

仅签名输入的签名哈希类型，允许任何人改变他们想改变的输出。

> ## SIGHASH_SINGLE
> 
> Signature hash type that signs the output corresponding to this input (the one with the same index value), this input, and any other inputs partially. Allows modification of other outputs and the sequence number of other inputs.
> 
> **Not to be confused with:** SIGHASH_ANYONECANPAY (a flag to signature hash types that only signs this single input)

## SIGHASH_SINGLE

签名对应输入（具有相同索引值）的输出的签名哈希类型，该输入，和任意其他输入的一部分。允许其他输出和其他输入序列号的修改。

**不要混淆：** SIGHASH_ANYONECANPAY（仅签名该单个输入的签名哈希类型的标志）

> ## Signature
> 
> A value related to a public key which could only have reasonably been created by someone who has the private key that created that public key. Used in Bitcoin to authorize spending satoshis previously sent to a public key.

## 签名

与公钥相关的值，该公钥只能由拥有创建公钥的私钥的人来创建。
在比特币中用于在发送到公钥前验证花费的聪。

> ## Signature hash / Sighash
> 
> A flag to Bitcoin signatures that indicates what parts of the transaction the signature signs. (The default is SIGHASH_ALL.) The unsigned parts of the transaction may be modified.
> 
> **Not to be confused with:** Signed hash (a hash of the data to be signed), Transaction malleability / transaction mutability (although non-default sighash flags do allow optional malleability, malleability comprises any way a transaction may be mutated)

## 签名哈希

比特币签名的标志，表明签名签署的交易部分。
（默认是 SIGHASH_ALL）交易未签名的部分可能被修改。

**不要混淆：** 已签名的哈希，交易可变性 / 交易延展性（尽管非默认的签名哈希标志允许可选的延展性，延展性包含交易可能发生变化的任何方式）

> ## Signature script / ScriptSig
> 
> Data generated by a spender which is almost always used as variables to satisfy a pubkey script. Signature Scripts are called scriptSig in code.
> 
> **Not to be confused with:** ECDSA signature (a signature, which can be used as part of a pubkey script in addition to other data)

## 签名脚本 / 脚本签名

通过付款人生成的数据，几乎总是用作满足公钥脚本的变量。
签名脚本在代码中又称为脚本签名。

**不要混淆：** 椭圆曲线签名（一种签名，除了其他数据，能用于公钥脚本的一部分）

> ## SPV / Simplified Payment Verification / Lightweight client / Thin client
> 
> A method for verifying if particular transactions are included in a block without downloading the entire block. The method is used by some lightweight Bitcoin clients.

## SPV / 简单支付验证 / 轻量级客户端 / 瘦客户端

用于验证某笔交易是否包含在某个未下载完整的区块中。
该方法用于一些轻量级比特币客户端。

> ## Soft fork
> 
> A softfork is a change to the bitcoin protocol wherein only previously valid blocks/transactions are made invalid. Since old nodes will recognise the new blocks as valid, a softfork is backward-compatible.
> 
> **Not to be confused with:** Fork (a regular fork where all nodes follow the same consensus rules, so the fork is resolved once one chain has more proof of work than another), Hard fork (a permanent divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers

## 软分叉

软分叉是比特币协议的改变，其中只有之前有效的区块/交易变得无效了。
因为旧的节点将仍认为新区块是有效的，所以软分叉是向后兼容的。

**不要混淆：**
分叉（所有节点遵循相同的共识规则的常规的分叉，一旦一条链的工作量证明高于另一条，该分叉被解决），
硬分叉（区块链上因未升级的节点不遵循新的共识规则导致的永久性的分叉），
软件分支（当一个或多个开发人员与其他开发人员永久性地分开开发一份代码），
Git 分支（当一个或多个开发人员与其他开发人员临时分开开发一份代码）

> ## Stale block
> 
> Blocks which were successfully mined but which aren’t included on the current best block chain, likely because some other block at the same height had its chain extended first.
> 
> **Not to be confused with:** Orphan block (a block whose previous (parent) hash field points to an unknown block, meaning the orphan can’t be validated)

## 旧的区块

成功挖出但没有包含在当前最佳区块链上的区块，可能是因为在相同高度的其他区块首先扩展链。

**不要混淆：** 孤儿区块（该区块的前一个区块哈希域指向一个未知的区块，意味着孤儿块不能被验证）

> ## Standard Transaction
> 
> A transaction that passes Bitcoin Core’s IsStandard() and IsStandardTx() tests. Only standard transactions are mined or broadcast by peers running the default Bitcoin Core software.

## 标准交易

传递给比特币核心 IsStandard 和 IsStandardTx 测试的交易。
只有标准交易通过运行默认比特币核心软件的对端节点挖矿或广播。

> ## Start string / Network magic
> 
> Four defined bytes which start every message in the Bitcoin P2P protocol to allow seeking to the next message.

## 起始字符串 / 网络魔数

在比特币 P2P 网络协议中定义的每条消息的 4 个字节的头部，用来寻找下一条消息。

> ## Testnet
> 
> A global testing environment in which developers can obtain and spend satoshis that have no real-world value on a network that is very similar to the Bitcoin mainnet.
> 
> **Not to be confused with:** Regtest (a local testing environment where developers can control block generation)

## 公共测试网

开发人员能够在类似于比特币主网的网络上获得并花费没有真正价值的聪的全球测试环境。

**不要混淆：** 回归测试网络（开发人员可控制区块生成的本地测试环境）

> ## Token
> 
> A token is a programmable digital asset with its own codebase that resides on an already existing block chain. Tokens are used to help facilitate the creation of decentralized applications.
> 
> **Not to be confused with:** Bitcoins, Satoshis, Security token, Denominations

## 代币

代币是驻留在现存区块链中的具有其基本代码的可编程数字资产。
代币有助于促进去中心化应用的创建。

**不要混淆：** 比特币，聪，安全代币，衡量单位

> ## Transaction fee / Miners fee
> 
> The amount remaining when the value of all outputs in a transaction are subtracted from all inputs in a transaction; the fee is paid to the miner who includes that transaction in a block.
> 
> **Not to be confused with:** Minimum relay fee (the lowest fee a transaction must pay to be accepted into the memory pool and relayed by Bitcoin Core nodes)

## 交易费 / 矿工费

一笔交易的全部输入减去全部输出值的剩余金额；
该费用支付给包含该交易到区块的矿工。

**不要混淆：** 最小中继费（接收一笔交易到内存池并通过比特币核心节点中继必须支付的最低费用）

> ## Txid
> 
> An identifier used to uniquely identify a particular transaction; specifically, the sha256d hash of the transaction.
> 
> **Not to be confused with:** Outpoint (the combination of a txid with a vout used to identify a specific output)

## 交易号

用于唯一标示特定交易的标识符；
具体来说，是交易的双 sha256 散列。

**不要混淆：** 输出点（交易号和输出集的联合体，用于识别指定输出）

> User-activated soft fork / UASF
> 
> A Soft Fork activated by flag day or node enforcement instead of miner signalling.
> 
> **Not to be confused with:** Miner Activated Soft Fork (a soft fork activated through miner signalling), Fork (a regular fork where all nodes follow the same consensus rules, so the fork is resolved once one chain has more proof of work than another), Hard fork (a permanent divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Soft fork (a temporary divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers

## 用户激活的软分叉 / UASF

通过标志日或节点强制代替矿工信号激活的软分叉。

**不要混淆：**
矿工激活的软分叉（通过矿工信号激活的软分叉），
分叉（所有节点遵循相同的共识规则的常规的分叉，一旦一条链的工作量证明高于另一条，该分叉被解决），
硬分叉（区块链上因未升级的节点不遵循新的共识规则导致的永久性的分叉），
软分叉（区块链上由未升级的节点不遵循新的共识规则导致的临时分叉），
软件分支（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库），
Git 分支（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

> ## UTXO
> 
> An Unspent Transaction Output (UTXO) that can be spent as an input in a new transaction.
> 
> **Not to be confused with:** Output (any output, whether spent or not. Outputs are a superset of UTXOs)

## 未花费的交易输出

可作为一笔交易输入的可花费的未花费的交易输出（UTXO）。

**不要混淆：** 输出（任意输出，包含花费和未花费的。输出是 UTXO 的超集，UTXO 是输出的子集）

> ## Wallet
> 
> Software that stores private keys and monitors the block chain (sometimes as a client of a server that does the processing) to allow users to spend and receive satoshis.
> 
> **Not to be confused with:** HD wallet (a protocol that allows all of a wallet’s keys to be created from a single seed)

## 钱包

存储私钥和区块链镜像的软件（有时作为执行处理的服务器的客户端），允许用户花费和接收聪。

**不要混淆：** HD 钱包（允许钱包从单个种子创建全部密钥的协议，使用该协议的钱包）

> ## WIF / Wallet Import Format
> 
> A data interchange format designed to allow exporting and importing a single private key with a flag indicating whether or not it uses a compressed public key.
> 
> **Not to be confused with:** Extended private keys (which allow importing a hierarchy of private keys)

## WIF / 钱包导入格式

一种数据交换格式，旨在允许导出和导入单个私钥，并带有指明其是否使用压缩公钥的标志。

**不要混淆：** 扩展的私钥（允许导入私钥的层次体系）

> ## Watch-only address
> 
> An address or pubkey script stored in the wallet without the corresponding private key, allowing the wallet to watch for outputs but not spend them.

## Watch-only 地址

钱包中不带相应私钥的地址或公钥脚本，允许钱包监视其输出但不能花费它们。

## 参考链接

* [Developer Glossary - Bitcoin](https://developer.bitcoin.org/glossary.html){:target="_blank"}
