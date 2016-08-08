<?php

use FileManager\Exceptions\JsonExceptionCatcher;
use FileManager\Http\Router;

require_once __DIR__ . '/vendor/autoload.php';

date_default_timezone_set('UTC');

session_name('file_manager_session');
session_start();

JsonExceptionCatcher::register();

new Router;
