#!/usr/bin/env python3
"""Lightweight checks for the portfolio's canonical URL contract."""

from html.parser import HTMLParser
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://hedhly.com"
LANGUAGES = {"de": f"{ORIGIN}/de/", "en": f"{ORIGIN}/en/"}


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "link":
            self.links.append(dict(attrs))


class SeoContractTests(unittest.TestCase):
    def test_language_pages_are_self_canonical_and_reciprocal(self):
        for language, expected_url in LANGUAGES.items():
            parser = LinkParser()
            parser.feed((ROOT / language / "index.html").read_text())
            canonicals = [link.get("href") for link in parser.links if link.get("rel") == "canonical"]
            alternates = {
                link.get("hreflang"): link.get("href")
                for link in parser.links
                if link.get("rel") == "alternate" and link.get("hreflang")
            }
            self.assertEqual(canonicals, [expected_url], language)
            self.assertEqual(alternates, {**LANGUAGES, "x-default": LANGUAGES["de"]}, language)

    def test_sitemap_contains_only_indexable_language_urls(self):
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        root = ET.parse(ROOT / "sitemap.xml").getroot()
        locations = [element.text for element in root.findall("sm:url/sm:loc", namespace)]
        self.assertEqual(locations, list(LANGUAGES.values()))

    def test_redirects_normalize_root_without_touching_language_paths(self):
        lines = [
            line.strip()
            for line in (ROOT / "_redirects").read_text().splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        ]
        self.assertEqual(lines, ["/ https://hedhly.com/de/ 301"])
        self.assertNotIn("/de/", {line.split()[0] for line in lines})
        self.assertNotIn("/en/", {line.split()[0] for line in lines})

    def test_robots_points_to_canonical_sitemap(self):
        robots = (ROOT / "robots.txt").read_text()
        self.assertIn(f"Sitemap: {ORIGIN}/sitemap.xml", robots)


if __name__ == "__main__":
    unittest.main()
