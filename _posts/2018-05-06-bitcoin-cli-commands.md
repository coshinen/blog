---
layout: post
title:  "比特币核心客户端 RPC 命令"
date:   2018-05-06 14:02:51 +0800
categories: jekyll update
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## bitcoin-cli 命令行参数
带有 JSON-RPC 接口的基于命令行的守护进程 bitcoind 与 Bicoin Core 绑定在一起。
它也提供访问公共测试网 testnet，一个全球的测试环境，使用一个使用无价值的“测试比特币”替代区块链模仿比特币主网。
回归测试网 regtest 或回归测试模式 Regression Test Mode 创建了一个用作本地测试环境的私有区块链。
最终，一个允许用户发送 RPC 命令到 bitcoind 的简单程序 bitcoin-cli 也包含在比特币核心内。

### 基础命令
> `$ bitcoin-cli -h` 获取以下帮助信息。
{% highlight C++ %}
Bitcoin Core RPC client version v0.12.1.0-f61a24e
比特币核心 RPC 客户端版本 v0.12.1.0-意味不明

Usage:
用法：共 3 种，[] 表示可以省略，单纯的使用 Options 选项不需要 bitcoind，而 help 和 <command> 都需要 bitcoind
  bitcoin-cli [options] <command> [params]  Send command to Bitcoin Core # 发送 RPC 命令到比特币核心 bitcoind
  bitcoin-cli [options] help                List commands # 列出 RPC 命令
  bitcoin-cli [options] help <command>      Get help for a command # 获取一条命令的帮助信息（用法示例）

Options:
选项：

  -?
       This help message
       该程序的帮助信息，同 -h 或 -help 选项

  -conf=<file>
       Specify configuration file (default: bitcoin.conf)
       指定配置文件（默认：~/.bitcoin/bitcoin.conf）

  -datadir=<dir>
       Specify data directory
       指定数据目录

Chain selection options:
链选择选项（默认主网）：

  -testnet
       Use the test chain
       使用公共测试链

  -regtest
       Enter regression test mode, which uses a special chain in which blocks
       can be solved instantly. This is intended for regression testing tools
       and app development.
       进入回归测试模式，使用一条特殊的链，可以立刻解决产块的问题。
       这是专门用于回归测试工具和应用程序开发的。

  -rpcconnect=<ip>
       Send commands to node running on <ip> (default: 127.0.0.1)
       发送命令到运行在 <ip> 上的节点（默认：127.0.0.1）

  -rpcport=<port>
       Connect to JSON-RPC on <port> (default: 8221 or testnet: 18221)
       连接到指定 <port> 上的 JSON-RPC（默认：8221 或 公共测试网：18221）

  -rpcwait
       Wait for RPC server to start
       等待 RPC 服务启动

  -rpcuser=<user>
       Username for JSON-RPC connections
       JSON-RPC 连接的用户名

  -rpcpassword=<pw>
       Password for JSON-RPC connections
       JSON-RPC 连接的密码

  -rpcclienttimeout=<n>
       Timeout during HTTP requests (default: 900)
       HTTP 请求的超时时间（默认：900s）
{% endhighlight %}

### RPC 命令（需要 bitcoind）
> `$ bitcoin-cli help` 获取以下 RPC 命令。
{% highlight C++ %}
== Blockchain ==
getbestblockhash # 获取当前区块链最佳块的哈希值
getblock "hash" ( verbose ) # 通过区块哈希获取对应区块的详细信息
getblockchaininfo # 获取区块链的信息
getblockcount # 获取当前区块主链上的总区块数
getblockhash index # 通过区块索引（区块号）获取区块哈希
getblockheader "hash" ( verbose ) # 通过区块哈希获取对应区块头信息
getchaintips # 获取区块链尖的基本信息（高度、最佳块哈希、分叉长度、链状态）
getdifficulty # 获取当前挖矿难度
getmempoolinfo # 获取交易内存池信息
getrawmempool ( verbose ) # 获取交易内存池中所有的交易索引
gettxout "txid" n ( includemempool ) # 根据交易内存池中的交易号获取指定输出号 n 的信息。适用范围：所有交易
gettxoutproof ["txid",...] ( blockhash )
gettxoutsetinfo # 获取交易输出设置信息（高度、最佳块哈希、总交易数、总输出数、...、当前发行量）
verifychain ( checklevel numblocks ) # 验证链（默认：检查等级为 3，区块数为 288），true 表示已验证，false 表示未验证
verifytxoutproof "proof"

== Control ==
getinfo # 获取当前区块链的基本信息
help ( "command" ) # 获取 RPC 命令帮助
stop # 远程终止 bitcoind

== Generating ==
generate numblocks # regtest 回归测试网下立刻产生指定数目的块
getgenerate # 获取当前的挖矿状态，true 表示开启，false 表示关闭
setgenerate generate ( genproclimit ) # 设置挖矿状态和线程数，线程数默认为 1

== Mining ==
getblocktemplate ( "jsonrequestobject" ) # 获取区块模板（不包括随机数 nNonce）。前提：需要至少一条连接
getmininginfo # 获取当前的挖矿信息
getnetworkhashps ( blocks height ) # 获取区块链当前（或指定）高度的网络算力
prioritisetransaction <txid> <priority delta> <fee delta>
submitblock "hexdata" ( "jsonparametersobject" )

== Network ==
addnode "node" "add|remove|onetry" # 添加指定节点，并执行相应操作（添加|移除|尝试连接一次）。注：添加不会主动连接
clearbanned # 清空黑名单
disconnectnode "node" # 断开连接指定的节点 "ip:port"
getaddednodeinfo dns ( "node" )
getconnectioncount # 获取当前与该节点建立连接的数目
getnettotals # 获取网络总流量
getnetworkinfo # 获取网络信息
getpeerinfo # 获取与该节点建立连接的对端的信息
listbanned # 列出黑名单
ping # ping 一下，并不会显示 pong，没有任何反应表示当前 ping 的通
setban "ip(/netmask)" "add|remove" (bantime) (absolute) # 设置黑名单（默认：屏蔽时间为 24h）

== Rawtransactions ==
createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime )
decoderawtransaction "hexstring"
decodescript "hex"
fundrawtransaction "hexstring" includeWatching
getrawtransaction "txid" ( verbose )
sendrawtransaction "hexstring" ( allowhighfees )
signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype )

== Util ==
createmultisig nrequired ["key",...]
estimatefee nblocks
estimatepriority nblocks
estimatesmartfee nblocks
estimatesmartpriority nblocks
validateaddress "bitcoinaddress"
verifymessage "bitcoinaddress" "signature" "message"

== Wallet ==
abandontransaction "txid" # 标记钱包内的一笔交易为抛弃，适用于未上链和不在交易内存池中的交易，对以已冲突的和已抛弃的交易无效。
addmultisigaddress nrequired ["key",...] ( "account" )
backupwallet "destination"
dumpprivkey "bitcoinaddress"
dumpwallet "filename"
encryptwallet "passphrase"
getaccount "bitcoinaddress"
getaccountaddress "account"
getaddressesbyaccount "account"
getbalance ( "account" minconf includeWatchonly )
getnewaddress ( "account" )
getrawchangeaddress
getreceivedbyaccount "account" ( minconf )
getreceivedbyaddress "bitcoinaddress" ( minconf )
gettransaction "txid" ( includeWatchonly )
getunconfirmedbalance
getwalletinfo
importaddress "address" ( "label" rescan p2sh )
importprivkey "bitcoinprivkey" ( "label" rescan )
importpubkey "pubkey" ( "label" rescan )
importwallet "filename"
keypoolrefill ( newsize )
listaccounts ( minconf includeWatchonly)
listaddressgroupings
listlockunspent
listreceivedbyaccount ( minconf includeempty includeWatchonly)
listreceivedbyaddress ( minconf includeempty includeWatchonly)
listsinceblock ( "blockhash" target-confirmations includeWatchonly)
listtransactions ( "account" count from includeWatchonly)
listunspent ( minconf maxconf  ["address",...] )
lockunspent unlock [{"txid":"txid","vout":n},...]
move "fromaccount" "toaccount" amount ( minconf "comment" )
sendfrom "fromaccount" "tobitcoinaddress" amount ( minconf "comment" "comment-to" )
sendmany "fromaccount" {"address":amount,...} ( minconf "comment" ["address",...] )
sendtoaddress "bitcoinaddress" amount ( "comment" "comment-to" subtractfeefromamount )
setaccount "bitcoinaddress" "account"
settxfee amount # 设置交易费
signmessage "bitcoinaddress" "message"
{% endhighlight %}

## 参照
* [Bitcoin Core - Wikipedia](https://en.wikipedia.org/wiki/Bitcoin_Core)
* [JSON-RPC - Wikipedia](https://en.wikipedia.org/wiki/JSON-RPC)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
