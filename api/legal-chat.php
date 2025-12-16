<?php
header("Content-Type: application/json");

/*
|--------------------------------------------------------------------------
| 🔒 GEMINI API KEY – YAHAN PASTE KAREIN
|--------------------------------------------------------------------------
| NOTE:
| - Sirf isi file me key rakhein
| - index.html / JS me kabhi nahi
*/
$GEMINI_API_KEY = "AIzaSyBdMr3v53CO4iMfb5kvu-z4rnVLpy3E6rU"; // 👈 APNI KEY YAHAN DAALEIN

/*
|--------------------------------------------------------------------------
| INPUT READ
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| 🧠 PROMPT TUNING – INDIAN COURTS SAFE
|--------------------------------------------------------------------------
*/
$prompt = "You are an AI legal information assistant for an Indian law firm.

STRICT RULES:
- Provide GENERAL LEGAL INFORMATION ONLY
- Do NOT give legal advice or strategy
- Do NOT draft documents or predict outcomes
- Indian law only (IPC, CrPC, CPC, Constitution of India)
- Mention Indian courts where relevant
- Use neutral, professional tone

Case Category: {$category}
Language Preference: {$language}

User Question:
{$message}

End every response with:
'For case-specific advice, a formal consultation with an advocate is required.'";

/*
|--------------------------------------------------------------------------
| GEMINI API CALL
|--------------------------------------------------------------------------
*/
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
  CURLOPT_TIMEOUT        => 15
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
  echo json_encode([
    "reply" =>
      "The AI service is temporarily unavailable. Please book a consultation."
  ]);
  exit;
}

$data = json_decode($response, true);

/*
|--------------------------------------------------------------------------
| RESPONSE SAFE OUTPUT
|--------------------------------------------------------------------------
*/
$reply =
  $data['candidates'][0]['content']['parts'][0]['text']
  ?? "Please book a consultation for personalised legal advice.";

echo json_encode([
  "reply" => $reply
]);
