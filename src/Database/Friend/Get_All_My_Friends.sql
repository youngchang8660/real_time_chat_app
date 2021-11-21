-- DELIMITER //

-- CREATE PROCEDURE Get_All_My_Friends(userID VARCHAR(50))
-- BEGIN
-- 	SELECT U.user_unique_id, U.user_id, U.first_name, U.last_name, U.user_image
-- 	FROM Users AS U
-- 	LEFT JOIN Friendship AS F on F.user_one = U.user_id or F.user_two = U.user_id
-- 	WHERE U.user_id != userID and (F.user_one = userID or F.user_two = userID);
-- END //

-- DELIMITER ;