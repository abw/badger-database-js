import{_ as s,o as e,c as a,a2 as i}from"./chunks/framework.mZNJGiH_.js";const E=JSON.parse('{"title":"Records","description":"","frontmatter":{},"headers":[],"relativePath":"records.md","filePath":"records.md","lastUpdated":1709228065000}'),t={name:"records.md"},o=i(`<h1 id="records" tabindex="-1">Records <a class="header-anchor" href="#records" aria-label="Permalink to &quot;Records&quot;">​</a></h1><p>Various <a href="./table-methods.html">table methods</a> have the option to return a record object instead of a plain Javascript data object containing the row data. Or, in the case <a href="./table-methods.html#fetchallrecords-where-options"><code>fetchAllRecords()</code></a> and similar methods, they return an array of record objects.</p><p>The record object implements a lightweight version of the Active Record pattern.</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> record</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> users.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">oneRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { email: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;bobby@badgerpower.com&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>The row data loaded from the database is stored in the <code>row</code> property. You can access individual items or the row data as a whole.</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.row.id);      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// e.g. 1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.row.name);    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Bobby Badger</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.row.email);   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// bobby@badgerpower.com</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.row);         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// { id: 1, name: &#39;Bobby Badger&#39;, etc. }</span></span></code></pre></div><p>Technically speaking, the methods actually return a Proxy object wrapper around a record object (or an array of Proxy objects in the case of <a href="./table-methods.html#fetchallrecords-where-options"><code>fetchAllRecords()</code></a> et al). The purpose of the Proxy object, among other things, is to give you access to row data items without needing to specify the <code>.row</code> property.</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.id);          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// e.g. 1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.name);        </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Bobby Badger</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.email);       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// bobby@badgerpower.com</span></span></code></pre></div><p>This makes the record object look and feel just like a row of data, but with some extra benefits. For example, the <a href="./record-methods.html#update-set"><code>update()</code></a> method allows you to update the record and corresponding row in the database.</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> record.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Robert Badger&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(record.name); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Robert Badger</span></span></code></pre></div><p>The Proxy object also gives you easy access to <a href="./relations.html">relations</a> that are defined for the table. For example, if the <code>users</code> table defines <code>orders</code> as a relation then you can access them as <code>.orders</code>;</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> orders</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> record.orders;</span></span></code></pre></div><p>Note that any other properties or methods defined for the record will take priority. For example, <code>record.update</code> will resolve to the record <a href="./record-methods.html#update-set"><code>update()</code></a> method so if you have a column called <code>update</code> then you must access it as <code>record.row.update</code>.</p><h2 id="where-next" tabindex="-1">Where Next? <a class="header-anchor" href="#where-next" aria-label="Permalink to &quot;Where Next?&quot;">​</a></h2><p>In the next few sections we&#39;ll look at the <a href="./record-methods.html">record methods</a> that are provided, and how to define your own custom <a href="./record-class.html">record class</a> where you can put additional functionality relating to a record.</p>`,15),h=[o];function n(r,l,d,p,c,k){return e(),a("div",null,h)}const y=s(t,[["render",n]]);export{E as __pageData,y as default};