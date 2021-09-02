---
layout: post
title:  "比特币 RPC 命令「help」"
date:   2018-06-13 23:38:36 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help help
help ( "command" )

列出所有命令，或获取一条指定命令的帮助。

参数：
1. command（字符串，可选）待获取帮助的命令

结果：
"text"（字符串）帮助文本

例子：
> bitcoin-cli help ("command")
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "help", "params": [("command")] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`help` 对应的函数实现在文件 `rpcmisc.cpp` 中。

```cpp
UniValue help(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() > 1)
        throw runtime_error(
            "help ( \"command\" )\n"
            "\nList all commands, or get help for a specified command.\n"
            "\nArguments:\n"
            "1. \"command\"     (string, optional) The command to get help on\n"
            "\nResult:\n"
            "\"text\"     (string) The help text\n"
        ); // 1. 帮助内容

    string strCommand;
    if (params.size() > 0)
        strCommand = params[0].get_str();

    return tableRPC.help(strCommand); // 2. 返回 RPC 命令帮助
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 2. 返回 RPC 命令帮助

RPC 命令表 `tableRPC` 定义在文件 `rpcserver.cpp` 中。

```cpp
const CRPCTable tableRPC;
```

类 `CRPCTable` 定义在文件 `rpcserver.h` 中。

```cpp
/**
 * Bitcoin RPC command dispatcher.
 */
class CRPCTable // 比特币 RPC 命令调度器。
{
private:
    std::map<std::string, const CRPCCommand*> mapCommands;
public:
    CRPCTable();
    const CRPCCommand* operator[](const std::string& name) const;
    std::string help(const std::string& name) const;

    /**
     * Execute a method.
     * @param method   Method to execute
     * @param params   UniValue Array of arguments (JSON objects)
     * @returns Result of the call.
     * @throws an exception (UniValue) when an error happens.
     */
    UniValue execute(const std::string &method, const UniValue &params) const; // 执行一个方法。
};

extern const CRPCTable tableRPC;
```

RPC 命令表对象 `tableRPC` 初始化时调用其类的无参构造函数 `CRPCTable()` 注册定义的所有 RPC 命令。

无参构造函数 `CRPCTable()` 实现在文件 `rpcserver.cpp` 中。

```cpp
/**
 * Call Table
 */
static const CRPCCommand vRPCCommands[] =
{ //  category              name                      actor (function)         okSafeMode
  //  --------------------- ------------------------  -----------------------  ----------
    /* Overall control/query calls */
    { "control",            "getinfo",                &getinfo,                true  }, /* uses wallet if enabled */
    { "control",            "help",                   &help,                   true  },
    ...
}; // 调用表

CRPCTable::CRPCTable()
{
    unsigned int vcidx;
    for (vcidx = 0; vcidx < (sizeof(vRPCCommands) / sizeof(vRPCCommands[0])); vcidx++)
    {
        const CRPCCommand *pcmd;

        pcmd = &vRPCCommands[vcidx];
        mapCommands[pcmd->name] = pcmd;
    }
}
```

RPC 命令帮助函数 `tableRPC.help(strCommand)` 实现在文件 `rpcserver.cpp` 中。

```cpp
/**
 * Note: This interface may still be subject to change.
 */
std::string CRPCTable::help(const std::string& strCommand) const // 注意：该接口可能仍会更改。
{
    string strRet;
    string category;
    set<rpcfn_type> setDone;
    vector<pair<string, const CRPCCommand*> > vCommands;

    for (map<string, const CRPCCommand*>::const_iterator mi = mapCommands.begin(); mi != mapCommands.end(); ++mi)
        vCommands.push_back(make_pair(mi->second->category + mi->first, mi->second));
    sort(vCommands.begin(), vCommands.end());

    BOOST_FOREACH(const PAIRTYPE(string, const CRPCCommand*)& command, vCommands)
    {
        const CRPCCommand *pcmd = command.second;
        string strMethod = pcmd->name;
        // We already filter duplicates, but these deprecated screw up the sort order
        if (strMethod.find("label") != string::npos) // 我们已经过滤了重复项，但这些已弃用的命令会搞砸排序顺序
            continue;
        if ((strCommand != "" || pcmd->category == "hidden") && strMethod != strCommand) // 过滤隐藏类别的命令
            continue;
        try
        {
            UniValue params;
            rpcfn_type pfn = pcmd->actor; // 注册对应回调函数
            if (setDone.insert(pfn).second) // 若执行列表插入回调成功
                (*pfn)(params, true); // 标记 fHelp 为 true 并执行回调
        }
        catch (const std::exception& e)
        {
            // Help text is returned in an exception
            string strHelp = string(e.what()); // 在异常中返回帮助文本
            if (strCommand == "")
            {
                if (strHelp.find('\n') != string::npos) // 若帮助信息中存在 '\n'
                    strHelp = strHelp.substr(0, strHelp.find('\n')); // 截取第一个 '\n' 之前的的字符串（命令名）

                if (category != pcmd->category) // 把命令所属的类别的首字母转换为大写
                {
                    if (!category.empty())
                        strRet += "\n";
                    category = pcmd->category;
                    string firstLetter = category.substr(0,1);
                    boost::to_upper(firstLetter);
                    strRet += "== " + firstLetter + category.substr(1) + " ==\n";
                }
            }
            strRet += strHelp + "\n"; // 拼接异常信息
        }
    } // 遍历每一条已注册的 RPC 命令
    if (strRet == "")
        strRet = strprintf("help: unknown command: %s\n", strCommand);
    strRet = strRet.substr(0,strRet.size()-1); // 去除结尾的换行符 '\n'
    return strRet;
}
```

## 参考链接

* [bitcoin/rpcmisc.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmisc.cpp){:target="_blank"}
* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
