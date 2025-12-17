<?php
/* =========================================================
   HEADERS — REQUIRED FOR GITHUB PAGES (CORS)
========================================================= */
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

/* Handle preflight request */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* =========================================================
   SAFETY CHECK — cURL MUST EXIST
========================================================= */
if (!function_exists('curl_init')) {
    echo json_encode([
        "reply" => "Server configuration error. Please contact the administrator."
    ]);
    exit;
}

/* =========================================================
   🔒 GEMINI API KEY
   (PASTE YOUR NEW KEY HERE)
========================================================= */
$GEMINI_API_KEY = "AIzaSyBdMr3v53CO4iMfb5kvu-z4rnVLpy3E6rU";

/* =========================================================
   INPUT READ
========================================================= */
$input = json_decode(file_get_contents("php://input"), true);

$message  = trim($input['message']  ?? '');
$language = $input['language'] ?? 'en';
$category = $input['category'] ?? 'General Legal';

if ($message === '') {
    echo json_encode([
        "reply" => "Please ask a legal question related to Indian law."
    ]);
    exit;
}

/* =========================================================
   PROMPT — INDIAN LAW SAFE
========================================================= */
$prompt = "You are an AI legal information assistant for an Indian law firm.

STRICT RULES:
- Provide GENERAL LEGAL INFORMATION ONLY
- Do NOT give legal advice or strategy
- Do NOT draft documents
- Indian law only (IPC, CrPC, CPC, Constitution of India)
- Neutral, professional tone

Case Category: {$category}
Language Preference: {$language}

User Question:
{$message}

End every response with:
'For case-specific advice, a formal consultation with an advocate is required.'";

/* =========================================================
   GEMINI API REQUEST
========================================================= */
$payload = [
    "contents" => [[
        "parts" => [[
            "text" => $prompt
        ]]
    ]]
];

$ch = curl_init(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$GEMINI_API_KEY}"
);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_TIMEOUT        => 20
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

/* =========================================================
   ERROR HANDLING
========================================================= */
if ($response === false || $httpCode !== 200) {
    echo json_encode([
        "reply" => "The AI service is temporarily unavailable. Please book a consultation."
    ]);
    exit;
}

/* =========================================================
   SAFE RESPONSE OUTPUT
========================================================= */
$data = json_decode($response, true);

$reply =
    $data['candidates'][0]['content']['parts'][0]['text']
    ?? "For case-specific advice, a formal consultation with an advocate is required.";

echo json_encode([
    "reply" => $reply
]);
