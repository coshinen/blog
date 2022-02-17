---
layout: default
permalink: /
excerpt: Welcome to my weblog.
---
<div class="home-left">
  <ul class="post-list">{% for post in site.posts limit:8 %}
    <li>
      <span class="post-meta"><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y年%m月%d日" }}</abbr></span>
      <span class="right">分类：<a class="category" href="{{ "/category.html" | relative_url }}#{{ post.category }}">{{ post.category }}</a></span>
      <h2><a class="post-link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h2>
      {{ post.excerpt }}
      <span><a class="readmore" href="{{ post.url | relative_url }}">阅读全文 &raquo;</a></span>
    </li>{% endfor %}
  </ul>
</div>

<div class="home-right">
  <div id="profile">
    <h2>关于</h2>
    <img src="https://avatars0.githubusercontent.com/u/29818825" alt="@{{ site.author.github }}" height="128" width="128">{% assign sum = site.data.quotes | size %}{% assign second = site.time | date: "%S" %}{% assign seed = second | modulo: sum %}
    <div id="onequote" title="{{ site.data.quotes[seed].from }}">
      <div>“{{ site.data.quotes[seed].quote }}”</div>
      <div id="author">——{{ site.data.quotes[seed].name }}</div>{% if site.data.quotes[seed].link %}
      <a href="{{ site.data.quotes[seed].link }}" target="_blank">
        <svg class="icon">
          <use xlink:href="{{ "/assets/icons/oct.svg#link" | relative_url }}"></use>
        </svg>
      </a>{% endif %}
    </div>
    <ul>
      <li>
        <a href="mailto:{{ site.author.e-mail }}">Email</a> •
        <a href="{{ "/pubkey.asc" | relative_url }}" title="Fingerprint: 794E47B4762431BA">GPG</a>
      </li>
      <li><a href="https://ganekuro.github.io" title="深紅の鴉非公式サイト" target="_blank">Garnet</a></li>
      <li><a href="{{ "/booklog.html" | relative_url }}">Booklog</a></li>
    </ul>
  </div>
  <div id="category">
    <h2>分类</h2>
    <ul>{% for category in site.categories %}
      <li><a href="{{ "/category.html" | relative_url }}#{{ category[0] }}">{{ category[0] }}</a>（{{ category[1].size }}）</li>{% endfor %}
    </ul>
  </div>
  <div id="tagcloud">
    <h2>标签</h2>{% assign max = site.tags.first[1].size %}{% assign min = max %}{% for tag in site.tags offset:1 %}{% if tag[1].size > max %}{% assign max = tag[1].size %}{% elsif tag[1].size < min %}{% assign min = tag[1].size %}{% endif %}{% endfor %}{% assign diff = max | minus: min %}{% for tag in site.tags %}{% assign temp = tag[1].size | minus: min | times: 36 | divided_by: diff %}{% assign base = temp | divided_by: 4 %}{% assign remain = temp | modulo: 4 %}{% if remain == 0 %}{% assign size = base | plus: 9 %}{% elsif remain == 1 or remain == 2 %}{% assign size = base | plus: 9 | append: '.5' %}{% else %}{% assign size = base | plus: 10 %}{% endif %}{% if remain == 0 or remain == 1 %}{% assign color = 9 | minus: base %}{% else %}{% assign color = 8 | minus: base %}{% endif %}
    <a href="{{ "/tags.html" | relative_url }}#{{ tag[0] }}" style="font-size:{{ size }}pt;color:#{{ color }}{{ color }}{{ color }}">{{ tag[0] }}</a>{% endfor %}
  </div>
  <div id="archive">
    <h2>归档</h2>
    <ul>{% assign count = 1 %}{% for post in site.posts %}{% assign yearmonth = post.date | date: '%Y年%m月' %}{% assign prevyearmonth = post.previous.date | date: '%Y年%m月' %}{% if yearmonth == prevyearmonth %}{% assign count = count | plus: 1 %}{% else %}
      <li><a href="{{ "/archive.html" | relative_url }}#{{ yearmonth }}">{{ yearmonth }}</a>（{{ count }}）</li>{% assign count = 1 %}{% endif %}{% endfor %}
    </ul>
  </div>
</div>
