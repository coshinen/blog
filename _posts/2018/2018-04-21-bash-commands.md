---
layout: post
title:  "Bash 常用操作"
date:   2018-04-21 18:58:02 +0800
author: Coshin
comments: true
category: 程序人生
tags: Bash CLI
---
14 个 Linux 终端快捷键和若干命令。

![linux-terminal-shortcuts](https://linuxhandbook.com/content/images/2020/07/linux-terminal-shortcuts-1.jpeg){:.border}

1. `Tab`：自动补全。
输入一个命令、文件名、目录名或命令选项的开头，然后按 `tab` 键，将自动完成输入的内容，或者显示全部可能的结果。
2. `Ctrl` + `C`：中断命令或进程。
用于停止一个在前台运行的程序。
3. `Ctrl` + `Z`：把在前台运行的程序送到后台运行。
如果运行程序时忘记使用 `&` 选项，可以使用这对组合键。
4. `Ctrl` + `D`：退出当前终端。
替代 `exit` 命令。
5. `Ctrl` + `L`：清空终端屏幕。
替代 `clear` 命令。
6. `Ctrl` + `A`：移动光标到行首。
用于输入了一个很长的命令或路径，并且想要回到它的开头。
7. `Ctrl` + `E`：移动光标到行尾。
8. `Ctrl` + `U`：擦除光标到行首间的内容。
当输入错误命令时，代替退格键丢弃当前命令。
9. `Ctrl` + `K`：擦除光标到行尾间的内容。
10. `Ctrl` + `W`：擦除光标前的一个单词。
如果光标在一个单词身上，将擦除光标到词首的字母。
11. `Ctrl` + `Y`：粘贴使用 `Ctrl` + `U`、`K` 和 `W` 快捷键擦除的文本。
用于错误删除文本或需要在某处使用已擦除的文本。
12. `Ctrl` + `P`：显示上一个命令。
13. `Ctrl` + `N`：显示下一个命令。
14. `Ctrl` + `R`：搜索历史命令。
历史命令保存在文件 `~/.bash_history` 中。

## 列出文件（list）

`$ ls <dir>`

列出指定目录下所有文件名（不含隐藏文件）。

`$ ls -l <dir>`

列出指定目录下所有文件的详细信息（不含隐藏文件），分别为文件属性（类型、权限）、连接数、所属者、所属组、大小（字节）、日期、文件名。

`$ ls -a <dir>`

列出指定目录下所有文件名（含隐藏文件）。

`$ ls -R <dir>`

递归列出指定目录下所有文件名。

## 切换目录（change directory）

`$ cd <dir>`

切换到指定目录。

`$ cd ..`

切换到上一级目录。

`$ cd -`

切换到上一个工作目录。

`$ cd [~]`

切换到用户家目录。

## 创建文件

`$ touch <file>`

创建一个空文件。

`$ mkdir <dir>`

创建一个空目录。

`$ mkdir -p <dir1>/<dir2>`

创建嵌套的空目录（若父目录不存在则新建）。

`$ echo <content> >> <file>`

重定向指定内容到指定文件的尾部（若文件不存在则新建）。

## 查找文件（find）

`$ find <dir> -name <file> -type <type> -print 2>/dev/null`

以指定目录为起始目录，查找指定类型的文件位置（把标准错误缓冲区的内容导入 `/dev/null` 以加快查找速度）。

`$ find <dir> -empty`

以指定目录为起始目录，查找所有大小为 0 的文件位置。

## 删除文件（remove）

`$ rm <file>`

删除指定文件。

`$ rm <dir> -rf`

递归删除指定的目录及其包含的全部文件（`-f` 不显示任何信息）。
**慎用 `$ sudo rm / -rf`。**

`$ rmdir <dir>`

删除指定的空目录。

`$ find <dir> -name <file> | xargs rm`

批量删除指定目录下的指定文件。

## 搜索内容（grep）

`$ grep <content> <file> -n`

列出指定文件中出现的所有指定字符串的行号。

`$ grep <content> <dir> -nri`

递归列出指定目录中出现的所有指定字符串的文件名及行号（`-i` 表示字符不区分大小写）。

## 重命名文件（rename）

`$ find <dir> -exec rename 's/<from>/<to>/' {} ";"`

批量重命名指定目录的所有含字符串 `<from>` 文件名到 `<to>`。

## 字符串替换（sed）

`$ sed -i [''] 's/<from>/<to>/g' <file>`

把指定文件中的字符串 `<from>` 全部改为 `<to>`（macOS 下需指定备份文件后缀，若字符串为空则不备份）。

`$ sed -i '/<content>/,+1d' <file>`

把指定文件中的含指定内容的行及其下一行移除。

`$ sed -i '/<content>/i\<new>' <file>`

在指定文件中含指定内容的行上面新增一行新内容（`i` 为在其上面新增，`a` 相反）。

`$ find <dir> -type f -print0 | xargs -0 sed -i 's/<from>/<to>/g'`

把指定目录的所有文件中的字符串 `<from>` 全部改为 `<to>`。

## 查看文件（cat）

`$ cat -A <file>`

把指定文件的内容全部输出至标准输出（`-A` 用于显示不可打印字符，行尾换行显示为 `$`）。

`$ more <file>`

滚动查看指定文件的内容（`return` 键查看下一行，`space` 键查看下一屏，`B` 键查看上一屏,`Q` 退出）。

## 统计文件（wc）

`$ wc -l <file>`

统计指定文件的行数（`-c` 统计字符数即文件大小字节数，`-w` 统计字数）。

`$ ls -lR | grep "^-" | wc -l`

统计指定目录及其子目录下普通文件个数（`"^d"` 统计目录文件）。

## 链接文件（link）

`$ ln <file> <link>`

创建文件 `<file>` 的硬链接 `<link>`，删除源文件不影响其硬链接文件。

`$ ln -s <file> <link>`

创建文件 `<file>` 的软链接 `<link>`，删除源文件后其软链接文件失效。

## 域名信息查询（domain name system lookup）

`$ nslookup <url>`

查询指定域名的真正域名及其对应 IP（`<url>` 可能是别名，例如百度）。

## 增删用户（useradd/del）

`$ sudo useradd -m <user> -s /bin/bash`

添加一个用户（`-m` 参数为该用户在家目录下创建同名目录，`-s` 参数为该用户指定 bash 脚本编译器）。

`$ sudo userdel -d <user> -s -g`

删除指定用户（`-d` 删除用户家目录，`-s` 使用的 bash，`-g` 用户所属组）。

`$ sudo cat /etc/passwd`

查看用户信息。

`$ sudo cat /etc/shadow`

查看用户密码（密文）。

## 修改用户密码（passwd）

`$ sudo passwd [root]`

初始化根用户密码。

`$ passwd [current_user]`

修改当前用户密码。

`$ sudo passwd [other_user]`

修改其他用户密码。

## 编辑超级用户（visudo/sudoers）

`$ sudo visudo`

打开 `/etc/sudoers.tmp` 文件。

添加超级用户：

> \# User privilege specification<br>
> root ALL=(ALL:ALL) ALL<br>
> user ALL=(ALL:ALL) ALL

## 添加/删除用户组（groupadd/del）

`$ sudo groupadd <groupname>`

添加用户组。

`$ sudo groupdel <groupname>`

删除指定用户组（<groupname> 不能为主组）。

`$ sudo usermod -G <groupname> <username>`

把指定用户添加到指定组（`-G` 修改用户的组）。

`$ sudo cat /etc/group`

查看组信息。

## 更改文件所属用户/组（change owner）

`$ chown <username> <file>`

更改指定文件所属用户名。

`$ chown <username>:<group> <file>`

更改文件所属用户名和所属组。

**注：只有文件创建者和 root 用户才能使用此命令，且 `<username>` 必须是本机存在的用户名。本机用户名记录在 `/etc/passwd` 文件中。**

## 更改文件所属组（change group）

`$ chgrp <group> <file>`

更改指定文件所属组。

**注：只有文件创建者和 root 用户才能使用此命令，且 `<group>` 必须是本机存在的组。本机用户所属组记录在 `/etc/group` 文件中。**

## 进程的前后台切换

`$ ./<ELF> &`

把指定程序放到后台运行。

`$ jobs`

列出后台运行的程序（包含 `Ctrl` + `Z` 暂停的进程及其序号和运行状态）。

`$ fg n`

把后台序号为 `n` 的任务拉到前台运行。

`$ bg n`

使后台序号为 `n` 的任务继续运行。

## 列出打开文件的进程（list open file）

`$ lsof -i [:<port>]`

显示占用指定端口的所有进程（`-i` 指定条件）。

`$ lsof -i tcp/udp[:<port>]`

显示占用 tcp/udp 指定端口的所有进程。

## 发信号到进程（kill）

`$ kill -l`

列出全部信号。

`$ kill -9 <pid>`

杀死指定进程号的进程。

`$ kill -19 <pid>`

暂停指定进程号的进程（效果同 `Ctrl` + `Z`）。

## 统计时间（time）

`$ time <command>`

统计执行指定命令所花费的时间。

## 修改时区（time date control）

`$ timedatectl status`

查看系统时间和日期。

`$ timedatectl set-timezone "Asia/Shanghai"`

修改系统时区为中国上海。

`$ timedatectl set-local-rtc 1`

把实时时钟设置为本地时间（`0` 表示设置为 UTC，适用于 Windows/Linux 双系统）。

## 查看磁盘

`$ du -sh <dir>`

显示指定目录的大小（`-s/--summarize` 表示总和，`-h/--human-readable` 表示以人类可读的方式显示信息）。

`$ df -h`

查看磁盘各分区的使用情况。

`$ fdisk -l`

查看磁盘及其分区的详细信息。

## 显示登陆用户（w）

`$ w`

显示当前登陆的用户及其正在执行的命令。

## 远程安全连接（Secure Shell）

`$ ssh <username>@<hostname>`

连接至指定用户名和 IP 的主机。

## 远程安全拷贝（secure copy）

`$ scp <file> <username>@<ip>:<dir>`

复制指定的本地文件到远程主机的指定目录。

`$ scp <username>@<ip>:<file> <dir>`

复制远程主机下的指定文件到本地指定目录。

## 精简可执行文件（strip）

`$ strip <ELF>`

通过删除可执行文件中的调试符号等相关信息减少其体积（**此操作不可逆**）。

## 配置文件示例

* Linux: `~/.bashrc`
* macOS: `~/.bash_profile`

```
# The colorful bash profile.
# Preview: "username@hostname:~"
#          "(! lineno.)$".
PS1='\[\e[1;34m\]\u\[\e[m\]\[\e[1;31m\]@\[\e[m\]\[\e[1;33m\]\h\[\e[m\]\[\e[1;34m\]:\[\e[m\]\[\e[1;32m\]\w\[\e[m\]\[\e[1;32m\]\n(\[\e[37;1m\]! \!\[\e[32;1m\])\[\e[m\]\[\e[1;35m\]$\[\e[m\]'

# The order of the attributes are as follows:
#  1. directory.
#  2. symbolic link.
#  3. socket.
#  4. pipe.
#  5. executable.
#  6. block special.
#  7. character special.
#  8. executable with setuid bit set.
#  9. executable with setgid bit set.
# 10. directory writable to others, with sticky bit.
# 11. directory writable to others, without sticky bit.
# The color designators are as follows:
#  a: black;      A: bold black, usually shows up as dark grey.
#  b: red;        B: bold red.
#  c: green;      C: bold green.
#  d: brown;      D: bold brown, usually shows up as yellow.
#  e: blue;       E: bold blue.
#  f: magenta;    F: bold magenta.
#  g: cyan;       G: bold cyan.
#  h: light grey; H: blod light grey, looks like bright white.
#  x: default foreground or background.
export CLICOLOR=1
export LSCOLORS=gxfxaxdxcxegedabagacad # directory color: gx (font: g, background: x).
```

## 参考链接

* [13 Linux Terminal Shortcuts Every Power Linux User Must Know](https://linuxhandbook.com/linux-shortcuts){:target="_blank"}
