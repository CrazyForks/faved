<?php

namespace Utils;

use Models\Repository;
use Models\TagCreator;

class BookmarkImporter
{
	const IMPORT_FROM_BROWSER_TAG_NAME = 'Imported from browser';
	const IMPORTED_TAG_DESCRIPTION = 'Tag imported from browser';

	public function __construct(protected Repository $repository, protected TagCreator $tag_creator)
	{
	}

	public function processHTML(string $content, &$skipped_count): int
	{
		// Extract folders and bookmarks from the HTML content
		[$folders, $bookmarks, $skipped_count] = $this->extractData($content);

		// Create tags
		$folder_tag_map = $this->writeTags($folders);

		// Create bookmark items
		$this->writeItems($bookmarks, $folder_tag_map);
		return count($bookmarks);
	}

	private function extractData(string $content): array
	{
		$skipped_count = 0;

		$folders = [self::IMPORT_FROM_BROWSER_TAG_NAME => [self::IMPORT_FROM_BROWSER_TAG_NAME]];
		$bookmarks = [];

		$dom = new \DOMDocument();
		libxml_use_internal_errors(true);
		$dom->loadHTML($content);
		libxml_clear_errors();

		$xpath = new \DOMXPath($dom);
		$links = $xpath->query('//a[@href]');

		foreach ($links as $link) {
			$url = $link->getAttribute('href');
			$title = trim($link->textContent);

			if (empty($url) || str_starts_with($url, 'javascript:')) {
				$skipped_count++;
				continue;
			}

			$folder_paths = [self::IMPORT_FROM_BROWSER_TAG_NAME];

			$path_segments = $this->extractPath($link);
			if (!empty($path_segments)) {
				$full_path = implode('/', $path_segments);
				$folders[$full_path] = $path_segments;
				$folder_paths[] = $full_path;
			}

			$bookmarks[] = [
				'title' => $title ?: $url,
				'url' => $url,
				'folder_paths' => $folder_paths
			];
		}

		return [$folders, $bookmarks, $skipped_count];
	}

	/*
	 * Returns an array of folder names from root to leaf (e.g., ['Language', 'English'])
	 */
	private function extractPath($link): array
	{
		$folders = [];
		$current = $link->parentNode;

		while ($current) {
			if ($current->nodeName === 'dl') {
				$dt = $current->previousSibling;

				while ($dt && $dt->nodeType === XML_TEXT_NODE) {
					$dt = $dt->previousSibling;
				}
				if ($dt && $dt->nodeName === 'dt') {
					$h3 = $dt->getElementsByTagName('h3')->item(0);
					if ($h3) {
						array_unshift($folders, trim($h3->textContent));
					}
				}
			}
			$current = $current->parentNode;
		}

		return $folders;
	}

	protected function writeTags($folders)
	{
		return array_reduce(
			array_keys($folders),
			function ($folder_tag_map, $folder_path) use ($folders) {
				$folder_tag_map[$folder_path] = createTagsFromSegments($folders[$folder_path], self::IMPORTED_TAG_DESCRIPTION);
				return $folder_tag_map;
			},
			[]
		);
	}

	protected function writeItems($items, $tag_map)
	{
		array_walk($items, function ($item) use ($tag_map) {

			$item_id = $this->repository->createItem(
				$item['title'],
				'',
				$item['url'],
				'',
				'',
				date('Y-m-d H:i:s'),
			);

			$tag_ids = array_intersect_key(
				$tag_map,
				array_flip($item['folder_paths'])
			);
			$this->repository->attachItemsTags([$item_id], $tag_ids);
		});
	}
}
