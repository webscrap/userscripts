// ==UserScript==
// @name        myplace.baidu.yun.share.link
// @namespace   eotect@myplace
// @description myplace.baidu.yun.share.link
// @include     http://yun.baidu.com/share/link?*
// @include     http://pan.baidu.com/share/link?*
// @include     http://pan.baidu.com/s/*
// @include     http://yun.baidu.com/s/*
// @version     1.03
// @grant none
// ==/UserScript==


(function(){
	if(typeof unsafeWindow == 'undefined') {
    	var unsafeWindow = window;
        window.unsafeWindow = window;
    }
    if(typeof $myPlace == 'undefined') {
        var $myPlace = unsafeWindow.$myPlace;
    }
    var $ = $myPlace.jQuery; 
	var yun = $myPlace.baidu.yun;
	var FileUtils = unsafeWindow.FileUtils;
	var _L = yun.share._L;
	var message = yun.share.message;
	
	yun.share.link = {
		getFiles : function(what,callback){
			if(FileUtils.viewShareData) {
				var f = $.parseJSON(FileUtils.viewShareData);
				data = [{
					shareid:	FileUtils.share_id,
					uk:			FileUtils.sysUK,
					filelist:	[{path:f.path}],
					server_filename	:	f.server_filename,
					fs_id	:	f.fs_id,
					title:		f.server_filename,
				}];
			}
			else {
				var _ = (FileUtils.getViewMode() == 1 ? FileUtils._mInfiniteGridView : FileUtils._mInfiniteListView);
				if(_) {
					data =  _.getCheckedItems();
					if(data.length<1) {
						data = _.getElementsData();
					}
				}
				if(data.length<1) {
					message("Error, or sharing list is empty.",2);
					return;
				}
				else {
					var cdata = [];
					for(var i=0;i<data.length;i++) {
						cdata.push( {
							shareid:	FileUtils.share_id,
							uk:			FileUtils.sysUK,
							filelist:	[data[i]],
							title:		data[i].server_filename,
						})
					}
					data = cdata;
				}
			}
			for(var i=0;i<data.length;i++) {
				for(var j=0;j<data[i].filelist.length;j++) {
						try {
							data[i].filelist[j].path = decodeURIComponent(data[i].filelist[j].path);
						} catch(e) {
							message(e + ": " + data[i].filelist[j].path,2)
						}
				}
			}
			if(typeof callback == 'function') {
				callback(data);
			}
			return data;
		},
	};
	$(document).ready(function(){
		var pos = $('#barCmdViewList')[0];
		var btn;
		if(pos) {
			pos = pos.parentNode;
			btn = $('<li><button style="display:inline;height:29px;margin-right:5px" ' +
				'title="' + _L('Quick Save') + '" href="javascript:;" class="two-pix-btn">' + 
				_L('Quick Save') + 	'</button></li>');
			btn.click(function(){
				yun.share.save(yun.share.link,'folder');
			});				
		}
		else {
			pos = $('#emphsizeButton')[0];
			btn = $('<a id="quickSaveButton" class="new-sbtn okay" href="javascript:;" hidefocus="true">' +
					'<em class="icon-share-save"></em>'+
					'<b>'+_L('Quick Save') + '</b></a>');
			btn.click(function() {
				yun.share.save(yun.share.link,'file');
			});
		}
		btn.insertBefore(pos);	
	});
})();
