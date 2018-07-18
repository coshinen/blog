---
layout: post
title:  "比特币源码剖析（七）"
date:   2018-07-07 11:43:10 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin src
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 概要
上一篇分析了应用程序初始化中椭圆曲线初始化的详细过程，详见[比特币源码剖析（六）](/2018/06/30/bitcoin-source-anatomy-06)。<br>
本篇主要分析 `Step 4: application initialization: dir lock, daemonize, pidfile, debug log` 第四步应用程序初始化中 `InitSanityCheck()` 初始化完整性检查的详细过程。

## 源码剖析

<p id="InitSanityCheck-ref"></p>
2.初始化完整性检查，主要检查椭圆曲线加密的初始化和 `glibc` 及 `glibcxx` 的完整性。

{% highlight C++ %}
/** Sanity checks
 *  Ensure that Bitcoin is running in a usable environment with all
 *  necessary library support.
 */ // 完整性检查。确保比特币在具有全部必备库支持的可用环境里运行。
bool InitSanityCheck(void)
{
    if(!ECC_InitSanityCheck()) { // 1.椭圆曲线密码学初始化完整性检查
        InitError("Elliptic curve cryptography sanity check failure. Aborting.");
        return false;
    }
    if (!glibc_sanity_test() || !glibcxx_sanity_test()) // 2.glibc 和 glibcxx 完整性测试
        return false;

    return true; // 检查通过返回 true
}
{% endhighlight %}

2.1.调用 `ECC_InitSanityCheck()` 函数检查椭圆曲线加密初始化完整性，该函数声明在“key.h”文件中。

{% highlight C++ %}
/** Check that required EC support is available at runtime. */
bool ECC_InitSanityCheck(void); // 检查运行时所需的 EC 支持是否可用。生成私钥->计算公钥->匹配验证
{% endhighlight %}

实现在“key.cpp”文件中，没有入参。

{% highlight C++ %}
bool ECC_InitSanityCheck() {
    CKey key; // 私钥对象
    key.MakeNewKey(true); // 生成新的私钥
    CPubKey pubkey = key.GetPubKey(); // 通过私钥获取公钥
    return key.VerifyPubKey(pubkey); // 验证私钥公钥是否匹配
}
{% endhighlight %}

椭圆曲线加密初始化完整性验证流程就是一个比特币地址生成过程中的前一部分：私钥->公钥->验证。

2.2.调用 `glibc_sanity_test()` 和 `glibcxx_sanity_test()` 函数测试 `glibc` 及 `glibcxx` 的完整性。
它们声明在“sanity.h”文件中。

{% highlight C++ %}
bool glibc_sanity_test(); // glibc 完整性测试
bool glibcxx_sanity_test(); // glibcxx 完整性测试
{% endhighlight %}

首先调用 `glibc_sanity_test()` 测试 `glibc` 的完整性，该函数实现在“glib_sanity.cpp”文件中，没有入参。

{% highlight C++ %}
namespace
{
// trigger: Use the memcpy_int wrapper which calls our internal memcpy.
//   A direct call to memcpy may be optimized away by the compiler.
// test: Fill an array with a sequence of integers. memcpy to a new empty array. // 测试：用一系列证数填充数组。内存拷贝该数组到一个新的空数组。
//   Verify that the arrays are equal. Use an odd size to decrease the odds of // 验证数组是否相等。
//   the call being optimized away. // 使用奇数大小可降低被优化的机率。
template <unsigned int T>
bool sanity_test_memcpy()
{
    unsigned int memcpy_test[T]; // 1025
    unsigned int memcpy_verify[T] = {};
    for (unsigned int i = 0; i != T; ++i) // 遍历填充
        memcpy_test[i] = i;

    memcpy_int(memcpy_verify, memcpy_test, sizeof(memcpy_test)); // 内存拷贝

    for (unsigned int i = 0; i != T; ++i) { // 遍历
        if (memcpy_verify[i] != i) // 逐个验证
            return false; // 若不等返回 false
    }
    return true; // 若完全相等返回 true
}

#if defined(HAVE_SYS_SELECT_H)
// trigger: Call FD_SET to trigger __fdelt_chk. FORTIFY_SOURCE must be defined
//   as >0 and optimizations must be set to at least -O2.
// test: Add a file descriptor to an empty fd_set. Verify that it has been
//   correctly added. // 测试：把文件描述符添加到空的 fd_set。验证其是否正确添加。
bool sanity_test_fdelt()
{
    fd_set fds; // 文件描述符集对象
    FD_ZERO(&fds); // 清空
    FD_SET(0, &fds); // 设置标准输入到该集合
    return FD_ISSET(0, &fds); // 检查标准输入描述符是否在该集合中
}
#endif

} // anon namespace

bool glibc_sanity_test()
{
#if defined(HAVE_SYS_SELECT_H)
    if (!sanity_test_fdelt()) // 测试文件描述符集合
        return false;
#endif
    return sanity_test_memcpy<1025>(); // 测试内存拷贝
}
{% endhighlight %}

在 `glibc` 测试中测试了文件描述符集合与内存拷贝两项。

然后调用 `glibcxx_sanity_test()` 测试 `glibcxx` 的完整性，该函数实现在“glibcxx_sanity.cpp”文件中，没有入参。

{% highlight C++ %}
namespace
{
// trigger: use ctype<char>::widen to trigger ctype<char>::_M_widen_init().
// test: convert a char from narrow to wide and back. Verify that the result
//   matches the original. // 测试：把一个字符从窄转换为宽。验证结果是否匹配原始字符。
bool sanity_test_widen(char testchar)
{
    const std::ctype<char>& test(std::use_facet<std::ctype<char> >(std::locale())); // 初始化本地区域设置
    return test.narrow(test.widen(testchar), 'b') == testchar; // 转换测试字符为宽字符再转换为窄字符，与原字符比较，'b' 为转换失败时生成的默认值
}

// trigger: use list::push_back and list::pop_back to trigger _M_hook and
//   _M_unhook.
// test: Push a sequence of integers into a list. Pop them off and verify that
//   they match the original sequence. // 测试：推送一系列整数到一个链表。弹出它们验证与原始序列是否匹配。
bool sanity_test_list(unsigned int size) // 100
{
    std::list<unsigned int> test; // 测试用双向循环链表
    for (unsigned int i = 0; i != size; ++i) // 顺序推入整数
        test.push_back(i + 1);

    if (test.size() != size) // 验证大小
        return false;

    while (!test.empty()) { // 若链表非空
        if (test.back() != test.size()) // 与比较原数列比较
            return false;
        test.pop_back(); // 弹出
    }
    return true; // 匹配成功返回 true
}

} // anon namespace

// trigger: string::at(x) on an empty string to trigger __throw_out_of_range_fmt.
// test: force std::string to throw an out_of_range exception. Verify that
//   it's caught correctly. // 测试：强制 std::string 抛出 out_of_range 超出范围异常。验证是否正确捕获该异常。
bool sanity_test_range_fmt()
{
    std::string test; // 创建 std::string 空对象
    try {
        test.at(1); // 获取位置 1 处字符的引用，执行边界检查，访问无效将抛出 std::out_of_range 类型的异常
    } catch (const std::out_of_range&) { // 若捕获 std::out_of_range 异常
        return true; // 返回 true
    } catch (...) {
    }
    return false; // 否则返回 false
}

bool glibcxx_sanity_test()
{
    return sanity_test_widen('a') && sanity_test_list(100) && sanity_test_range_fmt(); // 测试宽窄字符互转、链表、范围格式
}
{% endhighlight %}

在 `glibcxx` 测试中测试了宽窄字符互转、链表、范围的异常处理。
调用 [`std::ctype::widen`](https://en.cppreference.com/w/cpp/locale/ctype/widen)、[`std::ctype::narrow`](https://en.cppreference.com/w/cpp/locale/ctype/narrow) 进行宽窄字符转换。
使用 [`std::basic_string::at`](https://en.cppreference.com/w/cpp/string/basic_string/at) 来触发超出范围异常。
这一部分逻辑较为简单，只需耐心啃代码即可。

{% highlight C++ %}
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（八）](/2018/07/14/bitcoin-source-anatomy-08)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
