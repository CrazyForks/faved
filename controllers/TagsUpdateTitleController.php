<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use function Framework\data;
use function Utils\createTagsFromSegments;
use function Utils\extractTagSegments;

class TagsUpdateTitleController implements ControllerInterface
{
	public function __invoke(array $input): ResponseInterface
	{
		if (!isset($input['tag-id'], $input['title'])) {
			throw new ValidationException('Invalid input data for tag title update.');
		}

		$tag_id = (int)$input['tag-id'];

		$tag_segments = extractTagSegments($input['title']);
		$tag_title = array_pop($tag_segments);

		$repository = ServiceContainer::get(Repository::class);
		$repository->updateTagTitle(
			$tag_id,
			$tag_title,
		);

		$parent_id = createTagsFromSegments($tag_segments);

		// Update the tag parent after updating the title to prevent a circular reference
		$repository->updateTagParent($tag_id, $parent_id);

		return data([
			'success' => true,
			'message' => 'Tag title updated successfully',
			'data' => [
				'tag_id' => $tag_id,
				'title' => $input['title'],
			]
		]);
	}

}