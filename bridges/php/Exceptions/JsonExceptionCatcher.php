<?php

namespace FileManager\Exceptions;

use FileManager\Http\Response;
use Touki\FTP\Exception\ConnectionException;

class JsonExceptionCatcher extends ExceptionCatcher
{
    public static function draw($oExp)
    {
        if($oExp instanceof AuthException || $oExp instanceof ConnectionException){
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

        $oResponse->flushJson();
    }

    public static function handleErrors($errno, $errstr){
        throw new \Exception($errstr, $errno);
    }

    public static function register()
    {
        set_exception_handler(array(__CLASS__, 'handle'));
        set_error_handler(array(__CLASS__,'handleErrors'));
    }
}