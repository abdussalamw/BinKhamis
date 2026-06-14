<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
 
class WhatsAppController extends Controller
{
    protected $whatsapp;
 
    public function __construct(WhatsAppService $whatsapp)
    {
        $this->whatsapp = $whatsapp;
    }
 
    /**
     * Get instance status and QR code if disconnected
     */
    public function getStatus()
    {
        $status = $this->whatsapp->getInstanceStatus();
        
        // If not connected, also try to get QR
        if (($status['state']['instance']['state'] ?? '') !== 'open') {
            $qrData = $this->whatsapp->connectInstance();
            $status['qr'] = $qrData;
        }
 
        return response()->json($status);
    }
 
    /**
     * Restart instance
     */
    public function restart()
    {
        $success = $this->whatsapp->restartInstance();
        return response()->json(['success' => $success]);
    }
 
    /**
     * Logout instance
     */
    public function logout()
    {
        $success = $this->whatsapp->logoutInstance();
        return response()->json(['success' => $success]);
    }
 
    /**
     * Connect (Get QR)
     */
    public function connect()
    {
        $qrData = $this->whatsapp->connectInstance();
        if (!$qrData) {
            return response()->json(['message' => 'Failed to generate QR'], 500);
        }
        return response()->json($qrData);
    }
 
    /**
     * Send test message
     */
    public function sendTest(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string'
        ]);
 
        $success = $this->whatsapp->sendMessage($request->phone, $request->message);
        return response()->json(['success' => $success]);
    }
}
