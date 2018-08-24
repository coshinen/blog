---
layout: post
title:  "比特币开发者术语汇编"
date:   2018-08-20 22:08:57 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin glossary translation
---
这是一个专业术语汇编。普通用户应该使用[词汇表页面](/2018/08/21/bitcoin)。

## 51% Attack（百分之 51 攻击）

**定义**：控制大多数网络哈希率的某人修改交易历史并阻止新交易确认的能力。

**同义词**：51 percent attack（百分之 51 攻击）, Majority Hash Rate attack（多数攻击）

## Payment Addresses（付款地址）

**定义**：使用 [`base58check`](#Base58check) 格式化的 20 个字节的哈希值，用来生成 `P2PKH` 或 `P2SH` 比特币地址。
目前用户交换支付信息的最常见方式。

**同义词**：Address（地址）

**不要混淆**：IP address

## Child Pays For Parent, CPFP（孩子为父母付钱）

定义：选择挖矿交易不仅基于它们的交易费，还基于它们祖先（父母）和后代（孩子）的交易费。

同义词：Ancestor mining（祖先挖矿）

**不要混淆**：Replace by Fee, RBF

## Node（节点）

**定义**：连接到比特币网络的计算机。

**同义词**：Full Node（全/完整节点）, Archival Node（档案节点）, Pruned Node（修剪节点）, Peer（对端）

**不要混淆**：Lightweight node（轻量级节点）, SPV node

## M-of-N Multisig, Multisig Output（多签输出）

**定义**：公钥脚本提供给 n 个公钥并需要对应的签名脚本提供对应提供公钥的最少 m 个签名。

**同义词**：Multisig（多签）, Bare multisig

**不要混淆**：P2SH multisig（包含在 P2SH 里的多签脚本）, 需要多个签名而不用 `OP_CHECKMULTISIG` 或 `OP_CHECKMULTISIGVERIFY`

<p id="Base58check-ref"></p>
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

（未完成）

Thanks for your time.

## 参照
* [Developer Glossary - Bitcoin](https://bitcoin.org/en/developer-glossary)
* [...](https://github.com/mistydew/blockchain)
