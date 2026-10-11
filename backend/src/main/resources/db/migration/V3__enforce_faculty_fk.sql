-- Enforce foreign key from section_faculty to faculty domain table
ALTER TABLE section_faculty 
ADD CONSTRAINT fk_section_faculty_faculty 
FOREIGN KEY (faculty_id) 
REFERENCES faculty(faculty_id);
