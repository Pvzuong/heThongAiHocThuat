-- OTP rate limiting table để tránh spam send-otp
CREATE TABLE otp_rate_limits (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    request_count INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT NOW(),
    last_request_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_otp_rate_limit_email ON otp_rate_limits(email);
