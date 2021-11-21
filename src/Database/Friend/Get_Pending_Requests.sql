-- DELIMITER //

-- CREATE PROCEDURE Get_Pending_Requests(userID VARCHAR(50))
-- BEGIN
-- 	SELECT U.user_unique_id, U.user_id, U.email, U.first_name, U.last_name, U.user_image, FR.request_id, FR.status
--     FROM Users AS U
-- 	LEFT JOIN Friend_Requests AS FR on FR.user_one = U.user_id
-- 	WHERE user_two = userID;
-- END //

-- DELIMITER ;