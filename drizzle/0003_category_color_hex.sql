-- 팔레트 이름으로 저장된 색을 #rrggbb 값으로 바꾼다.
UPDATE "categories" SET "color" = CASE "color"
  WHEN 'sky' THEN '#0ea5e9'
  WHEN 'emerald' THEN '#10b981'
  WHEN 'amber' THEN '#f59e0b'
  WHEN 'rose' THEN '#f43f5e'
  WHEN 'violet' THEN '#8b5cf6'
  WHEN 'teal' THEN '#14b8a6'
  WHEN 'orange' THEN '#f97316'
  WHEN 'fuchsia' THEN '#d946ef'
  ELSE "color"
END
WHERE "color" IS NOT NULL;
