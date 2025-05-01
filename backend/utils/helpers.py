from datetime import date

def convert_dates_to_strings(data: dict) -> dict:
    """Convert date objects in a dictionary to ISO format strings."""
    for key, value in data.items():
        if isinstance(value, date):
            data[key] = value.isoformat()
    return data