-- DELIMITER //

-- CREATE PROCEDURE Check_If_User_Exist(login_user_id VARCHAR(100))
-- BEGIN
--     IF EXISTS (SELECT 1 FROM Users WHERE user_id = login_user_id) THEN
--     SELECT user_id, password FROM Users WHERE user_id = login_user_id;
--     END IF;
-- END //

-- DELIMITER ;