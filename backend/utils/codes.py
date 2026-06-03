"""
Unlock code generation and verification for Story Mode.

Converted from js/story.js (code generation part only)
"""

SALT = "JL21T9K"
CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_code(level: int) -> str:
    """
    Generate a 4-character unlock code for a given level.
    Uses the same deterministic hash as the JavaScript version.
    """
    s = SALT + str(level) + SALT[::-1] + str(level * 37)

    # djb2 hash (matching JavaScript Math.imul + ^ + >>> semantics)
    h = 5381
    for ch in s:
        # Math.imul(h, 33) in JS: multiply with 32-bit wrap
        h = ((h * 33) & 0xFFFFFFFF) ^ ord(ch)
        h = h & 0xFFFFFFFF  # unsigned 32-bit

    n = (h + level * 7919) & 0xFFFFFFFF

    code = ""
    for _ in range(4):
        code += CHARS[n % len(CHARS)]
        n = n // len(CHARS)

    return code


def verify_code(raw: str) -> int | None:
    """
    Verify an unlock code. Returns the level number (1-21) if valid,
    or None if invalid.
    """
    import re
    c = re.sub(r"[-\s]", "", raw).upper()
    if len(c) != 4:
        return None
    for lv in range(1, 22):
        if generate_code(lv) == c:
            return lv
    return None
