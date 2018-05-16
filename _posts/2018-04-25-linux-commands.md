---
layout: post
title:  "Linux 基础命令"
date:   2018-04-25 18:58:02 +0800
categories: Linux
---
Linux mascot: crystal tux and tux(Torvalds linUX?)<br>
![crystal tux](/images/20180425/crystal_penguin.jpg)
![tux](/images/20180425/tux.jpg)<br>
Childhood and Adult(funny)

### 切换目录 change directory

{% highlight shell %}
$ cd <dir> # 切换工作目录（当前所在目录）至 <dir> 目录。
$ cd .. # 切换工作目录至上一级目录。
$ cd - # 切换工作目录至上一个工作目录。
$ cd ~ # 同 `$ cd` 切换工作目录至当前用户家目录。
{% endhighlight %}

**注：本文出现的 `<dir>` 均为相对路径 或 绝对路径**

### 查看目录下的内容 list

{% highlight shell %}
$ ls # 列出当前所在目录下的所有文件（除隐藏文件，即以 `.` 开头的文件）的文件名，包含普通文件、目录文件...
$ ls <dir> # 列出 <dir> 目录下的所有文件（除隐藏文件，即以 `.` 开头的文件）的文件名，包含普通文件、目录文件...
$ ls -l # 列出当前所在目录下的所有文件（除隐藏文件）的详细信息，分别是文件属性（类型、权限）、连接数、所属者、所属组、大小（字节）、日期、文件名。
$ ls -a # 列出当前所在目录下的所有文件的文件名，包含隐藏文件。
{% endhighlight %}

### 创建文件 make

{% highlight shell %}
$ touch <file> # 创建一个指定文件名为 <file> 的空文件。
$ mkdir <dir> # 创建一个指定目录名为 <dir> 的空目录。
$ echo <content> >> <file> # 追加 <content> 内容到 <file> 文件的最后一行，若文件不存在，则新建并追加。注：使用 `>` 代替 `>>`，则会覆盖现存文件当前的内容。`>>` 为输出重定向。
$ vi/vim <file> # 使用 Vi/Vim 编辑器打开指定的文件进行编辑，若文件不存在，则新建空文件再进行编辑。
{% endhighlight %}

**注：1. Vi/Vim 编辑过的文件会在结尾自动添加一个 `\n` 换行，所以编辑过文件至少又一个字节的大小。2. Vi 系统自带，Vim 需安装，详见安装软件命令。**

### 删除文件 remove

{% highlight shell %}
$ rm <file> # 删除指定的 <file> 文件。
$ rmdir <dir> # 只能删除指定的空目录 <dir>。
$ rm <dir> -r # 删除指定的目录 <dir> 下包含的所有文件，`-r` 参数表示循环。
{% endhighlight %}

**注：慎用 `$ sudo rm / -rf` # 删除根目录下所有文件，使用 `sudo` 进行权限提升，`-f` 参数表示不显示任何信息。**

### 安装软件 install

{% highlight shell %}
$ apt-get install vim # 安装 vim 软件到系统，一般默认装在 `/usr/bin` 目录下，所以要使用 root 用户进行安装，或在命令的前面加 `sudo` 进行权限提升。e.g. `$ sudo apt-get install vim`。
$ apt-get update # 从所有配置的源中下载包信息，用于安装软件时显示没有该软件的情况。
$ apt-get upgrade # 从通过 sources.list 配置的源安装在系统上的所有包中安装可用的升级，即通过 update 的结果进行已安装软件的升级。
{% endhighlight %}

### 查看磁盘

{% highlight shell %}
$ du -sh # 查看当前所在目录下各文件的总大小，参数 `-s` 同 `--summarize` 表示总和，参数 `-h` 同 `--human-readable` 表示以当前大小可表示的最大单位来显示信息，若不加该参数，则单位默认为 KB。
$ du -h -d 1 # 查看当前所在目录下深度为 1 的各文件的总大小，参数 `-d N` 同 `--max-depth=N` 表示显示的目录层级的最大深度为 N。
$ df -h # 查看当前磁盘各分区的使用情况，参数 `-h` 同 `--human-readable` 含义同上。
$ fdisk -l # 查看当前磁盘及其分区的详细信息。注：若不显示任何信息，命令前需加 `sudo` 来提升权限。
{% endhighlight %}

### 远程安全拷贝 secure copy

{% highlight shell %}
$ scp <file> username@ip:<dir> # 复制本地文件 <file> 到远程主机 `username@ip` 的 <dir> 目录下。
$ scp username@ip:<file> <dir> # 复制远程主机 `username@ip` 下的文件 <file> 到本地 <dir> 目录下。
{% endhighlight %}

**注：`username` 和 `ip` 的顺序，且需要知道 `username` 对应的密码。**

### 统计时间 time

{% highlight shell %}
$ time <command> # 统计执行给定命令 <command> 所花费的时间。
{% endhighlight %}

### 查找文件 find

{% highlight shell %}
$ find . -name <filename> -type f # 以当前目录 `.` 为起始目录，查询并显示指定文件名 <filename> 的文件（相对）路径，`f` 表示文件类型普通文件。
$ find . -empty #  以当前目录 `.` 为起始目录，查询并显示所有大小为 0 的文件（相对）路径。
{% endhighlight %}

### 搜索内容 grep

{% highlight shell %}
$ grep <content> * -nri # 查询并显示当前所在目录下所有出现 <content> 字符串的文件及行号，`*` 表示当前目录下所有文件，`-n` 参数显示所在行号，`-r` 参数表示递归，`-i` 参数表示不区分大小写。
$ grep <content> <file> -n # 查询并显示指定文件 <file> 出现 <content> 字符串的行号。
{% endhighlight %}

## 参考
* [Why Penguin is Linux logo? - LinuxScrew: Linux Blog](http://www.linuxscrew.com/2007/11/14/why-penguin-is-linux-logo)
* [《Linus Torvalds自传》摘录 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2012/09/linus_torvalds.html)
* [Linux命令大全（手册）](http://man.linuxde.net)
* [...](http://github.com/mistydew)
