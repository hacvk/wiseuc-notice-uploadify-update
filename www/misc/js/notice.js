/**
 *@info 公告改版
 *@author: HJ
 *@date: 2012-11-08
 */

/*全局变量*/

var notice = {
		
	//收公告ID列表
	getsID : '', 
	//收公告分页
	getsPage : 1,
	//发公告ID列表
	sendsID : '',
	//发公告分页
	sendsPage : 1,
	//收OR发公告
	showTab : 1,
	//文章ID
	artID : '',
	//成员分组信息
	groupInfo : '',
	//附件个数
	fileNum : 0,
	
	//管理员选择id
	allID : '',
	
	fileName : [],
	
	idarr:[],
	action:1,
	location:'',
	noticetitle:false,
	//搜索标题
	searchtitle:''
};

$().ready(function(){
	
	/*初始化*/
	Init();
	
});

/**
 *@info 初始化
 *@author: HJ
 *@date: 2012-11-08
 */
function Init(){
	
	$('#ggtype option[value=1]').attr('selected',true);
	
	var types = gettype();
	
	/**
	 *	在线编辑器
	 *
	 */
	tinyMCE.init({
		theme : "advanced",
		language : "zh-cn", 
		mode : "textareas",
		plugins : "autolink,lists,spellchecker,pagebreak,style,layer,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,visualchars,nonbreaking,xhtmlxtras,template",
		theme_advanced_buttons1 : "fontsizeselect,  bold,italic,underline,strikethrough,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,|,link,unlink,|,cleanup, image",
		theme_advanced_buttons2 : "",
		theme_advanced_buttons3 : "",
		
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left"
	});
	
	var indexs = 0;
	if(key!=''){
		indexs = 1;
	}
	
	/*tab*/
	$(function(){
		function tabs(tabTit,on,tabCon){
			$(tabCon).each(function(){
				$(this).children().eq(indexs).show();
			});
			$(tabTit).each(function(){
				$(this).children().eq(indexs).addClass(on);
			});
			$(tabTit).children().click(function(){   //鼠标滑过用hover,鼠标点击用click
				
				$(this).addClass(on).siblings().removeClass(on);
				var index = $(tabTit).children().index(this);
				$(tabCon).children().eq(index).show().siblings().hide();
				
				$('#contentinfo').show();
				$('#showdetail').hide();
			});
		}
		tabs(".tab","active",".tab_bar");
	});

	//全局参数
	(function(config){
		config['extendDrag'] = true; // 注意，此配置参数只能在这里使用全局配置，在调用窗口的传参数使用无效
		config['lock'] = true;
		config['fixed'] = true;
		config['max'] = null;
		config['min'] = null;
		config['okVal'] = 'Ok';
		config['cancelVal'] = 'Cancel';
		// [more..]
	})($.dialog.setting);

	//跳转到内容页
	var cookieNoticeID = $.cookie('scucNoticeID');
	
	if(cookieNoticeID){
		$.cookie('scucNoticeID',null,{path: '/'});
		//setTab(2);
		openwin(cookieNoticeID, 'sent');	
	}
	
	if(key!=''){
		//setTab(3);
		var userClent = external.wd_ExtractFun('INITPARAM', key);
		notice.groupInfo = userClent;
		var userClentArr = $.parseJSON(userClent);
		$('#user_id').val(userClentArr.pid);
		$('#group_name').html(userClentArr.display);
	}

	//组织架构扩展
	if(typeof(deptid)!='undefined'){
		
		//setTab(3);
		$('#group_id').val(deptid);
		$('#group_name').html('['+deptname+']');	
	}else{
	
		var actioin = types == 1 ? 'get' : 'sent';
		
		page_data(actioin, notice.getsPage);
			
		$("tbody>tr:odd").addClass("todd");
	}

	//附件上传 - HTML4 兼容版本（使用 iframe + ajaxfileupload）
	notice.uploadingFiles = 0; // 正在上传的文件数
	notice.uploadedFiles = 0;   // 已上传完成的文件数
	notice.uploadQueue = [];    // 上传队列
	
	// 初始化文件上传按钮样式
	if($('#file_upload').length > 0){
		// 创建按钮包装
		var $fileInput = $('#file_upload');
		var $wrapper = $('<div style="position:relative;display:inline-block;width:100px;height:27px;cursor:pointer;background:url(/misc/images/addfile.png) no-repeat;"></div>');
		$fileInput.wrap($wrapper);
		$fileInput.css({
			'position': 'absolute',
			'top': '0',
			'left': '0',
			'width': '100px',
			'height': '27px',
			'opacity': '0',
			'cursor': 'pointer',
			'z-index': '10'
		});
		
		// 文件选择事件
		$fileInput.on('change', function(){
			var fileInput = this;
			var fileName = '';
			var fileSize = 0;
			
			// 获取文件名（兼容 HTML4 和 HTML5）
			if(fileInput.files && fileInput.files.length > 0){
				// HTML5 浏览器
				for(var i = 0; i < fileInput.files.length; i++){
					var file = fileInput.files[i];
					// 立即处理，不能延迟
					processFileAndUpload(file.name, file.size, fileInput);
				}
			} else if(fileInput.value){
				// HTML4 浏览器
				fileName = fileInput.value;
				// 提取文件名（去除路径）
				fileName = fileName.substring(fileName.lastIndexOf('\\') + 1);
				if(fileName){
					// 立即处理，不能延迟，必须传入原始文件输入框
					processFileAndUpload(fileName, 0, fileInput);
				}
			}
		});
	}
	
	// 处理文件并立即上传（必须在文件选择事件中立即调用）
	function processFileAndUpload(fileName, fileSize, fileInputElement){
		// 检查文件数量限制
		if(notice.uploadQueue.length >= 5){
			alert('最多只能上传5个文件！');
			// 清空文件输入框
			$(fileInputElement).val('');
			return false;
		}
		
		// 检查文件大小（如果可用）
		if(fileSize > 0 && fileSize > 10485760){
			alert('只支持10MB（10240KB）以内的附件上传！');
			// 清空文件输入框
			$(fileInputElement).val('');
			return false;
		}
		
		// 添加到队列
		var fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
		var fileObj = {
			id: fileId,
			name: fileName,
			size: fileSize,
			status: 'pending', // pending, uploading, success, error
			fileInput: fileInputElement // 保存文件输入框引用
		};
		notice.uploadQueue.push(fileObj);
		notice.fileNum = notice.uploadQueue.length;
		notice.uploadingFiles++;
		
		// 显示文件项
		displayFileItem(fileObj);
		
		// 立即开始上传（传入文件输入框元素）
		uploadFileWithAjax(fileObj, fileInputElement);
	}
	
	// 显示文件项
	function displayFileItem(fileObj){
		var fileSizeText = fileObj.size > 0 ? ' (' + (fileObj.size / 1024).toFixed(2) + 'KB)' : '';
		var itemHtml = '<div id="' + fileObj.id + '" class="uploadifyQueueItem" style="width:100%;line-height:20px;text-indent:10px;background-color:#F0F0F0;margin-top:5px;padding:5px;position:relative;">' +
			'<span class="fileName">' + fileObj.name + '</span>' + fileSizeText + ' ' +
			'<span class="upload-status" style="color:#666;margin-left:10px;">准备上传...</span> ' +
			'<a href="javascript:void(0);" onclick="removeUploadFile(\'' + fileObj.id + '\', \'' + encodeURI(fileObj.name) + '\')" style="color:#06C;margin-left:10px;">删除</a>' +
			'</div>';
		
		$('#addfile').append(itemHtml);
	}
	
	// 使用 iframe 方式上传文件（HTML4 兼容）
	// 注意：必须在文件选择后立即上传，不能延迟，因为文件输入框的值无法复制
	function uploadFileWithAjax(fileObj, fileInputElement){
		var fileId = fileObj.id;
		var iframeId = 'upload_iframe_' + fileId;
		var formId = 'upload_form_' + fileId;
		
		// 更新状态
		$('#' + fileId + ' .upload-status').text('上传中...').css('color', '#666');
		fileObj.status = 'uploading';
		
		// 创建隐藏的 iframe
		var $iframe = $('<iframe id="' + iframeId + '" name="' + iframeId + '" style="display:none;"></iframe>');
		$('body').append($iframe);
		
		// 创建表单
		var $form = $('<form id="' + formId + '" method="POST" action="/upfile.php?pid=' + user_id + '" enctype="multipart/form-data" target="' + iframeId + '" style="display:none;"></form>');
		
		// 获取文件输入框（使用传入的元素，确保是包含文件数据的原始元素）
		var $originalFile = $(fileInputElement);
		
		// 重要：直接移动文件输入框到新表单（不能克隆，因为文件数据无法复制）
		// 先保存文件输入框的父容器和样式
		var $wrapper = $originalFile.parent();
		var originalStyles = {
			position: $originalFile.css('position'),
			top: $originalFile.css('top'),
			left: $originalFile.css('left'),
			width: $originalFile.css('width'),
			height: $originalFile.css('height'),
			opacity: $originalFile.css('opacity'),
			cursor: $originalFile.css('cursor'),
			'z-index': $originalFile.css('z-index')
		};
		
		// 修改文件输入框的 name 属性
		$originalFile.attr('name', 'Filedata');
		// 将文件输入框移动到新表单中（使用 detach 保持数据）
		$originalFile.detach();
		$form.append($originalFile);
		
		// 将表单添加到页面
		$('body').append($form);
		
		// 创建新的文件输入框用于下次选择（在提交前创建，避免用户再次选择时找不到）
		var $newFile = $('<input type="file" id="file_upload" name="file_upload" multiple />');
		$newFile.css(originalStyles);
		$newFile.on('change', function(){
			var fileInput = this;
			var fileName = '';
			
			if(fileInput.files && fileInput.files.length > 0){
				for(var i = 0; i < fileInput.files.length; i++){
					var file = fileInput.files[i];
					processFileAndUpload(file.name, file.size, fileInput);
				}
			} else if(fileInput.value){
				fileName = fileInput.value;
				fileName = fileName.substring(fileName.lastIndexOf('\\') + 1);
				if(fileName){
					processFileAndUpload(fileName, 0, fileInput);
				}
			}
		});
		$wrapper.append($newFile);
		
		// 监听 iframe 加载完成
		$iframe.on('load', function(){
			try{
				var response = '';
				var iframeDoc = this.contentDocument || this.contentWindow.document;
				if(iframeDoc && iframeDoc.body){
					response = iframeDoc.body.innerHTML || iframeDoc.body.textContent || iframeDoc.body.innerText || '';
				}
				
				// 检查响应是否包含文件路径（上传成功会返回文件路径）
				if(response && response.indexOf('error') === -1 && response.length > 0 && (response.indexOf('upload') !== -1 || response.indexOf('/') !== -1)){
					// 上传成功
					$('#' + fileId + ' .upload-status').text('上传完成').css('color', '#0C0');
					fileObj.status = 'success';
					notice.uploadingFiles--;
					notice.uploadedFiles++;
					
					// 处理标题自动填充
					if(($('#title').val()).length < 1){
						if(notice.uploadQueue.length == 1){
							$('#title').val(fileObj.name);
							notice.noticetitle = true;
						}else{
							if(notice.fileName.length > 0){
								try{
									$('#title').val(decodeURIComponent(notice.fileName[0]));
								}catch(e){
									$('#title').val(notice.fileName[0]);
								}
							}
						}
					}
					
					// 使用 encodeURIComponent 编码文件名，后端使用 rawurldecode 解码
					notice.fileName.push(encodeURIComponent(fileObj.name));
				}else{
					// 上传失败
					$('#' + fileId + ' .upload-status').text('上传失败').css('color', '#C00');
					fileObj.status = 'error';
					notice.uploadingFiles--;
					alert('文件 "' + fileObj.name + '" 上传失败！响应：' + (response || '空响应'));
				}
			}catch(e){
				// 跨域或其他错误
				$('#' + fileId + ' .upload-status').text('上传失败（无法读取响应）').css('color', '#C00');
				fileObj.status = 'error';
				notice.uploadingFiles--;
				alert('文件 "' + fileObj.name + '" 上传失败！无法读取服务器响应。');
			}
			
			// 清理
			setTimeout(function(){
				$iframe.remove();
				$form.remove();
			}, 1000);
		});
		
		// 立即提交表单（必须在文件选择后立即提交，不能延迟）
		$form.submit();
	}
	
	// 全局删除文件函数
	window.removeUploadFile = function(fileId, fileName){
		// 从队列中移除
		for(var i = 0; i < notice.uploadQueue.length; i++){
			if(notice.uploadQueue[i].id === fileId){
				if(notice.uploadQueue[i].status === 'uploading'){
					notice.uploadingFiles--;
				}
				notice.uploadQueue.splice(i, 1);
				break;
			}
		}
		
		// 调用原有的 delfile 函数
		// fileName 已经是编码后的，需要解码
		var decodedFileName = fileName;
		try{
			decodedFileName = decodeURIComponent(fileName);
		}catch(e){
			decodedFileName = fileName;
		}
		delfile(decodedFileName);
		
		// 从文件名数组中移除
		for(var i = 0; i < notice.fileName.length; i++){
			if(notice.fileName[i] === fileName){
				notice.fileName.splice(i, 1);
				break;
			}
		}
		
		// 更新文件数量
		notice.fileNum = notice.uploadQueue.length;
		
		// 移除DOM元素
		$('#' + fileId).remove();
	};

	/**
	 *@info 删除选中公告
	 *@date: 2012-11-08
	 */
	$('#del_check').click (function (){
		
		getonclick();
		sendonclick();

		//var action = notice.showTab == 1 ? 'get' : 'send';
		//var data = notice.showTab == 1 ? notice.getsID : notice.sendsID;
		//var page_num = notice.showTab == 1  ? notice.getsPage : notice.sendsPage;
		
		var types = gettype();
		
		var action = types == 1 ? 'get' : 'sent';

		var data = types == 1 ? notice.getsID : notice.sendsID;
		
		var page_num = types == 1  ? notice.getsPage : notice.sendsPage;
		
		if(data.length<1){
			alert('请选择要删除的选项！');
			return false;
		}
		
		if(action == 'sent'){
			if(!confirm("删除后发布者和接收者将看不到此公告，您确定要删除吗？")){
				return false;
			}
		}else{
			if(!confirm("您确定要删除吗？")){
				return false;
			}
		}
		
		
		$.ajax({
		   type: "POST",
		   url: "/notice/delete",
		   data: 'postdata='+data,
		   success: function(data){
			   var msg = $.parseJSON(data);
			   if( msg.res == 1){
					alert(msg.info);
					
					//setTab(notice.showTab); 

					page_data(action, notice.sendsPage);
					
					if (action == 'get'){
						location.reload();
					}

			   }else{
					alert(msg.info);   
			   }
		   }
		});
	});
	
	/**
	 *@info 删除当前公告
	 *@date: 2012-11-08
	 */
	$('#votice_del').click(function(){
		if(!confirm('您确定要删除吗？')){
			return false;
		}

		var vid = notice.artID;
		
		
		//var action = notice.showTab == 1 ? 'get' : 'send';
		//var page_num = notice.showTab == 1  ? notice.getsPage : notice.sendsPage;
		
		var types = gettype();
		var action = types == 1 ? 'get' : 'sent';
		var page_num = types == 1  ? notice.getsPage : notice.sendsPage;
		
		
		var data = action+'_'+vid;

		$.ajax({
		   type: "POST",
		   url: "/notice/delete",
		   data: 'postdata='+data,
		   success: function(data){
			   var msg = $.parseJSON(data);
			   if( msg.res == 1){
					alert(msg.info);
					
					//setTab(notice.showTab); 
					$('#contentinfo').show();
					$('#showdetail').hide();
					page_data(action, notice.sendsPage);
					
			   }else{
					alert(msg.info);   
			   }
		   }
		});
	});
	

	/**
	 *@info 刷新公告
	 *@date: 2012-11-08
	 */
	$('#refresh').click(function (){
		
		var types = gettype();
		
		if(types == 1){
			var action = 'get';
			var page_num = notice.getsPage;
		} else {
			var action = 'sent';
			var page_num = notice.sendsPage;
		}

		page_data(action, page_num);
	});
	
	
	
	/*选择公告类型*/
	$('#ggtype').change(function(){
		$("#interestsNews").attr('checked',false);
		var title = $('#search').val();
		notice.searchtitle = title;
		
		if ($(this).val() == 1){
			notice.action = 1;
			notice.getsPage = 1;
			page_data('get', notice.getsPage);
		}
		
		if ($(this).val() == 2){
			notice.action = 2;
			notice.sendsPage = 1;
			page_data('sent', notice.sendsPage);
		}
		
		if ($(this).val() == 3){
			notice.action = 3;
			notice.sendsPage = 1;
			page_data('all', notice.sendsPage);
		}
	});
	
	/*返回*/
	$('#_back').click(function(){
		
		$('#showdetail').hide();
		$('#contentinfo').show();
		$('#refresh').trigger('click');
		
		sellocation('back');
		
	});

	
	
	/**
	 *	发送公告
	 *
	 *
	 */
	$('#onsendvote').click (function(){

		var groupid = $('#group_id').val();
		var user_id = $('#user_id').val();
		
		var title = $.trim($('#title').val());
		var group_name = $.trim($('#group_name').html());
		var editor_id = $.trim(tinyMCE.get('editor_id').getContent());
		var toptitle = $('#toptitle').val();
		var is_sms = $('#sm_notice').prop('checked') ? 1 : 0;	
		if(groupid=='' && user_id=='' ){
			alert('请选择接收人！'); 
			return false;
		}
		if($.trim(title) == ''){
			alert('请填写公告的标题！'); 
			return false;	
		}
		
		if($.trim(editor_id) == ''){
			alert('请填写公告的内容！');
			return false;	
		}
		
		// 检查是否有文件正在上传
		if(notice.uploadingFiles > 0){
			alert('文件正在上传中，请等待上传完成后再发布！');
			return false;
		}
		
		/************/
		ymPrompt.win({message:'<img src="/misc/images/nloading.gif" />',title:'',width:250,height:50,closeBtn:false});
		$('#ym-tl').hide();
		$('#onsendvote').hide();
		$('#ym-window').css('height','20px');
		//$('.ym-mc').css('background','#61ACE4');
		//$('#ym-ml').css('background','#61ACE4');
		$('#maskLevel').css('top','0pt');
		/************/
		
		
		/*2012-01-16 by aHuang*/
		var str_length = (strip_tags(editor_id).length)/3;
		if (str_length > 2000){
			alert("填写的内容不能超过2000个字符！");

			$('#ym-tl').show();
			$('#ym-window').hide();
			$('#maskLevel').hide();
			$('#maskIframe').hide();
			$('#onsendvote').show();
			return false;
		}
	
		setTimeout(function(){
			senddata(groupid,user_id, title,editor_id,group_name,toptitle,is_sms);
		},1000);
		
	});
	
	
	function senddata(groupid, user_id, title, editor_id, group_name,toptitle,is_sms)	{
		// 文件名使用原始值，后端会进行 rawurldecode 处理
		var getname = notice.fileName.length >0 ? notice.fileName.join('|') : '';
			
		var datas = {
			'groupid':groupid,
			'user_id': user_id,
			'title': html2code(title),
			'toptitle': html2code(toptitle),
			'get_man' : group_name,
			'content': JSON.encode(editor_id),
			'fileNum' : notice.fileNum,
			'fileName' : getname,
			'is_sms': is_sms
		}

		/*2012-01-16 by HJ*/
		$.ajax({
		   type: "POST",
		   url: "/notice/create",
		   data: datas,
		   success: function(data){
			   ymPrompt.close();
			   $('#onsendvote').show();
			   var msg = $.parseJSON(data);
			   if( msg.res>0){
				   
					alert(msg.info);
					
					//设置cookie值
					$.cookie('scucNoticeID', msg.res, {path: '/'});
					var d = new Date();
					location.href = '/notice/index/'+d.getTime();
					
			   }else{
				  alert(msg.info);   
			   }
		   }
		});
	}
	
	

	//选择分组
	$('#selgroup, #group_name').click (function(){
		//alert(notice.groupInfo);
		
		//重选组信息
		if(notice.groupInfo ==''){
			//组织架构扩展
			if(typeof(deptid)=='number'){
				var newInfo = '{"pid": "", "display": "['+deptname+']", "OK": true, "deptid": '+deptid+'}';
				var res = external.wd_ExtractFun('SELECTGROUP', newInfo);
			}else{
				var res = external.wd_ExtractFun('SELECTGROUP', '');
			}
		}else{
			var res = external.wd_ExtractFun('SELECTGROUP', notice.groupInfo);
		}
		
		var group = $.parseJSON(res);
		if(group.OK){
			notice.groupInfo = res;
			var group_arr = group.display.split(',');
			var grouph = '';
			$.each(group_arr, function(i, n){
				if(group_arr[i].length>0){
					grouph+= group_arr[i]+';';	
				}
			});
			var newgrouph = substrs(grouph, 90, '...');
			
			/*if(group_arr.length>1){
				grouph = lineStr(grouph, 90, '\n');
			}*/

			$('#group_name').attr('title', grouph);
			$('#group_name').html(newgrouph);
			$('#group_id').val(group.deptid);
			$('#user_id').val(group.pid);
		}
	});
	
	
	/*标记为已读*/
	$('#btn_read').click(function(){
		
		getonclick();
		sendonclick();

		var types = gettype();
		
		var action = types == 1 ? 'get' : 'sent';

		var data = types == 1 ? notice.getsID : notice.sendsID;
		
		var page_num = types == 1  ? notice.getsPage : notice.sendsPage;
		
		if(data.length<1){
			alert('请选择需要标记的内容！');
			return false;
		}

		
		$.ajax({
		   type: "POST",
		   url: "/notice/mark",
		   data: 'postdata='+data,
		   success: function(data){
			   var msg = $.parseJSON(data);
			   if( msg.res == 1){
					alert(msg.info);
					
					var _page = notice.sendsPage;
					
					if (action == 'get'){
						_page = notice.getsPage;
					}
					page_data(action,_page);

			   }else{
					alert(msg.info);   
			   }
		   }
		});
		
	});
	
	/*查看下一篇 查看上一篇*/
	$('#votice_next,#votice_prev').click(function (){
		
		var id = notice.artID;
		
		var types = gettype();
		
		var action = types == 1 ? 'get' : 'sent';
		
		var to = 'prev';
		
		if ($(this).attr('id') == 'votice_next'){
			to = 'next';
		}
		
		openwin(id, action, to);						  
		
	});
	
	/*标题和台头字数控制*/
	$('#toptitle,#title').keyup(function(){
	
		cfont(this);
		
	}).keydown(function(){
	
		cfont(this);
		
	}).blur(function(){
		
		cfont(this);
	});
	
	function cfont(obj){
	
		var msg = 'toptitle_count';
		var num = 64;
		
		if ($(obj).attr('id') == 'title'){
			msg = 'title_count';
			num = 64;
		}
		
		chkContent(obj,msg,num);
	}
	
	/*公告保存前的预览*/
	$('#showview').click(function(){
		
		var _group_name = $('#group_name').html();
		var _toptitle = $('#toptitle').val();
		var _title = $('#title').val();
		var _user_id = $('#user_id').val();
		
		var _filename = '';
		
		$('#addfile div span').each(function(){
		
			if ($(this).attr('class') == 'fileName'){
				
				_filename = _filename+"  "+$(this).html();
			}
		
		});

		var _content = $.trim(tinyMCE.get('editor_id').getContent());
		
		
		var _val = {
			'_user_id':_user_id,
			'_group_name':_group_name,
			'_toptitle':_toptitle,
			'_title':_title,
			'_filename':_filename,
			'_content':_content
		}
		
		$.ajax({
		   type: "POST",
		   url: "/notice/tempviews",
		   data: _val,
		   success: function(data){
			   var msg = $.parseJSON(data);
			   if( msg.res == 1){

					window.open(msg.info);

			   }else{
					
			   }
		   }
		});
	});
	
	/*公告内容的预览*/
	$('#cshowview').click(function(){
		
		var _val = {
			'noticeid':notice.artID
		}
		
		$.ajax({
		   type: "POST",
		   url: "/notice/tempviews",
		   data: _val,
		   success: function(data){
			   var msg = $.parseJSON(data);
			   if( msg.res == 1){
					
					window.open(msg.info);

			   }else{
					
			   }
		   }
		});
	});
	
	/*查看公告*/
	$('#viewgg').click(function(){
		
		//location.reload();
		
	});
	
	/*写公告*/
	$('#writegg').click(function(){
		
		sellocation('write');
		
	});


	
	
}

/**
 *@info 删除附件

 *@param filename 文件名称
 *@date: 2012-11-08
 */
function delfile (filename){
	
	var arr = [];
	
	$.each(notice.fileName, function(n, i){
		if(notice.fileName[n] != encodeURI(filename)){
			arr.push(notice.fileName[n]);
		}
	});
	
	notice.fileName = [];
	
	notice.fileName = arr;
}


/**
 *@info 获取数据

 *@param action 动作 (get获得我的公告 send获得我发送的公告)
 *@param page_now 页数
 *@date: 2012-11-08
 */
function page_data(action, page_now){

	var types = gettype();
	
	//var url = notice.showTab == 1 ? '/notice/collect' : '/notice/sent';

	$('#sent_data,#get_data,#all_data').empty();
	
	if (types == 1){
		var url = '/notice/collect';
		$('#btn_read,#btn_read_status,#del_check').show();
	}else if(types == 2){
		var url = '/notice/sent';
		$('#del_check').show();
		$('#btn_read,#btn_read_status').hide();
	}else{
		var url = '/notice/all';
		$('#btn_read,#btn_read_status,#del_check').hide();
	}
	
	//加载中

	$('#get_data,#send_data').html('<tr id="'+action+'_son"><td  colspan="3" style="border-bottom:none"><div style="width:100%; text-align: center; margin-top:190px;"><img src="/misc/images/nloading.gif"></div></td><tr>');
	$.ajax({
	   type: "POST",
	   url: url,
	   data: 'action='+action+'&page_num='+page_now+'&searchtitle='+notice.searchtitle,
	   success: function(data){
		   var msg = $.parseJSON(data);
		   if( msg.res == 1){
				if($(msg.info.data).size()){
					

					$('#btn_read_status').empty();
					$('#btn_read_status').append('未读<em class="b red f14">（'+msg.counts+'）</em>');
					
					
					//显示分页
					show_page(msg.info.num.pager_all);
		
					//显示数据
					show_data(action, msg.info.data);
					
				} else {

					//分页
					$('#show_pager').html('<a href="#" id="votice_prev"><span>上一页</span></a><a href="#" id="votice_next"><span>下一页</span></a>');
					
					$('#get_data,#sent_data,#all_data').empty();
					
					var strs = '<tr><td  colspan="3" style="border-bottom:none"><div style="width:100%; text-align: center;margin-top: 30%;"><font style="font-size:16px; color:#666666;">您暂时没有相关数据 !</font></div></td></tr>';
					$('#'+action+'_data').html( strs );
					
					var page_str_num = '<a style="color: #666; font-family:Verdana, Geneva, sans-serif;">1/1 页</a>&nbsp;';
					$('#show_pager_num').empty();
					$('#show_pager_num').append(page_str_num);

				}
		   }
		
	   }
	});
}


/**
 *@info 列表分页显示

 *@param page_total 页数
 *@date: 2012-11-08
 */
function show_page( page_total ){
	
	var types = gettype();
	var page_num = types == 1  ? notice.getsPage : notice.sendsPage;
	
	//var page_num = notice.showTab == 1  ? notice.getsPage : notice.sendsPage;
	
	var pre = (page_num-1)>0 ? (page_num-1) : 1;
	
	var next = (page_num+1)>=page_total ? page_total : page_num+1;
	
	 var page_str_num = '<a style="color: #666; font-family:Verdana, Geneva, sans-serif;">'+page_num+'/'+page_total+' 页</a>&nbsp;';
	 
	 var page_str = '';
		
 	 //上一页
	 if(page_num<=1){
		page_str+= '<a href="#"><span>上一页</span></a> ';
	 }else{
		page_str+= '<a href="#" onclick="javascript:to_page('+pre+')"><span>上一封</span></a> ';
	 }
	
	 //下一页
	 if(page_num >= page_total){
		page_str+= '<a href="#"><span>下一页</span></a> ';
	 }else{
		page_str+= '<a href="#" onclick="javascript:to_page('+next+')" ><span>下一封</span></a> ';
	 }window
	 
	 
	$('#show_pager_num').empty();
	$('#show_pager_num').append(page_str_num);
		
	$('#show_pager').empty();
	$('#show_pager').append(page_str);
}


/**
 *@info 分页显示
 *@param page_total 页数
 *@date: 2012-11-08
 */
function to_page( page_now ){
	
	var types = gettype();
	
	if(types == 1){
		var action = 'get';
		notice.getsPage = page_now;
	} else {
		var action = 'sent';
		notice.sendsPage = page_now;
	}

	page_data(action, page_now);
}

/**
 *@info 列表显示内容
 *@param action 动作 
 *@param obj 数据对象 
 *@date: 2012-11-08
 */
function show_data(action, obj){
	var types = gettype();
	
	var maner = types == 1 ? '发送人' : '接收人';
	
	//var maner = notice.showTab == 1 ? '发送人' : '接收人';
	
	var mtab = '';
	
	var _id_arr = [];
	//var mtab = '<table class="tabdata" width="100%" border="0" cellPadding="0" cellSpacing="0" >';
	
	if($(obj).size() > 0){
		
		/*
		mtab+= '<THEAD><tr class="thead">\
					<td width="3%" align="center"><input type="checkbox" onclick="select_all(this)" name="checkbox" id=\"'+action+'_all\" /></td>\
					<td width="53%" style="padding-left:27px;">标题</td>\
					<td width="20%" >'+maner+'</td>\
					<td width="18%" style="padding-left:10px;">发送时间</td>\
				</tr></THEAD>\
				<tbody id="'+action+'_son">';
		*/	
		
		mtab+= '<tr id="'+action+'_son"><td  colspan="3" style="border-bottom:none;">';
		$.each(obj, function (i, n){
			
			//var read = (n.read_state ==0) ? ' class="noread"' : '';
			_id_arr[i] = n.notice_id;
			
			//n.username = n.username+" ("+n.zw+"--"+n.depname+")";
			
			//var _p_title = '接收者';
			//var _p_time = '添加时间';
			
			//if (action == 'get'){
			_p_title = '发布者';
			_p_time = '发布时间';
			//}
			var _fujian = '';
			
			if (n.accessoryCount > 0){
				
				_fujian = '<img src="/misc/images/fujian.gif">';
			}
			
			mtab+='<table style="width:98%"><tr>';
			mtab+='<td class="c_td_04"><input type="checkbox" class="check"  name="'+action+'check" id="'+action+'_'+n.notice_id+'" /></td>';
			mtab+='<td class="c_td_05"  title="'+n.alltitle+'"  style="width:70%;">';
				
				if (n.read_state == 0){
					mtab+='<h2 style="cursor:pointer;line-height:24px;" onClick=\"openwin('+n.notice_id+',\''+action+'\')\" ><a style="color:#000000">'+_fujian+n.title+'</a></h2>';
				}else{
					mtab+='<h1 style="cursor:pointer;font-weight:400;font: 14px \'宋体\';line-height:24px;" onClick=\"openwin('+n.notice_id+',\''+action+'\')\" ><a style="color:#000000">'+_fujian+n.title+'</a></h1>';
				}
				
				mtab+='<span title="'+n.username+'" style="font: 12px \'宋体\';line-height:24px;">'+_p_title+'：<a href="'+n.winjump+'">'+substrs(n.username, 50, '...')+'</a></span>';
				mtab+='<em style="font: 12px \'宋体\';">'+_p_time+'：'+n.send_time+'</em>';
			mtab+='</td>';

			mtab+='<td class="c_td_06" title="'+n.alltoptitle+'">';

					if (n.read_state ==0){
						mtab+='<h3 style="line-height:24px;cursor:pointer;width:250px" onClick=\"openwin('+n.notice_id+',\''+action+'\')\" ><a style="color:red">'+n.toptitle+'</a></h3>';
					}else{
						mtab+='<h1 style="color:red;font-weight:400;font: 14px \'宋体\';line-height:24px;cursor:pointer;width:250px" onClick=\"openwin('+n.notice_id+',\''+action+'\')\" ><a style="color:red">'+n.toptitle+'</a></h1>';
					}
			
				
				mtab+='<p style="font: 12px \'宋体\';line-height:24px;"><a href="#" id="readcount_'+n.notice_id+'">查阅：'+n.rcount+'/'+n.pcount+'人</a></p>';
			mtab+='</td>';
		mtab+='</tr></table>';

			
			/*
			mtab+='<tr '+read+'><td align="center"><input type="checkbox" name="'+action+'check" id="'+action+'_'+n.notice_id+'" /></td>';
			mtab+='<td><div style="padding-left:16px;"';
			
			mtab+= n.accessoryCount>0 ? ' class="fujian"' : '';
			
			mtab+= ' onClick=\"openwin('+n.notice_id+',\''+action+'\')\" title="'+n.title+'">'+substrs(n.title,40,'..')+'</div></td>';
			mtab+='<td title="'+n.username+'">'+substrs(n.username, 15, '...')+'</td>';
			mtab+='<td>'+n.send_time+'</td></tr>';
			*/
			
		})
		
		
		mtab+='</td></tr>';
	 
	} else {
		
		mtab+='<tr><td  colspan="3" style="border-bottom:none"><div style="width:100%; text-align: center;margin-top: 30%;"><font style="font-size:16px; color:#666666;">您暂时没有相关数据 !</font></div></td></tr>';

	}
	
	$('#get_data,#sent_data,#all_data').empty();
	
	$('#'+action+'_data').append(mtab);
	
	if (_id_arr.length > 0){
		
		for (var ii=0;ii<_id_arr.length;ii++){
			$('#readcount_'+_id_arr[ii]).dialog({
				title:'查阅统计',
				content: 'url:/notice/visit/'+_id_arr[ii],
				width:'520px',
				height:'373px'
			});	
		}
	}

	//$("tbody>tr:odd").addClass("todd");
}


/**
 *@info 截取字符串 包含中文处理
 *@param str 字符串 
 *@param len 长度
 *@param hasDot 增加 
 *@date: 2012-11-08
 */
function substrs(str, len, hasDot){ 
	var newLength = 0, newStr = "", chineseRegex = /[^\x00-\xff]/g,  singleChar = ""; 
	var strLength = str.replace(chineseRegex,"**").length; 
	for(var i = 0; i < strLength; i++){ 
		singleChar = str.charAt(i).toString(); 
		if(singleChar.match(chineseRegex) != null){ 
			newLength += 2; 
		}else { 
			newLength++; 
		} 
		if(newLength > len){ 
			break; 
		} 
		newStr += singleChar; 
	} 
	
	if(hasDot && strLength > len) { 
		newStr += ".."; 
	} 
	return newStr; 
} 

/**
 *	格式行数据
 *	luoxt	2013-04-03
 *
 */
 /*
function lineStr(str, len, hasDot){ 
	var chineseRegex = /[^\x00-\xff]/g;
	var onestr = '';
	var newArr = [];
	
	var newStr = str.split("");
	var strlen = newStr.length;
	var newStrLen = 0;
	for(var j=0; j<strlen; j++){
		
		if(newStr[j].match(chineseRegex) != null){
			newStrLen+=2;
		} else {
			newStrLen++;
		}
		onestr+=newStr[j];	
		if(newStrLen>=len){
			newArr.push(onestr);
			newStrLen = 0;
			onestr='';
		}
	}
	newArr.push(onestr);
	return newArr.join(hasDot);
} 
*/

//全选/反选
function select_all(obj){
	
	var types = gettype();
	
	if(types==1){
		addclick('get_check');
		if($(obj).attr('checked')==='checked'){
			$("input[name='getcheck']").attr('checked','true');
		} else {
			$("input[name='getcheck']").removeAttr('checked');
		}								 
		 getonclick();	//获取getid
	}else if(types==2){
		//alert(notice.showTab);
		addclick('send_check');
		
		if($(obj).attr('checked')==='checked'){
			$("input[name='sentcheck']").attr('checked','true');
		} else {
			$("input[name='sentcheck']").removeAttr('checked');
		}
		 //获取sendid
		 sendonclick();	
	}else{
		addclick('send_check');
		if($(obj).attr('checked')==='checked'){
			$("input[name='allcheck']").attr('checked','true');
		} else {
			$("input[name='allcheck']").removeAttr('checked');
		}
		 //获取sendid
		 sendonclick();	
	}
	
}



/**
 *	input 添加click 事件 加载完数据及调用
 *
 */
function addclick(name ){
	var getinput = $("input[name='"+name.replace('_','')+"']")
	var gettype = name.split('_');

	$.each(getinput,function(i,n){
		if(gettype[0] == 'get'){
			$(n).attr('onclick','getonclick( )');
		}else if(gettype[0] == 'get'){
			$(n).attr('onclick','sendonclick( )');
		}else{
			$(n).attr('onclick','allonclick( )');
		}
	});
}


//获取所有getid放入命名空间
function getonclick(){
	var getid_all = [];
	$.each($("#get_son input:checked"), function(i, n){
		getid_all[i] = n.id;											 
	});

	notice.getsID = getid_all;
	//console.info(notice.getsID);
}

//发送所有sendid 放入命名空间
function sendonclick(){
	var sendid_all = [];
	$.each($("#sent_son input:checked"), function(i, n){
		sendid_all[i] = n.id;											 
	});
	
	notice.sendsID = sendid_all;
}

//发送所有allid 放入命名空间
function allonclick(){
	var sendid_all = [];
	$.each($("#all_son input:checked"), function(i, n){
		sendid_all[i] = n.id;											 
	});
	
	notice.allID = sendid_all;
}

/**
 *@info 获得当前内容分页数
 *@author HJ
 *@param id 公告id
 *@param type 类别
 *@param to 翻页类型
 *@date: 2012-11-10
 */
function getpagecount(id,type,to){
	
	if (typeof to == "undefined"){
		to = '';
	}
	
	$.ajax({
	   type: "POST",
	   url: "/notice/pagecount",
	   data:{
			'noticeid':id,
			'type':type,
			'to':to
		},
	   success: function(data){
			var msg = JSON.decode(data);
			
			if (msg.res == 1)
			{
			
				$('#showcount').empty();
				$('#showcount').append(msg.info);
				
			}
			else
			{
				$('#showcount').empty();
				$('#showcount').append('0/0封');
			}
		}
	});
}

/**
 *@info 公告内容显示
 *@author HJ
 *@param id 公告id
 *@param action 动作
 *@param to 
 *@param _page 显示页数
 *@date: 2012-11-08
 */
function showdetail(id, action, to){
	
	/*获得当前内容分页数*/
	getpagecount(id,action,to);

	if (action == 'sent'){
		notice.action = 2;
		$('#ggtype option[value=1]').attr('selected',false)
		$('#ggtype option[value=2]').attr('selected',true);
	}
	
	$('#_contentinfo1').show();
 	$('#_contentinfo2').hide();
	
	$('#_contentinfo1').empty();
	$('#_contentinfo1').append('<div style="width:100%; text-align: center; margin-top:170px;"><img src="/misc/images/nloading.gif"></div>');
	
	//设置状态做兼容处理,是否存在静态页
	var fetchContent = false;
	$('#noticehtml').load('/html/'+ id + '.html',function(response,status,xhr){
		if(status=='success'){
			fetchContent = true;
	 		$('#content_counts').html("<img src='/misc/images/mini-loading.gif'>");
		}
	} );
	
	$.ajax({
	   type: "POST",
	   url: "/notice/content",
	   data: 'artID='+id+'&action='+action+'&to='+to,
	   success: function(data){
		
		 	var msg = JSON.decode(data);
		 	
		 	notice.artID = msg.info.id;
		 	fetchContent = false;
		 	if(!fetchContent){//不存在静态页
		 	
			 	$('#detail_head1').empty();
			 	$('#detail_head1').hide();
			 	if (msg.info.toptitle){
			 		$('#detail_head1').show();
			 		$('#detail_head1').append(msg.info.toptitle);
			 		
			 		$('#_contentinfo2').attr('style',function(){
			 			
			 			return 'display: block;';
			 			
			 		});
			 	}else{
			 		
			 	
			 		$('#_contentinfo2').attr('style',function(){
			 			
			 			return 'display: block;padding: 0 38px 10px;';
			 			
			 		});
			 	}
			 	
			 	$('#_contentinfo1').hide();
			 	$('#_contentinfo2').show();
			 	
			 	$('#detail_head2').empty();
			 	$('#detail_head2').append(msg.info.title);
			 	
			 	$('#detail_head3').empty();
			 	$('#detail_head3').append('<span>发布者：<a href="'+msg.info.winjump+'">'+msg.info.UserName+'（'+msg.info.depname+'-'+msg.info.zw+'）</a></span><span>发布时间：'+msg.info.addtimes+'</span>');
	
				$('#sender_info').empty();
			 	$('#sender_info').append('<p class="fl"><b>接收人：</b><font id="con_group" title="'+msg.info.all_group_name+'">'+msg.info.group_name+'</font></p><a class="fr" href="#" id="content_counts">查阅：'+msg.info.rcount+'/'+msg.info.pcount+'人</a>');
			 	
			 	$('#detail_content').empty();
			 	
			 	var _rp = '../upload';
			 	
			 	$('#detail_content').append('<br>'+msg.info.content.replace(new RegExp(_rp,'g'),'../../upload')+'<br>');
			 	
			 	var filedowns = '<p><b>附件:</b></p>';
				if($(msg.filedown).size()){
					$.each(msg.filedown, function(i, n){
						var filesize = (n.accessorySize)/(1024);
						var filename = n.accessoryName;
						filename = filename.substr(0,50);
						filedowns+='<iframe id="downloadURL" height="0" width="0" src=""></iframe><a href="javascript:filedown(\''+n.id+'\')">'+filename+'（'+filesize.toFixed(2)+'kb）</a><br>';
					});
				}
				
				filedowns += '</p>';
				
				$('#file_path').empty();
			 	$('#file_path').append(filedowns);
			 	
		 	}else{
		 		$('#detail_head3').find('a').attr('href',msg.info.winjump);
		 		$('#content_counts').html('查阅：'+msg.info.rcount+'/'+msg.info.pcount+'人');
		 	} 
		 	
		 	$('#content_counts').dialog({
					title:'查阅统计',
					content: 'url:/notice/visit/'+notice.artID,
					width:'520px',
					height:'373px'
			});
		 	
		 	sellocation('views');

		}
	});
	
}


/**
 *	读取公告内容
 *
 *
 */
function openwin(id, action, to){
	
		$('#showdetail').show();
		$('#contentinfo').hide();

		showdetail(id, action, to);
}


/*2012-01-16 by HJ*/
function strip_tags (input, allowed) {
	allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
		commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) { 
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
}

function SetImg(obj,maxW,maxH){
	   var imgH=obj.height;
	   var imgW=obj.width;
			   
	   if(obj.height>maxH){
			obj.height=maxH;
			obj.widht=(obj.width*(maxH/imgH));
			imgH=maxH;
			imgW=obj.width;
		}
			 
		if(obj.width>maxW){
			obj.width=maxW;
			obj.height=(maxW/imgW)*imgH;
			imgW=maxW;
			imgH=obj.height;
		}
	}
	
	/**
 *	html标签转换
 *
 */
function html2code(str) {
	str = str.replace('&','&amp;');
	str = str.replace('<','&lt;');
	str = str.replace('>','&gt;');
	str = str.replace('"','&quot;');
	str = str.replace('\'','&lsquo;');
	return str;
}

/**
 *@info 获得当前选择的公告类型
 *@param null
 *@date: 2012-11-13
 *@return null
 */
function gettype(){

	//return $('#ggtype').val();
	return notice.action;
}

/**
 *@info 文件下载路径
 *@param int id 文件id
 *@date: 2012-11-13
 *@return null
 */
function filedown(id){
	location.href = '/notice/fileDown/'+id;	
}


/**
 *@info 检查标题和台头字数长度
 *@author HJ
 *@param obj obj 输入对像
 *@param string msg 显示消息的 id
 *@param string max 最大字数
 *@date: 2012-11-13
 *@return null
 */
function chkContent(obj,msg,max){

	var content = $(obj);  
	var length = content.val().length;  
	var contentMsg = $('#'+msg);
	var _val = length+"/"+max; 
	
	if (length > max){
		_val = max+"/"+max; 
		content.val(content.val().substr(0,max));
	}
	
	contentMsg.html(_val); 
}  

/**
 *@info 选择公告类型
 *@author HJ
 *@param int val 公告类型 （1为我收到的公告 2为我发出的公告）
 *@date: 2012-11-13
 *@return null

function fnmsg(val){

	if (val == 1){
		notice.action = 1;
		page_data('get', notice.getsPage);
	}
	
	if (val == 2){
		notice.action = 2;
		page_data('sent', notice.getsPage);
	}
	
}
 */
/**
 *@info 定位公告类型下拉框位置
 *@author HJ
 *@param string type 记录公告类型下拉框的位置类型
 *@date: 2012-11-14
 *@return null
 */
function sellocation(type){

	if (type == 'write'){
		$.cookie('sellocations','', {path: '/'});
	}
	
	$('#selform div').attr('style',function(){
		
		if ($(this).attr('class') == 'NFSelect'){
			//return 'width: 89px; left: 849px; top: 58px; z-index: 999;';

			if ($.cookie('sellocations') == '' || $.cookie('sellocations') == null){
				$.cookie('sellocations',$(this).attr('style'), {path: '/'});
			}
			
			return $.cookie('sellocations');
			
		}
	});

}



//发送所有allid 放入命名空间
function allonclicks(action){
	var sendid_all = [];
	$.each($("#"+action+"_data input:checked"), function(i, n){
		sendid_all[i] = n.id;											 
	});
	
	notice.allID = sendid_all;
}

/**
*@info 删除选中公告
*@date: 2012-11-08
*/
$('#del_res').click (function (){
	var types = gettype();
	var action = 'all';
	if(types == '1'){
		action = 'get';
	}else if(types == '2'){
		action = 'sent';
	}

	allonclicks(action);

	var data = notice.allID;
	
	if(data.length<1){
		alert('请选择要删除的选项！');
		return false;
	}

	//改为彻底删除
	for(var i=0;i<data.length;i++){
		data[i] = data[i].replace('get', 'all');
	}

	if(!confirm("删除后发布者和接收者将看不到此公告，您确定要删除吗？")){
			return false;
	}
	
	
	$.ajax({
	   type: "POST",
	   url: "/notice/delete",
	   data: 'postdata='+data,
	   success: function(data){
		   var msg = $.parseJSON(data);
		   if( msg.res == 1){
				alert(msg.info);
				page_data(action, notice.sendsPage);
		   }else{
				alert(msg.info);   
		   }
	   }
	});
});
	function searchtitle(){
		var title = $('#search').val();
		if(title.length < 1){
			alert('请输入要搜索的标题！');
			}
		
		var type = $('#ggtype').val();
		notice.action = type;
		notice.searchtitle = title;
		notice.sendsPage = 1;
		var action = 'all';
		switch(type){
			case '1':
				action = 'get';
				break;
			case '2':
				action = 'sent';
				break;
		};

		page_data(action, notice.sendsPage);
	}
