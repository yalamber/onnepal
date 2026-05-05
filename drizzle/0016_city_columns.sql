-- Add city columns to tables that didn't have one. The other listing tables
-- (classifieds, jobs, events, places, lost_found) already have `city`.
ALTER TABLE `services` ADD COLUMN `city` text;
ALTER TABLE `businesses` ADD COLUMN `city` text;
ALTER TABLE `discussions` ADD COLUMN `city` text;

CREATE INDEX `services_city_idx` ON `services`(`city`);
CREATE INDEX `businesses_city_idx` ON `businesses`(`city`);
CREATE INDEX `discussions_city_idx` ON `discussions`(`city`);
