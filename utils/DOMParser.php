<?php

namespace Utils;

class DOMParser
{
	protected $xpath;

	public function __construct(string $html_content)
	{
		// Create DOMDocument and suppress warnings for malformed HTML
		$dom = new \DOMDocument();
		libxml_use_internal_errors(true);
		$dom->loadHTML($html_content);
		libxml_clear_errors();

		// Create XPath object for efficient querying
		$this->xpath = new \DOMXPath($dom);
	}

	public function extractTitle(): ?string
	{
		// Prioritize Open Graph title, Fallback to regular title tag
		return $this->getTextContentByQuery('//meta[@property="og:title"]/@content')
			?? $this->getTextContentByQuery('//title');
	}

	private function getTextContentByQuery(string $query): ?string
	{
		$nodes = $this->xpath->query($query);
		if ($nodes->length > 0) {
			return trim($nodes->item(0)->textContent);
		}
		return null;
	}

	public function extractDescription(): ?string
	{
		// Prioritize Open Graph description, Fallback to regular meta description
		return $this->getTextContentByQuery('//meta[@property="og:description"]/@content')
			?? $this->getTextContentByQuery('//meta[@name="description"]/@content');
	}

	public function extractImage(): ?string
	{
		// Prioritize Open Graph image, Fallback to Twitter card image, Last fallback to first img tag
		return $this->getTextContentByQuery('//meta[@property="og:image"]/@content')
			?? $this->getTextContentByQuery('//meta[@name="twitter:image"]/@content')
			?? $this->getTextContentByQuery('//img[@src]/@src');

	}
}