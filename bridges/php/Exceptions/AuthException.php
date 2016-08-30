<?php

namespace FileManager\Exceptions;

class AuthException extends \Exception{
    public function __construct($message){
        parent::__construct($message);
    }
}