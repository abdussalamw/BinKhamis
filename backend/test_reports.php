<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\ReportsController;
use Illuminate\Http\Request;

try {
    $controller = new ReportsController();
    $request = new Request();
    $response = $controller->dashboardOverview($request);
    $output = "SUCCESS\n" . $response->getContent();
} catch (\Exception $e) {
    $output = "ERROR: " . $e->getMessage() . "\n" . "TRACE: " . $e->getTraceAsString() . "\n";
}
file_put_contents('test_output.txt', $output);
echo "Done logging to test_output.txt\n";
