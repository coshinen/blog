---
layout: post
title:  "比特币白皮书中英对照"
date:   2018-04-20 09:07:06 +0800
author: mistydew
comments: true
category: 区块链
tags: Translations Blockchain Bitcoin Whitepaper
excerpt: 比特币：一种点对点的电子现金系统，一个电子现金的纯点对点版本允许在线支付从一方直接发送到另一方，而不通过一个金融机构。
---
> <h2 align="center">Bitcoin: A Peer-to-Peer Electronic Cash System</h2>
> 
> <p align="center">
> Satoshi Nakamoto<br>
> satoshin@gmx.com<br>
> www.bitcoin.org
> </p>
> 
> **Abstract.**  A purely peer-to-peer version of electronic cash would allow online
> payments to be sent directly from one party to another without going through a
> financial institution.  Digital signatures provide part of the solution, but the main
> benefits are lost if a trusted third party is still required to prevent double-spending.
> We propose a solution to the double-spending problem using a peer-to-peer network.
> The network timestamps transactions by hashing them into an ongoing chain of
> hash-based proof-of-work, forming a record that cannot be changed without redoing
> the proof-of-work.  The longest chain not only serves as proof of the sequence of
> events witnessed, but proof that it came from the largest pool of CPU power.  As
> long as a majority of CPU power is controlled by nodes that are not cooperating to
> attack the network, they'll generate the longest chain and outpace attackers.  The
> network itself requires minimal structure.  Messages are broadcast on a best effort
> basis, and nodes can leave and rejoin the network at will, accepting the longest
> proof-of-work chain as proof of what happened while they were gone.

<h2 align="center">比特币：一种点对点的电子现金系统</h2>

<p align="center">中本聪</p>

**概要.** 一个电子现金的纯点对点版本允许在线支付从一方直接发送到另一方，而不通过一个金融机构。
数字签名提供了部分解决方案，但如果仍需要一个可信的第三方来防止双重花费，其主要优势就丧失了。
我们提出一个使用点对点网络解决双重花费问题的方案。
该网络通过把交易散列进一条不断增长的基于散列的工作量证明链中来为交易打时间戳，形成一条不重做工作量证明就不能改变的记录。
最长的链不仅作为被见证事件顺序的证明，而且是它来自最大 CPU 算力池的证明。
只要多数的 CPU 算力被不攻击该网络的节点控制，它们将生成最长的链并超过攻击者。
该网络本身只需最小的结构。
消息被尽力广播，节点可以随意离开和重新加入该网络，只要接受最长的工作量证明链作为它们离开时发生事件的证明。

> ## 1. Introduction
> 
> Commerce on the Internet has come to rely almost exclusively on financial institutions serving as
> trusted third parties to process electronic payments.  While the system works well enough for
> most transactions, it still suffers from the inherent weaknesses of the trust based model.
> Completely non-reversible transactions are not really possible, since financial institutions cannot
> avoid mediating disputes.  The cost of mediation increases transaction costs, limiting the
> minimum practical transaction size and cutting off the possibility for small casual transactions,
> and there is a broader cost in the loss of ability to make non-reversible payments for non-
> reversible services.  With the possibility of reversal, the need for trust spreads.  Merchants must
> be wary of their customers, hassling them for more information than they would otherwise need.
> A certain percentage of fraud is accepted as unavoidable.  These costs and payment uncertainties
> can be avoided in person by using physical currency, but no mechanism exists to make payments
> over a communications channel without a trusted party.

## 1. 介绍

互联网上的贸易几乎完全依赖金融机构服务作为可信任的第三方来处理电子支付。
尽管对于大多数交易该系统都运行得足够好，但它仍然受到基于信任模型的这个固有缺点的影响。
完全不可逆的交易实际上是不可能的，因为金融机构无法避免调解纠纷。
调解成本增加了交易成本，限制了最小的实际交易规模并切断了小额临时交易的可能性，而且由于不可逆支付能力的缺失对于不可逆服务的支付会产生更大的成本。
有了逆转的可能性，对信任的需求就会扩大。
商家必须警惕他们的客户，麻烦他们以获取更多非必要的信息。
一定比例的欺诈被认为是不可避免要接受的。
这些成本和支付的不确定性可以通过亲自使用纸币来避免，但是没有机制可以在无可信方的情况下通过通信渠道进行支付。

> What is needed is an electronic payment system based on cryptographic proof instead of trust,
> allowing any two willing parties to transact directly with each other without the need for a trusted
> third party.  Transactions that are computationally impractical to reverse would protect sellers
> from fraud, and routine escrow mechanisms could easily be implemented to protect buyers.  In
> this paper, we propose a solution to the double-spending problem using a peer-to-peer distributed
> timestamp server to generate computational proof of the chronological order of transactions.  The
> system is secure as long as honest nodes collectively control more CPU power than any
> cooperating group of attacker nodes.

所需要的是一种基于密码学证明而非信任的电子支付系统，允许任何两个有意愿的当事方直接与对方交易，而不需要一个可信任的第三方。
在计算上不可逆转的交易将保护卖家免受欺诈，而且用于保护买家的常规托管机制可以很容易实现。
在这篇论文中，我们提出了双重花费问题的解决方案，使用一个点对点的分布式时间戳服务器来生成时间顺序交易的计算量证明。
只要诚实节点共同控制比任何攻击者节点协作群体更多的 CPU 算力，该系统就是安全的。

> ## 2. Transactions
> 
> We define an electronic coin as a chain of digital signatures.  Each owner transfers the coin to the
> next by digitally signing a hash of the previous transaction and the public key of the next owner
> and adding these to the end of the coin.  A payee can verify the signatures to verify the chain of
> ownership.

## 2. 交易

我们把一个电子货币定义为一个数字签名链。
每个所有者通过数字签名前一笔交易的哈希和下一个所有者的公钥并把它们添加到货币的尾部，转移货币到下一个所有者。
收款者可以验证该签名以验证链的所有权。

![transactions](https://mistydew.github.io/assets/images/bitcoin/whitepaper/transactions.svg){:.border#center}

> The problem of course is the payee can't verify that one of the owners did not double-spend
> the coin.  A common solution is to introduce a trusted central authority, or mint, that checks every
> transaction for double spending.  After each transaction, the coin must be returned to the mint to
> issue a new coin, and only coins issued directly from the mint are trusted not to be double-spent.
> The problem with this solution is that the fate of the entire money system depends on the
> company running the mint, with every transaction having to go through them, just like a bank.

当然问题是收款人无法核实其中一位所有者没有双重花费货币。
一种常见的解决方案是引入一个可信的中央权威机构，或铸币厂，来检查每笔交易是否存在双重花费。
在每笔交易之后，这枚货币必须退回到铸币厂以发行一枚新货币，并且只有从铸币厂直接发行的货币才可信任没被双重花费。
该解决方案的问题在于整个货币系统的命运取决于运营铸币厂的公司，每笔交易都必须经过它们，就像一个银行。

> We need a way for the payee to know that the previous owners did not sign any earlier
> transactions.  For our purposes, the earliest transaction is the one that counts, so we don't care
> about later attempts to double-spend.  The only way to confirm the absence of a transaction is to
> be aware of all transactions.  In the mint based model, the mint was aware of all transactions and
> decided which arrived first.  To accomplish this without a trusted party, transactions must be
> publicly announced [[1]](#references), and we need a system for participants to agree on a single history of the
> order in which they were received.  The payee needs proof that at the time of each transaction, the
> majority of nodes agreed it was the first received.

我们需要一种方式让收款人知道前一个所有者没有对任何更早的交易签名。
就我们的目的而言，最早的交易是唯一算数的，所以我们不关心之后尝试的双重花费。
确认一笔交易不存在的唯一方法是知道所有的交易。
在基于铸币厂的模型中，铸币厂知道所有的交易并决定哪笔交易最先到达。
要在没有可信方的情况下实现这一目的，交易必须公开通知，并且我们需要一个让参与者与对他们收到交易顺序的单一历史达成一致的系统。
收款人需要每笔交易时，大多数节点都同意该交易是第一个被收到的证明。

> ## 3. Timestamp Server
> 
> The solution we propose begins with a timestamp server.  A timestamp server works by taking a
> hash of a block of items to be timestamped and widely publishing the hash, such as in a
> newspaper or Usenet post [[2-5]](#references).  The timestamp proves that the data must have existed at the
> time, obviously, in order to get into the hash.  Each timestamp includes the previous timestamp in
> its hash, forming a chain, with each additional timestamp reinforcing the ones before it.

## 3. 时间戳服务器

我们提出的解决方案是从一个时间戳服务器开始。
时间戳服务器的工作原理是对一个要加时间戳的区块进行散列并广泛发布其散列值，例如报纸或 Usenet 文章。
时间戳证明数据必须在当时存在，显然是为了进入散列。
每个时间戳在其散列中都包含前一个时间戳，形成一个链，每个附加的时间戳都会加强它前面的时间戳。

![timestamp-server](https://mistydew.github.io/assets/images/bitcoin/whitepaper/timestamp-server.svg){:.border#center}

> ## 4. Proof-of-Work
> 
> To implement a distributed timestamp server on a peer-to-peer basis, we will need to use a proof-
> of-work system similar to Adam Back's Hashcash [[6]](#references), rather than newspaper or Usenet posts.
> The proof-of-work involves scanning for a value that when hashed, such as with SHA-256, the 
> hash begins with a number of zero bits.  The average work required is exponential in the number 
> of zero bits required and can be verified by executing a single hash.

## 4. 工作量证明

为了在点对点的基础上实现分布式时间戳服务器，我们需要使用与 Adam Back 的 Hashcash 类似的工作量证明系统，而不是报纸或 Usenet 文章。
工作量证明涉及扫描散列时的值，例如 SHA-256，从一个 0 位数字开始散列。
所需的平均工作量是指数所需的 0 位数，且能通过执行一个单一散列来验证。

> For our timestamp network, we implement the proof-of-work by incrementing a nonce in the 
> block until a value is found that gives the block's hash the required zero bits.  Once the CPU 
> effort has been expended to make it satisfy the proof-of-work, the block cannot be changed 
> without redoing the work.  As later blocks are chained after it, the work to change the block 
> would include redoing all the blocks after it.

对于我们的时间戳网络，我们通过增加块中的一个随机数来实现工作量证明，直到找到一个给定区块哈希所需 0 位数的值。
一旦 CPU 花费功夫在使其满足工作量证明上，该块在没有重做工作量的情况下不能改变。
随后区块被连接在后面，改变区块的工作量将包含重做在该块之后全部区块的工作量。

![proof-of-work](https://mistydew.github.io/assets/images/bitcoin/whitepaper/proof-of-work.svg){:.border#center}

> The proof-of-work also solves the problem of determining representation in majority decision 
> making.  If the majority were based on one-IP-address-one-vote, it could be subverted by anyone 
> able to allocate many IPs.  Proof-of-work is essentially one-CPU-one-vote.  The majority 
> decision is represented by the longest chain, which has the greatest proof-of-work effort invested 
> in it.  If a majority of CPU power is controlled by honest nodes, the honest chain will grow the 
> fastest and outpace any competing chains.  To modify a past block, an attacker would have to 
> redo the proof-of-work of the block and all blocks after it and then catch up with and surpass the 
> work of the honest nodes.  We will show later that the probability of a slower attacker catching up 
> diminishes exponentially as subsequent blocks are added.

工作量证明也解决了多数决策中确定代表性的问题。
如果大多数人都是基于一个 IP 地址一个投票，那么任何分配许多 IP 的人都可以破坏它。
工作量证明基本上是一个 CPU 一个投票。
多数决定是由最长的拥有最大工作量证明的链代表。
如果大部分 CPU 能力被诚实节点控制，那么诚实链将会增长的最快并且超过所有竞争链。
为了修改过去的块，一个攻击者必须重做该块和其之后所有块的工作量证明，然后赶上并超过诚实节点的工作。
我们稍后会展示随着后续块的添加，较慢的攻击者追赶上的概率将呈指数级下降。

> To compensate for increasing hardware speed and varying interest in running nodes over time, 
> the proof-of-work difficulty is determined by a moving average targeting an average number of 
> blocks per hour.  If they're generated too fast, the difficulty increases.

为了补偿增加的硬件速度以及随着时间的推移对运行的节点的兴趣不断变化，工作量证明的难度通过一个变化的平均值确定，以每小时的平均块数为平均值。
如果它们产生的过快，难度会增加。

> ## 5. Network
> 
> The steps to run the network are as follows:<br>
> 1) New transactions are broadcast to all nodes.<br>
> 2) Each node collects new transactions into a block.<br>
> 3) Each node works on finding a difficult proof-of-work for its block.<br>
> 4) When a node finds a proof-of-work, it broadcasts the block to all nodes.<br>
> 5) Nodes accept the block only if all transactions in it are valid and not already spent.<br>
> 6) Nodes express their acceptance of the block by working on creating the next block in the 
> chain, using the hash of the accepted block as the previous hash.

## 5. 网络

这步运行如下网络：<br>
1) 新的交易广播到全部节点。<br>
2) 每个节点收集新的交易到一个区块。<br>
3) 每个节点都为了找一个区块的困难的工作量证明而工作。<br>
4) 当节点找到一个工作量证明时，它会广播该块到全部节点。<br>
5) 如果其内部所有交易都是有效的且没有已经花费的交易，节点就接受该区块。<br>
6) 节点通过在链上使用该区块的散列作为前一个区块的散列创建新区块来表达它们接受了该块。

> Nodes always consider the longest chain to be the correct one and will keep working on 
> extending it.  If two nodes broadcast different versions of the next block simultaneously, some 
> nodes may receive one or the other first.  In that case, they work on the first one they received, 
> but save the other branch in case it becomes longer.  The tie will be broken when the next proof-
> of-work is found and one branch becomes longer; the nodes that were working on the other 
> branch will then switch to the longer one.

节点总是认为最长的链是正确的并且继续努力扩展该链。
如果两个节点同时广播不同版本的下一个区块，某些节点可能会首先接收到不同版本的区块。
在这种情况下，它们会在它们首个接收到的区块上工作，但也会保存另一个分支为了防止其变得更长。
当找到下一个工作量证明并且一个分支变得更长时，两个分支的局势将被打破。
在另一个分支上工作的节点将会切换到较长的分支上工作。

> New transaction broadcasts do not necessarily need to reach all nodes.  As long as they reach 
> many nodes, they will get into a block before long.  Block broadcasts are also tolerant of dropped 
> messages.  If a node does not receive a block, it will request it when it receives the next block and 
> realizes it missed one.

新的交易广播不一定需要到达全部节点。
只要它们到达多个节点，不久它们将会进入一个区块。
区块广播也允许丢弃消息。
如果一个节点没有接收到一个区块，它将会在它接收到下一个区块并识别出它错过了一个时请求该区块。

> ## 6. Incentive
> 
> By convention, the first transaction in a block is a special transaction that starts a new coin owned 
> by the creator of the block.  This adds an incentive for nodes to support the network, and provides 
> a way to initially distribute coins into circulation, since there is no central authority to issue them. 
> The steady addition of a constant of amount of new coins is analogous to gold miners expending 
> resources to add gold to circulation.  In our case, it is CPU time and electricity that is expended.

## 6. 激励

按照惯例，区块中第一笔交易是一笔特殊交易，生成属于该区块创建者的新币。
这增加了节点支持网络的激励，并且提供一种初始化时分发币到流通中的方法，因为没有中央权威机构来发行它们。
稳定的郑家一定数量的新币类似于黄金矿工花费资源为了增加黄金到流通中。
在我们的情况中，消耗的是 CPU 时间和电力。

> The incentive can also be funded with transaction fees.  If the output value of a transaction is 
> less than its input value, the difference is a transaction fee that is added to the incentive value of 
> the block containing the transaction.  Once a predetermined number of coins have entered 
> circulation, the incentive can transition entirely to transaction fees and be completely inflation 
> free.

激励也可以用交易费来支付。
如果一笔交易的输出值小于它的输入值，该差值就是交易费，它被添加到包含该交易的区块激励上。
一旦预定数量的币进入循环，激励能够完全转变为交易费并且完全没有通货膨胀。

> The incentive may help encourage nodes to stay honest.  If a greedy attacker is able to 
> assemble more CPU power than all the honest nodes, he would have to choose between using it 
> to defraud people by stealing back his payments, or using it to generate new coins.  He ought to 
> find it more profitable to play by the rules, such rules that favour him with more new coins than 
> everyone else combined, than to undermine the system and the validity of his own wealth.

激励可能有助于鼓励节点保持诚实。
如果是个贪婪的攻击者能够比所有诚实节点聚集更多的 CPU 能力，他将必须选择通过窃取它的付款或使用它来生成新币来欺诈人们。
他应该会发现按照规则去玩更加有利，这种规则帮助他有比其他人合起来还要多的新币，而不是破环系统和他拥有的财富值。

> ## 7. Reclaiming Disk Space
> 
> Once the latest transaction in a coin is buried under enough blocks, the spent transactions before 
> it can be discarded to save disk space.  To facilitate this without breaking the block's hash, 
> transactions are hashed in a Merkle Tree [[7][2][5]](#references), with only the root included in the block's hash.
> Old blocks can then be compacted by stubbing off branches of the tree.  The interior hashes do 
> not need to be stored.

## 7. 回收硬盘空间

一旦币中最新的交易埋在足够多的区块中，可以抛弃它之前已经花费的交易以节省硬盘空间。
为了在不破坏区块散列的情况下实现，交易被散列在默尔克树中，只有树根包含在区块散列中。
然后通过除去树枝来压缩旧的区块。
树内部（树枝）哈希不需要存储（在区块中）。

![reclaiming-disk-space](https://mistydew.github.io/assets/images/bitcoin/whitepaper/reclaiming-disk-space.svg){:#center}

> A block header with no transactions would be about 80 bytes.  If we suppose blocks are 
> generated every 10 minutes, 80 bytes * 6 * 24 * 365 = 4.2MB per year.  With computer systems 
> typically selling with 2GB of RAM as of 2008, and Moore's Law predicting current growth of 
> 1.2GB per year, storage should not be a problem even if the block headers must be kept in 
> memory.

一个没有交易的区块头大约 80 个字节。
如果我们假设每 10 分钟产生一个区块，80 字节 * 6 * 24 * 365 = 4.2 兆字节/年。
随着在 2008 年 2GB RAM 的计算机系统销售，且摩尔定于预测目前每年增长 1.2GB，即使区块头必须在内存中，存储也应该不成问题。

> ## 8. Simplified Payment Verification
> 
> It is possible to verify payments without running a full network node.  A user only needs to keep 
> a copy of the block headers of the longest proof-of-work chain, which he can get by querying 
> network nodes until he's convinced he has the longest chain, and obtain the Merkle branch 
> linking the transaction to the block it's timestamped in.  He can't check the transaction for 
> himself, but by linking it to a place in the chain, he can see that a network node has accepted it, 
> and blocks added after it further confirm the network has accepted it.

## 8. 简单支付验证

不需要运行完整的网络节点也可以验证支付。用户只需要保留最长工作量证明链的区块头的副本，他能通过查询网络节点获取，直到他确信他拥有最长的链，并获得默尔克分支，从而把交易连接到加时间戳的区块上。
他不能自行检查交易，但通过连接交易到链上的某个地方，他能够看到网络节点已接受该交易，并在进一步确认网络接受了该交易后添加到区块上。

![simplified-payment-verification](https://mistydew.github.io/assets/images/bitcoin/whitepaper/simplified-payment-verification.svg){:.border#center}

> As such, the verification is reliable as long as honest nodes control the network, but is more 
> vulnerable if the network is overpowered by an attacker.  While network nodes can verify 
> transactions for themselves, the simplified method can be fooled by an attacker's fabricated 
> transactions for as long as the attacker can continue to overpower the network.  One strategy to 
> protect against this would be to accept alerts from network nodes when they detect an invalid 
> block, prompting the user's software to download the full block and alerted transactions to 
> confirm the inconsistency.  Businesses that receive frequent payments will probably still want to 
> run their own nodes for more independent security and quicker verification.

因此，只要诚实节点控制网络，验证就是可靠的，但如果网络被攻击者控制，则验证会更加脆弱。
虽然网络节点嫩巩固自己验证交易，但只要攻击者继续压制网络，这种简化的方法就会被攻击者伪造的交易所欺骗。
针对此情况的一种策略是当网络节点侦测到无效块时接受来自网络节点的警报，提示用户的软件下载完整的区块并提醒交易以确认不一致性。
频繁接收到支付的企业可能仍想要运行它们自己的节点以获得更加独立的安全性和更快的验证。

> ## 9. Combining and Splitting Value
> 
> Although it would be possible to handle coins individually, it would be unwieldy to make a 
> separate transaction for every cent in a transfer.  To allow value to be split and combined, 
> transactions contain multiple inputs and outputs.  Normally there will be either a single input 
> from a larger previous transaction or multiple inputs combining smaller amounts, and at most two 
> outputs: one for the payment, and one returning the change, if any, back to the sender.  

## 9. 合并与分离价值

虽然有可能单独处理币，但在转账中每一分钱进行一次分离交易将是不切实际的。
为了允许价值被拆分和组合，交易包含多个输入和输出。
通常来自较大金额的前一笔交易的单一输入或联合多个较小金额的输入，并且最多连个输出：一个用于付款，另一个（如果有）返回找零给发送者。

![combining-splitting-value](https://mistydew.github.io/assets/images/bitcoin/whitepaper/combining-splitting-value.svg){:.border#center}

> It should be noted that fan-out, where a transaction depends on several transactions, and those 
> transactions depend on many more, is not a problem here.  There is never the need to extract a 
> complete standalone copy of a transaction's history.

应该指出，交易依赖多个交易，且这些交易依赖更多的交易，在这里不是一个问题。
从不需要提取完整的交易历史的独立副本。

> ## 10. Privacy
> 
> The traditional banking model achieves a level of privacy by limiting access to information to the 
> parties involved and the trusted third party.  The necessity to announce all transactions publicly 
> precludes this method, but privacy can still be maintained by breaking the flow of information in 
> another place: by keeping public keys anonymous.  The public can see that someone is sending 
> an amount to someone else, but without information linking the transaction to anyone.  This is 
> similar to the level of information released by stock exchanges, where the time and size of 
> individual trades, the "tape", is made public, but without telling who the parties were.

## 10. 隐私

传统的银行模式通过限制访问信息相关方和可信任的第三方来实现一定程度的隐私。
公开公布全部交易的必要性排除了这种方法，但隐私仍然可以通过打破另一个地方的信息流来维持：通过保持公钥匿名。
公众能够看到某人向某人发送一笔金额，但没有交易与任何人相关联的信息。
这和证券交易所发布的信息类似，其中个别交易的时间和大小的记录是公开的，但没有告知双方是谁。

![privacy](https://mistydew.github.io/assets/images/bitcoin/whitepaper/privacy.svg){:.border#center}

> As an additional firewall, a new key pair should be used for each transaction to keep them 
> from being linked to a common owner.  Some linking is still unavoidable with multi-input 
> transactions, which necessarily reveal that their inputs were owned by the same owner.  The risk 
> is that if the owner of a key is revealed, linking could reveal other transactions that belonged to 
> the same owner.

作为附加的防火墙，每笔交易都应该使用一个新密钥对，以防它们连接到共同所有者。
对于多输入交易，一些连接仍是不可避免的，这必然会表明它们的输入属于相同的所有者。
风险在于，如果所有者被揭露，则连接可揭示属于该所有者的其他交易。

> ## 11. Calculations
> 
> We consider the scenario of an attacker trying to generate an alternate chain faster than the honest 
> chain.  Even if this is accomplished, it does not throw the system open to arbitrary changes, such 
> as creating value out of thin air or taking money that never belonged to the attacker.  Nodes are 
> not going to accept an invalid transaction as payment, and honest nodes will never accept a block 
> containing them.  An attacker can only try to change one of his own transactions to take back 
> money he recently spent.

## 11. 计算

我们认为存在攻击者试图生成比诚实的链更快的替代链的场景。
尽管这个完成了，它也不会使系统面对任意的变化，比如凭空创造价值或不属于攻击者的钱。
节点不会接收无效的交易用作支付，诚实的节点永远不会接收一个包含这种交易的区块。
攻击者只能尝试改变他自己的交易，用来回收他最近花掉的钱。

> The race between the honest chain and an attacker chain can be characterized as a Binomial 
> Random Walk.  The success event is the honest chain being extended by one block, increasing its 
> lead by +1, and the failure event is the attacker's chain being extended by one block, reducing the 
> gap by -1.

诚实链和攻击者链之间的竞争可以描述为二项式随机游走。
成功的情况使诚实链延申一个区块，+1 领先，而失败的情况是攻击者链延申一个区块，间距 -1。

> The probability of an attacker catching up from a given deficit is analogous to a Gambler's 
> Ruin problem.  Suppose a gambler with unlimited credit starts at a deficit and plays potentially an 
> infinite number of trials to try to reach breakeven.  We can calculate the probability he ever 
> reaches breakeven, or that an attacker ever catches up with the honest chain, as follows [[8]](#references):
> 
> &emsp;p = probability an honest node finds the next block<br>
> &emsp;q = probability the attacker finds the next block<br>
> &emsp;q<sub>z</sub> = probability the attacker will ever catch up from z blocks behind

攻击者从给定的赤字中追赶的可能性类似于赌徒破产问题。
假设一个拥有无限信用的赌徒从赤字开始，并可能进行无限次尝试以达到收支平衡。
我们可以计算出他达到收支平衡的可能性，或攻击者追赶上诚实的链，如下：

&emsp;p = 诚实节点找到下一个块的概率<br>
&emsp;q = 攻击者找到下一个块的概率<br>
&emsp;q<sub>z</sub> = 攻击者将从后面 z 个块追赶上的概率

![math](https://latex.codecogs.com/svg.latex?\large%20q_{z}%20=%20\begin{Bmatrix}%201%20&%20if%20p%20\leqslant%20q%20\\%20\left%20(%20q%20/%20p%20\right%20)^{z}%20&%20if%20p%20%3E%20q%20\end{Bmatrix})

> Given our assumption that p > q, the probability drops exponentially as the number of blocks the 
> attacker has to catch up with increases.  With the odds against him, if he doesn't make a lucky 
> lunge forward early on, his chances become vanishingly small as he falls further behind.

根据我们的假设 p > q，随着攻击者追赶上的区块的增加，概率呈指数级减少。
如果他没有提前向前冲刺，赶上的机会会越来越小，因为他落单了。

> We now consider how long the recipient of a new transaction needs to wait before being 
> sufficiently certain the sender can't change the transaction.  We assume the sender is an attacker 
> who wants to make the recipient believe he paid him for a while, then switch it to pay back to 
> himself after some time has passed.  The receiver will be alerted when that happens, but the 
> sender hopes it will be too late.

我们现在考虑在发送人不能改变交易前，一笔新的交易的收款人需要等多久。
我们假设发送人是一个想让收款人详细他支付了一会了的攻击者，在过了一段时间后钱又回到他自己。
当发生这种情况时，这个收款人会收到警报，但发送者希望这个警报已经晚了。

> The receiver generates a new key pair and gives the public key to the sender shortly before 
> signing.  This prevents the sender from preparing a chain of blocks ahead of time by working on 
> it continuously until he is lucky enough to get far enough ahead, then executing the transaction at 
> that moment.  Once the transaction is sent, the dishonest sender starts working in secret on a 
> parallel chain containing an alternate version of his transaction.

收款人在签名前不久生成了一个新的密钥对并把公钥给了发送者。
这可以防止发送者提前准备好区块链，持续在该链上工作直到他有幸前进的足够远。
一旦交易被发送，不诚实的发送者开始在一条包含他替代版的交易的平行链上秘密工作。

> The recipient waits until the transaction has been added to a block and z blocks have been 
> linked after it.  He doesn't know the exact amount of progress the attacker has made, but 
> assuming the honest blocks took the average expected time per block, the attacker's potential 
> progress will be a Poisson distribution with expected value:

收款人等到交易添加到区块上且 z 个块被链接在该块后面。
他不知道攻击者进展的具体数量，但假设诚实的区块花费了每个区块被挖出的平均时间，攻击者的潜在进度将是具有预期值的泊松分布：

![math](https://latex.codecogs.com/svg.latex?\large%20\lambda%20=%20z%20\frac{q}{p})

> To get the probability the attacker could still catch up now, we multiply the Poisson density for 
> each amount of progress he could have made by the probability he could catch up from that point:

为了获得攻击者现在可能仍在追赶的概率，我们将泊松密度乘以他从那个点赶上额概率所取得的进步量：

![math](https://latex.codecogs.com/svg.latex?\large%20\sum_{k%20=%200}^{\infty}%20\frac{\lambda^{k}%20e^{-%20\lambda}}{k!}%20\cdot%20\begin{Bmatrix}%20\left%20(%20q%20/%20p%20\right%20)^{\left%20(%20z%20-%20k%20\right%20)}%20&%20if%20k%20\leqslant%20z%20\\%201%20&%20if%20k%20>%20z%20\end{Bmatrix})

> Rearranging to avoid summing the infinite tail of the distribution...

重新排列以避免对分布的无穷尾数求和...

![math](https://latex.codecogs.com/svg.latex?\large%201%20-%20\sum_{k=0}^{z}%20\frac{\lambda^{k}%20e^{-%20\lambda}}{k!}%20\left%20(%201%20-%20\left%20(%20q%20/%20p%20\right%20)^{\left%20(%20z%20-%20k%20\right%20)}%20\right%20))

> Converting to C code...

转换为 C 代码...

```c
#include <math.h>

double AttackerSuccessProbability(double q, int z)
{
	double p = 1.0 - q;
	double lambda = z * (q / p);
	double sum = 1.0;
	int i, k;
	for (k = 0; k <= z; k++)
	{
		double poisson = exp(-lambda);
		for (i = 1; i <= k; i++)
			poisson *= lambda / i;
		sum -= poisson * (1 - pow(q / p, z - k));
	}
	return sum;
}
```

> Running some results, we can see the probability drop off exponentially with z.

部分运行结果，我们可以看到概率随 z 呈指数下降。

```shell
q=0.1
z=0    P=1.0000000
z=1    P=0.2045873
z=2    P=0.0509779
z=3    P=0.0131722
z=4    P=0.0034552
z=5    P=0.0009137
z=6    P=0.0002428
z=7    P=0.0000647
z=8    P=0.0000173
z=9    P=0.0000046
z=10   P=0.0000012

q=0.3
z=0    P=1.0000000
z=5    P=0.1773523
z=10   P=0.0416605
z=15   P=0.0101008
z=20   P=0.0024804
z=25   P=0.0006132
z=30   P=0.0001522
z=35   P=0.0000379
z=40   P=0.0000095
z=45   P=0.0000024
z=50   P=0.0000006
```

> Solving for P less than 0.1%...

P 小于 0.1% 解决...

```shell
P < 0.001
q=0.10   z=5
q=0.15   z=8
q=0.20   z=11
q=0.25   z=15
q=0.30   z=24
q=0.35   z=41
q=0.40   z=89
q=0.45   z=340
```

> ## 12. Conclusion
> 
> We have proposed a system for electronic transactions without relying on trust.  We started with
> the usual framework of coins made from digital signatures, which provides strong control of
> ownership, but is incomplete without a way to prevent double-spending.  To solve this, we
> proposed a peer-to-peer network using proof-of-work to record a public history of transactions
> that quickly becomes computationally impractical for an attacker to change if honest nodes
> control a majority of CPU power.  The network is robust in its unstructured simplicity.  Nodes
> work all at once with little coordination.  They do not need to be identified, since messages are
> not routed to any particular place and only need to be delivered on a best effort basis.  Nodes can
> leave and rejoin the network at will, accepting the proof-of-work chain as proof of what
> happened while they were gone.  They vote with their CPU power, expressing their acceptance of
> valid blocks by working on extending them and rejecting invalid blocks by refusing to work on
> them.  Any needed rules and incentives can be enforced with this consensus mechanism.

## 12. 结论

我们提出了一个不依赖信任的电子交易系统。
我们从通用的数字签名铸币构架开始，它提供了强有力的所有权控制，但没有一种防止双重花费方法的它是不完善的。
为了解决该问题，我们提出了一个使用工作量证明来记录公共交易历史的点对点网络，如果诚实节点控制了大多数 CPU 算力，那么改变交易历史的攻击者很快就会在计算上变得不切实际。
该网络因其非结构化的简单性而健壮。
节点们只需很少的协调就能同时工作。
它们不需要被识别，因为消息不会被路由到任何特定地方，只需要尽最大努力传递。
节点可以随意离开和重新加入网络，接受工作量证明链作为它们离开后发生事件的证明。
它们使用其 CPU 算力投票，表示它们通过扩展有效区块来接受有效区块，通过拒绝在无效区块上工作来拒绝无效区块。
任何必要的规则和激励都可以通过这种共识机制强制执行。

> ## References
> 
> [1] W. Dai, "b-money," [http://www.weidai.com/bmoney.txt](http://www.weidai.com/bmoney.txt){:target="_blank"}, 1998.<br>
> [2] H. Massias, X.S. Avila, and J.-J. Quisquater, "[Design of a secure timestamping service with minimal 
> trust requirements](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.13.6228){:target="_blank"}," In 20th Symposium on Information Theory in the Benelux, May 1999.<br>
> [3] S. Haber, W.S. Stornetta, "[How to time-stamp a digital document](https://doi.org/10.1007/bf00196791){:target="_blank"}," In Journal of Cryptology, vol 3, no 
> 2, pages 99-111, 1991.<br>
> [4] D. Bayer, S. Haber, W.S. Stornetta, "[Improving the efficiency and reliability of digital time-stamping](https://doi.org/10.1007/978-1-4613-9323-8_24){:target="_blank"}," 
> In Sequences II: Methods in Communication, Security and Computer Science, pages 329-334, 1993.<br>
> [5] S. Haber, W.S. Stornetta, "[Secure names for bit-strings](https://doi.org/10.1145/266420.266430){:target="_blank"}," In Proceedings of the 4th ACM Conference 
> on Computer and Communications Security, pages 28-35, April 1997.<br>
> [6] A. Back, "[Hashcash - a denial of service counter-measure](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.15.8){:target="_blank"}," 
> [http://www.hashcash.org/papers/hashcash.pdf](http://www.hashcash.org/papers/hashcash.pdf){:target="_blank"}, 2002.<br>
> [7] R.C. Merkle, "[Protocols for public key cryptosystems](https://doi.org/10.1109/sp.1980.10006){:target="_blank"}," In Proc. 1980 Symposium on Security and 
> Privacy, IEEE Computer Society, pages 122-133, April 1980.<br>
> [8] W. Feller, "[An introduction to probability theory and its applications](https://archive.org/details/AnIntroductionToProbabilityTheoryAndItsApplicationsVolume1){:target="_blank"}," 1957.

## 参考链接

* [Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf){:target="_blank"} - 官方原版
* [Bitcoin: A Peer-to-Peer Electronic Cash System](https://git.dhimmel.com/bitcoin-whitepaper){:target="_blank"} - 非官方重新排版
