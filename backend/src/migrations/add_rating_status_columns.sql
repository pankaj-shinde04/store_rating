-- Add status and rejection_reason columns to ratings table
ALTER TABLE ratings 
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' AFTER rating_value,
ADD COLUMN rejection_reason TEXT NULL AFTER status;

-- Update existing ratings to have 'approved' status
UPDATE ratings SET status = 'approved' WHERE status IS NULL;
