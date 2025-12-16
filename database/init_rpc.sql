CREATE OR REPLACE FUNCTION find_court_by_location(lat double precision, lng double precision)
RETURNS TABLE (id uuid, name text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name
    FROM courts c
    WHERE 
        c.latitude BETWEEN lat - 0.0001 AND lat + 0.0001
        AND
        c.longitude BETWEEN lng - 0.0001 AND lng + 0.0001
    LIMIT 1;
END;
$$;
