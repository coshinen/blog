---
layout: page
title: "归档"
permalink: /blog/archive.html
excerpt: Blog archive.
---
<div id="archive">
  <h2>日期</h2>
  <ul>
{% assign count = 1 %}
{% for post in site.posts %}
  {% assign year = post.date | date: '%Y' %}
  {% assign prevyear = post.previous.date | date: '%Y' %}
  {% if year == prevyear %}
    {% assign count = count | plus: 1 %}
  {% else %}
    <li><a href="#{{ year }}">{{ year }}</a>（{{ count }}）</li>
    {% assign counts = counts | append: count | append: ', ' %}
    {% assign count = 1 %}
  {% endif %}
{% endfor %}
  </ul>
</div>

{% assign idx = 0 %}
{% assign counts = counts | split: ', ' %}
{% for post in site.posts %}
  {% assign year = post.date | date: '%Y' %}
  {% assign nextyear = post.next.date | date: '%Y' %}
  {% if year != nextyear %}
    {% if idx != 0 %}
  </ul>
</div>
    {% endif %}
<div class="contents">
  <h2 id="{{ post.date | date: '%Y' }}">{{ post.date | date: '%Y' }}（{{ counts[idx] }}）<a href="#archive" style="float:right;">{% include icon/chevron-up.svg %}</a></h2>
  <ul>
    {% assign idx = idx | plus: 1 %}
  {% endif %}
    <li><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d-" }}</abbr><a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
  </ul>
</div>
