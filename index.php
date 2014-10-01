<?php header("Access-Control-Allow-Origin: *"); ?>

<!doctype html>
<html lang="en" ng-app="fileManagerApp">
<head>
  <meta charset="utf-8">
  <title>Fmanager</title>
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.25/angular.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
  <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
  <script src="assets/js/controller.js"></script>
  <link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" />
</head>

<body ng-controller="FileManagerCtrl">

	<div class="container">
        <h3>FileManager</h3>
		<div class="well">
            <div class="form-group">
                <div class="input-group">
                    <div class="input-group-addon">Search</div>
                    <input class="form-control" ng-model="query">
                </div>
            </div>

			<hr />
			<table class="table table-striped table-bordered table-hover">
				<thead>
					<th>Name</th>
					<th>Size</th>
					<th>Date</th>
					<th class="text-right">Actions</th>
				</thead>
				<tbody>
					<tr ng-repeat="item in fileList | filter:query | orderBy:orderProp">
                        <td ng-click="touch(item)">
                            <i class="icon icon-new {{item.type === 'dir' ? 'fa-folder':'fa-file'}}"></i> {{item.name}}
                        </td>
						<td class="">
							{{item.size}}Kb
						</td>
						<td class="">
							{{item.date.toString()}}
						</td>
						<td class="text-right">
                            <button class="btn btn-sm btn-danger" data-toggle="modal" data-target="#delete" ng-click="touch(item)">Delete</button>
                            <button class="btn btn-sm btn-default" data-toggle="modal" data-target="#rename" ng-click="touch(item)">Rename</button>
                            <button class="btn btn-sm btn-default" data-toggle="modal" data-target="#copy" ng-click="touch(item)">Copy</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>


    <div class="modal" id="delete">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">
                <span aria-hidden="true">&times;</span>
                <span class="sr-only">Close</span>
            </button>
            <h4 class="modal-title">Confirm</h4>
          </div>
          <div class="modal-body">
            Are you sure you want to delete <b>{{temp.name}}</b> ?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-default" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" ng-click="delete(temp)">Delete</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <div class="modal" id="rename">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">
                <span aria-hidden="true">&times;</span>
                <span class="sr-only">Close</span>
            </button>
            <h4 class="modal-title">Change name</h4>
          </div>
          <div class="modal-body">
            New filename for <b>{{temp.name}}</b> ?
            <input class="form-control">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-default" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" ng-click="rename(temp)">Rename</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <div class="modal" id="copy">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">
                <span aria-hidden="true">&times;</span>
                <span class="sr-only">Close</span>
            </button>
            <h4 class="modal-title">Copy file</h4>
          </div>
          <div class="modal-body">
            Enter new path <input class="form-control">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-default" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" ng-click="copy(temp)">Copy</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

</body>
</html>
