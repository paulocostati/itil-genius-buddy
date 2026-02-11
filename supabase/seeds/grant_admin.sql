-- RUN THIS SCRIPT AFTER YOU HAVE REGISTERED.
-- 1. Find your user ID by your email
-- Replace 'seu-email@dominio.com' with your REAL email used in SignUp

DO $$
DECLARE
    target_email text := 'pauloarthur1989@gmail.com'; -- ALTERE AQUI PARA SEU EMAIL
    user_rec uuid;
BEGIN
    SELECT id INTO user_rec FROM auth.users WHERE email = target_email;

    IF user_rec IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_rec, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        RAISE NOTICE 'User % is now an admin.', target_email;
    ELSE
        RAISE NOTICE 'User % not found. Register first!', target_email;
    END IF;
END $$;
