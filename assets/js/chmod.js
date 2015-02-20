/*!
 * Javascript Filemanager developed with AngularJS and Bootstrap
 *
 * @author  Jonas Sciangula Street <joni2back@gmail.com>
 * @version v0.8
 */

FileManagerApp.service('chmod', function () {

    var Chmod = function() {
        var self = this;

        var values = {
            read: 0,
            write: 0,
            execute: 0
        };

        self.values = {
            owner: angular.copy(values),
            group: angular.copy(values),
            others: angular.copy(values)
        };
    };

    Chmod.prototype.getNumber = function() {
        return [
            +this.values.owner.read + +this.values.owner.write + +this.values.owner.execute,
            +this.values.group.read + +this.values.group.write + +this.values.group.execute,
            +this.values.others.read + +this.values.others.write + +this.values.others.execute
        ].join('');
    };

    Chmod.prototype.permissionValues = {
        read: 4, write: 2, execute: 1
    };

    return Chmod;
});