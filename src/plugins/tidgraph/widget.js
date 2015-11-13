/*\
title: $:/plugins/ihm/widgets/tidgraph.js
type: application/javascript
module-type: widget

Tidgraph widget to render HTML5/SVG graph of tiddlers

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var TidgraphWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

var utils = require("$:/plugins/ihm/tidgraph/utils.js");

/*Inherit from the base widget class */
TidgraphWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
TidgraphWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
   this.nextSiblingDomNode = nextSibling;
	this.computeAttributes();
	this.execute();

   this.tidtree = [];
   this.tidtree.mode = this.mode;
   this.tidtree.maxdepth = this.maxdepth;
   this.tidtree.startat = this.startat;
   this.tidtree.nodetitle = this.nodetitle;
   this.tidtree.tooltip = this.tooltip;
   this.tidtree.filter = this.filter;
   this.tidtree.nocollapse = this.nocollapse;
   this.tidtree.document = this.document;

   // Create container divs
   //    Widget div
   this.div = this.document.createElement("div");
   this.div.className =  "tgr-container tgr";

   //    Table div
   this.tablediv = this.document.createElement("div");
   this.tablediv.className = "ihm-tgr-tablediv";
   this.table = undefined;
   this.div.appendChild(this.tablediv);

   //    SVG div
   this.svgdiv = this.document.createElement("div");
   this.svgdiv.className = "tgr-svg-int";
   this.div.appendChild(this.svgdiv);

   this.parentDomNode.insertBefore(this.div,this.nextSiblingDomNode);
   this.domNodes.push(this.div);

   //Build tidtree from tiddlers
   this.tidtree.root = utils.makeTidTree(this.startTid,this.tidtree,{"widget": this})
   this.paint();

   var timeOut = null;
   var self = this;

   var resize_updateSVG = function() { 
      self.svgdiv.innerHTML = utils.buildSVG(self.tablediv,self.tidtree);
      if (self.oldresize) self.oldresize();
   }

   var scroll_updateSVG = function() { 
      self.svgdiv.innerHTML = utils.buildSVG(self.tablediv,self.tidtree);
   }

   this.div.onscroll = function(){
      if(!self.scroll_to) clearTimeout(self.scroll_to);
      self.scroll_to = setTimeout(scroll_updateSVG, 100);
   }

   if (!this.onresize_updated) {
      //Handle window resize
      if (window.onresize && this.oldresize == undefined ) 
         this.oldresize = window.onresize;
      
      window.onresize = function(){
         if(!self.resize_to) clearTimeout(self.resize_to);
         self.resize_to = setTimeout(resize_updateSVG, 100);
      }
      this.onresize_updated = true;
   }

   //DEBUG console.log("widget = ",this);
}

TidgraphWidget.prototype.paint = function() {
    //We need to redraw arrows if sidebar is closed/opened
    //this variable is used to check if sidebar status has changed on refresh
    this.sidebar = $tw.wiki.getTiddlerText("$:/state/sidebar");

    // Construct a table starting at the root tiddler
    var tbl = utils.buildTable(this.startTid,this.tidtree);

    // Add/replace the table and the SVG in the DOM 
    if (this.table) this.tablediv.replaceChild(tbl,this.table);
    else this.tablediv.appendChild(tbl);

    this.svgdiv.innerHTML = utils.buildSVG(this.tablediv,this.tidtree);

    this.table = tbl;
}

/*
Compute the internal state of the widget
*/
TidgraphWidget.prototype.execute = function() {
	// Get parameters from our attributes
    this.startTid = this.getAttribute("start");
	 this.mode = this.getAttribute("mode","tagging").toLowerCase();
    this.maxdepth = parseInt(this.getAttribute("maxdepth","10"));
    this.startat = this.getAttribute("startat","0");
    this.nodetitle = this.getAttribute("nodetitle");
    this.tooltip = this.getAttribute("tooltip","summary");
    this.filter  = this.getAttribute("filter","[!is[system]]");
    this.nocollapse = this.hasAttribute("nocollapse");
  

    if ( ["tagging","linking"].indexOf(this.mode) == -1 ) this.mode="tagging";

	// FIXME: We could build the descendant tree here?
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
TidgraphWidget.prototype.refresh = function(changedTiddlers) {
    //DEBUG   console.log("changedtiddlers=",changedTiddlers);

    //Set dirty flag if children have changed
    var dirty=false,t;
    this.computeAttributes();
    this.execute();
    for(t in changedTiddlers) {
        if ( document.getElementById(this.tidtree.id+'-'+escape(t)) ||  //for deletion/change
            utils.isDescendant(t,this.startTid,this.tidtree) )  //for addition 
        {
           //DEBUG console.log(`change triggered by "${t}"`);
           dirty = true;
           break;
        }
    }

    // Refresh if sidebar has been closed/opened since previous rendering
    var sb = $tw.wiki.getTiddlerText("$:/state/sidebar")
    if (sb !== this.sidebar) 
       dirty = true;

    //Refresh if dirty
    if (dirty) {
       this.refreshSelf();
       return true;
    } else {
       return false;
    }
};

exports.tidgraph = TidgraphWidget;

})();
