---
layout: default
permalink: /
---
<div class="home-left">
</div>

<div class="home-right">
  <h2>近期文章</h2>
  <ul>{% for post in site.posts limit:8 %}
    <li>
      <span><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y年%m月%d日' }}</abbr></span><br>
      <a href="{{ post.url }}">{{ post.title | escape }}</a>
    </li>{% endfor %}
  </ul>
</div>
