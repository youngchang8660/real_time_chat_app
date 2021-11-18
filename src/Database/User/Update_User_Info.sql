-- DELIMITER //

-- CREATE PROCEDURE Update_User_Info(userId varchar(50), firstName varchar(50), lastName varchar(50), image varbinary(55535))
-- BEGIN
-- 	DECLARE myCount INT DEFAULT 0;
-- 	SET myCount = (SELECT COUNT(*) FROM Users WHERE user_id = userId);
-- 	IF (myCount = 1) THEN
--     UPDATE Users
--     SET first_name = firstName, last_name = lastName, user_image = image
--     WHERE user_id = userId;
--     END IF;
-- END //

-- DELIMITER ;