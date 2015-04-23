;(function() {
    angular.module('FileManagerApp').service('chmod', function () {

        var Chmod = function(initValue) {

            this.owner = this.getRwxObj();
            this.group = this.getRwxObj();
            this.others = this.getRwxObj();

            if (initValue) {
                var codes = isNaN(initValue) ?
                    this.convertfromCode(initValue):
                    this.convertfromOctal(initValue);

                if (! codes) {
                    throw new Error('Invalid input data');
                }

                this.owner = codes.owner;
                this.group = codes.group;
                this.others = codes.others;
            }
        };

        Chmod.prototype.toOctal = function(prepend, append) {
            var props = ['owner', 'group', 'others'];
            var result = [];
            for (var i in props) {
                var key = props[i];
                result[i]  = this[key].read  && this.octalValues.read  || 0;
                result[i] += this[key].write && this.octalValues.write || 0;
                result[i] += this[key].exec  && this.octalValues.exec  || 0;
            }
            return (prepend||'') + result.join('') + (append||'');
        };

        Chmod.prototype.toCode = function(prepend, append) {
            var props = ['owner', 'group', 'others'];
            var result = [];
            for (var i in props) {
                var key = props[i];
                result[i]  = this[key].read  && this.codeValues.read  || '-';
                result[i] += this[key].write && this.codeValues.write || '-';
                result[i] += this[key].exec  && this.codeValues.exec  || '-';
            }
            return (prepend||'') + result.join('') + (append||'');
        };

        Chmod.prototype.getRwxObj = function() {
            return {
                read: false,
                write: false,
                exec: false
            };
        };

        Chmod.prototype.octalValues = {
            read: 4, write: 2, exec: 1
        };

        Chmod.prototype.codeValues = {
            read: 'r', write: 'w', exec: 'x'
        };

        Chmod.prototype.convertfromCode = function (str) {
            str = ('' + str).replace(new RegExp("\\s", "g"), '');
            str = str.length === 10 ? str.substr(1) : str;
            if (! str.match(new RegExp("^[\-rwx]{9}$"))) {
                return;
            }

            var result = [], vals = str.match(new RegExp(".{1,3}", "g"));
            for (var i in vals) {
                var rwxObj = this.getRwxObj();
                rwxObj.read  = !!vals[i].match('r');
                rwxObj.write = !!vals[i].match('w');
                rwxObj.exec  = !!vals[i].match('x');
                result.push(rwxObj);
            }

            return {
                owner : result[0],
                group : result[1],
                others: result[2]
            };
        };

        Chmod.prototype.convertfromOctal = function (str) {
            str = ('' + str).replace(/\s/g, '');
            str = str.length === 4 ? str.substr(1) : str;
            if (! str.match(new RegExp("^[0-7]{3}$"))) {
                return;
            }

            var result = [], vals = str.match(new RegExp(".{1}", "g"));
            for (var i in vals) {
                var rwxObj = this.getRwxObj();
                rwxObj.read  = !!vals[i].match("[4567]");
                rwxObj.write = !!vals[i].match("[2367]");
                rwxObj.exec  = !!vals[i].match("[1357]");
                result.push(rwxObj);
            }

            return {
                owner : result[0],
                group : result[1],
                others: result[2]
            };
        };

        return Chmod;
    });
})();