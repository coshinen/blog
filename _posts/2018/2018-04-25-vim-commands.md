---
layout: post
title:  "Vim 编辑器入门"
date:   2018-04-25 20:11:20 +0800
author: Coshin
comments: true
category: 程序人生
tags: Vim CLI
excerpt: Vim (Vi IMproved) 是编辑器 Vi 的升级版，作为“编辑器之神”与“神之编辑器” Emacs 并驾齐驱。
---
共分为**命令**和**插入**两大模式。
默认是命令模式，按 `I` 键进入插入模式，再按 `esc` 键返回命令模式。

## 命令模式

### 插入（insert）

> * i # 从光标位置开始插入文本
> * I # （大写字母 i）从光标所在行的行首开始插入文本
> * a # 从光标的下一个位置开始插入文本
> * A # 从光标所在行的行尾开始插入文本
> * o # 从光标的下一行行首开始插入文本

### 保存并退出（write and quit）

> * :w # 保存内容
> * :q # 退出当前编辑的文档
> * :wq 或 :x # 保存内容并退出

### 移动光标

> * w # 移动光标到下个词首
> * b # 移动光标到上个词首
> * ^ # 移动光标到行首
> * $ # 移动光标到行尾
> * k # 上移，移动光标到上一行
> * j # 下移，移动光标到下一行
> * h # 左移，移动光标到上一个位置
> * l # （小写字母 L）右移，移动光标到下一个位置
> * H # 移动光标到所在页首行的行首
> * L # 移动光标到所在页尾行的行首
> * gg # 移动光标到文档首行的行首
> * G # 移动光标到文档尾行的行首
> * :n # 移动光标到第 n 行

### 选择（visual）

> * v # 进入选择模式，横向选择内容，通过移动光标进行（类似于 Windows 下的点选文字）
> * Ctrl + V # 进入选择模式，纵向选择内容，使用 I（大写字母 i）进行插入后，按 Esc 完成整个选区的修改，常用于批量注释代码段和代码对齐

### 复制（yank）

> * y^ # 复制光标的前一个位置到行首的内容
> * y$ # 复制光标到行尾的内容
> * yy # 复制光标所在行的内容
> * nyy # 复制含光标所在行在内及下面的 n 行内容

### 删除（delete）

> * x # 删除光标位置的字符
> * dd # 删除光标所在行
> * ndd # 删除含当前光标所在行在内及下面的 n 行内容
> * D # 删除光标位置到行尾的内容

**注：复制和删除共用同一个缓冲区，所以复制后删除后删除后复制会覆盖首次操作的内容。**

### 粘贴（paste）

> * p # 粘贴缓冲区中（复制/删除）的内容至光标的后面，若使用 yy 或 dd 复制或删除行，则粘贴至光标所在行的下面
> * P # 粘贴缓冲区中（复制/删除）的内容至光标的前面，若使用 yy 或 dd 复制或删除行，则粘贴至光标所在行的上面

### 撤销操作（undo）

> * u # 撤销上次操作，次数不限
> * Ctrl + R # 撤销上次 u 操作，次数不限

### 搜索定位

> * /xxx # 从光标所在行开始，从上往下查找 xxx 字符串并高亮所有结果，同时定位光标到第一个结果（n 选择下一个结果，N 选择上一个结果）
> * ?xxx # 从光标所在行开始，从下往上查找 xxx 字符串并高亮所有结果，同时定位光标到第一个结果（n 选择下一个结果，N 选择上一个结果）
> * % # 括号匹配，适用于 {...}、[...]、(...)

### 字符串替换（substitute）

> * :s/src/dst # 替换光标所在行内第一个 src 字符串为 dst 字符串，同时高亮全文所有 src 字符串
> * :s/src/dst/ig # 替换光标所在行内所有 src 字符串为 dst 字符串，i 表示忽略大小写，g 表示全部，同时高亮全文所有 src 字符串
> * :%s/src/dst/g # 替换整个文档内所有 src 字符串为 dst 字符串，同时高亮全文所有 src 字符串
> * :n,m s/src/dst/g # 替换第 n 行到第 m 行内所有 src 字符串为 dst 字符串，同时高亮全文所有 src 字符串

### 进制转换

> * :%!xxd # 转换整个文档为 16 进制
> * :%!xxd -r # 恢复 16 进制为原文

### 锁定和解锁（组合键）

> * Ctrl + S # 进入锁定状态
> * Ctrl + Q # 解除锁定状态

### 显示行号

> * :set nu 或 :set number # 显示行号
> * :set nonu 或 :set nonumber # 隐藏行号

## 去除行尾的换行符

**Vi/Vim 默认会在行尾添加一个换行符。**

```shell
$ vim -b <file>
  使用二进制模式打开指定文件
```

在命令模式使用下面命令去除最后一行行尾的换行符。

> * :set noeol # （set no end-of-line）设置无行尾结束符

## 配置文件示例

Linux, macOS: `~/.vimrc`

```
" Basic
" -----
syntax on "code highlight
"colorscheme darkblue
set mouse=a "support mouse
"set cursorcolumn
set fileencodings=utf-8,gb2312,gbk,gb18030
set termencoding=utf-8
"set fileformats=unix
"set encoding=prc
set encoding=utf-8
filetype on

" Indent
" ------
set autoindent
set cindent
set smartindent
set backspace=2 "backspace can delete any character
set expandtab "space grid replace tab
set tabstop=4 "tab: the number of space grid
set shiftwidth=4
set softtabstop=4

" Appearance
" ----------
set nu "line number
set cursorline "cursorline hightlight
set linebreak
set nowrap
set laststatus=2 "show status bar
set ruler "the position of cursor

" Search
" ------
set showmatch "the match of character highlight
set hlsearch "search result highlight
set incsearch "first search result
"set ignorecase "ignore case-sensitive

" Edit
" ----
"set spell spelllang=en_us
set nobackup
set noswapfile
"set undofile
"set backupdir=~/.vim/.backup//
"set directory=~/.vim/.swp//
"set undodir=~/.vim/.undo//
set history=1000
set autoread
"set list
set wildmenu
set wildmode=longest:list,full

" Readme
" ------
autocmd BufNewFile *.[ch],*.hpp,*.cpp,*.cc exec ':call InitCPPHeader()'
autocmd BufNewFile *.md,*markdown exec ':call InitMDHeader()'

function InitCPPHeader()
    call setline(1, '// Copyright (c)'.strftime(' %Y ').expand('{{ site.root }}'))
    call append(1, '// Distributed under the MIT software license, see the accompanying')
    call append(2, '// file LICENSE or http://www.opensource.org/licenses/mit-license.php.')
    call append(3, '')
endf

function InitMDHeader()
    call setline(1, '---')
    call append(1, 'layout: '.expand('post'))
    call append(2, 'title:  '.expand('"').expand('%:t:r').expand('"'))
    call append(3, 'date:   '.strftime('%Y-%m-%d %H:%M:%S').expand(' +0800'))
    call append(4, 'author: '.expand('{{ site.root }}'))
    call append(5, 'comments: '.expand('true'))
    call append(6, 'category: category')
    call append(7, 'tags: tag1 tag2')
    call append(8, 'excerpt: excerpt')
    call append(9, '---')
endf
```

## 参考链接

* [Vim documentation : vim online](https://www.vim.org/docs.php){:target="_blank"}
