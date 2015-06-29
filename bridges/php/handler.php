<?php

require_once __DIR__ . '/php-classic/src/autoloader.php';

use PHPClassic\ExceptionCatcher;
use PHPClassic\Ftp;

class ExceptionCatcherJSON extends ExceptionCatcher 
{
    public static function draw(\Exception $oExp)
    {
        @header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
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

    public static function getPostContent() 
    {
        $rawData = file_get_contents('php://input');
        return json_decode($rawData);
    }

    public static function getApiParam($param) 
    {
        $oData = static::getPostContent();
        if (isset($oData->params)) {
            return isset($oData->params->$param) ? $oData->params->$param : null;
        }
        return null;
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

$oFtp = new FileManager(array(
    'hostname' => '',
    'username' => '',
    'password' => ''
));

$oFtp->connect();
$oResponse = new Response();

if (Request::getApiParam('mode') === 'list') {
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

if (Request::getApiParam('mode') === 'editfile') {
    $oResponse->setData($oFtp->getContent(Request::getApiParam('path')));
    $oResponse->flushJson();
}

if (Request::getApiParam('mode') === 'addfolder') {
    $path = Request::getApiParam('path');
    $name = Request::getApiParam('name');
    $result = $oFtp->mkdir($path .'/'. $name);
    if (! $result) {
        throw new Exception("Unknown error creating this folder");
    }
    $oResponse->setData($result);
    $oResponse->flushJson();
}

if (Request::getQuery('mode') === 'download') {
    $download  = Request::getQuery('preview') === 'true' ? '' : 'attachment;';
    $filePath = Request::getQuery('path');
    $fileName = explode('/', $filePath);
    $fileName = end($fileName);
    $tmpFilePath = $oFtp->downloadTemp($filePath);
    if ($fileContent = @file_get_contents($tmpFilePath)) {
        $oResponse->setData($fileContent);
        $oResponse->setHeaders(array(
            'Content-Type' => @mime_content_type($tmpFilePath),
            'Content-disposition' => "$download filename=$fileName"
        ));
    }
    $oResponse->flush();
}

throw new \Exception('This action is not available in the demo');