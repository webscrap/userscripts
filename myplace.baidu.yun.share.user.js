// ==UserScript==
// @name        myplace.baidu.yun.share
// @namespace   eotect@myplace
// @description 百度云网盘分享转存
// @include     http://yun.baidu.com/share/*
// @include     http://pan.baidu.com/share/*
// @include     http://pan.baidu.com/s/*
// @include     http://yun.baidu.com/s/*
// @version     1.04
// @grant none
// Change Log
//	2013-10-09
//		Add hooks $myPlace.baidu.yun.share.HACKPATH
//	2013-10-07
//		Add range expression selector. (Range:)
//	2013-09-27
//		Hide docwrapper when dialog is open
// ==/UserScript==

if(!unsafeWindow) {
	unsafeWindow = window;
}
var $myPlace = $myPlace || unsafeWindow.$myPlace || {};
unsafeWindow.$myPlace = $myPlace;
$myPlace.baidu = $myPlace.baidu || {};
$myPlace.baidu.yun = $myPlace.baidu.yun || {};

(function(yun){
	var disk = unsafeWindow.disk;
	var FileUtils = unsafeWindow.FileUtils;
	var Page = unsafeWindow.Page;
	var RestApi = disk.api.RestAPI;
	
	function message(text,mode) {
		return yun.message(text);
	}
	var _L = yun._L;
	yun.share = {
		_L	:	yun._L,
		message : message,
		mboxSelectFiles:	function(){
			(function( ){var a=$myPlace.$('li[node-type="sharelist-item"] a[class="global-icon global-icon-checkbox"]');window.myplace_cached_sharelist=a;var idx=new Number(prompt("Select start index:"));var len=new Number(prompt("Number of items to select:"));for(var i=idx;i<a.length && i<idx+len;i++){a[i].click()};})();
		},
		doTransferFilesByFSID: function (D, A, E, C, _) {
			var self = yun.share;
			var files = [];
			for(var i=0;i<A.length;i++) {
				files.push(A[i].fs_id);
			}
            var B = {
                path: D,
                fsidlist: "[" + files.join(",") + "]",
            };
			console.log("[#TRANSFER] " + B.path + "  <-- " + B.fsidlist);
            $.post(RestApi.TRANSFER  + "&from=" + encodeURIComponent(E) + "&shareid=" + C, B, function (B) {
                var A = null;
                try {
                    A = $.parseJSON(B);
                } catch (C) {
                    A = null;
                }
                if (typeof _ == "function") {
                    _(A);
                }
            });
        },
		doTransferFiles: function (D, A, E, C, _) {
			var self = yun.share;
			var files = [];
			for(var i=0;i<A.length;i++) {
				files.push(A[i].path);
			}
            var B = {
                path: D,
                filelist: $.stringify(files)
            };
			console.log("[#TRANSFER] " + D + "  <-- " +$.stringify(files));
            $.post(RestApi.TRANSFER  + "&from=" + encodeURIComponent(E) + "&shareid=" + C, B, function (B) {
                var A = null;
                try {
                    A = $.parseJSON(B);
                } catch (C) {
                    A = null;
                }
                if (typeof _ == "function") {
                    _(A);
                }
            });
        },
		parseDirPath: function (_) {
            return _.substring(_.indexOf(":/") + 1);
        },
		saveFile : function(t) {
			if(t.filelist && t.filelist[0].fs_id){
				return yun.share.doTransferFilesByFSID(t.path,t.filelist,t.uk,t.shareid,function(res){});
			}
			else {
				return yun.share.doTransferFiles(t.path,t.filelist,t.uk,t.shareid,function(res){});
			}
		},
		saveFiles : function(path,f) {
			var tasks = [];
			//f = f || FileUtils.SHARE_DATAS.currentChacheData;
			if((!f) || f.length < 1) {
				message(_L('No tasks.'),2);
				return;
			}
			for(var i=0;i<f.length;i++) {
				var fl = [];
	
				for(var j=0;j<f[i].filelist.length;j++) {
					//fl.push(decodeURIComponent(f[i].filelist[j].path));
					if(typeof $myPlace.baidu.yun.share.HACKPATH == 'function') {
						f[i].filelist[j].path = $myPlace.baidu.yun.share.HACKPATH(f[i].filelist[j].path);
					}
					fl.push(f[i].filelist[j]);
				}
				tasks.push({
					path: path,
					filelist:fl,
					uk:f[i].uk,
					shareid:f[i].shareid,
					filename:f[i].title,
				});
			}
			yun.Cache.Tasks = tasks;
			yun.Utils.doTasks(this.saveFile,tasks,0,3000,function(task,idx,tasks){
				if(task) {
					message("[" + (idx+1) + "/" + tasks.length + "] " + _L('Saving') + ' ' + task.filename + ' ...',1);
				}
				else {
					message(_L("$1 tasks done.",idx),0);
				}
			});
		},
		save:	function(handler,what) {
			var self = yun.share;
			var idPath = "sharePath";
			var idExp = "shareExp";
			var default_path = yun.Config.read(idPath) || '/testing';
			var default_exp = yun.Config.read(idExp) || '.*';
			if(!self.SaveDialog) {
				self.SaveDialog = new yun.SaveDialog(default_path,default_exp);
			}
            var docwraper=$myPlace.$('#docWraper');
            docwraper.length && docwraper.hide();
			self.SaveDialog.setVisible(true);
            self.SaveDialog.OnCancel = function() {
                docwraper.length && docwraper.show();
            }
			self.SaveDialog.OnConsent = function(source,target) {
                docwraper.length && docwraper.show();
				yun.Config.write(idPath,target);
				yun.Config.write(idExp,source);
				handler.getFiles(what,function(all) {
					var albumCount = 0;
					var files = yun.Utils.pickFiles(
						all,source,
						function(item,idx) {
							return "" + (idx+1) + "#" + item.title;
						},
						function(item,idx) {
							if(item.feed_type && item.feed_type == 'album') {
								albumCount++;
								return true;
							}
							return false;
						}
					);
					if(albumCount>0) {
						message(_L("Ignore $1 albums",albumCount) + ", " + _L("Get $1 tasks",files.length) + '.');
					}
					else {
						message(_L("Get $1 tasks",files.length) + '.');
					}
					if(files.length > 0) {
						self.saveFiles(target,files);
					}
					return 1;
				});
			};
		},
	};
})($myPlace.baidu.yun);


