-- DELIMITER //

-- CREATE PROCEDURE Search_User_By_ID(userID VARCHAR(50), friendID VARCHAR(50))
-- BEGIN
-- 	SELECT U.user_unique_id, U.user_id, U.first_name, U.last_name, U.user_image, NULL AS status
-- 	FROM Users AS U
-- 	WHERE 
-- 		NOT EXISTS (SELECT null FROM Friend_Requests AS FR WHERE FR.user_two = U.user_id) and
-- 		U.user_id LIKE CONCAT('%',friendID,'%') and
-- 		U.user_id != userID
-- 	UNION
-- 	SELECT U.user_unique_id, U.user_id, U.first_name, U.last_name, U.user_image, FR.status
-- 	FROM Users AS U
-- 	JOIN Friend_Requests AS FR ON FR.user_two = U.user_id
-- 	WHERE FR.user_two LIKE CONCAT('%',friendID,'%') and
-- 	FR.status = 0
-- 	ORDER BY user_id;
-- END //

-- DELIMITER ;