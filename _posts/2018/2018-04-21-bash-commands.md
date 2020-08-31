---
layout: post
title:  "一些常用的 Bash 命令行"
date:   2018-04-21 18:58:02 +0800
author: mistydew
comments: true
category: 程序人生
tags: Bash CLI
excerpt: 一些常用的 Bash 命令行。
---
## 列出文件（list）

```shell
$ ls <dir> # 列出指定目录的所有文件名，<dir> 为目录的路径（不含以 . 开头的隐藏文件）
$ ls -l <dir> # 列出指定目录的所有文件的详细信息（不含隐藏文件），分别为文件属性（类型、权限）、连接数、所属者、所属组、大小（字节）、日期、文件名
$ ls -a <dir> # 列出指定目录的所有文件名（含隐藏文件）
$ ls -R <dir> # 递归列出指定目录的所有文件名
```

## 切换目录（change directory）

```shell
$ cd <dir> # 切换至指定目录，<dir> 为目录路径
$ cd .. # 切换至上一级目录
$ cd - # 切换至上一个工作目录
$ cd [~] # 切换至用户家目录
```

## 创建文件

```shell
$ touch <file> # 创建一个空文件，<file> 为文件路径
$ mkdir <dir> # 创建一个空目录，<dir> 为目录路径
$ mkdir -p <dir1>/<dir2> # 创建嵌套的空目录，<dir2> 为 <dir1> 的子目录
$ echo <content> >> <file> # 重定向指定内容到指定文件的后面（若文件不存在则新建一个）
```

## 查找文件（find）

```shell
$ find <dir> -name <file> -type <type> # 以指定目录为起始目录，列出指定类型的文件路径，<dir> 为目录路径，<file> 为文件路径，<type> 为文件类型
$ find <dir> -empty # 以指定目录为起始目录，列出所有大小为 0 的文件路径
$ find <dir> -name <file> -print 2>/dev/null # 以指定目录为起始目录，列出指定文件的路径（把标准错误缓冲区的内容导入 /dev/null 以加快查找速度）
```

## 删除文件（remove）

```shell
$ rm <file> # 删除指定文件，<file> 为文件路径
$ rmdir <dir> # 只能删除指定的空目录，<dir> 为目录路径
$ rm <dir> -rf # 递归删除指定的目录及其包含的全部文件，不显示任何信息
$ find <dir> -name <file> | xargs rm # 批量删除指定目录的所有指定文件
```

**注：慎用 "$ sudo rm / -rf"，详见[多一个空格会发生什么？](https://github.com/MrMEEE/bumblebee-Old-and-abbandoned/commit/6cd6b2485668e8a87485cb34ca8a0a937e73f16d){:target="_blank"}**

## 搜索内容（grep）

```shell
$ grep <content> <file> -n # 列出指定文件中出现的所有指定字符串的行号，<content> 为字符串，<file> 为文件路径
$ grep <content> <dir> -nri # 递归列出指定目录中出现的所有指定字符串的文件名及行号（字符串不区分大小写），<dir> 为目录路径
```

## 重命名文件（rename）

```shell
$ find <dir> -exec rename 's/<from>/<to>/' {} ";" # 批量重命名指定目录的所有含字符串 <from> 文件名到 <to>，<dir> 为目录路径
```

## 字符串替换（sed）

```shell
$ sed -i [''] 's/<from>/<to>/g' <file> # 把指定文件中的字符串 <from> 全部改为 <to>，<file> 为文件路径（macOS 下需指定备份文件后缀，若字符串为空则不备份）
$ sed -i '/<content>/,+1d' <file> # 把指定文件中的含字符串 <content> 的行及其下一行移除
$ sed -i '/<content>/i\<new>' <file> # 在指定文件中含字符串 <content> 的行上面新增一行内容 <new>（i 为在其上面新增，a 相反）
$ find <dir> -type f -print0 | xargs -0 sed -i 's/<from>/<to>/g' # 把指定目录的所有文件中的字符串 <from> 全部改为 <to>，<dir> 为目录路径
```

## 查看文件（cat）

```shell
$ cat -A <file> # 把指定文件的内容全部输出至标准输出，<file> 为文件路径（-A 用于显示不可打印字符，行尾换行显示为 $）
$ more <file> # 滚动查看指定文件的内容（return 键查看下一行，space 键查看下一屏，B 键查看上一屏,Q 退出）
```

## 统计文件（wc）

```shell
$ wc -l <file> # 统计指定文件的行数，<file> 为文件路径（-c 统计字符数即文件大小字节数，-w 统计字数）
$ ls -lR | grep "^-" | wc -l # 统计指定目录及其子目录下普通文件个数（"^d" 统计目录文件）
```

## 链接文件（link）

```shell
$ ln <file1> <file2> # 创建文件 <file1> 的硬链接 <file2>，删除源文件不影响其硬链接文件
$ ln -s <file1> <file2> # 创建文件 <file1> 的软链接 <file2>，删除源文件后其软链接文件失效
```

## 域名信息查询（domain name system lookup）

```shell
$ nslookup <url> # 查询指定域名 <url> 的真正域名和对应 IP（<url> 可能是别名，例如百度）
```

## 增删用户（useradd/del）

```shell
$ sudo useradd -m <user> -s /bin/bash # 添加一个用户，<user> 为用户名（-m 参数为该用户在家目录下创建同名目录，-s 参数为该用户指定 bash 脚本编译器）
$ sudo userdel -d <user> -s -g # 删除指定用户（-d 删除用户家目录，-s 使用的 bash，-g 用户所属组）
$ sudo cat /etc/passwd # 查看用户信息
$ sudo cat /etc/shadow # 查看用户的密码（密文）
```

## 修改用户密码（passwd）

```shell
$ sudo passwd [root] # 初始化 root 用户密码
$ passwd [current_user] # 修改当前用户密码
$ sudo passwd [other_user] # 修改其他用户密码
```

## 编辑超级用户（visudo/sudoers）

```shell
$ sudo visudo # 打开 /etc/sudoers.tmp 文件
```

添加超级用户：

> \# User privilege specification<br>
> root ALL=(ALL:ALL) ALL<br>
> user ALL=(ALL:ALL) ALL

## 添加/删除用户组（groupadd/del）

```shell
$ sudo groupadd <groupname> # 添加用户组
$ sudo groupdel <groupname> # 删除指定用户组（<groupname> 不能为主组）
$ sudo usermod -G <groupname> <username> # 把指定用户添加到指定组（-G 修改用户的组）
$ sudo cat /etc/group # 查看组信息
```

## 更改文件所属用户/组（change owner）

```shell
$ chown <username> <file> # 改变指定文件所属用户名，<file> 为文件路径
$ chown <username>:<group> <file> # 改变指定文件所属用户名和所属组
```

**注：只有文件创建者和 root 用户才能使用此命令，且 `<username>` 必须是本机存在的用户名。本机用户名记录在 "/etc/passwd" 文件中。**

## 更改文件所属组（change group）

```shell
$ chgrp <group> <file> # 改变指定文件所属组，<file> 为文件路径
```

**注：只有文件创建者和 root 用户才能使用此命令，且 `<group>` 必须是本机存在的组。本机用户所属组记录在 "/etc/group" 文件中。**

## 进程的前后台切换（& jobs fg bg）

```shell
$ ./<ELF> & #把指定程序放到后台运行
$ jobs # 列出后台运行的程序（含 Ctrl+Z 暂停的进程及其序号和运行状态）
$ fg n # 把后台序号为 n 的任务拉到前台运行
$ Ctrl + Z # 把当前前台运行的程序放到后台并挂起
$ bg n # 使后台序号为 n 的任务继续运行
```

## 列出打开文件的进程（list open file）

```shell
$ lsof -i [:<port>] # 列出占用指定端口的所有进程（-i 指定条件）
$ lsof -i tcp/udp[:<port>] # 列出占用 tcp/udp 指定端口的进程
```

## 发信号到进程（kill）

```shell
$ kill -l # 列出全部信号
 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP
 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1
11) SIGSEGV     12) SIGUSR2     13) SIGPIPE     14) SIGALRM     15) SIGTERM
16) SIGSTKFLT   17) SIGCHLD     18) SIGCONT     19) SIGSTOP     20) SIGTSTP
21) SIGTTIN     22) SIGTTOU     23) SIGURG      24) SIGXCPU     25) SIGXFSZ
26) SIGVTALRM   27) SIGPROF     28) SIGWINCH    29) SIGIO       30) SIGPWR
31) SIGSYS      34) SIGRTMIN    35) SIGRTMIN+1  36) SIGRTMIN+2  37) SIGRTMIN+3
38) SIGRTMIN+4  39) SIGRTMIN+5  40) SIGRTMIN+6  41) SIGRTMIN+7  42) SIGRTMIN+8
43) SIGRTMIN+9  44) SIGRTMIN+10 45) SIGRTMIN+11 46) SIGRTMIN+12 47) SIGRTMIN+13
48) SIGRTMIN+14	49) SIGRTMIN+15	50) SIGRTMAX-14	51) SIGRTMAX-13	52) SIGRTMAX-12
53) SIGRTMAX-11 54) SIGRTMAX-10 55) SIGRTMAX-9  56) SIGRTMAX-8  57) SIGRTMAX-7
58) SIGRTMAX-6  59) SIGRTMAX-5  60) SIGRTMAX-4  61) SIGRTMAX-3  62) SIGRTMAX-2
63) SIGRTMAX-1  64) SIGRTMAX
$ kill -9 <pid> # 杀死指定进程
$ kill -19 <pid> # 暂停指定进程（效果同 Ctrl + Z）
```

## 统计时间（time）

```shell
$ time <command> # 统计执行指定命令所花费的时间
```

## 修改时区（time date control）

```shell
$ timedatectl status # 查看系统时间和日期
$ timedatectl set-timezone "Asia/Shanghai" # 修改系统时区为中国上海
$ timedatectl set-local-rtc 1 # 把实时时钟设置为本地时间，0 表示设置为 UTC（适用于 Windows/Linux 双系统）
```

## 查看磁盘

```shell
$ du -sh <dir> # 查看指定目录中所有文件的总大小，<dir> 为目录路径（-s/--summarize 表示总和，-h/--human-readable 表示以人类可读的方式显示信息）
$ df -h # 查看磁盘各分区的使用情况
$ fdisk -l # 查看磁盘及其分区的详细信息（若不显示信息则需要提升权限）
```

## 显示登陆用户（w）

```shell
$ w # 列出目前登陆的用户及其正在执行的命令
```

## 远程安全连接（Secure Shell）

```shell
$ ssh <username>@<hostname> # 连接至指定“用户名@主机 IP”的主机，根据提示输入相应密码
```

## 远程安全拷贝（secure copy）

```shell
$ scp <file> <username>@<ip>:<dir> # 复制指定的本地文件到远程主机的指定目录下，<file> 为文件路径，<dir> 为目录路径
$ scp <username>@<ip>:<file> <dir> # 复制远程主机下的指定文件到本地指定目录下
```

## 精简可执行文件（strip）

```shell
$ strip <ELF> # 通过删除可执行文件中的调试符号等相关信息以减少其大小（此操作不可逆）
```

## 参考链接

* [torvalds/linux: Linux kernel source tree](https://github.com/torvalds/linux){:target="_blank"}
