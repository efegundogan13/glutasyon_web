-- Type enum'ı oluştur (varsa skip)
DO $$ BEGIN
    CREATE TYPE enum_events_type AS ENUM ('campaign', 'event');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Type kolonunu ekle (yoksa)
DO $$ BEGIN
    ALTER TABLE events ADD COLUMN type enum_events_type NOT NULL DEFAULT 'event';
EXCEPTION
    WHEN duplicate_column THEN 
        -- Varsa sadece default değerini güncelle
        ALTER TABLE events ALTER COLUMN type SET DEFAULT 'event';
END $$;

-- Mevcut tüm kayıtları 'event' olarak işaretle
UPDATE events SET type = 'event' WHERE type IS NULL OR type = '';

SELECT 'Type kolonu hazır!' as status;
