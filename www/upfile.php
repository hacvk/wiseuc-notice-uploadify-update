<?php 
	header("Content-type: text/html; charset=utf-8");
	define('BASEPATH', '../libs');
	define('APPPATH', '../app');
	require_once(APPPATH.'/config/database.php');
	require_once('db.class.php');
	
	$db = new mysql($db['default']['hostname'].':'.$db['default']['port'], $db['default']['username'], $db['default']['password'], $db['default']['database']);
	
	/**
	 *  文件上传   
	 *  
	 */
	$pidstr = trim($_GET['pid']);
	$is_app = 0;
	if(substr_count($pidstr, 'app')){
		$pid = intval(str_replace('app', '', $pidstr));
		$is_app = 1;
	}else {
		$pid = intval($pidstr);
	}
	
	$table = $is_app ? "t_xms_approve_accessory" : "t_xms_notice_accessory";

    //上传到notice目录下
    $callback = uploads($_FILES, 'upload/accessory/'.$pid.'/', $db, $table, $pid, 'copy');

    //上传到uc目录下，目的是为了在手机客户端查看审核时也可使用附件
    uploads($_FILES, '../../uc/www/upload/accessory/'.$pid.'/', $db, $table, $pid, '', $callback['FileName']);

    /**
     * 上传文件封装
     * @param $_files
     * @param $_filepath
     * @param $db
     * @param $_table
     * @param $pid
     * @param null $_type
     * @param null $_filename
     * @return array
     */
    function uploads($_files, $_filepath, $db, $_table, $pid, $_type=null, $_filename=null){
        if ($_files) {
            $array = array();
            $tempFile = $_files['Filedata']['tmp_name'];
            $filename = $_files['Filedata']['name'];
            $filesize = $_files['Filedata']['size'];

            writeLog(json_encode($_files));

            $extname = trim(array_pop(explode('.', $filename)));
            $SaveName = time().rand(1000,9999).'.'.$extname;

            if(!is_dir($_filepath)){
                make_dir($_filepath);
            }

            if($_type == 'copy'){
                $array['FileName'] = $SaveName;
                $targetFile =  $_filepath.$SaveName;
                copy($tempFile,$targetFile);

                echo $targetFile;
                writeLog($targetFile);

                $filename = addslashes($filename);
                // 插入附件记录，设置 validity=0 和 noticeId=0，等待创建公告时关联
                $insql = "insert into ".$_table." set userId={$pid}, accessoryUrl='{$targetFile}', accessoryName='{$filename}', accessorySize={$filesize}, createTime=".time().", validity=0, noticeId=0";
                $inquery = $db->query($insql);

                return $array;
            }

            $targetFile =  $_filepath.$_filename;
            move_uploaded_file($tempFile,$targetFile);
        } else{
            writeLog('没有上传文件！');
        }
    }
	
	/**
	 * 建目录函数
	 *
	 *
	 */
	function make_dir($dir){
		if (empty($dir)){return false;}
		$dir = str_replace("\\", "/", $dir);
		$d = explode("/", $dir);
		$folder = "";
		for ($i = 0; $i < count($d); ++$i){
			$folder .= "{$d[$i]}/";
			if (!file_exists($folder)){
				if (!@mkdir($folder, 0777)){return false;}
			}
		}
		return true;
	}
	
	/**
	 *	删除文件 
	 *
	 *
	 */
	function delFile($filepath){
		if(file_exists($filepath)){
			return unlink($filepath);	
		}else{
			return true;	
		}
	}
	
	/**
	 *	写日志函数
	 *
	 *
	 */
	function writeLog($msg){
		$fp = APPPATH.'/logs/'.date('Ymd').'.txt';
		$handle = @fopen($fp, 'a'); 
		@fwrite($handle, date('Y-m-d h:m:s').': '.$msg."\r\n\r\n");
		@fclose($handle);
	}


