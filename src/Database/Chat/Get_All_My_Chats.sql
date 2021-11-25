-- DELIMITER //

-- CREATE PROCEDURE Get_All_My_Chats(userID VARCHAR(50))
-- BEGIN
-- 	SELECT C.chat_id, U.user_unique_id, U.user_id, U.first_name, U.last_name, U.user_image
--     FROM Chats AS C
--     INNER JOIN Users AS U ON (U.user_id = C.user_one or U.user_id = C.user_two)
--     WHERE 
-- 		U.user_id != userID and
-- 		(C.user_one = userID or C.user_two = userID);
-- END //

-- DELIMITER ;