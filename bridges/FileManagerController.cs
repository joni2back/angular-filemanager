using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace YourNameSpace
{
    public class FileManagerController : Controller
    {
        private string FilePath = "~/Test/";

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult List(string path)
        {
            var tmpPath = new DirectoryInfo(HttpContext.Request.MapPath(FilePath + path.TrimStart('/')));

            var fileList = tmpPath.GetFiles("*.jpg").Select(a => new
            {
                name = a.Name,
                rights = "-rw-r--r--",
                size = "13224",
                date = a.CreationTime.ToShortDateString(),
                type = "file"
            });

            var tmpResult = fileList.Concat(tmpPath.GetDirectories().Select(a => new
            {
                name = a.Name,
                rights = "-rw-r--r--",
                size = "13224",
                date = a.CreationTime.ToShortDateString(),
                type = "dir"
            }));


            return Json(new
            {
                result = tmpResult
            });
        }

        public ActionResult Rename(string item, string newItemPath)
        {
            try
            {
                bool pathIsDirectory;
                if (PathExist(FilePath + item.TrimStart('/'), out pathIsDirectory))
                {
                    if (pathIsDirectory)
                        Directory.Move(HttpContext.Request.MapPath(FilePath + item.TrimStart('/')),
                                       HttpContext.Request.MapPath(FilePath + newItemPath.TrimStart('/')));
                    else
                    {
                        System.IO.File.Copy(HttpContext.Request.MapPath(FilePath + item.TrimStart('/')),
                                            HttpContext.Request.MapPath(FilePath + newItemPath.TrimStart('/')));

                        System.IO.File.Delete(HttpContext.Request.MapPath(FilePath + item.TrimStart('/')));
                    }

                    return Success();

                }
            }
            catch
            { }

            return Failed();
        }

        private bool PathExist(string relativeUrl, out bool pathIsDirectory)
        {
            var attr = System.IO.File.GetAttributes(HttpContext.Request.MapPath(relativeUrl));

            if ((attr & FileAttributes.Directory) == FileAttributes.Directory)
            {
                pathIsDirectory = true;
                return Directory.Exists(HttpContext.Request.MapPath(relativeUrl));
            }

            pathIsDirectory = false;
            return System.IO.File.Exists(HttpContext.Request.MapPath(relativeUrl));
        }

        private JsonResult Success()
        {
            return Json(
                        new
                        {
                            success = true,
                            error = ""
                        });
        }

        private JsonResult Failed()
        {
            return Json(
                 new
                 {
                     success = false,
                     error = "در تغییر نام خطایی بوجود آمد"
                 });
        }

        [HttpPost]
        public ActionResult Upload()
        {
            try
            {
                foreach (string item in Request.Files)
                {
                    var file = Request.Files[item];

                    //Save file content goes here
                    if (file != null && file.ContentLength > 0)
                    {
                        file.SaveAs(Request.MapPath(FilePath + (Request["destination"] ?? "").TrimStart('/') + "/" + file.FileName.TrimStart('/')));
                    }
                }

                return Success();
            }
            catch (Exception)
            { }

            return Failed();
        }

        public ActionResult RemoveUrl(string[] items)
        {
            try
            {
                foreach (var item in items)
                {
                    var tmpPath = FilePath + item.TrimStart('/');
                    bool pathIsDirectory;

                    var itemExist = PathExist(tmpPath, out pathIsDirectory);

                    if (itemExist && !pathIsDirectory)
                        System.IO.File.Delete(Request.MapPath(tmpPath));
                    else if (itemExist)
                        Directory.Delete(Request.MapPath(tmpPath));
                }

                return Success();
            }
            catch (Exception)
            { }

            return Failed();
        }

        public ActionResult CreateFolder(string newPath)
        {
            try
            {
                bool pathIsDirectory;

                Directory.CreateDirectory(Request.MapPath(FilePath + newPath.TrimStart('/')));

                if (PathExist(FilePath + newPath.TrimStart('/'), out pathIsDirectory))
                    return Success();
            }
            catch (Exception)
            { }

            return Failed();
        }

        public ActionResult Download(string path)
        {
            try
            {
                bool pathIsDirectory;
                if (PathExist(FilePath + path.TrimStart('/'), out pathIsDirectory))
                {
                    var fileBytes = System.IO.File.ReadAllBytes(Request.MapPath(FilePath + path.TrimStart('/')));
                    var fileName = Path.GetFileName(path);

                    return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, fileName);
                }
            }
            catch (Exception)
            { }

            return HttpNotFound();
        }
    }
}