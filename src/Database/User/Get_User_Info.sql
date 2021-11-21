-- DELIMITER //

-- CREATE PROCEDURE Get_User_Info(userId varchar(50))
-- BEGIN
-- 	DECLARE myCount INT DEFAULT 0;
-- 	SET myCount = (SELECT COUNT(*) FROM Users WHERE user_id = userId);
-- 	IF (myCount = 1) THEN
--     SELECT user_unique_id, email, first_name, last_name, user_image FROM Users WHERE user_id = userId;
--     END IF;
-- END //

-- DELIMITER ;