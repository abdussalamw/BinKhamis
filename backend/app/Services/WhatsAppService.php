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
     * Get Instance Status & Details
     */
    public function getInstanceStatus()
    {
        if (!$this->baseUrl || !$this->apiKey || !$this->instance) return ['status' => 'error', 'message' => 'Config missing'];

        try {
            // Get Connection State
            $stateResponse = Http::withHeaders(['apikey' => $this->apiKey])
                ->get("{$this->baseUrl}/instance/connectionState/{$this->instance}");
            
            $stateData = $stateResponse->json();

            // Get Instance Info (Metadata)
            $infoResponse = Http::withHeaders(['apikey' => $this->apiKey])
                ->get("{$this->baseUrl}/instance/fetchInstances", [
                    'instanceName' => $this->instance
                ]);
            
            $infoData = $infoResponse->json();
            
            // Find our instance in the list
            $instanceInfo = null;
            if (is_array($infoData)) {
                foreach ($infoData as $inst) {
                    if (($inst['instance']['instanceName'] ?? '') === $this->instance) {
                        $instanceInfo = $inst;
                        break;
                    }
                }
            }

            return [
                'state' => $stateData,
                'instance' => $instanceInfo
            ];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * Connect Instance (Get QR Code)
     */
    public function connectInstance()
    {
        if (!$this->baseUrl || !$this->apiKey || !$this->instance) return null;

        try {
            $response = Http::withHeaders(['apikey' => $this->apiKey])
                ->get("{$this->baseUrl}/instance/connect/{$this->instance}");
            
            // If instance doesn't exist (404), try to create it first
            if ($response->status() === 404) {
                $this->createInstance();
                // Try connecting again after creation
                $response = Http::withHeaders(['apikey' => $this->apiKey])
                    ->get("{$this->baseUrl}/instance/connect/{$this->instance}");
            }

            if (!$response->successful()) {
                Log::error('WhatsApp Connect Error: ' . $response->body());
                return null;
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('WhatsApp Connect Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a new instance in Evolution API
     */
    public function createInstance()
    {
        if (!$this->baseUrl || !$this->apiKey || !$this->instance) return false;

        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/instance/create", [
                'instanceName' => $this->instance,
                'token' => '', // Random token if needed
                'qrcode' => true,
                'integration' => 'WHATSAPP-BAILEYS'
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsApp Create Instance Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Restart Instance
     */
    public function restartInstance()
    {
        if (!$this->baseUrl || !$this->apiKey || !$this->instance) return false;

        try {
            $response = Http::withHeaders(['apikey' => $this->apiKey])
                ->post("{$this->baseUrl}/instance/restart/{$this->instance}");
            
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Logout Instance
     */
    public function logoutInstance()
    {
        if (!$this->baseUrl || !$this->apiKey || !$this->instance) return false;

        try {
            $response = Http::withHeaders(['apikey' => $this->apiKey])
                ->delete("{$this->baseUrl}/instance/logout/{$this->instance}");
            
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
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
            ])
            ->timeout(60) // Increase timeout to 60 seconds
            ->post("{$this->baseUrl}/message/sendText/{$this->instance}", [
                'number' => $number,
                'text' => $message
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
