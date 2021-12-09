-- DELIMITER //

-- CREATE PROCEDURE Delete_Message(chatID VARCHAR(50), messageID INT, sender VARCHAR(50))
-- BEGIN
-- 	DELETE FROM Messages WHERE 
-- 		Chat_id = chatID 
-- 		AND Message_id = messageID
-- 		AND Sender = sender;
-- 	SELECT * FROM Messages WHERE Chat_id = chatID;
-- END //

-- DELIMITER ;