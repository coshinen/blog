---
layout: default
permalink: /
excerpt: Welcome to my weblog.
---
<div class="home-left">
  <ul class="post-list">{% for post in site.posts limit:7 %}
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
    <h2 title="Here are my favorite quotes from someones that inspire me or make me laugh.">关于</h2>
    <img src="https://avatars0.githubusercontent.com/u/29818825" alt="@{{ site.author.github }}">
    <div id="aquote"></div>
    <script src="{{ "/assets/js/aquote.js" | relative_url }}"></script>
    <ul>
      <li>
        <svg class="icon">
          <use xlink:href="{{ "/assets/icons/oct.svg#mail" | relative_url }}"></use>
        </svg>
        <a href="mailto:{{ site.author.e-mail }}">{{ site.author.e-mail }}</a>
      </li>
      <li>
        <svg class="icon">
          <use xlink:href="{{ "/assets/icons/oct.svg#key" | relative_url }}"></use>
        </svg>
        <a href="{{ "/pubkey.asc" | relative_url }}" title="PGP fingerprint">EDD222E8860891F6</a>
      </li>
    </ul>
  </div>
  <div id="category">
    <h2 title="{{ site.categories.size }}">分类</h2>
    <ul>{% for category in site.categories %}
      <li><a href="{{ "/category.html" | relative_url }}#{{ category[0] }}">{{ category[0] }}</a>（{{ category[1].size }}）</li>{% endfor %}
    </ul>
  </div>
  <div id="tagcloud">
    <h2 title="{{ site.tags.size }}">标签</h2>{% assign max = site.tags.first[1].size %}{% assign min = max %}{% for tag in site.tags offset:1 %}{% if tag[1].size > max %}{% assign max = tag[1].size %}{% elsif tag[1].size < min %}{% assign min = tag[1].size %}{% endif %}{% endfor %}{% assign diff = max | minus: min %}{% for tag in site.tags %}{% assign temp = tag[1].size | minus: min | times: 36 | divided_by: diff %}{% assign base = temp | divided_by: 4 %}{% assign remain = temp | modulo: 4 %}{% if remain == 0 %}{% assign size = base | plus: 9 %}{% elsif remain == 1 or remain == 2 %}{% assign size = base | plus: 9 | append: '.5' %}{% else %}{% assign size = base | plus: 10 %}{% endif %}{% if remain == 0 or remain == 1 %}{% assign color = 9 | minus: base %}{% else %}{% assign color = 8 | minus: base %}{% endif %}
    <a href="{{ "/tags.html" | relative_url }}#{{ tag[0] }}" style="font-size:{{ size }}pt;color:#{{ color }}{{ color }}{{ color }}">{{ tag[0] }}</a>{% endfor %}
  </div>
  <div id="archive">
    <h2 title="{{ site.posts.size }}">归档</h2>
    <ul>{% assign count = 1 %}{% for post in site.posts %}{% assign yearmonth = post.date | date: '%Y年%m月' %}{% assign prevyearmonth = post.previous.date | date: '%Y年%m月' %}{% if yearmonth == prevyearmonth %}{% assign count = count | plus: 1 %}{% else %}
      <li><a href="{{ "/archive.html" | relative_url }}#{{ yearmonth }}">{{ yearmonth }}</a>（{{ count }}）</li>{% assign count = 1 %}{% endif %}{% endfor %}
    </ul>
  </div>
</div>
