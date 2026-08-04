"""apps/common/validators.py — Generic validation functions."""
import re
from typing import Tuple, Dict, Any, Optional


def validate_email(email: str) -> bool:
    """Validate email format using standard regex."""
    if not email or not isinstance(email, str):
        return False
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email.strip()))


def validate_coordinates(coords: Any) -> Tuple[bool, Optional[str]]:
    """Validate GeoJSON point coordinates [longitude, latitude]."""
    if not isinstance(coords, (list, tuple)) or len(coords) != 2:
        return False, "Coordinates must be a [longitude, latitude] array."
    
    lng, lat = coords
    if not (isinstance(lng, (int, float)) and isinstance(lat, (int, float))):
        return False, "Longitude and latitude must be numeric values."
        
    if not (-180 <= lng <= 180):
        return False, "Longitude must be between -180 and 180."
        
    if not (-90 <= lat <= 90):
        return False, "Latitude must be between -90 and 90."
        
    return True, None


def validate_non_negative_number(val: Any, field_name: str) -> Tuple[bool, Optional[str]]:
    """Validate that a field is a non-negative number."""
    if not isinstance(val, (int, float)) or val < 0:
        return False, f"{field_name} must be a non-negative number."
    return True, None
