-- Create a new table
create table posts (
 id text primary key,
 title text,
 content text
);

-- Create a new item
--INSERT INTO posts VALUES ('1', 'My first post', 'Hello World');

-- Delete an item
--delete from posts where id = '001'

-- Update item
--UPDATE posts SET title = 'Updated title', content = 'Updated content'  where id = '001'

-- Query all items
select * from posts;