-- Update business hours: 10 AM to 1 AM (next day)
UPDATE business_settings
SET value = '"10:00"', updated_at = NOW()
WHERE key = 'open_time';

UPDATE business_settings
SET value = '"01:00"', updated_at = NOW()
WHERE key = 'close_time';
