----
-- phpLiteAdmin database dump (http://phpliteadmin.googlecode.com)
-- phpLiteAdmin version: 1.9.5
-- Exported: 7:33pm on February 18, 2014 (CET)
-- database file: .\ua-purchase-2.sqlite3
----
BEGIN TRANSACTION;

----
-- Table structure for address
----
CREATE TABLE 'address' (
  'addressID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'addrName' TEXT NOT NULL DEFAULT '',
  'addr1' TEXT NOT NULL,
  'addr2' TEXT NOT NULL DEFAULT '',
  'city' TEXT NOT NULL,
  'state' TEXT NOT NULL,
  'zip' TEXT NOT NULL
);

----
-- Table structure for field
----
CREATE TABLE 'field' (
  'fieldID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'name' TEXT NOT NULL,
  'type' TEXT NOT NULL,
  'toStore' BOOLEAN NOT NULL DEFAULT 'true',
  'settings' TEXT NOT NULL
);

----
-- Table structure for firm
----
CREATE TABLE 'firm' (
  'firmID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'addressID' INTEGER NOT NULL REFERENCES address(addressID),
  'name' TEXT NOT NULL,
  'website' TEXT NOT NULL
);

----
-- Table structure for template
----
CREATE TABLE 'template' (
  'templateID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'name' TEXT NOT NULL,
  'pretty' TEXT NOT NULL,
  'costReq' TEXT NOT NULL,
  'itemReq' TEXT NOT NULL
);

----
-- Table structure for contact
----
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

----
-- Table structure for discount
----
CREATE TABLE 'discount' (
  'discountID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'itemID' INTEGER DEFAULT NULL REFERENCES item(itemID),
  'name' TEXT NOT NULL,
  'code' TEXT NOT NULL,
  'amount' INTEGER NOT NULL DEFAULT '0',
  'active' BOOLEAN NOT NULL DEFAULT 'true'
);

----
-- Table structure for item
----
CREATE TABLE 'item' (
  'itemID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'parentID' INTEGER DEFAULT NULL REFERENCES item(itemID),
  'templateID' INTEGER REFERENCES template(templateID),
  'name' TEXT NOT NULL,
  'desc' TEXT NOT NULL,
  'settings' TEXT NOT NULL,
  'code' TEXT DEFAULT NULL,
  'image' TEXT DEFAULT NULL,
  'visable' BOOLEAN NOT NULL DEFAULT 'true',
  'onFirm' BOOLEAN NOT NULL DEFAULT 'true'
);

----
-- Table structure for order
----
CREATE TABLE 'order' (
  'orderID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'contactID' INTEGER NOT NULL REFERENCES contact(contactID),
  'status' TEXT NOT NULL DEFAULT 'pending',
  'medium' TEXT NNOT NULL,
  'stamp' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  'amount' INTEGER NOT NULL
);

----
-- Table structure for price
----
CREATE TABLE 'price' (
  'priceID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'itemID' INTEGER NOT NULL REFERENCES item(itemID),
  'reasonID' INTEGER DEFAULT NULL REFERENCES item(itemid),
  'settings' TEXT NOT NULL
);

----
-- Table structure for purchase
----
CREATE TABLE 'purchase' (
  'purchaseID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'contactID' INTEGER DEFAULT NULL REFERENCES contact(contactID),
  'firmID' INTEGER DEFAULT NULL REFERENCES firm(firmID),
  'itemID' INTEGER NOT NULL REFERENCES item(itemID),
  'orderID' INTEGER NOT NULL REFERENCES 'order'(orderID),
  'data' TEXT
);

----
-- Table structure for tie
----
CREATE TABLE 'tie' (
  'tieID' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  'fieldID' INTEGER NOT NULL REFERENCES field(fieldID),
  'itemID' INTEGER NOT NULL REFERENCES item(itemID),
  'order' INTEGER NOT NULL,
  'required' BOOLEAN NOT NULL DEFAULT 'false'
);

----
-- Data dump for address, a total of 5 rows
----
INSERT INTO "address" ("addressID","addrName","addr1","addr2","city","state","zip") VALUES ('3','Helena Location','828 Great Northern Boulevard,','','Helena','MT','59624-1040');
INSERT INTO "address" ("addressID","addrName","addr1","addr2","city","state","zip") VALUES ('4','asdf','asdf','asdf','asdf','asdf','asdf');
INSERT INTO "address" ("addressID","addrName","addr1","addr2","city","state","zip") VALUES ('5','Work','P. O. Box 1147','','Helena','MT','59624');
INSERT INTO "address" ("addressID","addrName","addr1","addr2","city","state","zip") VALUES ('6','Billings Office','123','','Billings','MT','59801');
INSERT INTO "address" ("addressID","addrName","addr1","addr2","city","state","zip") VALUES ('7','Helena office','282 ABC','','A','MT','55555');

----
-- Data dump for field, a total of 19 rows
----
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('1','Attendees','attendees','yes','[]');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('2','Total Firm Gross Revenue','text','yes','"currency"');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('3','Profile Picture','image','no','{}');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('4','Brief Bio','textarea','yes','{}');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('5','Areas of technical Expertise','textarea','yes','{}');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('6','Industry Specialties','textarea','yes','{}');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('7','College Alma Mater','text','yes','');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('8','Year You Began Public Practice','text','yes','"numeric"');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('9','Hobbies','textarea','yes','{}');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('11','Other Offices (comma separated)','text','yes','');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('12','Professional Affiliations (comma separated)','text','yes','');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('13','Form of Practice','radioboxes','yes','["Partnership","Partnership (LLP)","S Corporation","C Corporation","Company","Other"]');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('14','Total number of Owners','text','yes','"numeric"');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('15','Total number of Professional Staff','text','yes','"numeric"');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('16','Total number of Administrative Personnel','text','yes','"numeric"');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('17','Niche/Specialties','otherCheckbox','yes','["Tax","Audit","Payroll  Services","Business Management Consulting","Fraud Examination","IT Consulting","Business Valuation","Cost Segregation","Controller Services","Litigation Support","Financial Planning","SOX 44 Consulting"]');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('18','How did you hear about Upstream?','text','yes','');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('19','Test Select','otherSelect','yes','["A","B","C","D"]');
INSERT INTO "field" ("fieldID","name","type","toStore","settings") VALUES ('20','Total number of Personnel','text','yes','"numeric"');

----
-- Data dump for template, a total of 4 rows
----
INSERT INTO "template" ("templateID","name","pretty","costReq","itemReq") VALUES ('1','Download','{cost}','cost','file');
INSERT INTO "template" ("templateID","name","pretty","costReq","itemReq") VALUES ('2','Membership','{cost}','cost','');
INSERT INTO "template" ("templateID","name","pretty","costReq","itemReq") VALUES ('3','Hardcopy','{hard} for Hard Copy; {soft} for Soft Copy','hard,soft','file');
INSERT INTO "template" ("templateID","name","pretty","costReq","itemReq") VALUES ('4','Conference','{initial} for first {after} attendee(s), {later} for additional','initial,later,after','eventDate');

----
-- Data dump for firm, a total of 3 rows
----
INSERT INTO "firm" ("firmID","addressID","name","website") VALUES ('1','3','Upstream Academy','http://upstreamacademy.com');
INSERT INTO "firm" ("firmID","addressID","name","website") VALUES ('2','4','asdf','http://asdf.asdf');
INSERT INTO "firm" ("firmID","addressID","name","website") VALUES ('3','7','ABC Firm','http://www.ABC.com');

----
-- Data dump for contact, a total of 6 rows
----
INSERT INTO "contact" ("contactID","firmID","addressID","legalName","preName","title","email","phone","pass","resetHash","resetExpires","lastLogin","isAdmin") VALUES ('1','1','3','Nathan J. K. Woods','aq1AQ!','Programmer','nwoods@azworld.com','(406) 890-0603','BeXXbNqjT/GIU',NULL,NULL,'2014-02-17 11:46:03','true');
INSERT INTO "contact" ("contactID","firmID","addressID","legalName","preName","title","email","phone","pass","resetHash","resetExpires","lastLogin","isAdmin") VALUES ('2','2','3','asdf','asdf','asdf','nwoods@carroll.edu','(345) 234-1234','Bed5/eZOyfbBg',NULL,NULL,'2014-02-17 13:17:27','false');
INSERT INTO "contact" ("contactID","firmID","addressID","legalName","preName","title","email","phone","pass","resetHash","resetExpires","lastLogin","isAdmin") VALUES ('3','1','3','Georgia','','Director','georgiac@upstreamacademy.com','(406) 495-1850','BeJtVebPqWGbI',NULL,NULL,'2014-02-13 11:09:59','false');
INSERT INTO "contact" ("contactID","firmID","addressID","legalName","preName","title","email","phone","pass","resetHash","resetExpires","lastLogin","isAdmin") VALUES ('4','1','3','Tim Bartz','','Director','timb@upstreamacademy.com','(406) 495-1850',NULL,NULL,NULL,'2014-02-13 11:11:41','false');
INSERT INTO "contact" ("contactID","firmID","addressID","legalName","preName","title","email","phone","pass","resetHash","resetExpires","lastLogin","isAdmin") VALUES ('5','1','6','William B','Bill','Janitor','bill@upstream.com','5',NULL,NULL,NULL,'2014-02-13 11:14:05','false');
INSERT INTO "contact" ("contactID","firmID","addressID","legalName","preName","title","email","phone","pass","resetHash","resetExpires","lastLogin","isAdmin") VALUES ('6','3','7','Henry','Hank','Director','email@email.com','(458) 488-4885','BeJtVebPqWGbI',NULL,NULL,'2014-02-13 11:52:41','false');

----
-- Data dump for item, a total of 168 rows
----
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '1', NULL,    2, 'Memberships','Contains Memberships','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '2',  '1', NULL, 'UAN','UAN Memberships','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '3',  '2', NULL, 'UAN Quarterly','Membership','{}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '4',  '2', NULL, 'UAN Annual','Membership','{}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '5',  '1', NULL, 'MPA Membership','Membership','{}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '6',  '1', NULL, 'MPR Membership','Membership','{}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '7', NULL, NULL, 'Management Presentations','','folder',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '8',  '7',    3, 'Past','Management Presentations','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES (  '9',  '7',    1, 'Upcoming','Management Presentations','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '10', NULL, NULL, 'High Performance Firm','HPF','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '11', '10',    1, 'Presentations','HPF','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '12', '10',    4, 'Workshops','HPF','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '13', NULL,    4, 'HeadWaters Conference','','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '14', NULL,    1, 'LeaderSkills Lessons','','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '15', NULL,    4, 'BestPractices Conference','','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '16', NULL,    4, 'Emerging Leaders Academy','','folder',NULL,NULL,'false','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '17', '11', NULL, 'HPF #1','Desciption','{"file":"hpf-0001.ppt"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '18', '11', NULL, 'HPF #2','Desciption','{"file":"hpf-0002.ppt"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '19', '11', NULL, 'HPF #3','Desciption','{"file":"hpf-0003.ppt"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '20', '11', NULL, 'HPF #4','Desciption','{"file":"hpf-0004.ppt"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '21', '14', NULL, 'Business Development #1','Asking Clients for Additional Business','{"file":"leaderskills/bd01.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '22', '14', NULL, 'Business Development #2','Meeting with Prospective Clients','{"file":"leaderskills/bd02.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '23', '14', NULL, 'Business Development #3','Accepting the Right Clients','{"file":"leaderskills/bd03.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '24', '14', NULL, 'Business Development #4','Differentiating Your Firm in the Marketplace','{"file":"leaderskills/bd04.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '25', '14', NULL, 'Business Development #5','Building a Strong Referral Network','{"file":"leaderskills/bd05.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '26', '14', NULL, 'Business Development #6','Creating Winning Proposals','{"file":"leaderskills/bd06.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '27', '14', NULL, 'Business Development #7','Building Accountability into Business Development Efforts','{"file":"leaderskills/bd07.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '28', '14', NULL, 'Business Development #8','Making a Good First Impression','{"file":"leaderskills/bd08.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '29', '14', NULL, 'Business Development #9','Cross-Selling Firm Services: Finding Comprehensive Solutions to Client Needs','{"file":"leaderskills/bd09.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '30', '14', NULL, 'Business Development #10','Serving on Community Boards','{"file":"leaderskills/bd10.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '31', '15', NULL, 'BestPractices Conference 2014','October 28-29 in Chicago, Illinois','{"eventDate":"1414476000000"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '32', '16', NULL, 'Upstream Academy Network (Annually)','Desciption','{"groupID":"1"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '33', '14', NULL, 'Client Service #1','Responding to Objections About High Fees','{"file":"leaderskills/cs01.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '34', '14', NULL, 'Client Service #3','Improving Client Relationships','{"file":"leaderskills/cs03.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '35', '14', NULL, 'Client Service #4','Keeping Clients Informed of Your Progress','{"file":"leaderskills/cs04.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '36', '14', NULL, 'Client Service #5','Setting Your Firm Apart with Quality Service','{"file":"leaderskills/cs05.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '37', '14', NULL, 'Client Service #6','Developing & Implementing Client Service Standards','{"file":"leaderskills/cs06.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '38', '14', NULL, 'Client Service #7','Developing Lasting Relationships','{"file":"leaderskills/cs07.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '39', '14', NULL, 'Client Service #8','Improving Your Billing Practices','{"file":"leaderskills/cs08.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '40', '14', NULL, 'Client Service #9','Developing C-Level Clients into A-Level Clients','{"file":"leaderskills/cs09.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '41', '14', NULL, 'Client Service #10','Following Proper Business Etiquette','{"file":"leaderskills/cs10.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '42', '14', NULL, 'Client Service #2','Making Client Meetings More Valuable','{"file":"leaderskills/cs02.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '43', '14', NULL, 'Firm Management #1','Making Firm Meetings More Productive','{"file":"leaderskills/fm01.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '44', '14', NULL, 'Firm Management #2','The Power of Example','{"file":"leaderskills/fm02.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '45', '14', NULL, 'Firm Management #3','Managing & Reducing Past Due Receivables','{"file":"leaderskills/fm03.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '46', '14', NULL, 'Firm Management #4','Retaining Your Best & Brightest Employees','{"file":"leaderskills/fm04.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '47', '14', NULL, 'Firm Management #5','Developing a Culture of Accountability','{"file":"leaderskills/fm05.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '48', '14', NULL, 'Firm Management #6','Building Firm Unity','{"file":"leaderskills/fm06.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '49', '14', NULL, 'Firm Management #7','Improving Communication throughout Your Firm','{"file":"leaderskills/fm07.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '50', '14', NULL, 'Firm Management #8','Dealing with Underperforming Employees','{"file":"leaderskills/fm08.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '51', '14', NULL, 'Firm Management #9','Developing & Implementing a Partner Commitment Statement','{"file":"leaderskills/fm09.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '52', '14', NULL, 'Firm Management #10','Firing D-Level Clients','{"file":"leaderskills/fm10.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '53', '14', NULL, 'Firm Management #11','Resolving Work/Life Balance Issues','{"file":"leaderskills/fm01.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '54', '14', NULL, 'Firm Management #12','Developing a Great Orientation Program','{"file":"leaderskills/fm12.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '55', '14', NULL, 'Firm Management #13','Moving People Away from Complacency','{"file":"leaderskills/fm13.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '56', '14', NULL, 'Personal Development #1','Continuous Self-Improvement','{"file":"leaderskills/pd01.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '57', '14', NULL, 'Personal Development #2','Becoming Self-Accountable','{"file":"leaderskills/pd02.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '58', '14', NULL, 'Personal Development #3','Keeping Focused in Spite of Interruptions','{"file":"leaderskills/pd03.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '59', '14', NULL, 'Personal Development #4','Improving Your Presentation Skills','{"file":"leaderskills/pd04.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '60', '14', NULL, 'Personal Development #5','Setting and Accomplishing Meaningful Goals','{"file":"leaderskills/pd05.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '61', '14', NULL, 'Personal Development #6','Delegating Effectively','{"file":"leaderskills/pd06.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '62', '14', NULL, 'Personal Development #7','Accepting Constructive Feedback','{"file":"leaderskills/pd07.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '63', '14', NULL, 'Personal Development #8','Improving Your Listening Skills','{"file":"leaderskills/pd08.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '64', '14', NULL, 'Personal Development #9','Improving Your Writing Skills','{"file":"leaderskills/pd09.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '65', '14', NULL, 'Personal Development #10','Dealing Successfully with Workplace Stress','{"file":"leaderskills/pd10.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '66', '14', NULL, 'Personal Development #11','Remembering People''s Names','{"file":"leaderskills/pd11.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '67', '14', NULL, 'Personal Development #12','Finishing What You Start','{"file":"leaderskills/pd12.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '68', '14', NULL, 'Personal Development #13','Handling Irritations Effectively','{"file":"leaderskills/pd13.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '69', '14', NULL, 'Personal Development #14','???','{"file":"leaderskills/pd14.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '70', '14', NULL, 'Personal Development #15','Making the Most of Investment Time','{"file":"leaderskills/pd15.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '71', '14', NULL, 'Personal Development #16','Managing Your Email Effectively','{"file":"leaderskills/pd16.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '72', '14', NULL, 'Supervision #1','Giving Constructive Feedback','{"file":"leaderskills/s01.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '73', '14', NULL, 'Supervision #2','Inviting People to Serve on Teams','{"file":"leaderskills/s02.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '74', '14', NULL, 'Supervision #3','Giving Meaningful Praise','{"file":"leaderskills/s03.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '75', '14', NULL, 'Supervision #4','Coaching Employees to Manage Their Time','{"file":"leaderskills/s04.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '76', '14', NULL, 'Supervision #5','Hiring Practices to Win the Best','{"file":"leaderskills/s05.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '77', '14', NULL, 'Supervision #6','Coaching for Improved Performance','{"file":"leaderskills/s06.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '78', '14', NULL, 'Supervision #7','Resolving Conflicts Between Employees','{"file":"leaderskills/s07.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '79', '14', NULL, 'Supervision #8','Preparing Performance Appraisals','{"file":"leaderskills/s08.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '80',  '8', NULL, 'Artificial Harmony','The Elephant Is Still in the Room','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '81',  '8', NULL, 'Avoiding the Communication Tax','The High Cost of Poor Communication','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '82',  '8', NULL, 'Becoming the Employer of Choice in Your Market','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '83',  '8', NULL, 'Building a Culture of Discipline in Your Firm','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '84',  '8', NULL, 'Building Firm Loyalty','The Vital Keys','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '85',  '8', NULL, 'Building Trust','Things Great Managing Partners Do','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '86',  '8', NULL, 'Choosing to Remain Independent','What Will It Take to Stay the Course?','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '87',  '8', NULL, 'Conducting an Effective Partner Retreat','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '88',  '8', NULL, 'Conducting Meaningful 360 Degree Evaluations','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '89',  '8', NULL, 'Creating a Culture of Accountability in Your Firm','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '90',  '8', NULL, 'Creating a Firm-Wide Culture of Continuous Learning','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '91',  '8', NULL, 'Creating a Firm of Excellence','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '92',  '8', NULL, 'Creating and Communicating a Shared, Compelling Firm Vision','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '93',  '8', NULL, 'Creating and Implementing a Client Acceptance Policy','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '94',  '8', NULL, 'Creating and Sustaining a Culture of Self-Accountability','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '95',  '8', NULL, 'Dealing Effectively With High Maintenance Partners','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '96',  '8', NULL, 'Dealing Effectively with Your Firm''s Underperformers','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '97',  '8', NULL, 'Developing Your Bench Strength','Effective Tools, Proven Strategies','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '98',  '8', NULL, 'Developing a Client Service Plan for Your Best Clients','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ( '99',  '8', NULL, 'Eventually You''ll Run Out of Ledge','Proactive Ways to Reduce Your Team''s Stress','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('100',  '8', NULL, 'Everybody Wins','Getting Partners to Pass Work to the Right Level','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('101',  '8', NULL, 'Exceptional Client Service','Getting the Entire Firm on the Same Page','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('102',  '8', NULL, 'Examples of Great Partner Goals','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('103',  '8', NULL, 'Finding the Delicate Balance','Work and Life','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('104',  '8', NULL, 'Firing Your D-Level Clients','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('105',  '8', NULL, 'Firm Growth','Getting Your Partners Committed (and Excited!)','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('106',  '8', NULL, 'Firm Success and Partner Goals','Making the Connection','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('107',  '8', NULL, 'Getting Past Parity','Treating Your Best as the Best','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('108',  '8', NULL, 'Getting Serious About Niches','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('109',  '8', NULL, 'Giving Great Presentations','Hints, Tips and Strategy','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('110',  '8', NULL, 'Great Topics for Partner Retreats and Meetings','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('111',  '8', NULL, 'Hardworking, Loyal But Not a Star','Retaining Those Who Will Never Make Partner','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('112',  '8', NULL, 'Hiring Your Firm''s Future','What to Look for Today','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('113',  '8', NULL, 'How Am I Doing?','Evaluating Your Impact as Managing Partner','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('114',  '8', NULL, 'How Do You Measure Up?','Becoming a High Performing Firm','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('115',  '8', NULL, 'Improving Communication within Your Firm','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('116',  '8', NULL, 'Insights from the Last 100 Partner Retreat Facilitations','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('117',  '8', NULL, 'Jim Collins'' Rules for Your Bus','Getting Past the Talk','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('118',  '8', NULL, 'Keeping Poor Performers','A Game Nobody Wins','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('119',  '8', NULL, 'Key Principles and Best Practices for Partner Compensation','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('120',  '8', NULL, 'Key Principles of Effective Coaching','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('121',  '8', NULL, 'Making a Difference','What Every Coach Needs to Hear','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('122',  '8', NULL, 'Making Partner Meetings the Best Meetings You Attend','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('123',  '8', NULL, 'Making the Most of Every Team Member''s Strengths and Talents','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('124',  '8', NULL, 'Making Your Firm Governance Model Work For You, Not Against You','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('125',  '8', NULL, 'Managing Partner Transition','Four Vital Keys for Success','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('126',  '8', NULL, 'Mergers and Acquisitions','Things You''d Better Know and Understand','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('127',  '8', NULL, 'Moving Away from the Book of Business Culture','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('128',  '8', NULL, 'Moving from Historian to Trusted Advisor','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('129',  '8', NULL, 'New Partner Training','What the Best Firms Are Doing','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('130',  '8', NULL, 'Ownership','The Privileges and Responsibilities of Being a Shareholder','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('131',  '8', NULL, 'Playing to Partner Strengths','Examples That Make Sense','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('132',  '8', NULL, 'Partner Compensation','A Catalyst for Firm-Wide Change','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('133',  '8', NULL, 'Partner Evaluations','If Nothing Ever Changes What''s the Point?','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('134',  '8', NULL, 'Partners','Beware of CAG!','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('135',  '8', NULL, 'Principles of Personal Development','Making the Most of Your Career','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('136',  '8', NULL, 'Profitable Growth','What High Performance Firms Are Doing ','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('137',  '8', NULL, 'Rating Your Clients A to D','Why and How','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('138',  '8', NULL, 'Removing the Mystery from Your Path to Partner Program','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('139',  '8', NULL, 'Strategic Marketing','A Process That Makes a Difference','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('140',  '8', NULL, 'Strategies for Improving Client Payments','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('141',  '8', NULL, 'Strategies for Turning Busy Season into Opportunity Season','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('142',  '8', NULL, 'Stop Conducting Perfunctory Performance Reviews','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('143',  '8', NULL, 'Succession Planning','The Vital Keys To Success','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('144',  '8', NULL, 'Ten Keys to Creating Raving Fans','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('145',  '8', NULL, 'Ten Proven Ideas for Building Firm Culture','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('146',  '8', NULL, 'The Five Highest Uses of Your Time as Managing Partner','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('147',  '8', NULL, 'The Best 7 Things to Do to Reduce Underperformance','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('148',  '8', NULL, 'The Best Way to Develop Future Rainmakers','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('149',  '8', NULL, 'The Partner Sabbatical','A True Win/Win/Win ','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('150',  '8', NULL, 'The Ten Worst Habits of Otherwise Good Leaders','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('151',  '8', NULL, 'The Proper Way to Evaluate Firm Culture','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('152',  '8', NULL, 'Transition Planning for Retiring Partners','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('153',  '8', NULL, 'Transitioning Clients at Partner Retirement','Getting It Right','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('154',  '8', NULL, 'What Every Firm Needs to Know About Proactively Preparing for Busy Season','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('155',  '8', NULL, 'What It Means to Be a High Performing Partner','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('156',  '8', NULL, 'What''s the Best Use of Partner Time?','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('157',  '8', NULL, 'Why Firms Are Re-thinking Their Recruiting Strategy','','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('158',  '8', NULL, 'World Class Training','Getting Your Firm on Track','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('159',  '8', NULL, 'Written Standards','Getting Beyond the Talk in Improving Performance','{"file":"mp/xxx.zip"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('160', '16', NULL, 'ELA Class of 2017 Year 1','','{"eventDate":"1401602400000"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('161', '12', NULL, 'High Performance Firms Workshop 1','July 24-25, 2014 in Chicago, Illinois','{"eventDate":"1406181600000"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('162', '13', NULL, 'HeadWaters Conference 2014','July 10-11 in Denver, Colorado','{"eventDate":"1404972000000"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('163',  '9', NULL, 'Avoiding the Managing Partner Traps and Pitfalls','February 4 and February 20, 2014','{"eventDate":"1392879600000"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('164',  '9', NULL, 'How to Stay Refreshed and Maintain Balance as a Leader','May 6 and May 22, 2014','{"eventDate":"1400738400000"}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('165',  '1', NULL, 'AGN Membership','Membership','{}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('166',  '1', NULL, 'CPAmerica','Membership','{}',NULL,NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('167',  '1', NULL, 'DKF','Membership','{}','dkf1337',NULL,'true','true');
INSERT INTO "item" ("itemID","parentID","templateID", "name","desc","settings","code","image","visable","onFirm") VALUES ('168',  '1', NULL, 'MS','Membership','{}','MS1337',NULL,'true','true');

----
-- Data dump for discount, a total of 2 rows
----
INSERT INTO "discount" ("discountID","itemID","name","code","amount","active") VALUES ('1','11','LeaderSkills Lessons','lsl','15','yes');
INSERT INTO "discount" ("discountID","itemID","name","code","amount","active") VALUES ('2',NULL,'Xmas','xmas','15','no');

----
-- Data dump for order, a total of 0 rows
----

----
-- Data dump for price, a total of 23 rows
----
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ( '2',  '3',  NULL, '{"cost":"875"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ( '3',  '4',  NULL, '{"cost":"3500"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ( '4',  '5',  NULL, '{"cost":"2000"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ( '5',  '6',  NULL, '{"cost":"7000"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ( '6',  '8',   '2', '{"soft":"100", "hard":"150"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ( '7',  '8',  NULL, '{"soft":"195", "hard":"245"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ( '8', '11',  NULL, '{"cost":"19.95"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ( '9', '12',   '2', '{"initial":"3050","later":"650","after":"3"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('10', '12',  NULL, '{"initial":"3500","later":"800","after":"3"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('11', '13',   '2', '{"initial":"895","later":"795","after":"1"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('12', '13',  NULL, '{"initial":"1195","later":"995","after":"1"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('13', '14', '165', '{"cost":"125"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('14', '14',   '2', '{"cost":"125"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('15', '14',  NULL, '{"cost":"200"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('16', '15',   '2', '{"initial":"895","later":"795","after":"1"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('17', '15',  NULL, '{"initial":"1195","later":"995","after":"1"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('18', '16', '165', '{"cost":"2500"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('19', '16', '166', '{"cost":"2500"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('20', '16', '167', '{"cost":"2700"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('21', '16', '168', '{"cost":"2500"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('22', '16',   '2', '{"cost":"2500"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('23', '16',  NULL, '{"cost":"3000"}');
INSERT INTO "price" ("priceID","itemID","reasonID","settings") VALUES ('24',  '9',  NULL, '{"cost":"295"}');

----
-- Data dump for purchase, a total of 0 rows
----

----
-- Data dump for tie, a total of 21 rows
----
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('1','2','2','1','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('2','11','2','2','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('3','12','2','3','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('4','13','2','4','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('5','20','2','5','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('6','14','2','6','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('7','15','2','7','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('8','16','2','8','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('9','17','2','9','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('10','18','2','10','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('11','1','13','1','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('12','2','13','2','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('13','1','15','1','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('14','2','15','2','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('15','4','16','1','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('16','5','16','2','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('17','6','16','3','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('18','7','16','4','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('19','8','16','5','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('20','9','16','6','false');
INSERT INTO "tie" ("tieID","fieldID","itemID","order","required") VALUES ('21','3','16','7','false');

----
-- structure for index idx_contact_email_unique on table contact
----
CREATE UNIQUE INDEX 'idx_contact_email_unique' ON "contact" ("email");

----
-- structure for index idx_contact_resetHash_unique on table contact
----
CREATE UNIQUE INDEX 'idx_contact_resetHash_unique' ON "contact" ("resetHash");

----
-- structure for index idx_discount_code_unique on table discount
----
CREATE UNIQUE INDEX 'idx_discount_code_unique' ON "discount" ("code");

-- Added: Nate
CREATE UNIQUE INDEX 'idx_purchase_itemID_firmID_unique' ON "purchase" ("itemID", "firmID");
COMMIT;
