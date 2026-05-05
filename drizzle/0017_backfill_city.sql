-- Backfill `city` columns from existing free-text `location` / `address`.
-- Copies location -> city where the location text matches a NEPAL_CITIES name
-- (case-insensitive). Best-effort: anything that doesn't exact-match stays
-- NULL — no fuzzy guessing for safety.
--
-- The resulting city value is whatever the user typed (case may vary). All
-- subsequent reads use COLLATE NOCASE so case drift doesn't break filtering.

UPDATE classifieds SET city = location
 WHERE city IS NULL AND location IS NOT NULL
   AND LOWER(location) IN ('kathmandu','pokhara','lalitpur','bhaktapur','biratnagar','birgunj','bharatpur','butwal','dharan','hetauda','janakpur','nepalgunj','dhangadhi','itahari','damak','tulsipur','ghorahi','siddharthanagar','kirtipur','lumbini','tansen','gorkha','damauli','baglung','ilam','dhankuta','rajbiraj','lahan','gaur','kalaiya','mechinagar','banepa','dhulikhel','thamel','patan','namche bazaar','lukla','chitwan','manang','mustang','jomsom','nagarkot','bandipur','daman','besisahar','tatopani','jumla','surkhet','dailekh','darchula','mahendranagar','tikapur','bhadrapur','birtamod','inaruwa','charikot','bidur','malangwa','lekhnath','waling','palpa','kapilvastu','dang','bardiya','solukhumbu');

UPDATE jobs SET city = location
 WHERE city IS NULL AND location IS NOT NULL
   AND LOWER(location) IN ('kathmandu','pokhara','lalitpur','bhaktapur','biratnagar','birgunj','bharatpur','butwal','dharan','hetauda','janakpur','nepalgunj','dhangadhi','itahari','damak','tulsipur','ghorahi','siddharthanagar','kirtipur','lumbini','tansen','gorkha','damauli','baglung','ilam','dhankuta','rajbiraj','lahan','gaur','kalaiya','mechinagar','banepa','dhulikhel','thamel','patan','namche bazaar','lukla','chitwan','manang','mustang','jomsom','nagarkot','bandipur','daman','besisahar','tatopani','jumla','surkhet','dailekh','darchula','mahendranagar','tikapur','bhadrapur','birtamod','inaruwa','charikot','bidur','malangwa','lekhnath','waling','palpa','kapilvastu','dang','bardiya','solukhumbu');

UPDATE events SET city = location
 WHERE city IS NULL AND location IS NOT NULL
   AND LOWER(location) IN ('kathmandu','pokhara','lalitpur','bhaktapur','biratnagar','birgunj','bharatpur','butwal','dharan','hetauda','janakpur','nepalgunj','dhangadhi','itahari','damak','tulsipur','ghorahi','siddharthanagar','kirtipur','lumbini','tansen','gorkha','damauli','baglung','ilam','dhankuta','rajbiraj','lahan','gaur','kalaiya','mechinagar','banepa','dhulikhel','thamel','patan','namche bazaar','lukla','chitwan','manang','mustang','jomsom','nagarkot','bandipur','daman','besisahar','tatopani','jumla','surkhet','dailekh','darchula','mahendranagar','tikapur','bhadrapur','birtamod','inaruwa','charikot','bidur','malangwa','lekhnath','waling','palpa','kapilvastu','dang','bardiya','solukhumbu');

UPDATE places SET city = location
 WHERE city IS NULL AND location IS NOT NULL
   AND LOWER(location) IN ('kathmandu','pokhara','lalitpur','bhaktapur','biratnagar','birgunj','bharatpur','butwal','dharan','hetauda','janakpur','nepalgunj','dhangadhi','itahari','damak','tulsipur','ghorahi','siddharthanagar','kirtipur','lumbini','tansen','gorkha','damauli','baglung','ilam','dhankuta','rajbiraj','lahan','gaur','kalaiya','mechinagar','banepa','dhulikhel','thamel','patan','namche bazaar','lukla','chitwan','manang','mustang','jomsom','nagarkot','bandipur','daman','besisahar','tatopani','jumla','surkhet','dailekh','darchula','mahendranagar','tikapur','bhadrapur','birtamod','inaruwa','charikot','bidur','malangwa','lekhnath','waling','palpa','kapilvastu','dang','bardiya','solukhumbu');

UPDATE lost_found SET city = location
 WHERE city IS NULL AND location IS NOT NULL
   AND LOWER(location) IN ('kathmandu','pokhara','lalitpur','bhaktapur','biratnagar','birgunj','bharatpur','butwal','dharan','hetauda','janakpur','nepalgunj','dhangadhi','itahari','damak','tulsipur','ghorahi','siddharthanagar','kirtipur','lumbini','tansen','gorkha','damauli','baglung','ilam','dhankuta','rajbiraj','lahan','gaur','kalaiya','mechinagar','banepa','dhulikhel','thamel','patan','namche bazaar','lukla','chitwan','manang','mustang','jomsom','nagarkot','bandipur','daman','besisahar','tatopani','jumla','surkhet','dailekh','darchula','mahendranagar','tikapur','bhadrapur','birtamod','inaruwa','charikot','bidur','malangwa','lekhnath','waling','palpa','kapilvastu','dang','bardiya','solukhumbu');

UPDATE services SET city = location
 WHERE city IS NULL AND location IS NOT NULL
   AND LOWER(location) IN ('kathmandu','pokhara','lalitpur','bhaktapur','biratnagar','birgunj','bharatpur','butwal','dharan','hetauda','janakpur','nepalgunj','dhangadhi','itahari','damak','tulsipur','ghorahi','siddharthanagar','kirtipur','lumbini','tansen','gorkha','damauli','baglung','ilam','dhankuta','rajbiraj','lahan','gaur','kalaiya','mechinagar','banepa','dhulikhel','thamel','patan','namche bazaar','lukla','chitwan','manang','mustang','jomsom','nagarkot','bandipur','daman','besisahar','tatopani','jumla','surkhet','dailekh','darchula','mahendranagar','tikapur','bhadrapur','birtamod','inaruwa','charikot','bidur','malangwa','lekhnath','waling','palpa','kapilvastu','dang','bardiya','solukhumbu');

UPDATE businesses SET city = address
 WHERE city IS NULL AND address IS NOT NULL
   AND LOWER(TRIM(address)) IN ('kathmandu','pokhara','lalitpur','bhaktapur','biratnagar','birgunj','bharatpur','butwal','dharan','hetauda','janakpur','nepalgunj','dhangadhi','itahari','damak','tulsipur','ghorahi','siddharthanagar','kirtipur','lumbini','tansen','gorkha','damauli','baglung','ilam','dhankuta','rajbiraj','lahan','gaur','kalaiya','mechinagar','banepa','dhulikhel','thamel','patan','namche bazaar','lukla','chitwan','manang','mustang','jomsom','nagarkot','bandipur','daman','besisahar','tatopani','jumla','surkhet','dailekh','darchula','mahendranagar','tikapur','bhadrapur','birtamod','inaruwa','charikot','bidur','malangwa','lekhnath','waling','palpa','kapilvastu','dang','bardiya','solukhumbu');
