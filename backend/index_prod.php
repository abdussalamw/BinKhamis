<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = '/home/user/web/binkamis.3ezit.com/repo/backend/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require '/home/user/web/binkamis.3ezit.com/repo/backend/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once '/home/user/web/binkamis.3ezit.com/repo/backend/bootstrap/app.php')
    ->handleRequest(Request::capture());
