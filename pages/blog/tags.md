---
layout: page
title: "标签"
permalink: /blog/tags.html
excerpt: Blog tags.
---
{% assign first = site.tags.first %}
{% assign max = first[1].size %}
{% assign min = max %}
{% for tag in site.tags offset:1 %}
  {% if tag[1].size > max %}
    {% assign max = tag[1].size %}
  {% elsif tag[1].size < min %}
    {% assign min = tag[1].size %}
  {% endif %}
{% endfor %}
{% assign diff = max | minus: min %}
<div id="tagcloud">
{% for tag in site.tags %}
  {% assign temp = tag[1].size | minus: min | times: 36 | divided_by: diff %}
  {% assign base = temp | divided_by: 4 %}
  {% assign remain = temp | modulo: 4 %}
  {% if remain == 0 %}
    {% assign size = base | plus: 9 %}
  {% elsif remain == 1 or remain == 2 %}
    {% assign size = base | plus: 9 | append: '.5' %}
  {% else %}
    {% assign size = base | plus: 10 %}
  {% endif %}
  {% if remain == 0 or remain == 1 %}
    {% assign color = 9 | minus: base %}
  {% else %}
    {% assign color = 8 | minus: base %}
  {% endif %}
  <a href="#{{ tag[0] }}" style="font-size: {{ size }}pt; color: #{{ color }}{{ color }}{{ color }};">{{ tag[0] }}</a>
{% endfor %}
</div>

{% for tag in site.tags %}
<div class="contents">
  <h2 id="{{ tag[0] }}">{{ tag[0] }}（{{ tag[1].size }}）<a href="#tagcloud" style="float:right;">{% include icon/chevron-up.svg %}</a></h2>
  <ul>
    {% for post in tag[1] %}
    <li><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d-" }}</abbr><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
</div>
{% endfor %}
