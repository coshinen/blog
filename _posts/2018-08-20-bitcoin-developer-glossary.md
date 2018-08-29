---
layout: post
title:  "比特币开发者术语表"
date:   2018-08-20 22:08:57 +0800
author: mistydew
categories: Blockchain Bitcoin 译文
tags: 区块链 比特币 术语表
---
这是一个专业术语汇编。普通用户应该使用[词汇表页面](/2018/08/21/some-bitcoin-words-you-might-hear)。
<!-- excerpt -->

## 51% Attack（百分之 51 攻击）

**定义**：控制大多数网络哈希率的某人修改交易历史并阻止新交易确认的能力。

**同义词**：51 percent attack（百分之 51 攻击）, Majority Hash Rate attack（多数攻击）

## Payment Addresses（付款地址）

**定义**：使用 [`base58check`](#Base58check) 格式化的 20 个字节的哈希值，用来生成 `P2PKH` 或 `P2SH` 比特币地址。
目前用户交换支付信息的最常见方式。

**同义词**：Address（地址）

**不要混淆**：IP address

## Child Pays For Parent, CPFP（孩子为父母付钱）

**定义**：选择挖矿交易不仅基于它们的交易费，还基于它们祖先（父母）和后代（孩子）的交易费。

**同义词**：Ancestor mining（祖先挖矿）

**不要混淆**：Replace by Fee, RBF

## Node（节点）

**定义**：连接到比特币网络的计算机。

**同义词**：Full Node（全/完整节点）, Archival Node（档案节点）, Pruned Node（修剪节点）, Peer（对端）

**不要混淆**：Lightweight node（轻量级节点）, SPV node

## M-of-N Multisig, Multisig Output（多签输出）

**定义**：公钥脚本提供给 n 个公钥并需要对应的签名脚本提供对应提供公钥的最少 m 个签名。

**同义词**：Multisig（多签）, Bare multisig

**不要混淆**：P2SH multisig（包含在 P2SH 里的多签脚本）, 需要多个签名而不用 `OP_CHECKMULTISIG` 或 `OP_CHECKMULTISIGVERIFY`

## Base58check（Base58 编码）

**定义**：比特币中用于转换 160 位的哈希值到 P2PKH 和 P2SH 地址的方法。
也用于比特币的其他部分，例如用于 WIP 格式备份的编码私钥。与其他的 base58 实现不同。

**同义词**：Bitcoin Address Encoding（比特币地址编码）

**不要混淆**：P2PKH address, P2SH address, IP address

## Block Chain（区块链）

**定义**：一个区块链，每个区块引用它前面的区块。最难重建的链是最佳区块链。

**同义词**：Best block chain（最佳区块链）

**不要混淆**：Header chain（区块头链）

## Header Chain（区块头链）

**定义**：一个区块头链，每个区块头链接前面的区块头；最难重建的链是最佳区块头链。

**同义词**：Best header chain（最佳区块头链）

**不要混淆**：Block chain（区块链）

## Denominations（衡量单位）

**定义**：比特币值的衡量单位，通常用一些比特币来衡量，但有时用聪的数倍来衡量。
一个比特币等于 100,000,000 聪。

**同义词**：Bitcoins（比特币）, Satoshis（聪）

**不要混淆**：二进制位，有两种可能取值的数据单元。

## Block（区块）

**定义**：一笔或多笔交易以区块头开头并受工作量证明保护。区块是存储在区块链上的数据。

**同义词**：Block of transactions（交易区块）

## Genesis Block（创世区块）

**定义**：比特币区块链上的第一个区块。

**同义词**：Block 0（0 号区块，高度为 0 的区块）

**不要混淆**：Generation transaction（创币交易，区块上的第一笔交易）

## Block Header（区块头）

**定义**：属于单个区块的 80 个字节的区块头，重复散列来创建工作量证明。

**同义词**：Header（头部）

## Block Chain Height（区块链高度）

**定义**：区块链上特定区块前的区块数。例如，创世区块高度为 0，因为它前面有0 个区块。

**同义词**：Height（高度）, Block height（区块高度）

## Block Reward（区块奖励）

**定义**：矿工可能要求一定金额作为创建一个区块的奖励。
等于区块补贴（新的可用的聪）加包含在区块中的交易支付的交易费的总和。

**同义词**：Block miner reward（区块矿工奖励）

**不要混淆**：Block subsidy（区块补贴，创币交易）, Transaction fees（交易费）

## Blocks-First（区块首次同步）

**定义**：通过从对端下载每个区块并进行验证来同步区块链。

**同义词**：BLocks-first sync

**不要混淆**：Headers-first sync（区块头首次同步）

## Bloom Filter（布鲁姆过滤器）

**定义**：主要由 SPV 客户端使用过滤器，用来从全节点请求匹配的交易并默尔克区块。

**不要混淆**：Bloom filter（通用计算机科学条目，比特币的布鲁姆过滤器是一个特定的实现）

## Chain Code（链编码）

**定义**：在 HD 钱包中，256 位熵被添加到公钥和私钥中，来帮助它们生成安全的子密钥；
主链编码通常继承主私钥的种子。

**同义词**：HD wallet chain code（HD 钱包链编码）

## Change（找零）

**定义**：交易的输出把聪返给消费者，从而防止过多的输入转到交易费中。

**同义词**：Change address（找零地址）, Change output（找零输出）

**不要混淆**：Address reuse（地址重用）

## Child Key（子密钥）

**定义**：在 HD 钱包中，从父密钥派生的密钥。该密钥可以是私钥，也可以是公钥，密钥的推导（派生）可能需要链编码。

**同义词**：HD wallet child key（HD 钱包子密钥）, Child public key（子公钥）, Child private key（子私钥）

**不要混淆**：Public key（从私钥派生，非父密钥）

## Coinbase field（创币交易区域）

**定义**：作为创币交易唯一的输入的特殊的区域。创币交易区域允许声明区块奖励并提供高达 100 个字节的任意数据。

**同义词**：Coinbase（创币交易区域）

**不要混淆**：Coinbase transaction（创币交易）

## Coinbase Transaction（创币交易）

**定义**：区块的第一笔交易。该区块总是通过矿工创建，它包含一个创币交易区域。

**同义词**：Generation Transaction（创币交易）

**不要混淆**：Coinbase（创币交易的独特部分）

## CompactSize Unsigned Integer（CompactSize 无符号整数）

**定义**：一种可变长度的整数，常用于比特币 P2P 协议和比特币序列化的数据结构。

**同义词**：CompactSize

**不要混淆**：VarInt（比特币核心用于本地数据存储的数据类型）, Compact（用于区块头中的难度对应值 nBits 的数据类型）

## Compressed Public Key（压缩公钥）

**定义**：33 字节长的椭圆曲线公钥而非 65 字节的未压缩公钥。

## Confirmation Score（确认分数）

**定义**：分数表明在最佳区块链上需要修改的区块数，用来移除或修改特定的交易。确认的交易有一个或更高的确认分数。

**同义词**：Confirmations（确认数）, Confirmed transaction（确认的交易）, Unconfirmed transaction（未确认的交易）

## Consensus（共识）

**定义**：当几个节点（通常是网络上的大部分节点）在它们本地验证的最佳区块连中都有相同的区块。

**不要混淆**：Social consensus（社会共识，通常用于开发人员之间的讨论，以表明大多数人同意某个特定的方案）, Consensus rules（允许节点维持共识的规则）

## Consensus Rules（共识规则）

**定义**：全节点遵循与其他节点相同的共识的区块验证规则。

**同义词**：Validation Rules（验证规则）

**不要混淆**：Consensus（当节点遵循相同的共识规则就达成了共识）

## Null Data (OP_RETURN) Transaction（空数据交易）

**定义**：在比特币核心 0.9.0 版或新版中，中继和挖矿的交易类型，添加任意数据到可证明不可花费的公钥脚本，全节点不必存储在它们的 UTXO 数据库中。

**同义词**：Data carrier transaction（数据搬运交易）

**不要混淆**：OP_RETURN（用于 OP_RETURN 交易一个输出的操作码）

## Opcode（操作码）

**定义**：来自比特币脚本语言的操作码在公钥脚本或签名脚本内部推送数据或执行功能。

**同义词**：Data-pushing opcode（数据推送操作码）, Non-data-pushing opcode（无数据推送操作码）

## Difficulty（难度）

**定义**：找到一个区块相对于找到最简单的区块的难度有多困难。最简单的块的工作量证明难度为 1。

**同义词**：Network difficulty（网络难度）

**不要混淆**：Target threshold（目标阈值，计算难度得到的值）

## DNS Seed（DNS 种子）

**定义**：DNS 域名解析服务器返回比特币网络上的全节点的 IP 地址集来帮助进行对端的发现。

**不要混淆**：HD wallet seeds（HD 钱包种子）

## Double Spend（双重花费）

**定义**：使用与已经广播交易相同输入的交易。当有一个交易已经记录在区块链上时，将被当作重复，欺骗或转换的尝试。

## Escrow Contract（托管合同）

**定义**：一种交易，消费者和接收者把资金放入 2 比 2（或其他的 m 比 n）的多签输出中，均不会花费资金，直到他们对某些外部结果都满意时。

## Extended Key（扩展的密钥）

**定义**：在 HD 钱包的的情况中，使用链编码扩展的公钥或私钥允许它们导出子密钥。

**同义词**：HD wallet extended key（HD 钱包扩展的密钥）, Public extended key（扩展的公钥）, Private extended key（扩展的私钥）

## Fork（分叉）

**定义**：当 2 个或更多的区块有相同的区块高度时，区块链分叉。特别是发生在 2 个或更多矿工几乎同时找到区块时。也可以用作攻击。

**同义词**：Accidental fork（意外的分叉）

**不要混淆**：Hard fork（区块链上由为升级的节点不遵循新的共识规则导致的永久性的分叉）,
Soft fork（区块链上由为升级的节点不遵循新的共识规则导致的临时分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

## Hard Fork（硬分叉）

**定义**：区块链上永久性的分叉，通常发生在未升级的节点不能验证通过遵守新的共识规则的升级的节点创建的区块时。

**同义词**：Hard-forking change（硬分叉变化）

**不要混淆**：Fork（所有节点遵循相同的共识规则的常规的分叉，一旦一条链的工作量证明高于另一条，该分叉被解决）,
Soft fork（区块链上由为升级的节点不遵循新的共识规则导致的临时分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

## Hardened Extended Key (HD Wallets)（硬化的扩展密钥）

**定义**：HD 钱包扩展密钥的一个变体，只有硬化的扩展私钥才能生成子密钥。防止链代码加任何私钥的组合使整个钱包处于风险中。

## HD Protocol（HD 协议）

**定义**：分层确定性（HD）密钥创建和传输协议（BIP32），允许从父密钥的层次创建子密钥。使用 HD 协议的钱包称为 HD 钱包。

**同义词**：HD wallet（HD 钱包）, BIP32

## Headers-First Sync（区块头优先同步）

**定义**：通过在下载完整区块前下载区块头来同步区块链。

**同义词**：Headers-First

**不要混淆**：Blocks-first sync（直接下载整个区块，不首先获取他们的头）

## High-Priority Transaction（高优先级交易）

**定义**：没有支付交易费的交易，因为他们的输入空闲时间足够积累大量的优先级。注：矿工选择是否接受免费交易。

**同义词**：Free transaction（免费交易，不含交易费）, Free Tx

## Initial Block Download, IBD（初始化区块下载）

**定义**：用于一个新节点（或长时间离线的节点）下载大量的区块来赶上最佳区块连的链尖的过程。

**不要混淆**：Blocks-first sync（同步包含获得任意数量的区块；IBD 仅用于大量区块）

## Internal Byte Order（内部字节序）

**定义**：显示为字符串的散列摘要的标准字节序—相同的格式用于序列化的区块和交易。

**不要混淆**：RPC byte order（反转的字节序）

## Inventory（库存）

**定义**：一种数据类型标识和一个散列值；用于识别通过比特币 P2P 网络下载的交易和可用区块。

**同义词**：Block or transaction inventory（区块或交易内存）

**不要混淆**：Inv message（传输库存的 P2P 消息）

## Mainnet（主网）

**定义**：比特币交易的原始和主要网络，其中聪有真正经济价值。

**同义词**：Bitcoin main network（比特币主网）

**不要混淆**：Testnet（非常类似主网的开放网络，其中的聪没有价值）, Regtest（类似于测试网的私有测试节点）

## Master Chain Code And Private Key（主链代码和主私钥）

**定义**：在 HD 钱包中，主链代码和主私钥是从根种子派生的 2 个数据。

## Block Size Limit（区块大小限制）

**定义**：共识规则允许一个区块的以字节为单位的最大尺寸。当前区块大小限制是 1,000,000 字节。

**不要混淆**：Block（区块）, Blockchain（区块链）, Blockchain size（区块链大小）

## Merkle Block（默尔克区块）

**定义**：连接匹配布鲁姆过滤器的交易到区块的默尔克树根的部分默尔克树。

**不要混淆**：MerkleBlock message（传输默尔克区块的 P2P 协议消息）

## Merkle Root（默尔克树根）

**定义**：默尔克树的根节点，树中所有哈希对的后代。区块头必须包含一个该块中所有交易的有效的默尔克树根。

**不要混淆**：Merkle tree（默尔克树根是根节点）, Merkle block（连接根到一笔或多笔叶子交易的部分默尔克分支）

## Merkle Tree（默尔克树）

**定义**：通过散列配对的数据（叶子）构建的树，然后对对结果进行配对和散列，直到剩余一个单散列值，即默尔克树根。在比特币中，叶子几乎总是来自单个区块的交易。

**不要混淆**：Partial merkle branch（连接一个或多个叶子到根的分支）, Merkle block（连接一笔或多笔交易从单个区块到区块默尔克根的部分默尔克分支）

## Message Header（消息头）

**定义**：比特币 P2P 网络上所有消息前缀的 4 个头部字段。

## Miner Activated Soft Fork, MASF（矿工激活的软分叉）

**定义**：通过矿工信号激活的软分叉。

**不要混淆**：User Activated Soft Fork（通过激活的软分叉）,
Fork（所有节点遵循相同的共识规则的常规的分叉，一旦一条链的工作量证明高于另一条，该分叉被解决）,
Hard fork（区块链上由为升级的节点不遵循新的共识规则导致的永久性的分叉）,
Soft fork（区块链上由为升级的节点不遵循新的共识规则导致的临时分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久地分开开发一份代码库）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码库）

## Mining（挖矿）

**定义**：挖矿是创建有效的比特币区块的行为，需要工作量证明，并且矿工是挖矿的设备或拥有那些设备的人。

**同义词**：Miner（矿工）

## Locktime（锁定时间）

**定义**：交易的一部分用于表明交易可能添加到区块链的最早时间或最早区块。

**同义词**：nLockTime

## Null Data (OP_RETURN) Transaction（空数据交易）

**定义**：默认情况下在比特币核心 0.9.0 和更高版本中中继和挖矿的交易类型将任意类型的数据添加到可证明不可花费的公钥脚本中，完整节点不必存储在其 UTXO 数据库中。

**同义词**：Data carrier transaction（数据传输交易）

**不要混淆**：OP_RETURN（用于 OP_RETURN 交易输出的操作码）

## Orphan Block（孤儿块）

**定义**：父区块没有被本地几点处理的区块，以至于它们还不能被完全验证。

**不要混淆**：Stale block（陈旧的区块）

## Outpoint（输出点）

**定义**：用于引用特定交易输出的数据结构，由 32 字节的交易索引和 4 字节的输出索引数字（vout）组成。

**不要混淆**：Output（交易的完整输出）, TxOut（和输出一样）

## P2PKH Address（P2PKH 地址）

**定义**：比特币付款地址，包含哈希的公钥，允许支付者创建标准的支付给公钥哈希（P2PKH）的公钥脚本。

**同义词**：Pay to pubkey hash（支付到公钥哈希）, P2PKH output（P2PKH 输出）

**不要混淆**：P2PK output（直接支付给公钥的输出）, P2SH address / output（包括哈希的脚本和其相应的输出的地址）

## P2SH Multisig（P2SH 多签）

**定义**：P2SH 输出，其中兑换脚本使用其中一个多签操作码。直到比特币核心 0.10.0 版，P2SH 多签脚本是标准交易，但大多数 P2SH 脚本不始。

**同义词**：P2SH multisig output（P2SH 多签输出）

**不要混淆**：Multisig pubkey scripts（也称作“裸多签”，这些多签脚本不使用 P2SH 封装）, P2SH（通用 P2SH，其中 P2SH 多签是比特币核心 0.10.0 版特殊情况下的特定实例）

## P2SH Address（P2SH 地址）

**定义**：比特币支付地址包含一个哈希的脚本，允许支付者创建一个标准的支付到脚本哈希（P2SH）的公钥脚本。该脚本几乎可能是任何有效的公钥脚本。

**同义词**：Pay to script hash（支付到脚本哈希）, P2SH output（P2SH 输出）

**不要混淆**：P2PK output（直接支付到公钥的输出）,
P2PKH address / output（由散列的公钥和其相应的输出组成的地址）,
P2SH multisig（P2SH 特定的实例，其中脚本使用一个多签操作码）

## Parent Key（父密钥）

**定义**：在 HD 钱包中，该密钥用于生成子密钥。该密钥可能是私钥或公钥，且密钥的生成可能也需要链编码。

**同义词**：HD wallet parent key（HD 钱包父密钥）, Parent public key（父公钥）, Parent private key（父私钥）

**不要混淆**：Public key（从私钥派生，非父密钥）

## Payment Protocol（支付协议）

**定义**：该协议在 BIP70（和其他 BIPs）中定义，让支付者从接收者获取签名的支付细节。

**同义词**：Payment request（支付请求）, BIP70

**不要混淆**：IP-to-IP payment protocol（包含在比特币早期版本中的不安全，已停止的协议）

## Private Key（私钥）

**定义**：密钥对的私有部分能够创建其他人使用公钥验证的签名。

**同义词**：ECDSA private key（椭圆曲线加密私钥）

**不要混淆**：Public key（私钥派生的数据）, Parent key（用于创建子密钥的密钥，不一定是私钥）

## Proof Of Work, POW（工作量证明）

**定义**：低于目标值的散列，平均只能通过执行一定量的暴力工作来获得—因此论证了工作量证明。

## Public Key（公钥）

**定义**：密钥对的公共部分，用于验证使用密钥对私有部分进行的签名。

**同义词**：ECDSA public key（椭圆曲线公钥）

**不要混淆**：Private key（派生出公钥的数据）, Parent key（用于创建子密钥的密钥，不一定是公钥）

## Redeem Script（赎回脚本）

**定义**：功能上类似于公钥脚本的脚本。其中一个副本用于创建 P2SH 地址（用于实际的公钥脚本），另一个副本放在支出签名脚本用来强制其条件。

**同义词**：RedeemScript

**不要混淆**：Signature script（为公钥脚本提供数据的脚本，在 P2SH 输入中包含赎回脚本）

## Regtest（回归测试网）

**定义**：开发人员能够立刻产生测试事件所需区块的本地测试环境，能够创建没有价值的私有聪。

**同义词**：Regression test mode（回归测试模式）

**不要混淆**：Testnet（模仿主网的全球测试环境）

## Minimum Relay Fee（最小中继费）

**定义**：最小交易费，一笔交易用于中继到其他节点必须支付给全节点的费用（如果它不是高优先级交易）。没有最低中继费—每个节点选择它自己的决策。

**同义词**：Relay fee（中继费）

**不要混淆**：Transaction fee（最小中继费是过滤过低交易费交易的决策设置）

## Replace-by-Fee, RBF（通过交易费代替）

**定义**：使用支付更高交易费的不同版本的交易代替未确认交易的版本。可以使用 BIP125 信号。

**同义词**：Opt-in replace by fee（通过最优交易费代替）

**不要混淆**：Child pays for parent, CPFP（孩子为父母支付）

## HD Wallet Seed（HD 钱包种子）

**定义**：用作为 HD 钱包生成主私钥和主链代码的种子的潜在短值。

**同义词**：Root seed（根种子）

**不要混淆**：Mnemonic code / mnemonic seed（二进制根种子格式化为单词，使人们更容易记录和记忆）

## RPC Byte Order（RPC 字节序）

**定义**：显示的逆序的哈希摘要；在比特币核心 RPCs，众多区块浏览器，和其他软件中使用。

**不要混淆**：Internal byte order（内部字节序，显示的典型顺序的哈希摘要；用于序列化的区块和序列化的交易）

## Pubkey Script（公钥脚本）

**定义**：包含在输出中的脚本，用于设置必须满足用于花费的聪。在签名脚本中提供满足条件的数据。公钥脚本在代码中被称为脚本公钥 "scriptPubKey"。

**同义词**：ScriptPubKey（脚本公钥）

**不要混淆**：Pubkey（公钥，用作公钥脚本的一部分但不提供可编程的身份验证机制）, Signature script（给公钥脚本提供数据的脚本）

## Sequence Number (Transactions)（交易序列号）

**定义**：所有交易的一部分。一个数字，旨在允许未确认的时间锁定的交易在序列化前更新；目前尚未使用，除非在交易中禁用锁定时间。

**不要混淆**：Output index number / vout（用于后面的交易引用特定输出的交易中的 0 索引号的输出）

## Serialized Block（序列化区块）

**定义**：以 2 进制格式完成区块——相同的格式用于计算总区块字节大小；常用 16 进制表示。

**同义词**：Raw block（原始区块）

## Serialized Transaction（序列化的交易）

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

## Signature（签名）

**定义**：与公钥相关的值，该公钥只能由拥有创建公钥的私钥的人来创建。在比特币中用于在发送到公钥前验证花费的聪。

**同义词**：ECDSA signature（椭圆曲线加密签名）

## Signature Hash（签名哈希）

**定义**：比特币签名的标志，用于表明签名签署的交易的部分。（默认是 SIGHASH_ALL）交易未签名的部分可能被修改。

**同义词**：Sighash

**不要混淆**：Signed hash（签名数据的哈希）, Transaction malleability / mutability（尽管非默认的签名哈希标志允许可选的延展性，延展性包含交易可能发生变化的任何方式）

## Signature Script（签名脚本）

**定义**：通过支付者生成的数据，几乎总是用作满足公钥脚本的变量。签名脚本在代码中又称为脚本签名。

**同义词**：ScriptSig（脚本签名）

**不要混淆**：ECDSA signature（一种签名，除了其他数据，能用于公钥脚本的一部分）

## Soft Fork（软分叉）

**定义**：软分叉是比特币协议的改变，其中只有之前有效的区块/交易变得无效了。因为旧的节点将仍认为新区块是有效的，所以软分叉是向后兼容的。

**同义词**：Soft-forking change（软分叉变化）

**不要混淆**：Fork（所有节点遵循相同的共识规则的普通的分叉，一旦一条链的工作量证明多于另一条，该分叉就被解决掉）,
Hard fork（区块链上因未升级的节点不遵循新的共识规则导致的永久性的分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久性地分开开发一份代码）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份代码）

## Stale Block（陈旧的区块）

**定义**：成功挖出但没有包含在当前最佳区块链上的区块，可能是因为在相同高度的其他区块首先扩展链。

**不要混淆**：Orphan block（该区块的前一个区块哈希域指向一个未知的区块，意味着孤儿块不能被验证）

## Standard Transaction（标准交易）

**定义**：传递给比特币核心 `IsStandard()` 和 `IsStandardTx()` 测试的交易。只有标准交易通过运行默认比特币核心软件的对端节点挖矿或广播。

## Network Magic（网络魔数）

**定义**：在比特币 `P2P` 网络协议中定义的每条消息的 4 个字节的头部，用来寻找下一条消息。

**同义词**：Start String

## nBits（难度对应值）

**定义**：该目标使低于必须使区块有效的区块头散列阈值，并且难度对应值出现在区块头中，是目标阈值的编码形式。

**同义词**：Target, Target threshold（目标阈值）

**不要混淆**：Difficulty（衡量寻找一个相对于寻找最容易目标的区块头散列难度的区块头难度的数字）

## Testnet（测试网）

**定义**：开发人员能够在类似于比特币主网的网络上获得并花费没有真正价值的聪的全球测试环境。

**同义词**：Testing network

**不要混淆**：Regtest（开发人员可控制区块生成的本地测试环境）

## SPV, Simplified Payment Verification（简单支付验证）

**定义**：用于验证特定交易是否包含在某个未下载完整区块的区块中。该方法用于一些轻量级比特币客户端。

**同义词**：Lightweight client（轻量级客户端）, Thin client

## Token（代币）

**定义**：代币使驻留在现存区块链中的具有其基本代码的可编程数字资产。代币有助于促进去中心化应用的创建。

**不要混淆**：Bitcoins（比特币）, Satoshis（聪）, Security token（安全代币）, Denominations（面额）

## Transaction Fee（交易费）

**定义**：一笔交易的全部输入的值减去全部输出剩余的金额；支付该费用给包含该交易到区块的矿工。

**同义词**：Miners fee（矿工费）

**不要混淆**：Minimum relay fee（接收一笔交易到内存池并通过比特币核心节点中继必须支付的最低费用）

## Transaction Mutability（交易可变性）

**定义**：某人改变的未确认交易且不使其无效的能力，这会改变交易号，使子交易无效。

**同义词**：Transaction malleability（交易延展性）

**不要混淆**：BIP62（可选的新交易版本的提议，减少了常见交易的已知变化集）

## Txid, Transaction Identifier（交易号）

**定义**：用于唯一标识特定交易的识别符；具体来说，是交易的 `sha256` 双散列。

**不要混淆**：Outpoint（交易号和输出集的联合体，用于识别指定输出）

## Transaction Input（交易输入）

**定义**：交易的输入包含 3 个字段：输出点，签名脚本，和序列号。输出点引用前一笔交易的输出且签名脚本允许花费它。

**同义词**：Input, TxIn

## Transaction Output（交易输出）

**定义**：交易的输出包含 2 个字段：转账 0 或更多聪的值字段和指明必须满足哪些条件才能进一步使用聪的公钥脚本。

**同义词**：Output, TxOut

**不要混淆**：Outpoint（特定输出的引用）

## User Activated Soft Fork, UASF（用户激活的软分叉）

**定义**：通过标志日或节点强制代替矿工信号激活的软分叉。

**不要混淆**：Miner activated soft fork（通过矿工信号激活的软分叉）,
Fork（常规的分叉，所有节点都遵循相同的共识规则，因此一旦一条链的工作量证明多余另一条，该分叉就消失了）,
Hard fork（区块链中由未升级的节点不遵循新的共识规则导致的永久性的分叉）,
Soft fork（区块链中由未升级的节点不遵循新的共识规则导致的临时的分叉）,
Software fork（当一个或多个开发人员与其他开发人员永久分开开发一份基础代码）,
Git fork（当一个或多个开发人员与其他开发人员临时分开开发一份基础代码）

## Unspent Transaction Output, UTXO（未花费的交易输出）

**定义**：能作为一笔交易输入的可花费的未花费的交易输出（UTXO）。

**不要混淆**：Output（任意输出，包含花费和未花费的。输出是 UTXO 的超集，UTXO 是输出的子集）

## Wallet（钱包）

**定义**：存储私钥和区块链镜像的软件（有时作为执行处理的服务器的客户端），允许用户花费和接收聪。

**不要混淆**：HD wallet（允许钱包从单个种子创建全部密钥的协议，使用该协议的钱包）

## Wallet Import Format, WIF（钱包导入格式）

**定义**：一种数据交换格式，旨在允许导出和导入单个私钥，并带有指明其是否使用压缩公钥的标志。

**不要混淆**：Extended private keys（允许导入私钥的层次体系）

## Watch-Only Address（Watch-Only 地址）

**定义**：钱包中不带相应私钥的地址或公钥脚本，允许钱包监视其输出但不能花费它们。

Thanks for your time.

## 参照
* [Developer Glossary - Bitcoin](https://bitcoin.org/en/developer-glossary)
* [...](https://github.com/mistydew/blockchain)
