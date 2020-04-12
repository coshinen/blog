---
layout: post
title:  "GitHub Actions 工作流入门"
date:   2019-08-31 22:56:58 +0800
author: mistydew
comments: true
category: 程序人生
tags: Git/GitHub CI/CD
---
GitHub Actions 可以让你直接在 GitHub 仓库中创建自定义软件开发生命周期的工作流。

![GitHub Actions](https://mistydew.github.io/assets/images/github/44036562.png){:.border}

GitHub Actions 目前~~处于测试阶段，需要注册 beta 版等待官方开启后才能使用~~已正式开放。

![GitHub Actions](https://mistydew.github.io/assets/images/github/actions.png){:.border}

点击仓库上的 Actions 选项，使用 GitHub 官方提供的模版以便快速开始。

## 0. 关于 GitHub Actions

GitHub Actions 提供了灵活构建一个自动化的软件开发生命周期的工作流。
你可以编写单独的任务、调用操作、再合并它们以创建一个自定义的工作流。
工作流是自定义自动化的进程，你可以在仓库中设置来构建、测试、打包、发布或部署 GitHub 上的任何代码项目。

通过 GitHub Actions 可以直接在仓库中构建端到端的持续集成和持续部署功能。
GitHub Actions 为内置的持续集成（CI）服务提供动力。

工作流在 GitHub 托管的服务器上的 Linux、macOS、Windows 和容器中运行。
你可以使用仓库定义的操作、在 GitHub 上的一个公共仓库中的开源操作或一个已发布的 Docker 容器镜像来创建工作流。

也可以在 GitHub 上找到用于你工作流的操作，并构建 GitHub 社区共享的操作。

还可以创建一个配置运行在特定事件上的工作流文件。

## 1. GitHub Actions 的核心概念

这是一些使用 GitHub Actions 时具有特定含义的常用术语。

### 1.1. 工作流（Workflow）

一个可配置的自动化进程，你可以在你的仓库中设置该流程以在 GitHub 上构建、测试、打包、发布或部署任何项目。
工作流由一个或多个工作（job）组成，并可以通过一个事件安排或激活。

### 1.2. 工作流运行（Workflow run）

一个当预配置的事件发生时运行的工作流实例。
你可以看到每个工作流运行的工作（job）、操作（action）、日志和状态。

### 1.3. 工作流文件（Workflow file）

使用至少一个工作（job）定义工作流配置的 YAML 文件。
该文件位于你的 GitHub 仓库根目录的 .github/workflows 目录中。

### 1.4. 工作（Job）

一个由步骤（step）组成的确定任务。
每个工作都在一个虚拟环境的新实例中运行。
你可以为运行在一个工作流文件中的工作定义依赖规则。
工作可以同时并行运行，或依赖于前一个工作的状态并按顺序运行。
例如，一个工作流可以有两个顺序的工作，即构建和测试代码，其中测试工作依赖于构建工作的状态。
如果构建工作失败，那么测试工作将不会运行。

### 1.5. 步骤（Step）

一个步骤是通过一个工作执行的一组任务。
一个工作中的每个步骤都在相同的虚拟环境中执行，从而允许该工作中的操作使用文件系统共享信息。
步骤可以运行命令或操作（Action）。

### 1.6. 操作（Action）

作为创建一个工作的步骤组合的单个任务。
操作是一个工作流中最小的可移植构建块。
你可以创建自己的操作、使用 GitHub 社区共享操作和自定义公共操作。
若要在一个工作流中使用一个操作，你必须将其作为一个步骤包含进去。

### 1.7. 持续集成（Continuous integration）

频繁地向一个共享仓库提交少量代码变更的软件开发实践。
使用 GitHub Actions，可以创建自定义的 CI 工作流，以自动构建并测试你的代码。
从你的仓库中，你可以查看代码变更的状态和工作流中每个操作的详细日志。
CI 通过提供代码变更的及时反馈来更快地检测并解决 bugs，从而节省开发人员的时间。

### 1.8. 持续部署（Continuous deployment）

持续部署建立在持续集成的基础上。
当提交新代码和通过你的 CI 测试时，代码将自动部署到生产环境中。
使用 GitHub Actions，可以创建自定义的 CD 工作流，以便从你的仓库自动部署代码到任何云、自托管服务或平台。
CD 通过自动化部署过程节省开发人员的时间，并更快地向你的客户部署经过测试的、稳定的代码变更。

### 1.9. 虚拟环境（Virtual environment）

GitHub 托管 Linux、macOS 和 Windows 虚拟环境来运行你的工作流。

### 1.10. 运行器（Runner）

每个虚拟环境中等待可用工作的一个 GitHub 服务。
当运行器选定一个工作时，它会运行该工作的操作并报告进度、日志和最终结果到 GitHub。
运行器一次只运行一个工作。

### 1.11. 事件（Event）

触发一个工作流运行的一个特定活动。
例如，当某人把一个提交推送到一个仓库或当一个问题（issue）或拉请求（pull request）被创建时，活动可以源于 GitHub。
你也可以在一个外部事件发生时使用仓库调度 web 钩子配置一个工作流来运行。

### 1.12. 工作（Artifact）

工件是在构建并测试你的代码时创建的文件。
例如，工件可能包括二进制或包文件、测试结果、屏幕快照或日志文件。
工件与工作流运行相关联，在其中创建并可以由另一个工作或部署使用。

## 2. 关于工作流

工作流是定制的自动化流程，你可以在仓库中设置该流程以在 GitHub 上构建、测试、打包、发布或部署任何项目。
通过工作流你可以使用各种工具和服务来自动化软件开发生命周期。

你可以在一个仓库中创建多个工作流。
必须把工作流存储在你仓库根目录的 .github/workflows 目录中。

工作流至少要有一个工作，并且工作包含一组执行单个任务的步骤。
步骤可以运行命令或使用一个操作。
你可以创建自己的操作或使用 GitHub 社区共享的操作并根据需要自定义。

你可以配置工作流在一个 GitHub 事件发生时、一个计划（schedule）或从一个外部事件启动。

你需要使用 YAML 语法配置工作流，并把它们保存为你仓库中的工作流文件。
一旦成功创建了一个 YAML 工作流文件并触发了该工作流，你将会看到工作流每个步骤的构建日志、测试结果、工作和状态。

下面以 C/C++ 项目为例，对其 GitHub Actions 工作流进行基本的设置。

### 2.1. 定义工作流的名称（name）

name 定义工作流的名称，对该工作流要完成的任务进行简单的描述。

```yaml
name: C/C++ CI ## 表示这是一个 C/C++ 项目的 CI 工作流
```

### 2.2. 控制工作流的触发时机（on）

on 设置工作流的触发条件，一般指定为 push，表示在每次 git push 操作后自动触发该项目的工作流。

```yaml
on: [push]
```

可以让工作流在 master 和 release 分支的 push 事件上运行：

```yaml
on:
  push:
    branches:
    - master
    - release/*
```

或只在 master 分支的 pull_request 事件上运行：

```yaml
on:
  pull_request:
    branches:
    - master
```

也可以设置定时运行计划，在周一到周五每天的 02:00 运行：

```yaml
on:
  schedule:
  - cron: 0 2 * * 1-5
```

### 2.3. 在不同的操作系统上运行（runs-on）

GitHub Actions 提供 Linux、Windows 和 macOS 来构建运行。
更换操作系统只需指定一个不同的虚拟机：

runs-on 指定运行所在操作系统的类型。

```yaml
jobs:
  build:

    runs-on: ubuntu-latest # 表示工作流将在 ubuntu 的最新版本上运行
```

可用的虚拟机类型如下：

> * ubuntu-latest，ubuntu-18.04 或 ubuntu-16.04
> * windows-latest，windows-2019 或 windows-2016
> * macOS-latest 或 macOS-10.14

### 2.4. 使用签出操作（checkout actions）

你可以在你的工作流中使用多个标准操作。
签出操作是一个标准操作，在执行以下操作前你必须先把它包含在你的工作流中。

> * 你的工作流需要一份你仓库代码的副本，例如你在构建和测试你的仓库或使用持续集成时。
> * 你的工作流中至少有一个操作是在相同的仓库中定义的。

要使用标准的签出操作无需进一步说明，包含下面的步骤：

```yaml
- uses: actions/checkout@v1
```

在本例中使用 v1 可以确保你使用的是签出操作的一个稳定版本。

要浅层克隆你的仓库或只复制你仓库的最新版本，使用下面的语法设置提取深度（fetch-depth）：

```yaml
- uses: actions/checkout@v1
  with:
    fetch-depth: 1
```

更多内容，查看[签出操作的仓库](https://github.com/actions/checkout){:target="_blank"}。

### 2.5. 设置运行命令的步骤（steps）

每个工作都在 runs-on 指定的一个虚拟环境新实例中运行。

步骤用于设置工作流的运行步骤，即在终端中执行的 shell 命令。
run 设置要执行的命令。

```yaml
jobs:
  build:
    
    steps:
    - uses: actions/checkout@v1
    - name: make # 定义命令的名称
      run: make # 使用 Makefile 来构建项目
    - name: ...
      run: ...
```

### 2.6. 一个 C/C++ 项目的工作流模版

```yaml
name: C/C++ CI

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v1
    - name: configure
      run: ./configure
    - name: make
      run: make
    - name: make check
      run: make check
    - name: make distcheck
      run: make distcheck
```

### 2.7. 工作流配置文件的默认路径

每个工作流必须使用 YAML 写入一个扩展名为 .yml 的文件中。
文件名一般定义为项目主要使用的语言名称。
比如 c-cpp.yml，路径如下：

> .github/workflows/c-cpp.yml

### 2.8. 添加一个工作流状态标志到你仓库的 README.md 文件

状态标志显示工作流当前是失败（failing）还是通过（passing）。
通常是在你仓库的 README.md 文件中添加一个状态标志，但是你可以把它添加到任何你想要添加的网页中。
标志显示的是你的默认分支的状态（通常是主分支）。

![](https://github.com/mistydew/netCloud/workflows/C/C++%20CI/badge.svg)

如果你的工作流使用了 name 关键字，你可以通过 name 引用工作流。
如果你工作流的 name 中包含空格，你需要使用 URL 编码字符串 %20 替换空格。

```markdown
https://github.com/<OWNER>/<REPOSITORY>/workflows/<WORKFLOW_NAME>/badge.svg
```

如果你的工作流没有一个 name，你可以使用工作流文件相对于当前仓库根目录的相对路径来引用工作流。

```markdown
https://github.com/<OWNER>/<REPOSITORY>/workflows/<WORKFLOW_FILE_PATH>/badge.svg
```

**使用一个工作流名称的例子**

这个例子给一个 name 为“C/C++ CI”的工作流添加一个状态标志。
该仓库的所属者（OWNER）是 mistydew 用户，并且仓库（REPOSITORY）的名字是 hello-world。

```markdown
![](https://github.com/mistydew/hello-world/workflows/C/C++%20CI/badge.svg)
```

**使用一个工作流文件路径的例子**

这个例子给一个文件路径为 .github/workflows/c-cpp.yml 的工作流添加一个状态标志。
该仓库的所属者和仓库名同上。

```markdown
![](https://github.com/mistydew/hello-world/workflows/.github/workflows/c-cpp.yml/badge.svg)
```

## 参考链接

* [GitHub Actions now supports CI/CD, free for public repositories](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd){:target="_blank"}
* [Features • GitHub Actions](https://github.com/features/actions){:target="_blank"}
* [Automating your workflow with GitHub Actions - GitHub Help](https://help.github.com/en/categories/automating-your-workflow-with-github-actions){:target="_blank"}
* [actions/starter-workflows: Accelerating new GitHub Actions workflows](https://github.com/actions/starter-workflows){:target="_blank"}
