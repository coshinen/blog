---
layout: page
title: "归档"
permalink: /blog/archive.html
excerpt: Blog archive.
---
{% assign count = 1 %}
{% for post in site.posts reversed %}
  {% assign year = post.date | date: '%Y' %}
  {% assign nyear = post.next.date | date: '%Y' %}
  {% if year != nyear %}
    {% assign years = years | append: year | append: ', ' %}
    {% assign counts = counts | append: count | append: ', ' %}
    {% assign count = 1 %}
  {% else %}
    {% assign count = count | plus: 1 %}
  {% endif %}
{% endfor %}
{% assign years = years | split: ', ' | reverse %}
{% assign counts = counts | split: ', ' | reverse %}
{% assign idx = 0 %}
<div id="archive">
  <h2>日期</h2>
{% for year in years %}
  <li><a href="#{{ year }}">{{ year }}</a>（{{ counts[idx] }}）</li>
{% assign idx = idx | plus: 1 %}
{% endfor %}
</div>

{% assign i = 0 %}
{% for post in site.posts %}
  {% assign year = post.date | date: '%Y' %}
  {% assign nyear = post.next.date | date: '%Y' %}
  {% if year != nyear %}
    {% if i != 0 %}
  </ul>
</div>
    {% endif %}
<div class="contents">
  <h2 id="{{ post.date | date: '%Y' }}">{{ post.date | date: '%Y' }}（{{ counts[i] }}）<a href="#archive" style="float:right;">{% include icon/chevron-up.svg %}</a></h2>
  <ul>
    {% assign i = i | plus: 1 %}
  {% endif %}
    <li><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d-" }}</abbr><a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
  </ul>
</div>
