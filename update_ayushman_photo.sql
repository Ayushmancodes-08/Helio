-- Update patient profile photo for Ayushman Patra
-- Photo URL: https://res.cloudinary.com/dlanrr3jl/image/upload/v1765806270/ayushmanpatra_rqyhpj.jpg

-- Update the photo field for Ayushman Patra
UPDATE profiles 
SET 
    photo = 'https://res.cloudinary.com/dlanrr3jl/image/upload/v1765806270/ayushmanpatra_rqyhpj.jpg',
    updated_at = NOW()
WHERE 
    full_name ILIKE '%Ayushman%Patra%' 
    AND role = 'patient';

-- Verify the update
SELECT 
    id, 
    full_name, 
    role, 
    photo, 
    updated_at 
FROM profiles 
WHERE full_name ILIKE '%Ayushman%Patra%';
