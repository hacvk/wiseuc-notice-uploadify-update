<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
	<title>通知公告</title>
	<link rel="stylesheet" type="text/css" href="/misc/css/base.css" />
	<link rel="stylesheet" type="text/css" href="/misc/css/style.css" />
	<link rel="stylesheet" type="text/css" href="/misc/css/popup.css" />
	<link rel="stylesheet" type="text/css" href="/misc/css/niceforms-default.css" />

	<style>
		html,body{
			overflow-x:hidden;
			_overflow-x:hidden;
		   overflow-y:hidden;
		   border:none;
		}
		.detail_c1{line-height:300%;}
		/* UploadiFive 样式调整 */
		.uploadifive-button {
			background-image: url('/misc/images/addfile.png') !important;
			background-repeat: no-repeat !important;
			background-position: center center !important;
			background-color: transparent !important;
			border: none !important;
			width: 100px !important;
			height: 27px !important;
			line-height: 27px !important;
			overflow: hidden !important;
			text-indent: -9999px !important;
			cursor: pointer !important;
			display: inline-block !important;
			position: relative !important;
		}
		.uploadifive-button:hover {
			opacity: 0.8;
		}
		.uploadifive-queue-item {
			width: 100%;
			line-height: 20px;
			text-indent: 10px;
			background-color: #F0F0F0;
			margin-top: 5px;
			padding: 5px;
		}
		#addfile {
			clear: both;
			min-height: 30px;
		}
		#addfile input[type="file"] {
			position: absolute;
			opacity: 0;
			width: 100px;
			height: 27px;
			cursor: pointer;
		}
	</style>
</head>
<body oncontextmenu="window.event.returnValue=false;">
	<div class="wrapper">		
		<!--header start-->
		<div class="header_bar">
			<ul class="tab clearfix">
				<li><span class="icon_01" id="viewgg">&nbsp;查看公告</span></li>
				<li><span class="icon_02" id="writegg">&nbsp;写公告</span></li>
			<li style="float:right;width:220px;height:34px;background:url(../images/bg.png) -116px 0 no-repeat;"> 
                         <input type="text"  value="" id="search" name="search" style="margin-left:6px;width:145px;height:20px;line-height:20px;">
                         <input type="button" class="btn_01" style="margin-right:6px" value="搜索" onclick="searchtitle()">
				</li>
			</ul>
		</div>
		<!--header end-->
		<!--content start-->
		<div class="tab_bar" id="contentinfo">
			<div class="content">				
				<table class="content_01">
					<thead>
						<tr>
							<td valign="middle" class="c_td_01"><input type="checkbox" name="interests[]" id="interestsNews" onclick="select_all(this);"></td>
							<td valign="middle" class="c_td_02">

								<input type="button" class="btn_01" value="删除" id="del_check">
								<input type="button" class="btn_01" value="刷新" id="refresh">
								<input type="button" class="btn_02" value="标记为已读"   id="btn_read"/>
								<? if($admin){?>
								<input type="button" class="btn_02" value="彻底删除" id="del_res">
								<?}?>
								
								<span id="btn_read_status"  >未读<em class="b red f14">（0）</em></span>
								
									

							</td>
							
							
							<td valign="middle" class="c_td_03" style="float:right;">
								<div class="pag clearfix" id="show_pager">
						
								</div>
								<div style="float:right;padding:10px;" id="show_pager_num">0/0页</div>
								<!--<form method="post" class="niceform" id="selform">-->
								<form method="post" class="" id="selform">
									<!--
									<select size="1" name="" id="">
										<option value="">1/3</option>
										<option value="">2/3</option>
										<option value="">3/3</option>
									</select>
									-->
									
									<select size="1" id="ggtype">
										<option value="1">我收到的</option>
										<option value="2">我发布的</option>
										<? if($admin){?>
										<option value="3">全部公告</option>
										<?}?>
									</select>
								</form>	
							</td>
						</tr>
					</thead>
					</table>
					
					<div class="content_main2">
						<table>
							<tbody id="get_data" >
		
								
							</tbody>
						
							<tbody id="sent_data" >
		
								
							</tbody>
							
							<tbody id="all_data" >
		
								
							</tbody>
						
						</table>
				</div>
			</div>

		<?php if($is_show = 1){?>
			<div class="content">
				<table class="content_02">
					<thead>
						<tr>
							<th id="jumpth">
							
								<input class="btn_03" type="button" id="onsendvote">
							</th>
							<td>
								<input class="btn_02" type="button" value="打印预览"  id="showview"/>
							</td>
						</tr>
					</thead>
				</table>
				<div class="content_main" >
					<table>
						<tbody>						
							<tr>
								<th valign="top">
									<input class="btn_04" type="button" id="selgroup" onFocus="this.blur();" name="selgroup">
										<input id="group_id" name="" type="hidden" value=""/>
										<input id="user_id" name="" type="hidden" value="1,"/>
								</th>
								<td><!--<input class="t_input" type="text" id="group_name" value="" style="width:94%;">-->
								<div id="group_name" value="" style="width:94%;border:1px solid #d8d8d8;padding:3px;line-height:18px;">&nbsp;</div>
								</td>
							</tr>
							<tr>
								<td style="text-align: right;">红头：</td>
								<td><input class="t_input" type="text" id="toptitle" value=""  /><span class="ml8" id="toptitle_count">0/64</span></td>
							</tr>
							<tr>
								<td style="text-align: right;"><em style="color:red">*</em>主题：</th>
								<td><input class="t_input" type="text" id="title" value="" /><span class="ml8" id="title_count">0/64</span></td>
							</tr>
							<tr>
								<th></th>
								<td>
									<dl class="fj">
										
										<div>
										<div id="addfile" class="addfile" style="float:left;width:100%;">
											<input id="file_upload" type="file" name="file_upload" multiple />
										</div>
										</div>
									</dl>
										</td>
							</tr>
							<tr>
								<td style="text-align: right;">提醒方式：</td>
								<td>
									<input type="checkbox" id="im_notice" checked="checked"  disabled="disabled" /><label style="font-weight: normal;font-size:12px;color:#000;"> IM</label>&nbsp;&nbsp;<!--<input type="checkbox" id="sm_notice" /><label for="sm_notice" style="font-weight: normal;font-size:12px;color:#000;"> 短信</label>-->
								</td>
							</tr>
							<tr>
								<td style="text-align: right;" valign="top"><em style="color:red">*</em>内容：</th>
								<td><textarea id="editor_id" name="editor_id" class="post_textarea" style="width:95%; height:265px;" ></textarea></td>
							</tr>
						</tbody>
					</table>
				</div>
				</div>
				<?php } else{?>
				
				<div style="width:100%; text-align: center;margin-top: 30%; font-family:'黑体'; font-size:16px; color:#666666">
				<span>对不起，您没有相关权限，请联系管理员开通权限！</span>
				</div>
				
				<?php } ?>
		</div>
		<!--content end-->
		
		
		<!--content start-->
		<div class="content" id="showdetail" style="display:none">				
			<table class="content_03">
				<thead>
					<tr>
						<td class="pl13 c_td_07"><input type="button" class="btn_06 mr8" value="返回" id="_back"><input id="votice_del" type="button" class="btn_01 mr8" value="删除" />
							<input class="btn_02" type="button" value="打印预览"  id="cshowview"/>
						</td>
						<td class="c_td_08">
							<div class="pag clearfix">
								<a href="#" id="votice_prev"><span>上一页</span></a>
								<a href="#" id="votice_next"><span>下一页</span></a>
							</div>
							<span id="showcount" style="font-weight:400;"></span>
						</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td colspan="2" class="c_td_09" id="noticehtml">
							
							<div class="text_box" id="_contentinfo1" ></div>
							
							<div class="text_box" id="_contentinfo2" style="display:none;">
								
								<h1 id="detail_head1"></h1>
								
								<h2 id="detail_head2"></h2>
								<div class="detail_meta" id="detail_head3">
									
								</div>
								
								<div id="detail_content" class="detail_c1" style="margin-top:10px;">
									<div class="detail_c1" >
										
									</div>
									
									<div class="detail_c2" >
										
									</div>
								</div>
								
								<div class="detail_c3 clearfix" id="sender_info">
									
								</div>
								<div class="detail_c3 clearfix" id="file_path" style="line-height:24px!important">
									
								</div>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<!--Tab end-->
		
		
		
	</div>
</body>
</html>

<script type="text/javascript">

var user_id = <?=$userId?> 

<?php if($deptid!=''){?>, deptid=<?=$deptid?>, deptname ='<?=$deptname?>'<?php } ?>;

var key = '<?=$key?>';

</script>

<script src="/misc/js/jquery.min.js" type="text/javascript"></script>
<script src="/misc/js/uploadpic/ajaxfileupload.js" type="text/javascript"></script>
<script src="/misc/js/json.js" type="text/javascript"></script>
<script type="text/javascript" src="/misc/js/lhgdialog.min.js"></script>
<script type="text/javascript" src="/misc/js/niceforms.js"></script>
<script src="/misc/js/prompt/ymPrompt.js" type="text/javascript"></script>
<script type="text/javascript" src="/misc/js/tinymce/tiny_mce.js"></script>
<script type="text/javascript" src="/misc/js/debug.js"></script>
<script type="text/javascript" src="/misc/js/notice.js"></script>
