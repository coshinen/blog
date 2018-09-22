---
layout: post
title:  "启动比特币核心服务 bitcoind"
date:   2018-05-04 13:08:22 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: bitcoind 区块链 比特币
---
原始可用的比特币程序有两个版本；
一个带有图形化用户界面（通常被称为“比特币”），和一个“无头”版本（被称为 bitcoind，这里的“无头”指的是没有图形化界面，只有命令行）。
它们完全互相兼容，并使用相同的命令行参数，读取相同的配置文件，且读写相同的数据文件。
你可以在你的系统上一次运行一个比特币或 bitcoind 的副本（如果你不小心又启动来另一个，该副本会告诉你：比特币或 bitcoind 已经启动并且该程序将退出）。

## Linux 快速启动
使用命令行客户端启动（从头开始）的最简单方式，自动同步区块并创建一个钱包，只要在包含你的 bitcoind 二进制程序的目录运行下面命令（不带参数）：

{% highlight shell %}
./bitcoind
{% endhighlight %}

运行标准图形化界面：

{% highlight shell %}
./bitcoin-qt
{% endhighlight %}

## 命令行参数
以下命令来自于比特币核心版本 [v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)。

{% highlight shell %}
$ ./bitcoind --help -help-debug # 获取以下详细帮助。
Bitcoin Core Daemon version v0.12.1.0-61906ac
比特币核心守护进程版本 v0.12.1.0-意味不明

Usage:
用法：
  bitcoind [options]                     Start Bitcoin Core Daemon
  比特币核心 [选项]                      启动比特币核心守护进程

Options:
选项：

  -?
       This help message
       显示帮助信息并退出，使用 -h 或 -help 效果相同

  -version
       Print version and exit
       打印版本信息并退出

  -alerts
       Receive and display P2P network alerts (default: 0)
       接收并显示 P2P 网络警告（默认：0 表示关闭），包含版本升级等信息

  -alertnotify=<cmd>
       Execute command when a relevant alert is received or we see a really
       long fork (%s in cmd is replaced by message)
       收到相关警报时或我们看到一个很长的分支时执行命令（cmd 中的 %s 被消息替换）

  -blocknotify=<cmd>
       Execute command when the best block changes (%s in cmd is replaced by
       block hash)
       当最佳区块改变时执行命令（cmd 中的 %s 被区块哈希替换）

  -blocksonly
       Whether to operate in a blocks only mode (default: 0)
       是否以仅区块模式运行（默认：0）

  -checkblocks=<n>
       How many blocks to check at startup (default: 288, 0 = all)
       启动时检查多少区块（默认：288，0 表示全部区块）

  -checklevel=<n>
       How thorough the block verification of -checkblocks is (0-4, default: 3)
       -checkblocks 选项的区块验证有多全面（0-4，默认：3）

  -conf=<file>
       Specify configuration file (default: bitcoin.conf)
       指定配置文件（默认：~/.bitcoin/bitcoin.conf）

  -daemon
       Run in the background as a daemon and accept commands
       作为一个守护进程在后台运行并接收命令

  -datadir=<dir>
       Specify data directory
       指定数据目录

  -dbcache=<n>
       Set database cache size in megabytes (4 to 16384, default: 100)
       设置数据库缓存大小兆字节（4MB 到 16GB，默认：100MB）

  -loadblock=<file>
       Imports blocks from external blk000??.dat file on startup
       在启动时从外部 blk000?? 数据文件导入区块数据到内存

  -maxorphantx=<n>
       Keep at most <n> unconnectable transactions in memory (default: 100)
       在内存中保留最多 <n> 笔不可连接的交易（默认：100）

  -maxmempool=<n>
       Keep the transaction memory pool below <n> megabytes (default: 300)
       保持交易内存池大小低于 <n> 兆字节（默认：300MB）

  -mempoolexpiry=<n>
       Do not keep transactions in the mempool longer than <n> hours (default:
       72)
       不保持内存池中的交易超过 <n> 小时（默认：72h）

  -par=<n>
       Set the number of script verification threads (-1 to 16, 0 = auto, <0 =
       leave that many cores free, default: 0)
       设置脚本验证线程数（-1 到 16，0 = 自动，<0 = 根据 CPU 核数，默认：0）

  -pid=<file>
       Specify pid file (default: bitcoind.pid)
       指定 pid 进程号文件（默认：~/.bitcoin/bitcoind.pid）
       该文件用于保存当前运行的比特币核心进程号

  -prune=<n>
       Reduce storage requirements by pruning (deleting) old blocks. This mode
       is incompatible with -txindex and -rescan. Warning: Reverting this
       setting requires re-downloading the entire blockchain. (default: 0 =
       disable pruning blocks, >550 = target size in MiB to use for block
       files)
       通过修剪（删除）旧区块减少存储。该模式不兼容 -txindex 和 -rescan 选项。
       警告：恢复该设置需要重新下载整个区块链。
       （默认：0 = 禁止修剪区块，>550 = 适用于去快文件目标大小为 MiB）

  -reindex
       Rebuild block chain index from current blk000??.dat files on startup
       启动时从当前的 blk000?? 数据文件重建区块链索引

  -sysperms
       Create new files with system default permissions, instead of umask 077
       (only effective with disabled wallet functionality)
       使用系统默认权限创建新文件，代替掩码 077
       （仅在禁止钱包功能才有效）

  -txindex
       Maintain a full transaction index, used by the getrawtransaction rpc
       call (default: 0)
       维持一个全交易索引，用于 getrawtransaction rpc 调用（默认：0）

Connection options:
连接选项：

  -addnode=<ip>
       Add a node to connect to and attempt to keep the connection open
       添加一个连接到指定 ip 并尝试保持该连接打开的节点
       可以添加多个 ip，使用形式为 -addnode=<ip1> -addnode=<ip2>

  -banscore=<n>
       Threshold for disconnecting misbehaving peers (default: 100)
       断开与行为不当对端的连接的阈值（默认：100）

  -bantime=<n>
       Number of seconds to keep misbehaving peers from reconnecting (default:
       86400)
       从重新连接到保持与行为不当对端的连接的秒数（默认：24h）

  -bind=<addr>
       Bind to given address and always listen on it. Use [host]:port notation
       for IPv6
       绑定到给定地址并一直监听它。IPv6 使用“[本地主机]:端口”形式

  -connect=<ip>
       Connect only to the specified node(s)
       仅连接到指定的节点，与 -addnode 区别在于不作为一个节点，其他节点无法接入

  -discover
       Discover own IP addresses (default: 1 when listening and no -externalip
       or -proxy)
       发现自己的 IP 地址（默认：当监听中且没有 -externalip 或 -proxy 选项时为 1）

  -dns
       Allow DNS lookups for -addnode, -seednode and -connect (default: 1)
       允许 DNS 发现 -addnode，-seednode 和 -connect 选项指定的 IP 地址（默认：1 表示打开）

  -dnsseed
       Query for peer addresses via DNS lookup, if low on addresses (default: 1
       unless -connect)
       通过 DNS 发现查询对端地址，如果是子网地址（默认：1 除非使用 -connect 选项）

  -externalip=<ip>
       Specify your own public address
       指定你自己的公共地址（外网 IP）

  -forcednsseed
       Always query for peer addresses via DNS lookup (default: 0)
       总是通过 DNS 查找查询对端地址（默认：0）

  -listen
       Accept connections from outside (default: 1 if no -proxy or -connect)
       接受从外部接入的连接（默认：若没有 -proxy 或 -connect 选项则为 1）

  -listenonion
       Automatically create Tor hidden service (default: 1)
       自动创建洋葱裸游隐藏服务（默认：1 表示开启）

  -maxconnections=<n>
       Maintain at most <n> connections to peers (default: 125)
       最多维持的对端连接的个数 <n>（默认：125）

  -maxreceivebuffer=<n>
       Maximum per-connection receive buffer, <n>*1000 bytes (default: 5000)
       每条连接接收缓存的上限，<n>*1000 字节（默认：5000）

  -maxsendbuffer=<n>
       Maximum per-connection send buffer, <n>*1000 bytes (default: 1000)
       每条连接发送缓存的上限，<n>*1000 字节（默认：1000）

  -onion=<ip:port>
       Use separate SOCKS5 proxy to reach peers via Tor hidden services
       (default: -proxy)
       通过洋葱路由隐藏服务用于分离 SOCKS5 代理来连接到对端（默认：-proxy 选项）

  -onlynet=<net>
       Only connect to nodes in network <net> (ipv4, ipv6 or onion)
       仅连接到网络中的节点 <net>（ipv4，ipv6 或 洋葱路由）

  -permitbaremultisig
       Relay non-P2SH multisig (default: 1)
       中继非 P2SH 多重签名（默认：1）

  -peerbloomfilters
       Support filtering of blocks and transaction with bloom filters (default:
       1)
       使用 bloom 过滤器支持区块和交易的过滤（默认：1）

  -enforcenodebloom
       Enforce minimum protocol version to limit use of bloom filters (default:
       0)
       强制执行最小协议版本来限制布鲁姆过滤器的使用（默认：0）

  -port=<port>
       Listen for connections on <port> (default: 8222 or testnet: 18222)
       监听端口为 <port> 的连接（默认：8222 或测试网：18222）

  -proxy=<ip:port>
       Connect through SOCKS5 proxy
       通过 SOCKS5 代理连接

  -proxyrandomize
       Randomize credentials for every proxy connection. This enables Tor
       stream isolation (default: 1)
       随机化每个代理连接的凭据。这将启动洋葱路由流隔离（默认：1）

  -seednode=<ip>
       Connect to a node to retrieve peer addresses, and disconnect
       连接到一个节点用于取回对端地址集，然后断开连接

  -timeout=<n>
       Specify connection timeout in milliseconds (minimum: 1, default: 5000)
       指定连接超时的时间，单位为毫秒（最小：1ms，默认：5s）

  -torcontrol=<ip>:<port>
       Tor control port to use if onion listening enabled (default:
       127.0.0.1:9051)
       如果洋葱监听开启，用于洋葱路由控制端口（默认：127.0.0.1：9051）

  -torpassword=<pass>
       Tor control port password (default: empty)
       洋葱控制端口密码（默认：空）

  -whitebind=<addr>
       Bind to given address and whitelist peers connecting to it. Use
       [host]:port notation for IPv6
       绑定到给定地址并允许白名单的对端连接过来。对于 IPv6 使用“[主机]:端口”格式

  -whitelist=<netmask>
       Whitelist peers connecting from the given netmask or IP address. Can be
       specified multiple times. Whitelisted peers cannot be DoS banned and
       their transactions are always relayed, even if they are already in the
       mempool, useful e.g. for a gateway
       从给定掩码或 IP 地址连接的白名单对端。可以指定多次。白名单中的对端不会被
       禁止使用 Dos 且它们的交易总会被中继，尽管这些交易已经在交易内存池中，
       有用的例如一个网关

  -whitelistrelay
       Accept relayed transactions received from whitelisted peers even when
       not relaying transactions (default: 1)
       接受来自白名单中的对端节点接收的中继交易，即使不中继交易（默认：1）

  -whitelistforcerelay
       Force relay of transactions from whitelisted peers even they violate
       local relay policy (default: 1)
       强制来自白名单中的对端节点的交易的中继，甚至违反本地中继政策（默认：1）

  -maxuploadtarget=<n>
       Tries to keep outbound traffic under the given target (in MiB per 24h),
       0 = no limit (default: 0)
       尝试保持外部接入流量低于给定的目标值（单位：MB/d），0 = 无限制（默认：0）

Wallet options:
钱包选项：

  -disablewallet
       Do not load the wallet and disable wallet RPC calls
       不加载钱包并禁用钱包 RPC 调用

  -keypool=<n>
       Set key pool size to <n> (default: 100)
       设置钥匙池的大小为 <n>（默认：100）

  -fallbackfee=<amt>
       A fee rate (in BTC/kB) that will be used when fee estimation has
       insufficient data (default: 0.0002)
       一个费用估算不足时使用的费率（单位：BTC/kB）（默认：0.0002）

  -mintxfee=<amt>
       Fees (in BTC/kB) smaller than this are considered zero fee for
       transaction creation (default: 0.00001)
       费用（单位：BTC/kB）低于此值将被视为创建零交易费的交易（默认：0.00001）

  -paytxfee=<amt>
       Fee (in BTC/kB) to add to transactions you send (default: 0.00)
       添加到你发送的交易的费用（单位：BTC/kB），即交易费（默认：0.00）

  -rescan
       Rescan the block chain for missing wallet transactions on startup
       启动时再扫描区块链用于丢失的钱包交易

  -salvagewallet
       Attempt to recover private keys from a corrupt wallet.dat on startup
       启动时尝试从损坏的 wallet.dat 文件恢复私钥

  -sendfreetransactions
       Send transactions as zero-fee transactions if possible (default: 0)
       可能的话，发送交易作为 0 交易费的交易（默认：0）

  -spendzeroconfchange
       Spend unconfirmed change when sending transactions (default: 1)
       发送交易时花费未确认的找零（默认：1）

  -txconfirmtarget=<n>
       If paytxfee is not set, include enough fee so transactions begin
       confirmation on average within n blocks (default: 2)
       如果未设置 paytxfee，包含足够的交易费以至于交易在平均 n 个区块开始确认（默认：2）

  -maxtxfee=<amt>
       Maximum total fees (in BTC) to use in a single wallet transaction;
       setting this too low may abort large transactions (default: 0.10)
       单笔钱包交易中使用的最大总交易费（以 BTC 为单位）；
       设置该值太低可能会终止大型交易（默认：0.10）

  -upgradewallet
       Upgrade wallet to latest format on startup
       启动时升级钱包到最新格式

  -wallet=<file>
       Specify wallet file (within data directory) (default: wallet.dat)
       指定钱包文件（在数据目录中）（默认：wallet.dat）

  -walletbroadcast
       Make the wallet broadcast transactions (default: 1)
       使钱包广播交易（默认：1）

  -walletnotify=<cmd>
       Execute command when a wallet transaction changes (%s in cmd is replaced
       by TxID)
       一笔钱包交易变化时执行命令（cmd 中的 %s 通过 TxID 替换）

  -zapwallettxes=<mode>
       Delete all wallet transactions and only recover those parts of the
       blockchain through -rescan on startup (1 = keep tx meta data e.g.
       account owner and payment request information, 2 = drop tx meta data)
       删除全部钱包交易，只恢复启动时通过 -rescan 选项扫描的区块链的那些部分
       （1 表示保留交易元数据，例如：账户所有者和支付请求信息，2 表示丢弃交易元数据）

Debugging/Testing options:
调试/测试选项：

  -uacomment=<cmt>
       Append comment to the user agent string
       附加注释到用户代理字符串

  -checkblockindex
       Do a full consistency check for mapBlockIndex, setBlockIndexCandidates,
       chainActive and mapBlocksUnlinked occasionally. Also sets -checkmempool
       (default: 0)
       偶尔对 mapBlockIndex, setBlockIndexCandidates, chainActive and mapBlocksUnlinked
       进行完整的一致性检查。还设置 -checkmempool 选项（默认：0）

  -checkmempool=<n>
       Run checks every <n> transactions (default: 0)
       每 <n> 笔交易运行检查（默认：0）

  -checkpoints
       Disable expensive verification for known chain history (default: 1)
       关闭堆已知的链历史的昂贵的验证（默认：1）

  -dblogsize=<n>
       Flush wallet database activity from memory to disk log every <n>
       megabytes (default: 100)
       每 <n> 兆字节，刷新钱包数据库活动从内存到磁盘日志（默认：100）

  -disablesafemode
       Disable safemode, override a real safe mode event (default: 0)
       禁用安全模式，覆盖一个真正的安全模式事件（默认：0）

  -testsafemode
       Force safe mode (default: 0)
       强制安全模式（默认：0）

  -dropmessagestest=<n>
       Randomly drop 1 of every <n> network messages
       每 <n> 条网络消息随机丢弃 1 条

  -fuzzmessagestest=<n>
       Randomly fuzz 1 of every <n> network messages
       每 <n> 条网络消息随机模糊 1 条

  -flushwallet
       Run a thread to flush wallet periodically (default: 1)
       运行一个用于定期刷新钱包的线程（默认：1）

  -stopafterblockimport
       Stop running after importing blocks from disk (default: 0)
       在从磁盘导入区块后停止运行（默认：0）

  -limitancestorcount=<n>
       Do not accept transactions if number of in-mempool ancestors is <n> or
       more (default: 25)
       如果内存池中祖先的数量为 <n> 或更多则不接受交易（默认：25）

  -limitancestorsize=<n>
       Do not accept transactions whose size with all in-mempool ancestors
       exceeds <n> kilobytes (default: 101)
       不接受所有内存池中祖先超过 <n> 千字节大小的交易（默认：101）

  -limitdescendantcount=<n>
       Do not accept transactions if any ancestor would have <n> or more
       in-mempool descendants (default: 25)
       不接受内存池中任何祖先有 <n> 或更多数量后代的交易（默认：25）

  -limitdescendantsize=<n>
       Do not accept transactions if any ancestor would have more than <n>
       kilobytes of in-mempool descendants (default: 101).
       不接受内存池中任何祖先有超过 <n> 字节后代的交易（默认：101）

  -debug=<category>
       Output debugging information (default: 0, supplying <category> is
       optional). If <category> is not supplied or if <category> = 1, output
       all debugging information.<category> can be: addrman, alert, bench,
       coindb, db, lock, rand, rpc, selectcoins, mempool, mempoolrej, net,
       proxy, prune, http, libevent, tor, zmq.
       输出调试信息（默认：0，提供的 <category> 是可选的）。如果未提供 <category>
       或 <category> = 1，则输出全部的调试信息。<category> 可以是：addrman, alert,
       bench, coindb, db, lock, rand, rpc, selectcoins, mempool, mempoolrej,
       net, proxy, prune, http, libevent, tor, zmq.

  -nodebug
       Turn off debugging messages, same as -debug=0
       关闭调试信息，和 -debug=0 一样

  -gen
       Generate coins (default: 0)
       生成币（默认：0）

  -genproclimit=<n>
       Set the number of threads for coin generation if enabled (-1 = all
       cores, default: 1)
       设置产生币的线程数，如果开启（-1 表示所有核，默认：1）

  -help-debug
       Show all debugging options (usage: --help -help-debug)
       显示全部调试选项（用法：--help -help-debug）

  -logips
       Include IP addresses in debug output (default: 0)
       在调试输出中包含 IP 地址集（默认：0）

  -logtimestamps
       Prepend debug output with timestamp (default: 1)
       使用前置时间戳的调试输出（默认：1）

  -logtimemicros
       Add microsecond precision to debug timestamps (default: 0)
       添加微秒精度到调试时间戳（默认：0）

  -mocktime=<n>
       Replace actual time with <n> seconds since epoch (default: 0)
       使用格林尼治时间 <n> 秒替换真正的时间（默认：0）

  -limitfreerelay=<n>
       Continuously rate-limit free transactions to <n>*1000 bytes per minute
       (default: 15)
       连续比率限制免费交易到每分钟 <n>*1000 字节（默认：15）

  -relaypriority
       Require high priority for relaying free or low-fee transactions
       (default: 1)
       对于中继 0 或低交易费的交易需要的高优先级（默认：1）

  -maxsigcachesize=<n>
       Limit size of signature cache to <n> MiB (default: 40)
       限制签名缓存大小到 <n> Mib（默认：40）

  -minrelaytxfee=<amt>
       Fees (in BTC/kB) smaller than this are considered zero fee for relaying,
       mining and transaction creation (default: 0.00001)
       交易费（以 BTC/kB 为单位）低于此值会被认为是 0 交易费，用于中继，挖矿和交易的创建（默认：0.00001）

  -printtoconsole
       Send trace/debug info to console instead of debug.log file
       发送追踪/调试信息到控制台代替 dubug.log 文件

  -printpriority
       Log transaction priority and fee per kB when mining blocks (default: 0)
       当挖出块时记录交易优先级核每 kB 的交易费（默认：0）

  -privdb
       Sets the DB_PRIVATE flag in the wallet db environment (default: 1)
       在钱包数据库环境中设置 DB_PRIVATE 标志（默认：1）

  -shrinkdebugfile
       Shrink debug.log file on client startup (default: 1 when no -debug)
       在客户端启动时收缩 debug.log 文件（默认：1 没有 -debug 选项时）

Chain selection options:
链选择选项：（默认为主链）

  -testnet
       Use the test chain
       使用测试链

  -regtest
       Enter regression test mode, which uses a special chain in which blocks
       can be solved instantly. This is intended for regression testing tools
       and app development.
       进入回归测试模式，使用一个能够立刻生成块的特殊链。
       适用于回归测试工具和应用程序开发。

Node relay options:
节点中继选项：

  -acceptnonstdtxn
       Relay and mine "non-standard" transactions (testnet/regtest only;
       default: 1)
       中继和挖矿“非标准”交易（仅用于 testnet/regtest；默认：1）

  -bytespersigop
       Minimum bytes per sigop in transactions we relay and mine (default: 20)
       我们中继和挖矿交易中每个 sigop 的最小字节（默认：20）

  -datacarrier
       Relay and mine data carrier transactions (default: 1)
       中继和挖矿数据载体交易（默认：1）

  -datacarriersize
       Maximum size of data in data carrier transactions we relay and mine
       (default: 83)
       我们中继和挖矿的数据载体交易中数据的最大大小（默认：83）

  -mempoolreplacement
       Enable transaction replacement in the memory pool (default: 1)
       开启内存池交易替换（默认：1）

Block creation options:
区块创建选项：

  -blockminsize=<n>
       Set minimum block size in bytes (default: 0)
       设置区块大小的下限，单位为字节（默认：0）

  -blockmaxsize=<n>
       Set maximum block size in bytes (default: 750000)
       设置区块大小的上限，单位为字节（默认：750000B < 1MB）

  -blockprioritysize=<n>
       Set maximum size of high-priority/low-fee transactions in bytes
       (default: 0)
       设置高优先级与低交易费比的交易大小的上限，单位为字节（默认：0）

  -blockversion=<n>
       Override block version to test forking scenarios
       覆盖区块版本用于测试分叉场景

RPC server options:
RPC 服务选项：

  -server
       Accept command line and JSON-RPC commands
       接受命令行和 JSON-RPC 命令

  -rest
       Accept public REST requests (default: 0)
       接受公共 REST 请求（默认：0 表示关闭）

  -rpcbind=<addr>
       Bind to given address to listen for JSON-RPC connections. Use
       [host]:port notation for IPv6. This option can be specified multiple
       times (default: bind to all interfaces)
       绑定给定地址用于监听 JSON-RPC 连接。对于 IPv6 使用“[主机]:端口”的形式。
       该选项可以指定多次（默认：绑定所有接口）

  -rpccookiefile=<loc>
       Location of the auth cookie (default: data dir)
       验证 cookie 文件的位置（默认：数据目录 "~/.bitcoin/.cookie"）

  -rpcuser=<user>
       Username for JSON-RPC connections
       JSON-RPC 连接的用户名

  -rpcpassword=<pw>
       Password for JSON-RPC connections
       JSON-RPC 连接的密码

  -rpcauth=<userpw>
       Username and hashed password for JSON-RPC connections. The field
       <userpw> comes in the format: <USERNAME>:<SALT>$<HASH>. A canonical
       python script is included in share/rpcuser. This option can be specified
       multiple times
       JSON-RPC 连接的用户名和哈希过的密码。<userpw> 区域的格式：<用户名>:<盐值>$<哈希>。
       share/rpcuser 中包含一个规范的 python 脚本。该选项可以指定多次

  -rpcport=<port>
       Listen for JSON-RPC connections on <port> (default: 8221 or testnet:
       18221)
       监听的 JSON-RPC 连接的端口（默认：8221 或 测试网：18221）

  -rpcallowip=<ip>
       Allow JSON-RPC connections from specified source. Valid for <ip> are a
       single IP (e.g. 1.2.3.4), a network/netmask (e.g. 1.2.3.4/255.255.255.0)
       or a network/CIDR (e.g. 1.2.3.4/24). This option can be specified
       multiple times
       允许地址源（ip）的 JSON-RPC 连接。有效的 <ip> 是一个单一 IP（例：1.2.3.4），
       一个网络/掩码（例：1.2.3.4/255.255.255.0）或一个网络/CIDR（例：1.2.3.4/24）。
       该选项可以指定多次

  -rpcthreads=<n>
       Set the number of threads to service RPC calls (default: 4)
       设置用于 RPC 调用服务的线程数（默认：4）

  -rpcworkqueue=<n>
       Set the depth of the work queue to service RPC calls (default: 16)
       设置用于 RPC 调用服务的工作队列深度（默认：16）

  -rpcservertimeout=<n>
       Timeout during HTTP requests (default: 30)
       HTTP 请求的超时时间（默认：30s）
{% endhighlight %}

## 比特币配置文件样例

> # 打印调试信息到控制台<br>
> #printtoconsole=1<br>
> # 后台运行<br>
> daemon=1<br>
> # 开启 CPU 挖矿（默认挖矿线程数为 1）<br>
> gen=1<br>
> # RPC 验证信息（用户名、密码）<br>
> rpcuser=myusername<br>
> rpcpassword=mypasswd<br>
> # RPC 白名单（外网 IP）<br>
> rpcallowip=xxx.xxx.xxx.xxx<br>
> ...

来自 [https://github.com/mistydew/blockchain/blob/master/bitcoin.conf](https://github.com/mistydew/blockchain/blob/master/bitcoin.conf):

## 参照
* [Running Bitcoin - Bitcoin Wiki](https://en.bitcoin.it/wiki/Running_Bitcoin)
* [bitcoin.conf](https://github.com/mistydew/blockchain/blob/master/bitcoin.conf)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
