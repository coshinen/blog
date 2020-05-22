---
layout: page
title: "分类"
permalink: /blog/category.html
excerpt: Blog category.
---
<div id="category">
  <h2>目录</h2>
{% for category in site.categories %}
  <li><a href="#{{ category[0] }}">{{ category[0] }}</a>（{{ category[1].size }}）</li>
{% endfor %}
</div>

{% for category in site.categories %}
<div class="contents">
  <h2 id="{{ category[0] }}">{{ category[0] }}（{{ category[1].size }}）<a href="#category" style="float:right;">{% include icon/chevron-up.svg %}</a></h2>
  <ul>
    {% for post in category[1] %}
    <li><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d-" }}</abbr><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
</div>
{% endfor %}
