var module = angular.module("lvl.directives.dragdrop", ['lvl.services']);

module.directive('lvlDraggable', ['$rootScope', 'uuid','$compile', function ($rootScope, uuid) {
    return {
        restrict: 'A',
        link: function (scope, el, attrs, controller) {
            var isEnabled = scope.$eval(attrs.lvlDraggable);
            if(isEnabled) {
                angular.element(el).attr("draggable", "true");
                var id = angular.element(el).attr("id");

                if (!id) {
                    id = uuid.new()
                    angular.element(el).attr("id", id);
                }
                el.bind("dragstart", function (e) {
                    e.originalEvent.dataTransfer.setData('text', id);
                    e.originalEvent.dataTransfer.setDragImage(document.getElementById('file-drag-target'),40,30);
                    console.log('drag');
                    $rootScope.$emit("LVL-DRAG-START");
                });

                el.bind("dragend", function (e) {
                    $rootScope.$emit("LVL-DRAG-END");
                });
            }
        }
    };
}]);

module.directive('lvlDropTarget', ['$rootScope', 'uuid', function ($rootScope, uuid) {
    return {
        restrict: 'A',
        scope: {
            onDrop: '&'
        },
        link: function (scope, el, attrs, controller) {
            var id = angular.element(el).attr("id");
            if (!id) {
                id = uuid.new();
                angular.element(el).attr("id", id);
            }

            var isEnabled = scope.$eval(attrs.lvlDropTarget);
            if(isEnabled){
                el.bind("dragover", function (e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the originalEvent.dataTransfer object.
                    return false;
                });

                el.bind("dragenter", function (e) {
                    // this / e.target is the current hover target.
                    //check if el exists
                    if(e.target == null)
                        return;

                    if(e.target.localName !== 'td'){
                        angular.element(e.target).addClass('lvl-over');
                    }else{
                        angular.element(e.target.parentElement).addClass('lvl-over');
                    }

                });

                el.bind("dragleave", function (e) {
                    //check if el exists
                    if(e.target == null)
                        return;

                    if(e.target.localName !== 'td'){
                        angular.element(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
                    }else{
                        angular.element(e.target.parentElement).removeClass('lvl-over');  // this / e.target is previous target element.
                    }

                });

                el.bind("drop", function (e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    if (e.stopPropagation) {
                        e.stopPropagation(); // Necessary. Allows us to drop.
                    }
                    var data = e.originalEvent.dataTransfer.getData("text");
                    var dest = document.getElementById(id);
                    var src = document.getElementById(data);

                    scope.onDrop({dragEl: data, dropEl: id});
                });

                $rootScope.$on("LVL-DRAG-START", function () {
                    var el = document.getElementById(id);
                    angular.element(el).addClass("lvl-target");
                });

                $rootScope.$on("LVL-DRAG-END", function () {
                    var el = document.getElementById(id);
                    angular.element(el).removeClass("lvl-target");

                    //check if el exists
                    if(el == null)
                        return;

                    if(el.localName !== 'td'){
                        angular.element(el).removeClass('lvl-over');  // this / e.target is previous target element.
                    }else{
                        angular.element(el.parentElement).removeClass('lvl-over');  // this / e.target is previous target element.
                    }
                    //angular.element(el).removeClass("lvl-over");
                });
            }

        }
    };
}]);

module.directive('lvlDropZone', ['$rootScope', 'uuid', function ($rootScope, uuid) {
    return {
        restrict: 'A',
        scope: {
            onDrop: '&'
        },
        link: function (scope, el, attrs, controller) {
            var id = angular.element(el).attr("id");
            if (!id) {
                id = uuid.new();
                angular.element(el).attr("id", id);
            }

            var isEnabled = scope.$eval(attrs.lvlDropZone);
            if(isEnabled){
                el.bind("dragover", function (e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the originalEvent.dataTransfer object.
                    return false;
                });

                el.bind("dragenter", function (e) {
                    // this / e.target is the current hover target.
                    //check if el exists
                    if(e.target == null)
                        return;

                    //check if we really drag files from desktop
                    if(e.originalEvent.dataTransfer.types[0] != 'Files')
                        return;
                    //remove style
                    angular.element(e.target).addClass('lvl-zone-over');

                });

                el.bind("dragleave", function (e) {
                    //check if el exists
                    if(e.target == null)
                        return;

                    angular.element(e.target).removeClass('lvl-zone-over');  // this / e.target is previous target element.
                });

                el.bind("drop", function (e) {
                    console.log('files dropped');

                    angular.element(e.target).removeClass('lvl-zone-over');

                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    if (e.stopPropagation) {
                        e.stopPropagation(); // Necessary. Allows us to drop.
                    }

                    //check if we really drag files from desktop
                    if(e.originalEvent.dataTransfer.types[0] != 'Files')
                        return;

                    var files = e.originalEvent.dataTransfer.files;

                    var data = e.originalEvent.dataTransfer.getData("text");

                    scope.onDrop({dragEl: data, dropEl: id, dragFiles: files});
                });

                $rootScope.$on("LVL-DRAG-START", function () {
                    var el = document.getElementById(id);
                    angular.element(el).addClass("lvl-target");
                });

                $rootScope.$on("LVL-DRAG-END", function () {
                    var el = document.getElementById(id);
                    angular.element(el).removeClass("lvl-target");

                    //check if el exists
                    if(el == null)
                        return;
                    angular.element(el).removeClass("lvl-zone-over");
                });
            }

        }
    };
}]);
