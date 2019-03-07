#!/usr/bin/lua

local uci = require "uci" 
local fs = require "nixio.fs"
local u_c = uci.cursor()
local basepath = u_c.get("filemanager","config","basedir")

local _M = {}

local bp = basepath:match("(.*)/")
if bp and bp ~= "" then
  basepath = bp 
end
_M.basepath = basepath;

function _M.is_in_dir(file, dir)
  if file == dir then
    return true
  else   
    return file:sub(1, #dir) == dir
  end  
end

function _M.path_valid(path)
  return _M.is_in_dir(path,_M.basepath) and fs.access(path,"r")
end

function _M.dir_path_valid(path)
  return _M.is_in_dir(path,_M.basepath) and fs.stat(path,"type")=="dir" and fs.access(path,"w")
end

function _M.new_path_valid(path)
  local dirpath = fs.dirname(path)
  return _M.is_in_dir(dirpath,_M.basepath) and fs.access(dirpath,"w")
end

function _M.make_path(path)
  local realpath = fs.realpath(_M.basepath..'/'..path)
  if _M.path_valid(realpath) then
    return realpath
  else
    return nil
  end    
end

function _M.make_new_path(path)
  local realpath = fs.realpath(fs.dirname(_M.basepath..'/'..path))..'/'..fs.basename(path)
  if _M.new_path_valid(realpath) then
    return realpath
  else
    return nil
  end    
end

function _M.make_dir_path(path)
  local realpath = fs.realpath(_M.basepath..'/'..path)
  if _M.dir_path_valid(realpath) then
    return realpath
  else
    return nil
  end    
end

function _M.rm(item)
  local ftype = fs.stat(item,"type")
  if ftype == "reg" then
    return fs.remove(item)
  elseif ftype == "dir" then
    local dir = fs.dir(item)
    for file in dir do
      if not _M.rm(item..'/'..file) then
        return false
      end
    end
    return fs.rmdir(item)  
  else
    return false  
  end
end

function _M.chmod(item,mode,recursive)
  local result = fs.chmod(item,mode)
  if result and recursive then
    local dir = fs.dir(item)
    if dir then
      for file in dir do
        local ftype = fs.stat(item..'/'..file,"type")
        if ftype == "dir" then
          result = _M.chmod(item..'/'..file,mode,recursive)
        elseif ftype == "reg" then
          result = _M.chmod(item..'/'..file,string.gsub(mode,"x","-"),false)  
        end
        if not result then
          break
        end  
      end
    end
  end
  return result
end

return _M
