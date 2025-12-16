<?php
header("Content-Type: application/json");

// 🔒 GEMINI API KEY — YAHAN PASTE KAREIN
$GEMINI_API_KEY = "AIzaSyBdMr3v53CO4iMfb5kvu-z4rnVLpy3E6rU";

$input = json_decode(file_get_contents("php://input"), true);
$message = trim($input['message'] ?? '');

if ($message === '') {
  echo json_encode([
    "reply" => "Please ask a legal question related to Indian law."
  ]);
  exit;
}

$payload = [
  "contents" => [[
    "parts" => [[
      "text" => $message
    ]]
  ]]
];

$ch = curl_init(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY"
);

curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
  CURLOPT_POSTFIELDS => json_encode($payload),
  CURLOPT_TIMEOUT => 15
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

echo json_encode([
  "reply" =>
    $data['candidates'][0]['content']['parts'][0]['text']
    ?? "Please book a consultation for personalised legal advice."
]);
