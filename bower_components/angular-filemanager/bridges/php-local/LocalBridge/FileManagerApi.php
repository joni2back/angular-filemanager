<?php
namespace AngularFilemanager\LocalBridge;

/**
 * File Manager API Class
 *
 * Made for PHP Local filesystem bridge for angular-filemanager to handle file manipulations
 * @author       Jakub Ďuraš <jakub@duras.me> 
 */
class FileManagerApi
{
    private $basePath = null;

    private $translate;

    public function __construct($basePath = null, $lang = 'en', $muteErrors = true)
    {
        if ($muteErrors) {
            ini_set('display_errors', 0);
        }

        $this->basePath = $basePath ?: dirname(__DIR__);
        $this->translate = new Translate($lang);
    }

    public function postHandler($query, $request, $files)
    {
        $t = $this->translate;
        
        // Probably file upload
        if (!isset($request['action']) && (isset($_SERVER["CONTENT_TYPE"]) && strpos($_SERVER["CONTENT_TYPE"], 'multipart/form-data') !== false)) {
            $uploaded = $this->uploadAction($request['destination'], $files);
            if ($uploaded === true) {
                $response = $this->simpleSuccessResponse();
            } else {
                $response = $this->simpleErrorResponse($t->upload_failed);
            }

            return $response;
        }

        switch ($request['action']) {
            case 'list':
                $list = $this->listAction($request['path']);

                if (!is_array($list)) {
                    $response = $this->simpleErrorResponse($t->listing_filed);
                } else {
                    $response = new Response();
                    $response->setData([
                        'result' => $list
                    ]);
                }
                break;

            case 'rename':
                $renamed = $this->renameAction($request['item'], $request['newItemPath']);
                if ($renamed === true) {
                    $response = $this->simpleSuccessResponse();
                } elseif ($renamed === 'notfound'){
                    $response = $this->simpleErrorResponse($t->file_not_found);
                } else {
                    $response = $this->simpleErrorResponse($t->renaming_failed);
                }
                break;

            case 'move':
                $moved = $this->moveAction($request['items'], $request['newPath']);
                if ($moved === true) {
                    $response = $this->simpleSuccessResponse();
                } else {
                    $response = $this->simpleErrorResponse($t->moving_failed);
                }
                break;

            case 'copy':
                $copied = $this->copyAction($request['items'], $request['newPath']);
                if ($copied === true) {
                    $response = $this->simpleSuccessResponse();
                } else {
                    $response = $this->simpleErrorResponse($t->copying_failed);
                }
                break;

            case 'remove':
                $removed = $this->removeAction($request['items']);
                if ($removed === true) {
                    $response = $this->simpleSuccessResponse();
                } elseif ($removed === 'notempty') {
                    $response = $this->simpleErrorResponse($t->removing_failed_directory_not_empty);
                } else {
                    $response = $this->simpleErrorResponse($t->removing_failed);
                }
                break;

            case 'edit':
                $edited = $this->editAction($request['item'], $request['content']);
                if ($edited !== false) {
                    $response = $this->simpleSuccessResponse();
                } else {
                    $response = $this->simpleErrorResponse($t->saving_failed);
                }
                break;

            case 'getContent':
                $content = $this->getContentAction($request['item']);
                if ($content !== false) {
                    $response = new Response();
                    $response->setData([
                        'result' => $content
                    ]);
                } else {
                    $response = $this->simpleErrorResponse($t->file_not_found);
                }
                break;

            case 'createFolder':
                $created = $this->createFolderAction($request['newPath']);
                if ($created === true) {
                    $response = $this->simpleSuccessResponse();
                } elseif ($created === 'exists') {
                    $response = $this->simpleErrorResponse($t->folder_already_exists);
                } else {
                    $response = $this->simpleErrorResponse($t->folder_creation_failed);
                }
                break;

            case 'changePermissions':
                $changed = $this->changePermissionsAction($request['items'], $request['perms'], $request['recursive']);
                if ($changed === true) {
                    $response = $this->simpleSuccessResponse();
                } elseif ($changed === 'missing') {
                    $response = $this->simpleErrorResponse($t->file_not_found);
                } else {
                    $response = $this->simpleErrorResponse($t->permissions_change_failed);
                }
                break;

            case 'compress':
                $compressed = $this->compressAction($request['items'], $request['destination'], $request['compressedFilename']);
                if ($compressed === true) {
                    $response = $this->simpleSuccessResponse();
                } else {
                    $response = $this->simpleErrorResponse($t->compression_failed);
                }
                break;

            case 'extract':
                $extracted = $this->extractAction($request['destination'], $request['item'], $request['folderName']);
                if ($extracted === true) {
                    $response = $this->simpleSuccessResponse();
                } elseif ($extracted === 'unsupported') {
                    $response = $this->simpleErrorResponse($t->archive_opening_failed);
                } else {
                    $response = $this->simpleErrorResponse($t->extraction_failed);
                }
                break;
            
            default:
                $response = $this->simpleErrorResponse($t->function_not_implemented);
                break;
        }

        return $response;
    }

    public function getHandler($queries)
    {
        $t = $this->translate;
        
        switch ($queries['action']) {
            case 'download':
                $downloaded = $this->downloadAction($queries['path']);
                if ($downloaded === true) {
                    exit;
                } else {
                    $response = $this->simpleErrorResponse($t->file_not_found);
                }
                
                break;
            
            default:
                $response = $this->simpleErrorResponse($t->function_not_implemented);
                break;
        }

        return $response;
    }

    private function downloadAction($path)
    {
        $path = $this->basePath . $path;

        if (! file_exists($path)) {
            return false;
        }

        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($path));
        readfile($path);

        return true;
    }

    private function uploadAction($path, $files)
    {
        $path = $this->basePath . $path;

        foreach ($_FILES as $file) {
            $uploaded = move_uploaded_file(
                $file['tmp_name'], 
                rtrim($path, '/') . '/' . $file['name']
            );
            if ($uploaded === false) {
                return false;
            }
        }

        return true;
    }    

    private function listAction($path)
    {
        $files = glob($this->basePath . rtrim($path, '/') . '/*');

        $files = array_map(function($file){
            $date = new \DateTime('@' . filemtime($file));
            return [
                'name' => utf8_encode(basename($file)),
                'rights' => $this->parsePerms(fileperms($file)),
                'size' => filesize($file),
                'date' => $date->format('Y-m-d H:i:s'),
                'type' => is_dir($file) ? 'dir' : 'file'
            ];
        }, $files);

        return $files;
    }

    private function renameAction($oldPath, $newPath)
    {
        $oldPath = $this->basePath . $oldPath;
        $newPath = $this->basePath . $newPath;

        if (! file_exists($oldPath)) {
            return 'notfound';
        }

        return rename($oldPath, $newPath);
    }

    private function moveAction($oldPaths, $newPath)
    {
        $newPath = $this->basePath . rtrim($newPath, '/') . '/';

        foreach ($oldPaths as $oldPath) {
            if (! file_exists($this->basePath . $oldPath)) {
                return false;
            }

            $renamed = rename($this->basePath . $oldPath, $newPath . basename($oldPath));
            if ($renamed === false) {
                return false;
            }
        }

        return true;
    }

    private function copyAction($oldPaths, $newPath)
    {
        $newPath = $this->basePath . rtrim($newPath, '/') . '/';

        foreach ($oldPaths as $oldPath) {
            if (! file_exists($this->basePath . $oldPath)) {
                return false;
            }

            $copied = copy(
                $this->basePath . $oldPath, 
                $newPath . basename($oldPath)
            );
            if ($copied === false) {
                return false; 
            }
        }

        return true;
    }

    private function removeAction($paths)
    {
        foreach ($paths as $path) {
            $path = $this->basePath . $path;

            if (is_dir($path)) {
                $dirEmpty = (new \FilesystemIterator($path))->valid();

                if ($dirEmpty) {
                    return 'notempty';
                } else {
                    $removed = rmdir($path);
                }
            } else {
                $removed = unlink($path);
            }

            if ($removed === false) {
                return false;
            }
        }

        return true;
    }

    private function editAction($path, $content)
    {
        $path = $this->basePath . $path;
        return file_put_contents($path, $content);
    }

    private function getContentAction($path)
    {
        $path = $this->basePath . $path;

        if (! file_exists($path)) {
            return false;
        }

        return file_get_contents($path);
    }

    private function createFolderAction($path)
    {
        $path = $this->basePath . $path;

        if (file_exists($path) && is_dir($path)) {
            return 'exists';
        }

        return mkdir($path);
    }

    private function changePermissionsAction($paths, $permissions, $recursive)
    {
        foreach ($paths as $path) {
            if (!file_exists($this->basePath . $path)) return 'missing';

            if (is_dir($path) && $recursive === true) {
                $iterator = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($path), 
                    RecursiveIteratorIterator::SELF_FIRST
                );

                foreach($iterator as $item) {
                    $changed = chmod($this->basePath . $item, octdec($permissions));
                    
                    if ($changed === false) {
                        return false;
                    }
                }
            }

            return chmod($this->basePath . $path, octdec($permissions));
        }
    }

    private function compressAction($paths, $destination, $archiveName)
    {
        $archivePath = $this->basePath . $destination . $archiveName;

        $zip = new ZipArchive();
        if ($zip->open($archivePath, ZipArchive::CREATE) !== true) {
            return false;
        }

        foreach ($paths as $path) {
            $zip->addFile($this->basePath . $path, basename($path));
        }

        return $zip->close();
    }

    private function extractAction($destination, $archivePath, $folderName)
    {
        $archivePath = $this->basePath . $archivePath;
        $folderPath = $this->basePath . rtrim($destination, '/') . '/' . $folderName;

        $zip = new ZipArchive;
        if ($zip->open($archivePath) === false) {
            return 'unsupported';
        }

        mkdir($folderPath);
        $zip->extractTo($folderPath);
        return $zip->close();
    }

    private function simpleSuccessResponse()
    {
        $response = new Response();
        $response->setData([
            'result' => [
                'success' => true
            ]
        ]);

        return $response;
    }

    private function simpleErrorResponse($message)
    {
        $response = new Response();
        $response
            ->setStatus(500, 'Internal Server Error')
             ->setData([
                  'result' => [
                    'success' => false,
                    'error' => $message
                 ]
            ]);

        return $response;
    }

    private function parsePerms($perms)
    {
        if (($perms & 0xC000) == 0xC000) {
            // Socket
            $info = 's';
        } elseif (($perms & 0xA000) == 0xA000) {
            // Symbolic Link
            $info = 'l';
        } elseif (($perms & 0x8000) == 0x8000) {
            // Regular
            $info = '-';
        } elseif (($perms & 0x6000) == 0x6000) {
            // Block special
            $info = 'b';
        } elseif (($perms & 0x4000) == 0x4000) {
            // Directory
            $info = 'd';
        } elseif (($perms & 0x2000) == 0x2000) {
            // Character special
            $info = 'c';
        } elseif (($perms & 0x1000) == 0x1000) {
            // FIFO pipe
            $info = 'p';
        } else {
            // Unknown
            $info = 'u';
        }

        // Owner
        $info .= (($perms & 0x0100) ? 'r' : '-');
        $info .= (($perms & 0x0080) ? 'w' : '-');
        $info .= (($perms & 0x0040) ?
                    (($perms & 0x0800) ? 's' : 'x' ) :
                    (($perms & 0x0800) ? 'S' : '-'));

        // Group
        $info .= (($perms & 0x0020) ? 'r' : '-');
        $info .= (($perms & 0x0010) ? 'w' : '-');
        $info .= (($perms & 0x0008) ?
                    (($perms & 0x0400) ? 's' : 'x' ) :
                    (($perms & 0x0400) ? 'S' : '-'));

        // World
        $info .= (($perms & 0x0004) ? 'r' : '-');
        $info .= (($perms & 0x0002) ? 'w' : '-');
        $info .= (($perms & 0x0001) ?
                    (($perms & 0x0200) ? 't' : 'x' ) :
                    (($perms & 0x0200) ? 'T' : '-'));

        return $info;
    }
}
