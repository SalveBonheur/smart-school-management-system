-- Simple admin insert with clean hash
INSERT IGNORE INTO admins (id, username, password, email, full_name, role) 
VALUES (1, 'admin', '$2a$10$YourHashedPasswordHere', 'isalvebonheur@gmail.com', 'super_admin');
