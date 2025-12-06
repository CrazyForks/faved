<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use function Framework\data;

class TagsUpdatePinnedController implements ControllerInterface
{
	public function __invoke(array $input): ResponseInterface
	{
		if (!isset($input['tag-id'], $input['pinned']) || !is_bool($input['pinned'])) {
			throw new ValidationException('Invalid input data for tag pinned update.');
		}

		$tag_id = (int)$input['tag-id'];

		$repository = ServiceContainer::get(Repository::class);
		$tags = $repository->getTags();
		$tag = $tags[$tag_id] ?? null;

		if (null === $tag) {
			throw new ValidationException("Tag with ID $tag_id does not exist.");
		}

		if ((bool)$tag['pinned'] === $input['pinned']) {
			return data([
				'success' => true,
				'message' => 'Tag pinned state is already set to the requested value.',
				'data' => [
					'tag_id' => $tag_id,
					'pinned' => $input['pinned'],
				]
			]);
		}

		if ($input['pinned'] && !empty($tag['parent'])) {
			throw new ValidationException('Pinned tags cannot have a parent tag.');
		}

		$repository->updateTagPinned(
			$tag_id,
			$input['pinned']
		);

		return data([
			'success' => true,
			'message' => 'Tag pinned state updated successfully.',
			'data' => [
				'tag_id' => $tag_id,
				'pinned' => $input['pinned'],
			]
		]);
	}
}