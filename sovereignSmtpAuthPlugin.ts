export interface SmtpConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSecure: 'STARTTLS' | 'SSL/TLS';
  fromEmail: string;
  fromName: string;
}

export const DEFAULT_STACKCP_SMTP_CONFIG: SmtpConfig = {
  smtpHost: 'mail.artkitty.net',
  smtpPort: 587,
  smtpUser: 'auth@artkitty.net',
  smtpSecure: 'STARTTLS',
  fromEmail: 'noreply@artkitty.net',
  fromName: 'Sovereign Black Box Library (meow.artkitty.net)'
};

export interface EmailVerificationSession {
  email: string;
  generatedOtp: string;
  timestamp: number;
  isVerified: boolean;
}

export function generateSmtpPhpScript(config: SmtpConfig = DEFAULT_STACKCP_SMTP_CONFIG): string {
  return `<?php
/**
 * Sovereign Black Box & Library Zero-Cloud OTP Mailer
 * Path on StackCP: /public_html/meow/send_otp.php
 * 100% Self-Hosted & Private - Zero Cloud Reliance
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$otp = preg_replace('/[^0-9]/', '', $input['otp'] ?? '');

if (!$email || strlen($otp) !== 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email or 6-digit OTP']);
    exit;
}

$to = $email;
$subject = "🐾 Your Sovereign Library Verification Code: $otp";
$headers = "From: ${config.fromName} <${config.fromEmail}>\r\n";
$headers .= "Reply-To: ${config.fromEmail}\r\n";
$headers .= "X-Mailer: Sovereign Black Box Node/1.0\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

$body = "
<!DOCTYPE html>
<html>
<body style='font-family: sans-serif; background-color: #020617; color: #f8fafc; padding: 24px;'>
  <div style='max-width: 500px; margin: 0 auto; background: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 24px;'>
    <h2 style='color: #f59e0b; margin-top: 0;'>🐾 Sovereign Black Box & Library Access</h2>
    <p style='font-size: 14px; color: #cbd5e1;'>Here is your one-time verification code to unlock your unified Black Box & Library account on <strong>meow.artkitty.net</strong>:</p>
    <div style='background: #020617; border: 2px dashed #f59e0b; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;'>
      <span style='font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38bdf8; font-family: monospace;'>$otp</span>
    </div>
    <p style='font-size: 12px; color: #64748b;'>This code expires in 15 minutes. 100% self-hosted via private SMTP on ${config.smtpHost}. Zero third-party cloud data collection.</p>
  </div>
</body>
</html>
";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => "Verification code sent to $email"]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to dispatch email via local mail agent']);
}
`;
}
