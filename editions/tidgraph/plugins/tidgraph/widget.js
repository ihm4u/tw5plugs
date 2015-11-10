/*\
title: $:/plugins/ihm/widgets/tidgraph.js
type: application/javascript
module-type: widget

Tidgraph widget to render HTML5/SVG graph of tiddlers

\*/
(function(){var g=require("$:/core/modules/widgets/widget.js").widget,a=function(f,d){this.initialise(f,d)},e=require("$:/plugins/ihm/tidgraph/utils.js");a.prototype=new g;a.prototype.render=function(f,d){this.parentDomNode=f;this.computeAttributes();this.execute();var b=this.document.createElement("div");b.className="tgr-container tgr";var a=this.document.createElement("div");a.className="tgr-svg-int";b.appendChild(a);var h=this.document.createElement("div");b.appendChild(h);f.insertBefore(b,d);
this.domNodes.push(b);this.tidtree=[];this.tidtree.mode=this.mode;this.tidtree.maxdepth=this.maxdepth;this.tidtree.startat=this.startat;this.tidtree.nodetitle=this.nodetitle;this.tidtree.tooltip=this.tooltip;this.tidtree.filter=this.filter;this.sidebar=$tw.wiki.getTiddlerText("$:/state/sidebar");var g=e.buildTable(this.startTid,this.tidtree);h.innerHTML=g;a.innerHTML=e.buildSVG(b,this.tidtree);window.onresize&&void 0==this.oldresize&&(this.oldresize=window.onresize);var c=this,k=function(){a.innerHTML=
e.buildSVG(b,c.tidtree);c.oldresize&&c.oldresize()},l=function(){a.innerHTML=e.buildSVG(b,c.tidtree)};b.onscroll=function(){c.scroll_to||clearTimeout(c.scroll_to);c.scroll_to=setTimeout(l,100)};window.onresize=function(){c.resize_to||clearTimeout(c.resize_to);c.resize_to=setTimeout(k,100)}};a.prototype.execute=function(){this.startTid=this.getAttribute("start");this.mode=this.getAttribute("mode","tagging").toLowerCase();this.maxdepth=parseInt(this.getAttribute("maxdepth","10"));this.startat=this.getAttribute("startat",
"0");this.nodetitle=this.getAttribute("nodetitle");this.tooltip=this.getAttribute("tooltip","summary");this.filter=this.getAttribute("filter","[!is[system]]");-1==["tagging","linking"].indexOf(this.mode)&&(this.mode="tagging")};a.prototype.refresh=function(a){var d=!1,b;this.computeAttributes();this.execute();for(b in a)if(document.getElementById(this.tidtree.id+"-"+escape(b))||e.isDescendant(b,this.startTid,this.tidtree)){d=!0;break}$tw.wiki.getTiddlerText("$:/state/sidebar")!==this.sidebar&&(d=
!0);return d?(this.refreshSelf(),!0):!1};exports.tidgraph=a})();
