<?php

namespace PHPClassic;

use Exception;

/**
 * This class allows you to use override default php exception handler
 *
 * @author Jonas Sciangula Street <joni2back {at} gmail.com>
 * @todo Method to set view template and remove html code from draw() method
 * @todo Avoid the use of highlight_string() to make php syntax highlight
 */

abstract class ExceptionCatcher
{

    /**
     * @param Exception $oExp
     */
    public static function handle(Exception $oExp)
    {
        echo static::draw($oExp);
    }

    /**
     * @param Exception $oExp
     * @return string
     */
    public static function draw(Exception $oExp)
    {
        $details = static::buildDetails($oExp);
        $content = sprintf('<h3>Exception: %s</h3>', $oExp->getMessage());
        $content .= sprintf('<h5>At: %s:%s</h5>', $oExp->getFile(), $oExp->getLine());
        $content .= sprintf('<h4>Trace</h4>');
        foreach ($details as $items) {
            if (isset($items['trace'])) {
                $content .= sprintf("<hr />%s:%d<br />\n", $items['file'], $items['line']);
                $content .= static::getHighlightedCode($items['trace'], true);
            }
        }
        return $content;
    }

    /**
     * @param array $trace
     * @return string
     */
    protected function getHighlightedCode(array $trace, $showLineNumber = false)
    {
        $content = '';
        foreach ($trace as $line) {
            if (! isset($line['lineContent'])) {
                return;
            }
            $content .= $showLineNumber ?
                sprintf("%d  %s\n", $line['lineNumber'], $line['lineContent']) :
                sprintf("%s\n", $line['lineContent']);
        }
        $str = highlight_string('<?php '. $content, true);
        return str_replace('&lt;?php&nbsp;', '', $str);
    }

    /**
     * @param Exception $oExp
     * @return array
     */
    protected function buildDetails(Exception $oExp)
    {
        $arr = array();
        $arr[] = static::getDetails($oExp->getFile(), $oExp->getLine());
        foreach ($oExp->getTrace() as $files) {
            $arr[] = static::getDetails($files['file'], $files['line']);
        }
        return $arr;
    }

    /**
     * @param string $file
     * @param int $line
     * @return array
     */
    protected function getDetails($file, $line)
    {
        $lines = file_get_contents($file); //validate
        $lines = explode("\n", $lines);
        $trace = array();
        foreach (range($line - 4, $line + 2) as $fetchLine) {
            if (isset($lines[$fetchLine])) {
                $n = strlen($fetchLine + 10);
                $lineKey = sprintf('%0'.$n.'d', $fetchLine + 1);
                $trace[$lineKey] = array(
                    'lineContent' => $lines[$fetchLine],
                    'lineNumber' => $lineKey
                );
            }
        }
        return array(
            'file' => $file,
            'line' => $line,
            'trace' => $trace,
        );
    }

    /**
     * @return void
     */
    public static function register()
    {
        set_exception_handler(array(__CLASS__, 'handle'));
    }

    /**
     * @return void
     */
    public static function unregister()
    {
        restore_exception_handler();
    }
}


