-- Hero simplifie : retire les cles legacy mode et slides du jsonb home_hero.
update public.settings
   set value = (value - 'mode' - 'slides'),
       updated_at = now()
 where key = 'home_hero'
   and (value ? 'mode' or value ? 'slides');
