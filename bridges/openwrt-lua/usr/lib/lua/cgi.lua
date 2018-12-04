-- cgi util module

local uci = require("uci")
local u_c = uci.cursor()
local tmppath = u_c.get("filemanager","config","tmpdir")

local prevbuf = ""
local blocksize = 4096
local _M = {}

_M.statusmsg = {
   [200] = "OK",
   [206] = "Partial Content",
   [301] = "Moved Permanently",
   [302] = "Found",
   [304] = "Not Modified",
   [400] = "Bad Request",
   [403] = "Forbidden",
   [404] = "Not Found",
   [405] = "Method Not Allowed",
   [408] = "Request Time-out",
   [411] = "Length Required",
   [412] = "Precondition Failed",
   [416] = "Requested range not satisfiable",
   [500] = "Internal Server Error",
   [503] = "Server Unavailable",
}

-- call this function passing an empy table. use that table for successive calls.
function _M.new(req)
   req.content_length = os.getenv("CONTENT_LENGTH")
   req.request_method = os.getenv("REQUEST_METHOD")
   if req.request_method == "POST" then
      req.content_type, req.boundary = string.match(os.getenv("CONTENT_TYPE"),"^(multipart/form%-data); boundary=\"?(.+)\"?$")
      req.boundary = "--" .. req.boundary
   end
   -- this is useful only if you have /tmp on tmpfs like in openwrt. otherwise can be set to ""
   req.tempdir = tmppath
   req.post = {}
end

-- this function is needed to clean temp file since and hide implementation details
function _M.cleanup(req)
   for k, v in pairs(req.post) do
      for j, v in pairs(req.post[k]) do
         if req.post[k][j].tempname then
            os.remove(req.post[k][j].tempname) -- if file unused
            os.remove("/tmp/" .. string.match(req.post[k][j].tempname,"^" .. req.tempdir .. "(.+)"))
         end
      end
   end
end

-- del: delimiter
-- return chunk (string), found (boolean)
local function chunkread(del)
   local buf, found = 0
   local del = del or "\r\n"

   buf = io.read(math.max(0,blocksize + #del - #prevbuf))
   if prevbuf ~= "" then buf = prevbuf .. ( buf or "" ); prevbuf = "" end
   if not buf then return end

   s, e = string.find(buf,del,1,true)
   if s and e then
      found = 1
      prevbuf = string.sub(buf,e+1)
      buf = string.sub(buf,1,s-1)
   else
      prevbuf = string.sub(buf,math.min(blocksize,#buf)+1)
      buf = string.sub(buf,1,math.min(blocksize,#buf))
   end

   return buf, found
end


function _M.parse_request_body (req)
   local chunk, found, type, tempname, tempfile
   local param = {}

   -- read first boundary line
   chunk, found = chunkread(req.boundary)
   chunk, found = chunkread("\r\n")
   while chunk == "" do
      -- read part headers and get parameters value
      repeat
         chunk, found = chunkread("\r\n")
         if not found then return 400, "Malformed POST. Missing Part Header or Part Header too long." end
         string.gsub(chunk, ';%s*([^%s=]+)="(.-[^\\])"', function(k, v) param[k] = v end)
         param.type = param.type or string.match(chunk, "^Content%-Type: (.+)$")
      until chunk == ""

      -- prepare file data read
      if not param.name then return 400, "Malformed POST. Check Header parameters." end
      param.size=0
      param.tempname = req.tempdir .. string.match(os.tmpname(),  "^/tmp(.+)")
      tempfile = io.open(param.tempname, "w")

      -- read part body content until boundary
      repeat
         chunk, found = chunkread("\r\n" .. req.boundary)
         if not chunk then return 400, "Malformed POST. Incomplete Part received." end
         tempfile:write(chunk)
         param.size = param.size + #chunk
      until found
      tempfile:close()
      req.post[param.name] = req.post[param.name] or {}
      table.insert(req.post[param.name], 1, param)
      param = {}

      -- read after boundary. if CRLF ("") repeat. if "--" end POST processing
      chunk, found = chunkread("\r\n")
   end

   if found and chunk == "--" then return 0, "OK" end
   return 400, "Malformed POST. Boundary not properly ended with CRLF or --."
end

return _M
