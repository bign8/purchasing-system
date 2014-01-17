-- MySQL dump 10.13  Distrib 5.1.49, for debian-linux-gnu (x86_64)
--
-- ------------------------------------------------------
-- Server version	5.5.30-1.1
--
-- Table structure for table `address`
--
CREATE TABLE `address` (
  `addressID` int(10) unsigned NOT NULL,
  `addrName` varchar(100) DEFAULT NULL,
  `addr1` varchar(100) NOT NULL,
  `addr2` varchar(100) DEFAULT NULL,
  `city` varchar(35) NOT NULL,
  `state` varchar(35) NOT NULL,
  `zip` varchar(10) NOT NULL,
  PRIMARY KEY (`addressID`)
);
--
-- Table structure for table `attendee`
--
CREATE TABLE `attendee` (
  `attendeeID` int(10) unsigned NOT NULL,
  `itemID` int(10) unsigned NOT NULL,
  `contactID` int(10) unsigned NOT NULL,
  `additionalID` int(10) unsigned DEFAULT NULL COMMENT 'spouse / guide',
  `orderID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`attendeeID`),
  KEY `itemID` (`itemID`),
  KEY `contactID` (`contactID`),
  KEY `additionalID` (`additionalID`),
  KEY `orderID` (`orderID`),
  CONSTRAINT `fk_orderID` FOREIGN KEY (`orderID`) REFERENCES `order` (`orderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendee_ibfk_1` FOREIGN KEY (`itemID`) REFERENCES `item` (`itemID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendee_ibfk_2` FOREIGN KEY (`contactID`) REFERENCES `contact` (`contactID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendee_ibfk_3` FOREIGN KEY (`additionalID`) REFERENCES `contact` (`contactID`) ON DELETE CASCADE ON UPDATE CASCADE
);
--
-- Table structure for table `contact`
--
CREATE TABLE `contact` (
  `contactID` int(10) unsigned NOT NULL,
  `firmID` int(10) unsigned NOT NULL,
  `addressID` int(10) unsigned DEFAULT NULL,
  `legalName` varchar(100) NOT NULL,
  `preName` varchar(100) DEFAULT NULL,
  `title` varchar(35) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `pass` varchar(255) DEFAULT NULL,
  `resetHash` varchar(255) DEFAULT NULL,
  `resetExpires` timestamp NULL DEFAULT NULL,
  `lastLogin` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isAdmin` enum('yes','no') NOT NULL DEFAULT 'no',
  PRIMARY KEY (`contactID`),
  KEY `firmID` (`firmID`),
  KEY `addressID` (`addressID`),
  CONSTRAINT `contact_ibfk_1` FOREIGN KEY (`firmID`) REFERENCES `firm` (`firmID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `contact_ibfk_2` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`)
);
--
-- Table structure for table `discount`
--
CREATE TABLE `discount` (
  `discountID` int(10) unsigned NOT NULL,
  `itemID` int(10) unsigned DEFAULT NULL,
  `productID` int(10) unsigned DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `amount` int(11) NOT NULL DEFAULT '0',
  `active` enum('yes','no') NOT NULL DEFAULT 'yes',
  PRIMARY KEY (`discountID`),
  UNIQUE KEY `code` (`code`),
  KEY `itemID` (`itemID`),
  KEY `productID` (`productID`),
  CONSTRAINT `discount_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `product` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `discount_ibfk_2` FOREIGN KEY (`itemID`) REFERENCES `item` (`itemID`) ON DELETE CASCADE ON UPDATE CASCADE
);
--
-- Table structure for table `field`
--
CREATE TABLE `field` (
  `fieldID` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(100) NOT NULL,
  `toStore` enum('yes','no') NOT NULL DEFAULT 'yes',
  `settings` text NOT NULL,
  PRIMARY KEY (`fieldID`)
);
--
-- Table structure for table `firm`
--
CREATE TABLE `firm` (
  `firmID` int(10) unsigned NOT NULL,
  `addressID` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `website` varchar(255) NOT NULL,
  PRIMARY KEY (`firmID`),
  KEY `addressID` (`addressID`),
  CONSTRAINT `firm_ibfk_1` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`)
);
--
-- Table structure for table `group`
--
CREATE TABLE `group` (
  `groupID` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `shortCode` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`groupID`)
);
--
-- Table structure for table `item`
--
CREATE TABLE `item` (
  `itemID` int(10) unsigned NOT NULL,
  `productID` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `settings` text NOT NULL,
  `url` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`itemID`),
  KEY `productID` (`productID`),
  CONSTRAINT `item_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `product` (`productID`)
);
--
-- Table structure for table `member`
--
CREATE TABLE `member` (
  `memberID` int(10) unsigned NOT NULL,
  `firmID` int(10) unsigned NOT NULL,
  `groupID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`memberID`),
  KEY `firmID` (`firmID`),
  KEY `groupID` (`groupID`),
  CONSTRAINT `member_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `group` (`groupID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `member_ibfk_2` FOREIGN KEY (`firmID`) REFERENCES `firm` (`firmID`) ON DELETE CASCADE ON UPDATE CASCADE
);
--
-- Table structure for table `option`
--
CREATE TABLE `option` (
  `optionID` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `pretty` varchar(100) NOT NULL COMMENT 'bind values in curly brackets',
  `requirements` varchar(255) NOT NULL COMMENT 'comma delimited',
  PRIMARY KEY (`optionID`)
);
--
-- Table structure for table `order`
--
CREATE TABLE `order` (
  `orderID` int(10) unsigned NOT NULL,
  `contactID` int(10) unsigned NOT NULL,
  `status` enum('pending','processed','canceled') NOT NULL DEFAULT 'pending',
  `medium` enum('online','check','unknown') NOT NULL,
  `stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` varchar(10) NOT NULL,
  PRIMARY KEY (`orderID`),
  KEY `contactID` (`contactID`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`contactID`) REFERENCES `contact` (`contactID`)
);
--
-- Table structure for table `price`
--
CREATE TABLE `price` (
  `priceID` int(10) unsigned NOT NULL,
  `productID` int(10) unsigned NOT NULL,
  `optionID` int(10) unsigned NOT NULL,
  `groupID` int(10) unsigned DEFAULT NULL,
  `settings` text NOT NULL COMMENT 'JSON object',
  PRIMARY KEY (`priceID`),
  KEY `groupID` (`groupID`),
  KEY `productID` (`productID`),
  KEY `optionID` (`optionID`),
  CONSTRAINT `price_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `product` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `price_ibfk_2` FOREIGN KEY (`optionID`) REFERENCES `option` (`optionID`),
  CONSTRAINT `price_ibfk_3` FOREIGN KEY (`groupID`) REFERENCES `group` (`groupID`) ON DELETE CASCADE ON UPDATE CASCADE
);
--
-- Table structure for table `product`
--
CREATE TABLE `product` (
  `productID` int(10) unsigned NOT NULL,
  `templateID` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `visible` enum('yes','no') NOT NULL DEFAULT 'yes',
  `img` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`productID`),
  KEY `templateID` (`templateID`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`templateID`) REFERENCES `template` (`templateID`)
);
--
-- Table structure for table `purchase`
--
CREATE TABLE `purchase` (
  `purchaseID` int(10) unsigned NOT NULL,
  `itemID` int(10) unsigned NOT NULL,
  `orderID` int(10) unsigned NOT NULL,
  `firmID` int(10) unsigned NOT NULL COMMENT 'redundant, but simplifying',
  `data` text NOT NULL COMMENT 'JSON object',
  PRIMARY KEY (`purchaseID`),
  KEY `itemID` (`itemID`),
  KEY `orderID` (`orderID`),
  KEY `firmID` (`firmID`),
  CONSTRAINT `purchase_ibfk_1` FOREIGN KEY (`firmID`) REFERENCES `firm` (`firmID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_ibfk_2` FOREIGN KEY (`orderID`) REFERENCES `order` (`orderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_ibfk_3` FOREIGN KEY (`itemID`) REFERENCES `item` (`itemID`) ON DELETE CASCADE ON UPDATE CASCADE
);
--
-- Table structure for table `template`
--
CREATE TABLE `template` (
  `templateID` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `template` varchar(100) NOT NULL COMMENT 'rendering template',
  `requirements` varchar(255) NOT NULL COMMENT 'Comma delimited / convert to set?',
  PRIMARY KEY (`templateID`)
);
--
-- Table structure for table `tie_product_field`
--
CREATE TABLE `tie_product_field` (
  `PFtieID` int(10) unsigned NOT NULL,
  `fieldID` int(10) unsigned NOT NULL,
  `productID` int(10) unsigned NOT NULL,
  `order` int(10) unsigned NOT NULL,
  `required` enum('true','false') NOT NULL DEFAULT 'false',
  PRIMARY KEY (`PFtieID`),
  KEY `fieldID` (`fieldID`),
  KEY `productID` (`productID`),
  KEY `order` (`order`),
  CONSTRAINT `tie_product_field_ibfk_1` FOREIGN KEY (`fieldID`) REFERENCES `field` (`fieldID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tie_product_field_ibfk_2` FOREIGN KEY (`productID`) REFERENCES `product` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE
);
