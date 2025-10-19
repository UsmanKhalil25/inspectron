prompt =  lambda html_content, screenshot_path: f"""
You are an intelligent web crawler.
You are currently viewing the following webpage HTML content:
---
{html_content[:5000]}  # truncated to avoid token overflow
---

You also have a screenshot of the page labeled with detected buttons and links at: {screenshot_path}

Based on the HTML and visual layout, decide what the next logical action should be:
- Which button or link should be clicked next (if any)?
- Or should the crawler stop here?

Respond briefly in JSON format:
{{"action": "click", "element_description": "..."}}
"""
