import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re
from database import SessionLocal
import models

# --- HELPER FUNCTION ---
def get_text_after_heading(soup, heading_text):
    try:
        heading_element = soup.find(['h4', 'h5'], string=re.compile(heading_text, re.I))
        if not heading_element:
            return None
        
        content = []
        for sibling in heading_element.find_next_siblings():
            if sibling.name in ['h4', 'h5']:
                break
            text = sibling.get_text(separator='\n', strip=True)
            if text:
                content.append(text)
        
        return "\n".join(content) if content else None
    except Exception:
        return None


# --- MAIN SCRAPER ---
db = SessionLocal()
BASE_URL = "https://internship.aicte-india.org/"
LIST_URL = BASE_URL + "recentlyposted.php"

print("Setting up browser with Selenium...")
options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
options.add_argument('--ignore-certificate-errors')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

try:
    # open first page
    driver.get(LIST_URL)
    page = 1

    while True:
        print(f"\n--- Scraping Page {page} ---")

        # wait for internships list
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "internships-list"))
            )
        except:
            print("No internships list found, stopping.")
            break

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        internship_cards = soup.find_all('div', class_='internships-list')

        if not internship_cards:
            print("No internships on this page, stopping.")
            break

        print(f"Found {len(internship_cards)} internships on page {page}.")

        # collect links
        internship_links = []
        for card in internship_cards:
            link_element = card.find('a', class_='btn-primary')
            if link_element and link_element.has_attr('href'):
                internship_links.append(BASE_URL + link_element['href'])

        # process details
        for url in internship_links:
            try:
                print(f"Visiting: {url}")
                driver.get(url)

                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "internship-detail-body"))
                )

                details_soup = BeautifulSoup(driver.page_source, 'html.parser')

                title = details_soup.find('h3', class_='job-title').text.strip()
                company = details_soup.find('h5', class_='company-name').text.strip()

                internship_exists = db.query(models.Internship).filter(
                    models.Internship.title == title,
                    models.Internship.company == company
                ).first()
                if internship_exists:
                    print(f"  -> Skipping existing: {title}")
                    continue

                about = get_text_after_heading(details_soup, "About the program")
                required_skills = get_text_after_heading(details_soup, "Skills Required") or get_text_after_heading(details_soup, "Skill's Required")
                perks = get_text_after_heading(details_soup, "Perks")
                who_can_apply = get_text_after_heading(details_soup, "Who can apply")
                terms = get_text_after_heading(details_soup, "Terms of Engagement")

                openings_text = get_text_after_heading(details_soup, "Number of openings")
                openings = 0
                if openings_text:
                    openings_match = re.search(r'\d+', openings_text)
                    openings = int(openings_match.group(0)) if openings_match else 0

                new_internship = models.Internship(
                    title=title,
                    company=company,
                    location=(details_soup.find('li', class_='location').find('span').text.strip().rstrip(',') if details_soup.find('li', class_='location') else "N/A"),
                    about=about,
                    required_skills=required_skills,
                    perks=perks,
                    who_can_apply=who_can_apply,
                    openings=openings,
                    sector="General",
                    apply_link=url,
                    terms=terms
                )
                db.add(new_internship)
                db.commit()
                print(f"  -> Added: {title}")

            except Exception as e:
                print(f"  -> Failed {url}: {e}")

            time.sleep(1)

        # go back to list page
        driver.get(LIST_URL)

        # try to click next page button
        try:
            page += 1
            next_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.LINK_TEXT, str(page)))
            )
            next_button.click()
            time.sleep(2)
        except:
            print("No more pages available. Stopping.")
            break

finally:
    driver.quit()
    db.close()

print("\n✅ Scraping complete.")
