---
layout: post
title:  "比特币源码剖析（三）"
date:   2018-06-09 10:58:07 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoind
---
上一篇分析了命令行参数解析以及帮助和版本信息的获取，详见[比特币源码剖析（二）](/blog/2018/06/the-annotated-bitcoin-sources-02.html)。
本篇主要分析 GetDataDir(false) 获取数据目录函数，ReadConfigFile(mapArgs, mapMultiArgs) 读取配置文件函数，SelectParams(ChainNameFromCommandLine()) 选择链参数（含创世区块信息）函数，检测命令行参数完整性，Linux 下守护进程的后台化以及服务选项的设置。

## 源码剖析

```cpp
bool AppInit(int argc, char* argv[]) // 3.0.应用程序初始化
{
    ...
    try
    {
        if (!boost::filesystem::is_directory(GetDataDir(false))) // 3.3.获取数据目录
        {
            fprintf(stderr, "Error: Specified data directory \"%s\" does not exist.\n", mapArgs["-datadir"].c_str());
            return false;
        }
        try
        {
            ReadConfigFile(mapArgs, mapMultiArgs); // 3.4.读取配置文件
        } catch (const std::exception& e) {
            fprintf(stderr,"Error reading configuration file: %s\n", e.what());
            return false;
        }
        ...
    }
    catch (const std::exception& e) {
        PrintExceptionContinue(&e, "AppInit()");
    } catch (...) {
        PrintExceptionContinue(NULL, "AppInit()");
    }
    ...
};
```

<p id="GetDataDir-ref"></p>
3.3.调用 GetDataDir(false) 函数获取数据目录，并检查该文件是否为目录类型，该函数声明在“util.h”文件中。

```cpp
boost::filesystem::path GetDefaultDataDir(); // 获取默认数据目录路径
const boost::filesystem::path &GetDataDir(bool fNetSpecific = true); // 获取数据目录路径
```

定义在“util.cpp”文件中，入参为：false。

```cpp
boost::filesystem::path GetDefaultDataDir()
{
    namespace fs = boost::filesystem;
    // Windows < Vista: C:\Documents and Settings\Username\Application Data\Bitcoin
    // Windows >= Vista: C:\Users\Username\AppData\Roaming\Bitcoin
    // Mac: ~/Library/Application Support/Bitcoin
    // Unix: ~/.bitcoin
#ifdef WIN32
    // Windows
    return GetSpecialFolderPath(CSIDL_APPDATA) / "Bitcoin";
#else // UNIX/Linux
    fs::path pathRet;
    char* pszHome = getenv("HOME");
    if (pszHome == NULL || strlen(pszHome) == 0)
        pathRet = fs::path("/");
    else
        pathRet = fs::path(pszHome);
#ifdef MAC_OSX
    // Mac
    pathRet /= "Library/Application Support";
    TryCreateDirectory(pathRet);
    return pathRet / "Bitcoin";
#else
    // UNIX/Linux
    return pathRet / ".bitcoin";
#endif
#endif
}

static boost::filesystem::path pathCached; // 路径缓存
static boost::filesystem::path pathCachedNetSpecific; // 指定网络的路径缓存
static CCriticalSection csPathCached; // 路径缓存锁

const boost::filesystem::path &GetDataDir(bool fNetSpecific)
{
    namespace fs = boost::filesystem;

    LOCK(csPathCached); // 1.路径缓存上锁

    fs::path &path = fNetSpecific ? pathCachedNetSpecific : pathCached; // 2.false

    // This can be called during exceptions by LogPrintf(), so we cache the // 这可以在异常期间通过 LogPrintf() 调用，
    // value so we don't have to do memory allocations after that. // 所以我们缓存该值，以至于我们不用在之后进行内存分配。
    if (!path.empty()) // 3.若路径非空
        return path; // 直接返回数据目录的路径

    if (mapArgs.count("-datadir")) { // 4.否则，若指定了数据目录的位置
        path = fs::system_complete(mapArgs["-datadir"]); // 获取指定的路径
        if (!fs::is_directory(path)) { // 若该路径不是目录
            path = ""; // 置空
            return path; // 返回
        }
    } else { // 若未指定数据目录位置
        path = GetDefaultDataDir(); // 获取默认的数据目录路径
    }
    if (fNetSpecific) // false // 5.若指定了特定网络
        path /= BaseParams().DataDir(); // 路径拼接，获取不同网络的数据目录

    fs::create_directories(path); // 6.创建该目录

    return path; // 7.返回数据目录的路径
}
```

1.路径缓存上锁。<br>
2.根据是否指定了网络选取路径缓存，这里未指定。<br>
3.若路径存在，直接返回。<br>
4.否则，若指定了数据目录，则获取并检测是否为目录；若未指定，则使用默认的数据目录路径。<br>
5.若指定了网络，进行路径拼接，获取不用网络的数据目录。<br>
6.根据路径创建该目录。<br>
7.返回数据目录的路径。

<p id="ReadConfigFile-ref"></p>
3.4.调用 ReadConfigFile(mapArgs, mapMultiArgs) 函数读取配置文件，该函数声明在“util.h”文件中。

```cpp
void ReadConfigFile(std::map<std::string, std::string>& mapSettingsRet, std::map<std::string, std::vector<std::string> >& mapMultiSettingsRet); // 读取配置文件，加载启动选项
```

实现在“util.cpp”文件中，入参为：启动选项单值映射列表，启动选项多值映射列表。

```cpp
void ClearDatadirCache()
{
    pathCached = boost::filesystem::path(); // 路径缓存置空
    pathCachedNetSpecific = boost::filesystem::path(); // 指定网络的路径缓存置空
}

boost::filesystem::path GetConfigFile()
{
    boost::filesystem::path pathConfigFile(GetArg("-conf", BITCOIN_CONF_FILENAME)); // 获取配置文件（指定/默认）名
    if (!pathConfigFile.is_complete()) // 检查该文件名是否完整
        pathConfigFile = GetDataDir(false) / pathConfigFile; // 路径拼接，获取配置文件路径

    return pathConfigFile; // 返回配置文件路径
}

void ReadConfigFile(map<string, string>& mapSettingsRet,
                    map<string, vector<string> >& mapMultiSettingsRet)
{
    boost::filesystem::ifstream streamConfig(GetConfigFile()); // 1.获取配置文件路径并创建文件输入流对象
    if (!streamConfig.good()) // 允许初次运行没有配置文件
        return; // No bitcoin.conf file is OK

    set<string> setOptions; // 2.选择集
    setOptions.insert("*"); // 插入 "*"，用于过滤配置文件中带有 '*' 的行

    for (boost::program_options::detail::config_file_iterator it(streamConfig, setOptions), end; it != end; ++it) // 3.遍历配置文件输入流
    {
        // Don't overwrite existing settings so command line settings override bitcoin.conf // 不覆盖已存在的设置，因此命令行设置会覆盖配置文件设置
        string strKey = string("-") + it->string_key; // 3.1.选项名
        string strValue = it->value[0]; // 选项值
        InterpretNegativeSetting(strKey, strValue); // 把 -noX 转换为 -X=0
        if (mapSettingsRet.count(strKey) == 0) // 3.2.若启动选项单值映射列表中不含该选项
            mapSettingsRet[strKey] = strValue; // 插入列表
        mapMultiSettingsRet[strKey].push_back(strValue); // 插入多值映射列表
    }
    // If datadir is changed in .conf file: // 如果数据目录在配置文件中改变
    ClearDatadirCache(); // 4.清理数据目录缓存
}
```

1.获取配置文件的路径并创建文件输入流对象，允许首次运行没有配置文件。<br>
2.构造选择集，并插入字符 '*'。<br>
3.按行遍历配置文件文件输入流，跳过含有 '*' 的行。<br>
3.1.获取选项名和选项值，并把 -noX 转换为 -X=0。<br>
3.2.插入启动选项映射列表，若在单值映射列表中存在，则不插入该列表，不覆盖已存在的选项设置。<br>
4.清理数据目录路径缓存，因为数据目录可能在配置文件中改变。

**注：根据 3.2 可以得出命令行参数会覆盖配置文件中的选项设置。**

<p id="SelectParams-ref"></p>
3.5.首先调用 ChainNameFromCommandLine() 函数从命令行获取指定的链名，该函数声明在“chainparamsbase.h”文件中。

```cpp
/**
 * Looks for -regtest, -testnet and returns the appropriate BIP70 chain name.
 * @return CBaseChainParams::MAX_NETWORK_TYPES if an invalid combination is given. CBaseChainParams::MAIN by default.
 */ // 查看 -regtest，-testnet 选项返回相应的 BIP70 链名。
std::string ChainNameFromCommandLine();
```

实现在“chainparamsbase.cpp”文件中，没有入参。

```cpp
const std::string CBaseChainParams::MAIN = "main";
const std::string CBaseChainParams::TESTNET = "test";
const std::string CBaseChainParams::REGTEST = "regtest";
...
std::string ChainNameFromCommandLine()
{
    bool fRegTest = GetBoolArg("-regtest", false); // 回归测试模式选项，默认关闭
    bool fTestNet = GetBoolArg("-testnet", false); // 测试网选项，默认关闭

    if (fTestNet && fRegTest) // 若同时选择了测试网和回归测试模式
        throw std::runtime_error("Invalid combination of -regtest and -testnet."); // 抛出异常
    if (fRegTest) // 若选择了回归测试模式
        return CBaseChainParams::REGTEST; // 返回回归测试网名称
    if (fTestNet) // 若选择了测试网
        return CBaseChainParams::TESTNET; // 返回测试网名称
    return CBaseChainParams::MAIN; // 否则返回主网名称，默认
}
```

然后调用 SelectParams(ChainNameFromCommandLine()) 根据链名选择不同网络的链参数，该函数声明在“chainparams.h”文件中。

```cpp
/**
 * Sets the params returned by Params() to those for the given BIP70 chain name.
 * @throws std::runtime_error when the chain is not supported.
 */ // 将 Params() 返回的参数设置为给定的 BIP70 链名。
void SelectParams(const std::string& chain);
```

实现在“chainparams.cpp”文件中，入参为：BIP70 链名。

```cpp
void SelectParams(const std::string& network)
{
    SelectBaseParams(network); // 1.选择网络基础参数
    pCurrentParams = &Params(network); // 2.获取相应网络参数对象的地址
}
```

1.选择网络基础参数。<br>
2.选择网络参数。

1.调用 SelectBaseParams(network) 选择网络基础参数，包含 RPC 端口号，数据目录名（网络名），该函数声明在“chainparamsbase.h”文件中。

```cpp
/** Sets the params returned by Params() to those for the given network. */ // 将 Params() 返回的参数设置到给定的网络。
void SelectBaseParams(const std::string& chain);
```

实现在“chainparamsbase.cpp”文件中，入参为：BIP70 链名。

```cpp
/**
 * Main network // 主网
 */
class CBaseMainParams : public CBaseChainParams
{
public:
    CBaseMainParams()
    {
        nRPCPort = 8332; // 与 bitcoin-cli 进行通讯的默认端口
    }
};
static CBaseMainParams mainParams; // 全局静态主网基础参数对象

/**
 * Testnet (v3) // 测试网（版本 3）
 */
class CBaseTestNetParams : public CBaseChainParams
{
public:
    CBaseTestNetParams()
    {
        nRPCPort = 18332;
        strDataDir = "testnet3";
    }
};
static CBaseTestNetParams testNetParams; // 全局静态测试网基础参数对象

/*
 * Regression test // 回归测试模式
 */
class CBaseRegTestParams : public CBaseChainParams
{
public:
    CBaseRegTestParams()
    {
        nRPCPort = 18332;
        strDataDir = "regtest";
    }
};
static CBaseRegTestParams regTestParams; // 全局静态回归测试网基础参数对象

static CBaseChainParams* pCurrentBaseParams = 0; // 当前选择的基础链参数对象全局静态指针
...
CBaseChainParams& BaseParams(const std::string& chain)
{
    if (chain == CBaseChainParams::MAIN) // 若选择的为主链
        return mainParams; // 返回主链基础参数对象
    else if (chain == CBaseChainParams::TESTNET) // 若选择的为测试链
        return testNetParams; // 返回测试链基础参数对象
    else if (chain == CBaseChainParams::REGTEST) // 若选择的为回归测试链
        return regTestParams; // 返回回归测试链基础参数对象
    else
        throw std::runtime_error(strprintf("%s: Unknown chain %s.", __func__, chain));
}

void SelectBaseParams(const std::string& chain)
{
    pCurrentBaseParams = &BaseParams(chain); // 使当前选择的基础链参数全局静态指针指向选择的链基础参数对象
}
```

这一步是让当前选择的基础链参数对象全局静态指针指向相应的基础链参数全局静态对象，方便以后通过指针进行基础链参数的访问。

2.调用 Params(network) 获取选择网络参数对象的地址，该函数定义在“chainparams.cpp”文件中，入参为：BIP70 链名。

```cpp
/**
 * Main network // 主网
 */
/**
 * What makes a good checkpoint block?
 * + Is surrounded by blocks with reasonable timestamps
 *   (no blocks before with a timestamp after, none after with
 *    timestamp before)
 * + Contains no strange transactions
 */

class CMainParams : public CChainParams {
public:
    CMainParams() {
    ...
    }
};
static CMainParams mainParams; // 全局静态主网参数对象

/**
 * Testnet (v3) // 公共测试（类似主网）
 */
class CTestNetParams : public CChainParams {
public:
    CTestNetParams() {
    ...
    }
};
static CTestNetParams testNetParams; // 全局静态测试网参数对象

/**
 * Regression test // 回归测试
 */
class CRegTestParams : public CChainParams {
public:
    CRegTestParams() {
    ...
    }
};
static CRegTestParams regTestParams; // 全局静态回归测试网参数对象

static CChainParams *pCurrentParams = 0; // 当前选定的链参数对象全局静态指针
...
CChainParams& Params(const std::string& chain) // 根据网络名字返回相应的网络参数对象
{
    if (chain == CBaseChainParams::MAIN) // 若选择的为主链
            return mainParams; // 返回主网参数对象
    else if (chain == CBaseChainParams::TESTNET) // 若选择的为测试链
            return testNetParams; // 返回测试网参数对象
    else if (chain == CBaseChainParams::REGTEST) // 若选择的为回归测试链
            return regTestParams; // 返回回归测试网参数对象
    else
        throw std::runtime_error(strprintf("%s: Unknown chain %s.", __func__, chain));
}
```

这一步是让当前选择的链参数对象全局静态指针指向相应的链参数全局静态对象，方便以后通过指针进行基础链参数的访问。

<p id="Command-line-ref"></p>
3.6.这部分实现在“bitcoind.cpp”文件的 AppInit(int argc, char* argv[]) 函数中。

```cpp
bool AppInit(int argc, char* argv[]) // [P]3.0.应用程序初始化
{
    ...
    try
    {
        ...
        // Command-line RPC // 3.6.0.检测命令行参数完整性
        bool fCommandLine = false; // 命令行错误标志，初始化为 false
        for (int i = 1; i < argc; i++) // 1.遍历指定的命令行参数
            if (!IsSwitchChar(argv[i][0]) && !boost::algorithm::istarts_with(argv[i], "bitcoin:")) // 若有一个命令行参数是以'-'或'/'开头
                fCommandLine = true; // 命令行错误标志置为 true

        if (fCommandLine) // 2.若命令行参数存在错误
        {
            fprintf(stderr, "Error: There is no RPC client functionality in bitcoind anymore. Use the bitcoin-cli utility instead.\n"); // 打印错误原因
            exit(1); // 退出程序
        }
        ...
    }
    catch (const std::exception& e) {
        PrintExceptionContinue(&e, "AppInit()");
    } catch (...) {
        PrintExceptionContinue(NULL, "AppInit()");
    }
    ...
}
```

1.遍历指定的命令行参数，检查每个开始是否以 '-' 或 '/' 开头，若不满足以上条件，则标记命令行参数出错。<br>
2.若命令参数出错，打印错误信息后直接退出程序。

1.调用 IsSwitchChar(argv[i][0]) 函数进行命令行参数首字母的检查，该函数定义在“util.h”文件中。

```cpp
inline bool IsSwitchChar(char c)
{
#ifdef WIN32
    return c == '-' || c == '/';
#else // UNIX/Linux
    return c == '-';
#endif
}
```

<p id="Daemon-ref"></p>
3.7.这部分只在非 WIN32 平台上有效，实现在“bitcoind.cpp”文件的 AppInit(int argc, char* argv[]) 函数中。

```cpp
bool AppInit(int argc, char* argv[]) // [P]3.0.应用程序初始化
{
    ...
    try
    {
        ...
#ifndef WIN32 // 3.7.0.Uinx/Linux 下守护进程后台化
        fDaemon = GetBoolArg("-daemon", false); // 1.后台化标志，默认为 false
        if (fDaemon) // 2.若开启了后台化选项，进行程序的后台化
        {
            fprintf(stdout, "Bitcoin server starting\n"); // 输出比特币正在启动的信息到标准输出

            // Daemonize // 守护进程后台化
            pid_t pid = fork(); // 2.1.派生子进程，并获取进程 id
            if (pid < 0) // 出错
            {
                fprintf(stderr, "Error: fork() returned %d errno %d\n", pid, errno);
                return false; // 退出
            }
            if (pid > 0) // Parent process, pid is child process id // 2.2.父进程返回子进程号
            {
                return true; // 直接退出
            }
            // Child process falls through to rest of initialization  // 子进程，返回 0，进入初始化的剩余部分

            pid_t sid = setsid(); // 2.3.设置新会话
            if (sid < 0) // 会话 id 必须大于等于 0
                fprintf(stderr, "Error: setsid() returned %d errno %d\n", sid, errno);
        }
#endif
        ...
    }
    catch (const std::exception& e) {
        PrintExceptionContinue(&e, "AppInit()");
    } catch (...) {
        PrintExceptionContinue(NULL, "AppInit()");
    }
    ...
}
```

1.获取守护进程后台化标志，默认为 false。<br>
2.若开启了后台化选项，是当前进程后台化。<br>
2.1.fork 派生子进程，父进程返回子进程 pid，子进程返回 0。<br>
2.2.父进程退出。<br>
2.3.子进程设置新会话，完成守护进程后台化。

**注：一般子进程还会关闭默认打开的 STDIN_FILENO、STDOUT_FILENO、STDERR_FILENO，分别为标准输入、标准输出、标准错误描述符。**

1.调用 GetBoolArg("-daemon", false) 获取 "-daemon" 后台化选项的值，该函数声明在“util.h”文件中。

```cpp
/**
 * Return boolean argument or default value
 *
 * @param strArg Argument to get (e.g. "-foo")
 * @param default (true or false)
 * @return command-line argument or default value
 */ // 返回命令行参数的值或设置的默认值。
bool GetBoolArg(const std::string& strArg, bool fDefault); // 获取指定选项的值
```

实现在”util.cpp“文件中，入参为："-daemon"，false。

```cpp
bool GetBoolArg(const std::string& strArg, bool fDefault)
{
    if (mapArgs.count(strArg)) // 若该选项存在
        return InterpretBool(mapArgs[strArg]); // 返回其对应的值（转换为布尔型）
    return fDefault; // 否则返回默认值
}
```

<p id="Server-ref"></p>
3.7.这部分实现在“bitcoind.cpp”文件的 AppInit(int argc, char* argv[]) 函数中。

```cpp
bool AppInit(int argc, char* argv[]) // [P]3.0.应用程序初始化
{
    ...
    try
    {
        ...
        SoftSetBoolArg("-server", true); // 3.8.软服务设置选项，默认开启，服务在后面启动
        ...
    }
    catch (const std::exception& e) {
        PrintExceptionContinue(&e, "AppInit()");
    } catch (...) {
        PrintExceptionContinue(NULL, "AppInit()");
    }
    ...
}
```

调用 SoftSetBoolArg("-server", true) 对服务选项 "-server" 进行软设置，该函数声明在“util.h”文件中。
所谓软设置就是若该选项已经设置过，直接返回 false 表示设置失败，若该选项未设置，则设置为指定的值后，返回 true 表示设置成功。

```cpp
/**
 * Set a boolean argument if it doesn't already have a value
 *
 * @param strArg Argument to set (e.g. "-foo")
 * @param fValue Value (e.g. false)
 * @return true if argument gets set, false if it already had a value
 */ // 若选项没有设置，就设置一个布尔型参数，并返回 true。否则，直接返回 false。
bool SoftSetBoolArg(const std::string& strArg, bool fValue);
```

定义在“util.cpp”文件中，入参为："-server"，true。

```cpp
bool SoftSetArg(const std::string& strArg, const std::string& strValue)
{
    if (mapArgs.count(strArg)) // 若该选项已经存在（设置）
        return false; // 直接返回 false
    mapArgs[strArg] = strValue; // 否则设置为指定的值
    return true; // 返回 true，表示设置成功
}

bool SoftSetBoolArg(const std::string& strArg, bool fValue)
{
    if (fValue)
        return SoftSetArg(strArg, std::string("1"));
    else
        return SoftSetArg(strArg, std::string("0"));
}
```

未完待续...<br>
请看下一篇[比特币源码剖析（四）](/blog/2018/06/the-annotated-bitcoin-sources-04.html)。

## 参考链接

* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1){:target="_blank"}
