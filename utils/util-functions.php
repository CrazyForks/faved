<?php

namespace Utils;

use Exception;
use Framework\ServiceContainer;
use Models\Repository;
use Models\TagCreator;

function groupTagsByParent($tags)
{
	$tags_by_parent = [];
	foreach ($tags as $tag_id => $tag) {
		$tags_by_parent[$tag['parent']][] = $tag_id;
	}
	return $tags_by_parent;
}


function getTagColors()
{
	return [
		'gray',
		'green',
		'red',
		'yellow',
		'aqua',
		'white ',
		'black',
	];
}

function extractTagSegments(string $title): array
{
	// Explode by forward slash, preserving escaped slashes
	$title = str_replace('\/', '__SLASH__', $title);
	$segments = explode('/', $title);
	$segments = array_map(fn($segment) => str_replace('__SLASH__', '/', $segment), $segments);
	// Remove empty segments
	$segments = array_filter($segments, fn($segment) => '' !== trim($segment));
	return $segments;
}

function createTagsFromSegments(array $tag_segments, $tag_description = ''): int
{
	$repository = ServiceContainer::get(Repository::class);
	$tags = $repository->getTags();
	$tag_creator = ServiceContainer::get(TagCreator::class);

	$parent_tag_id = 0;
	$check_existing_parent = true;
	foreach ($tag_segments as $tag_title) {
		$existing_parent = array_find($tags, function ($tag) use ($tag_title, $parent_tag_id) {
			return strtolower($tag['title']) === strtolower($tag_title) && $tag['parent'] === $parent_tag_id;
		});

		if ($check_existing_parent && $existing_parent) {
			$parent_tag_id = $existing_parent['id'];
			continue;
		}

		$parent_tag_id = $tag_creator->createTag($tag_title, $tag_description, $parent_tag_id);
		$check_existing_parent = false;
	}

	return (int)$parent_tag_id;
}

/**
 * TODO: Add URL match checks on item create
 */
function findURLMatches($checked_url, $items, &$host_matches)
{
	$domain = parse_url($checked_url)['host'];
	if (preg_match('/(?P<domain>[a-z0-9][a-z0-9\-]{1,63}\.[a-z\.]{2,6})$/i', $domain, $matches)) {
		$domain = $matches['domain'];
	}


	$url_matches = [];
	$host_matches = [];
	foreach ($items as $item) {
		if ($item['url'] === $checked_url) {
			$url_matches[] = $item;
		} elseif (str_contains($item['url'], $domain)) {
			$host_matches[] = $item;
		}
	}
	return $url_matches;
}

/*
 * Resolve relative URL to absolute URL
 */
function resolveUrl(string $relative_url, string $base_url): string
{
	// If it's already an absolute URL, return as is
	if (filter_var($relative_url, FILTER_VALIDATE_URL)) {
		return $relative_url;
	}

	// Parse base URL
	$baseParts = parse_url($base_url);
	$scheme = $baseParts['scheme'] ?? 'https';
	$host = $baseParts['host'] ?? '';

	// Handle protocol-relative URLs
	if (str_starts_with($relative_url, '//')) {
		return $scheme . ':' . $relative_url;
	}

	// Handle absolute paths
	if (str_starts_with($relative_url, '/')) {
		return $scheme . '://' . $host . $relative_url;
	}

	// Handle relative paths
	$path = $baseParts['path'] ?? '/';
	$path = rtrim(dirname($path), '/');

	return $scheme . '://' . $host . $path . '/' . $relative_url;
}

function fetchPageHTML(string $url): string
{
	// Initialize cURL
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
	curl_setopt($ch, CURLOPT_TIMEOUT, 30);
	curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

	$html = curl_exec($ch);

	if (curl_errno($ch)) {
		$error = curl_error($ch);
		curl_close($ch);
		throw new Exception("Failed to fetch URL: " . $error, 400);
	}

	$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);

	if ($http_code < 200 || $http_code > 300) {
		throw new Exception("Page returned HTTP error: {$http_code}", 400);
	}

	if ($html === false) {
		throw new Exception("Failed to retrieve page content", 400);
	}

	return $html;
}


function createWelcomeContent($repository)
{
	$tag_creator = ServiceContainer::get(TagCreator::class);
	$faved_tag_id = $tag_creator->createTag('Faved', 'This is a tag for Faved links. Feel free to delete it after getting familiar with those resources.', 0, 'gray', true);
	$welcome_tag_id = $tag_creator->createTag('Welcome', "Familiarize yourself with the functionality of Faved by exploring the articles under this tag.\n\nℹ️ This is a nested tag. Nested tags are perfect for grouping several projects, e.g. for Work, School, or Personal use. \n\n💡 To create a nested tag, simply separate words with a forward slash.", $faved_tag_id, 'green', false);

	$item_id = $repository->createItem(
		'Faved - Organize Your Bookmarks',
		'A self-hosted, open-source solution to store, categorize, and access your bookmarks from anywhere.',
		'https://faved.dev/',
		'Faved main site',
		'https://faved.dev/static/images/bookmark-thumb.png',
		null
	);
	$repository->attachItemTags([$faved_tag_id], $item_id);

	$item_id = $repository->createItem(
		'Faved Demo',
		'Try out Faved online before installing it on your machine. Demo sites are provided for testing and are deleted after one month.',
		'https://demo.faved.dev/',
		'',
		'',
		null
	);
	$repository->attachItemTags([$faved_tag_id]
		, $item_id);

	$item_id = $repository->createItem(
		'Blog | Faved - Organize Your Bookmarks',
		'Faved updates, tutorials and product announcements',
		'https://faved.dev/blog',
		'',
		'',
		null
	);
	$repository->attachItemTags([$faved_tag_id], $item_id);

	$item_id = $repository->createItem(
		'GitHub - denho/faved: Free open-source bookmark manager with customisable nested tags. Super fast and lightweight. All data is stored locally.',
		'Free open-source bookmark manager with customisable nested tags. Super fast and lightweight. All data is stored locally. - denho/faved',
		'https://github.com/denho/faved',
		'',
		'https://repository-images.githubusercontent.com/995300772/35566533-7ffc-4101-a7ce-926f5d82b6ca',
		null
	);
	$repository->attachItemTags([$faved_tag_id]
		, $item_id);

	$item_id = $repository->createItem(
		'Faved on Twitter / X (@FavedTool)',
		'Lightning fast free open source bookmark manager with accent on privacy and data ownership.',
		'https://x.com/FavedTool',
		'',
		'',
		null
	);
	$repository->attachItemTags([$faved_tag_id], $item_id);

	$item_id = $repository->createItem(
		'Meet Faved: An Open-Source Privacy-First Bookmark Manager | Faved - Organize Your Bookmarks',
		'In a world where every digital service wants to control your data, I believe it’s important to have an option to keep your data secure from trackers and advertising networks. That’s why I built Faved: an open-source, self-hosted bookmark manager that gives you complete control over your saved web content and links.',
		'https://faved.dev/blog/meet-faved-open-source-privacy-first-bookmark-manager',
		'',
		'',
		null
	);
	$repository->attachItemTags([$welcome_tag_id], $item_id);

	$item_id = $repository->createItem(
		'How to Migrate Your Data from Pocket to Faved | Faved - Organize Your Bookmarks',
		'Pocket is shutting down on July 8, 2025. As a privacy-first alternative, Faved lets you organize and manage your bookmarks while keeping full ownership of your data. Learn how to migrate your data from Pocket to Faved in a few simple steps.',
		'https://faved.dev/blog/migrate-pocket-to-faved',
		'',
		'https://faved.dev/static/images/posts/migrate-pocket-to-faved/migrate-from-pocket-to-faved-ogimage.png',
		null
	);
	$repository->attachItemTags([$welcome_tag_id], $item_id);
}

function createDemoContent($repository)
{
	$raw_sql = file_get_contents(ROOT_DIR . '/sql-dumps/tags.sql');
	$repository->runRawSQL($raw_sql);
	$raw_sql = file_get_contents(ROOT_DIR . '/sql-dumps/items.sql');
	$repository->runRawSQL($raw_sql);
	$raw_sql = file_get_contents(ROOT_DIR . '/sql-dumps/items_tags.sql');
	$repository->runRawSQL($raw_sql);
}