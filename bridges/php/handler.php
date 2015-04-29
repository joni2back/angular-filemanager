<?php

require_once __DIR__ . '/php-classic/src/autoloader.php';

use PHPClassic\ExceptionCatcher;
use PHPClassic\Ftp;

class ExceptionCatcherJSON extends ExceptionCatcher 
{
    public static function draw(\Exception $oExp)
    {
        return json_encode(array(
            'success' => false,
            'error' => array(
                'message' => $oExp->getMessage(),
                'type' => get_class($oExp),
                'code' => $oExp->getCode()
            )
        ));
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
    public function download($path) 
    {
        $localPath = tempnam(sys_get_temp_dir(), 'fmanager_');
        if (parent::download($path, $localPath)) {
            return $localPath;
        }
    }

    public function getContent($path) 
    {
        $localPath = $this->download($path);
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
    $oResponse->setData($oFtp->listFilesRaw(Request::getApiParam('path')));
    $oResponse->flushJson();
}

if (Request::getApiParam('mode') === 'editfile') {
    $oResponse->setData($oFtp->getContent(Request::getApiParam('path')));
    $oResponse->flushJson();
}

if (Request::getQuery('mode') === 'download') {
    $download  = Request::getQuery('preview') === 'true' ? '' : 'attachment;';
    $filePath = Request::getQuery('path');
    $fileName = explode('/', $filePath);
    $fileName = end($fileName);
    $tmpFilePath = $oFtp->download($filePath);
    if ($fileContent = @file_get_contents($tmpFilePath)) {
        $oResponse->setData($fileContent);
        $oResponse->setHeaders(array(
            'Content-Type' => @mime_content_type($tmpFilePath),
            'Content-disposition' => "$download filename=$fileName"
        ));
    }
    $oResponse->flush();
}
