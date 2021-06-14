---
layout: post
title:  "Base58Check 编码"
date:   2018-05-15 20:22:02 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin Base58
---
一种改进的 Base 58 [二进制到文本的编码](https://en.wikipedia.org/wiki/Binary-to-text_encoding){:target="_blank"}称为 Base58Check，用于编码[比特币地址](/blog/2018/05/bitcoin-address)。

通俗的说，Base58Check 编码用于把比特币中的字节数组编码为易于人类手动输入的字符串。

## 源码剖析

Base58Check 的编码和解码均实现在源文件 ”base58.cpp“ 中，下面是编码部分的源码：

```cpp
/** All alphanumeric characters except for "0", "I", "O", and "l" */
static const char* pszBase58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // 10 + 26 * 2 - 4 = 58
...
std::string EncodeBase58(const unsigned char* pbegin, const unsigned char* pend) // Base58 编码
{
    // Skip & count leading zeroes.
    int zeroes = 0; // 1. 跳过并统计开头 0 的个数
    while (pbegin != pend && *pbegin == 0) {
        pbegin++;
        zeroes++;
    }
    // Allocate enough space in big-endian base58 representation. // 2. 为大端 base58 表示，开辟足够的空间（34 或 35 bytes），向上取整
    std::vector<unsigned char> b58((pend - pbegin) * 138 / 100 + 1); // log(256) / log(58), rounded up.
    // Process the bytes. // 3. 转换为 58 进制
    while (pbegin != pend) {
        int carry = *pbegin;
        // Apply "b58 = b58 * 256 + ch".
        for (std::vector<unsigned char>::reverse_iterator it = b58.rbegin(); it != b58.rend(); it++) {
            carry += 256 * (*it);
            *it = carry % 58;
            carry /= 58;
        }
        assert(carry == 0);
        pbegin++;
    }
    // Skip leading zeroes in base58 result. // 4. 跳过开头的 0
    std::vector<unsigned char>::iterator it = b58.begin();
    while (it != b58.end() && *it == 0)
        it++;
    // Translate the result into a string.
    std::string str;
    str.reserve(zeroes + (b58.end() - it)); // 1 + 33 or 0 + 34 = 34
    str.assign(zeroes, '1'); // 5. 在字符串前面的位置指派 zeroes 个字符 1
    while (it != b58.end()) // 6. 查 Base58 字符表转换结果为字符串
        str += pszBase58[*(it++)]; // append *it then ++it
    return str; // 前缀为 0x00 不参与 Base58 运算，地址长度固定为 34 bytes 且前缀位 '1'，其他不为 0x00 的前缀，均参与 Base58 运算，地址长度变换范围 33 - 35 bytes
}

std::string EncodeBase58(const std::vector<unsigned char>& vch)
{
    return EncodeBase58(&vch[0], &vch[0] + vch.size());
}
...
std::string EncodeBase58Check(const std::vector<unsigned char>& vchIn)
{
    // add 4-byte hash check to the end // 添加哈希值的前 4 个字节作为校验和到尾部
    std::vector<unsigned char> vch(vchIn);
    uint256 hash = Hash(vch.begin(), vch.end());
    vch.insert(vch.end(), (unsigned char*)&hash, (unsigned char*)&hash + 4);
    return EncodeBase58(vch);
}
...
std::string CBase58Data::ToString() const
{
    std::vector<unsigned char> vch = vchVersion; // 添加版本号到首部
    vch.insert(vch.end(), vchData.begin(), vchData.end());
    return EncodeBase58Check(vch);
}
```

在 20 个字节的公钥哈希值首部添加 1 个字节的版本号，并在尾部添加哈希值的前 4 个字节作为校验和后，进行 Base58 编码：
1. 跳过开头的 0 同时统计其个数。zeroes 的取值只有两种情况，当版本号即地址前缀取 “0x00” 时，zeroes 为 1，其它情况 zeroes 为 0。
2. 开辟足够大的空间，34 或 35 个字节，为大端表示的 Base58 编码做准备。
3. 进行 Base58 编码，把 256 进制转化为 58 进制，公式 "b58 = b58 * 256 + ch"。
```cpp
carry += 256 * (*it);
*it = carry % 58;
carry /= 58;
```
4. 再次跳过开头的 0，这次不统计。
5. 在字符串填充字符 '1'，个数为 1. 步中跳过 0 的个数 zeroes。
6. 根据 Base58 字符对照表把数字转换为对应字符，得到地址。

## 参考链接

* [Base58 - Wikipedia](https://en.wikipedia.org/wiki/Base58){:target="_blank"}
* [Base58Check encoding - Bitcoin Wiki](https://en.bitcoin.it/wiki/Base58Check_encoding){:target="_blank"}
* [bitcoin/base58.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/base58.cpp){:target="_blank"}
