"""
Python backend for angular-filemanager

The MIT License (MIT)

Copyright (c) 2016 Yihui Xiong

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
"""


import datetime
import json
import os
import shutil
import uuid
import stat
import zipfile
import tornado.web


def timestamp_to_str(timestamp, format_str='%Y-%m-%d %I:%M:%S'):
    date = datetime.datetime.fromtimestamp(timestamp)
    return date.strftime(format_str)


def filemode(mode):
    is_dir = 'd' if stat.S_ISDIR(mode) else '-'
    dic = {'7': 'rwx', '6': 'rw-', '5': 'r-x', '4': 'r--', '0': '---'}
    perm = str(oct(mode)[-3:])
    return is_dir + ''.join(dic.get(x, x) for x in perm)


def get_file_information(path):
    fstat = os.stat(path)
    if stat.S_ISDIR(fstat.st_mode):
        ftype = 'dir'
    else:
        ftype = 'file'

    fsize = fstat.st_size
    ftime = timestamp_to_str(fstat.st_mtime)
    fmode = filemode(fstat.st_mode)

    return ftype, fsize, ftime, fmode


def change_permissions_recursive(path, mode):
    for root, dirs, files in os.walk(path, topdown=False):
        for d in [os.path.join(root, d) for d in dirs]:
            os.chmod(d, mode)
        for f in [os.path.join(root, f) for f in files]:
            os.chmod(f, mode)


class FileManager:
    def __init__(self, root='/', show_dotfiles=True):
        self.root = os.path.abspath(root)
        self.show_dotfiles = show_dotfiles

    def list(self, request):
        path = os.path.abspath(self.root + request['path'])
        if not os.path.exists(path) or not path.startswith(self.root):
            return {'result': ''}

        files = []
        for fname in sorted(os.listdir(path)):
            if fname.startswith('.') and not self.show_dotfiles:
                continue

            fpath = os.path.join(path, fname)

            try:
                ftype, fsize, ftime, fmode = get_file_information(fpath)
            except Exception as e:
                continue

            files.append({
                'name': fname,
                'rights': fmode,
                'size': fsize,
                'date': ftime,
                'type': ftype,
            })

        return {'result': files}

    def rename(self, request):
        try:
            src = os.path.abspath(self.root + request['item'])
            dst = os.path.abspath(self.root + request['newItemPath'])
            print('rename {} {}'.format(src, dst))
            if not (os.path.exists(src) and src.startswith(self.root) and dst.startswith(self.root)):
                return {'result': {'success': 'false', 'error': 'Invalid path'}}

            shutil.move(src, dst)
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def copy(self, request):
        try:
            items = request['items']
            path = os.path.abspath(self.root + request['newPath'])
            if len(items) == 1 and 'singleFilename' in request:
                src = os.path.abspath(self.root + items[0])
                if not (os.path.exists(src) and src.startswith(self.root) and path.startswith(self.root)):
                    return {'result': {'success': 'false', 'error': 'File not found'}}

                shutil.copy(src, path)
            else:
                for item in items:
                    src = os.path.abspath(self.root + item)
                    if not (os.path.exists(src) and src.startswith(self.root) and path.startswith(self.root)):
                        return {'result': {'success': 'false', 'error': 'Invalid path'}}

                    shutil.copy(src, path)
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def move(self, request):
        try:
            items = request['items']
            path = os.path.abspath(self.root + request['newPath'])
            for item in items:
                src = os.path.abspath(self.root + item)
                if not (os.path.exists(src) and src.startswith(self.root) and path.startswith(self.root)):
                    return {'result': {'success': 'false', 'error': 'Invalid path'}}

                shutil.move(src, path)
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def remove(self, request):
        try:
            items = request['items']
            for item in items:
                path = os.path.abspath(self.root + item)
                if not (os.path.exists(path) and path.startswith(self.root)):
                    return {'result': {'success': 'false', 'error': 'Invalid path'}}

                if os.path.isdir(path):
                    shutil.rmtree(path)
                else:
                    os.remove(path)
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def edit(self, request):
        try:
            path = os.path.abspath(self.root + request['item'])
            if not path.startswith(self.root):
                return {'result': {'success': 'false', 'error': 'Invalid path'}}

            content = request['content']
            with open(path, 'w') as f:
                f.write(content)
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def getContent(self, request):
        try:
            path = os.path.abspath(self.root + request['item'])
            if not path.startswith(self.root):
                return {'result': {'success': 'false', 'error': 'Invalid path'}}

            with open(path, 'r') as f:
                content = f.read()
        except Exception as e:
            content = e.message

        return {'result': content}

    def createFolder(self, request):
        try:
            path = os.path.abspath(self.root + request['newPath'])
            if not path.startswith(self.root):
                return {'result': {'success': 'false', 'error': 'Invalid path'}}

            os.makedirs(path)
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def changePermissions(self, request):
        try:
            items = request['items']
            permissions = int(request['perms'], 8)
            recursive = request['recursive']
            print('recursive: {}, type: {}'.format(recursive, type(recursive)))
            for item in items:
                path = os.path.abspath(self.root + item)
                if not (os.path.exists(path) and path.startswith(self.root)):
                    return {'result': {'success': 'false', 'error': 'Invalid path'}}

                if recursive == 'true':
                    change_permissions_recursive(path, permissions)
                else:
                    os.chmod(path, permissions)
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def compress(self, request):
        try:
            items = request['items']
            path = os.path.abspath(os.path.join(self.root + request['destination'], request['compressedFilename']))
            if not path.startswith(self.root):
                return {'result': {'success': 'false', 'error': 'Invalid path'}}

            zip_file = zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED)
            for item in items:
                path = os.path.abspath(self.root + item)
                if not (os.path.exists(path) and path.startswith(self.root)):
                    continue

                if os.path.isfile(path):
                    zip_file.write(path, item)
                else:
                    zip_file.write(path, arcname=os.path.basename(path))

                    for root, dirs, files in os.walk(path):
                        if root != path:
                            zip_file.write(root, arcname=os.path.relpath(root, os.path.dirname(path)))
                        for filename in files:
                            zip_file.write(os.path.join(root, filename), arcname=os.path.join(os.path.relpath(root, os.path.dirname(path)), filename))                

            zip_file.close()
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def extract(self, request):
        try:
            src = os.path.abspath(self.root + request['item'])
            dst = os.path.abspath(self.root + request['destination'])
            if not (os.path.isfile(src) and src.startswith(self.root) and dst.startswith(self.root)):
                return {'result': {'success': 'false', 'error': 'Invalid path'}}

            zip_file = zipfile.ZipFile(src, 'r')
            zip_file.extractall(dst)
            zip_file.close()
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def upload(self, handler):
        try:
            destination = handler.get_body_argument('destination', default='/')
            for name in handler.request.files:
                fileinfo = handler.request.files[name][0]
                filename = fileinfo['filename']
                path = os.path.abspath(os.path.join(self.root, destination, filename))
                if not path.startswith(self.root):
                    return {'result': {'success': 'false', 'error': 'Invalid path'}}
                with open(path, 'wb') as f:
                    f.write(fileinfo['body'])
        except Exception as e:
            return {'result': {'success': 'false', 'error': e.message}}

        return {'result': {'success': 'true', 'error': ''}}

    def download(self, path):
        path = os.path.abspath(self.root + path)
        content = ''
        if path.startswith(self.root) and os.path.isfile(path):
            try:
                with open(path, 'rb') as f:
                    content = f.read()
            except Exception as e:
                pass
        return content

    def downloadMultiple(self, items, filename):
        temp_zip_filename = str(uuid.uuid4())
        zipfile_path = os.path.abspath(os.path.join(self.root, temp_zip_filename))
        zip_file = zipfile.ZipFile(zipfile_path, 'w', zipfile.ZIP_DEFLATED)
        for item in items:
            path = os.path.abspath(self.root + item)
            if not (os.path.exists(path) and path.startswith(self.root)):
                continue

            if os.path.isfile(path):
                zip_file.write(path, item)
            else:
                pass
        zip_file.close()     

        content = ''
        f = open(zipfile_path,'rb')
        content = f.read()
        f.close()
        os.remove(zipfile_path)
        return content


class FileManagerHandler(tornado.web.RequestHandler):
    def initialize(self, root='/', show_dotfiles=True):
        self.filemanager = FileManager(root, show_dotfiles)

    def get(self):

        action = self.get_query_argument('action', '')
        path = self.get_query_argument('path', '')
        items = self.get_query_arguments('items')
        toFilename = self.get_query_argument('toFilename', '')

        if action == 'download' and path:
            result = self.filemanager.download(path)
            self.write(result)
            
            file_name = os.path.basename(path)
            self.set_header('Content-Type', 'application/force-download')
            self.set_header('Content-Disposition', 'attachment; filename=%s' % file_name) 
        elif action == 'downloadMultiple' and len(items) > 0 and toFilename:
            result = self.filemanager.downloadMultiple(items,toFilename)
            self.write(result)
            
            file_name = os.path.basename(toFilename)
            self.set_header('Content-Type', 'application/force-download')
            self.set_header('Content-Disposition', 'attachment; filename=%s' % file_name) 
        else:
            pass

    def post(self):
        if self.request.headers.get('Content-Type').find('multipart/form-data') >= 0:
            result = self.filemanager.upload(self)
            self.write(json.dumps(result))
        else:
            try:
                request = tornado.escape.json_decode(self.request.body)
                if 'action' in request and hasattr(self.filemanager, request['action']):
                    method = getattr(self.filemanager, request['action'])
                    result = method(request)
                    self.write(json.dumps(result))
            except ValueError:
                pass


def main():
    import logging
    import tornado.ioloop

    logging.basicConfig(level=logging.DEBUG)

    handlers = [
        (r'/bridges/php/handler.php', FileManagerHandler, {'root': os.getcwd(), 'show_dotfiles': True}),
        (
            r'/(.*)',
            tornado.web.StaticFileHandler,
            {
                'path': os.path.join(os.path.dirname(__file__), '../../..'),
                'default_filename': 'index.html'
            }
        ),
    ]

    app = tornado.web.Application(handlers, debug=True)
    try:
        logging.debug('Open http://127.0.0.1:8000 to use the file manager')
        app.listen(8000)
        tornado.ioloop.IOLoop.instance().start()
    except Exception as e:
        print(e.message)

    tornado.ioloop.IOLoop.instance().stop()


if __name__ == '__main__':
    main()
