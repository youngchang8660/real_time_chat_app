-- DELIMITER //

-- CREATE PROCEDURE Search_User_By_ID(userID VARCHAR(50), friendID VARCHAR(50))
-- BEGIN
-- 	SELECT U.user_unique_id, U.user_id, U.first_name, U.last_name, U.user_image, NULL AS status
-- 	FROM Users AS U
--     	LEFT JOIN Friend_Requests AS FR ON FR.user_two = U.user_id and FR.user_one = U.user_id
-- 		WHERE U.user_id != userID and
-- 			U.user_id LIKE CONCAT('%',friendID,'%') and
--             NOT EXISTS (SELECT null FROM Friend_Requests AS FR 
--             WHERE (FR.user_one = userID and FR.user_two = U.user_id) or
-- 				(FR.user_two = userID and FR.user_one = U.user_id) and
--                 FR.status = 1)
--                 ORDER BY user_id;
-- END //

-- DELIMITER ;