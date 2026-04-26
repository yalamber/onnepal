-- Missing indexes for better query performance

-- businesses: directory queries filter by isPublished and businessCategory
CREATE INDEX IF NOT EXISTS `businesses_published_idx` ON `businesses` (`is_published`);
CREATE INDEX IF NOT EXISTS `businesses_category_idx` ON `businesses` (`business_category`);

-- reviews: public queries filter by isApproved
CREATE INDEX IF NOT EXISTS `reviews_approved_idx` ON `reviews` (`is_approved`);
