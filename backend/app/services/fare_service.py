def calculate_fare(source_line: str, source_idx: int, dest_line: str, dest_idx: int):
    """
    Official MMMOCL Fare Slabs (Lines 2A, 7, 3):
    0-3 km: ₹10
    3-12 km: ₹20
    12-18 km: ₹30
    18-24 km: ₹40
    24-30 km: ₹50
    30-36 km: ₹60
    
    Proxy: ~1.25 km per station index.
    """
    
    if source_line == dest_line:
        # Same line journey
        dist_stations = abs(dest_idx - source_idx)
    else:
        # Cross-line journey (simulated via interchange at a logical junction)
        # We use a broad heuristic: distance = sum of indices + constant interchange factor
        dist_stations = source_idx + dest_idx + 4
        
    # Slab logic based on station count proxy
    if dist_stations <= 2:    # < 3 km
        return 10
    elif dist_stations <= 9:  # 3-12 km
        return 20
    elif dist_stations <= 14: # 12-18 km
        return 30
    elif dist_stations <= 19: # 18-24 km
        return 40
    elif dist_stations <= 24: # 24-30 km
        return 50
    else:                     # > 30 km
        return 60
