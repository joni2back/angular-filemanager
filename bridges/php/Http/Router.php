<?php

namespace FileManager\Http;

use Alchemy\Zippy\Zippy;
use Exception;
use FileManager\Exceptions\AuthException;
use Touki\FTP\Connection\Connection;
use Touki\FTP\FTP;
use Touki\FTP\FTPFactory;
use Touki\FTP\FTPWrapper;
use Touki\FTP\Model\Directory;
use Touki\FTP\Model\File;
use Touki\FTP\Model\Filesystem;

class Router{

    private $response;
    private $request;
    private $action;

    private $connection;
    private $zip;
    private $ftp;
    private $ftpHelper;
    private $host = 'localhost';

    /**
     * Router constructor.
     */
    public function __construct(){
        if(getenv('FTP_HOST')){
            $this->host = getenv('FTP_HOST');
        }

        $this->response = new Response();
        $this->request = new Request();

        $this->action = Request::getApiParam('action');

        $this->zip = Zippy::load();

        $authResult = $this->handleAuthentication();

        if(!is_null($authResult)){
            $this->response->setData(['success' => true]);
            $this->response->flushJson();
        }

        $this->connection = new Connection(
            $this->host,
            Request::getSession('username'),
            Request::getSession('password'),
            21,
            90,
            true
        );

        $this->connection->open();

        $this->ftp = new FTPWrapper($this->connection);

        $ftpFactory = new FTPFactory;
        $this->ftpHelper = $ftpFactory->build($this->connection);

        $basicActionResult = $this->handleBasicAction();

        if(!is_null($basicActionResult)){
            $this->response->setData($basicActionResult);
            $this->response->flushJson();
        }

        $uploadResult = $this->handleUploads();

        if(!is_null($uploadResult)){
            $this->response->setData($uploadResult);
            $this->response->flushJson();
        }

        $this->handleDownloads();

        throw new \Exception('This action is not available right now.');
    }


    /**
     * Either creates or destroys user session
     * @return bool
     * @throws AuthException
     * @throws Exception
     */
    public function handleAuthentication(){
        if('logout' == $this->action){
            return $this->logout();
        }
        
        if('login' == $this->action){
            return $this->login();
        }
        
        if(!Request::getSession('username') && !Request::getSession('password')){
            throw new AuthException('You are not logged in.',401);
        }

        return null;
    }


    /**
     * Calls basic actions
     * @return mixed|null
     */
    public function handleBasicAction(){
        $actionName = Request::getApiParam('action');

        if(method_exists($this, $actionName.'Action')){
            return call_user_func([$this, $actionName.'Action']);
        }

        return null;
    }

    /**
     * Upload files
     * @return bool
     * @throws Exception
     */
    public function handleUploads(){
        if (Request::getFile() && $dest = Request::getPost('destination')) {

            $errors = array();
            foreach (Request::getFile() as $file) {
                $filePath = $file['tmp_name'];
                
                if($file['error'] != UPLOAD_ERR_OK || empty($filePath)){
                    $errors[] = $file['name']. ' could not be uploaded. Error code: '.$file['error'];
                    continue;
                }

                $destPath = $dest .'/'. $file['name'];
                $result = $this->ftpHelper->upload(new File($destPath), $filePath);

                if (! $result)  {
                    $errors[] = $file['name'];
                }
            }

            if ($errors) {
                throw new Exception("Unknown error uploading: \n\n" . implode(", \n", $errors));
            }

            return isset($result) ? $result : true;
        }

        return null;
    }

    /**
     * Downloads the specified item
     * @throws Exception
     * @throws \Touki\FTP\Exception\DirectoryException
     */
    public function handleDownloads(){
        $download  = Request::getQuery('preview') === 'true' ? '' : 'attachment;';
        $filePath = Request::getQuery('path');

        if(empty($filePath)){
            return null;
        }

        $fileName = explode('/', $filePath);
        $fileName = end($fileName);

        $file = $this->ftpHelper->findFileByName($filePath);

        if(!$file instanceof File){
            throw new Exception('File could not be downloaded right now.');
        }

        $tmpFilePath = $this->_getTempFile();

        $this->ftpHelper->download($tmpFilePath, $file);

        if ($fileContent = @file_get_contents($tmpFilePath)) {
            $this->response->setData($fileContent);
            $this->response->setHeaders(array(
                'Content-Type' => @mime_content_type($tmpFilePath),
                'Content-disposition' => sprintf('%s filename="%s"', $download, $fileName)
            ));
        }

        $this->response->flush();
    }



    public function downloadMultipleAction(){
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

    /**
     * Check the credentials ang logs in the user
     * @return bool
     * @throws Exception
     */
    public function login(){
        $username = Request::getApiParam('username');
        $password = Request::getApiParam('password');

        $loginFtp = new Connection($this->host,$username,$password);

        if (!$loginFtp->open()) {
            throw new AuthException("Log in details are not correct.", 401);
        }

        Response::setSession('username',$username);
        Response::setSession('password',$password);

        return true;
    }

    /**
     * Destroys user session
     * @return bool
     */
    public function logout(){
        session_destroy();
        return true;
    }

    /**
     * Returns a list of files in the specified path
     * @return array|null
     * @throws Exception
     */
    public function listAction(){
        $dir = $this->ftpHelper->findDirectoryByName(Request::getApiParam('path'));
        
        if(!$dir instanceof  Directory){
            $dir = new Directory(Request::getApiParam('path'));
        }

        $list = $this->ftpHelper->findFilesystems($dir);
        
        return $this->_transform($list);
    }

    /**
     * Returns file contents
     * @return string
     * @throws Exception
     * @throws \Touki\FTP\Exception\DirectoryException
     */
    public function getContentAction(){
        $file = $this->ftpHelper->findFileByName(Request::getApiParam('item'));

        if(!$file){
            throw new Exception('File could not be read.');
        }

        $tempStorage = $this->_getTempFile();;
        
        $this->ftpHelper->download($tempStorage, $file);

        return file_get_contents($tempStorage);
    }

    /**
     * Saves changes to a file
     * @return bool
     */
    public function editAction(){
        $item = Request::getApiParam('item');
        $newContent = Request::getApiParam('content');

        $this->ftpHelper->upload(new File($item), $this->_getTempFile($newContent));

        return true;
    }

    /**
     * Changes file permissions
     * @return array|bool|int
     * @throws Exception
     */
    public function changePermissionsAction(){
        $items = Request::getApiParam('items');
        $permsCode = Request::getApiParam('permsCode');

        $permsCode = octdec(str_pad($permsCode, 4, '0', STR_PAD_LEFT));

        $errors = array();
        foreach($items as $item) {
            $result = $item ? $this->ftp->chmod($permsCode, $item) : false;
            if (! $result)  {
                $errors[] = $item . ' to ' . $permsCode;
            }
        }

        if ($errors) {
            throw new Exception("Unknown error changing file permissions: \n\n" . implode(", \n", $errors));
        }

        return isset($result) ? $result : [];
    }

    /**
     * Renames an item
     * @return bool
     * @throws Exception
     */
    public function renameAction(){
        $item = Request::getApiParam('item');
        $newItemPath = Request::getApiParam('newItemPath');
        $result = $this->ftp->rename($item, $newItemPath);
        if (! $result) {
            throw new Exception("Unknown error renaming this item");
        }
        return $result;
    }

    /**
     * Moves items to another directory
     * @return array|bool
     * @throws Exception
     */
    public function moveAction(){
        $items = Request::getApiParam('items');
        $newPath = Request::getApiParam('newPath');
        $errors = array();

        foreach($items as $item) {
            $fileName = explode('/', $item);
            $fileName = end($fileName);
            $finalPath = $newPath . '/' . $fileName;
            $result = $item ? $this->ftp->rename($item, $finalPath) : false;
            if (! $result)  {
                $errors[] = $item . ' to ' . $finalPath;
            }
        }
        if ($errors) {
            throw new Exception("Unknown error moving: \n\n" . implode(", \n", $errors));
        }

        return isset($result) ? $result : [];
    }

    /**
     * Removes a directory or a file
     * @throws Exception
     */
    public function removeAction(){
        $items = Request::getApiParam('items');
        $errors = array();

        if(is_array($items)) {
            foreach ($items as $item) {
                $dir = $this->ftpHelper->findDirectoryByName($item);

                if($dir instanceof Directory){
                    $this->ftpHelper->delete($dir,[FTP::RECURSIVE => true]);
                    continue;
                }

                $file = $this->ftpHelper->findFileByName($item);

                if($file instanceof File){
                    $this->ftpHelper->delete($file);
                    continue;
                }

                $errors[] = $item;
            }
        }

        if ($errors) {
            throw new Exception("Unknown error deleting: \n\n" . implode(", \n", $errors));
        }

        return true;
    }

    /**
     * Creates a directory
     * @return bool
     * @throws Exception
     */
    public function createFolderAction(){
        $newPath = Request::getApiParam('newPath');
        $result = $this->ftpHelper->create(new Directory($newPath));

        if (! $result) {
            throw new Exception("Unknown error creating this folder");
        }

        return $result;
    }

    /**
     * Extracts the files
     * @return bool
     * @throws Exception
     * @throws \Touki\FTP\Exception\DirectoryException
     */
    public function extractAction(){
        $item = Request::getApiParam('item');
        $destination = rtrim(Request::getApiParam('destination'),"/");
        $folderName = trim(Request::getApiParam('folderName'),"/");

        $file = $this->ftpHelper->findFileByName($item);

        if(!$file instanceof File){
            throw new Exception('File could not be downloaded right now.');
        }

        $tmpFilePath = $this->_getTempFile();
        $this->ftpHelper->download($tmpFilePath, $file);

        $extractDir = __DIR__."/../temp/".uniqid();
        mkdir($extractDir,0777,true);

        $adapter = $this->zip->getAdapterFor($this->_getExtension($item));

        $zip = $adapter->open($tmpFilePath);
        $extractedZip = $zip->extract($extractDir);


        $destination = $destination."/".$folderName;

        $destinationDir = new Directory($destination);
        $this->ftpHelper->create($destinationDir,[FTP::RECURSIVE => true]);

        foreach($extractedZip->getMembers() as $member){
            if($member->isDir()){
                $this->ftpHelper->create(new Directory(rtrim($destination."/".$member->getLocation(),"/")), [FTP::RECURSIVE => true, FTP::NON_BLOCKING => true]);
            }else{
                $fileLocation = $extractDir."/".$member->getLocation();
                if(file_exists($fileLocation)) {
                    $this->ftpHelper->upload(new File($destination . "/" . $member->getLocation()), $fileLocation, [FTP::NON_BLOCKING => true]);
                }
            }
        }

        return true;
    }
    
    public function _transform($item){
        if(is_array($item)){
            return array_map([$this,'_transform'],$item);
        }else{
            if($item instanceof Filesystem) {
                $filename = explode("/",$item->getRealpath());
                return [
                    'date' => $item->getMtime()->format("Y-m-d H:i:s"),
                    'name' => end($filename),
                    'rights' => $item->getOwnerPermissions()->getFlags(). $item->getGroupPermissions()->getFlags().$item->getGuestPermissions()->getFlags(),
                    'user' => $item->getOwner(),
                    'size' => $item->getSize(),
                    'type' => $item instanceof Directory ? 'dir' : 'file'
                ];
            }
            
            return null;
        }
    }

    public function _getTempFile($contents = null){
        $filename = tempnam(sys_get_temp_dir(), 'file-manager-');

        if($contents){
            $fw = fopen($filename, 'w+');
            fwrite($fw, $contents);
            fclose($fw);
        }

        return $filename;
    }

    public function _getExtension($item){

        $extensions = explode(".",$item);

        if(count($extensions) <= 1){
            return '';
        }

        $extensions = array_slice($extensions,-2);

        if($extensions[0] == 'tar'){
            return implode('.', $extensions);
        }

        return end($extensions);

    }
}