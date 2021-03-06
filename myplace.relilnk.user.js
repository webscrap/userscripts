// ==UserScript==
// @name        myplace.relilnk
// @namespace   eotect@myplace
// @description myplace.relilnk
// @include     http://*.7958.com/*
// @include     https://torrentproject.com/*/*torrent.html
// @include     http://torrentproject.com/*/*torrent.html
// @include		http://*bt.com/Item/*
// @include		https://*bt.com/Item/*
// @include		*kaisou.cc/Item/*
// @include		http://*weipai.cn/*
// @include	http://nikkanerog.com/*
// @include	http://panpilog.com/*
// @include 	http://www.erogazo-jp.net/*
// @version     1.1
// @grant       none
// ==/UserScript==
if(typeof unsafeWindow == 'undefined') {
	var unsafeWindow = window;
}
if(typeof $myPlace == 'undefined') {
	var $myPlace = unsafeWindow.$myPlace || {};
}
if(typeof $myPlace.relink == 'undefined') {
	$myPlace.relink = {};
}
(function(d){
	var $ = $myPlace.jQuery;
	var DOC = window.document;
	var HREF = DOC.location.href;
	var LINKS = document.getElementsByTagName('a');
	var IMAGES = document.getElementsByTagName('img');
	
	d.elements = [];
	
	for(var i=0;i<LINKS.length;i++) {
		d.elements.push(LINKS[i]);
	}
	for(var i=0;i<IMAGES.length;i++) {
		d.elements.push(IMAGES[i]);
	}
	
	d.sites = [];
	
	function start() {
		for(var i=0;i<d.sites.length;i++) {
			var s = d.sites[i];
			if(s.disable) {
				continue;
			}
			else if(s.target) {
				if(!HREF.match(s.target)) {
					continue;
				}
			}
			else if(s.check && !s.check(HREF,DOC)) {
				continue;
			}
			console.log('myPlace.relink [' + s.name + ']');
			if(s.relinks) {
				s.relinks(d.elements,DOC);
			}
			else {
				for(var j=0;j<d.elements.length;j++) {
					if(s.relink(d.elements[i],DOC)) {
						break;
					}
				}
			}
		}
	}
	function A(target,relink) {
		var def = {target:target};
		def.name = target;
		var tf = typeof(relink);
		if(tf == 'function') {
			def.relinks = function(links,doc) {
				for(var i=0;i<links.length;i++) {
					if(relink(links[i],doc)) {
						break;
					}
				}
			};
		}
		else if(tf == 'object' && tf.length) {
			def.relinks = function(links,doc) {
				for(var i=0;i<links.length;i++) {
					if(links[i].href) {
						links[i].href = links[i].href.replace(relink[0],relink[1]);
					}
					else if(links[i].src) {
						links[i].src = links[i].src.replace(relink[0],relink[1]);
					}
				}
			};
		}
		else {
			def.relinks = function(links,doc) {
				for(var i=0;i<links.length;i++) {
					if(links[i].href) {
						links[i].href = links[i].href.replace(relink,'');
					}					
					else if(links[i].src) {
						links[i].src = links[i].src.replace(relink[0],relink[1]);
					}
				}
			};
		}
		d.sites.push(def);
	}
	
	d.sites.push({		
		target:	'7958.com',
		relink:	function(doc,links){				
			for(var i=0;i<links.length;i++) {
				if(links[i].href && links[i].href.match(/\d+\.html$/)) {
					links[i].href = links[i].href.replace(/download_(\d+\.html)$/,'index/downfile/$1');
					links[i].href = links[i].href.replace(/down_(\d+\.html)$/,'download_$1');

				}
			}
			var btn = $('#downtc');
			if(btn.length) {
				btn.html($(unsafeWindow.downurl));
			}
		},
	});

	A(/torrentproject\.com/,
		[/google\.com\/search\?/,'google.com/search?safe=off&']
	);
	A(/(?:kaisou\.cc|bt\.com)\/Item/,
		function(link,doc){
			var title = document.title.replace(/(?:BT下载|高清BT).*$/,'');
			if(link.href && link.href.match(/BTDown\//)) {
				link.href = link.href.replace(/BTDown\//,'Torrent/');
				link.setAttribute('title',title);
			}
		}
	);
	
	A(/weipai\.cn/,
		[/\/user\/([^\/]+)\/?$/,'/videos/$1']
	);
	A(/blog-entry-\d+/,
		[/fc2\.com/,'fc2blog.us']
	);
	
d.start = start;
d.A = A;	
DOC.addEventListener('load',start);
})($myPlace.relink);
