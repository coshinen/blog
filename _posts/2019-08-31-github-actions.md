---
layout: post
title:  "GitHub Actions workflows CI 入门"
date:   2019-08-31 22:56:58 +0800
author: mistydew
comments: true
categories: Git/GitHub CI/CD
tags: Git/GitHub CI/CD
---
持续集成 CI（Continuous Integration）是软件开发过程中，进行的一系列自动化测试。
持续部署 CD（Continuous Deployment）是指项目的部署上线，比如 GitHub Pages，每次提交之后都会自动进行部署。
CI、CD 都属于敏捷开发。

GitHub Actions 可以自动化 GitHub 上托管项目的工作流，从而实现 GitHub 对代码的托管、测试和部署一体化。
目前 GitHub 上较为流行的持续集成服务是 Travis CI，或将被 GitHub Actions workflows CI 取代。

GitHub Actions 目前处于测试阶段，需要注册 beta 版等待官方开启后才能使用。

## 0. 关于工作流

工作流是定制的自动化流程，你可以在你的仓库中设置该流程来在 GitHub 上构建、测试、打包、发布或部署任何项目。
通过工作流你可以使用各种工具和服务来自动化你的软件开发生命周期。

你可以在一个仓库中创建多个工作流。
你必须把工作流存储在你仓库根目录下的 .github/workflows 目录中。

工作流至少要有一个工作（job），并且工作（job）包含一组执行单个任务的步骤（step）。
步骤（step）可以运行命令或使用（use）一个操作（action）。
你可以创建你自己的操作（action）或使用 GitHub 社区共享的操作（action）并根据需要自定义。

你可以配置一个工作流在一个 GitHub 事件发生时、一个计划（schedule）或从一个外部事件启动。

你需要使用 YAML 语法配置工作流，并把它们保存为你仓库中的工作流文件。
一旦你成功创建了一个 YAML 工作流文件并触发了该工作流，你将会看到工作流每个步骤的构建日志、测试结果、工作和状态。

下面以 C/C++ 项目为例，对其 GitHub Actions 工作流进行基本的设置。

## 1. 定义工作流的名称

名字（name）定义工作流的名称，对该工作流要完成的任务进行简单的描述。

```yaml
name: C/C++ CI ## 表示这是一个 C/C++ 项目的 CI 工作流
```

## 2. 控制工作流的触发时机

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

## 3. 在不同的操作系统上运行

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

## 4. 使用签出操作

你可以在你的工作流中使用多个标准操作。
签出（checkout）操作是一个标准操作，在执行以下操作前你必须先把它包含在你的工作流中。

> * 你的工作流需要一份你仓库代码的副本，例如你在构建和测试你的仓库或使用持续集成时。
> * 你的工作流中至少有一个操作（action）是在相同的仓库中定义的。

要使用标准的签出（checkout）操作而无需进一步说明，包含下面的步骤（step）：

```yaml
- uses: actions/checkout@v1
```

在本例中使用 v1 可以确保你使用的是一个签出（checkout）操作的稳定版本。

要浅层克隆你的仓库或只复制你仓库的最新版本，使用下面的语法设置提取深度（fetch-depth）：

```yaml
- uses: actions/checkout@v1
  with:
    fetch-depth: 1
```

更多内容，查看[签出（checkout）操作的官方仓库](https://github.com/actions/checkout)。

## 5. 设置运行命令的步骤

每个工作（jobs）都在 runs-on 指定的一个虚拟环境新实例中运行。

步骤（steps）用于设置工作流的运行步骤，即在终端中执行的 shell 命令。
运行（run）设置要执行的命令。

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

## 6. 一个 C/C++ 项目的工作流模版

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

## 7. 工作流配置文件的默认路径

每个工作流必须使用 YAML 写入一个扩展名为 .yml 的文件中。
文件名一般定义为项目主要使用的语言名称。
比如 c-cpp.yml，路径如下：

> .github/workflows/c-cpp.yml

## 8. 添加一个工作流状态标志到你仓库的 README.md 文件

状态标志显示工作流当前是失败（failing）还是通过（passing）。
通常是在你仓库的 README.md 文件中添加一个状态标志，但是你可以把它添加到任何你想要添加的网页中。
标志显示的是你的默认分支的状态（通常是主分支）。

![GitHub Actions workflow status](https://github.com/mistydew/netCloud/workflows/C/C++%20CI/badge.svg)

如果你的工作流使用了名字（name）关键字，你可以通过名字（name）引用工作流。
如果你工作流的名字（name）中包含空格，你需要使用 URL 编码字符串 %20 替换空格。

```markdown
https://github.com/<OWNER>/<REPOSITORY>/workflows/<WORKFLOW_NAME>/badge.svg
```

如果你的工作流没有一个名字（name），你可以使用工作流文件相对于当前仓库根目录的相对路径来引用工作流。

```markdown
https://github.com/<OWNER>/<REPOSITORY>/workflows/<WORKFLOW_FILE_PATH>/badge.svg
```

**使用一个工作流名字（name）的例子**

这个例子为一个名字（name）为“C/C++ CI”的工作流添加一个状态标志。
该仓库的所属者（OWNER）是 mistydew 用户，并且仓库（REPOSITORY）的名字是 hello-world。

```markdown
![](https://github.com/mistydew/hello-world/workflows/C/C++%20CI/badge.svg)
```

**使用一个工作流文件路径的例子**

这个例子为一个文件路径为 .github/workflows/c-cpp.yml 的工作流添加一个状态标志。
该仓库的所属者（OWNER）是 mistydew 用户，并且仓库（REPOSITORY）的名字是 hello-world。

```markdown
![](https://github.com/mistydew/hello-world/workflows/.github/workflows/c-cpp.yml/badge.svg)
```

## 参照

* [GitHub Actions now supports CI/CD, free for public repositories](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd){:target="_blank"}
* [Features • GitHub Actions](https://github.com/features/actions){:target="_blank"}
* [Automating your workflow with GitHub Actions - GitHub Help](https://help.github.com/en/categories/automating-your-workflow-with-github-actions){:target="_blank"}
* [actions/starter-workflows: Accelerating new GitHub Actions workflows](https://github.com/actions/starter-workflows){:target="_blank"}
