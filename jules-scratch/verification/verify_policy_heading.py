import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        files_to_capture = ['testindrive.html', 'testpreset.html', 'testcanva.html', 'testnfx.html']

        for file in files_to_capture:
            # Construct the file path
            file_path = f"file://{os.path.abspath(file)}"

            # Navigate to the local file
            await page.goto(file_path)

            # Wait for the page to be fully loaded
            await page.wait_for_load_state('networkidle')

            # Take a screenshot
            screenshot_path = f"jules-scratch/verification/policy_{file.replace('.html', '.png')}"
            await page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot saved for {file} at {screenshot_path}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
