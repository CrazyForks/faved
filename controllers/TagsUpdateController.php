<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use Respect\Validation\Validator;
use function Framework\success;
use function Utils\createTagsFromSegments;
use function Utils\extractTagSegments;

class TagsUpdateController implements ControllerInterface
{
	public function validateInput()
	{
		return Validator::key('tag-id', Validator::stringType()->notEmpty())
			->key('title', Validator::stringType()->notEmpty()->length(1, 255))
			->key('description', Validator::stringType()->length(null, 1000));
	}

	public function __invoke(array $input): ResponseInterface
	{
		$tag_id = (int)$input['tag-id'];

		$tag_segments = extractTagSegments($input['title']);
		$tag_title = array_pop($tag_segments);

		$tag_description = trim($input['description']);

		$repository = ServiceContainer::get(Repository::class);
		$repository->updateTag(
			$tag_id,
			$tag_title,
			$tag_description,
		);

		$parent_id = createTagsFromSegments($tag_segments);

		// Update the tag parent after updating the title to prevent a circular reference
		$repository->updateTagParent($tag_id, $parent_id);

		return success(
			'Tag updated successfully',
			[
				'tag_id' => $tag_id,
				'title' => $input['title'],
				'description' => $input['description'],
			]
		);
	}

}