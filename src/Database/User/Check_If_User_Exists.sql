-- DELIMITER //

-- CREATE PROCEDURE Check_If_User_Exist(login_user_id VARCHAR(100))
-- BEGIN
--     IF EXISTS (SELECT 1 FROM Users WHERE user_id = login_user_id) THEN
--     SELECT user_id, first_name, last_name, email, password FROM Users WHERE user_id = login_user_id;
--     END IF;
-- END //

-- DELIMITER ;