from fastapi.testclient import TestClient
from app.main import app
import traceback

client = TestClient(app, raise_server_exceptions=True)

try:
    res_stations = client.get('/stations/')
    stations = res_stations.json()
    source = stations[0]['id']
    dest = stations[2]['id']
    
    print("Testing booking endpoint...")
    res = client.post('/tickets/book', json={
        "phone": "9987705206",
        "source_station_id": source,
        "destination_station_id": dest,
        "passengers": 3,
        "journey_type": "single"
    })
    print(res.status_code)
    print(res.text)
except Exception as e:
    print("CAUGHT EXCEPTION:")
    traceback.print_exc()
