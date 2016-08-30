<?php

namespace FileManager\Http;

class Response
{
    protected $data;

    public function __construct($data = null)
    {
        $this->setData($data);
    }

    public function flushJson($data = null)
    {
        if(!is_null($data)){
            $this->setData($data);
        }
        
        $this->setHeaders(['Content-type' => 'application/json']);
        $this->data = json_encode(array('result' => $this->data));
        $this->flush();
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