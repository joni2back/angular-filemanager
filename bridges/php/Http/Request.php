<?php

namespace FileManager\Http;

class Request
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
        return isset($oData->$param) ? $oData->$param : self::getPost($param);
    }

    public static function getApiOrQueryParam($param)
    {
        return Request::getApiParam($param) ?
            Request::getApiParam($param) : Request::getQuery($param);
    }
}