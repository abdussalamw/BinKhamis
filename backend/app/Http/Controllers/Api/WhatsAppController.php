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

    public function getStatus()
    {
        $status = $this->whatsapp->getInstanceStatus();
        return response()->json($status);
    }

    public function getQR()
    {
        $qr = $this->whatsapp->connectInstance();
        return response()->json($qr);
    }

    public function restart()
    {
        $result = $this->whatsapp->restartInstance();
        return response()->json(['success' => $result]);
    }

    public function logout()
    {
        $result = $this->whatsapp->logoutInstance();
        return response()->json(['success' => $result]);
    }

    public function sendTestMessage(Request $request)
    {
        $request->validate([
            'number' => 'required|string',
            'message' => 'required|string',
        ]);

        $result = $this->whatsapp->sendMessage($request->number, $request->message);
        return response()->json(['success' => $result]);
    }
}
