import requests
from bs4 import BeautifulSoup
import json
import os
import google.generativeai as genai
from datetime import datetime

# --- Configuration ---
URL = "https://vide-greniers.org/evenements/Nantes-44?distance=50"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def scrape_events():
    """Scrapes event data from vide-greniers.org."""
    print(f"Fetching events from {URL}...")
    try:
        response = requests.get(URL, headers=HEADERS)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching URL: {e}")
        return []

    soup = BeautifulSoup(response.content, 'html.parser')
    events = []

    # Note: The structure of vide-greniers.org may change. 
    # This selector targets the event cards based on common structure.
    # Adjust selectors based on actual HTML inspection.
    event_cards = soup.select('.search-results .event-line') 

    if not event_cards:
        print("No events found. The page structure might have changed.")
        # Fallback to a broader search if specific class fails
        event_cards = soup.select('article')

    for card in event_cards[:10]: # Limit to top 10 for summary
        try:
            # Extract Title/Type
            title_elem = card.select_one('h3') or card.select_one('.event-title')
            title = title_elem.get_text(strip=True) if title_elem else "Unknown Event"
            
            # Extract Link
            link_elem = card.select_one('a')
            link = "https://vide-greniers.org" + link_elem['href'] if link_elem and link_elem.has_attr('href') else ""

            # Extract Date
            date_elem = card.select_one('.event-date') or card.select_one('time')
            date = date_elem.get_text(strip=True) if date_elem else "Date unknown"

            # Extract Location (City)
            location_elem = card.select_one('.event-location')
            city = location_elem.get_text(strip=True) if location_elem else "Nantes area"

            # Extract Exhibitors (often in a badge or specific span)
            exhibitors_elem = card.select_one('.event-participants')
            exhibitors_text = exhibitors_elem.get_text(strip=True) if exhibitors_elem else "0"
            # Clean up exhibitor count (e.g., "50 exp.") -> 50
            exhibitors = ''.join(filter(str.isdigit, exhibitors_text))
            exhibitors = int(exhibitors) if exhibitors else 0

            events.append({
                "title": title,
                "date": date,
                "city": city,
                "exhibitors": exhibitors,
                "link": link
            })
        except Exception as e:
            print(f"Error parsing an event card: {e}")
            continue

    return events

def generate_summary(events):
    """Generates an Arabic summary using Gemini API."""
    if not events:
        return None

    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY environment variable not set.")
        return None

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')

    # Prepare data for prompt
    events_json = json.dumps(events, ensure_ascii=False, indent=2)
    
    prompt = f"""
    You are an assistant for an elderly Arabic man living in Nantes, France.
    Here is a list of upcoming flea markets (vide-greniers) in JSON format:
    {events_json}

    Please generate a daily summary in Arabic with the following 4 sections. 
    Use a warm, respectful, and clear tone suitable for an older gentleman.
    
    1. **Headline**: A welcoming greeting (e.g., "Good morning, here is today's market update").
    2. **The Biggest Event**: Identify the event with the most exhibitors. Mention the city and number of exhibitors.
    3. **The Most Comfortable Event**: Pick an event that seems most accessible or pleasant (e.g., indoors if mentioned, or in a major city like Nantes with likely good parking). If unknown, pick the second largest.
    4. **Pro Tip**: A practical tip for an older man attending these markets (e.g., weather-related, bringing a trolley, checking for old tools).

    Output the result as a JSON object with keys: 'headline', 'biggest_event', 'comfortable_event', 'pro_tip'.
    Ensure the values are strings in Arabic.
    """

    try:
        response = model.generate_content(prompt)
        # Clean up potential markdown code blocks
        text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print(f"Error generating summary: {e}")
        return None

def main():
    print("--- Nantes Flea Market Scraper ---")
    events = scrape_events()
    print(f"Found {len(events)} events.")
    
    if events:
        print("Generating AI Summary...")
        summary = generate_summary(events)
        
        output = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "summary": summary,
            "events": events
        }
        
        # Save to file
        with open('market_data.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print("Data saved to market_data.json")
        
        # Preview
        if summary:
            print("\n--- Summary Preview ---")
            print(f"Headline: {summary.get('headline')}")
            print(f"Biggest: {summary.get('biggest_event')}")
    else:
        print("No events found to process.")

if __name__ == "__main__":
    main()
