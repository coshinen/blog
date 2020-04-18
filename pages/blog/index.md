---
layout: default
permalink: /blog/
---

<div class="home-left">
  <ul class="post-list">{% for post in site.posts %}{% if post.stickie == true %}
    <li>
      <span class="post-meta"><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y年%m月%d日" }}</abbr>【置顶】</span>
      <span style="float:right;">分类：<a class="category" href="{{ site.category }}#{{ post.category }}">{{ post.category }}</a></span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      {{ post.excerpt | markdownify }}
      <span><a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a></span>
    </li>{% endif %}{% endfor %}
    <h2 class="page-heading">最新文章</h2>{% for post in site.posts limit:7 %}
    <li>
      <span class="post-meta"><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y年%m月%d日" }}</abbr></span>
      <span style="float:right;">分类：<a class="category" href="{{ site.category }}#{{ post.category }}">{{ post.category }}</a></span>
      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
      {{ post.excerpt | markdownify }}
      <span><a class="readmore" href="{{ post.url }}">阅读全文 &raquo;</a></span>
    </li>{% endfor %}
  </ul>
</div>
<div class="home-right">
  <blockquote>
    <h2>分类</h2>{% assign count = 0 %}{% for category in site.categories %}{% for post in category.last %}{% assign count = count | plus: 1 %}{% endfor %}{% assign counts = counts | append: count | append: ', ' %}{% assign count = 0 %}{% endfor %}{% assign counts = counts | split: ', ' %}{% assign idx = 0 %}{% for category in site.categories %}
    <li><a href="{{ site.category }}#{{ category[0] }}">{{ category | first }}</a>（{{ counts[idx] }}）</li>{% assign idx = idx | plus: 1 %}{% endfor %}
  </blockquote>
  <blockquote>
    <h2>标签</h2>{% assign first = site.tags.first %}{% assign max = first[1].size %}{% assign min = max %}{% for tag in site.tags offset:1 %}{% if tag[1].size > max %}{% assign max = tag[1].size %}{% elsif tag[1].size < min %}{% assign min = tag[1].size %}{% endif %}{% endfor %}{% assign diff = max | minus: min %}{% for tag in site.tags %}{% assign temp = tag[1].size | minus: min | times: 36 | divided_by: diff %}{% assign base = temp | divided_by: 4 %}{% assign remain = temp | modulo: 4 %}{% if remain == 0 %}{% assign size = base | plus: 9 %}{% elsif remain == 1 or remain == 2 %}{% assign size = base | plus: 9 | append: '.5' %}{% else %}{% assign size = base | plus: 10 %}{% endif %}{% if remain == 0 or remain == 1 %}{% assign color = 9 | minus: base %}{% else %}{% assign color = 8 | minus: base %}{% endif %}
    <a href="{{ site.tag }}#{{ tag[0] }}" style="font-size: {{ size }}pt; color: #{{ color }}{{ color }}{{ color }};">{{ tag[0] }}</a>{% endfor %}
  </blockquote>
  <blockquote>
    <h2>归档</h2>{% assign counts = null %}{% assign count = 1 %}{% for post in site.posts reversed %}{% assign year = post.date | date: '%Y' %}{% assign nyear = post.next.date | date: '%Y' %}{% if year != nyear %}{% assign years = years | append: year | append: ', ' %}{% assign counts = counts | append: count | append: ', ' %}{% assign count = 1 %}{% else %}{% assign count = count | plus: 1 %}{% endif %}{% endfor %}{% assign years = years | split: ', ' | reverse %}{% assign counts = counts | split: ', ' | reverse %}{% assign idx = 0 %}{% for year in years %}
    <li><a href="{{ site.archive }}#{{ year }}">{{ year }}</a>（{{ counts[idx] }}）</li>{% assign idx = idx | plus: 1 %}{% endfor %}
  </blockquote>
</div>