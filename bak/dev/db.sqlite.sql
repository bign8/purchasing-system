PRAGMA synchronous = OFF;
PRAGMA journal_mode = MEMORY;
BEGIN TRANSACTION;

-- Created
-- CREATE TABLE `address` (
--   `addressID` integer  NOT NULL
-- ,  `addrName` varchar(100) DEFAULT NULL
-- ,  `addr1` varchar(100) NOT NULL
-- ,  `addr2` varchar(100) DEFAULT NULL
-- ,  `city` varchar(35) NOT NULL
-- ,  `state` varchar(35) NOT NULL
-- ,  `zip` varchar(10) NOT NULL
-- ,  PRIMARY KEY (`addressID`)
-- );
CREATE TABLE 'address' (
	'addressID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'addrName' TEXT NOT NULL DEFAULT '',
	'addr1' TEXT NOT NULL,
	'addr2' TEXT NOT NULL DEFAULT '',
	'city' TEXT NOT NULL,
	'state' TEXT NOT NULL,
	'zip' TEXT NOT NULL
)

-- Created
-- CREATE TABLE `field` (
--   `fieldID` integer  NOT NULL
-- ,  `name` varchar(100) NOT NULL
-- ,  `type` varchar(100) NOT NULL
-- ,  `toStore` text  NOT NULL DEFAULT 'yes'
-- ,  `settings` text NOT NULL
-- ,  PRIMARY KEY (`fieldID`)
-- );
CREATE TABLE 'field' (
	'fieldID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'name' TEXT NOT NULL,
	'type' TEXT NOT NULL,
	'toStore' BOOLEAN NOT NULL DEFAULT 'true',
	'settings' TEXT NOT NULL
);

-- Created
-- CREATE TABLE `template` (
--   `templateID` integer  NOT NULL
-- ,  `name` varchar(100) NOT NULL
-- ,  `pretty` varchar(100) NOT NULL 
-- ,  `costReq` varchar(255) NOT NULL
-- ,  `itemReq` varchar(255) NOT NULL 
-- ,  PRIMARY KEY (`templateID`)
-- );
CREATE TABLE 'template' (
	'templateID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'name' TEXT NOT NULL,
	'pretty' TEXT NOT NULL,
	'costReq' TEXT NOT NULL,
	'itemReq' TEXT NOT NULL
);

-- Created
-- CREATE TABLE `firm` (
--   `firmID` integer  NOT NULL
-- ,  `addressID` integer  NOT NULL
-- ,  `name` varchar(100) NOT NULL
-- ,  `website` varchar(255) NOT NULL
-- ,  PRIMARY KEY (`firmID`)
-- ,  CONSTRAINT `firm_ibfk_1` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`)
-- );
CREATE TABLE 'firm' (
	'firmID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'addressID' INTEGER NOT NULL REFERENCES address(addressID),
	'name' TEXT NOT NULL,
	'website' TEXT NOT NULL
);

-- Created
-- CREATE TABLE `contact` (
--   `contactID` integer  NOT NULL
-- ,  `firmID` integer  NOT NULL
-- ,  `addressID` integer  DEFAULT NULL
-- ,  `legalName` varchar(100) NOT NULL
-- ,  `preName` varchar(100) DEFAULT NULL
-- ,  `title` varchar(35) NOT NULL
-- ,  `email` varchar(255) NOT NULL
-- ,  `phone` varchar(15) NOT NULL
-- ,  `pass` varchar(255) DEFAULT NULL
-- ,  `resetHash` varchar(255) DEFAULT NULL
-- ,  `resetExpires` timestamp NULL DEFAULT NULL
-- ,  `lastLogin` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ,  `isAdmin` text  NOT NULL DEFAULT 'no'
-- ,  PRIMARY KEY (`contactID`)
-- ,  UNIQUE (`email`)
-- ,  UNIQUE (`resetHash`)
-- ,  CONSTRAINT `contact_ibfk_1` FOREIGN KEY (`firmID`) REFERENCES `firm` (`firmID`) ON DELETE CASCADE ON UPDATE CASCADE
-- ,  CONSTRAINT `contact_ibfk_2` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`)
-- );
CREATE TABLE 'contact' (
	'contactID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'firmID' INTEGER NOT NULL REFERENCES firm(firmID),
	'addressID' INTEGER DEFAULT NULL REFERENCES address(addressID),
	'legalName' TEXT NOT NULL,
	'preName' TEXT DEFAULT NULL,
	'title' TEXT NOT NULL,
	'email' TEXT NOT NULL,
	'phone' TEXT NOT NULL,
	'pass' TEXT DEFAULT NULL,
	'resetHash' TEXT DEFAULT NULL,
	'resetExpires' DATETIME DEFAULT NULL,
	'lastLogin' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	'isAdmin' BOOLEAN NOT NULL DEFAULT 'false'
);
CREATE UNIQUE INDEX 'idx_contact_email_unique' ON "contact" ("email");
CREATE UNIQUE INDEX 'idx_contact_resetHash_unique' ON "contact" ("resetHash");

-- Created
-- CREATE TABLE `discount` (
--   `discountID` integer  NOT NULL
-- ,  `itemID` integer  DEFAULT NULL
-- ,  `productID` integer  DEFAULT NULL
-- ,  `name` varchar(100) NOT NULL
-- ,  `code` varchar(20) NOT NULL
-- ,  `amount` integer NOT NULL DEFAULT '0'
-- ,  `active` text  NOT NULL DEFAULT 'yes'
-- ,  PRIMARY KEY (`discountID`)
-- ,  UNIQUE (`code`)
-- ,  CONSTRAINT `discount_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `product` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE
-- ,  CONSTRAINT `discount_ibfk_2` FOREIGN KEY (`itemID`) REFERENCES `item` (`itemID`) ON DELETE CASCADE ON UPDATE CASCADE
-- );
CREATE TABLE 'discount' (
	'discountID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'itemID' INTEGER DEFAULT NULL REFERENCES item(itemID),
	'name' TEXT NOT NULL,
	'code' TEXT NOT NULL,
	'amount' INTEGER NOT NULL DEFAULT '0',
	'active' BOOLEAN NOT NULL DEFAULT 'true'
);
CREATE UNIQUE INDEX 'idx_discount_code_unique' ON "discount" ("code");

-- Created
-- CREATE TABLE `item` (
--   `itemID` integer  NOT NULL
-- ,  `productID` integer  NOT NULL
-- ,  `name` varchar(100) NOT NULL
-- ,  `description` varchar(255) NOT NULL
-- ,  `settings` text NOT NULL
-- ,  `url` varchar(100) DEFAULT NULL
-- ,  PRIMARY KEY (`itemID`)
-- ,  CONSTRAINT `item_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `product` (`productID`)
-- );
CREATE TABLE 'item' (
	'itemID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'parentID' INTEGER DEFAULT NULL REFERENCES item(itemID),
	'name' TEXT NOT NULL,
	'desc' TEXT NOT NULL,
	'settings' TEXT NOT NULL,
	'code' TEXT DEFAULT NULL,
	'image' TEXT DEFAULT NULL,
	'visable' BOOLEAN NOT NULL DEFAULT 'true'
);

-- Created
-- CREATE TABLE `order` (
--   `orderID` integer  NOT NULL
-- ,  `contactID` integer  NOT NULL
-- ,  `status` text  NOT NULL DEFAULT 'pending'
-- ,  `medium` text  NOT NULL
-- ,  `stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ,  `amount` varchar(10) NOT NULL
-- ,  PRIMARY KEY (`orderID`)
-- ,  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`contactID`) REFERENCES `contact` (`contactID`)
-- );
CREATE TABLE 'order' (
	'orderID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'contactID' INTEGER NOT NULL REFERENCES contact(contactID),
	'status' TEXT NOT NULL DEFAULT 'pending',
	'medium' TEXT NNOT NULL,
	'stamp' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	'amount' INTEGER NOT NULL
);

-- Created
-- CREATE TABLE `price` (
--   `priceID` integer  NOT NULL
-- ,  `productID` integer  NOT NULL
-- ,  `optionID` integer  NOT NULL
-- ,  `groupID` integer  DEFAULT NULL
-- ,  `settings` text NOT NULL 
-- ,  PRIMARY KEY (`priceID`)
-- ,  CONSTRAINT `price_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `product` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE
-- ,  CONSTRAINT `price_ibfk_2` FOREIGN KEY (`optionID`) REFERENCES `option` (`optionID`)
-- ,  CONSTRAINT `price_ibfk_3` FOREIGN KEY (`groupID`) REFERENCES `group` (`groupID`) ON DELETE CASCADE ON UPDATE CASCADE
-- );
CREATE TABLE 'price' (
	'priceID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'itemID' INTEGER NOT NULL REFERENCES item(itemID),
	'reasonID' INTEGER DEFAULT NULL REFERENCES item(itemid),
	'templateID' INTEGER NOT NULL REFERENCES template(templateID),
	'settings' TEXT NOT NULL
);

-- Created
-- CREATE TABLE `purchase` (
--   `purchaseID` integer  NOT NULL
-- ,  `itemID` integer  NOT NULL
-- ,  `orderID` integer  NOT NULL
-- ,  `firmID` integer  NOT NULL 
-- ,  `data` text NOT NULL 
-- ,  PRIMARY KEY (`purchaseID`)
-- ,  UNIQUE (`itemID`,`firmID`)
-- ,  CONSTRAINT `purchase_ibfk_1` FOREIGN KEY (`firmID`) REFERENCES `firm` (`firmID`) ON DELETE CASCADE ON UPDATE CASCADE
-- ,  CONSTRAINT `purchase_ibfk_2` FOREIGN KEY (`orderID`) REFERENCES `order` (`orderID`) ON DELETE CASCADE ON UPDATE CASCADE
-- ,  CONSTRAINT `purchase_ibfk_3` FOREIGN KEY (`itemID`) REFERENCES `item` (`itemID`) ON DELETE CASCADE ON UPDATE CASCADE
-- );
CREATE TABLE 'purchase' (
	'purchaseID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'contactID' INTEGER DEFAULT NULL REFERENCES contact(contactID),
	'firmID' INTEGER DEFAULT NULL REFERENCES firm(firmID),
	'itemID' INTEGER NOT NULL REFERENCES item(itemID),
	'orderID' INTEGER NOT NULL REFERENCES 'order'(orderID),
	'data' TEXT
);

-- Created
-- CREATE TABLE `tie_product_field` (
--   `PFtieID` integer  NOT NULL
-- ,  `fieldID` integer  NOT NULL
-- ,  `productID` integer  NOT NULL
-- ,  `order` integer  NOT NULL
-- ,  `required` text  NOT NULL DEFAULT 'false'
-- ,  PRIMARY KEY (`PFtieID`)
-- ,  CONSTRAINT `tie_product_field_ibfk_1` FOREIGN KEY (`fieldID`) REFERENCES `field` (`fieldID`) ON DELETE CASCADE ON UPDATE CASCADE
-- ,  CONSTRAINT `tie_product_field_ibfk_2` FOREIGN KEY (`productID`) REFERENCES `product` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE
-- );
CREATE TABLE 'tie' (
	'tieID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'fieldID' INTEGER NOT NULL REFERENCES field(fieldID),
	'itemID' INTEGER NOT NULL REFERENCES item(itemID),
	'order' INTEGER NOT NULL,
	'required' BOOLEAN NOT NULL DEFAULT 'false'
);
END TRANSACTION;


-- DATA
-- 
-- Dumping data for table `address`
-- ADDED
INSERT INTO `address` VALUES (3, 'Helena Location', '828 Great Northern Boulevard,', '', 'Helena', 'MT', '59624-1040');
INSERT INTO `address` VALUES (4, 'asdf', 'asdf', 'asdf', 'asdf', 'asdf', 'asdf');
INSERT INTO `address` VALUES (5, 'Work', 'P. O. Box 1147', '', 'Helena', 'MT', '59624');
INSERT INTO `address` VALUES (6, 'Billings Office', '123', '', 'Billings', 'MT', '59801');
INSERT INTO `address` VALUES (7, 'Helena office', '282 ABC', '', 'A', 'MT', '55555');
-- 
-- Dumping data for table `contact`
-- ADDED
INSERT INTO `contact` VALUES (1, 1, 3, 'Nathan J. K. Woods', 'aq1AQ!', 'Programmer', 'nwoods@azworld.com', '(406) 890-0603', 'BeXXbNqjT/GIU', NULL, NULL, '2014-02-17 11:46:03', 'true');
INSERT INTO `contact` VALUES (2, 2, 3, 'asdf', 'asdf', 'asdf', 'nwoods@carroll.edu', '(345) 234-1234', 'Bed5/eZOyfbBg', NULL, NULL, '2014-02-17 13:17:27', 'false');
INSERT INTO `contact` VALUES (3, 1, 3, 'Georgia', '', 'Director', 'georgiac@upstreamacademy.com', '(406) 495-1850', 'BeJtVebPqWGbI', NULL, NULL, '2014-02-13 11:09:59', 'false');
INSERT INTO `contact` VALUES (4, 1, 3, 'Tim Bartz', '', 'Director', 'timb@upstreamacademy.com', '(406) 495-1850', NULL, NULL, NULL, '2014-02-13 11:11:41', 'false');
INSERT INTO `contact` VALUES (5, 1, 6, 'William B', 'Bill', 'Janitor', 'bill@upstream.com', '5', NULL, NULL, NULL, '2014-02-13 11:14:05', 'false');
INSERT INTO `contact` VALUES (6, 3, 7, 'Henry', 'Hank', 'Director', 'email@email.com', '(458) 488-4885', 'BeJtVebPqWGbI', NULL, NULL, '2014-02-13 11:52:41', 'false');
-- 
-- Dumping data for table `discount`
-- ADDED
INSERT INTO `discount` VALUES (NULL, 11, 'LeaderSkills Lessons', 'lsl', 15, 'yes');
INSERT INTO `discount` VALUES (NULL, NULL, 'Xmas', 'xmas', 15, 'no');
-- 
-- Dumping data for table `field`
-- ADDED
INSERT INTO `field` VALUES (1, 'Attendees', 'attendees', 'yes', '[]');
INSERT INTO `field` VALUES (2, 'Total Firm Gross Revenue', 'text', 'yes', '"currency"');
INSERT INTO `field` VALUES (3, 'Profile Picture', 'image', 'no', '{}');
INSERT INTO `field` VALUES (4, 'Brief Bio', 'textarea', 'yes', '{}');
INSERT INTO `field` VALUES (5, 'Areas of technical Expertise', 'textarea', 'yes', '{}');
INSERT INTO `field` VALUES (6, 'Industry Specialties', 'textarea', 'yes', '{}');
INSERT INTO `field` VALUES (7, 'College Alma Mater', 'text', 'yes', '');
INSERT INTO `field` VALUES (8, 'Year You Began Public Practice', 'text', 'yes', '"numeric"');
INSERT INTO `field` VALUES (9, 'Hobbies', 'textarea', 'yes', '{}');
INSERT INTO `field` VALUES (11, 'Other Offices (comma separated)', 'text', 'yes', '');
INSERT INTO `field` VALUES (12, 'Professional Affiliations (comma separated)', 'text', 'yes', '');
INSERT INTO `field` VALUES (13, 'Form of Practice', 'radioboxes', 'yes', '["Partnership","Partnership (LLP)","S Corporation","C Corporation","Company","Other"]');
INSERT INTO `field` VALUES (14, 'Total number of Owners', 'text', 'yes', '"numeric"');
INSERT INTO `field` VALUES (15, 'Total number of Professional Staff', 'text', 'yes', '"numeric"');
INSERT INTO `field` VALUES (16, 'Total number of Administrative Personnel', 'text', 'yes', '"numeric"');
INSERT INTO `field` VALUES (17, 'Niche/Specialties', 'otherCheckbox', 'yes', '["Tax","Audit","Payroll  Services","Business Management Consulting","Fraud Examination","IT Consulting","Business Valuation","Cost Segregation","Controller Services","Litigation Support","Financial Planning","SOX 44 Consulting"]');
INSERT INTO `field` VALUES (18, 'How did you hear about Upstream?', 'text', 'yes', '');
INSERT INTO `field` VALUES (19, 'Test Select', 'otherSelect', 'yes', '["A","B","C","D"]');
INSERT INTO `field` VALUES (20, 'Total number of Personnel', 'text', 'yes', '"numeric"');
-- 
-- Dumping data for table `firm`
-- ADDED
INSERT INTO `firm` VALUES (NULL, 3, 'Upstream Academy', 'http://upstreamacademy.com');
INSERT INTO `firm` VALUES (NULL, 4, 'asdf', 'http://asdf.asdf');
INSERT INTO `firm` VALUES (NULL, 7, 'ABC Firm', 'http://www.ABC.com');
-- 
-- Dumping data for table `item`
-- ADDED
INSERT INTO 'item' VALUES ( 1, NULL, 'Memberships', 'Contains Memberships', 'folder', NULL, NULL, 'false', 'true');
INSERT INTO 'item' VALUES ( 2, 1, 'UAN', 'UAN Memberships', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES ( 3, 2, 'UAN Quarterly', 'Membership', '{}', NULL, NULL, 'true', 'true' );
INSERT INTO 'item' VALUES ( 4, 2, 'UAN Annual', 'Membership', '{}', NULL, NULL, 'true', 'true' );
INSERT INTO 'item' VALUES ( 5, 1, 'MPA Membership', 'Membership', '{}', NULL, NULL, 'true', 'true' );
INSERT INTO 'item' VALUES ( 6, 1, 'MPR Membership', 'Membership', '{}', NULL, NULL, 'true', 'true' );
INSERT INTO 'item' VALUES ( 7, NULL, 'Management Presentations', '', 'folder', NULL, NULL, 'true', 'true' );
INSERT INTO 'item' VALUES ( 8, 7, 'Past', 'Management Presentations', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES ( 9, 7, 'Upcoming', 'Management Presentations', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES (10, NULL, 'High Performance Firm', 'HPF', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES (11,10, 'Presentations', 'HPF', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES (12,10, 'Workshops', 'HPF', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES (13, NULL, 'HeadWaters Conference', '', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES (14, NULL, 'LeaderSkills Lessons', '', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES (15, NULL, 'BestPractices Conference', '', 'folder', NULL, NULL, 'false', 'true' );
INSERT INTO 'item' VALUES (16, NULL, 'Emerging Leaders Academy', '', 'folder', NULL, NULL, 'false', 'true' );
-- What were items
INSERT INTO `item` VALUES (NULL, 11, 'HPF #1', 'Desciption', '{"file":"hpf-0001.ppt"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 11, 'HPF #2', 'Desciption', '{"file":"hpf-0002.ppt"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 11, 'HPF #3', 'Desciption', '{"file":"hpf-0003.ppt"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 11, 'HPF #4', 'Desciption', '{"file":"hpf-0004.ppt"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #1', 'Asking Clients for Additional Business', '{"file":"leaderskills/bd01.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #2', 'Meeting with Prospective Clients', '{"file":"leaderskills/bd02.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #3', 'Accepting the Right Clients', '{"file":"leaderskills/bd03.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #4', 'Differentiating Your Firm in the Marketplace', '{"file":"leaderskills/bd04.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #5', 'Building a Strong Referral Network', '{"file":"leaderskills/bd05.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #6', 'Creating Winning Proposals', '{"file":"leaderskills/bd06.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #7', 'Building Accountability into Business Development Efforts', '{"file":"leaderskills/bd07.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #8', 'Making a Good First Impression', '{"file":"leaderskills/bd08.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #9', 'Cross-Selling Firm Services: Finding Comprehensive Solutions to Client Needs', '{"file":"leaderskills/bd09.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Business Development #10', 'Serving on Community Boards', '{"file":"leaderskills/bd10.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 15, 'BestPractices Conference 2014', 'October 28-29 in Chicago, Illinois', '{"eventDate":"1414476000000"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 16, 'Upstream Academy Network (Annually)', 'Desciption', '{"groupID":"1"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #1', 'Responding to Objections About High Fees', '{"file":"leaderskills/cs01.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #3', 'Improving Client Relationships', '{"file":"leaderskills/cs03.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #4', 'Keeping Clients Informed of Your Progress', '{"file":"leaderskills/cs04.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #5', 'Setting Your Firm Apart with Quality Service', '{"file":"leaderskills/cs05.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #6', 'Developing & Implementing Client Service Standards', '{"file":"leaderskills/cs06.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #7', 'Developing Lasting Relationships', '{"file":"leaderskills/cs07.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #8', 'Improving Your Billing Practices', '{"file":"leaderskills/cs08.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #9', 'Developing C-Level Clients into A-Level Clients', '{"file":"leaderskills/cs09.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #10', 'Following Proper Business Etiquette', '{"file":"leaderskills/cs10.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Client Service #2', 'Making Client Meetings More Valuable', '{"file":"leaderskills/cs02.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #1', 'Making Firm Meetings More Productive', '{"file":"leaderskills/fm01.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #2', 'The Power of Example', '{"file":"leaderskills/fm02.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #3', 'Managing & Reducing Past Due Receivables', '{"file":"leaderskills/fm03.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #4', 'Retaining Your Best & Brightest Employees', '{"file":"leaderskills/fm04.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #5', 'Developing a Culture of Accountability', '{"file":"leaderskills/fm05.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #6', 'Building Firm Unity', '{"file":"leaderskills/fm06.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #7', 'Improving Communication throughout Your Firm', '{"file":"leaderskills/fm07.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #8', 'Dealing with Underperforming Employees', '{"file":"leaderskills/fm08.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #9', 'Developing & Implementing a Partner Commitment Statement', '{"file":"leaderskills/fm09.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #10', 'Firing D-Level Clients', '{"file":"leaderskills/fm10.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #11', 'Resolving Work/Life Balance Issues', '{"file":"leaderskills/fm01.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #12', 'Developing a Great Orientation Program', '{"file":"leaderskills/fm12.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Firm Management #13', 'Moving People Away from Complacency', '{"file":"leaderskills/fm13.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #1', 'Continuous Self-Improvement', '{"file":"leaderskills/pd01.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #2', 'Becoming Self-Accountable', '{"file":"leaderskills/pd02.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #3', 'Keeping Focused in Spite of Interruptions', '{"file":"leaderskills/pd03.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #4', 'Improving Your Presentation Skills', '{"file":"leaderskills/pd04.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #5', 'Setting and Accomplishing Meaningful Goals', '{"file":"leaderskills/pd05.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #6', 'Delegating Effectively', '{"file":"leaderskills/pd06.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #7', 'Accepting Constructive Feedback', '{"file":"leaderskills/pd07.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #8', 'Improving Your Listening Skills', '{"file":"leaderskills/pd08.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #9', 'Improving Your Writing Skills', '{"file":"leaderskills/pd09.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #10', 'Dealing Successfully with Workplace Stress', '{"file":"leaderskills/pd10.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #11', 'Remembering People''s Names', '{"file":"leaderskills/pd11.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #12', 'Finishing What You Start', '{"file":"leaderskills/pd12.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #13', 'Handling Irritations Effectively', '{"file":"leaderskills/pd13.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #14', '???', '{"file":"leaderskills/pd14.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #15', 'Making the Most of Investment Time', '{"file":"leaderskills/pd15.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Personal Development #16', 'Managing Your Email Effectively', '{"file":"leaderskills/pd16.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Supervision #1', 'Giving Constructive Feedback', '{"file":"leaderskills/s01.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Supervision #2', 'Inviting People to Serve on Teams', '{"file":"leaderskills/s02.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Supervision #3', 'Giving Meaningful Praise', '{"file":"leaderskills/s03.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Supervision #4', 'Coaching Employees to Manage Their Time', '{"file":"leaderskills/s04.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Supervision #5', 'Hiring Practices to Win the Best', '{"file":"leaderskills/s05.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Supervision #6', 'Coaching for Improved Performance', '{"file":"leaderskills/s06.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Supervision #7', 'Resolving Conflicts Between Employees', '{"file":"leaderskills/s07.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 14, 'Supervision #8', 'Preparing Performance Appraisals', '{"file":"leaderskills/s08.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Artificial Harmony', 'The Elephant Is Still in the Room', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Avoiding the Communication Tax', 'The High Cost of Poor Communication', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Becoming the Employer of Choice in Your Market', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Building a Culture of Discipline in Your Firm', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Building Firm Loyalty', 'The Vital Keys', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Building Trust', 'Things Great Managing Partners Do', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Choosing to Remain Independent', 'What Will It Take to Stay the Course?', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Conducting an Effective Partner Retreat', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Conducting Meaningful 360 Degree Evaluations', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Creating a Culture of Accountability in Your Firm', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Creating a Firm-Wide Culture of Continuous Learning', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Creating a Firm of Excellence', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Creating and Communicating a Shared, Compelling Firm Vision', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Creating and Implementing a Client Acceptance Policy', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Creating and Sustaining a Culture of Self-Accountability', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Dealing Effectively With High Maintenance Partners', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Dealing Effectively with Your Firm''s Underperformers', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Developing Your Bench Strength', 'Effective Tools, Proven Strategies', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Developing a Client Service Plan for Your Best Clients', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Eventually You''ll Run Out of Ledge', 'Proactive Ways to Reduce Your Team''s Stress', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Everybody Wins', 'Getting Partners to Pass Work to the Right Level', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Exceptional Client Service', 'Getting the Entire Firm on the Same Page', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Examples of Great Partner Goals', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Finding the Delicate Balance', 'Work and Life', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Firing Your D-Level Clients', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Firm Growth', 'Getting Your Partners Committed (and Excited!)', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Firm Success and Partner Goals', 'Making the Connection', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Getting Past Parity', 'Treating Your Best as the Best', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Getting Serious About Niches', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Giving Great Presentations', 'Hints, Tips and Strategy', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Great Topics for Partner Retreats and Meetings', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Hardworking, Loyal But Not a Star', 'Retaining Those Who Will Never Make Partner', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Hiring Your Firm''s Future', 'What to Look for Today', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'How Am I Doing?', 'Evaluating Your Impact as Managing Partner', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'How Do You Measure Up?', 'Becoming a High Performing Firm', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Improving Communication within Your Firm', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Insights from the Last 100 Partner Retreat Facilitations', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Jim Collins'' Rules for Your Bus', 'Getting Past the Talk', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Keeping Poor Performers', 'A Game Nobody Wins', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Key Principles and Best Practices for Partner Compensation', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Key Principles of Effective Coaching', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Making a Difference', 'What Every Coach Needs to Hear', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Making Partner Meetings the Best Meetings You Attend', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Making the Most of Every Team Member''s Strengths and Talents', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Making Your Firm Governance Model Work For You, Not Against You', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Managing Partner Transition', 'Four Vital Keys for Success', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Mergers and Acquisitions', 'Things You''d Better Know and Understand', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Moving Away from the Book of Business Culture', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Moving from Historian to Trusted Advisor', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'New Partner Training', 'What the Best Firms Are Doing', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Ownership', 'The Privileges and Responsibilities of Being a Shareholder', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Playing to Partner Strengths', 'Examples That Make Sense', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Partner Compensation', 'A Catalyst for Firm-Wide Change', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Partner Evaluations', 'If Nothing Ever Changes What''s the Point?', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Partners', 'Beware of CAG!', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Principles of Personal Development', 'Making the Most of Your Career', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Profitable Growth', 'What High Performance Firms Are Doing ', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Rating Your Clients A to D', 'Why and How', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Removing the Mystery from Your Path to Partner Program', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Strategic Marketing', 'A Process That Makes a Difference', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Strategies for Improving Client Payments', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Strategies for Turning Busy Season into Opportunity Season', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Stop Conducting Perfunctory Performance Reviews', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Succession Planning', 'The Vital Keys To Success', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Ten Keys to Creating Raving Fans', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Ten Proven Ideas for Building Firm Culture', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'The Five Highest Uses of Your Time as Managing Partner', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'The Best 7 Things to Do to Reduce Underperformance', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'The Best Way to Develop Future Rainmakers', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'The Partner Sabbatical', 'A True Win/Win/Win ', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'The Ten Worst Habits of Otherwise Good Leaders', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'The Proper Way to Evaluate Firm Culture', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Transition Planning for Retiring Partners', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Transitioning Clients at Partner Retirement', 'Getting It Right', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'What Every Firm Needs to Know About Proactively Preparing for Busy Season', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'What It Means to Be a High Performing Partner', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'What''s the Best Use of Partner Time?', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Why Firms Are Re-thinking Their Recruiting Strategy', '', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'World Class Training', 'Getting Your Firm on Track', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  8, 'Written Standards', 'Getting Beyond the Talk in Improving Performance', '{"file":"mp/xxx.zip"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 16, 'ELA Class of 2017 Year 1', '', '{"eventDate":"1401602400000"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 12, 'High Performance Firms Workshop 1', 'July 24-25, 2014 in Chicago, Illinois', '{"eventDate":"1406181600000"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL, 13, 'HeadWaters Conference 2014', 'July 10-11 in Denver, Colorado', '{"eventDate":"1404972000000"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  9, 'Avoiding the Managing Partner Traps and Pitfalls', 'February 4 and February 20, 2014', '{"eventDate":"1392879600000"}', NULL, NULL, 'true', 'true');
INSERT INTO `item` VALUES (NULL,  9, 'How to Stay Refreshed and Maintain Balance as a Leader', 'May 6 and May 22, 2014', '{"eventDate":"1400738400000"}', NULL, NULL, 'true', 'true');
-- 
-- Dumping data for table `template`
-- ADDED
INSERT INTO `template` VALUES (1, 'Download', '{cost}', 'cost', 'file');
INSERT INTO `template` VALUES (2, 'Membership', '{cost}', 'cost', '');
INSERT INTO `template` VALUES (3, 'Hardcopy', '{hard} for Hard Copy; {soft} for Soft Copy', 'hard,soft', 'file');
INSERT INTO `template` VALUES (4, 'Conference', '{initial} for first {after} attendee(s), {later} for additional', 'initial,later,after', 'eventDate');
-- 
-- Dumping data for table `price`
-- ADDED
INSERT INTO `price` VALUES (NULL,  3, NULL, 2,	'{"cost":"875"}');
INSERT INTO `price` VALUES (NULL,  4, NULL, 2,	'{"cost":"3500"}');
INSERT INTO `price` VALUES (NULL,  5, NULL, 2,	'{"cost":"2000"}');
INSERT INTO `price` VALUES (NULL,  6, NULL, 2,	'{"cost":"7000"}');
INSERT INTO `price` VALUES (NULL,  8,    2, 3,	'{"soft":"100", "hard":"150"}');
INSERT INTO `price` VALUES (NULL,  8, NULL, 3,	'{"soft":"195", "hard":"245"}');
INSERT INTO `price` VALUES (NULL, 11, NULL, 1,	'{"cost":"19.95"}');
INSERT INTO `price` VALUES (NULL, 12,    2, 4,	'{"initial":"3050","later":"650","after":"3"}');
INSERT INTO `price` VALUES (NULL, 12, NULL, 4,	'{"initial":"3500","later":"800","after":"3"}');
INSERT INTO `price` VALUES (NULL, 13,    2, 4,	'{"initial":"895","later":"795","after":"1"}');
INSERT INTO `price` VALUES (NULL, 13, NULL, 4,	'{"initial":"1195","later":"995","after":"1"}');
INSERT INTO `price` VALUES (NULL, 14,  165, 1,	'{"cost":"125"}');
INSERT INTO `price` VALUES (NULL, 14,    2, 1, 	'{"cost":"125"}');
INSERT INTO `price` VALUES (NULL, 14, NULL, 1,	'{"cost":"200"}');
INSERT INTO `price` VALUES (NULL, 15,    2, 4,	'{"initial":"895","later":"795","after":"1"}');
INSERT INTO `price` VALUES (NULL, 15, NULL, 4,	'{"initial":"1195","later":"995","after":"1"}');
INSERT INTO `price` VALUES (NULL, 16,  165, 4,	'{"cost":"2500"}');
INSERT INTO `price` VALUES (NULL, 16,  166, 4,	'{"cost":"2500"}');
INSERT INTO `price` VALUES (NULL, 16,  167, 4,	'{"cost":"2700"}');
INSERT INTO `price` VALUES (NULL, 16,  168, 4,	'{"cost":"2500"}');
INSERT INTO `price` VALUES (NULL, 16,    2, 4,	'{"cost":"2500"}');
INSERT INTO `price` VALUES (NULL, 16, NULL, 4,	'{"cost":"3000"}');
INSERT INTO `price` VALUES (NULL,  9, NULL, 1,	'{"cost":"295"}');
-- 
-- Dumping data for table `tie`
-- ADDED
INSERT INTO `tie` VALUES (NULL,  2,  2,  1, 'false');
INSERT INTO `tie` VALUES (NULL, 11,  2,  2, 'false');
INSERT INTO `tie` VALUES (NULL, 12,  2,  3, 'false');
INSERT INTO `tie` VALUES (NULL, 13,  2,  4, 'false');
INSERT INTO `tie` VALUES (NULL, 20,  2,  5, 'false');
INSERT INTO `tie` VALUES (NULL, 14,  2,  6, 'false');
INSERT INTO `tie` VALUES (NULL, 15,  2,  7, 'false');
INSERT INTO `tie` VALUES (NULL, 16,  2,  8, 'false');
INSERT INTO `tie` VALUES (NULL, 17,  2,  9, 'false');
INSERT INTO `tie` VALUES (NULL, 18,  2, 10, 'false');
INSERT INTO `tie` VALUES (NULL,  1, 13,  1, 'false');
INSERT INTO `tie` VALUES (NULL,  2, 13,  2, 'false');
INSERT INTO `tie` VALUES (NULL,  1, 15,  1, 'false');
INSERT INTO `tie` VALUES (NULL,  2, 15,  2, 'false');
INSERT INTO `tie` VALUES (NULL,  4, 16,  1, 'false');
INSERT INTO `tie` VALUES (NULL,  5, 16,  2, 'false');
INSERT INTO `tie` VALUES (NULL,  6, 16,  3, 'false');
INSERT INTO `tie` VALUES (NULL,  7, 16,  4, 'false');
INSERT INTO `tie` VALUES (NULL,  8, 16,  5, 'false');
INSERT INTO `tie` VALUES (NULL,  9, 16,  6, 'false');
INSERT INTO `tie` VALUES (NULL,  3, 16,  7, 'false');
				