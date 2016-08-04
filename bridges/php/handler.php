<?php
/**
 *  FTP bridge for angular-filemanager v2
 *  @author Jonas Sciangula Street <joni2back@gmail.com>
 */

require_once __DIR__ . '/includes/Ftp.php';
require_once __DIR__ . '/includes/ExceptionCatcher.php';

date_default_timezone_set('UTC');
error_reporting(0);

session_name('file_manager_session');
session_start();

use PHPClassic\ExceptionCatcher;
use PHPClassic\Ftp;

class AuthException extends Exception{
    public function __construct($message){
        parent::__construct($message);
    }
}

class ExceptionCatcherJSON extends ExceptionCatcher 
{
    public static function draw(\Exception $oExp)
    {
        if($oExp instanceof AuthException){
            session_unset();
            http_response_code(401);
        }else{
            http_response_code(500);
        }

        $oResponse = new Response;
        $oResponse->setData(array(
            'success' => false,
            'error' => $oExp->getMessage(),
            'errorDetail' => array(
                'type' => get_class($oExp),
                'code' => $oExp->getCode()
            )
        ));
        return $oResponse->flushJson();
    }

    public static function register()
    {
        set_exception_handler(array(__CLASS__, 'handle'));
    }
}

abstract class Request 
{
    public static function getQuery($param = null, $default = null)
    {
        if ($param) {
            return isset($_GET[$param]) ?
                $_GET[$param] : $default;
        }
        return $_GET;
    }

    public static function getPost($param = null, $default = null)
    {
        if ($param) {
            return isset($_POST[$param]) ?
                $_POST[$param] : $default;
        }
        return $_POST;
    }

    public static function getSession($param, $default = null){
        if($param) {
            return isset($_SESSION[$param]) ? $_SESSION[$param] : $default;
        }
        return $_SESSION;
    }

    public static function getFile($param = null, $default = null)
    {
        if ($param) {
            return isset($_FILES[$param]) ?
                $_FILES[$param] : $default;
        }
        return $_FILES;
    }

    public static function getPostContent() 
    {
        $rawData = file_get_contents('php://input');
        return json_decode($rawData);
    }

    public static function getApiParam($param) 
    {
        $oData = static::getPostContent();
        return isset($oData->$param) ? $oData->$param : null;
    }

    public static function getApiOrQueryParam($param) 
    {
        return Request::getApiParam($param) ? 
            Request::getApiParam($param) : Request::getQuery($param);
    }
}

class Response 
{
    protected $data;

    public function __construct($data = null) 
    {
        $this->setData($data);
    }

    public function flushJson() 
    {
        $this->setHeaders(['Content-type' => 'application/json']);
        $this->data = json_encode(array('result' => $this->data));
        return $this->flush();
    }

    public function flush()
    {
        echo $this->data;
        exit;
    }

    public function setData($data)
    {
        $this->data = $data;
        return $this;
    }

    public function setHeaders($params)
    {
        if (! headers_sent()) {
            if (is_scalar($params)) {
                header($params);
            } else {
                foreach($params as $key => $value) {
                    header(sprintf('%s: %s', $key, $value));
                }
            }
        }
        return $this;
    }

    public static function setSession($param, $value){
        $_SESSION[$param] = $value;
    }
}

class FileManager extends Ftp 
{
    public function downloadTemp($path) 
    {
        $localPath = tempnam(sys_get_temp_dir(), 'fmanager_');
        if ($this->download($path, $localPath)) {
            return $localPath;
        }
    }

    public function getContent($path) 
    {
        $localPath = $this->downloadTemp($path);
        if ($localPath) {
            return @file_get_contents($localPath);
        }
    }

}

ExceptionCatcherJSON::register();
$oResponse = new Response();


if(Request::getApiParam('action') === 'logout') {
    session_destroy();

}

if(Request::getApiParam('action') === 'login'){

    $username = Request::getApiParam('username');
    $password = Request::getApiParam('password');

    $loginFtp = new FileManager(array(
        'hostname' => 'files.000webhost.com',
        'username' => $username,
        'password' => $password
    ));

    if (! $loginFtp->connect()) {
        throw new Exception("Log in details are not correct.", 401);
    }

    Response::setSession('username',$username);
    Response::setSession('password',$password);

    $oResponse->setData(['success' => true]);
    $oResponse->flushJson();
}

if(!Request::getSession('username') && !Request::getSession('password')){
    throw new AuthException('You are not logged in.',401);
}

$oFtp = new FileManager(array(
    'hostname' => 'localhost',
    'username' => Request::getSession('username'),
    'password' => Request::getSession('password'),
));

if (! $oFtp->connect()) {
    throw new AuthException("Cannot connect to the FTP server");
}

if (Request::getFile() && $dest = Request::getPost('destination')) {
    $errors = array();
    foreach (Request::getFile() as $file) {
        $filePath = $file['tmp_name'];
        $destPath = $dest .'/'. $file['name'];
        $result = $oFtp->upload($filePath, $destPath);
        if (! $result)  {
            $errors[] = $file['name'];
        }
    }
    
    if ($errors) {
        throw new Exception("Unknown error uploading: \n\n" . implode(", \n", $errors));
    }
    
    $oResponse->setData($result);
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'list') {
    $list = $oFtp->listFilesRaw(Request::getApiParam('path'));
    $list = is_array($list) ? $list : array();
    $list = array_map(function($item) {
        $date = new \DateTime('now');
        $item['date'] = $date->format('Y-m-d H:i:s');
        return $item;
    }, $list);
    $oResponse->setData($list);
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'getContent') {
    $oResponse->setData($oFtp->getContent(Request::getApiParam('item')));
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'edit') {
    $item = Request::getApiParam('item');
    $newContent = Request::getApiParam('content');
    $result = $oFtp->setFileContent($item, $newContent);
    $oResponse->setData($result);
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'changePermissions') {
    $items = Request::getApiParam('items');
    $permsCode = Request::getApiParam('permsCode');
    $permsCode = $oFtp->translateChmodCode($permsCode);

    $errors = array();
    foreach($items as $item) {
        $result = $item ? $oFtp->chmod($item, $permsCode) : false;
        if (! $result)  {
            $errors[] = $item . ' to ' . $permsCode;
        }
    }

    if ($errors) {
        throw new Exception("Unknown error changing file permissions: \n\n" . implode(", \n", $errors));
    }

    $oResponse->setData($result);
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'rename') {
    $item = Request::getApiParam('item');
    $newItemPath = Request::getApiParam('newItemPath');
    $result = $oFtp->move($item, $newItemPath);
    if (! $result) {
        throw new Exception("Unknown error renaming this item");
    }
    $oResponse->setData($result);
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'move') {
    $items = Request::getApiParam('items');
    $newPath = Request::getApiParam('newPath');
    $errors = array();

     foreach($items as $item) {
        $fileName = explode('/', $item);
        $fileName = end($fileName);
        $finalPath = $newPath . '/' . $fileName;
        $result = $item ? $oFtp->move($item, $finalPath) : false;
        if (! $result)  {
            $errors[] = $item . ' to ' . $finalPath;
        }
    }
    if ($errors) {
        throw new Exception("Unknown error moving: \n\n" . implode(", \n", $errors));
    }
    $oResponse->setData($result);
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'remove') {
    $items = Request::getApiParam('items');
    $errors = array();

    if(is_array($items)) {
        foreach ($items as $item) {
            $result = $item ? $oFtp->delete($item) : false;
            if (!$result) {
                $errors[] = $item;
            }
        }

    }

    if ($errors) {
        throw new Exception("Unknown error deleting: \n\n" . implode(", \n", $errors));
    }

    $oResponse->setData($result);
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'createFolder') {
    $newPath = Request::getApiParam('newPath');
    $result = $oFtp->mkdir($newPath);
    if (! $result) {
        throw new Exception("Unknown error creating this folder");
    }
    $oResponse->setData($result);
    $oResponse->flushJson();
}

if (Request::getApiParam('action') === 'compress') {
    $items = Request::getApiParam('items');
    $destination = Request::getApiParam('destination');
    $compressedFilename = Request::getApiParam('compressedFilename');

    //example
    $temp = tempnam(sys_get_temp_dir(), microtime());
    $finalDest = $destination . '/' . $compressedFilename;

    $finalDest = preg_match('/\.(tar|zip)$/', $finalDest) ? $finalDest : $finalDest . '.zip';
    $result = $oFtp->upload($temp, $finalDest);
    if (! $result) {
        throw new Exception("Unknown error compressing these file(s)");
    }

    $oResponse->setData(true);
    $oResponse->flushJson();
}

if (Request::getQuery('action') === 'download') {
    $download  = Request::getQuery('preview') === 'true' ? '' : 'attachment;';
    $filePath = Request::getQuery('path');
    $fileName = explode('/', $filePath);
    $fileName = end($fileName);
    $tmpFilePath = $oFtp->downloadTemp($filePath);
    if ($fileContent = @file_get_contents($tmpFilePath)) {
        $oResponse->setData($fileContent);
        $oResponse->setHeaders(array(
            'Content-Type' => @mime_content_type($tmpFilePath),
            'Content-disposition' => sprintf('%s filename="%s"', $download, $fileName)
        ));
    }
    $oResponse->flush();
}

if (Request::getQuery('action') === 'downloadMultiple') {
    $items = Request::getApiOrQueryParam('items');
    $toFilename = Request::getApiOrQueryParam('toFilename');
    $errors = array();

    $fileContent = is_array($items) ? implode($items, ", \n") : '';
    if ($errors) {
        throw new Exception("Unknown compressing to download: \n\n" . implode(", \n", $errors));
    }

    if ($fileContent) {
        $oResponse->setData($fileContent);
        $oResponse->setHeaders(array(
            'Content-Type' => @mime_content_type($fileContent),
            'Content-disposition' => sprintf('attachment; filename="%s"', $toFilename)
        ));
    }
    $oResponse->flush();
}

throw new \Exception('This action is not available in the demo');