def calculate_fare(source_line: str, source_idx: int, dest_line: str, dest_idx: int):
    # Mumbai Metro Multi-Line Logic:
    if source_line == dest_line:
        diff = abs(dest_idx - source_idx)
    else:
        # Simple cross-line calculation: sum of distances + interchange factor
        diff = abs(source_idx) + abs(dest_idx) + 5
    
    if diff <= 3:
        return 10
    elif diff <= 7:
        return 20
    elif diff <= 11:
        return 30
    else:
        return 40
