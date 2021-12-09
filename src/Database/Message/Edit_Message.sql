-- DELIMITER //

-- CREATE PROCEDURE Edit_Message(chatID VARCHAR(50), messageID INT, sender VARCHAR(50), messageText VARCHAR(2000))
-- BEGIN
-- 	UPDATE MESSAGES
-- 		SET Message_text = messageText
-- 	WHERE
-- 		Chat_id = chatID and
--         Sender = sender and
--         Message_id = messageID;
-- END //

-- DELIMITER ;