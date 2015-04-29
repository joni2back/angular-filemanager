<?php

require_once __DIR__ . '/php-classic/src/autoloader.php';

use PHPClassic\ExceptionCatcher;
use PHPClassic\Ftp;

class ExceptionCatcherJSON extends ExceptionCatcher {
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

abstract class Request {
    public static function getPostContent() {
        $rawData = file_get_contents('php://input');
        return json_decode($rawData);
    }
    public static function getApiParam($param) {
        $oData = static::getPostContent();
        if (isset($oData->params)) {
            return isset($oData->params->$param) ? $oData->params->$param : null;
        }
        return null;
    }
}

class Response {
    public function __construct($data) {
        echo json_encode(array('result' => $data));
        exit;
    }
}

class FileManager extends Ftp {

    public function getContent($path) {
        $localPath = tempnam(sys_get_temp_dir(), 'fmanager_');
        $this->download($path, $localPath);
        return file_get_contents($localPath);
    }

}

ExceptionCatcherJSON::register();

$oFtp = new FileManager(array(
    'hostname' => '',
    'username' => '',
    'password' => ''
));

$oFtp->connect();

if (Request::getApiParam('mode') === 'list') {
    new Response($oFtp->listFilesRaw(Request::getApiParam('path')));
}
if (Request::getApiParam('mode') === 'editfile') {
    new Response($oFtp->getContent(Request::getApiParam('path')));
}
