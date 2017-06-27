
/**
     * [名称]弹出框组件
     * [描述]
     *
     * [主要方法]
     * close() 关闭弹出框,
     * show() 显示弹出框,
     * hide() 隐藏弹出框
     *
     * [使用说明]
     * var d = new Dialog();
     *
     * [依赖文件]: jquery
     * [创建日期]: 2015-10-28
     * [作者]: yulu
     * [版本]: v2.0
**/
(function($){
	var defaults = {
		id:null,			//唯一标示符，用于区分多个弹窗对象
		type:"",		//弹出框类型 info/confirm/window 
		infoType:"",		//弹出框方式 success/error/warning
		width:320,		//宽度
		height:"",		//高度
		offsetX:false,
		offsetY:false,
		title:"",		//弹出框标题
		content:"",		//弹出框内容
		btnOk:{
			isShow:false,
			text:"确定",
			callback:false
		},
		btnCancel:{
			isShow:false,
			text:"取消",
			callback:false
		},
		btnClose:{
			isShow:false,
			callback:false
		},
		isOverlay:true,	//是否显示遮罩 默认为true
		autoClose:false, //自动关闭时间 以毫秒为单位，只能传数字
		autoCloseFn:null, //自动关闭弹窗之后的回调
		overlayClose:false //是否开启点击遮罩层弹框关闭的功能
	};
	var level = 0; //记录遮罩层数
	//根据type和infoType决定显示不同类型的弹窗
	var typeCase = function(options){
		var opt;
		switch(options.type){
			case "info":
				opt = {title:false,autoClose:2000};
				break;
			case "confirm":
				opt = {
					title:"提示",
					infoType:"warning",
					btnOk:{
						isShow:true,
						text:"确定",
						callback:false
					},
					btnCancel:{
						isShow:true,
						text:"取消",
						callback:false
					},
					btnClose:{
						isShow:true,
						callback:false
					}
				};
				break;
			case "window":
				opt = {
					title:"提示",
					btnOk:{
						isShow:true,
						text:"确定",
						callback:false
					},
					btnClose:{
						isShow:true,
						callback:false
					},
					style:"padding:50px 10px 70px;text-align:left;"
				};
				if(options.btnOk.isShow == "false"){
					if(options.btnCancel&&options.btnCancel.isShow){
						opt.style = "padding:50px 10px 70px;text-align:left;";
					}else{
						opt.style = "padding:50px 10px 20px;text-align:left;";
					}
				}
				break;
			default:
				opt = {};
				break;
		}
		return $.extend(true,{}, opt, options);
	};
	$.Dialog = function(options){
		options = typeCase(options);
		this.opts = $.extend(true,{}, defaults, options);
		this.id = this.opts.id || uuid();
		this.ev = new Array();
		this.init();
	};
	var Overlay = function(){
		if($(".dialog_overlay").length > 0) {
            this.overlay = $(".dialog_overlay");
        } else {
        	this.overlay =$('<div class="dialog_overlay"></div>');	
        }
		return this;	
	};
	Overlay.prototype =  {
		show: function() {
			level++;
			this.overlay.show();
		},
		hide: function() {
			level--;
			if(level < 1){
				this.overlay.hide();
			}else{
				var len = $(".dialog_box").length;
				if(len > 0){
					$(".dialog_box").eq(len-1).before(this.overlay);
				}
			}
		},
		getDom:function(){
			return this.overlay;
		}
	};

	$.Dialog.prototype = {
		/**
		 * 1.生成弹出框dom
		 * 2.定位弹出框位置
		 * 3.绑定事件
		 */
		init:function(){
			this.fillUI();
			this.position();
			this.bindUI();
		},
		//生成弹出框
		fillUI:function(){
			var headerContent = "",
				mainContent = "",
				footerContent = "",
				closer = '';
			//使用遮罩层
			if(this.opts.isOverlay){
				this.overlay = new Overlay();
				this.overlay.show();
				this.overlayDom = this.overlay.getDom();
				this.overlayDom.appendTo("body");
			}		
			this.box = $('<div class="dialog_box" id="'+this.id+'"></div>');
			this.container = $('<div class="dialog_wrap"></div>');
			if(this.opts.title){
				headerContent += '<div class="dialog_title">'+this.opts.title+'</div>';
			}
			mainContent += '<div class="dialog_content" style="'+this.opts.style+'"><div class="'+this.opts.infoType+'-img">'+this.opts.content+'</div></div>';
			if(this.opts.btnOk.isShow||this.opts.btnCancel.isShow){
				footerContent += '<div class="dialog_btn">';
				if(this.opts.btnOk.isShow){
					footerContent += '<button class="dialog_ok">'+this.opts.btnOk.text+'</button>';
				}
				if(this.opts.btnCancel.isShow){
		 			footerContent += '<button class="dialog_cancel">'+this.opts.btnCancel.text+'</button>';
		 		}
		 		footerContent += '</div>';	
		 	}
	 		if(this.opts.btnClose.isShow){
	 			closer += '<a href="javascript:;" class="dialog_close">×</a>';
			}
			this.container.append(headerContent+mainContent+footerContent+closer);
			this.box.append(this.container);
			this.box.appendTo(document.body);
		},
		//事件代理
		bindUI:function(){
			var that = this;
			if(this.opts.overlayClose){
				this.overlayDom.bind("click",function(){
					that.close();
				});
			}else{
				this.overlayDom.unbind("click");
			}
			this.box.delegate(".dialog_close","click",function(){
				if(that.fire("closeDialog") != false){
					that.close();
				}
			}).delegate(".dialog_ok","click",function(){
				if(that.fire("ok") != false){
					that.close();
				}
			}).delegate(".dialog_cancel","click",function(){
				if(that.fire("cancel") != false){
					that.close();
				}
			});
			if(this.opts.btnOk.callback){
				this.on("ok",this.opts.btnOk.callback);
			}
			if(this.opts.btnCancel.callback){
				this.on("cancel",this.opts.btnCancel.callback);
			}
			if(this.opts.btnClose.callback){
				this.on("closeDialog",this.opts.btnClose.callback);
			}
			if(that.opts.autoClose&& typeof that.opts.autoClose === 'number' ){
				this.t = setTimeout(function(){
					that.close();
					if(typeof that.opts.autoCloseFn === "function"){
						that.opts.autoCloseFn();
					}
				},that.opts.autoClose);
			}
		},
		//定位
		position:function(){
			this.box.css({
				width:(this.opts.width+10)+'px'
			});
			this.box.find(".dialog_content").css({
				height:(this.opts.height?this.opts.height+'px':'auto')
			});
			var l = (this.opts.offsetX || ($(window).width() - this.opts.width)/2-5);
			var t = (this.opts.offsetY || ($(window).height() - this.box.height())/2-5);
			this.box.css({
				left:(l > 0 ? l : 0) + 'px',
				top:(t > 0 ? t : 0) + 'px'
			});
		},
		//销毁弹出框
		close:function(){
			this.box.remove();
			this.overlay && this.overlay.hide();
			clearTimeout(this.t);
		},
		//显示
		show:function(){
			this.box.show();
			this.overlay && this.overlay.show();
		},
		//隐藏
		hide:function(){
			this.box.hide();
			this.overlay && this.overlay.hide();
		},
		on:function(type,callback){
			if(typeof this.ev[type] == "undefined"){
				this.ev[type] = [];
			}
			this.ev[type].push(callback);
			return this;
		},
		fire:function(type,data){
			if(this.ev[type] instanceof Array){
				var ev = this.ev[type];
				for (var i = 0; i < ev.length; i++) {
					return ev[i](data);
				};
			}
		}
	}

	function uuid(){
		var t = new Date();
		return 'dialog_'+t.getTime();
	}
	return Dialog = $.Dialog ;
})(jQuery,window);