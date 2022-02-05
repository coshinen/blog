---
layout: default
permalink: /
excerpt: Here is my paraverse.
---
<div class="home-left">
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
          <use xlink:href="/assets/icons/oct.svg#link"></use>
        </svg>
      </a>{% endif %}
    </div>
    <ul>
      <li><a href="/blog/" title="{{ site.posts.size }}">Blog</a></li>
      <li>
        <a href="mailto:{{ site.author.e-mail }}">Email</a>
        <a href="/pubkey.asc" title="PGP public key fingerprint: DC05599C94889C12A66FD64C794E47B4762431BA">
          <svg class="icon">
            <use xlink:href="/assets/icons/oct.svg#key"></use>
          </svg>
        </a>
      </li>
      <li><a href="https://ganekuro.github.io" title="深紅の鴉非公式サイト" target="_blank">Garnet</a></li>
      <li><a href="/booklog.html">Booklog</a></li>
    </ul>
  </div>
</div>
