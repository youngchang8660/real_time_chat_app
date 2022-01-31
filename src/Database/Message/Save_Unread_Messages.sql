-- DELIMITER //

-- CREATE PROCEDURE Save_Unread_Messages(recipient VARCHAR(50), chatID VARCHAR(50), sender VARCHAR(50), messageText VARCHAR(2000))
-- BEGIN
-- 	INSERT INTO Unread_Messages(
-- 		Recipient,
-- 		Chat_id,
-- 		Sender,
-- 		Message_text
--     ) VALUES(
-- 		recipient,
-- 		chatID,
--         sender,
--         messageText
--     );
-- END //

-- DELIMITER ;