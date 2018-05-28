---
layout: post
title:  "比特币核心客户端 RPC 命令"
date:   2018-05-06 14:02:51 +0800
categories: Blockchain
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

{% highlight shell %}
$ bitcoin-cli -h # 获取以下帮助信息。
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

{% highlight shell %}
$ bitcoin-cli help # 获取以下 RPC 命令
{% endhighlight %}

**注：`()` 表示可以省略。**

== Blockchain ==<br>
[`getbestblockhash`](/2018/05/22/bitcoin-rpc-command-getbestblockhash) # 获取当前最佳块的哈希（16 进制形式）<br>
[`getblock "hash" ( verbose )`](/2018/05/22/bitcoin-rpc-command-getblock) # 获取相应区块的信息<br>
[`getblockchaininfo`](/2018/05/22/bitcoin-rpc-command-getblockchaininfo) # 获取区块链的信息<br>
[`getblockcount`](/2018/05/22/bitcoin-rpc-command-getblockcount) # 获取当前区块总数（或链高度，不包括创世区块）<br>
[`getblockhash index`](/2018/05/22/bitcoin-rpc-command-getblockhash) # 通过区块号（区块链高度）获取对应区块哈希（16 进制形式）<br>
[`getblockheader "hash" ( verbose )`](/2018/05/22/bitcoin-rpc-command-getblockheader) # 通过区块哈希获取对应区块头信息，verbose 为 true 或 false，默认为 true 获取详细信息，false 获取序列化的区块头<br>
[`getchaintips`](/2018/05/22/bitcoin-rpc-command-getchaintips) # 获取区块链尖信息（高度、最佳块哈希、分叉长度、链状态）<br>
[`getdifficulty`](/2018/05/22/bitcoin-rpc-command-getdifficulty) # 获取当前挖矿难度（浮点数）<br>
[`getmempoolinfo`](/2018/05/22/bitcoin-rpc-command-getmempoolinfo) # 获取交易内存池信息<br>
[`getrawmempool ( verbose )`](/2018/05/22/bitcoin-rpc-command-getrawmempool) # 获取交易内存池元信息（池中所有未打包交易的哈希），verbose 为 true 或 false，默认为 false 获取所有交易哈希，true 获取所有交易的详细信息<br>
[`gettxout "txid" n ( includemempool )`](/2018/05/23/bitcoin-rpc-command-gettxout) # 根据交易内存池中的交易号获取指定输出号 n 的信息。适用范围：所有交易<br>
[`gettxoutproof ["txid",...] ( blockhash )`](/2018/05/23/bitcoin-rpc-command-gettxoutproof)<br>
[`gettxoutsetinfo`](/2018/05/23/bitcoin-rpc-command-gettxoutsetinfo) # 获取交易输出设置信息（高度、最佳块哈希、总交易数、总输出数、...、当前发行量）<br>
[`verifychain ( checklevel numblocks )`](/2018/05/23/bitcoin-rpc-command-verifychain) # 验证链（默认：检查等级为 3，区块数为 288），true 表示已验证，false 表示未验证<br>
[`verifytxoutproof "proof"`](/2018/05/23/bitcoin-rpc-command-verifytxoutproof)

== Control ==<br>
[`getinfo`](/2018/05/23/bitcoin-rpc-command-getinfo) # 获取比特币核心信息<br>
[`help ( "command" )`](/2018/05/23/bitcoin-rpc-command-help) # 获取命令帮助信息<br>
[`stop`](/2018/05/23/bitcoin-rpc-command-stop) # 远程终止比特币核心服务

== Generating ==<br>
[`generate numblocks`](/2018/05/24/bitcoin-rpc-command-generate) # 生成指定数目个区块<br>
[`getgenerate`](/2018/05/25/bitcoin-rpc-command-getgenerate) # 获取挖矿状态<br>
[`setgenerate generate ( genproclimit )`](/2018/05/25/bitcoin-rpc-command-setgenerate) # 挖矿开关

== Mining ==<br>
`getblocktemplate ( "jsonrequestobject" )` # 获取区块模板（不包括随机数 nNonce）。前提：需要至少一条连接<br>
[`getmininginfo`](/2018/05/25/bitcoin-rpc-command-getmininginfo) # 获取挖矿信息<br>
[`getnetworkhashps ( blocks height )`](/2018/05/25/bitcoin-rpc-command-getnetworkhashps) # 获取全网算力<br>
[`prioritisetransaction <txid> <priority delta> <fee delta>`](/2018/05/28/bitcoin-rpc-command-prioritisetransaction) # 改变交易优先级<br>
[`submitblock "hexdata" ( "jsonparametersobject" )`](/2018/05/28/bitcoin-rpc-command-submitblock) # 提交区块

== Network ==<br>
`addnode "node" "add|remove|onetry"` # 添加指定节点，并执行相应操作（添加|移除|尝试连接一次）。注：添加不会主动连接<br>
`clearbanned` # 清空黑名单<br>
`disconnectnode "node"` # 断开连接指定的节点 "ip:port"<br>
`getaddednodeinfo dns ( "node" )`<br>
`getconnectioncount` # 获取当前与该节点建立连接的数目<br>
`getnettotals` # 获取网络总流量<br>
`getnetworkinfo` # 获取网络信息<br>
`getpeerinfo` # 获取与该节点建立连接的对端的信息<br>
`listbanned` # 列出黑名单<br>
`ping` # ping 一下，并不会显示 pong，没有任何反应表示当前 ping 的通<br>
`setban "ip(/netmask)" "add|remove" (bantime) (absolute)` # 设置黑名单（默认：屏蔽时间为 24h）

== Rawtransactions ==<br>
`createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime )`<br>
`decoderawtransaction "hexstring"` # 通过一笔交易的十六进制字符串获取其详细信息<br>
`decodescript "hex"`<br>
`fundrawtransaction "hexstring" includeWatching`<br>
`getrawtransaction "txid" ( verbose )` # 通过交易号获取元交易的十六进制字符串 hexstring，使用 getrawtransaction "txid" 1 可直接解码获取交易的详细信息<br>
`sendrawtransaction "hexstring" ( allowhighfees )`<br>
`signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype )`

== Util ==<br>
`createmultisig nrequired ["key",...]`<br>
`estimatefee nblocks`<br>
`estimatepriority nblocks`<br>
`estimatesmartfee nblocks`<br>
`estimatesmartpriority nblocks`<br>
`validateaddress "bitcoinaddress"`<br>
`verifymessage "bitcoinaddress" "signature" "message"`

== Wallet ==<br>
`abandontransaction "txid"` # 标记钱包内的一笔交易为抛弃，适用于未上链和不在交易内存池中的交易，对以已冲突的和已抛弃的交易无效。<br>
`addmultisigaddress nrequired ["key",...] ( "account" )`<br>
`backupwallet "destination"` # 备份钱包到指定文件（加密），默认存放在当前所在目录<br>
`dumpprivkey "bitcoinaddress"` # 导出指定 34bytes 公钥地址对应的 52bytes 私钥<br>
`dumpwallet "filename"` # 导出钱包到指定文件（明文），新建钱包会自动生成 101 个私钥公钥对，锁定钱包时无效<br>
`encryptwallet "passphrase"` # 使用明文密码加密钱包，只能设置一次，比特币服务会停止，重启以运行加密的钱包。密钥池已刷新（再次生成 101 个私钥公钥对），你需要重新备份<br>
`getaccount "bitcoinaddress"` # 获取公钥地址所属账户<br>
`getaccountaddress "account"` # 已过时，获取指定账户用于接收的比特币地址<br>
`getaddressesbyaccount "account"` # 获取指定账户下的所有公钥地址<br>
`getbalance ( "account" minconf includeWatchonly )` # 获取钱包或指定账户（已过时）的可用余额<br>
`getnewaddress ( "account" )` # 在指定账户下生成一个新地址，若不指定账户，默认为空账户 ""<br>
`getrawchangeaddress` # 获取元找零地址，用于元交易，非普通使用<br>
`getreceivedbyaccount "account" ( minconf )` # 获取指定账户接收到的总金额，非可用余额<br>
`getreceivedbyaddress "bitcoinaddress" ( minconf )` # 获取指定公钥地址接收到的总金额，非可用余额<br>
`gettransaction "txid" ( includeWatchonly )` # 通过交易号获取交易信息<br>
`getunconfirmedbalance` # 获取未确认（需要 6 个区块确认）的余额<br>
`getwalletinfo` # 获取钱包基本信息<br>
`importaddress "address" ( "label" rescan p2sh )`<br>
`importprivkey "bitcoinprivkey" ( "label" rescan )` # 导入私钥到当前钱包默认空帐户 "" 中<br>
`importpubkey "pubkey" ( "label" rescan )`<br>
`importwallet "filename"` # 导入指定的钱包文件<br>
`keypoolrefill ( newsize )` # 再填充钥匙池，新大小应大于当前大小，填充后的 "keypoolsize" = newsize + 1<br>
`listaccounts ( minconf includeWatchonly)` # 已过时，列出钱包中各账户及其可用余额<br>
`listaddressgroupings` # 列举有可用余额的地址及其所属账户。注：非所有地址<br>
`listlockunspent` # 列出所有锁定的未花费交易（包含交易号和输出号）<br>
`listreceivedbyaccount ( minconf includeempty includeWatchonly)` # 已过时，列出指定账户余额<br>
`listreceivedbyaddress ( minconf includeempty includeWatchonly)` # 列出所有接收到金额的公钥地址<br>
`listsinceblock ( "blockhash" target-confirmations includeWatchonly)` # 列出从指定块开始到现在钱包的所有交易（包括当前节点的挖矿奖励 coinbase 和所有普通交易）的信息以及最佳区块的哈希<br>
`listtransactions ( "account" count from includeWatchonly)` # 列出钱包的所有交易信息或指定账户的交易<br>
`listunspent ( minconf maxconf  ["address",...] )` # 列出所有未花费交易的信息（包括交易号、输出号、公钥地址、公钥脚本、金额、确认数和可花费状态）<br>
`lockunspent unlock [{"txid":"txid","vout":n},...]` # 锁定一笔未花费的交易，unlock 表示状态为布尔型，false 表示锁定<br>
`move "fromaccount" "toaccount" amount ( minconf "comment" )` # 账户间转移指定金额，可以移动超过本帐户的金额，出现负的账户金额，钱包总的可用余额不变<br>
`sendfrom "fromaccount" "tobitcoinaddress" amount ( minconf "comment" "comment-to" )` # 从指定账户发送指定金额到指定公钥地址<br>
`sendmany "fromaccount" {"address":amount,...} ( minconf "comment" ["address",...] )` # 从指定账户发送到多个公钥地址不同的金额<br>
`sendtoaddress "bitcoinaddress" amount ( "comment" "comment-to" subtractfeefromamount )` # 发送指定金额到指定公钥地址<br>
`setaccount "bitcoinaddress" "account"` # 设置公钥地址为指定账户<br>
`settxfee amount` # 设置交易费<br>
`signmessage "bitcoinaddress" "message"` # 创建一个 88bytes 的 base64 签名<br>
`walletlock` # 立刻锁定钱包，使 getinfo 获取的信息中 "unlocked_until" 字段置 0<br>
`walletpassphrase "passphrase" timeout` # 输入明文密码解锁钱包指定的时间，单位为 s<br>
`walletpassphrasechange "oldpassphrase" "newpassphrase"` # 修改钱包密码，不会导致比特币服务终止

## 参照
* [Bitcoin Core - Wikipedia](https://en.wikipedia.org/wiki/Bitcoin_Core)
* [JSON-RPC - Wikipedia](https://en.wikipedia.org/wiki/JSON-RPC)
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
