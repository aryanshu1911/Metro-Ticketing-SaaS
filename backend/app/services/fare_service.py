def calculate_fare(source_idx: int, dest_idx: int):
    # Mumbai Metro Line 1 Logic:
    # 0-3 stations: 10 INR
    # 4-7 stations: 20 INR
    # 8-11 stations: 30 INR
    # 11+ stations: 40 INR
    
    stations_info = abs(dest_idx - source_idx)
    
    if stations_info <= 3:
        return 10
    elif stations_info <= 7:
        return 20
    elif stations_info <= 11:
        return 30
    else:
        return 40
