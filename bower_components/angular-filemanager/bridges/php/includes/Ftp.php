<?php

namespace PHPClassic;

/**
 * Ftp wrapper lib
 * @BETA
 * @author Jonas Sciangula <joni2back {at} gmail.com>
 */
class Ftp
{
    public static $initialized = false;

    protected $_hostname  = 'localhost';
    protected $_username  = '';
    protected $_password  = '';
    protected $_port      = 21;
    protected $_timeout   = 90;
    protected $_passive   = true;
    protected $_debug     = false;
    protected $_conn   = false;
    protected $_ssl   = false;

    /**
     * Sets the initial Ftp filename and local data.
     *
     * @param   array  The settings
     * @return  void
     */
    public function __construct(array $config)
    {
        // Prep the hostname
        $this->_hostname = preg_replace('|.+?://|', '', $config['hostname']);
        $this->_username = $config['username'];
        $this->_password = $config['password'];
        $this->_timeout  = isset($config['timeout']) ? (int) $config['timeout'] : $this->_timeout;
        $this->_port     = isset($config['port']) ? (int) $config['port'] : $this->_port;
        $this->_passive  = isset($config['passive']) ? (bool) $config['passive'] : $this->_passive;
        $this->_ssl      = isset($config['ssl']) ? (bool) $config['ssl'] : $this->_ssl;
        $this->_debug    = isset($config['debug']) ? (bool) $config['debug'] : $this->_debug;

        static::$initialized = true;
    }

    // --------------------------------------------------------------------

    /**
     * FTP Connect
     *
     * @access	public
     * @param	array	 the connection values
     * @return	bool
     */
    public function connect()
    {
        if ($this->_ssl === true) {
            if (! function_exists('ftp_ssl_connect')) {
                throw new \RuntimeException('ftp_ssl_connect() function is missing.');
            }
            $this->_conn = @ftp_ssl_connect($this->_hostname, $this->_port, $this->_timeout);
        } else {
            $this->_conn = @ftp_connect($this->_hostname, $this->_port, $this->_timeout);
        }

        if ($this->_conn === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - Unable to establish a connection');
            }
            return false;
        }

        if (! $this->_login()) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - Unable to login');
            }
        }

        // Set passive mode if needed
        if ($this->_passive == true) {
            ftp_pasv($this->_conn, true);
        }

        return $this;
    }

    // --------------------------------------------------------------------

    /**
     * FTP Login
     *
     * @return	bool
     */
    protected function _login()
    {
        return @ftp_login($this->_conn, $this->_username, $this->_password);
    }

    // --------------------------------------------------------------------

    /**
     * Validates the connection ID
     *
     * @return	bool
     */
    protected function _isConnected()
    {
        if (! is_resource($this->_conn)) {
            if ($this->_debug == true) {
                throw new \InvalidArgumentException('Invalid connection');
            }
            return false;
        }
        return true;
    }

    // --------------------------------------------------------------------


    /**
     * Change directory
     *
     * The second parameter lets us momentarily turn off debugging so that
     * this function can be used to test for the existence of a folder
     * without throwing an error.  There's no FTP equivalent to is_dir()
     * so we do it by trying to change to a particular directory.
     * Internally, this parameter is only used by the "mirror" function below.
     *
     * @access	public
     * @param	string
     * @param	bool
     * @return	bool
     */
    public function changeDir($path = '')
    {
        if ($path == '' or ! $this->_isConnected()) {
            return false;
        }

        $result = @ftp_chdir($this->_conn, $path);

        if ($result === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - Unable to change the directory');
            }
            return false;
        }

        return true;
    }

    // --------------------------------------------------------------------

    /**
     * Create a directory
     *
     * @access	public
     * @param	string
     * @return	bool
     */
    public function mkdir($path, $permissions = null)
    {
        if (! $this->_isConnected()) {
            return false;
        }

        $result = @ftp_mkdir($this->_conn, $path);

        if ($result === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - Unable to create directory');
            }
            return false;
        }

        // Set file permissions if needed
        if ($permissions !== null) {
            $this->chmod($path, (int) $permissions);
        }

        return true;
    }

    // --------------------------------------------------------------------

    /**
     * Upload a file to the server
     *
     * @access	public
     * @param	string
     * @param	string
     * @param	string
     * @return	bool
     */
    public function upload($localPath, $remotePath, $mode = 'auto', $permissions = null)
    {
        if (! $this->_isConnected()) {
            return false;
        }

        if (! is_file($localPath)) {
            throw new \Exception('FTP - FileAccess - No source file');
        }

        // Set the mode if not specified
        if ($mode == 'auto') {
            // Get the file extension so we can set the upload type
            $ext = pathinfo($localPath, PATHINFO_EXTENSION);
            $mode = $this->_settype($ext);
        }

        $mode = ($mode == 'ascii') ? FTP_ASCII : FTP_BINARY;

        $result = @ftp_put($this->_conn, $remotePath, $localPath, $mode);

        if ($result === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - Unable to upload');
            }
            return false;
        }

        // Set file permissions if needed
        if ($permissions !== null) {
            $this->chmod($remotePath, (int) $permissions);
        }

        return true;
    }

    // --------------------------------------------------------------------

    /**
     * Download a file from a remote server to the local server
     *
     * @access	public
     * @param	string
     * @param	string
     * @param	string
     * @return	bool
     */
    public function download($remotePath, $localPath, $mode = 'auto')
    {
        if (! $this->_isConnected()) {
            return false;
        }

        // Set the mode if not specified
        if ($mode == 'auto') {
            // Get the file extension so we can set the upload type
            $ext = pathinfo($remotePath, PATHINFO_BASENAME);
            $mode = $this->_settype($ext);
        }

        $mode = ($mode == 'ascii') ? FTP_ASCII : FTP_BINARY;

        $result = @ftp_get($this->_conn, $localPath, $remotePath, $mode);

        if ($result === false) {
            if ($this->_debug === true) {
                throw new \Exception('FTP - FileAccess - Unable to download');
            }
            return false;
        }

        return true;
    }

    // --------------------------------------------------------------------

    /**
     * Rename (or move) a file
     *
     * @access	public
     * @param	string
     * @param	string
     * @param	bool
     * @return	bool
     */
    public function rename($oldFile, $newFile, $move = false)
    {
        if (! $this->_isConnected()) {
            return false;
        }
        $result = @ftp_rename($this->_conn, $oldFile, $newFile);

        if ($result === false) {
            if ($this->_debug == true) {
                $msg = ($move == false) ? 'Unable to rename' : 'Unable to move';

                throw new \Exception($msg);
            }
            return false;
        }

        return true;
    }

    // --------------------------------------------------------------------

    /**
     * Move a file
     *
     * @access	public
     * @param	string
     * @param	string
     * @return	bool
     */
    public function move($oldFile, $newFile)
    {
        return $this->rename($oldFile, $newFile, true);
    }

    // --------------------------------------------------------------------

    /**
     * Rename (or move) a file
     *
     * @access	public
     * @param	string
     * @return	bool
     */
    function deleteFile($filepath)
    {
        if (! $this->_isConnected()) {
            return false;
        }

        $result = @ftp_delete($this->_conn, $filepath);
        $error = error_get_last();
        if (isset($error['message']) && preg_match('/(Forbidden filename|denied)$/', $error['message'])) {
            throw new \Exception('FTP - FileAccess - Unable to delete file, permission denied');
        }

        if ($result === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - Unable to delete file');
            }
            return false;
        }

        return true;
    }

    // --------------------------------------------------------------------

    /**
     * Delete a folder and recursively delete everything (including sub-folders)
     * containted within it.
     *
     * @access	public
     * @param	string
     * @return	bool
     */
    function deleteDir($filepath)
    {
        if (! $this->_isConnected()) {
            return false;
        }

        // Add a trailing slash to the file path if needed
        $filepath = preg_replace("/(.+?)\/*$/", "\\1/", $filepath);
        $list = $this->listFiles($filepath);
        if ($list !== false and count($list) > 0) {
            foreach ($list as $item) {
                // If we can't delete the item it's probaly a folder so
                // we'll recursively call delete_dir()
                if (! @ftp_delete($this->_conn, $item)) {
                    $error = error_get_last();
                    if (isset($error['message']) && preg_match('/(Forbidden filename|denied)$/', $error['message'])) {
                        throw new \Exception('FTP - FileAccess - Unable to delete some file in this directory, permission denied');
                    }
                    if (! preg_match('/\/\.\.|\/\.$/', $item)) {
                        $this->deleteDir($item);
                    }
                }
            }
        }

        $result = @ftp_rmdir($this->_conn, $filepath);

        if ($result === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - Unable to delete dir');
            }
            return false;
        }

        return true;
    }

    // --------------------------------------------------------------------

    /**
     * Set file permissions
     *
     * @access	public
     * @param	string 	the file path
     * @param	string	the permissions
     * @return	bool
     */
    public function chmod($path, $perm)
    {
        if (! $this->_isConnected()) {
            return false;
        }

        // Permissions can only be set when running PHP 5
        if (! function_exists('ftp_chmod')) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - CHMOD function does not exist');
            }
            return false;
        }

        $result = @ftp_chmod($this->_conn, $perm, $path);

        if ($result === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - Unable to CHMOD');
            }
            return false;
        }

        return true;
    }

    // --------------------------------------------------------------------

    /**
     * FTP List files in the specified directory
     *
     * @access	public
     * @return	array
     */
    public function listFiles($path = '.')
    {
        if (! $this->_isConnected()) {
            return false;
        }

        $result = ftp_nlist($this->_conn, $path);
        if ($result === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - Unable to retreive the directory');
            }
            return false;
        }

        return $result;
    }

    // ------------------------------------------------------------------------

    /**
     * Read a directory and recreate it remotely
     *
     * This function recursively reads a folder and everything it contains (including
     * sub-folders) and creates a mirror via FTP based on it.  Whatever the directory structure
     * of the original file path will be recreated on the server.
     *
     * @access	public
     * @param	string	path to source with trailing slash
     * @param	string	path to destination - include the base folder with trailing slash
     * @return	bool
     */
    public function mirror($localPath, $remotePath)
    {
        if (! $this->_isConnected()) {
            return false;
        }

        // Open the local file path
        if ($fp = @opendir($localPath)) {
            // Attempt to open the remote file path.
            if (! $this->changeDir($remotePath, true)) {
                // If it doesn't exist we'll attempt to create the direcotory
                if (! $this->mkdir($remotePath) or ! $this->changeDir($remotePath)) {
                    return false;
                }
            }

            // Recursively read the local directory
            while (false !== ($file = readdir($fp))) {
                if (@is_dir($localPath.$file) and substr($file, 0, 1) != '.') {
                    $this->mirror($localPath.$file."/", $remotePath.$file."/");
                } elseif (substr($file, 0, 1) != ".") {
                    // Get the file extension so we can se the upload type
                    $ext = pathinfo($file, PATHINFO_EXTENSION);
                    $mode = $this->_settype($ext);

                    $this->upload($localPath.$file, $remotePath.$file, $mode);
                }
            }
            return true;
        }

        return false;
    }

    // --------------------------------------------------------------------

    /**
     * Set the upload type
     *
     * @param	string
     * @return	string
     */
    protected function _settype($ext)
    {
        $textTypes = array(
            'txt',
            'text',
            'php',
            'phps',
            'php4',
            'js',
            'css',
            'htm',
            'html',
            'phtml',
            'shtml',
            'log',
            'xml'
        );

        return in_array($ext, $textTypes) ? 'ascii' : 'binary';
    }

    // ------------------------------------------------------------------------

    /**
     * Close the connection
     *
     * @access	public
     * @return	void
     */
    public function close()
    {
        if (! $this->_isConnected()) {
            return false;
        }

        @ftp_close($this->_conn);
    }

    // ------------------------------------------------------------------------

    /**
     * Close the connection when the class is unset
     *
     * @access	public
     * @return	void
     */
    public function  __destruct()
    {
        $this->close();
    }

    /**
     * Overriden
     *
     * @access	public
     * @return	@api
     */
    public function getName()
    {
        return;
    }

    /**
     *
     * @access	public
     * @return	@api
     */
    public function isWindows()
    {
        return 'Windows_NT' === ftp_systype($this->_conn);
    }

    /**
     * FTP List files in the specified directory
     *
     * @access	public
     * @return	array
     */
    public function listFilesRaw($path = '.', $onlyDirectories = false, array $excludeIf = array('.', '..'), $includeExtensionFileOnlyIf = array())
    {
        if (! $this->_isConnected()) {
            return false;
        }
        $result = false;
        if (is_array($children = @ftp_rawlist($this->_conn, $path))) {
            $items = array();
            $folder = array();
            $bOnlyExtensions = (count($includeExtensionFileOnlyIf) > 0)?true:false;
            foreach ($children as $ftpLine) {
                $file = $this->isWindows() ?
                    $this->_buildFileWindows($ftpLine) :
                    $this->_buildFileLinux($ftpLine);

                if ($onlyDirectories && $file['type'] !== 'dir') {
                    continue;
                }

                if (preg_match('/^(mail \-\>)/', $file['name'])) {
                    continue;
                }

                if (! in_array($file['name'], $excludeIf)) {
                    if ($file['type'] === 'dir') {
                        $folder[$file['name']] = $file;
                    } elseif (!$bOnlyExtensions || $bOnlyExtensions && in_array(pathinfo($file['name'], PATHINFO_EXTENSION), $includeExtensionFileOnlyIf)) {
                        $items[$file['name']] = $file;
                    }
                }
            }
            ksort($folder);
            ksort($items);
            $result = array_merge(array_values($folder), array_values($items));
        }
        if ($result === false) {
            if ($this->_debug == true) {
                throw new \Exception('FTP - FileAccess - Unable to fetch the directory');
            }
            return false;
        }

        return $result;
    }
    /**
     * Generate file item from a raw ftp line
     *
     * @access	public
     * @return	array
     */
    protected function _buildFileWindows($ftpLine)
    {
        $chunks = null;
        preg_match("/([0-9]{2})-([0-9]{2})-([0-9]{2}) +([0-9]{2}):([0-9]{2})(AM|PM) +([0-9]+|<DIR>) +(.+)/", $ftpLine, $chunks);

        $item = array();
        if (is_array($chunks)) {
            if ($chunks[3] < 70) {
                $chunks[3] += 2000;
            } else {
                $chunks[3] += 1900;
            }

            $item['type'] = $chunks[7] === "<DIR>" ? 'dir' : 'file';
            $item['size'] = $chunks[7] === "<DIR>" ? 0 : $chunks[7];
            $item['month'] = $chunks[1];
            $item['day'] = $chunks[2];
            $item['time'] = $chunks[3];
            $item['name'] = $chunks[8];
            $item['number'] = $item['user'] = $item['rights'] = $item['group'] = null;
            return $item;
        }
    }

    /**
     * Generate file item from a raw ftp line
     *
     * @access	public
     * @return	array
     */
    protected function _buildFileLinux($ftpLine)
    {
        $chunks = preg_split("/ +/", $ftpLine);
            @list(
                $item['rights'], $item['number'], $item['user'], $item['group'],
                $item['size'], $item['month'], $item['day'], $item['time']
            ) = $chunks;
            $item['type'] = $chunks[0]{0} === 'd' ? 'dir' : 'file';
            array_splice($chunks, 0, 8);
            $item['name'] = $itemName = implode(" ", $chunks);
        return $item;
    }

    /**
     * FTP Delete a file or directory
     *
     * @access	public
     * @return	bool
     */
    public function delete($path)
    {
        $validateDenied = function($oExp) {
            if (preg_match('/denied/i', $oExp->getMessage())) {
                throw $oExp;
            }
        };
        try {
            $result = $this->deleteFile($path);
            if ($result) {
                return $result;
            }
        } catch (\Exception $oExp) {
            $validateDenied($oExp);
        }

        return $this->deleteDir($path);
    }

    /**
     * @param int $mode
     * @return int
     */
    public static function translateChmodCode($mode)
    {
        return octdec(str_pad($mode, 4, '0', STR_PAD_LEFT));
    }

}

