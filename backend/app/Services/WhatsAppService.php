<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $baseUrl;
    protected $apiKey;
    protected $instance;

    public function __construct()
    {
        $this->baseUrl = env('WA_EVO_URL');
        $this->apiKey = env('WA_EVO_API_KEY');
        $this->instance = env('WA_EVO_INSTANCE');
    }

    /**
     * Send a text message
     */
    public function sendMessage($number, $message)
    {
        if (!$this->baseUrl || !$this->apiKey || !$this->instance) {
            Log::warning('WhatsApp configurations are missing.');
            return false;
        }

        // Format number: ensure it has no + and no spaces
        $number = preg_replace('/[^0-9]/', '', $number);
        
        // Evolution API often expects 966... format for Saudi
        if (strlen($number) == 9 && strpos($number, '5') === 0) {
            $number = '966' . $number;
        }

        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/message/sendText/{$this->instance}", [
                'number' => $number,
                'text' => $message,
                'delay' => 1200, // 1.2 seconds delay
                'linkPreview' => true
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('WhatsApp API Error: ' . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp Service Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send attendance notification
     */
    public function sendAttendanceNotification($studentName, $parentPhone, $status, $date)
    {
        $statusText = $status == 'absent' ? 'غائب' : ($status == 'late' ? 'متأخر' : 'حاضر');
        $message = "نحيطكم علماً بأن الطالب: *{$studentName}* سجل حالة: *{$statusText}* في حلقة اليوم بتاريخ {$date}.\n\nإدارة حلقات بن خميس.";
        
        return $this->sendMessage($parentPhone, $message);
    }
}
