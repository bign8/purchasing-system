-- update items to have hardcopy templates
UPDATE item SET templateID = 3 WHERE "parentID" = '14'

-- update prices accordingly
UPDATE "price" SET "templateID"='3', "settings"='{"soft":"150", "hard":"200"}' WHERE ROWID = 12
UPDATE "price" SET "templateID"='3', "settings"='{"soft":"125", "hard":"175"}' WHERE ROWID = 13
UPDATE "price" SET "templateID"='3', "settings"='{"soft":"200", "hard":"250"}' WHERE ROWID = 14