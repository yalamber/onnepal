ALTER TABLE `classifieds` ADD COLUMN `district` text;
ALTER TABLE `jobs` ADD COLUMN `district` text;
ALTER TABLE `events` ADD COLUMN `district` text;
ALTER TABLE `lost_found` ADD COLUMN `district` text;

CREATE INDEX `classifieds_district_idx` ON `classifieds` (`district`);
CREATE INDEX `jobs_district_idx` ON `jobs` (`district`);
CREATE INDEX `events_district_idx` ON `events` (`district`);
CREATE INDEX `lost_found_district_idx` ON `lost_found` (`district`);
