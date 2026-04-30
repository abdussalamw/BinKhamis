<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
echo 'Users: ' . \App\Models\User::count() . ' | Profiles: ' . \App\Models\Profile::count();
