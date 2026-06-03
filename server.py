import math
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from pathlib import Path
import re
import requests
import os
from zoneinfo import ZoneInfo
from dotenv import load_dotenv
import json

# Create a data directory for training logs
TRAINING_DATA_DIR = Path("training_data")
TRAINING_DATA_DIR.mkdir(exist_ok=True)


def log_conversation(user_message: str, assistant_response: str, metadata: dict = None):
    """Log a conversation for future SLM training"""
    timestamp = datetime.now().isoformat()

    log_entry = {
        "timestamp": timestamp,
        "user_message": user_message,
        "assistant_response": assistant_response,
        "metadata": metadata or {}
    }

    # Append to daily log file
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = TRAINING_DATA_DIR / f"conversations_{today}.jsonl"

    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")


def _get_timezone_from_coords(latitude: float, longitude: float) -> str:
    """
    Get timezone name from coordinates.
    Uses TimezoneDB API (free, no key needed for lookups).
    Falls back to system timezone if lookup fails.
    """
    try:
        # Use a different free API that returns proper IANA timezone names
        url = f"http://api.geonames.org/timezoneJSON?lat={latitude}&lng={longitude}&username=demo"
        response = requests.get(url, timeout=5)
        data = response.json()

        # Extract timezone name (e.g., "Asia/Tokyo", "America/Los_Angeles")
        tz_name = data.get("timezoneId", None)

        if tz_name:
            return tz_name
        else:
            raise ValueError("No timezone returned")

    except Exception:
        # Fallback: use system local timezone
        try:
            import tzlocal
            return str(tzlocal.get_localzone())
        except:
            # Last resort: UTC
            return "UTC"


# Load environment variables
load_dotenv()

print("🚀 Starting MCP from:", os.path.abspath(__file__))


mcp = FastMCP("hello-server")
# Create FastAPI app for HTTP endpoints
api = FastAPI()

# Enable CORS so the browser can call our API
api.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Local development
        "https://astr4.com",           # Your production domain
        "https://*.vercel.app"         # Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- Allow browser to connect directly from the Inspector (CORS) ---


# --- Workspace sandbox (keeps file access safe) ---
BASE_DIR = (Path.cwd() / "workspace").resolve()
BASE_DIR.mkdir(parents=True, exist_ok=True)

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "then", "else", "for", "to", "of", "in", "on", "at", "by",
    "is", "are", "was", "were", "be", "been", "being", "this", "that", "these", "those", "as", "with",
    "it", "its", "into", "from", "over", "under", "up", "down", "out", "about", "than", "so", "such",
    "not", "no", "yes", "you", "your", "we", "our", "they", "their", "he", "she", "his", "her", "i", "me",
}


def _is_allowed(target: Path) -> bool:
    target = target.resolve()
    return target == BASE_DIR or BASE_DIR in target.parents


def _read_text(path: Path, max_bytes: int = 250_000) -> str:
    # read up to max_bytes to avoid huge files
    data = path.read_bytes()[:max_bytes]
    try:
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return data.decode("latin-1", errors="ignore")


def _sentences(text: str) -> List[str]:
    # simple sentence splitter
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s.strip() for s in parts if s.strip()]


def _summarize(text: str, max_sentences: int = 4) -> str:
    # very small extractive summarizer: score sentences by word frequency
    sents = _sentences(text)
    if not sents:
        return "No content to summarize."

    words = re.findall(r"[A-Za-z0-9']+", text.lower())
    freqs: Dict[str, int] = {}
    for w in words:
        if w in STOPWORDS or len(w) <= 2:
            continue
        freqs[w] = freqs.get(w, 0) + 1

    def score(sent: str) -> float:
        score = 0.0
        for w in re.findall(r"[A-Za-z0-9']+", sent.lower()):
            if w in STOPWORDS or len(w) <= 2:
                continue
            score += freqs.get(w, 0)
        return score

    ranked = sorted(sents, key=score, reverse=True)
    pick = ranked[:max_sentences]
    # preserve original order for readability
    pick_sorted = [s for s in sents if s in pick]
    return " ".join(pick_sorted)

# ----------------- Existing demo tools -----------------


def _risk_from_kp(kp: int) -> str:
    if kp <= 4:
        return "LOW"
    elif kp <= 6:
        return "MODERATE"
    else:
        return "HIGH"


@mcp.tool()
def tell_time() -> str:
    """Tell the current time."""
    now = datetime.now().strftime("%I:%M %p")
    return f"The time is {now}"


@mcp.tool()
def say_hello() -> str:
    """Return a friendly greeting."""
    return "Hello, Voyager! 👋"


@mcp.tool()
def list_files(subpath: str = "") -> str:
    """
    List files in the workspace.
    - subpath: relative folder inside workspace to list (default: "")
    """
    target = (BASE_DIR / subpath).resolve()

    if not _is_allowed(target):
        return "Path not allowed. Please stay inside the 'workspace' folder."

    if not target.exists():
        return f"Folder not found: {target.relative_to(BASE_DIR)}"

    entries = []
    for p in sorted(target.iterdir()):
        kind = "DIR " if p.is_dir() else "FILE"
        rel = p.relative_to(BASE_DIR)
        entries.append(f"{kind}  {rel}")

    if not entries:
        return "Folder is empty."
    return "\n".join(entries)


@mcp.tool()
def summarize_file(path: str, max_sentences: int = 4) -> str:
    """
    Summarize a text-like file in the workspace.

    Required:
    - path: relative file path inside workspace (e.g., "notes.txt")

    Optional:
    - max_sentences: how many sentences in the summary (default 4)
    """
    target = (BASE_DIR / path).resolve()

    if not _is_allowed(target):
        return "Path not allowed. Please stay inside the 'workspace' folder."
    if not target.exists() or not target.is_file():
        return f"File not found: {path}"

    text = _read_text(target)
    if not text.strip():
        return "The file is empty or not readable as text."

    summary = _summarize(text, max_sentences=max_sentences)
    size_kb = target.stat().st_size / 1024.0

    return (
        f"✅ Summary of '{target.relative_to(BASE_DIR)}' "
        f"({size_kb:.1f} KB, first {min(len(text), 250000)} bytes read):\n\n"
        f"{summary}"
    )


@mcp.tool()
def astralink_mission_readiness(
    latitude: float,
    longitude: float,
    satellite: str = "ISS"
) -> Dict[str, Any]:
    """
    Calculate a simple mission readiness score (0-100) for satellite observation.

    Required:
    - latitude: observer location
    - longitude: observer location

    Optional:
    - satellite: which satellite to track (default: ISS)
    """

    # Step 1: Gather all the data (using your existing tools!)
    space_wx = astralink_space_weather()
    earth_wx = astralink_earth_weather(latitude, longitude)
    passes = astralink_iss_passes(latitude, longitude, days=1)

    # Step 2: Extract key metrics
    kp = space_wx.get("kp_index_rounded", 3)
    clouds = earth_wx.get("cloud_cover_percent", 50)

    # Get next pass elevation (if available)
    next_pass = passes.get("passes", [])
    elevation = next_pass[0].get("max_elevation_deg", 0) if next_pass else 0

    # Step 3: Simple scoring logic (we'll train the SLM on this later!)
    score = 100  # Start perfect

    # Deduct points for bad space weather
    if kp >= 7:
        score -= 40
        space_risk = "HIGH"
    elif kp >= 5:
        score -= 20
        space_risk = "MODERATE"
    else:
        score -= 0
        space_risk = "LOW"

    # Deduct points for clouds
    if clouds >= 70:
        score -= 30
        sky_risk = "HIGH"
    elif clouds >= 40:
        score -= 15
        sky_risk = "MODERATE"
    else:
        score -= 0
        sky_risk = "LOW"

    # Deduct points for poor elevation
    if elevation < 30:
        score -= 25
        geo_risk = "HIGH"
    elif elevation < 50:
        score -= 10
        geo_risk = "MODERATE"
    else:
        score -= 0
        geo_risk = "LOW"

    # Step 4: Overall assessment
    if score >= 80:
        tier = "GREEN"
        recommendation = "GO - Excellent conditions"
    elif score >= 60:
        tier = "YELLOW"
        recommendation = "CONDITIONAL GO - Monitor conditions"
    else:
        tier = "RED"
        recommendation = "NO-GO - Poor conditions"

    # Step 5: Build explanation
    reasoning = f"""Space Weather: {space_risk} (Kp={kp})
Sky Conditions: {sky_risk} (Clouds={clouds}%)
Pass Geometry: {geo_risk} (Elevation={elevation}°)

Score Breakdown:
- Base: 100 points
- Space weather penalty: {40 if kp >= 7 else 20 if kp >= 5 else 0}
- Cloud penalty: {30 if clouds >= 70 else 15 if clouds >= 40 else 0}
- Elevation penalty: {25 if elevation < 30 else 10 if elevation < 50 else 0}
- Final Score: {score}/100"""

    return {
        "mission_readiness_score": score,
        "tier": tier,
        "recommendation": recommendation,
        "reasoning": reasoning,
        "factors": {
            "space_weather": {
                "kp_index": kp,
                "risk": space_risk
            },
            "sky_conditions": {
                "cloud_cover_percent": clouds,
                "risk": sky_risk
            },
            "pass_geometry": {
                "max_elevation_deg": elevation,
                "risk": geo_risk
            }
        },
        "next_pass_time": next_pass[0].get("start_local") if next_pass else "No passes in next 24h",
        "data_sources": ["NOAA SWPC", "Open-Meteo", "N2YO"]
    }


def astralink_space_weather() -> Dict[str, Any]:
    """
    Get REAL space weather from NOAA.
    Returns current Kp index and geomagnetic risk level.
    """
    try:
        url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        rows = resp.json()

        # Walk backwards to find the latest numeric Kp value
        latest_row = None
        kp_value = None

        for r in reversed(rows):
            if not isinstance(r, list) or len(r) < 2:
                continue
            try:
                kp_value = float(r[1])
                latest_row = r
                break
            except (TypeError, ValueError):
                continue

        if latest_row is None or kp_value is None:
            raise ValueError("No numeric Kp value found in NOAA feed.")

        # Round Kp so 4.67 doesn't become 4 (too low)
        kp_int = int(round(kp_value))

        return {
            "source": "NOAA-SWPC",
            "timestamp_utc": str(latest_row[0]),
            "kp_index": kp_value,          # keep the real value
            "kp_index_rounded": kp_int,    # extra field for your logic
            "risk": _risk_from_kp(kp_int),
            "note": "Real data from NOAA SWPC feed."
        }

    except Exception as e:
        return {
            "source": "astralink-stub",
            "timestamp_utc": datetime.utcnow().isoformat() + "Z",
            "kp_index": 3,
            "kp_index_rounded": 3,
            "risk": "LOW",
            "note": f"Using stub data because: {str(e)}"
        }


@mcp.tool()
def astralink_earth_weather(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Check cloud cover at a location on Earth.

    Required:
    - latitude: like 34.0 for Los Angeles
    - longitude: like -118.2 for Los Angeles
    """
    try:
        # Free weather API (no key needed!)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=cloud_cover,temperature_2m&timezone=auto"
        response = requests.get(url, timeout=10)
        data = response.json()

        cloud_percent = data["current"]["cloud_cover"]

        # Is the sky clear enough?
        if cloud_percent < 30:
            visibility = "EXCELLENT"
        elif cloud_percent < 60:
            visibility = "GOOD"
        else:
            visibility = "POOR"

        return {
            "location": {"lat": latitude, "lon": longitude},
            "cloud_cover_percent": cloud_percent,
            "visibility": visibility,
            "timestamp": data["current"]["time"]
        }
    except Exception as e:
        return {
            "error": str(e),
            "note": "Could not get weather data"
        }


@mcp.tool()
def astralink_geocode_location(location_name: str) -> Dict[str, Any]:
    """
    Convert a location name (like "Los Angeles" or "New York City") into coordinates.

    Required:
    - location_name: city name, address, or place (e.g., "Los Angeles, CA")
    """
    try:
        # Nominatim (OpenStreetMap) - free geocoding API
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": location_name,
            "format": "json",
            "limit": 1
        }
        headers = {
            "User-Agent": "AstraLink-Prometheus/1.0"  # Required by Nominatim
        }

        response = requests.get(
            url, params=params, headers=headers, timeout=10)
        data = response.json()

        if not data:
            return {
                "error": "Location not found",
                "note": f"Could not find coordinates for '{location_name}'"
            }

        result = data[0]
        lat = float(result["lat"])
        lon = float(result["lon"])
        display_name = result["display_name"]

        return {
            "location_name": location_name,
            "latitude": lat,
            "longitude": lon,
            "display_name": display_name,
            "note": "Use these coordinates with other AstraLink tools"
        }

    except Exception as e:
        return {
            "error": str(e),
            "note": "Could not geocode location"
        }


@mcp.tool()
def astralink_iss_passes(
    latitude: float,
    longitude: float,
    days: int = 7,
    min_elevation_deg: int = 20
) -> Dict[str, Any]:
    """
    Get upcoming ISS (International Space Station) visible passes over a location.
    Returns both UTC and local start times.
    """
    try:
        api_key = os.getenv("N2YO_API_KEY")
        if not api_key:
            raise ValueError("N2YO_API_KEY not set")

        url = (
            "https://api.n2yo.com/rest/v1/satellite/visualpasses/25544/"
            f"{latitude}/{longitude}/0/{days}/{min_elevation_deg}/&apiKey={api_key}"
        )

        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()

       # Get timezone for this location
        tz_name = _get_timezone_from_coords(latitude, longitude)
        tz = ZoneInfo(tz_name)

        passes_out = []
        for p in data.get("passes", []):
            # Make UTC timezone-aware
            start_utc = datetime.utcfromtimestamp(p["startUTC"]).replace(
                tzinfo=timezone.utc
            )
            # Convert to local time
            start_local = start_utc.astimezone(tz)

            max_el = p.get("maxEl", 0)

            if max_el >= 60:
                visibility = "OPTIMAL"
            elif max_el >= 40:
                visibility = "EXCELLENT"
            elif max_el >= 25:
                visibility = "GOOD"
            else:
                visibility = "FAIR"

            passes_out.append({
                "start_utc": start_utc.isoformat().replace("+00:00", "Z"),
                "start_local": start_local.strftime("%Y-%m-%d %I:%M %p"),
                "duration_seconds": p.get("duration"),
                "max_elevation_deg": max_el,
                "visibility": visibility,
                "magnitude": p.get("mag", "N/A"),
            })

        return {
            "location": {"lat": latitude, "lon": longitude},
            "satellite": "ISS (25544)",
            "timezone": tz_name,  # Now shows actual timezone!
            "passes": passes_out
        }

    except Exception as e:
        return {
            "error": str(e),
            "passes": []
        }


@mcp.tool()
def astralink_generate_daily_brief_v0(
    latitude: float = 34.6868,
    longitude: float = -118.1542,
    location_name: str = "Lancaster, CA"
) -> Dict[str, Any]:
    """
    Generate a complete mission brief with space weather, Earth weather, AND ISS passes.

    Optional:
    - latitude: your location's latitude (default: Lancaster)
    - longitude: your location's longitude (default: Lancaster)
    - location_name: friendly name for the location (default: "Lancaster, CA")
    """
    # Get ALL the data
    sw = astralink_space_weather()
    ew = astralink_earth_weather(latitude, longitude)
    iss = astralink_iss_passes(latitude, longitude, days=3)

    # Use rounded Kp if available (correct for risk logic)
    kp = int(sw.get("kp_index_rounded", sw.get("kp_index", 0) or 0))
    risk = _risk_from_kp(kp)

    clouds = ew.get("cloud_cover_percent", 0)
    visibility = ew.get("visibility", "UNKNOWN")

    # Get timezone for this location
    tz_name = _get_timezone_from_coords(latitude, longitude)
    tz = ZoneInfo(tz_name)
    now_local = datetime.now(tz)

    # Format ISS passes (prefer start_local from ISS tool)
    passes = iss.get("passes", [])
    pass_lines = []
    for p in passes[:3]:  # Show up to 3 passes
        try:
            if "start_local" in p:
                date_str = p["start_local"].split(" ")[0]
                time_str = " ".join(p["start_local"].split(" ")[1:])
            else:
                # fallback: convert from UTC properly
                dt_utc = datetime.fromisoformat(
                    p["start_utc"].replace("Z", "+00:00")
                )
                dt_local = dt_utc.astimezone(tz)
                date_str = dt_local.strftime("%Y-%m-%d")
                time_str = dt_local.strftime("%I:%M %p")

            duration_min = p.get("duration_seconds", 0) // 60
            elevation = p.get("max_elevation_deg", 0)
            vis = p.get("visibility", "UNKNOWN")

            pass_lines.append(
                f"  • {date_str} at {time_str} (local) - {duration_min} min, {elevation}° elevation - {vis}"
            )
        except:
            pass

    pass_text = "\n".join(
        pass_lines) if pass_lines else "  • No visible passes in next 3 days"

    brief = "\n".join([
        "🚀 ASTRALINK PROMETHEUS — DAILY MISSION BRIEF",
        f"Location: {location_name}",
        f"Coordinates: {latitude}°, {longitude}°",
        f"Timezone: {tz_name}",
        f"Generated: {now_local.strftime('%Y-%m-%d %I:%M %p')} (local time)",
        f"UTC Time: {sw.get('timestamp_utc')}",
        "",
        "SPACE WEATHER ☀️",
        f"- Kp Index: {kp}",
        f"- Risk Level: {risk}",
        "",
        "EARTH WEATHER 🌍",
        f"- Cloud Cover: {clouds}%",
        f"- Sky Visibility: {visibility}",
        "",
        "ISS PASSES 🛰️",
        pass_text,
        "",
        "RECOMMENDATION",
        f"- Space ops: {'✅ GO' if risk == 'LOW' else '⚠️ CAUTION'}",
        f"- Sky viewing: {'✅ CLEAR' if clouds < 30 else '☁️ CLOUDY'}",
    ])

    return {
        "brief": brief,
        "location": {
            "name": location_name,
            "latitude": latitude,
            "longitude": longitude
        },
        "data": {
            "space_weather": sw,
            "earth_weather": ew,
            "iss_passes": iss
        }
    }


@mcp.tool()
def astralink_save_brief(
    latitude: float = 34.6868,
    longitude: float = -118.1542,
    location_name: str = "Lancaster, CA"
) -> str:
    """
    Generate a daily brief AND save it to a file in the workspace.

    Optional:
    - latitude: your location's latitude (default: Lancaster)
    - longitude: your location's longitude (default: Lancaster)
    - location_name: friendly name for the location
    """
    # Generate the brief
    result = astralink_generate_daily_brief_v0(
        latitude, longitude, location_name)
    brief_text = result["brief"]

    # Create a filename with today's date
    now = datetime.now()
    filename = f"mission_brief_{now.strftime('%Y-%m-%d_%H-%M-%S')}.txt"
    filepath = BASE_DIR / filename

    # Save it!
    try:
        filepath.write_text(brief_text, encoding="utf-8")
        return f"✅ Brief saved to: {filename}\n\n{brief_text}"
    except Exception as e:
        return f"❌ Could not save brief: {str(e)}"


@mcp.tool()
def astralink_healthcheck() -> Dict[str, Any]:
    """
    Quick sanity check: server running, workspace accessible, and API key present.
    """
    api_key_set = bool(os.getenv("N2YO_API_KEY"))
    workspace_ok = BASE_DIR.exists() and BASE_DIR.is_dir()

    return {
        "status": "ok",
        "workspace_dir": str(BASE_DIR),
        "workspace_ok": workspace_ok,
        "n2yo_api_key_set": api_key_set,
        "timestamp_local": datetime.now().isoformat(),
        "timestamp_utc": datetime.utcnow().isoformat() + "Z"
    }


@mcp.tool()
def astralink_brief_by_location(location_name: str) -> str:
    """
    Easy mode: Generate a brief just by typing a location name!

    Required:
    - location_name: city or place (e.g., "New York City", "Tokyo, Japan")

    This will:
    1. Look up the coordinates
    2. Generate the brief
    3. Save it to a file
    """
    # Step 1: Geocode the location
    geo = astralink_geocode_location(location_name)

    if "error" in geo:
        return f"❌ {geo['error']}: {geo['note']}"

    lat = geo["latitude"]
    lon = geo["longitude"]
    display_name = geo["display_name"]

    # Step 2: Generate and save the brief
    result = astralink_save_brief(lat, lon, display_name)

    return result


@mcp.tool()
def astralink_brief_flexible(
    location: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> str:
    """
    FLEXIBLE MODE: Generate a brief using EITHER a location name OR coordinates.

    Option 1 - Use location name:
    - location: "Tokyo, Japan" or "New York City"

    Option 2 - Use exact coordinates:
    - latitude: 35.6762
    - longitude: 139.6503

    Examples:
    - astralink_brief_flexible(location="Paris, France")
    - astralink_brief_flexible(latitude=48.8566, longitude=2.3522)
    """
    # Option 1: Location name provided
    if location:
        geo = astralink_geocode_location(location)
        if "error" in geo:
            return f"❌ {geo['error']}: {geo['note']}"
        lat = geo["latitude"]
        lon = geo["longitude"]
        display_name = geo["display_name"]
        return astralink_save_brief(lat, lon, display_name)

    # Option 2: Coordinates provided
    elif latitude is not None and longitude is not None:
        location_name = f"Custom Location ({latitude}°, {longitude}°)"
        return astralink_save_brief(latitude, longitude, location_name)

    # Neither provided - use defaults
    else:
        return astralink_save_brief()

# HTTP Endpoints (for the UI to call)


@api.get("/api/space-weather")
def get_space_weather_http():
    """HTTP endpoint for space weather data"""
    return astralink_space_weather()


@api.get("/api/earth-weather")
def get_earth_weather_http(lat: float = 34.6868, lon: float = -118.1542):
    """HTTP endpoint for earth weather data"""
    return astralink_earth_weather(lat, lon)


@api.get("/api/geocode")
def geocode_location_http(location: str):
    """HTTP endpoint for geocoding location names to coordinates"""
    return astralink_geocode_location(location)


@api.get("/api/iss-passes")
def get_iss_passes_http(lat: float, lon: float, days: int = 7):
    """HTTP endpoint for ISS pass predictions"""
    return astralink_iss_passes(lat, lon, days=days)


@api.get("/api/generate-brief")
def generate_brief_http(lat: float, lon: float, location_name: str):
    """HTTP endpoint for generating mission briefs"""
    return astralink_generate_daily_brief_v0(lat, lon, location_name)


@api.get("/api/health")
def health_check():
    """Simple health check"""
    return {"status": "ok", "message": "MCP API is running"}


@api.get("/api/healthcheck")
def get_healthcheck_http():
    """HTTP endpoint for system health check"""
    return astralink_healthcheck()


@api.get("/api/mission-readiness")
def get_mission_readiness_http(lat: float, lon: float):
    """HTTP endpoint for mission readiness scoring"""
    return astralink_mission_readiness(lat, lon)


@api.post("/api/copilot/chat")
async def copilot_chat(request: dict):
    """Smart copilot that answers questions and generates mission briefs - with logging!"""
    user_message = request.get("message", "").lower()
    original_message = request.get("message", "")

    # Get location from request (default to Lancaster if not provided)
    latitude = request.get("latitude", 34.6868)
    longitude = request.get("longitude", -118.1542)
    location_name = request.get("location_name", "Lancaster, CA")

    # Get current mission readiness FOR THE USER'S LOCATION
    readiness = astralink_mission_readiness(latitude, longitude)

    # MISSION BRIEF GENERATION
    if "mission brief" in user_message or "generate brief" in user_message or "create brief" in user_message:
        brief_data = astralink_generate_daily_brief_v0(
            latitude, longitude, location_name)
        brief_text = brief_data["brief"]
        response = f"Here's your mission brief for {location_name}:\n\n{brief_text}"

    # OBSERVATION RECOMMENDATIONS
    elif "should i observe" in user_message or "good conditions" in user_message or "can i observe" in user_message:
        score = readiness["mission_readiness_score"]
        tier = readiness["tier"]

        if tier == "GREEN":
            response = f"✅ YES! Conditions in {location_name} are excellent with a score of {score}/100. Space weather is calm and skies are clear. Great time for observation!"
        elif tier == "YELLOW":
            response = f"⚠️ Conditions in {location_name} are marginal with a score of {score}/100. You might want to monitor cloud cover before committing. Check again in an hour."
        else:
            response = f"❌ Not recommended for {location_name}. Score is only {score}/100. Wait for better conditions."

    # NEXT PASS INFO
    elif "next pass" in user_message or "when is the pass" in user_message:
        next_pass = readiness["next_pass_time"]
        elevation = readiness["factors"]["pass_geometry"]["max_elevation_deg"]
        response = f"🛰️ The next ISS pass over {location_name} is at {next_pass}, reaching {elevation:.1f}° elevation."

    # SPACE WEATHER
    elif "kp" in user_message or "space weather" in user_message or "solar" in user_message:
        kp = readiness["factors"]["space_weather"]["kp_index"]
        risk = readiness["factors"]["space_weather"]["risk"]
        response = f"☀️ Current Kp index is {kp} ({risk} risk). {'Stable conditions for operations.' if risk == 'LOW' else 'Elevated geomagnetic activity.' if risk == 'MODERATE' else 'High geomagnetic activity - caution advised.'}"

    # CLOUD COVER
    elif "cloud" in user_message or "weather" in user_message or "sky" in user_message:
        clouds = readiness["factors"]["sky_conditions"]["cloud_cover_percent"]
        if clouds < 30:
            response = f"☁️ Current cloud cover in {location_name} is {clouds}%. Clear skies - excellent visibility!"
        elif clouds < 60:
            response = f"☁️ Current cloud cover in {location_name} is {clouds}%. Partially cloudy - fair visibility."
        else:
            response = f"☁️ Current cloud cover in {location_name} is {clouds}%. Heavy cloud cover - poor visibility."

    # ELEVATION INFO
    elif "elevation" in user_message or "how high" in user_message:
        elevation = readiness["factors"]["pass_geometry"]["max_elevation_deg"]
        response = f"🛰️ Next pass over {location_name} reaches {elevation:.1f}° elevation. {'Excellent viewing angle!' if elevation >= 50 else 'Moderate viewing angle.' if elevation >= 30 else 'Low on horizon - may be difficult to see.'}"

    # READINESS SCORE
    elif "score" in user_message or "readiness" in user_message:
        score = readiness["mission_readiness_score"]
        tier = readiness["tier"]
        kp = readiness["factors"]["space_weather"]["kp_index"]
        clouds = readiness["factors"]["sky_conditions"]["cloud_cover_percent"]
        elevation = readiness["factors"]["pass_geometry"]["max_elevation_deg"]

        response = f"📊 Mission Readiness for {location_name}: {score}/100 ({tier})\n\nBreakdown:\n• Space Weather: Kp {kp}\n• Cloud Cover: {clouds}%\n• Elevation: {elevation:.1f}°"

    # DEFAULT RESPONSE
    else:
        score = readiness["mission_readiness_score"]
        tier = readiness["tier"]
        response = f"Current mission readiness for {location_name} is {score}/100 ({tier}). Ask me about:\n• Mission brief\n• Next ISS pass\n• Space weather\n• Cloud cover\n• Observation conditions"

    # LOG THIS CONVERSATION FOR TRAINING! 🎯
    metadata = {
        "location": location_name,
        "latitude": latitude,
        "longitude": longitude,
        "readiness_score": readiness["mission_readiness_score"],
        "tier": readiness["tier"],
        "kp": readiness["factors"]["space_weather"]["kp_index"],
        "clouds": readiness["factors"]["sky_conditions"]["cloud_cover_percent"],
        "elevation": readiness["factors"]["pass_geometry"]["max_elevation_deg"]
    }

    log_conversation(original_message, response, metadata)

    return {"response": response}


@api.get("/api/training-data/stats")
def get_training_stats():
    """Get statistics about collected training data"""
    total_conversations = 0
    files = []

    for log_file in TRAINING_DATA_DIR.glob("conversations_*.jsonl"):
        with open(log_file, "r", encoding="utf-8") as f:
            count = sum(1 for _ in f)
            total_conversations += count
            files.append({
                "date": log_file.stem.replace("conversations_", ""),
                "count": count
            })

    return {
        "total_conversations": total_conversations,
        "files": files,
        "data_directory": str(TRAINING_DATA_DIR)
    }


@api.get("/api/forecast")
def get_forecast(lat: float, lon: float, days: int = 7):
    """Get 7-day mission readiness forecast"""
    forecast_days = []

    # Get current data once (Kp is the same for all days)
    space_wx = astralink_space_weather()
    kp = space_wx.get("kp_index_rounded", 3)

    for day_offset in range(days):
        target_date = datetime.now() + timedelta(days=day_offset)

        # For now, we'll use current conditions
        # In production, you'd use actual forecast APIs
        earth_wx = astralink_earth_weather(lat, lon)
        passes = astralink_iss_passes(lat, lon, days=day_offset+1)

        clouds = earth_wx.get("cloud_cover_percent", 50)

        # Get pass for this day
        all_passes = passes.get("passes", [])
        day_passes = [p for p in all_passes if p.get(
            "start_local", "").startswith(target_date.strftime("%Y-%m-%d"))]

        if day_passes:
            best_pass = max(day_passes, key=lambda x: x.get(
                "max_elevation_deg", 0))
            elevation = best_pass.get("max_elevation_deg", 0)
            pass_time = best_pass.get("start_local", "No pass")
        else:
            elevation = 0
            pass_time = "No pass"

        # Calculate score (same logic as mission readiness)
        score = 100

        if kp >= 7:
            score -= 40
            space_risk = "HIGH"
        elif kp >= 5:
            score -= 20
            space_risk = "MODERATE"
        else:
            space_risk = "LOW"

        if clouds >= 70:
            score -= 30
            sky_risk = "HIGH"
        elif clouds >= 40:
            score -= 15
            sky_risk = "MODERATE"
        else:
            sky_risk = "LOW"

        if elevation < 30:
            score -= 25
            geo_risk = "HIGH"
        elif elevation < 50:
            score -= 10
            geo_risk = "MODERATE"
        else:
            geo_risk = "LOW"

        if score >= 80:
            tier = "GREEN"
        elif score >= 60:
            tier = "YELLOW"
        else:
            tier = "RED"

        forecast_days.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day_name": target_date.strftime("%A"),
            "score": score,
            "tier": tier,
            "kp": kp,
            "clouds": clouds,
            "elevation": elevation,
            "pass_time": pass_time,
            "risks": {
                "space": space_risk,
                "sky": sky_risk,
                "geometry": geo_risk
            }
        })

    # Find best day
    best_day = max(forecast_days, key=lambda x: x["score"])

    return {
        "location": {"lat": lat, "lon": lon},
        "forecast": forecast_days,
        "best_day": best_day,
        "summary": f"Best observation window: {best_day['day_name']} (score: {best_day['score']}/100)"
    }


@api.get("/api/forecast/detailed")
def get_detailed_forecast(lat: float, lon: float):
    """Get detailed 72-hour + 7-day forecast with trends"""

    # 72-hour forecast (every 6 hours)
    hourly_forecast = []
    space_wx = astralink_space_weather()
    kp = space_wx.get("kp_index_rounded", 3)

    for hours_offset in range(0, 73, 6):  # Every 6 hours for 72 hours
        target_time = datetime.now() + timedelta(hours=hours_offset)

        earth_wx = astralink_earth_weather(lat, lon)
        clouds = earth_wx.get("cloud_cover_percent", 50)

        # Get passes around this time
        passes = astralink_iss_passes(lat, lon, days=3)
        all_passes = passes.get("passes", [])

        # Find pass closest to this time
        elevation = 0
        pass_time = None
        for p in all_passes:
            pass_dt = datetime.fromisoformat(
                p["start_utc"].replace("Z", "+00:00"))
            if abs((pass_dt - target_time.replace(tzinfo=timezone.utc)).total_seconds()) < 10800:  # Within 3 hours
                elevation = max(elevation, p.get("max_elevation_deg", 0))
                pass_time = p.get("start_local")

        # Calculate score
        score = 100
        if kp >= 7:
            score -= 40
        elif kp >= 5:
            score -= 20

        if clouds >= 70:
            score -= 30
        elif clouds >= 40:
            score -= 15

        if elevation < 30:
            score -= 25
        elif elevation < 50:
            score -= 10

        if score >= 80:
            tier = "GREEN"
        elif score >= 60:
            tier = "YELLOW"
        else:
            tier = "RED"

        hourly_forecast.append({
            "time": target_time.isoformat(),
            "hour": target_time.strftime("%I %p"),
            "day": target_time.strftime("%a"),
            "score": score,
            "tier": tier,
            "kp": kp,
            "clouds": clouds,
            "elevation": elevation,
            "has_pass": elevation > 0,
            "pass_time": pass_time
        })

    # Get 7-day forecast (existing logic)
    weekly_forecast = []
    for day_offset in range(7):
        target_date = datetime.now() + timedelta(days=day_offset)
        earth_wx = astralink_earth_weather(lat, lon)
        passes = astralink_iss_passes(lat, lon, days=day_offset+1)

        clouds = earth_wx.get("cloud_cover_percent", 50)
        all_passes = passes.get("passes", [])
        day_passes = [p for p in all_passes if p.get(
            "start_local", "").startswith(target_date.strftime("%Y-%m-%d"))]

        if day_passes:
            best_pass = max(day_passes, key=lambda x: x.get(
                "max_elevation_deg", 0))
            elevation = best_pass.get("max_elevation_deg", 0)
            pass_time = best_pass.get("start_local", "No pass")
        else:
            elevation = 0
            pass_time = "No pass"

        score = 100
        if kp >= 7:
            score -= 40
        elif kp >= 5:
            score -= 20
        if clouds >= 70:
            score -= 30
        elif clouds >= 40:
            score -= 15
        if elevation < 30:
            score -= 25
        elif elevation < 50:
            score -= 10

        if score >= 80:
            tier = "GREEN"
        elif score >= 60:
            tier = "YELLOW"
        else:
            tier = "RED"

        weekly_forecast.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day_name": target_date.strftime("%A"),
            "score": score,
            "tier": tier,
            "kp": kp,
            "clouds": clouds,
            "elevation": elevation,
            "pass_time": pass_time
        })

    # Find next optimal window (score >= 80)
    next_optimal = None
    for window in hourly_forecast + weekly_forecast:
        if window["score"] >= 80:
            next_optimal = window
            break

    # Calculate trends
    kp_trend = [kp] * 7  # Simplified - same Kp for all days
    cloud_trend = [w["clouds"] for w in weekly_forecast]

    return {
        "location": {"lat": lat, "lon": lon},
        "current_time": datetime.now().isoformat(),
        "hourly_72h": hourly_forecast,
        "weekly_7d": weekly_forecast,
        "next_optimal_window": next_optimal,
        "trends": {
            "kp": kp_trend,
            "clouds": cloud_trend
        },
        "metadata": {
            "current_kp": kp,
            "current_clouds": earth_wx.get("cloud_cover_percent", 50)
        }
    }


# Satellite catalog with NORAD IDs
SATELLITES = {
    "ISS": {"norad_id": 25544, "name": "International Space Station"},
    "HUBBLE": {"norad_id": 20580, "name": "Hubble Space Telescope"},
    "TIANGONG": {"norad_id": 48274, "name": "Tiangong Space Station"},
    "STARLINK": {"norad_id": 53105, "name": "Starlink-2411"}
}


@api.get("/api/satellites/list")
def get_satellite_list():
    """Get list of trackable satellites"""
    return {
        "satellites": [
            {
                "id": key,
                "name": sat["name"],
                "norad_id": sat["norad_id"]
            }
            for key, sat in SATELLITES.items()
        ]
    }


@api.get("/api/satellites/passes")
def get_satellite_passes(
    lat: float,
    lon: float,
    satellite_id: str = "ISS",
    days: int = 7,
    min_elevation: int = 20
):
    """Get passes for any satellite"""
    try:
        if satellite_id not in SATELLITES:
            return {"error": f"Unknown satellite: {satellite_id}"}

        api_key = os.getenv("N2YO_API_KEY")
        if not api_key:
            raise ValueError("N2YO_API_KEY not set")

        norad_id = SATELLITES[satellite_id]["norad_id"]

        url = (
            f"https://api.n2yo.com/rest/v1/satellite/visualpasses/{norad_id}/"
            f"{lat}/{lon}/0/{days}/{min_elevation}/&apiKey={api_key}"
        )

        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        # Get timezone for this location
        tz_name = _get_timezone_from_coords(lat, lon)
        tz = ZoneInfo(tz_name)

        passes_out = []
        for p in data.get("passes", []):
            start_utc = datetime.utcfromtimestamp(p["startUTC"]).replace(
                tzinfo=timezone.utc
            )
            start_local = start_utc.astimezone(tz)

            max_el = p.get("maxEl", 0)

            # Visibility quality based on elevation
            if max_el >= 60:
                quality = "EXCELLENT"
            elif max_el >= 40:
                quality = "GOOD"
            elif max_el >= 25:
                quality = "FAIR"
            else:
                quality = "POOR"

            passes_out.append({
                "start_utc": start_utc.isoformat().replace("+00:00", "Z"),
                "start_local": start_local.strftime("%Y-%m-%d %I:%M %p"),
                "start_time": start_local.strftime("%I:%M %p"),
                "date": start_local.strftime("%Y-%m-%d"),
                "duration_seconds": p.get("duration"),
                "duration_minutes": p.get("duration", 0) // 60,
                "max_elevation_deg": max_el,
                "quality": quality,
                "magnitude": p.get("mag", "N/A"),
            })

        return {
            "satellite": {
                "id": satellite_id,
                "name": SATELLITES[satellite_id]["name"],
                "norad_id": norad_id
            },
            "location": {"lat": lat, "lon": lon},
            "timezone": tz_name,
            "passes": passes_out
        }

    except Exception as e:
        return {
            "error": str(e),
            "passes": []
        }


if __name__ == "__main__":
    import uvicorn

    # Just run FastAPI on port 8000
    # (MCP inspector connection will work separately via stdio)
    print("🌐 Starting FastAPI server on http://localhost:8000")
    print("📡 API endpoints available at:")
    print("   - http://localhost:8000/api/health")
    print("   - http://localhost:8000/api/space-weather")
    print("   - http://localhost:8000/api/earth-weather")
    print("   - http://localhost:8000/docs (API documentation)")

    uvicorn.run(api, host="127.0.0.1", port=8000, log_level="info")
