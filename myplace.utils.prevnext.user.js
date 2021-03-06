// ==UserScript==
// @name           myplace.utils.prevnext
// @namespace      eotect@myplace
// @description    previous and next page
// @include        http*
// @version			1.01
// @grant 		none
// ==/UserScript==

if(!unsafeWindow) {
	unsafeWindow = window;
}


( function() {
var $myPlace = $myPlace || unsafeWindow.$myPlace || {};
unsafeWindow.$myPlace = $myPlace;
var XRZPanel = $myPlace.panel;
if(!XRZPanel.init()) return false;


function debugPrint(text) {
    //GM_log("BBSPanel:" + text);
}
var prevtext="Previous";
var nexttext="Next";
var prevexp=/(goto-previous|nextnewset|goto=previous)$/i;
var nextexp=/(goto-next|nextoldset|goto=next)$/i;
var prevpage=/^(%3C|&lt;|<)?(%u4E0A%u4E00%u9801|%u4E0A%u4E00%u4E3B%u9898|%u4E0A%u4E00%u9875|%u4E0A%u9875|%u524D%u9875|%u524D%u3078|previous|prev|Newer)$/i;
var nextpage=/^(%u4E0B%u4E00%u9801|%u4E0B%u4E00%u4E3B%u9898|%u4E0B%u4E00%u9875|%u4E0B%u9875|%u6B21%u3078|next|Older)(&gt;|>|%3E)?$/i;
var separatetext="&nbsp;&nbsp; &nbsp; &nbsp;";
var prevlink=null;
var nextlink=null;
links=document.getElementsByTagName("a");
for (var i=0;i<links.length;++i) {
    if (prevlink && nextlink) break;
    curhref=links[i].href;
    curtext=escape(links[i].text);
    if (!prevlink) {
        if (curhref.match(prevexp) || curtext.match(prevpage)) { 
            prevlink = links[i].cloneNode(true);
            continue;
            }
    }
    if (!nextlink) {
        if (curhref.match(nextexp) || curtext.match(nextpage)) {
            nextlink = links[i].cloneNode(true);
            continue;
            }
    }
}
if (! (prevlink || nextlink)) {
    //XRZPanel.delete();
    return;
}


var separate=document.createElement("span");
separate.innerHTML=separatetext;

if (prevlink) {
    prevlink.innerHTML=prevtext;
    prevlink.style.color="blue";
    prevlink.title="Press Ctrl + <-";
    prevlink.style.textDecoration="underline";
    prevlink.id="bbs_prev";
    XRZPanel.addSpace();
    XRZPanel.add(prevlink);
}
if (nextlink) {
    nextlink.innerHTML=nexttext;
    nextlink.title="Press Ctrl + ->";
    nextlink.style.color="blue";
    nextlink.style.textDecoration="underline";
    nextlink.id="bbs_next";
    XRZPanel.addSpace();
    XRZPanel.add(nextlink);
}
XRZPanel.show();

window.addEventListener(
    "keypress",
    function(evt) {
        if(!evt) 
            evt = window.event;
        if(!evt.ctrlKey) return;
        var key;
        var prevlink = document.getElementById("bbs_prev");
        var nextlink = document.getElementById("bbs_next");
        var newhref;
        if (!evt) 
            key=window.event.keyCode;
        else
            key=evt.keyCode;
        switch (key) {
            case 37 :
                newhref=prevlink.href;
                break;
            case 39 :
                newhref=nextlink.href;
                break;
        }
        if(newhref) {
            window.document.location=newhref;
        }
  },
  false);

    
}) ();

